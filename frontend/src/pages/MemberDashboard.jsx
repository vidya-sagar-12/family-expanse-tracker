import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import "./MemberDashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// eslint-disable-next-line
const MemberDashboard = () => {
  const { user, permissions } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavings] = useState([]);
  const [members, setMembers] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI states: modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSavingModal, setShowSavingModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingSaving, setEditingSaving] = useState(null);

  // forms
  const emptyExpense = { amount: "", category: "other", date: new Date().toISOString().slice(0,10), note: "" };
  const emptySaving = { amount: "", date: new Date().toISOString().slice(0,10), note: "" };
  const [expenseForm, setExpenseForm] = useState(emptyExpense);
  const [savingForm, setSavingForm] = useState(emptySaving);

  // fetch data
  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [expRes, saveRes, memRes, billRes] = await Promise.all([
        API.get("/expenses"),
        API.get("/savings"),
        API.get("/members"),
        API.get("/bills?upcoming=true"), // optional backend query
      ]);

      setExpenses(Array.isArray(expRes.data) ? expRes.data : []);
      setSavings(Array.isArray(saveRes.data) ? saveRes.data : []);
      setMembers(Array.isArray(memRes.data) ? memRes.data : []);
      setUpcomingBills(Array.isArray(billRes.data) ? billRes.data : []);
    } catch (err) {
      console.error("Member dashboard fetch error:", err);
      setError("Failed to load dashboard data. Check the network or backend.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  // Helpers: month range
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const sumInMonth = (list) =>
    list
      .filter((it) => {
        const d = new Date(it.date || it.createdAt);
        return d >= monthStart && d < monthEnd;
      })
      .reduce((s, it) => s + Number(it.amount || 0), 0);

  const totalExpensesMonth = sumInMonth(expenses);
  const totalSavingsMonth = sumInMonth(savings);

  // Activity feed (combined)
  const activity = [
    ...expenses.map((e) => ({ ...e, __type: "expense" })),
    ...savings.map((s) => ({ ...s, __type: "saving" })),
  ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  // Trend (last 6 months) for family expenses (members can see family)
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
      const total = expenses
        .filter((e) => {
          const dt = new Date(e.date || e.createdAt);
          return dt >= start && dt < end;
        })
        .reduce((s, it) => s + Number(it.amount || 0), 0);
      return { month: label, total };
    });
  };

  const trendData = buildTrend();

  // CRUD operations (members can edit/delete all items as Option C)

  // Add expense
  const submitExpense = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await API.put(`/expenses/${editingExpense._id}`, expenseForm);
      } else {
        await API.post("/expenses", expenseForm);
      }
      setExpenseForm(emptyExpense);
      setEditingExpense(null);
      setShowExpenseModal(false);
      await fetchAll();
    } catch (err) {
      console.error("Save expense error:", err);
      alert(err.response?.data?.message || "Failed to save expense");
    }
  };

  // Add saving
  const submitSaving = async (e) => {
    e.preventDefault();
    try {
      if (editingSaving) {
        await API.put(`/savings/${editingSaving._id}`, savingForm);
      } else {
        await API.post("/savings", savingForm);
      }
      setSavingForm(emptySaving);
      setEditingSaving(null);
      setShowSavingModal(false);
      await fetchAll();
    } catch (err) {
      console.error("Save saving error:", err);
      alert(err.response?.data?.message || "Failed to save saving");
    }
  };

  // Edit item helpers
  const startEditExpense = (item) => {
    setEditingExpense(item);
    setExpenseForm({
      amount: item.amount || "",
      category: item.category || "other",
      date: (item.date || item.createdAt || new Date()).slice ? (item.date || item.createdAt).slice(0,10) : new Date().toISOString().slice(0,10),
      note: item.note || "",
    });
    setShowExpenseModal(true);
  };

  const startEditSaving = (item) => {
    setEditingSaving(item);
    setSavingForm({
      amount: item.amount || "",
      date: (item.date || item.createdAt || new Date()).slice ? (item.date || item.createdAt).slice(0,10) : new Date().toISOString().slice(0,10),
      note: item.note || "",
    });
    setShowSavingModal(true);
  };

  // Delete
  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await API.delete(`/expenses/${id}`);
      await fetchAll();
    } catch (err) {
      console.error("Delete expense error:", err);
      alert(err.response?.data?.message || "Failed to delete expense");
    }
  };

  const deleteSaving = async (id) => {
    if (!window.confirm("Delete this saving?")) return;
    try {
      await API.delete(`/savings/${id}`);
      await fetchAll();
    } catch (err) {
      console.error("Delete saving error:", err);
      alert(err.response?.data?.message || "Failed to delete saving");
    }
  };

  // Helper to look up member name
  const memberName = (id) => {
    const m = members.find((x) => String(x._id) === String(id));
    return m ? m.name : "Unknown";
  };

  // Member totals (sum per member this month)
  const memberTotals = {};
  members.forEach((m) => {
    memberTotals[m._id] = { name: m.name, amount: 0 };
  });
  expenses.forEach((e) => {
    // count only this month
    const d = new Date(e.date || e.createdAt);
    if (d >= monthStart && d < monthEnd) {
      const key = e.createdBy || e.userId || e.createdById;
      if (memberTotals[key]) memberTotals[key].amount += Number(e.amount || 0);
    }
  });

  return (
    <div className="member-dashboard-root">
      <Navbar />

      <div className="member-container">
        <h2>Member Dashboard</h2>
        <button className="refresh-btn" onClick={fetchAll}>Refresh</button>

        {loading && <p className="muted">Loading data...</p>}
        {error && <p className="error">{error}</p>}

        <div className="top-cards">
          <div className="card c-1">
            <h4>Total Expenses (month)</h4>
            <div className="big">₹{totalExpensesMonth}</div>
          </div>
          <div className="card c-2">
            <h4>Total Savings (month)</h4>
            <div className="big">₹{totalSavingsMonth}</div>
          </div>
          <div className="card c-3">
            <h4>Pending Debt</h4>
            <div className="big">₹{/* If you have a debt endpoint, you can call and show here */}0</div>
          </div>
        </div>

        <div className="grid-two">
          <div className="panel">
            <h3>Upcoming Bills</h3>
            {upcomingBills.length === 0 ? <p>No upcoming bills</p> : (
              upcomingBills.map(b => (
                <div key={b._id} className="bill-item">
                  <strong>{b.category || b.title}</strong>
                  <div>₹{b.amount}</div>
                  <small>Due: {new Date(b.dueDate).toLocaleDateString()}</small>
                </div>
              ))
            )}
          </div>

          <div className="panel">
            <h3>Member Totals</h3>
            <div className="member-list">
              {Object.entries(memberTotals).map(([id, m]) => (
                <div key={id} className="member-line">
                  <b>{m.name}</b>: ₹{m.amount}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-area">
          <h3>Expense Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#26a69a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="activity-panel">
          <h3>Activity (expenses & savings)</h3>
          {activity.length === 0 ? <p className="muted">No activity yet.</p> : (
            <ul className="activity-list">
              {activity.map(it => (
                <li key={it._id} className={`activity-row ${it.__type}`}>
                  <div className="left">
                    <div className="title">{it.__type === "expense" ? "Expense" : "Saving"}</div>
                    <div className="meta">{it.category ? it.category : ""} • {memberName(it.createdBy)}</div>
                    <div className="note muted">{it.note}</div>
                  </div>

                  <div className="right">
                    <div className="amount">₹{it.amount}</div>
                    <div className="time muted">{new Date(it.date || it.createdAt).toLocaleString()}</div>

                    <div className="actions">
                      {it.__type === "expense" ? (
                        <>
                          <button className="btn small" onClick={() => startEditExpense(it)}>Edit</button>
                          <button className="btn small danger" onClick={() => deleteExpense(it._id)}>Delete</button>
                        </>
                      ) : (
                        <>
                          <button className="btn small" onClick={() => startEditSaving(it)}>Edit</button>
                          <button className="btn small danger" onClick={() => deleteSaving(it._id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Expense Modal */}
        {showExpenseModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>{editingExpense ? "Edit Expense" : "Add Expense"}</h3>
              <form className="modal-form" onSubmit={submitExpense}>
                <input type="number" placeholder="Amount" value={expenseForm.amount}
                       onChange={(e)=>setExpenseForm({...expenseForm, amount: e.target.value})} required />
                <input type="date" value={expenseForm.date}
                       onChange={(e)=>setExpenseForm({...expenseForm, date: e.target.value})} required />
                <select value={expenseForm.category} onChange={(e)=>setExpenseForm({...expenseForm, category: e.target.value})}>
                  <option value="groceries">Groceries</option>
                  <option value="mobile">Mobile</option>
                  <option value="electricity">Electricity</option>
                  <option value="transport">Transport</option>
                  <option value="other">Other</option>
                </select>
                <textarea placeholder="Note" value={expenseForm.note}
                          onChange={(e)=>setExpenseForm({...expenseForm, note: e.target.value})} />
                <div className="modal-actions">
                  <button type="submit" className="primary">{editingExpense ? "Save" : "Add"}</button>
                  <button type="button" className="secondary" onClick={() => { setShowExpenseModal(false); setEditingExpense(null); setExpenseForm(emptyExpense); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Saving Modal */}
        {showSavingModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>{editingSaving ? "Edit Saving" : "Add Saving"}</h3>
              <form className="modal-form" onSubmit={submitSaving}>
                <input type="number" placeholder="Amount" value={savingForm.amount}
                       onChange={(e)=>setSavingForm({...savingForm, amount: e.target.value})} required />
                <input type="date" value={savingForm.date}
                       onChange={(e)=>setSavingForm({...savingForm, date: e.target.value})} required />
                <textarea placeholder="Note" value={savingForm.note}
                          onChange={(e)=>setSavingForm({...savingForm, note: e.target.value})} />
                <div className="modal-actions">
                  <button type="submit" className="primary">{editingSaving ? "Save" : "Add"}</button>
                  <button type="button" className="secondary" onClick={() => { setShowSavingModal(false); setEditingSaving(null); setSavingForm(emptySaving); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MemberDashboard;
