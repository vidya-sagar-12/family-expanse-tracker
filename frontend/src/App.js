import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthContext } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import ChildDashboard from "./pages/ChildDashboard";
import PermissionEditor from "./pages/PermissionEditor";
import Expenses from "./pages/Expenses"
import Bills from "./pages/Bills"
import Savings from "./pages/Savings"
import Debts from "./pages/Debts"
import Analytics from "./pages/Analytics";
import Members from "./pages/Members";


const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/member"
          element={
            <ProtectedRoute roles={["parent"]}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/child"
          element={
            <ProtectedRoute roles={["child"]}>
              <ChildDashboard />
            </ProtectedRoute>
          }
        />

        {/* Permission Editor (Admin Only) */}
        <Route
          path="/permissions"
          element={
            <ProtectedRoute roles={["admin"]}>
              <PermissionEditor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <Bills />
            </ProtectedRoute>
          }
        />

        <Route
          path="/savings"
          element={
            <ProtectedRoute>
              <Savings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/debts"
          element={
            <ProtectedRoute>
              <Debts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />
        {/* Redirect root to dashboard based on role */}
        <Route
          path="/"
          element={
            user ? (
              user.role === "admin" ? (
                <Navigate to="/admin" />
              ) : user.role === "parent" ? (
                <Navigate to="/member" />
              ) : (
                <Navigate to="/child" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
