from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.db_schema.escalations import Escalation
from app.db_schema.predicition import Prediction
from app.models.escalation import EscalationCreate, EscalationUpdate, EscalationSchema
from app.services.auth_middleware import get_current_user, get_current_admin_user
from app.utils.audit_logs import log_action
from app.utils.notification_create import create_notification
from app.db_schema.user import User
from sqlalchemy.orm.attributes import flag_modified
router = APIRouter(prefix="/escalations", tags=["Escalations"])

@router.get("/all")
def get_all_escalations(db: Session = Depends(get_db), user=Depends(get_current_admin_user)):
    """
    Admin-only: fetch all escalations with details.
    """
    escalations = db.query(Escalation).filter_by(status="pending")
    return {"escalations": [
        {
            "id": esc.id,
            "patient_id": esc.patient_id,
            "old_risk":esc.old_risk ,
            "new_risk": esc.new_risk,
            "description": esc.description,
        }
        for esc in escalations
    ]}

@router.post("/create", response_model=EscalationSchema)
def create_escalation(
    payload: EscalationCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_escalation = Escalation(
        patient_id=payload.patient_id,
        user_id=current_user.id,
        old_risk=payload.old_risk,
        new_risk=payload.new_risk,
        description=payload.description
    )
    db.add(new_escalation)
    db.commit()
    db.refresh(new_escalation)
    admin_ids: List[str] = [
        str(admin.id) for admin in db.query(User.id).filter(User.role == "admin").all()
    ]
    create_notification(
        db=db,
        user_ids=admin_ids,
        message=f"New escalation request for patient {payload.patient_id}",
        link=f"/escalations/{new_escalation.id}"
    )
    log_action(db,user_id=current_user.id,action="escalation_request_created",endpoint="/escalations/create",payload={"escalation":str(new_escalation)})
    return new_escalation

@router.put("/{escalation_id}", response_model=EscalationSchema)
def update_escalation_status(
        escalation_id: str,
        payload: EscalationUpdate,
        current_admin=Depends(get_current_admin_user),
        db: Session = Depends(get_db)
):
    escalation = db.query(Escalation).filter_by(id=escalation_id).first()
    if not escalation:
        raise HTTPException(status_code=404, detail="Escalation not found")

    if escalation.status != "pending":
        raise HTTPException(status_code=400, detail="Escalation already processed")

    # Update escalation details
    escalation.status = payload.status
    escalation.reviewed_by = current_admin.id
    escalation.updated_at = datetime.utcnow()

    if payload.status == "rejected":
        if not payload.rejection_note:
            raise HTTPException(status_code=400, detail="Rejection note is required")
        escalation.rejection_note = payload.rejection_note

    # This block is now clean and bug-free
    if payload.status == "accepted":
        latest_prediction = (
            db.query(Prediction)
            .filter(Prediction.patient_id == escalation.patient_id)
            .order_by(Prediction.timestamp.desc())
            .first()
        )
        if latest_prediction:
            latest_prediction.risk = escalation.new_risk
            db.commit()
            db.refresh(escalation)
            db.refresh(latest_prediction)
        else:
            db.commit()
            db.refresh(escalation)
    else:
        db.commit()
        db.refresh(escalation)

    # Create notification and log action
    create_notification(
        db=db,
        user_ids=[escalation.user_id],
        message=f"Your escalation for patient {escalation.patient_id} was {payload.status}.",
        link=f"/patients/{escalation.patient_id}"
    )
    log_action(
        db=db,
        user_id=current_admin.id,
        action="escalation_updated",
        endpoint=f"/escalations/{escalation_id}",
        payload={
            "updated": payload.status,
            "rejection_note": payload.rejection_note if payload.rejection_note else ""
        }
    )
    return escalation
