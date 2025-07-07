# 🏥 30-Day Hospital Readmission Prediction System

This capstone project is a full-stack application designed to **predict the risk of 30-day hospital readmission** for patients with conditions like **pneumonia, diabetes, and heart failure**. It helps hospital staff take proactive follow-up actions and reduce penalties from avoidable readmissions (e.g., under CMS-HRRP).

Built using **React (frontend)** and **FastAPI (backend)** with role-based access and machine learning integration.

---
##  Key Features

###  Predictive Modeling
- Disease-specific machine learning models:
  - Pneumonia
  - Heart Failure
  - Diabetes
- Optimized using ensemble methods, SMOTE/ADASYN, and threshold tuning
- Model explainability with SHAP and LLM (coming soon)
### 👥 Role-Based Access

#### User / Nurse
- Login and view tasks
- View assigned patients ordered by risk
- Access patient profile and follow-up history
- Submit new follow-ups
- Raise priority escalation requests

####  Admin
- View high-priority patients and pending escalations
- Assign tasks and manage follow-ups across the system
- Approve or reject priority escalations
- Audit system usage and predictions
## Tech Stack

| Layer         | Stack                             |
|---------------|-----------------------------------|
| **Frontend**  | React, Tailwind CSS, React Router DOM |
| **Backend**   | FastAPI, scikit-learn, XGBoost, LightGBM |
| **Database**  | Supabase (PostgreSQL)             |
| **Deployment**| Vercel (frontend), Render (backend) |
| **Authentication** | Supabase Auth (planned)     |


