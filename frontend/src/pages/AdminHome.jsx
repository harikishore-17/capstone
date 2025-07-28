import React, { useEffect, useState } from "react";
import {
  Users,
  ClipboardList,
  AlertTriangle,
  UserPlus,
  XCircle,
  Stethoscope,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useGlobalContext } from "../context/GlobalContext";
import EscalationsModal from "../components/EscalationsModal";
import { motion, AnimatePresence } from "framer-motion";

const AdminHome = () => {
  const { counts, users, patients, refreshData } = useGlobalContext();
  const pendingTasks = counts.pendingTasks;
  const escalations = counts.escalations;
  const totalNurses = users.length;
  const totalPatients = patients.length;
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const [isEscalationsModalOpen, setIsEscalationsModalOpen] = useState(false);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [assignUsername, setAssignUsername] = useState("");
  const [assignSuggestions, setAssignSuggestions] = useState([]);

  const [taskForm, setTaskForm] = useState({
    patient_id: "",
    assigned_to: "",
    description: "",
    due_date: new Date().toISOString().split("T")[0],
  });

  const [taskSuggestions, setTaskSuggestions] = useState([]);
  const [userSuggestions, setUserSuggestions] = useState([]);

  const [addForm, setAddForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const unassignedPatients = patients.filter((p) => !p.assigned_user_id);

  const handleUsernameChange = (value, setter, suggestionsSetter) => {
    setter(value);
    const matches = users.filter((u) =>
      u.username.toLowerCase().includes(value.toLowerCase())
    );
    suggestionsSetter(matches);
  };

  const handleAssignSubmit = async () => {
    try {
      const res = await fetch(`${BASE_URL}/patients/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          username: assignUsername,
        }),
      });
      if (!res.ok) throw new Error("Assignment failed");
      alert("✅ Patient assigned successfully");
      setAssignModalOpen(false);
      setSelectedPatientId("");
      setAssignUsername("");
      refreshData();
    } catch (err) {
      alert("❌ Failed to assign patient.");
      console.error(err);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/tasks/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskForm),
      });
      if (!res.ok) throw new Error("Task creation failed");
      alert("✅ Task assigned successfully");
      setTaskForm({
        patient_id: "",
        assigned_to: "",
        description: "",
        due_date: new Date().toISOString().split("T")[0],
      });
      refreshData();
    } catch (err) {
      alert("❌ Failed to assign task.");
      console.error(err);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setAddError(data.detail || "Failed to add user.");
        return;
      }

      setAddSuccess("✅ User added successfully.");
      setAddForm({ username: "", email: "", password: "", role: "" });
      refreshData();
    } catch (err) {
      setAddError("❌ Network or server error.");
      console.error(err);
    }
  };

  const getRiskColorClass = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700";
      case "low":
        return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700";
      default:
        return "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* ─────────────── METRIC CARDS ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Nurses Available"
          value={totalNurses}
          icon={Stethoscope}
          color="blue"
        />
        <MetricCard
          title="Total Patients"
          value={totalPatients}
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Tasks Pending"
          value={pendingTasks}
          icon={ClipboardList}
          color="yellow"
        />
        <MetricCard
          title="Escalations"
          value={escalations}
          icon={AlertTriangle}
          color="red"
          onClick={() => setIsEscalationsModalOpen(true)}
          isClickable={true}
        />
      </div>

      {/* ─────────────── UNASSIGNED PATIENTS TABLE ─────────────── */}
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            {/* CORRECTED GRADIENT TEXT */}
            <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              Unassigned Patients
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {unassignedPatients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Patient ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {unassignedPatients.map((p) => (
                    <motion.tr
                      key={p.patient_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                        {p.patient_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                          {p.disease_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColorClass(
                            p.risk
                          )}`}
                        >
                          {p.risk || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          onClick={() => {
                            setSelectedPatientId(p.patient_id);
                            setAssignModalOpen(true);
                          }}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                        >
                          Assign
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                No unassigned patients
              </p>
              <p className="text-sm">All patients are currently assigned.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─────────────── ASSIGN MODAL ─────────────── */}
      <AnimatePresence>
        {assignModalOpen && (
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
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Assign Patient</h2>
                <Button
                  onClick={() => setAssignModalOpen(false)}
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-1 h-auto rounded-full"
                >
                  <XCircle size={20} />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Patient ID
                  </label>
                  <Input
                    value={selectedPatientId}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border-gray-300 bg-gray-200 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Assign to Nurse
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter username..."
                    value={assignUsername}
                    onChange={(e) =>
                      handleUsernameChange(
                        e.target.value,
                        setAssignUsername,
                        setAssignSuggestions
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 dark:focus:ring-blue-500"
                  />
                  {assignSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-xl shadow-lg max-h-40 overflow-y-auto z-50 mt-1">
                      {assignSuggestions.map((u) => (
                        <div
                          key={u.id}
                          onMouseDown={() => {
                            setAssignUsername(u.username);
                            setAssignSuggestions([]);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-gray-800 dark:text-gray-200"
                        >
                          <span className="font-medium">{u.username}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleAssignSubmit}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg"
                >
                  Assign Patient
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────── TASK & USER FORMS IN A GRID ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ASSIGN NEW TASK */}
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              {/* CORRECTED GRADIENT TEXT */}
              <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                Assign New Task
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleTaskSubmit}>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Patient ID
                </label>
                <Input
                  type="text"
                  placeholder="Enter patient ID..."
                  value={taskForm.patient_id}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTaskForm({ ...taskForm, patient_id: value });
                    const matches = patients.filter((p) =>
                      p.patient_id.toLowerCase().includes(value.toLowerCase())
                    );
                    setTaskSuggestions(matches);
                  }}
                  onBlur={() => setTimeout(() => setTaskSuggestions([]), 100)}
                  className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {taskSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-xl shadow-lg max-h-40 overflow-y-auto z-50 mt-1">
                    {taskSuggestions.map((p) => (
                      <div
                        key={p.patient_id}
                        onMouseDown={() => {
                          setTaskForm((prev) => ({
                            ...prev,
                            patient_id: p.patient_id,
                            assigned_to: p.assigned_username || "",
                          }));
                          setTaskSuggestions([]);
                          setUserSuggestions([]);
                        }}
                        className="px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-800 dark:text-gray-200"
                      >
                        <span className="font-medium">{p.patient_id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Assign To
                </label>
                <Input
                  type="text"
                  placeholder="Enter username..."
                  value={taskForm.assigned_to}
                  onChange={(e) =>
                    handleUsernameChange(
                      e.target.value,
                      (v) => setTaskForm({ ...taskForm, assigned_to: v }),
                      setUserSuggestions
                    )
                  }
                  onBlur={() => setTimeout(() => setUserSuggestions([]), 100)}
                  className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {userSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-xl shadow-lg max-h-40 overflow-y-auto z-50 mt-1">
                    {userSuggestions.map((u) => (
                      <div
                        key={u.id}
                        onMouseDown={() => {
                          setTaskForm({ ...taskForm, assigned_to: u.username });
                          setUserSuggestions([]);
                        }}
                        className="px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-800 dark:text-gray-200"
                      >
                        <span className="font-medium">{u.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Task Description
                </label>
                <Input
                  type="text"
                  placeholder="Enter task description..."
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, due_date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
                >
                  Assign Task
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ADD NEW USER */}
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              {/* CORRECTED GRADIENT TEXT */}
              <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">
                Add New User
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Username
                </label>
                <Input
                  name="username"
                  placeholder="Enter username..."
                  className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={addForm.username}
                  onChange={handleAddChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Email
                </label>
                <Input
                  name="email"
                  placeholder="Enter email..."
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={addForm.email}
                  onChange={handleAddChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Password
                </label>
                <Input
                  name="password"
                  placeholder="Enter password..."
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={addForm.password}
                  onChange={handleAddChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={addForm.role}
                  onChange={handleAddChange}
                  className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="user">User (Nurse)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg"
                >
                  Add User
                </Button>
              </div>

              {addError && (
                <div className="bg-red-500/20 border border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                  {addError}
                </div>
              )}
              {addSuccess && (
                <div className="bg-green-500/20 border border-green-500 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                  {addSuccess}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <EscalationsModal
        isOpen={isEscalationsModalOpen}
        onClose={() => setIsEscalationsModalOpen(false)}
        token={token}
        BASE_URL={BASE_URL}
      />
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  icon: Icon,
  color,
  onClick,
  isClickable,
}) => {
  const colorStyles = {
    blue: {
      // REMOVED dark mode background/border/text classes
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      iconBg: "bg-green-500",
      text: "text-green-600",
      border: "border-green-200",
    },
    yellow: {
      bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      iconBg: "bg-yellow-500",
      text: "text-yellow-600",
      border: "border-yellow-200",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-red-100",
      iconBg: "bg-red-500",
      text: "text-red-600",
      border: "border-red-200",
    },
  };

  const styles = colorStyles[color];

  return (
    <motion.div
      whileHover={isClickable ? { scale: 1.03, y: -5 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`${styles.bg} ${styles.border} rounded-2xl p-6 border ${
        isClickable ? "cursor-pointer" : ""
      } shadow-lg shadow-black/5`}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center shadow-lg shadow-black/10`}
        >
          <Icon className="text-white" size={24} />
        </div>
        <div>
          <p className={`text-sm font-medium ${styles.text}`}>{title}</p>
          {/* MODIFIED: Changed text to black and removed dark mode variant */}
          <p className="text-3xl font-bold text-black">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminHome;
