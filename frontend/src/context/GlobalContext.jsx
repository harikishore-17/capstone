import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

/* ---------- Context ---------- */
const GlobalContext = createContext();

/* ---------- Provider ---------- */
export const GlobalProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]); // non‑admin users
  const [counts, setCounts] = useState({
    pendingTasks: 0,
    escalations: 0,
  });
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  /* Fetch everything from /patients/all */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/patients/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();

      /* backend delivers:
         {
           patients_details: [...] ,
           user_details:     [...] ,
           pending_tasks_count: n ,
           escalations_count:   n
         }
      */
      setLoading(false);
      setPatients(data.patients_details);
      setUsers(data.user_details);
      setCounts({
        pendingTasks: data.pending_tasks_count,
        escalations: data.escalations_count,
      });
    } catch (err) {
      console.error("GlobalContext fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, BASE_URL]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* Group patients by disease (lower‑case keys) */
  const groupedPatients = useMemo(() => {
    const bucket = { pneumonia: [], "heart failure": [], diabetes: [] };
    patients.forEach((p) => {
      const key = p.disease_type?.toLowerCase().trim();
      if (bucket[key]) bucket[key].push(p);
    });
    return bucket;
  }, [patients]);

  /* Provide everything */
  const value = {
    loading,
    patients,
    groupedPatients,
    users, // [{ id, username }]
    counts, // { pendingTasks, escalations }
    patientIds: patients.map((p) => p.patient_id),
    userIds: users.map((u) => u.id),
    refreshData: fetchAll, // Expose fetchAll as refreshData
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

/* ---------- Hook ---------- */
export const useGlobalContext = () => useContext(GlobalContext);
