from app.db_schema.notifications import Notification
from uuid import UUID
from sqlalchemy.orm import Session
from typing import List

def create_notification(
    db: Session,
    user_ids: List[UUID],
    message: str,
    link: str | None = None
):
    notif = Notification(
        user_ids=user_ids,
        message=message,
        link=link
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
