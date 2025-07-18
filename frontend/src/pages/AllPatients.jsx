import React, { useMemo, useState } from "react";
import { FaUserMd, FaFilter } from "react-icons/fa";
import { useGlobalContext } from "../context/GlobalContext";
import { Link } from "react-router-dom";

/* ─────────── Helpers ─────────── */
const RiskBadge = ({ risk }) => {
  const styles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-2 py-1 rounded text-sm font-medium ${styles[risk]}`}>
      {risk || "—"}
    </span>
  );
};

const AllPatients = () => {
  const { patients, loading } = useGlobalContext();

  const [riskFilter, setRiskFilter] = useState("");
  const [condFilter, setCondFilter] = useState("");
  const [assignFilter, setAssignFilter] = useState("");

  const riskOptions = useMemo(
    () => [...new Set(patients.map((p) => p.risk).filter(Boolean))],
    [patients]
  );
  const condOptions = useMemo(
    () => [...new Set(patients.map((p) => p.disease_type))],
    [patients]
  );
  const assignOptions = useMemo(
    () => [
      ...new Set(patients.map((p) => p.assigned_username || p.assignedTo)),
    ],
    [patients]
  );

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const riskOK = riskFilter ? p.risk === riskFilter : true;
      const condOK = condFilter ? p.disease_type === condFilter : true;
      const assignOK = assignFilter
        ? (p.assigned_username || p.assignedTo) === assignFilter
        : true;
      return riskOK && condOK && assignOK;
    });
  }, [patients, riskFilter, condFilter, assignFilter]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FaUserMd className="text-blue-600 text-xl" />
          <h2 className="text-xl font-bold">All Patients</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-md mb-4 flex flex-wrap gap-4 items-end">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          <span className="font-medium">Filters:</span>
        </div>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          <option value="">All Risks</option>
          {riskOptions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        <select
          value={condFilter}
          onChange={(e) => setCondFilter(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          <option value="">All Conditions</option>
          {condOptions.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={assignFilter}
          onChange={(e) => setAssignFilter(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          <option value="">All Assignees</option>
          {assignOptions.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>

        {(riskFilter || condFilter || assignFilter) && (
          <button
            onClick={() => {
              setRiskFilter("");
              setCondFilter("");
              setAssignFilter("");
            }}
            className="text-blue-600 text-sm hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left p-3">Patient ID</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Condition</th>
              <th className="text-left p-3">Risk</th>
              <th className="text-left p-3">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Loading…
                </td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No patients match the selected filters.
                </td>
              </tr>
            ) : (
              filteredPatients.map((p) => (
                <tr
                  key={p.patient_id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 text-blue-600 hover:underline">
                    <Link to={`/patient/${p.patient_id}`}>{p.patient_id}</Link>
                  </td>
                  <td className="p-3">{p.name || "—"}</td>
                  <td className="p-3">{p.disease_type}</td>
                  <td className="p-3">
                    <RiskBadge risk={p.risk} />
                  </td>
                  <td className="p-3">
                    {p.assigned_to || p.assigned_username || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllPatients;
