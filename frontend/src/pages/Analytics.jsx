import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c", "#d0ed57", "#8dd1e1"];

const Analytics = () => {
  const { permissions } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const fetchSummary = async (m) => {
    setLoading(true);
    try {
      const res = await API.get(`/analytics/summary?month=${m}`);
      setSummary(res.data);
    } catch (err) {
      console.error("Analytics fetch error:", err?.response?.data || err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissions.viewAnalytics) fetchSummary(month);
    // eslint-disable-next-line
  }, [month, permissions.viewAnalytics]);

  if (!permissions.viewAnalytics) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: 20 }}>
          <h2>Analytics</h2>
          <p>You do not have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const getTrendData = () => {
    if (!summary?.trend) return [];
    return summary.trend.map((t) => ({ month: t.month, total: t.total }));
  };

  const getCategoryData = () => {
    if (!summary?.categoryTotals) return [];
    return Object.entries(summary.categoryTotals).map(([key, value]) => ({ name: key, value }));
  };

  const getMemberData = () => {
    if (!summary?.memberTotals) return [];
    return Object.values(summary.memberTotals).map((m) => ({ name: m.name, amount: m.amount }));
  };

  const getSavingsVsExpenses = () => {
    return [
      { name: "Expenses", value: summary?.totalMonthlyExpenses || 0 },
      { name: "Savings", value: summary?.totalMonthlySavings || 0 },
    ];
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: 20, maxWidth: 1100, margin: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Analytics</h2>
          <div>
            <label style={{ marginRight: 8 }}>Month:</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            />
            <button onClick={() => fetchSummary(month)} style={{ marginLeft: 10, padding: "8px 12px" }}>
              Refresh
            </button>
          </div>
        </div>

        {loading && <p>Loading analytics...</p>}

        {!loading && !summary && <p>No analytics data available for this month.</p>}

        {!loading && summary && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              <div style={card}>
                <h4 style={{ marginBottom: 6 }}>Monthly Expense Trend (last 6 months)</h4>
                <div style={{ width: "100%", height: 240 }}>
                  <ResponsiveContainer>
                    <LineChart data={getTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={card}>
                <h4 style={{ marginBottom: 6 }}>Category-wise Spending</h4>
                <div style={{ width: "100%", height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={getCategoryData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {getCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              <div style={card}>
                <h4 style={{ marginBottom: 6 }}>Member-wise Spending</h4>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={getMemberData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amount" name="Amount" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={card}>
                <h4 style={{ marginBottom: 6 }}>Savings vs Expenses (this month)</h4>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={getSavingsVsExpenses()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Amount" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ ...card, flex: 1 }}>
                  <h4>Quick Summary</h4>
                  <p><b>Total this month:</b> ₹{summary.totalMonthlyExpenses ?? 0}</p>
                  <p><b>Total savings this month:</b> ₹{summary.totalMonthlySavings ?? 0}</p>
                  <p><b>Total debt:</b> ₹{summary.debtSummary?.totalDebt ?? 0}</p>
                  <p><b>Pending debt:</b> ₹{summary.debtSummary?.pendingDebt ?? 0}</p>
                </div>

                <div style={{ ...card, flex: 1 }}>
                  <h4>Upcoming Bills (next 10 days)</h4>
                  {summary.upcomingBills?.length ? (
                    <ul>
                      {summary.upcomingBills.map((b) => (
                        <li key={b._id || b.title}>
                          <b>{b.title ?? b.category}</b> — ₹{b.amount} — due {new Date(b.dueDate).toLocaleDateString()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No upcoming bills.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const card = {
  padding: 14,
  border: "1px solid #eee",
  borderRadius: 10,
  background: "#fff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
};

export default Analytics;
