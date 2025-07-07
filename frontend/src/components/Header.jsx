import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header
      style={{
        height: 70,
        backgroundColor: "#004085",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
        fontSize: 20,
        fontWeight: "600",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      <div>Readmission Predictor App</div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ marginRight: 15, fontSize: 16 }}>
          Welcome, {user?.name}
        </span>
        <button
          onClick={logout}
          style={{
            backgroundColor: "#ffc107",
            border: "none",
            borderRadius: 4,
            color: "#212529",
            fontWeight: "500",
            padding: "4px 10px",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#e0a800")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#ffc107")
          }
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
