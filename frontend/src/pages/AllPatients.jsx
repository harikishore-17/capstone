import React, { useMemo, useState } from "react";
import { Users, Search, XCircle } from "lucide-react";
import { useGlobalContext } from "../context/GlobalContext";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

/* ─────────── Helpers ─────────── */
const RiskBadge = ({ risk }) => {
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
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-bold border ${getRiskColorClass(
        risk
      )}`}
    >
      {risk || "N/A"}
    </span>
  );
};

const AllPatients = () => {
  const { patients, loading } = useGlobalContext();

  const [riskFilter, setRiskFilter] = useState("");
  const [condFilter, setCondFilter] = useState("");
  const [assignFilter, setAssignFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const riskOptions = useMemo(
    () => [...new Set(patients.map((p) => p.risk).filter(Boolean))],
    [patients]
  );
  const condOptions = useMemo(
    () => [...new Set(patients.map((p) => p.disease_type).filter(Boolean))],
    [patients]
  );
  const assignOptions = useMemo(
    () => [
      ...new Set(
        patients.map((p) => p.assigned_username || p.assignedTo).filter(Boolean)
      ),
    ],
    [patients]
  );

  const filteredPatients = useMemo(() => {
    let filtered = patients;

    if (riskFilter) {
      filtered = filtered.filter((p) => p.risk === riskFilter);
    }
    if (condFilter) {
      filtered = filtered.filter((p) => p.disease_type === condFilter);
    }
    if (assignFilter) {
      filtered = filtered.filter(
        (p) => (p.assigned_username || p.assignedTo) === assignFilter
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [patients, riskFilter, condFilter, assignFilter, searchTerm]);

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text dark:text-white">
              All Patients
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Risks</option>
              {riskOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              value={condFilter}
              onChange={(e) => setCondFilter(e.target.value)}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Conditions</option>
              {condOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={assignFilter}
              onChange={(e) => setAssignFilter(e.target.value)}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Assignees</option>
              {assignOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            {(riskFilter || condFilter || assignFilter || searchTerm) && (
              <Button
                onClick={() => {
                  setRiskFilter("");
                  setCondFilter("");
                  setAssignFilter("");
                  setSearchTerm("");
                }}
                variant="outline"
                className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-700 dark:text-gray-300"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Assigned To
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-4 text-center text-gray-600 dark:text-gray-300"
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                        <span>Loading patients...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-4 text-center text-gray-600 dark:text-gray-300"
                    >
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                      </div>
                      No patients match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <motion.tr
                      key={p.patient_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                        <Link
                          to={`/patient/${p.patient_id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {p.patient_id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        {p.name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        {p.disease_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RiskBadge risk={p.risk} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        {p.assigned_username || p.assignedTo || "—"}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllPatients;
