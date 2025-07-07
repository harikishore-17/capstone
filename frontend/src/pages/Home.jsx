import { Link } from "react-router-dom";

const dummyTasks = [
  { id: 1, task: "Check patient A blood test", due: "2025-07-01" },
  { id: 2, task: "Schedule follow up for patient B", due: "2025-07-02" },
];

const dummyPatients = [
  {
    id: "p1",
    name: "John Doe",
    age: 60,
    gender: "Male",
    phone: "123-456-7890",
    disease: "Diabetes",
    risk: "High",
  },
  {
    id: "p2",
    name: "Jane Smith",
    age: 55,
    gender: "Female",
    phone: "987-654-3210",
    disease: "Heart Failure",
    risk: "Medium",
  },
];

const Home = () => {
  return (
    <div
      style={{
        padding: 30,
        backgroundColor: "#f1f3f5",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginBottom: 20, color: "#212529" }}>Tasks</h2>
      <ul
        style={{
          marginBottom: 40,
          backgroundColor: "white",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
          maxWidth: 600,
        }}
      >
        {dummyTasks.map((t) => (
          <li
            key={t.id}
            style={{
              padding: "10px 0",
              borderBottom: "1px solid #dee2e6",
              fontSize: 16,
              color: "#495057",
            }}
          >
            {t.task} - <strong>Due: {t.due}</strong>
          </li>
        ))}
      </ul>

      <h2 style={{ marginBottom: 20, color: "#212529" }}>Assigned Patients</h2>
      <div
        style={{
          overflowX: "auto",
          backgroundColor: "white",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
          maxWidth: "100%",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 700,
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
            {dummyPatients.map((p) => (
              <tr
                key={p.id}
                style={{
                  borderBottom: "1px solid #dee2e6",
                  cursor: "pointer",
                }}
              >
                <td style={{ padding: "12px 15px" }}>
                  <Link
                    to={`/patient/${p.id}`}
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    {p.name}
                  </Link>
                </td>
                <td style={{ padding: "12px 15px" }}>{p.age}</td>
                <td style={{ padding: "12px 15px" }}>{p.gender}</td>
                <td style={{ padding: "12px 15px" }}>{p.phone}</td>
                <td style={{ padding: "12px 15px" }}>{p.disease}</td>
                <td style={{ padding: "12px 15px" }}>{p.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
