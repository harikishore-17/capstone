from sqlalchemy import Column, String, Text, DateTime, text, ARRAY
from sqlalchemy.dialects.postgresql import UUID,ARRAY
from datetime import datetime
from app.db import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True,server_default=text("gen_random_uuid()"))
    user_ids = Column(ARRAY(UUID(as_uuid=True)), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    read_by = Column(ARRAY(UUID(as_uuid=True)), default=[])