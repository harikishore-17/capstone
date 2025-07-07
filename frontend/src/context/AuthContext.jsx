import React, { createContext, useState, useEffect } from "react";

// Mock user DB
const usersDB = [
  {
    username: "user1",
    password: "password1",
    role: "user",
    name: "Hari Kishore",
  },
  {
    username: "admin1",
    password: "adminpass",
    role: "admin",
    name: "Admin User",
  },
];

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Try load user from localStorage for persistence
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Save user in localStorage on change for persistence
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = (username, password) => {
    // check from mock DB
    const foundUser = usersDB.find(
      (u) => u.username === username && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      return { success: true, role: foundUser.role };
    }
    return { success: false, message: "Invalid username or password" };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
