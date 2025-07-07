import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Home from "./Home";
import PredictionForm from "./PredictionForm";
import FollowUps from "./FollowUps";

const UserDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState("home");

  const renderContent = () => {
    switch (selectedMenu) {
      case "home":
        return <Home />;
      case "followups":
        return <FollowUps />;
      case "prediction":
        return <PredictionForm />;
      default:
        return <Home />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />
      <div style={{ display: "flex", flex: 1, backgroundColor: "#e9ecef" }}>
        <Sidebar selected={selectedMenu} onSelect={setSelectedMenu} />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            backgroundColor: "#f8f9fa",
            borderRadius: 8,
            margin: 20,
            boxShadow: "0 2px 12px rgb(0 0 0 / 0.1)",
          }}
        >
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
