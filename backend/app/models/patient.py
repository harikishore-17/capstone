from pydantic import BaseModel
from datetime import datetime
from typing import Literal,List

class PredictionSummary(BaseModel):
    risk:str
    predicted_probability: float
    prediction_class: str

class AssignedPatient(BaseModel):
    patient_id : str
    age : int
    gender : str
    mobile_number : str
    disease_type : str
    risk:str



class FollowUpSchema(BaseModel):
    id: str
    user_id: str
    notes: str
    follow_up_type: Literal["phone", "onsite", "virtual"]
    status: Literal["pending", "completed", "cancelled", "upcoming"]
    timestamp: datetime
    follow_up_date: datetime

    class Config:
        orm_mode = True


class FollowUpCreate(BaseModel):
    notes: str
    status: Literal["completed","pending","upcoming","cancelled"]
    follow_up_type: Literal["phone", "onsite", "virtual"]
    follow_up_date: datetime


class PatientDetails(BaseModel):
    patient_id: str
    name: str
    age: int
    gender: str
    mobile_number: str
    disease_type: str
    clinical_info: dict
    follow_ups: List[FollowUpSchema]
    prediction: PredictionSummary