from pydantic import BaseModel
from datetime import datetime,date
from typing import Literal, List, Optional
from app.models.escalation import EscalationSchema

class PredictionSummary(BaseModel):
    risk:str
    predicted_probability: float
    prediction_class: str

class AssignedPatient(BaseModel):
    patient_id : str
    name:str
    age : int
    gender : str
    mobile_number : str
    disease_type : str
    risk:str

class AssignPatient(BaseModel):
    patient_id : str
    username:str

class FollowUpSchema(BaseModel):
    id: str
    user_id: str
    notes: Optional[str]=None
    follow_up_type: Optional[Literal["phone", "onsite", "virtual"]] = None
    status: Literal["pending", "completed", "cancelled", "upcoming"]
    timestamp: datetime
    follow_up_date: date

    class Config:
        orm_mode = True


class FollowUpCreate(BaseModel):
    notes: Optional[str]
    status: Literal["completed","pending","upcoming","cancelled"]
    follow_up_type: Optional[Literal["phone", "onsite", "virtual"]]
    follow_up_date: date
    next_followup:Optional[date]

class FollowUpUpdate(BaseModel):
    notes: str
    status: Literal["completed", "pending", "upcoming", "cancelled"]
    follow_up_type: Literal["phone", "onsite", "virtual"]
    follow_up_date: date

class PatientDetails(BaseModel):
    patient_id: str
    name: str
    age: int
    gender: str
    mobile_number: str
    disease_type: str
    clinical_info: dict
    follow_ups: List[FollowUpSchema]
    prediction: Optional[PredictionSummary]
    escalations: List[EscalationSchema]