import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdSave, MdCancel } from "react-icons/md";
import { useGlobalContext } from "../context/GlobalContext";
const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients } = useGlobalContext();
  const [selectedTab, setSelectedTab] = useState("followups");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [patient, setPatient] = useState(null);
  const [editingRisk, setEditingRisk] = useState(false);
  const [newRisk, setNewRisk] = useState("");
  const [editingFollowUpId, setEditingFollowUpId] = useState(null);
  const [followUpEdits, setFollowUpEdits] = useState({});
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const currentUser = JSON.parse(localStorage.getItem("user"));
  let isAssignedUser = false;
  if (patient) {
    const curr_patient = patients.find((p) => p.id === patient.id);
    isAssignedUser = curr_patient?.assigned_user_id === currentUser?.id;
  }
  const [riskChangeDescription, setRiskChangeDescription] = useState("");

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`${BASE_URL}/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch patient");
        const data = await res.json();
        setPatient(data);
        setNewRisk(data.prediction?.risk || "");
      } catch (err) {
        console.error(err);
        navigate("/");
      }
    };

    fetchPatient();
  }, [patientId, refreshTrigger]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#28a745";
      case "upcoming":
        return "#17a2b8";
      default:
        return "#ffc107";
    }
  };

  const handleSaveEdit = async (id) => {
    const updated = followUpEdits[id];
    try {
      const res = await fetch(`${BASE_URL}/patients/followup/update/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...followUpEdits[id],
          ...updated,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Follow-up updated successfully.");
      setEditingFollowUpId(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Failed to update follow-up.");
    }
  };

  const handleChange = (id, field, value) => {
    setFollowUpEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  if (!patient) return <div style={{ padding: 30 }}>Loading...</div>;

  return (
    <div style={{ padding: "30px 20px", maxWidth: 1000, margin: "0 auto" }}>
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

      <h2 style={{ marginBottom: 10, color: "#343a40" }}>{patient.name}</h2>

      {/* Basic Info */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: 24,
          borderRadius: 10,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 30,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <strong>Age:</strong> {patient.age}
        </div>
        <div>
          <strong>Gender:</strong> {patient.gender}
        </div>
        <div>
          <strong>Phone:</strong> {patient.mobile_number}
        </div>
        <div>
          <strong>Disease:</strong> {patient.disease_type}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <strong>Risk:</strong>&nbsp;
          {patient.prediction?.risk || "N/A"}
          {isAssignedUser && (
            <FaEdit
              onClick={() => setEditingRisk(true)}
              style={{ marginLeft: 8, color: "#007bff", cursor: "pointer" }}
            />
          )}
        </div>
      </div>

      {/* Prediction */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: 24,
          marginBottom: 30,
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h3>Latest Prediction</h3>
        {patient.prediction ? (
          <ul style={{ padding: 0, listStyle: "none", fontSize: 16 }}>
            <li>
              <strong>Risk:</strong> {patient.prediction.risk}
            </li>
            <li>
              <strong>Probability:</strong>{" "}
              {(patient.prediction.predicted_probability * 100).toFixed(1)}%
            </li>
            <li>
              <strong>Class:</strong> {patient.prediction.prediction_class}
            </li>
          </ul>
        ) : (
          <p style={{ color: "#6c757d" }}>No prediction data available.</p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: 20 }}>
        {["followups", "clinical"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              padding: "10px 20px",
              fontWeight: "bold",
              fontSize: 16,
              border: "none",
              backgroundColor: "transparent",
              borderBottom:
                selectedTab === tab
                  ? "3px solid #007bff"
                  : "3px solid transparent",
              color: selectedTab === tab ? "#007bff" : "#6c757d",
              cursor: "pointer",
              marginRight: 15,
            }}
          >
            {tab === "followups" ? "Follow Ups" : "Clinical Data"}
          </button>
        ))}
      </div>

      {/* Follow Ups */}
      {selectedTab === "followups" && (
        <div>
          {patient.follow_ups?.length > 0 ? (
            patient.follow_ups.map((fup) => {
              const isEditing = editingFollowUpId === fup.id;
              const color = getStatusColor(fup.status);

              return (
                <div
                  key={fup.id}
                  style={{
                    position: "relative",
                    backgroundColor: "#ffffff",
                    padding: 20,
                    borderLeft: `5px solid ${color}`,
                    marginBottom: 16,
                    borderRadius: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Edit icon */}
                  {isAssignedUser &&
                    fup.status !== "completed" &&
                    !isEditing && (
                      <FaEdit
                        onClick={() => {
                          setEditingFollowUpId(fup.id);
                          setFollowUpEdits({
                            ...followUpEdits,
                            [fup.id]: {
                              notes: fup.notes,
                              status: fup.status,
                              follow_up_date: fup.follow_up_date,
                            },
                          });
                        }}
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          color: "#007bff",
                          cursor: "pointer",
                        }}
                      />
                    )}

                  {isEditing ? (
                    <>
                      <div>
                        <strong>Date:</strong>{" "}
                        <input
                          type="date"
                          value={followUpEdits[fup.id]?.follow_up_date}
                          onChange={(e) =>
                            handleChange(
                              fup.id,
                              "follow_up_date",
                              e.target.value
                            )
                          }
                          style={{
                            marginTop: 4,
                            padding: 6,
                            border: "1px solid #ccc",
                            borderRadius: 4,
                          }}
                        />
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <strong>Type:</strong>{" "}
                        <select
                          value={followUpEdits[fup.id]?.follow_up_type}
                          onChange={(e) =>
                            handleChange(
                              fup.id,
                              "follow_up_type",
                              e.target.value
                            )
                          }
                          style={{
                            padding: 6,
                            marginLeft: 6,
                            border: "1px solid #ccc",
                            borderRadius: 4,
                          }}
                        >
                          <option value="phone">Phone</option>
                          <option value="onsite">Onsite</option>
                          <option value="virtual">Virtual</option>
                        </select>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <strong>Notes:</strong>
                        <textarea
                          value={followUpEdits[fup.id]?.notes}
                          onChange={(e) =>
                            handleChange(fup.id, "notes", e.target.value)
                          }
                          rows={3}
                          style={{
                            width: "100%",
                            marginTop: 4,
                            padding: 8,
                            border: "1px solid #ccc",
                            borderRadius: 4,
                          }}
                        />
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <strong>Status:</strong>{" "}
                        <select
                          value={followUpEdits[fup.id]?.status}
                          onChange={(e) =>
                            handleChange(fup.id, "status", e.target.value)
                          }
                          style={{
                            padding: 6,
                            marginLeft: 6,
                            border: "1px solid #ccc",
                            borderRadius: 4,
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div style={{ marginTop: 16, textAlign: "right" }}>
                        <button
                          onClick={() => setEditingFollowUpId(null)}
                          style={{
                            marginRight: 10,
                            padding: "6px 12px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          <MdCancel style={{ verticalAlign: "middle" }} />{" "}
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(fup.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          <MdSave style={{ verticalAlign: "middle" }} /> Save
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <strong>Date:</strong> {fup.follow_up_date}
                      </div>
                      <div>
                        <strong>Type:</strong> {fup.follow_up_type}
                      </div>
                      <div>
                        <strong>Notes:</strong> {fup.notes}
                      </div>
                      <div>
                        <strong>Status:</strong>{" "}
                        <span style={{ color, fontWeight: "bold" }}>
                          {fup.status}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <p>No follow-ups recorded.</p>
          )}
        </div>
      )}

      {/* Clinical Data */}
      {selectedTab === "clinical" && patient.clinical_info && (
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: 24,
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ marginBottom: 15 }}>Clinical Details</h3>
          <ul style={{ padding: 0, listStyle: "none", fontSize: 16 }}>
            {Object.entries(patient.clinical_info).map(([key, value]) => (
              <li key={key}>
                <strong>{key.replace(/_/g, " ")}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Modal */}
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
              width: 450,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginBottom: 15 }}>
              Request Risk Change from{" "}
              <span style={{ color: "#dc3545" }}>
                {patient.prediction?.risk}
              </span>{" "}
              to <span style={{ color: "#28a745" }}>{newRisk}</span>
            </h3>

            <label
              style={{ fontWeight: "bold", display: "block", marginBottom: 6 }}
            >
              New Risk
            </label>
            <select
              value={newRisk}
              onChange={(e) => setNewRisk(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginBottom: 20,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <label
              style={{ fontWeight: "bold", display: "block", marginBottom: 6 }}
            >
              Description <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              value={riskChangeDescription}
              onChange={(e) => setRiskChangeDescription(e.target.value)}
              rows={3}
              required
              style={{
                width: "100%",
                padding: 8,
                marginBottom: 20,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
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
                disabled={!riskChangeDescription.trim()}
                onClick={async () => {
                  try {
                    const res = await fetch(`${BASE_URL}/escalations/create`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        patient_id: patient.patient_id,
                        old_risk: patient.prediction?.risk,
                        new_risk: newRisk,
                        description: riskChangeDescription,
                      }),
                    });
                    if (!res.ok) throw new Error("Failed");
                    alert("Escalation submitted successfully.");
                    setEditingRisk(false);
                    setRiskChangeDescription("");
                  } catch (err) {
                    console.error(err);
                    alert("Failed to submit escalation.");
                  }
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: "bold",
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
