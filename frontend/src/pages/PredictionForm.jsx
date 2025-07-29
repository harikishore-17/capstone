import React, { useMemo, useState } from "react";
import { useGlobalContext } from "../context/GlobalContext";

// --- Data Structures (No changes needed here) ---
const fieldTypeParsers = {
  pneumonia: {
    int: [
      "age",
      "length_of_stay",
      "num_prior_admissions",
      "antibiotic_given",
      "icu_admission",
    ],
    float: ["bmi", "oxygen_saturation", "wbc_count", "crp_level"],
    keep: [
      "gender",
      "smoking_status",
      "discharge_disposition",
      "comorbidities",
      "patient_id",
    ],
  },
  "heart failure": {
    int: [
      "Age",
      "Length_of_Stay",
      "Previous_Admissions",
      "Pulse",
      "Heart_Rate",
      "Systolic_BP",
      "Diastolic_BP",
      "Respiratory_Rate",
      "Sodium",
      "Ejection_Fraction",
    ],
    float: ["Temperature", "BUN", "Creatinine", "Hemoglobin", "NT_proBNP"],
    keep: ["patient_id", "gender", "ethnicity", "discharge_disposition"],
  },
  diabetes: {
    int: [
      "time_in_hospital_max",
      "number_outpatient_sum",
      "number_emergency",
      "number_inpatient",
      "admission_type_id",
      "discharge_disposition_id",
      "admission_source_id",
      "age",
    ],
    float: [
      "time_in_hospital",
      "num_lab_procedures",
      "num_procedures",
      "num_medications_mean",
      "number_diagnoses",
    ],
    keep: [
      "patient_id",
      "diag_1",
      "diag_2",
      "diag_3",
      "metformin",
      "glipizide",
      "glyburide",
      "race",
      "gender",
      "max_glu_serum",
      "A1Cresult",
      "insulin",
      "change",
      "diabetesMed",
      "medical_specialty",
    ],
  },
};
const cleanedExplanation = (explanation) =>
  explanation.replace(/^```html/, "").replace(/```$/, "");

const parseFieldValue = (condition, field, value) => {
  if (fieldTypeParsers[condition].int.includes(field))
    return parseInt(value, 10);
  if (fieldTypeParsers[condition].float.includes(field))
    return parseFloat(value);
  return value;
};
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
    "patient_id",
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
    "patient_id",
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
  "heart failure": [
    "patient_id",
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
  const [predictionOutput, setPredictionOutput] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const curr_username = JSON.parse(localStorage.getItem("user"))?.username;

  const myAssignedPatients = useMemo(() => {
    if (!curr_username || !groupedPatients) {
      return {};
    }
    const filteredData = {};
    for (const condition in groupedPatients) {
      filteredData[condition] = groupedPatients[condition].filter(
        (patient) => patient.assigned_username === curr_username
      );
    }
    return filteredData;
  }, [groupedPatients, curr_username]);

  const allFields = conditionFields[condition];
  const displayFields = displayOrder[condition] || allFields;
  const patientsData = myAssignedPatients;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "patient_id" && value) {
      const matches = patientsData[condition]?.filter((p) =>
        p.patient_id.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matches || []);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectPatient = (patient) => {
    const selectedData = {};
    const flatPatientData = {
      ...patient.clinical_info,
      ...patient,
    };
    displayOrder[condition].forEach((field) => {
      const dataKey = Object.keys(flatPatientData).find(
        (pk) => pk.toLowerCase() === field.toLowerCase()
      );
      const value = dataKey ? flatPatientData[dataKey] : "";
      selectedData[field] = value;
    });
    setFormData(selectedData);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPredictionOutput(null);

    const missingField = displayFields.find(
      (field) => formData[field] == null || formData[field] === ""
    );
    if (missingField) {
      setError({
        message: `Please fill out all required fields. The '${missingField.replace(
          /_/g,
          " "
        )}' field is missing.`,
      });
      setIsLoading(false); // Stop loading on validation error
      return;
    }

    const orderedPayload = {};
    allFields.forEach((field) => {
      orderedPayload[field] = parseFieldValue(
        condition,
        field,
        formData[field] ?? ""
      );
    });

    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
      const url = `${BASE_URL}/predict/${condition.replace(" ", "_")}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(orderedPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw errorData;
      }
      const result = await res.json();
      setPredictionOutput(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">🧠</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Predict 30-Day Readmission Risk
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 mb-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-400 mb-3">
            Select Medical Condition:
          </label>
          <select
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              setFormData({});
              setPredictionOutput(null);
              setSuggestions([]);
              setError(null);
            }}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-slate-800 dark:text-gray-200 focus:bg-white dark:focus:bg-slate-700 min-w-[200px]"
          >
            <option value="pneumonia">🫁 Pneumonia</option>
            <option value="heart failure">❤️ Heart Failure</option>
            <option value="diabetes">🩸 Diabetes</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFields.map((field) => (
              <div key={field} className="relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2 capitalize">
                  {field.replace(/_/g, " ")}:
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  name={field}
                  value={formData[field] ?? ""}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder={`Enter ${field.replace(/_/g, " ")}`}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-slate-800 dark:text-gray-200 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-slate-700"
                  required
                />
                {field === "patient_id" && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg max-h-40 overflow-y-auto z-50 mt-1">
                    {suggestions.map((s) => (
                      <div
                        key={s.patient_id}
                        onClick={() => handleSelectPatient(s)}
                        className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-600 border-b border-gray-100 dark:border-slate-600 last:border-b-0 transition-colors text-gray-800 dark:text-gray-200"
                      >
                        <span className="font-medium">{s.patient_id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "Generate Prediction"}
            </button>
          </div>
          <h2 className="text-sm text-red-500 dark:text-red-400 mt-2">
            caution : This is an AI Generated Prediction, Make sure to validate
            it with clinical data and patient's condition. You can always
            escalate risk level by providing additional context or information.
          </h2>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300 p-4 rounded-xl mb-8">
          <h4 className="font-bold mb-2 text-red-900 dark:text-red-200">
            Prediction Failed
          </h4>
          {error.detail && Array.isArray(error.detail) ? (
            <ul className="list-disc list-inside space-y-1 text-sm">
              {error.detail.map((d, i) => (
                <li key={i}>
                  The field <strong>'{d.loc[d.loc.length - 1]}'</strong>:{" "}
                  {d.msg}
                </li>
              ))}
            </ul>
          ) : typeof error.detail === "string" ? (
            <p>{error.detail}</p>
          ) : (
            <p>{error.message || "An unexpected error occurred."}</p>
          )}
        </div>
      )}

      {predictionOutput && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Prediction Result
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Prediction
              </h4>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {predictionOutput.prediction}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Risk Category
              </h4>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  predictionOutput.risk === "High"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                    : predictionOutput.risk === "Medium"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                }`}
              >
                {predictionOutput.risk} Risk
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Probability
              </h4>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {(predictionOutput.probability * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-lg">🤖</span>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Model Explanation (SHAP)
              </h4>
            </div>
            <div
              className="bg-white dark:bg-black border border-gray-200 dark:border-slate-700 p-3 rounded-lg max-h-[400px] overflow-auto shadow-inner"
              dangerouslySetInnerHTML={{
                __html: cleanedExplanation(predictionOutput.explanation),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
