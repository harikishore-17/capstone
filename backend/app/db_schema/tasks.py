from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum,Date
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.sql import text
from app.db import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(String, ForeignKey("patient_reference.patient_id"))
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    description = Column(Text)
    status = Column(String, default="pending")  # pending, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    due_date = Column(Date, nullable=True)
