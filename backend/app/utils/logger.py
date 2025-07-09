from app.models.predicition import Prediction
from sqlalchemy.orm import Session
from app.models.user import User

def log_prediction(
    db: Session,
    user: User,
    disease: str,
    input_data: dict,
    prediction: int,
    probability: float
):
    patient_id = input_data["patient_id"]
    prediction_log = Prediction(
        user_id=user.id,
        disease_type=disease,
        input_data=input_data,
        patient_id = patient_id,
        predicted_class=prediction,
        predicted_probability=float(probability),
    )
    db.add(prediction_log)
    db.commit()
