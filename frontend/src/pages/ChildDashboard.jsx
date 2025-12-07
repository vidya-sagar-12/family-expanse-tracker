import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import './ChildDashboard.css'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const ChildDashboard = () => {
  const { user, permissions } = useContext(AuthContext);
  const userId = user?._id;

  const [expenses, setExpenses] = useState([]);
  const [savings, setSavings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSavingForm, setShowSavingForm] = useState(false);

  // form states
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    category: "other",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const [savingForm, setSavingForm] = useState({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  // fetch both lists
  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [expRes, saveRes] = await Promise.all([
        API.get("/expenses"),
        API.get("/savings"),
      ]);

      const allExpenses = Array.isArray(expRes.data) ? expRes.data : [];
      const allSavings = Array.isArray(saveRes.data) ? saveRes.data : [];

      // If child has permission to view family expenses/savings show all,
      // otherwise keep only items created by this user
      const canViewFamilyExpenses = !!permissions?.viewExpenses;
      const canViewFamilySavings = !!permissions?.viewSavings;

      const filteredExpenses = canViewFamilyExpenses
        ? allExpenses
        : allExpenses.filter((e) => String(e.createdBy) === String(userId));

      const filteredSavings = canViewFamilySavings
        ? allSavings
        : allSavings.filter((s) => String(s.createdBy) === String(userId));

      setExpenses(filteredExpenses);
      setSavings(filteredSavings);
    } catch (err) {
      console.error("Child dashboard fetch error:", err);
      setError("Failed to load data. Check network or API.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line 
  }, []);

  // helpers: monthly totals (for current month)
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const sumForMonth = (list) =>
    list
      .filter((it) => {
        const d = new Date(it.date || it.createdAt);
        return d >= currentMonthStart && d < currentMonthEnd;
      })
      .reduce((s, it) => s + Number(it.amount || 0), 0);

  const totalMonthlyExpenses = sumForMonth(expenses);
  const totalMonthlySavings = sumForMonth(savings);

  // Activity feed (merge and sort by date desc)
  const activity = [...expenses.map(e => ({ type: "expense", ...e })), ...savings.map(s => ({ type: "saving", ...s }))];
  activity.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  // Add expense
  const addExpense = async (e) => {
    e.preventDefault();
    try {
      await API.post("/expenses", {
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        date: expenseForm.date,
        note: expenseForm.note,
      });
      setExpenseForm({ amount: "", category: "other", date: new Date().toISOString().slice(0, 10), note: "" });
      setShowExpenseForm(false);
      await fetchAll();
    } catch (err) {
      console.error("Add expense failed:", err);
      alert(err.response?.data?.message || "Failed to add expense");
    }
  };

  // Add saving
  const addSaving = async (e) => {
    e.preventDefault();
    try {
      await API.post("/savings", {
        amount: Number(savingForm.amount),
        date: savingForm.date,
        note: savingForm.note,
      });
      setSavingForm({ amount: "", date: new Date().toISOString().slice(0, 10), note: "" });
      setShowSavingForm(false);
      await fetchAll();
    } catch (err) {
      console.error("Add saving failed:", err);
      alert(err.response?.data?.message || "Failed to add saving");
    }
  };

  // Build trend data for last 6 months (child's perspective)
  const getLastSixMonths = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ d, label: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` });
    }
    return months;
  };

  const buildTrend = () => {
    const months = getLastSixMonths();
    return months.map(({ d, label }) => {
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth()+1, 1);
      const monthTotal = expenses
        .filter((e) => {
          const dt = new Date(e.date || e.createdAt);
          return dt >= start && dt < end;
        })
        .reduce((s, it) => s + Number(it.amount || 0), 0);
      return { month: label, total: monthTotal };
    });
  };

  const trendData = buildTrend();

  // UI
  return (
    <div className="child-dashboard-root">
      <Navbar />

      <div className="child-container">
        <h2>Welcome, {user?.name}</h2>

        {loading && <p className="muted">Loading your data...</p>}
        {error && <p className="error">{error}</p>}

        <div className="cards-row">
          <div className="card left">
            <h4>Total Expenses (This month)</h4>
            <div className="big">₹{totalMonthlyExpenses}</div>
            <small className="muted">Only your expenses are counted</small>
          </div>

          <div className="card middle">
            <h4>Total Savings (This month)</h4>
            <div className="big">₹{totalMonthlySavings}</div>
            <small className="muted">Only your savings are counted</small>
          </div>

          <div className="card right">
            <h4>Actions</h4>
            <div className="actions">
              <button className="primary" onClick={() => setShowExpenseForm(true)}>Add Expense</button>
              <button className="primary outline" onClick={() => setShowSavingForm(true)}>Add Saving</button>
            </div>
            <small className="muted">You can always add expenses & savings.</small>
          </div>
        </div>

        {/* Trend chart */}
        <div className="chart-card">
          <h3>Expense trend (last 6 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#26a69a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity */}
        <div className="activity-card">
          <h3>Your recent activity</h3>

          {activity.length === 0 ? (
            <p className="muted">No activity yet. Add an expense or saving to get started.</p>
          ) : (
            <ul className="activity-list">
              {activity.slice(0, 30).map((it) => (
                <li key={it._id} className={`activity-item ${it.type}`}>
                  <div>
                    <strong>{it.type === "expense" ? "Expense" : "Saving"}</strong>
                    <div className="muted small">{it.category ? it.category : ""}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div className="amount">₹{it.amount}</div>
                    <div className="muted small">{new Date(it.date || it.createdAt).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Permission-based family view */}
        {(permissions?.viewExpenses || permissions?.viewSavings) && (
          <div className="family-view-card">
            <h3>Family view (based on permissions)</h3>
            <p className="muted">You can view family data because admin allowed it.</p>

            <div className="small-grid">
              <div className="mini">
                <h4>Family expenses (this month)</h4>
                <div>₹{sumForMonth(expenses)}</div>
              </div>
              <div className="mini">
                <h4>Family savings (this month)</h4>
                <div>₹{sumForMonth(savings)}</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Expense Modal */}
      {showExpenseForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add Expense</h3>
            <form onSubmit={addExpense} className="modal-form">
              <input
                type="number"
                placeholder="Amount"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                required
              />
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                required
              />
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              >
                <option value="groceries">Groceries</option>
                <option value="mobile">Mobile</option>
                <option value="electricity">Electricity</option>
                <option value="transport">Transport</option>
                <option value="other">Other</option>
              </select>
              <textarea
                placeholder="Note (optional)"
                value={expenseForm.note}
                onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
              />
              <div className="modal-actions">
                <button type="submit" className="primary">Add Expense</button>
                <button type="button" className="secondary" onClick={() => setShowExpenseForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Saving Modal */}
      {showSavingForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add Saving</h3>
            <form onSubmit={addSaving} className="modal-form">
              <input
                type="number"
                placeholder="Amount"
                value={savingForm.amount}
                onChange={(e) => setSavingForm({ ...savingForm, amount: e.target.value })}
                required
              />
              <input
                type="date"
                value={savingForm.date}
                onChange={(e) => setSavingForm({ ...savingForm, date: e.target.value })}
                required
              />
              <textarea
                placeholder="Note (optional)"
                value={savingForm.note}
                onChange={(e) => setSavingForm({ ...savingForm, note: e.target.value })}
              />
              <div className="modal-actions">
                <button type="submit" className="primary">Add Saving</button>
                <button type="button" className="secondary" onClick={() => setShowSavingForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



export default ChildDashboard;


