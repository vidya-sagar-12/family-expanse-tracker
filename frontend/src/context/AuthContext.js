import React, { createContext, useState, useEffect } from "react";
import API from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  // Load user on app start
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedPermissions = localStorage.getItem("permissions");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedPermissions) setPermissions(JSON.parse(savedPermissions));

    setTimeout(() => setLoading(false), 300);
  }, []);

  // Login function
  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("permissions", JSON.stringify(res.data.user.permissions));

    setUser(res.data.user);
    setPermissions(res.data.user.permissions);
  };

  // Register function
  const register = async (name, email, password, familyName) => {
    const res = await API.post("/auth/register", {
      name,
      email,
      password,
      familyName
    });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("permissions", JSON.stringify(res.data.user.permissions));

    setUser(res.data.user);
    setPermissions(res.data.user.permissions);
  };

  // Logout function
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setPermissions({});
  };

  return (
    <AuthContext.Provider value={{ user, permissions, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
