import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);
      if (!BASE_URL) {
        console.error("API Base URL is not defined. Check your .env file.");
        console.log("API Base URL is not defined. Check your .env file.");
        return { success: false, message: "API Base URL is not defined." };
      }
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        return { success: false, message: "Invalid credentials" };
      }

      const data = await response.json();

      // Decode token manually or store full user profile from another endpoint
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));

      const userData = {
        username,
        token: data.access_token,
        role: payload.role,
        id: payload.sub,
        exp: payload.exp,
        must_change_password: payload.must_change_password,
      };

      setUser(userData);
      const redirectPath = userData.must_change_password
        ? "/change-password"
        : userData.role === "admin"
        ? "/admin"
        : "/";
      return { success: true, role: userData.role, redirectPath };
    } catch (err) {
      return { success: false, message: "Server error. Try again later." };
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
