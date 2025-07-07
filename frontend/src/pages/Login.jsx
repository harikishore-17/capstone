import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(form.username, form.password);
    if (result.success) {
      if (result.role === "user") navigate("/");
      else if (result.role === "admin") navigate("/admin");
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#f1f3f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "white",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 25 }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: 15,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 14,
            }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: 15,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 14,
            }}
          />
          {error && (
            <div style={{ color: "#dc3545", marginBottom: 15 }}>{error}</div>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              fontWeight: "bold",
              fontSize: 16,
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
