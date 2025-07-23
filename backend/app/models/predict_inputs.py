from pydantic import BaseModel
from typing import Literal, Union, List


# === Pneumonia Input ===
class PneumoniaInput(BaseModel):
    patient_id: str
    age: int
    gender: Literal["Female", "Male"]
    bmi: float
    smoking_status: Literal["Never", "Former", "Current"]
    length_of_stay: int
    num_prior_admissions: int
    oxygen_saturation: float
    wbc_count: float
    crp_level: float
    antibiotic_given: Literal[0, 1]
    icu_admission: Literal[0, 1]
    discharge_disposition: Literal["Expired", "Home", "Nursing Facility", "Rehab", "Other"]
    comorbidities: Union[str, List[str]]


# === Heart Failure Input ===
class HeartFailureInput(BaseModel):
    patient_id: str
    Age: int
    Gender: Literal["Female", "Male"]
    Ethnicity: Literal["Asian", "Black", "Hispanic", "Other", "White"]
    Length_of_Stay: int
    Previous_Admissions: int
    Discharge_Disposition: Literal["Expired", "Home", "Nursing Facility", "Rehab"]
    Pulse: int
    Temperature: float
    Heart_Rate: int
    Systolic_BP: int
    Diastolic_BP: int
    Respiratory_Rate: int
    BUN: float
    Creatinine: float
    Sodium: int
    Hemoglobin: float
    NT_proBNP: float
    Ejection_Fraction: int


# === Diabetes Input ===
class DiabetesInput(BaseModel):
    patient_id: str
    time_in_hospital: float
    time_in_hospital_max: int
    num_lab_procedures: float
    num_procedures: float
    num_medications_mean: float
    number_outpatient_sum: int
    number_emergency: int
    number_inpatient: int
    number_diagnoses: float
    admission_type_id: int
    discharge_disposition_id: int
    admission_source_id: int
    diag_1: str
    diag_2: str
    diag_3: str
    metformin: Literal["Down", "No", "Steady", "Up"]
    glipizide: Literal["Down", "No", "Steady", "Up"]
    glyburide: Literal["Down", "No", "Steady", "Up"]
    race: Literal["AfricanAmerican", "Asian", "Caucasian", "Hispanic", "Other", "Unknown"]
    gender: Literal["Female", "Male"]
    age: int
    max_glu_serum: Literal[">200", ">300", "Norm", "Unknown"]
    A1Cresult: Literal[">7", ">8", "Norm", "Unknown"]
    insulin: Literal["Down", "No", "Steady", "Up"]
    change: Literal["Ch", "No"]
    diabetesMed:str
    medical_specialty: Literal[
        "Cardiology", "Emergency/Trauma", "Family/GeneralPractice", "InternalMedicine",
        "Nephrology", "Orthopedics", "Orthopedics-Reconstructive", "Other",
        "Radiologist", "Surgery-General", "Unknown"
    ]
