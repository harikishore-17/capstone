from datetime import datetime

from sqlalchemy import Column, String, UUID, text, DateTime, Boolean
from app.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)  # Optional: validate against enum
    created_at = Column(DateTime, default=datetime.utcnow)
    must_change_password = Column(Boolean,default=False,nullable=False)
