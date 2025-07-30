import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Edit,
  Save,
  X,
  ClipboardList,
  Stethoscope,
  AlertTriangle,
  CalendarDays,
  MessageSquare,
  Phone,
  Home as HomeIcon,
  Monitor,
  ArrowLeft,
  Flag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useGlobalContext } from "../context/GlobalContext";

const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients, refreshData } = useGlobalContext();
  const [selectedTab, setSelectedTab] = useState("followups");
  const [patient, setPatient] = useState(null);
  const [editingRisk, setEditingRisk] = useState(false);
  const [newRisk, setNewRisk] = useState("");
  const [editingFollowUpId, setEditingFollowUpId] = useState(null);
  const [followUpEdits, setFollowUpEdits] = useState({});
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [riskChangeDescription, setRiskChangeDescription] = useState("");
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const currentPatientFromContext = patients.find(
    (p) => p.patient_id === patientId
  );
  const isAssignedUser =
    currentPatientFromContext?.assigned_user_id === currentUser?.id;

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
  }, [patientId, token, BASE_URL, navigate]);

  const getFollowUpStatusColorClass = (status) => {
    // Corrected for dark mode visibility
    switch (status) {
      case "completed":
        return "border-green-500 bg-green-50 dark:bg-slate-800";
      case "upcoming":
        return "border-blue-500 bg-blue-50 dark:bg-slate-800";
      case "pending":
        return "border-yellow-500 bg-yellow-50 dark:bg-slate-800";
      default:
        return "border-gray-500 bg-gray-50 dark:bg-slate-800";
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
        body: JSON.stringify({ ...updated }),
      });
      if (!res.ok) throw new Error("Update failed");
      alert("Follow-up updated successfully.");
      setEditingFollowUpId(null);
      const updatedPatientRes = await fetch(
        `${BASE_URL}/patients/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedPatientData = await updatedPatientRes.json();
      setPatient(updatedPatientData);
      refreshData();
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

  const handleSubmitRiskChange = async () => {
    if (!riskChangeDescription.trim()) {
      alert("Please provide a detailed explanation.");
      return;
    }
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
      if (!res.ok) throw new Error("Failed to submit escalation.");
      alert("Escalation submitted successfully.");
      setEditingRisk(false);
      setRiskChangeDescription("");
      refreshData();
    } catch (err) {
      console.error(err);
      alert("Failed to submit escalation.");
    }
  };

  if (!patient)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="text-lg">Loading patient data...</span>
        </div>
      </div>
    );

  // Replace the entire return statement in your PatientProfile component with this

  return (
    // 1. NEW WRAPPER: This div now handles the full-page background
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* 2. INNER CONTAINER: Your original div, now just for content layout */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mb-6 bg-white/80 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border dark:border-slate-700/50">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                  {patient.name}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                  Patient ID: {patient.patient_id}
                </CardDescription>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <InfoCard
                label="Current Risk Level"
                value={patient.prediction?.risk || "N/A"}
                color="red"
                trailingItem={
                  isAssignedUser &&
                  patient.prediction?.risk && (
                    <Button
                      onClick={() => setEditingRisk(true)}
                      variant="ghost"
                      size="icon"
                      className="text-blue-500 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-full"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard label="Age" value={patient.age} color="gray" />
              <InfoCard label="Gender" value={patient.gender} color="gray" />
              <InfoCard
                label="Phone"
                value={patient.mobile_number}
                color="gray"
              />
              <InfoCard
                label="Disease"
                value={patient.disease_type}
                color="gray"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border dark:border-slate-700/50">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">
                Latest Prediction Details
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {patient.prediction ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard
                  label="Risk Level"
                  value={patient.prediction.risk}
                  color="red"
                />
                <InfoCard
                  label="Probability"
                  value={`${(
                    patient.prediction.predicted_probability * 100
                  ).toFixed(1)}%`}
                  color="blue"
                />
                <InfoCard
                  label="Classification"
                  value={patient.prediction.prediction_class}
                  color="green"
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-lg">
                  No prediction data available for this patient.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border dark:border-slate-700/50 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-600">
            {[
              { id: "followups", label: "Follow Ups", icon: ClipboardList },
              { id: "clinical", label: "Clinical Data", icon: Stethoscope },
              { id: "escalations", label: "Escalations", icon: Flag },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedTab(id)}
                className={`flex-1 px-4 py-3 font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                  selectedTab === id
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-inner"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <CardContent className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {selectedTab === "followups" && (
                  <div className="space-y-6">
                    {patient.follow_ups?.length > 0 ? (
                      patient.follow_ups.map((fup) => (
                        <FollowUpCard
                          key={fup.id}
                          fup={fup}
                          isAssignedUser={isAssignedUser}
                          editingFollowUpId={editingFollowUpId}
                          setEditingFollowUpId={setEditingFollowUpId}
                          followUpEdits={followUpEdits}
                          setFollowUpEdits={setFollowUpEdits}
                          handleChange={handleChange}
                          handleSaveEdit={handleSaveEdit}
                          getFollowUpStatusColorClass={
                            getFollowUpStatusColorClass
                          }
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p className="text-lg">No follow-ups recorded.</p>
                      </div>
                    )}
                  </div>
                )}
                {selectedTab === "clinical" && (
                  <div>
                    {patient.clinical_info ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(patient.clinical_info).map(
                          ([key, value]) => (
                            <InfoCard
                              key={key}
                              label={key.replace(/_/g, " ")}
                              value={value || "N/A"}
                              color="gray"
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No clinical data available.
                      </p>
                    )}
                  </div>
                )}
                {selectedTab === "escalations" && (
                  <div className="space-y-6">
                    {patient.escalations?.length > 0 ? (
                      patient.escalations.map((esc, index) => (
                        <div
                          key={esc.id || index}
                          className="p-4 border rounded-lg shadow-sm bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoCard
                              label="Status"
                              value={esc.status}
                              color="blue"
                            />
                            <InfoCard
                              label="Old Risk"
                              value={esc.old_risk}
                              color="yellow"
                            />
                            <InfoCard
                              label="New Risk"
                              value={esc.new_risk}
                              color="red"
                            />
                            <InfoCard
                              label="Reason"
                              value={esc.rejection_note || "N/A"}
                              color="gray"
                            />
                            <InfoCard
                              label="Last Updated"
                              value={new Date(esc.updated_at).toLocaleString()}
                              color="gray"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p>No escalations found for this patient.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        <AnimatePresence>
          {editingRisk && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">
                    Request Risk Change
                  </h3>
                  <p className="text-red-100 text-sm mt-1">
                    From{" "}
                    <span className="font-bold">
                      {patient.prediction?.risk}
                    </span>{" "}
                    to <span className="font-bold">{newRisk}</span>
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitRiskChange();
                  }}
                  className="p-6 space-y-6"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">
                      New Risk Level
                    </label>
                    <select
                      value={newRisk}
                      onChange={(e) => setNewRisk(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Low">🟢 Low</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="High">🔴 High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={riskChangeDescription}
                      onChange={(e) => setRiskChangeDescription(e.target.value)}
                      rows={4}
                      required
                      placeholder="Provide a detailed clinical justification for this change..."
                      className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-vertical"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      onClick={() => setEditingRisk(false)}
                      variant="outline"
                      className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600"
                    >
                      <X className="h-4 w-4 mr-2" />
                      <span>Cancel</span>
                    </Button>
                    <Button
                      type="submit"
                      disabled={!riskChangeDescription.trim()}
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      <span>Submit Request</span>
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Refactored InfoCard for better consistency and dark mode styling
const InfoCard = ({ label, value, color, trailingItem }) => {
  const colorStyles = {
    purple: "dark:border-purple-500 dark:text-purple-400",
    blue: "dark:border-blue-500 dark:text-blue-400",
    green: "dark:border-green-500 dark:text-green-400",
    red: "dark:border-red-500 dark:text-red-400",
    yellow: "dark:border-yellow-500 dark:text-yellow-400",
    gray: "dark:border-gray-600 dark:text-gray-400",
  };

  const lightColorStyles = {
    purple: "border-purple-200 text-purple-600 bg-purple-50",
    blue: "border-blue-200 text-blue-600 bg-blue-50",
    green: "border-green-200 text-green-600 bg-green-50",
    red: "border-red-200 text-red-600 bg-red-50",
    yellow: "border-yellow-200 text-yellow-600 bg-yellow-50",
    gray: "border-gray-200 text-gray-600 bg-gray-50",
  };

  const darkClass = colorStyles[color] || colorStyles.gray;
  const lightClass = lightColorStyles[color] || lightColorStyles.gray;

  return (
    <div
      className={`p-4 rounded-xl border dark:bg-slate-800 dark:border-transparent dark:border-l-4 ${darkClass} ${lightClass}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium mb-1 capitalize">{label}</div>
          <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {value}
          </div>
        </div>
        {trailingItem && <div className="ml-2">{trailingItem}</div>}
      </div>
    </div>
  );
};

// Extracted FollowUpCard component for clarity
const FollowUpCard = ({
  fup,
  isAssignedUser,
  editingFollowUpId,
  setEditingFollowUpId,
  followUpEdits,
  handleChange,
  handleSaveEdit,
  getFollowUpStatusColorClass,
}) => {
  const isEditing = editingFollowUpId === fup.id;

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative rounded-2xl border-l-4 p-6 shadow-lg ${getFollowUpStatusColorClass(
          fup.status
        )}`}
      >
        <div className="space-y-4">
          {/* Date Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <Input
              type="date"
              value={followUpEdits[fup.id]?.follow_up_date}
              onChange={(e) =>
                handleChange(fup.id, "follow_up_date", e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {/* Type Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={followUpEdits[fup.id]?.follow_up_type}
              onChange={(e) =>
                handleChange(fup.id, "follow_up_type", e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="phone">📞 Phone</option>
              <option value="onsite">🏥 Onsite</option>
              <option value="virtual">💻 Virtual</option>
            </select>
          </div>
          {/* Notes Textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={followUpEdits[fup.id]?.notes}
              onChange={(e) => handleChange(fup.id, "notes", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical"
            />
          </div>
          {/* Status Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={followUpEdits[fup.id]?.status}
              onChange={(e) => handleChange(fup.id, "status", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="pending">⏳ Pending</option>
              <option value="upcoming">📅 Upcoming</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setEditingFollowUpId(null)}
              variant="outline"
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600"
            >
              <X className="h-4 w-4 mr-2" />
              <span>Cancel</span>
            </Button>
            <Button
              onClick={() => handleSaveEdit(fup.id)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              <span>Save</span>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-2xl border-l-4 p-6 shadow-lg ${getFollowUpStatusColorClass(
        fup.status
      )}`}
    >
      {isAssignedUser && fup.status !== "completed" && (
        <Button
          onClick={() => {
            setEditingFollowUpId(fup.id);
            // Pre-fill edits with current values
            handleChange(fup.id, "notes", fup.notes);
            handleChange(fup.id, "status", fup.status);
            handleChange(fup.id, "follow_up_date", fup.follow_up_date);
            handleChange(fup.id, "follow_up_type", fup.follow_up_type);
          }}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-blue-500 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-full"
        >
          <Edit className="h-5 w-5" />
        </Button>
      )}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <CalendarDays className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {fup.follow_up_date}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {fup.follow_up_type === "phone" && (
            <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
          {fup.follow_up_type === "onsite" && (
            <HomeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
          {fup.follow_up_type === "virtual" && (
            <Monitor className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
          <span className="text-gray-700 dark:text-gray-300 capitalize">
            {fup.follow_up_type || "N/A"}
          </span>
        </div>
        <div className="flex items-start space-x-3 pt-2">
          <MessageSquare className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1" />
          <p className="text-gray-700 dark:text-gray-200">
            {fup.notes || "Upcoming"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PatientProfile;
