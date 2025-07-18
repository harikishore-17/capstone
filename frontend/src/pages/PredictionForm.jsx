import React, { useState } from "react";
import { useGlobalContext } from "../context/GlobalContext";

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

const displayOrder = {
  pneumonia: [
    "patient_id",
    "age",
    "gender",
    "comorbidities",
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
  ],
  "heart failure": ["patient_id", ...conditionFields["heart failure"]],
  diabetes: [
    "patient_id",
    "age",
    "gender",
    "race",
    "admission_type_id",
    "discharge_disposition_id",
    "admission_source_id",
    "time_in_hospital",
    "time_in_hospital_max",
    "num_lab_procedures",
    "num_procedures",
    "num_medications_mean",
    "number_outpatient_sum",
    "number_emergency",
    "number_inpatient",
    "number_diagnoses",
    "diag_1",
    "diag_2",
    "diag_3",
    "glipizide",
    "glyburide",
    "metformin",
    "max_glu_serum",
    "A1Cresult",
    "insulin",
    "change",
    "diabetesMed",
    "medical_specialty",
  ],
};

const PredictionForm = () => {
  const { groupedPatients } = useGlobalContext();
  const [condition, setCondition] = useState("pneumonia");
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const allFields = conditionFields[condition];
  const displayFields = displayOrder[condition];
  console.log("Grouped Patients for", condition, groupedPatients[condition]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "patient_id") {
      const matches = groupedPatients[condition]?.filter((p) =>
        p.patient_id.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matches || []);
    }
  };

  const handleSelectPatient = (patient) => {
    setFormData((prev) => ({
      ...prev,
      patient_id: patient.patient_id,
      ...patient.clinical_info,
      age: patient.age || "",
      gender: patient.gender || "",
    }));
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderedPayload = {};
    allFields.forEach((field) => {
      orderedPayload[field] = formData[field] || "";
    });

    // Simulate backend response
    const score = Math.random();
    setResult({
      score: (score * 100).toFixed(1),
      category: score > 0.75 ? "High" : score > 0.4 ? "Medium" : "Low",
    });
  };

  return (
    <div style={{ padding: 30, maxWidth: 800, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20 }}>🧠 Predict 30-Day Readmission Risk</h2>

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
            setSuggestions([]);
          }}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="pneumonia">Pneumonia</option>
          <option value="heart failure">Heart Failure</option>
          <option value="diabetes">Diabetes</option>
        </select>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#f8f9fa",
          padding: 20,
          borderRadius: 8,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
        }}
      >
        {displayFields.map((field) => (
          <div key={field} style={{ position: "relative" }}>
            <label style={{ fontWeight: "bold" }}>
              {field.replace(/_/g, " ")}:
            </label>
            <input
              name={field}
              value={
                formData[field] !== undefined && formData[field] !== null
                  ? formData[field]
                  : ""
              }
              onChange={handleChange}
              autoComplete="off"
              placeholder={`Enter ${field}`}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
            {field === "patient_id" && suggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  maxHeight: 150,
                  overflowY: "auto",
                  zIndex: 100,
                }}
              >
                {suggestions.map((s) => (
                  <div
                    key={s.patient_id}
                    onClick={() => handleSelectPatient(s)}
                    style={{
                      padding: 8,
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {s.patient_id}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

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

      {result && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            backgroundColor: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
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

          <div style={{ marginTop: 20 }}>
            <h4>LLM Explanation</h4>
            <div
              style={{
                padding: 15,
                backgroundColor: "#f1f3f5",
                borderRadius: 6,
                fontStyle: "italic",
              }}
            >
              The patient’s predicted risk is influenced by their current vitals
              and prior hospital history. ICU admission, long stay, or abnormal
              values increase risk significantly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
