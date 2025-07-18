from sqlalchemy import Column, String, Text, DateTime, ForeignKey, CheckConstraint, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text
from datetime import datetime
from app.db import Base

class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(String, ForeignKey("patient_reference.patient_id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    old_risk = Column(String, nullable=False)
    new_risk = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, accepted, rejected
    rejection_note = Column(Text, nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'accepted', 'rejected')"),
    )
