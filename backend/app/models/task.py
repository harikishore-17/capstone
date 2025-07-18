from pydantic import BaseModel
from typing import Literal
from datetime import datetime,date
from uuid import UUID
class TaskCreate(BaseModel):
    patient_id: str
    assigned_to: str
    description: str
    due_date:date

class TaskUpdate(BaseModel):
    status: Literal["pending", "completed"]

class TaskSchema(BaseModel):
    id: UUID
    patient_id: str
    assigned_by: UUID
    assigned_to: UUID
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    due_date: date

    class Config:
        orm_mode = True
