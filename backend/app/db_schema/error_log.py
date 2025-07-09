from sqlalchemy import Column, String, Text, DateTime,text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from app.db import Base

class ErrorLog(Base):
    __tablename__ = "error_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    endpoint = Column(String, nullable=False)
    error_message = Column(Text, nullable=False)
    stack_trace = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
