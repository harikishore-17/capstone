import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("user"))["token"];
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchData = async () => {
    try {
      const [taskRes, patientRes] = await Promise.all([
        fetch(`${BASE_URL}/tasks/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${BASE_URL}/patients/assigned/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!taskRes.ok || !patientRes.ok) {
        throw new Error("Failed to fetch");
      }

      const tasksData = await taskRes.json();
      const patientsData = await patientRes.json();

      // Only show pending/incomplete tasks
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
  }, [BASE_URL, token]);

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

  return (
    <div
      style={{
        padding: 30,
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: 20, color: "#343a40" }}>📋 My Tasks</h2>
      <div
        style={{
          marginBottom: 40,
          backgroundColor: "white",
          padding: 20,
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          maxWidth: 700,
        }}
      >
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length > 0 ? (
          <ul style={{ padding: 0, listStyle: "none" }}>
            {tasks.map((t) => (
              <li
                key={t.id}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #e9ecef",
                  fontSize: 15,
                  color: "#495057",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  🩺 {t.description} — <strong>Due: {t.due_date}</strong>
                </span>
                <FaCheckCircle
                  onClick={() => markTaskDone(t.id)}
                  title="Mark as done"
                  style={{
                    color: "#6c757d", // neutral gray
                    cursor: "pointer",
                    fontSize: 18,
                    marginLeft: 10,
                    transition: "color 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#28a745")}
                  onMouseLeave={(e) => (e.target.style.color = "#6c757d")}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending tasks.</p>
        )}
      </div>

      <h2 style={{ marginBottom: 20, color: "#343a40" }}>
        👨‍⚕️ Assigned Patients
      </h2>
      <div
        style={{
          overflowX: "auto",
          backgroundColor: "white",
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        {loading ? (
          <p style={{ padding: 20 }}>Loading patients...</p>
        ) : patients.length > 0 ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 750,
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "12px 15px" }}>Name</th>
                <th style={{ padding: "12px 15px" }}>Age</th>
                <th style={{ padding: "12px 15px" }}>Gender</th>
                <th style={{ padding: "12px 15px" }}>Phone</th>
                <th style={{ padding: "12px 15px" }}>Disease</th>
                <th style={{ padding: "12px 15px" }}>Risk</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr
                  key={p.patient_id}
                  style={{
                    borderBottom: "1px solid #e9ecef",
                    transition: "background 0.2s",
                    cursor: "pointer",
                  }}
                >
                  <td style={{ padding: "12px 15px" }}>
                    <Link
                      to={`/patient/${p.patient_id}`}
                      style={{
                        color: "#007bff",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      {p.name || "Unknown"}
                    </Link>
                  </td>
                  <td style={{ padding: "12px 15px" }}>{p.age}</td>
                  <td style={{ padding: "12px 15px" }}>{p.gender}</td>
                  <td style={{ padding: "12px 15px" }}>
                    {p.mobile_number || "-"}
                  </td>
                  <td style={{ padding: "12px 15px" }}>{p.disease_type}</td>
                  <td style={{ padding: "12px 15px", color: "#dc3545" }}>
                    {p.risk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ padding: 20 }}>No patients assigned.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
