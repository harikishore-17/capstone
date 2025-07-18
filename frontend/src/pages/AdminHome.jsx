import React, { useState } from "react";
import {
  FaUserNurse,
  FaUserInjured,
  FaClipboardList,
  FaExclamationCircle,
  FaUserPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import { useGlobalContext } from "../context/GlobalContext";

const AdminHome = () => {
  const { counts, users, patients } = useGlobalContext();
  const pendingTasks = counts.pendingTasks;
  const escalations = counts.escalations;
  const totalNurses = users.length;
  const totalPatients = patients.length;
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const navigate = useNavigate();

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

  // Register user state
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
    } catch (err) {
      alert("❌ Failed to assign task.");
      console.error(err);
    }
  };

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
    } catch (err) {
      setAddError("❌ Network or server error.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-10">
      {/* ─────────────── METRIC CARDS ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<FaUserNurse />}
          label="Nurses Available"
          value={totalNurses}
          color="bg-blue-100"
          textColor="text-blue-800"
        />
        <MetricCard
          icon={<FaUserInjured />}
          label="Total Patients"
          value={totalPatients}
          color="bg-green-100"
          textColor="text-green-800"
        />
        <MetricCard
          icon={<FaClipboardList />}
          label="Tasks Pending"
          value={pendingTasks}
          color="bg-yellow-100"
          textColor="text-yellow-800"
        />
        <MetricCard
          icon={<FaExclamationCircle />}
          label="Escalation Requests"
          value={escalations}
          color="bg-red-100"
          textColor="text-red-800"
          onClick={() => navigate("/admin/escalations")}
        />
      </div>

      {/* ─────────────── UNASSIGNED PATIENTS TABLE ─────────────── */}
      <div className="bg-white shadow-md p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Unassigned Patients</h2>
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Patient ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Condition</th>
              <th className="p-2">Risk</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {unassignedPatients.map((p) => (
              <tr key={p.patient_id} className="border-t">
                <td className="p-2">{p.patient_id}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.disease_type}</td>
                <td className="p-2 font-semibold text-red-500">
                  {p.risk || "N/A"}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => {
                      setSelectedPatientId(p.patient_id);
                      setAssignModalOpen(true);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─────────────── ASSIGN MODAL ─────────────── */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="absolute top-2 right-4 text-gray-500 hover:text-black text-xl"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">Assign Patient</h2>
            <input
              value={selectedPatientId}
              disabled
              className="w-full border rounded p-2 mb-4 bg-gray-100"
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                value={assignUsername}
                onChange={(e) =>
                  handleUsernameChange(
                    e.target.value,
                    setAssignUsername,
                    setAssignSuggestions
                  )
                }
                className="w-full border rounded p-2"
              />
              {assignSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-40 overflow-y-auto">
                  {assignSuggestions.map((u) => (
                    <li
                      key={u.id}
                      onClick={() => {
                        setAssignUsername(u.username);
                        setAssignSuggestions([]);
                      }}
                      className="p-2 hover:bg-blue-50 cursor-pointer"
                    >
                      {u.username}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={handleAssignSubmit}
              className="bg-green-600 mt-4 w-full text-white py-2 rounded hover:bg-green-700"
            >
              Assign
            </button>
          </div>
        </div>
      )}

      {/* ─────────────── TASK ASSIGNMENT FORM ─────────────── */}
      <div className="bg-white shadow-md p-6 rounded-lg">
        <h2 className="text-lg font-bold mb-4">Assign Task</h2>
        <form className="grid md:grid-cols-2 gap-4" onSubmit={handleTaskSubmit}>
          {/* Patient ID */}
          <div className="relative">
            <label className="block mb-1 text-sm font-semibold">
              Patient ID
            </label>
            <input
              type="text"
              placeholder="Patient ID"
              value={taskForm.patient_id}
              onChange={(e) => {
                const value = e.target.value;
                setTaskForm({ ...taskForm, patient_id: value });
                const matches = patients.filter((p) =>
                  p.patient_id.toLowerCase().includes(value.toLowerCase())
                );
                setTaskSuggestions(matches);
              }}
              className="w-full border rounded p-2"
            />
            {taskSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-40 overflow-y-auto">
                {taskSuggestions.map((p) => (
                  <li
                    key={p.patient_id}
                    onClick={() => {
                      setTaskForm({ ...taskForm, patient_id: p.patient_id });
                      setTaskSuggestions([]);
                    }}
                    className="p-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {p.patient_id}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Username */}
          <div className="relative">
            <label className="block mb-1 text-sm font-semibold">Username</label>
            <input
              type="text"
              placeholder="Assign To (Username)"
              value={taskForm.assigned_to}
              onChange={(e) =>
                handleUsernameChange(
                  e.target.value,
                  (v) => setTaskForm({ ...taskForm, assigned_to: v }),
                  setUserSuggestions
                )
              }
              onBlur={() => setTimeout(() => setUserSuggestions([]), 100)}
              className="w-full border rounded p-2"
            />
            {userSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-40 overflow-y-auto">
                {userSuggestions.map((u) => (
                  <li
                    key={u.id}
                    onMouseDown={() => {
                      setTaskForm({ ...taskForm, assigned_to: u.username });
                      setUserSuggestions([]);
                    }}
                    className="p-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {u.username}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-semibold">
              Task Description
            </label>
            <input
              type="text"
              placeholder="Task Description"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              className="w-full border rounded p-2"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block mb-1 text-sm font-semibold">Due Date</label>
            <input
              type="date"
              value={taskForm.due_date}
              onChange={(e) =>
                setTaskForm({ ...taskForm, due_date: e.target.value })
              }
              className="w-full border rounded p-2"
              placeholder="Due Date"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Assign Task
            </button>
          </div>
        </form>
      </div>

      {/* ─────────────── ADD USER FORM ─────────────── */}
      <div className="bg-white shadow-md p-6 rounded-lg border border-gray-200 max-w-xl">
        <div className="flex items-center mb-4 space-x-2">
          <FaUserPlus className="text-blue-600 text-xl" />
          <h2 className="text-lg font-bold">Add New User</h2>
        </div>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <input
            name="username"
            placeholder="Username"
            className="w-full border rounded p-2"
            value={addForm.username}
            onChange={handleAddChange}
            required
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            className="w-full border rounded p-2"
            value={addForm.email}
            onChange={handleAddChange}
            required
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            className="w-full border rounded p-2"
            value={addForm.password}
            onChange={handleAddChange}
            required
          />
          <select
            name="role"
            value={addForm.role}
            onChange={handleAddChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Add User
          </button>
          {addError && <p className="text-red-600">{addError}</p>}
          {addSuccess && <p className="text-green-600">{addSuccess}</p>}
        </form>
      </div>
    </div>
  );
};

export default AdminHome;
