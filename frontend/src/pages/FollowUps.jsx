// src/pages/FollowUps.jsx
import React, { useState, useContext } from "react";
import { useGlobalContext } from "../context/GlobalContext";

const FollowUps = () => {
  const { patients, loading: patientLoading } = useGlobalContext();

  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    patientId: "",
    followUpType: "phone",
    notes: "",
    followUpDate: today,
    nextFollowUp: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      formData.nextFollowUp &&
      new Date(formData.nextFollowUp) <= new Date(formData.followUpDate)
    ) {
      setError("Next follow‑up must be in the future.");
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/patients/${formData.patientId}/followups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notes: formData.notes,
            status: "completed",
            follow_up_type: formData.followUpType,
            follow_up_date: formData.followUpDate,
            next_followup: formData.nextFollowUp || null,
          }),
        }
      );
      if (!res.ok) throw new Error();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({
        patientId: "",
        followUpType: "phone",
        notes: "",
        followUpDate: today,
        nextFollowUp: "",
      });
    } catch {
      setError("Failed to submit follow‑up.");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div style={{ padding: 30, maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20, color: "#343a40" }}>➕ Add Follow‑Up</h2>
      {patientLoading && (
        <small style={{ color: "#6c757d" }}>Loading patient list…</small>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#ffffff",
          padding: 25,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          display: "grid",
          gap: 20,
        }}
      >
        {/* Patient ID with datalist suggestions */}
        <div>
          <label style={{ fontWeight: "bold" }}>Patient ID *</label>
          <input
            list="patientSuggestions"
            name="patientId"
            required
            value={formData.patientId}
            onChange={handleChange}
            placeholder="Start typing ID…"
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 6,
              marginTop: 6,
            }}
          />
          {/* Datalist with patient IDs */}
          {!patientLoading && patients.length > 0 ? (
            <datalist id="patientSuggestions">
              {patients.map((p) => (
                <option
                  key={p.patient_id}
                  value={p.patient_id}
                  label={`${p.patient_id} – ${p.disease_type}`}
                />
              ))}
            </datalist>
          ) : null}
        </div>

        {/* Follow‑up type */}
        <div>
          <label style={{ fontWeight: "bold" }}>Type *</label>
          <select
            name="followUpType"
            value={formData.followUpType}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 6,
              marginTop: 6,
            }}
          >
            <option value="phone">Phone</option>
            <option value="onsite">Onsite</option>
            <option value="virtual">Virtual</option>
          </select>
        </div>

        {/* Dates */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: "bold" }}>Follow‑up Date *</label>
            <input
              type="date"
              name="followUpDate"
              required
              value={formData.followUpDate}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 6,
                marginTop: 6,
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: "bold" }}>
              Next Follow‑up (optional)
            </label>
            <input
              type="date"
              name="nextFollowUp"
              value={formData.nextFollowUp}
              onChange={handleChange}
              min={formData.followUpDate}
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 6,
                marginTop: 6,
              }}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ fontWeight: "bold" }}>Notes *</label>
          <textarea
            name="notes"
            required
            value={formData.notes}
            onChange={handleChange}
            placeholder="Write notes…"
            style={{
              width: "100%",
              minHeight: 100,
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 6,
              resize: "vertical",
              marginTop: 6,
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: 12,
              background: "#f8d7da",
              color: "#721c24",
              border: "1px solid #f5c6cb",
              borderRadius: 6,
            }}
          >
            ❌ {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: 12,
              background: "#d4edda",
              color: "#155724",
              border: "1px solid #c3e6cb",
              borderRadius: 6,
            }}
          >
            ✅ Follow‑up submitted!
          </div>
        )}

        <div style={{ textAlign: "right" }}>
          <button
            type="submit"
            style={{
              background: "#28a745",
              color: "#fff",
              padding: "10px 22px",
              borderRadius: 6,
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default FollowUps;
