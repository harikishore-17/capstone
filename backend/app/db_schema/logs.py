from sqlalchemy import Column, String, DateTime, ForeignKey,JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text
from datetime import datetime
from app.db import Base
class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    endpoint = Column(String, nullable=True)
    payload = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
