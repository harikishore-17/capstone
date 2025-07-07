import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import PatientProfile from "./pages/PatientProfile";
import AdminDashboard from "./pages/AdminDashboard"; // later

// PrivateRoute component for protecting dashboard routes
const PrivateRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" />;
  }
  // Optionally restrict by role
  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute role="user">
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/:patientId"
            element={
              <PrivateRoute role="user">
                <PatientProfile />
              </PrivateRoute>
            }
          />

          {/* Add AdminDashboard route later */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
