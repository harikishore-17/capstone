from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID
class EscalationCreate(BaseModel):
    patient_id: str
    old_risk: str
    new_risk: str
    description: str

class EscalationUpdate(BaseModel):
    status: Literal["accepted", "rejected"]
    rejection_note: Optional[str] = None

class EscalationSchema(BaseModel):
    id: UUID
    patient_id: str
    user_id: UUID
    old_risk: str
    new_risk: str
    description: str
    status: str
    rejection_note: Optional[str]
    reviewed_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes=True
