from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from uuid import UUID

class NotificationSchema(BaseModel):
    id: UUID
    user_ids: List[UUID]
    message: str
    link: Optional[str]
    created_at: datetime
    read_by: List[UUID]

    class Config:
        orm_mode = True

class NotificationCreate(BaseModel):
    user_ids: List[UUID]
    message: str
    link: Optional[str] = None
