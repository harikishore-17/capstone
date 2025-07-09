# app/models/prediction.py
from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey,Integer
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.db import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    disease_type = Column(String, nullable=False)
    patient_id = Column(String,nullable=False)
    input_data = Column(JSON, nullable=False)
    predicted_class = Column(Integer, nullable=False)
    predicted_probability = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
