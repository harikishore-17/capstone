import React, { useState } from "react";
import Header from "../components/Header";
import AdminHome from "./AdminHome";
import AllPatients from "./AllPatients";
import UserControls from "./UserControls";

const AdminDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState("home");

  const renderContent = () => {
    switch (selectedMenu) {
      case "home":
        return <AdminHome />;
      case "patients":
        return <AllPatients />;
      case "users":
        return <UserControls />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white p-4 shadow-md">
          <h2 className="text-lg font-bold mb-6 text-blue-800">Admin Panel</h2>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setSelectedMenu("home")}
                className={`text-left w-full ${
                  selectedMenu === "home"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMenu("patients")}
                className={`text-left w-full ${
                  selectedMenu === "patients"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                All Patients
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedMenu("users")}
                className={`text-left w-full ${
                  selectedMenu === "users"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                User Controls
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
