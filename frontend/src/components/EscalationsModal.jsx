import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  ArrowLeft,
  AlertTriangle,
  Info,
  XCircle,
  ClipboardList,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "../context/GlobalContext";

const EscalationsModal = ({ isOpen, onClose, token, BASE_URL }) => {
  const [escalations, setEscalations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { refreshData } = useGlobalContext();

  // State for handling the rejection note
  const [rejectingEscalation, setRejectingEscalation] = useState(null);
  const [rejectionNote, setRejectionNote] = useState("");

  const fetchEscalations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/escalations/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch escalations.");
      const data = await res.json();
      setEscalations(data.escalations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEscalations();
    }
  }, [isOpen, token, BASE_URL]);

  const handleUpdateStatus = async (escalationId, status, note = null) => {
    try {
      const payload = { status };
      if (note) {
        payload.rejection_note = note;
      }

      const res = await fetch(`${BASE_URL}/escalations/${escalationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to ${status} escalation.`);

      // Refresh the list after update
      fetchEscalations();
      refreshData(); // Refresh global context data
      // Close the rejection modal if it's open
      setRejectingEscalation(null);
      setRejectionNote("");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionNote.trim()) {
      alert("Rejection note cannot be empty.");
      return;
    }
    handleUpdateStatus(rejectingEscalation.id, "rejected", rejectionNote);
  };

  const getRiskColorClass = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-700 border-red-500";
      case "medium":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500";
      case "low":
        return "bg-green-500/20 text-green-700 border-green-500";
      default:
        return "bg-indigo-500/20 text-indigo-700 border-indigo-500 dark:bg-indigo-500/30 dark:text-indigo-400 dark:border-indigo-500";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: "-100vh", opacity: 0 }}
          animate={{ y: "0", opacity: 1 }}
          exit={{ y: "100vh", opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col border border-gray-200 dark:border-gray-700"
        >
          {/* Modal Header */}
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-500 to-orange-500">
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-xl font-bold text-white">
              Review Escalations
            </CardTitle>
            <div className="w-8"></div> {/* Spacer */}
          </CardHeader>

          {/* Modal Body */}
          <CardContent className="p-6 overflow-y-auto flex-grow">
            {isLoading && (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <span className="text-lg">Loading escalations...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="text-center py-8 text-red-500 dark:text-red-400">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg">Error: {error}</p>
              </div>
            )}
            {!isLoading && !error && (
              <div className="space-y-4">
                {escalations.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="font-medium">No pending escalations.</p>
                    <p className="text-sm">All clear!</p>
                  </div>
                ) : (
                  escalations.map((esc) => (
                    <motion.div
                      key={esc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
                    >
                      {/* Details Section */}
                      <div className="flex-grow space-y-1">
                        <p className="font-bold text-gray-900 dark:text-gray-100 flex items-center">
                          <Info className="h-4 w-4 mr-2 text-blue-500" />
                          Patient ID:
                          <Link
                            to={`/patient/${esc.patient_id}`}
                            className="text-blue-600 hover:underline ml-2 font-semibold"
                          >
                            {esc.patient_id}
                          </Link>
                        </p>

                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                          <span className="font-semibold">Risk Change:</span>
                          <span
                            className={`font-medium ml-2 mr-1 px-2 py-0.5 rounded-full border ${getRiskColorClass(
                              esc.old_risk
                            )}`}
                          >
                            {esc.old_risk}
                          </span>
                          →
                          <span
                            className={`font-medium ml-1 px-2 py-0.5 rounded-full border ${getRiskColorClass(
                              esc.new_risk
                            )}`}
                          >
                            {esc.new_risk}
                          </span>
                        </p>

                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                          <ClipboardList className="h-4 w-4 mr-2 mt-1 text-purple-500" />
                          <span className="font-semibold">Details:</span>{" "}
                          {esc.description}
                        </p>
                      </div>

                      {/* Action Buttons Section */}
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <Button
                          onClick={() => handleUpdateStatus(esc.id, "accepted")}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                        >
                          <Check className="h-4 w-4 mr-2" /> Accept
                        </Button>
                        <Button
                          onClick={() => setRejectingEscalation(esc)}
                          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                          variant="destructive"
                        >
                          <X className="h-4 w-4 mr-2" /> Reject
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </motion.div>

        {/* Rejection Note Sub-Modal */}
        <AnimatePresence>
          {rejectingEscalation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-60"
            >
              <motion.form
                onSubmit={handleRejectSubmit}
                initial={{ y: "-100vh", opacity: 0 }}
                animate={{ y: "0", opacity: 1 }}
                exit={{ y: "100vh", opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md space-y-6 shadow-2xl border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Reject Escalation
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Please provide a reason for rejecting the escalation for
                  patient:
                  <span className="font-semibold text-blue-600 ml-1">
                    {rejectingEscalation.patient_id}
                  </span>
                </p>
                <textarea
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="Enter rejection note..."
                  className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-vertical"
                  required
                ></textarea>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    onClick={() => setRejectingEscalation(null)}
                    variant="outline"
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    Submit
                  </Button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default EscalationsModal;
