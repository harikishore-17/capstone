from http.client import responses

from fastapi import APIRouter, HTTPException
from app.models.predict import PneumoniaInput,DiabetesInput,HeartFailureInput
from app.services.explanation import explain_with_gemini
import pandas as pd
import joblib
import shap
import json
import os
import numpy as np
from app.services.assign_age import get_age_bucket

router = APIRouter(prefix="/predict", tags=["Prediction"])

def convert_numpy(obj):
    if isinstance(obj, (np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, (np.int32, np.int64)):
        return int(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj

@router.post("/pneumonia")
def predict_pneumonia(input_data: PneumoniaInput):
    try:
        # Convert input to dict and DataFrame
        user_data = input_data.dict()
        df = pd.DataFrame([user_data])
        df.drop(columns=["patient_id"], inplace=True)

        # Load model and components
        model = joblib.load("models/model_pneumonia/voting_model.pkl")
        with open("models/model_pneumonia/threshold.json") as f:
            threshold = json.load(f)['best_threshold']
        with open("models/model_pneumonia/features.json") as f:
            feature_order = json.load(f)['feature_order']

        # Load encoders
        encoders = {
            'gender': joblib.load("models/model_pneumonia/encoders_pneumonia/label_encoder_gender.joblib"),
            'smoking_status': joblib.load("models/model_pneumonia/encoders_pneumonia/label_encoder_smoking_status.joblib"),
            'discharge_disposition': joblib.load("models/model_pneumonia/encoders_pneumonia/label_encoder_discharge_disposition.joblib"),
            'multi_comorb': joblib.load("models/model_pneumonia/encoders_pneumonia/multi_label_binarizer.joblib"),
        }
        scaler = joblib.load("models/model_pneumonia/scalers_pneumonia/scaler.joblib")

        # Encode categorical
        df["gender"] = encoders["gender"].transform(df["gender"])
        df["smoking_status"] = encoders["smoking_status"].transform(df["smoking_status"])
        df["discharge_disposition"] = encoders["discharge_disposition"].transform(df["discharge_disposition"])

        # Comorbidities (multi-label)
        comorb = user_data["comorbidities"].split(",")
        comorb_encoded = encoders["multi_comorb"].transform([comorb])
        comorb_df = pd.DataFrame(comorb_encoded, columns=encoders["multi_comorb"].classes_)
        df = df.drop(columns=["comorbidities"]).join(comorb_df)

        # Scale selected features
        scaler_cols = ['age', 'bmi', 'wbc_count', 'crp_level', 'oxygen_saturation', 'num_prior_admissions', 'length_of_stay']
        df[scaler_cols] = scaler.transform(df[scaler_cols])

        # Reorder to match training
        df = df[feature_order]

        # Predict
        proba = model.predict_proba(df)[0][1]
        pred = int(proba >= threshold)

        # SHAP explanation
        explainer = shap.TreeExplainer(model.named_estimators_['xgb'])
        shap_values = explainer.shap_values(df)

        response = {
            "prediction": pred,
            "probability": round(proba, 4),
            "shap": {
                "features": df.columns.tolist(),
                "shap_values": [float(val) for val in shap_values[0]],
                "base_value": float(explainer.expected_value)
            }
        }
        response['explanation'] = explain_with_gemini(response)
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/heart_failure")
def predict_heart_failure(input_data: HeartFailureInput):
    raw_data = input_data.model_dump()
    df = pd.DataFrame([raw_data])
    encoder = joblib.load("models/model_heartfailure/encoder_heart.pkl")
    categorical_cols = ["Gender", "Ethnicity", "Discharge_Disposition"]
    encoded_array = encoder.transform(df[categorical_cols])
    encoded_df = pd.DataFrame(encoded_array, columns=encoder.get_feature_names_out())
    encoded_df.columns = [col.replace("cat__", "") for col in encoded_df.columns]
    df = df.drop(["Patient_ID"] + categorical_cols, axis=1)
    df = pd.concat([df.reset_index(drop=True), encoded_df.reset_index(drop=True)], axis=1)

    with open("models/model_heartfailure/feature_order.json") as f:
        feature_order = json.load(f)
    df = df[feature_order]

    with open("models/model_heartfailure/numerical_columns.json") as f:
        numerical_cols = json.load(f)
    scaler = joblib.load("models/model_heartfailure/standard_scaler.pkl")
    df[numerical_cols] = scaler.transform(df[numerical_cols])

    model = joblib.load("models/model_heartfailure/random_forest.pkl")
    proba = model.predict_proba(df)[0][1]
    pred = int(model.predict(df)[0])

    explainer = shap.Explainer(model)
    shap_values = explainer(df)

    response = {
        "prediction": pred,
        "probability": round(proba, 4),
        "shap": {
            "features": df.columns.tolist(),
            "shap_values": shap_values[0].values[:, 1].tolist(),  # Class 1 SHAPs
            "base_value": float(shap_values.base_values[0][1])  # Class 1 base
        }
    }
    response['explanation'] = explain_with_gemini(response)
    return response

@router.post("/diabetes")
def predict_diabetes(input_data: DiabetesInput):
    input_json = input_data.model_dump()
    df = pd.DataFrame([input_json])
    df.drop(columns=["patient_nbr"], errors="ignore", inplace=True)

    model = joblib.load("models/model_diabetics/xgb_readmission_model.joblib")
    threshold = joblib.load("models/model_diabetics/threshold.joblib")
    df['age'] = get_age_bucket(input_json['age'])
    ENCODERS_DIR = "models/model_diabetics/encoders_diabetics"
    categorical_encoders = {
        "A1Cresult": "label_encoder_A1Cresult.joblib",
        "age": "label_encoder_age.joblib",
        "change": "label_encoder_change.joblib",
        "diabetesMed": "label_encoder_diabetesMed.joblib",
        "diag_1": "label_encoder_diag_1.joblib",
        "diag_2": "label_encoder_diag_2.joblib",
        "diag_3": "label_encoder_diag_3.joblib",
        "gender": "label_encoder_gender.joblib",
        "glipizide": "label_encoder_glipizide.joblib",
        "glyburide": "label_encoder_glyburide.joblib",
        "insulin": "label_encoder_insulin.joblib",
        "max_glu_serum": "label_encoder_max_glu_serum.joblib",
        "medical_specialty": "label_encoder_medical_specialty.joblib",
        "metformin": "label_encoder_metformin.joblib",
        "race": "label_encoder_race.joblib",
    }
    encoders = {col: joblib.load(os.path.join(ENCODERS_DIR, fname)) for col, fname in categorical_encoders.items()}
    for col in categorical_encoders:
        if col in df.columns:
            val = df[col].iloc[0]
            if pd.isnull(val) or val == "NaN":
                val = "NaN"
            df[col] = [val]
            df[col] = encoders[col].transform(df[col])

    proba = model.predict_proba(df)[:, 1][0]
    pred = int(proba >= threshold)

    explainer = shap.Explainer(model)
    shap_values = explainer(df)

    response = {
        "prediction": int(pred),
        "probability": round(float(proba), 4),
        "shap": {
            "features": list(df.columns),
            "shap_values": shap_values.values[0].tolist(),
            "base_value": convert_numpy(explainer.expected_value)
        }
    }
    response["explanation"] = explain_with_gemini(response)
    return response
