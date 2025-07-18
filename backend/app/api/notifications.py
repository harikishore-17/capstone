from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.services.auth_middleware import get_current_user
from app.models.notifications import NotificationSchema
from app.db_schema.notifications import Notification
from uuid import UUID
router = APIRouter()

@router.get("/my-notifications", response_model=List[NotificationSchema])
def get_my_notifications(
    db: Session=Depends(get_db),
    current_user=Depends(get_current_user)
):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_ids.contains([UUID(str(current_user.id))]))
        .order_by(Notification.created_at.desc())
        .all()
    )
    return notifs


@router.post("/mark-as-read/{notification_id}")
def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notif = db.query(Notification).filter_by(id=notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    if current_user.id not in notif.read_by:
        notif.read_by.append(current_user.id)
        db.commit()

    return {"message": "Marked as read"}