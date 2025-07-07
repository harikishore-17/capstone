import React, { useState } from "react";

const FollowUps = () => {
  const [formData, setFormData] = useState({
    patientId: "",
    followUpType: "Phone",
    notes: "",
    nextDate: "",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted follow-up:", formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setFormData({
      patientId: "",
      followUpType: "Phone",
      notes: "",
      nextDate: "",
    });
  };

  return (
    <div
      style={{
        padding: 30,
        maxWidth: 700,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Add Follow-Up</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "grid",
          gap: 20,
        }}
      >
        <div>
          <label style={{ fontWeight: "bold" }}>Patient ID:</label>
          <input
            type="text"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
            placeholder="Enter Patient ID"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 6,
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: "bold" }}>Follow-up Type:</label>
          <select
            name="followUpType"
            value={formData.followUpType}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 6,
            }}
          >
            <option value="Phone">Phone</option>
            <option value="Onsite">Onsite</option>
            <option value="Virtual">Virtual</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: "bold" }}>Notes:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            required
            placeholder="Write notes..."
            style={{
              width: "100%",
              minHeight: 100,
              padding: "8px",
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 6,
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: "bold" }}>
            Next Follow-up Date (optional):
          </label>
          <input
            type="date"
            name="nextDate"
            value={formData.nextDate}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 6,
            }}
          />
        </div>

        <div style={{ textAlign: "right" }}>
          <button
            type="submit"
            style={{
              padding: "8px 20px",
              backgroundColor: "#28a745",
              color: "white",
              fontWeight: "bold",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </div>
      </form>

      {success && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: "#d4edda",
            color: "#155724",
            borderRadius: 6,
            border: "1px solid #c3e6cb",
          }}
        >
          ✅ Follow-up submitted successfully!
        </div>
      )}
    </div>
  );
};

export default FollowUps;
