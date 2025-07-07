import React, { useState } from "react";

const conditionFields = {
  pneumonia: [
    "patient_id",
    "age",
    "gender",
    "bmi",
    "smoking_status",
    "length_of_stay",
    "num_prior_admissions",
    "oxygen_saturation",
    "wbc_count",
    "crp_level",
    "antibiotic_given",
    "icu_admission",
    "discharge_disposition",
    "comorbidities",
  ],
  "heart failure": [
    "Age",
    "Gender",
    "Ethnicity",
    "Length_of_Stay",
    "Previous_Admissions",
    "Discharge_Disposition",
    "Pulse",
    "Temperature",
    "Heart_Rate",
    "Systolic_BP",
    "Diastolic_BP",
    "Respiratory_Rate",
    "BUN",
    "Creatinine",
    "Sodium",
    "Hemoglobin",
    "NT_proBNP",
    "Ejection_Fraction",
  ],
  diabetes: [
    "time_in_hospital",
    "time_in_hospital_max",
    "num_lab_procedures",
    "num_procedures",
    "num_medications_mean",
    "number_outpatient_sum",
    "number_emergency",
    "number_inpatient",
    "number_diagnoses",
    "admission_type_id",
    "discharge_disposition_id",
    "admission_source_id",
    "diag_1",
    "diag_2",
    "diag_3",
    "metformin",
    "glipizide",
    "glyburide",
    "race",
    "gender",
    "age",
    "max_glu_serum",
    "A1Cresult",
    "insulin",
    "change",
    "diabetesMed",
    "medical_specialty",
  ],
};

const PredictionForm = () => {
  const [condition, setCondition] = useState("pneumonia");
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulated prediction result
    const riskScore = Math.random(); // 0.00 to 1.00
    const riskCategory =
      riskScore > 0.75 ? "High" : riskScore > 0.4 ? "Medium" : "Low";
    setResult({
      score: (riskScore * 100).toFixed(1),
      category: riskCategory,
    });
  };

  const renderField = (field) => (
    <div key={field} style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
        {field.replace(/_/g, " ")}:
      </label>
      <input
        type="text"
        name={field}
        onChange={handleChange}
        placeholder={`Enter ${field}`}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />
    </div>
  );

  return (
    <div
      style={{
        padding: 30,
        maxWidth: 700,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <h2>Predict 30-Day Readmission Risk</h2>

      {/* Condition Selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: "bold", marginRight: 10 }}>
          Select Condition:
        </label>
        <select
          value={condition}
          onChange={(e) => {
            setCondition(e.target.value);
            setFormData({});
            setResult(null);
          }}
          style={{ padding: 8, borderRadius: 6 }}
        >
          <option value="pneumonia">Pneumonia</option>
          <option value="heart failure">Heart Failure</option>
          <option value="diabetes">Diabetes</option>
        </select>
      </div>

      {/* Dynamic Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#f8f9fa",
          padding: 20,
          borderRadius: 8,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {conditionFields[condition].map(renderField)}

        <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Predict
          </button>
        </div>
      </form>

      {/* Prediction Result */}
      {result && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            backgroundColor: "#fff",
            border: "1px solid #ced4da",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h3>Prediction Result</h3>
          <p>
            <strong>Risk Score:</strong> {result.score}%
          </p>
          <p>
            <strong>Risk Category:</strong>{" "}
            <span
              style={{
                color:
                  result.category === "High"
                    ? "#dc3545"
                    : result.category === "Medium"
                    ? "#ffc107"
                    : "#28a745",
                fontWeight: "bold",
              }}
            >
              {result.category}
            </span>
          </p>

          <div style={{ marginTop: 25 }}>
            <h4>LLM Explanation (Summary)</h4>
            <div
              style={{
                padding: 15,
                backgroundColor: "#f1f3f5",
                borderRadius: 6,
                fontStyle: "italic",
              }}
            >
              The patient is at high risk primarily due to a recent ICU
              admission, longer hospital stay, and prior history of admissions.
              However, stable oxygen saturation slightly reduces risk.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
