from datetime import datetime
from uuid import UUID
from sqlalchemy import func
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db_schema.user import User
from app.db_schema.tasks import Task
from app.dependencies import get_db
from app.services.auth_middleware import get_current_user, get_current_admin_user
from app.db_schema.patient_related import Assignment, PatientReference
from app.db_schema.predicition import Prediction
from app.models.patient import AssignedPatient, FollowUpCreate, FollowUpSchema,PatientDetails,PredictionSummary,AssignPatient,FollowUpUpdate
from app.db_schema.patient_related import FollowUp
from app.utils.audit_logs import log_action
from app.utils.notification_create import create_notification
from app.db_schema.escalations import Escalation
router = APIRouter(prefix="/patients",tags=["Patient Related Actions"])


def get_patients_with_assigned_user(db: Session):
    """
    Return a flat list of patients; each dict includes:
      • assigned_user_id / assigned_username  (if any)
      • risk  -> from latest prediction (risk field)
    """

    # ── 1️⃣  Sub‑query: latest prediction per patient ───────────────
    latest_pred_subq = (
        db.query(
            Prediction.patient_id.label("pid"),
            Prediction.risk.label("risk"),
            func.max(Prediction.timestamp).label("max_ts")
        )
        .group_by(Prediction.patient_id, Prediction.risk)
        .subquery()
    )

    # ── 2️⃣  Main query: patient  ← assignment ← user  + latest_pred_subq ─
    query = (
        db.query(
            PatientReference,
            User.id.label("assigned_user_id"),
            User.username.label("assigned_username"),
            latest_pred_subq.c.risk.label("risk"),
        )
        .outerjoin(Assignment, PatientReference.patient_id == Assignment.patient_id)
        .outerjoin(User, Assignment.user_id == User.id)
        .outerjoin(latest_pred_subq, PatientReference.patient_id == latest_pred_subq.c.pid)
    )

    # ── 3️⃣  Serialize to simple dicts ──────────────────────────────
    patients = []
    for patient, assigned_user_id, assigned_username, risk in query.all():
        data = {**patient.__dict__}
        data.pop("_sa_instance_state", None)      # strip SQLAlchemy internals
        data["assigned_user_id"]   = assigned_user_id
        data["assigned_username"]  = assigned_username
        data["risk"]               = risk
        patients.append(data)

    return patients

@router.get("/all")
def get_all_patients_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patients = get_patients_with_assigned_user(db)

    users = (
        db.query(User.id, User.username)
        .filter(User.role != "admin")
        .all()
    )
    user_list = [{"id": u.id, "username": u.username} for u in users]

    pending_tasks_count = (
        db.query(Task).filter(Task.status == "pending").count()
    )

    escalations_count = (
        db.query(Escalation).filter(Escalation.status == "pending").count()
    )

    return {
        "patients_details": patients,
        "user_details": user_list,
        "pending_tasks_count": pending_tasks_count,
        "escalations_count": escalations_count,
    }


@router.get("/assigned/me", response_model=list[AssignedPatient])
def get_my_assigned_patients(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id

    # 1. Get assigned patient_ids
    assignments = db.query(Assignment).filter(Assignment.user_id == user_id).all()
    patient_ids = [a.patient_id for a in assignments]

    if not patient_ids:
        return []

    # 2. Get patient info
    patients = (
        db.query(PatientReference)
        .filter(PatientReference.patient_id.in_(patient_ids))
        .all()
    )

    # 3. Get latest predictions per patient (grab risk only)
    subquery = (
        db.query(
            Prediction.patient_id,
            Prediction.risk
        )
        .filter(Prediction.patient_id.in_(patient_ids))
        .order_by(Prediction.patient_id, Prediction.timestamp.desc())
        .distinct(Prediction.patient_id)
        .all()
    )

    prediction_map = {row.patient_id: row.risk for row in subquery}

    # 4. Combine results
    response = []
    for p in patients:
        response.append(AssignedPatient(
            patient_id=p.patient_id,
            name=p.name,
            age=p.age,
            gender=p.gender,
            mobile_number=p.mobile_number,
            disease_type=p.disease_type,
            risk=prediction_map.get(p.patient_id, "Unknown")
        ))

    return response

@router.get("/{patient_id}", response_model=PatientDetails)
def get_patient_details(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    patient = db.query(PatientReference).filter_by(patient_id=patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    followups = (
        db.query(FollowUp)
        .filter(FollowUp.patient_id == patient_id)
        .order_by(FollowUp.follow_up_date.desc())
        .all()
    )

    latest_prediction = (
        db.query(Prediction)
        .filter(Prediction.patient_id == patient_id)
        .order_by(Prediction.timestamp.desc())
        .first()
    )

    return PatientDetails(
        patient_id=patient.patient_id,
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        mobile_number=patient.mobile_number,
        disease_type=patient.disease_type,
        clinical_info=patient.clinical_info or {},
        follow_ups=[
            FollowUpSchema(
                id=str(f.id),
                user_id=str(f.user_id),
                notes=f.notes,
                status=f.status,
                follow_up_type=f.follow_up_type,
                follow_up_date=f.follow_up_date,
                timestamp=f.timestamp
            ) for f in followups
        ],
        prediction=PredictionSummary(
            risk=latest_prediction.risk,
            predicted_probability=latest_prediction.predicted_probability,
            prediction_class=str(latest_prediction.predicted_class)
        ) if latest_prediction else None
    )




@router.post("/{patient_id}/followups", status_code=201)
def add_follow_up(
    patient_id: str,
    payload: FollowUpCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Validate patient
    patient = db.query(PatientReference).filter_by(patient_id=patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    #  Create main follow-up
    follow_up = FollowUp(
        patient_id=patient_id,
        user_id=current_user.id,
        notes=payload.notes,
        status=payload.status,
        follow_up_type=payload.follow_up_type,
        follow_up_date=payload.follow_up_date,
        timestamp=datetime.utcnow()
    )
    db.add(follow_up)
    db.flush()  # so follow_up.id is generated

    log_action(
        db=db,
        user_id=current_user.id,
        action="followup_created",
        endpoint=f"/patients/{patient_id}/followups",
        payload={"followup_id": str(follow_up)}
    )

    # Handle optional next follow-up
    if payload.next_followup:
        # Placeholder follow-up
        placeholder = FollowUp(
            patient_id=patient_id,
            user_id=current_user.id,
            status="upcoming",
            follow_up_date=payload.next_followup,
            timestamp=datetime.utcnow()
        )
        db.add(placeholder)
        db.flush()

        log_action(
            db=db,
            user_id=current_user.id,
            action="followup_placeholder_created",
            endpoint=f"/patients/{patient_id}/followups",
            payload={"followup_id": str(placeholder)}
        )

        #  Create actual Task
        assigned_to_user = db.query(User).filter_by(username=current_user.username).first()
        if not assigned_to_user:
            raise HTTPException(status_code=404, detail="Assigned user not found")

        new_task = Task(
            patient_id=patient_id,
            assigned_to=assigned_to_user.id,
            assigned_by=current_user.id,
            description=f"Prepare for follow-up on {payload.next_followup} for patient {patient_id}",
            due_date=payload.next_followup
        )
        db.add(new_task)
        db.flush()

        create_notification(
            db=db,
            user_ids=[assigned_to_user.id],
            message="New task assigned",
            link=f"/patients/{patient_id}"
        )

        log_action(
            db=db,
            user_id=current_user.id,
            action="task_created",
            endpoint="/tasks/internal-create",
            payload={"task_id": str(new_task)}
        )

    #  Finalize transaction
    db.commit()
    return {"message": "Follow-up added successfully", "id": str(follow_up.id)}
@router.post("/assign",status_code=201)
def assign_patient(payload:AssignPatient,current_admin=Depends(get_current_admin_user),db: Session = Depends(get_db)):
    # Validate patient existence
    patient = db.query(PatientReference).filter_by(patient_id=payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    # Validate User existence
    user = db.query(User.id).filter_by(username=payload.username).first()
    if not user:
        raise HTTPException(status_code=404,detail="User Not Found")
    # Assign the patient to user
    assignment = Assignment(user_id=user.id,patient_id=payload.patient_id)
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    create_notification(db,user_ids=[user.id],message=f"Patient {payload.patient_id} is assigned to you",link=f"/{payload.patient_id}")
    log_action(db, user_id=user.id, action="patient_assigned", endpoint=f"/patients/assign",
               payload={"assignment":str(assignment)})
    return {"message":f"patient got assigned successfully"}

@router.patch("/followup/update/{followup_id}")
def update_followup(followup_id:UUID,payload: FollowUpUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    followup = db.query(FollowUp).filter(FollowUp.id == followup_id).first()
    if not followup:
        raise HTTPException(status_code=404, detail="Follow‑up not found")

    # Optionally restrict: only the creator or admin can edit
    if current_user.role != "admin" and followup.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit")

    # Apply only provided fields
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(followup, field, value)

    db.commit()
    db.refresh(followup)

    log_action(db,current_user.id,action="followup_updated",endpoint="/followup/update",payload={"updated_followup":str(followup)})
    return {"message": "Follow-up updated successfully"}





