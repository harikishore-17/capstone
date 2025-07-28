import React, { useState, useContext, useMemo } from "react";
import { useGlobalContext } from "../context/GlobalContext";

const curr_username = JSON.parse(localStorage.getItem("user"))?.username;

const FollowUps = () => {
  const { patients, loading: patientLoading } = useGlobalContext();
  const myAssignedPatients = useMemo(() => {
    if (!curr_username || !patients) {
      return []; // Return empty array for easier mapping
    }
    return patients.filter(
      (patient) => patient.assigned_username === curr_username
    );
  }, [patients, curr_username]);

  const patientsData = myAssignedPatients;
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
      setError("Next follow-up must be in the future.");
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
      setError("Failed to submit follow-up.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">📋</span>
        </div>
        {/* UPDATED: Text color for dark mode */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Add Follow-Up
        </h2>
      </div>

      {patientLoading && (
        <div className="flex items-center space-x-2 mb-6">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          {/* UPDATED: Text color for dark mode */}
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            Loading patient list...
          </span>
        </div>
      )}

      {/* UPDATED: Card styling for dark mode */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {/* UPDATED: Label color for dark mode */}
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">
              Patient ID *
            </label>
            {/* UPDATED: Input styling for dark mode */}
            <input
              list="patientSuggestions"
              name="patientId"
              required
              value={formData.patientId}
              onChange={handleChange}
              placeholder="Start typing patient ID..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-slate-800 dark:text-gray-200 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-slate-700"
            />
            {!patientLoading && patientsData.length > 0 ? (
              <datalist id="patientSuggestions">
                {patientsData.map((p) => (
                  <option
                    key={p.patient_id}
                    value={p.patient_id}
                    label={`${p.patient_id} – ${p.disease_type}`}
                  />
                ))}
              </datalist>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">
              Follow-up Type *
            </label>
            <select
              name="followUpType"
              value={formData.followUpType}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-slate-800 dark:text-gray-200 focus:bg-white dark:focus:bg-slate-700"
            >
              <option value="phone">📞 Phone Call</option>
              <option value="onsite">🏥 On-site Visit</option>
              <option value="virtual">💻 Virtual Meeting</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">
                Follow-up Date *
              </label>
              <input
                type="date"
                name="followUpDate"
                required
                value={formData.followUpDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-slate-800 dark:text-gray-200 focus:bg-white dark:focus:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">
                Next Follow-up (optional)
              </label>
              <input
                type="date"
                name="nextFollowUp"
                value={formData.nextFollowUp}
                onChange={handleChange}
                min={formData.followUpDate}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-slate-800 dark:text-gray-200 focus:bg-white dark:focus:bg-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">
              Notes *
            </label>
            <textarea
              name="notes"
              required
              value={formData.notes}
              onChange={handleChange}
              placeholder="Write detailed notes about the follow-up..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-slate-800 dark:text-gray-200 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-slate-700 resize-vertical"
            />
          </div>

          {error && (
            // UPDATED: Error message styling for dark mode
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center space-x-2">
              <span className="text-red-500">❌</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            // UPDATED: Success message styling for dark mode
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Follow-up submitted successfully!</span>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Submit Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowUps;
