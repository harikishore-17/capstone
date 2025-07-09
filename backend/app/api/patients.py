from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.services.auth_middleware import get_current_user
from app.db_schema.patient_related import Assignment, PatientReference
from app.db_schema.predicition import Prediction
from app.models.patient import AssignedPatient, FollowUpCreate, FollowUpSchema,PatientDetails,PredictionSummary
from app.db_schema.patient_related import FollowUp
router = APIRouter(prefix="/patients",tags=["Patient Related Actions"])


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
    # Validate patient existence
    patient = db.query(PatientReference).filter_by(patient_id=patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

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
    db.commit()
    db.refresh(follow_up)

    return {"message": "Follow-up added successfully", "id": str(follow_up.id)}
