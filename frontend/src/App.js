import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { GlobalProvider } from "./context/GlobalContext";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import PatientProfile from "./pages/PatientProfile";
import AdminDashboard from "./pages/AdminDashboard";
import ChangePassword from "./pages/ChangePassword";

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  if (user.must_change_password) {
    return (
      <Routes>
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="*" element={<Navigate to="/change-password" replace />} />
      </Routes>
    );
  }
  return (
    <Routes>
      {/* If a logged-in user tries to visit /login, redirect them to their dashboard. */}
      <Route path="/login" element={<Navigate to="/" replace />} />

      {/* The main "/" path redirects to the correct dashboard based on role. */}
      <Route
        path="/"
        element={user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
      />

      {/* Specific route for the admin dashboard. */}
      <Route
        path="/admin"
        element={
          user.role === "admin" ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route path="/patient/:patientId" element={<PatientProfile />} />

      {/* The change-password route should not be accessible if not required. */}
      <Route path="/change-password" element={<Navigate to="/" replace />} />

      {/* A catch-all route that redirects any unknown URL to the user's main dashboard. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <GlobalProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </GlobalProvider>
    </AuthProvider>
  );
}

export default App;
