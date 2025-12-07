import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = () => {
  const { permissions } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await API.get("/analytics/summary");
      setSummary(res.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err.response?.data || err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const card = (title, value, color) => (
    <div style={{ ...cardStyle, borderLeft: `6px solid ${color}` }}>
      <h4>{title}</h4>
      <h2 style={{ color }}>{value}</h2>
    </div>
  );

  return (
    <div>
      <Navbar />

      <div style={container}>
        <h2>Admin Dashboard</h2>

        <button style={refreshBtn} onClick={fetchSummary}>
          Refresh
        </button>

        {loading || !summary ? (
          <p>Loading...</p>
        ) : (
          <>
            <div style={grid3}>
              {card("Total Expenses (Month)", `₹${summary.totalMonthlyExpenses}`, "#00796b")}
              {card("Total Savings (Month)", `₹${summary.totalMonthlySavings}`, "#26a69a")}
              {card("Pending Debt", `₹${summary.debtSummary.pendingDebt}`, "#c62828")}
            </div>

            <div style={grid2}>
              <div style={listCard}>
                <h3>Upcoming Bills</h3>

                {summary.upcomingBills?.length === 0 ? (
                  <p>No upcoming bills</p>
                ) : (
                  summary.upcomingBills.map((b) => (
                    <div key={b._id} style={billItem}>
                      <p><b>{b.category}</b></p>
                      <p>₹{b.amount}</p>
                      <small>Due: {new Date(b.dueDate).toLocaleDateString()}</small>
                    </div>
                  ))
                )}
              </div>

              <div style={listCard}>
                <h3>Member Totals</h3>

                {Object.entries(summary.memberTotals).map(([id, m]) => (
                  <div key={id} style={memberItem}>
                    <b>{m.name}</b>: ₹{m.amount}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ---------------- STYLES ------------------

const container = {
  padding: 20,
  maxWidth: 1100,
  margin: "auto",
};

const grid3 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 20,
  marginTop: 20,
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 20,
  marginTop: 30,
};

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  transition: "transform 0.2s",
};

const refreshBtn = {
  padding: "8px 14px",
  background: "#009688",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  marginTop: 10,
};

const listCard = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};

const billItem = {
  background: "#e0f2f1",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
};

const memberItem = {
  padding: 10,
  borderBottom: "1px solid #eee",
};

const responsive = {
  "@media(max-width: 600px)": {
    container: { padding: 10 },
    cardStyle: { padding: 15 },
  },
};

export default AdminDashboard;
