import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, // For tasks
  Users, // For patients
  PlusCircle, // For add task button
  CheckCircle, // For mark done
  XCircle, // For no tasks/patients
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE FOR THE NEW TASK MODAL ---
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    patient_id: "",
    description: "",
    due_date: new Date().toISOString().split("T")[0],
  });
  const [patientSuggestions, setPatientSuggestions] = useState([]);

  // --- API and User Details ---
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const curr_username = user?.username; // Current user's username
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // --- DATA FETCHING ---
  const fetchData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const [taskRes, patientRes] = await Promise.all([
        fetch(`${BASE_URL}/tasks/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/patients/assigned/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!taskRes.ok || !patientRes.ok) throw new Error("Failed to fetch");

      const tasksData = await taskRes.json();
      const patientsData = await patientRes.json();
      const pendingTasks = tasksData.filter(
        (task) => task.status !== "completed"
      );

      setTasks(pendingTasks);
      setPatients(patientsData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, [token]);
  // --- TASK MANAGEMENT FUNCTIONS ---
  const markTaskDone = async (taskId) => {
    try {
      const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "completed" }),
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        console.error("Failed to update task");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskForm.patient_id || !newTaskForm.description) {
      alert("Please fill out Patient ID and Description.");
      return;
    }

    const payload = {
      ...newTaskForm,
      assigned_to: curr_username, // Assign to current user
    };

    try {
      const res = await fetch(`${BASE_URL}/tasks/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Task creation failed");
      }

      alert("✅ Task created successfully!");
      setIsCreateTaskModalOpen(false);
      setNewTaskForm({
        patient_id: "",
        description: "",
        due_date: new Date().toISOString().split("T")[0],
      });
      fetchData(); // Refresh tasks list
    } catch (err) {
      alert(`❌ ${err.message}`);
      console.error(err);
    }
  };

  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTaskForm((prev) => ({ ...prev, [name]: value }));

    if (name === "patient_id" && value) {
      const matches = patients.filter((p) =>
        p.patient_id.toLowerCase().includes(value.toLowerCase())
      );
      setPatientSuggestions(matches);
    } else {
      setPatientSuggestions([]);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "High":
        return "bg-red-500/20 text-red-700 border-red-500";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500";
      case "Low":
        return "bg-green-500/20 text-green-700 border-green-500";
      default:
        return "bg-indigo-500/20 text-indigo-700 border-indigo-500 dark:bg-indigo-500/30 dark:text-indigo-400 dark:border-indigo-500";
    }
  };

  return (
    <div className="space-y-8">
      {/* Tasks Section */}
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text dark:text-white">
              My Pending Tasks
            </CardTitle>
          </div>
          <Button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            New Task
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                Loading tasks...
              </span>
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {t.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Due: {t.due_date}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => markTaskDone(t.id)}
                    variant="ghost"
                    className="text-green-500 hover:bg-green-500/20 dark:hover:bg-green-500/30 transition-colors"
                    title="Mark as done"
                  >
                    <CheckCircle className="h-6 w-6" />
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                No pending tasks
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You're all caught up!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patients Section */}
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text dark:text-white">
              Assigned Patients
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                Loading patients...
              </span>
            </div>
          ) : patients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Disease
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Risk
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {patients.map((p) => (
                    <motion.tr
                      key={p.patient_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/patient/${p.patient_id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
                        >
                          {p.patient_id || "Unknown"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        {p.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        {p.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        {p.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        {p.mobile_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                          {p.disease_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(
                            p.risk
                          )}`}
                        >
                          {p.risk}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                No patients assigned
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Patients will appear here when assigned to you
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- CREATE TASK MODAL --- */}
      <AnimatePresence>
        {isCreateTaskModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "-100vh", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Create New Task
                </h2>
                <Button
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  &times;
                </Button>
              </div>

              <form onSubmit={handleCreateTaskSubmit} className="p-6 space-y-6">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Patient ID
                  </label>
                  <Input
                    name="patient_id"
                    type="text"
                    placeholder="Enter patient ID..."
                    value={newTaskForm.patient_id}
                    onChange={handleNewTaskChange}
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                  {patientSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-40 overflow-y-auto z-50 mt-1">
                      {patientSuggestions.map((p) => (
                        <div
                          key={p.patient_id}
                          onMouseDown={() => {
                            setNewTaskForm((prev) => ({
                              ...prev,
                              patient_id: p.patient_id,
                            }));
                            setPatientSuggestions([]);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-gray-800 dark:text-gray-200"
                        >
                          <span className="font-medium">{p.patient_id}</span> (
                          {p.name})
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Task Description
                  </label>
                  <Input
                    name="description"
                    type="text"
                    placeholder="Enter task description..."
                    value={newTaskForm.description}
                    onChange={handleNewTaskChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <Input
                    name="due_date"
                    type="date"
                    value={newTaskForm.due_date}
                    onChange={handleNewTaskChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Create Task
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
