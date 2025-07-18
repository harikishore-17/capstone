from sqlalchemy import Column, String, Text, DateTime, Date,ForeignKey, text, Integer, JSON, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.db import Base

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    patient_id = Column(String, ForeignKey("patient_reference.patient_id"))
    assigned_at = Column(DateTime, default=datetime.utcnow)

class PatientReference(Base):
    __tablename__ = "patient_reference"
    patient_id = Column(String, primary_key=True)
    name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    mobile_number = Column(String)
    disease_type = Column(String)
    clinical_info = Column(JSON)

class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(String, ForeignKey("patient_reference.patient_id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    follow_up_type = Column(String, nullable=True)
    status = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    follow_up_date = Column(Date, nullable=False)

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'completed', 'cancelled', 'upcoming')"),
        CheckConstraint("follow_up_type IN ('phone', 'onsite', 'virtual','')"),
    )

