import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

const PermissionEditor = () => {
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const PERMISSION_GROUPS = {
    "Expenses": ["viewExpenses", "addExpenses", "editExpenses", "deleteExpenses"],
    "Bills": ["viewBills"],
    "Savings": ["viewSavings", "addSavings"],
    "Debts": ["viewDebts"],
    "Analytics": ["viewAnalytics"]
  };

  const fetchMembers = async () => {
    const res = await API.get("/members");
    setMembers(res.data);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const togglePermission = (memberId, key) => {
    setMembers(prev =>
      prev.map(m =>
        m._id === memberId
          ? { ...m, permissions: { ...m.permissions, [key]: !m.permissions[key] } }
          : m
      )
    );
  };

  const savePermissions = async (memberId, permissions) => {
    setSavingId(memberId);
    setSuccessMessage("");

    try {
      await API.put(`/members/${memberId}/permissions`, { permissions });
      setSuccessMessage("✔ Changes saved successfully!");
    } catch {
      setSuccessMessage("❌ Error saving changes.");
    }

    setTimeout(() => {
      setSavingId(null);
    }, 700);

    setTimeout(() => {
      setSuccessMessage("");
    }, 1500);
  };

  const Switch = ({ checked, onChange }) => (
    <label style={switchContainer}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
      <span style={{ ...slider, background: checked ? "#4caf50" : "#ccc" }}>
        <span
          style={{
            ...knob,
            transform: checked ? "translateX(20px)" : "translateX(0px)"
          }}
        />
      </span>
    </label>
  );

  return (
    <div>
      <Navbar />

      {/* GLOBAL SUCCESS MESSAGE */}
      {successMessage && (
        <div style={toast}>{successMessage}</div>
      )}

      <div style={{ padding: 20 }}>
        <h2>Permission Editor</h2>

        {members.map(member => (
          <div
            key={member._id}
            style={{
              ...card,
              borderColor: savingId === member._id ? "#4caf50" : "#ddd",
              transform: savingId === member._id ? "scale(1.02)" : "scale(1)",
              transition: "0.2s ease"
            }}
          >
            <h3>{member.name}</h3>
            <p><b>Role:</b> {member.role}</p>

            {/* PERMISSION GROUPS */}
            {Object.entries(PERMISSION_GROUPS).map(([groupName, keys]) => (
              <div key={groupName} style={groupBox}>
                <h4 style={{ marginBottom: 6 }}>{groupName}</h4>

                <div style={permGrid}>
                  {keys.map(key => (
                    <div
                      key={key}
                      style={{
                        ...permRow,
                        background: member.permissions[key] ? "#e8f5e9" : "#fff",
                        borderColor: member.permissions[key] ? "#4caf50" : "#eee",
                        transition: "0.2s"
                      }}
                    >
                      <span>{key}</span>
                      <Switch
                        checked={member.permissions[key]}
                        onChange={() => togglePermission(member._id, key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => savePermissions(member._id, member.permissions)}
              style={{
                ...saveBtn,
                background: savingId === member._id ? "#aaa" : "#28a745",
                cursor: savingId === member._id ? "not-allowed" : "pointer"
              }}
              disabled={savingId === member._id}
            >
              {savingId === member._id ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------------
// STYLES
// ----------------------

const card = {
  padding: 20,
  border: "2px solid #ddd",
  borderRadius: 12,
  marginBottom: 25,
  background: "#fff"
};

const permGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 10
};

const groupBox = {
  padding: "12px 16px",
  borderRadius: 8,
  background: "#fafafa",
  border: "1px solid #eee",
  marginBottom: 20
};

const permRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  border: "1px solid #eee",
  padding: "10px 12px",
  borderRadius: 6
};

const saveBtn = {
  padding: "10px 14px",
  width: "150px",
  fontSize: 15,
  color: "#fff",
  borderRadius: 6,
  border: "none",
  marginTop: 12
};

// SWITCH (toggle)
const switchContainer = {
  position: "relative",
  width: "45px",
  height: "24px",
  cursor: "pointer"
};

const slider = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  borderRadius: "30px",
  backgroundColor: "#ccc",
  transition: "0.3s"
};

const knob = {
  position: "absolute",
  top: "3px",
  left: "3px",
  width: "18px",
  height: "18px",
  background: "#fff",
  borderRadius: "50%",
  transition: "0.3s"
};

const toast = {
  position: "fixed",
  top: 20,
  right: 20,
  background: "#4caf50",
  padding: "10px 20px",
  borderRadius: 8,
  color: "#fff",
  fontSize: 16,
  zIndex: 999,
  animation: "fade 1.5s forwards"
};

export default PermissionEditor;
