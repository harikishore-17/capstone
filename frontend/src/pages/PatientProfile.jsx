import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";

// Simulated backend data
const dummyPatients = {
  p1: {
    name: "John Doe",
    age: 60,
    gender: "Male",
    phone: "123-456-7890",
    disease: "Pneumonia",
    risk: "High",
    clinical: {
      bp: "140/90",
      heartRate: 102,
      spo2: "94%",
      temperature: "100.2°F",
    },
    latestPrediction: {
      score: 0.87,
      category: "High",
      date: "2025-06-28",
      condition: "Pneumonia",
    },
    followUps: [
      {
        id: 1,
        date: "2025-07-01",
        notes: "Patient reported fatigue. Suggested sugar-level test.",
        status: "Completed",
      },
    ],
  },
  p2: {
    name: "Jane Smith",
    age: 55,
    gender: "Female",
    phone: "987-654-3210",
    disease: "Heart Failure",
    risk: "Medium",
    clinical: {
      bp: "130/85",
      heartRate: 95,
      spo2: "96%",
      temperature: "98.6°F",
    },
    latestPrediction: null,
    followUps: [],
  },
};

const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("followups");
  const [patient, setPatient] = useState(null);
  const [editingRisk, setEditingRisk] = useState(false);
  const [newRisk, setNewRisk] = useState("");

  useEffect(() => {
    const data = dummyPatients[patientId];
    if (data) {
      setPatient(data);
      setNewRisk(data.risk);
    } else {
      navigate("/"); // redirect if not found
    }
  }, [patientId, navigate]);

  if (!patient) return null;

  return (
    <div style={{ padding: 30, maxWidth: 1000, margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 20,
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h2 style={{ marginBottom: 10 }}>{patient.name}</h2>

      {/* General Details */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 20,
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <strong>Age:</strong> {patient.age}
        </div>
        <div>
          <strong>Gender:</strong> {patient.gender}
        </div>
        <div>
          <strong>Phone:</strong> {patient.phone}
        </div>
        <div>
          <strong>Disease:</strong> {patient.disease}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <strong>Risk:</strong>&nbsp;{patient.risk}
          <FaEdit
            style={{
              marginLeft: 8,
              color: "#007bff",
              cursor: "pointer",
            }}
            title="Request Priority Change"
            onClick={() => setEditingRisk(true)}
          />
        </div>
      </div>

      {/* Latest Prediction */}
      <div
        style={{
          marginBottom: 30,
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ marginBottom: 15 }}>Latest Prediction</h3>
        {patient.latestPrediction ? (
          <div style={{ fontSize: 16 }}>
            <div>
              <strong>Condition:</strong> {patient.latestPrediction.condition}
            </div>
            <div>
              <strong>Prediction Score:</strong>{" "}
              {(patient.latestPrediction.score * 100).toFixed(1)}%
            </div>
            <div>
              <strong>Risk Category:</strong>{" "}
              {patient.latestPrediction.category}
            </div>
            <div>
              <strong>Date:</strong> {patient.latestPrediction.date}
            </div>
          </div>
        ) : (
          <div style={{ color: "#6c757d" }}>No prediction data available.</div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: 20 }}>
        <button
          onClick={() => setSelectedTab("followups")}
          style={{
            padding: "10px 20px",
            marginRight: 10,
            border: "none",
            borderBottom:
              selectedTab === "followups"
                ? "3px solid #007bff"
                : "3px solid transparent",
            backgroundColor: "transparent",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            color: selectedTab === "followups" ? "#007bff" : "#495057",
          }}
        >
          Follow Ups
        </button>
        <button
          onClick={() => setSelectedTab("clinical")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom:
              selectedTab === "clinical"
                ? "3px solid #007bff"
                : "3px solid transparent",
            backgroundColor: "transparent",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            color: selectedTab === "clinical" ? "#007bff" : "#495057",
          }}
        >
          Clinical Data
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === "followups" && (
        <div>
          {patient.followUps?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {patient.followUps.map((fup) => (
                <div
                  key={fup.id}
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 15,
                    borderLeft: `5px solid ${
                      fup.status === "Completed" ? "#28a745" : "#ffc107"
                    }`,
                    borderRadius: 6,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <div>
                    <strong>Date:</strong> {fup.date}
                  </div>
                  <div>
                    <strong>Notes:</strong> {fup.notes}
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color:
                          fup.status === "Completed" ? "#28a745" : "#ffc107",
                        fontWeight: "bold",
                      }}
                    >
                      {fup.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>No follow-ups recorded.</div>
          )}
        </div>
      )}

      {selectedTab === "clinical" && (
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: 20,
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            maxWidth: 600,
          }}
        >
          <h3 style={{ marginBottom: 15 }}>Clinical Vitals</h3>
          <ul style={{ listStyleType: "none", padding: 0, fontSize: 16 }}>
            <li>
              <strong>Blood Pressure:</strong> {patient.clinical.bp}
            </li>
            <li>
              <strong>Heart Rate:</strong> {patient.clinical.heartRate} bpm
            </li>
            <li>
              <strong>SpO₂:</strong> {patient.clinical.spo2}
            </li>
            <li>
              <strong>Temperature:</strong> {patient.clinical.temperature}
            </li>
          </ul>
        </div>
      )}

      {/* Risk Change Modal */}
      {editingRisk && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 10,
              width: 400,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginBottom: 15 }}>
              Change Risk from{" "}
              <span style={{ color: "#dc3545" }}>{patient.risk}</span> to{" "}
              <span style={{ color: "#28a745" }}>{newRisk}</span>?
            </h3>
            <p style={{ fontSize: 14, color: "#6c757d" }}>
              This change needs admin approval. Once submitted, an escalation
              request will be sent to the admin.
            </p>

            <div style={{ marginTop: 20 }}>
              <label style={{ fontWeight: "bold" }}>
                Select Risk Category:
              </label>
              <select
                value={newRisk}
                onChange={(e) => setNewRisk(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: 10,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div
              style={{
                marginTop: 25,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                onClick={() => setEditingRisk(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEditingRisk(false);
                  alert(
                    `Escalation request sent to admin to change risk from ${patient.risk} to ${newRisk}`
                  );
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
