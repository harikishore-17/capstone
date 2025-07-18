from uuid import UUID
from sqlalchemy.orm import Session
from typing import Optional
def log_action(
    db: Session,
    user_id: Optional[UUID],
    action: str,
    endpoint: Optional[str] = None,
    payload: Optional[dict] = None,
):
    from app.db_schema.logs import AuditLog

    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        endpoint=endpoint,
        payload=payload,
    )
    db.add(log_entry)
    db.commit()
