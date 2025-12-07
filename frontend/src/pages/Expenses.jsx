import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

const Expenses = () => {
  const { permissions, user } = useContext(AuthContext);

  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    category: "Food",
    note: "",
    date: new Date().toISOString().split("T")[0]
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = ["Food", "Groceries", "Travel", "Bills", "Shopping", "Other"];

  // Fetch expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error(err.response?.data || err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveExpense = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await API.put(`/expenses/${editingId}`, form);
      } else {
        await API.post("/expenses", form);
      }

      setForm({ amount: "", category: "Food", note: "", date: new Date().toISOString().split("T")[0] });
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      console.error("Save error:", err.response?.data || err);
    }

    setSaving(false);
  };

  const editExpense = (exp) => {
    setForm({
      amount: exp.amount,
      category: exp.category,
      note: exp.note,
      date: exp.date.split("T")[0]
    });
    setEditingId(exp._id);
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await API.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err);
    }
  };

  if (!permissions.viewExpenses) {
    return (
      <div>
        <Navbar />
        <h2 style={{ padding: 20 }}>You do not have permission to view expenses.</h2>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
        <h2>Expenses</h2>

        {permissions.addExpenses && (
          <form onSubmit={saveExpense} style={formBox}>
            <h3>{editingId ? "Edit Expense" : "Add Expense"}</h3>

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              required
              value={form.amount}
              onChange={handleChange}
              style={input}
            />

            <select name="category" value={form.category} onChange={handleChange} style={input}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              style={input}
            />

            <textarea
              name="note"
              placeholder="Note (optional)"
              value={form.note}
              onChange={handleChange}
              style={{ ...input, height: 70 }}
            />

            <button type="submit" disabled={saving} style={btnPrimary}>
              {saving ? "Saving..." : editingId ? "Update Expense" : "Add Expense"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ amount: "", category: "Food", note: "", date: new Date().toISOString().split("T")[0] });
                }}
                style={btnSecondary}
              >
                Cancel Edit
              </button>
            )}
          </form>
        )}

        <h3 style={{ marginTop: 30 }}>All Expenses</h3>

        {loading ? (
          <p>Loading...</p>
        ) : expenses.length === 0 ? (
          <p>No expenses found.</p>
        ) : (
          <div style={{ marginTop: 10 }}>
            {expenses.map((exp) => (
              <div key={exp._id} style={expenseCard}>
                <div>
                  <h4>₹{exp.amount}</h4>
                  <p>{exp.category}</p>
                  <p>{exp.note}</p>
                  <small>{new Date(exp.date).toLocaleDateString()}</small><br />
                  <small>By: {exp.userName || "Unknown"}</small>
                </div>

                <div>
                  {permissions.editExpenses && (
                    <button onClick={() => editExpense(exp)} style={btnSmall}>
                      Edit
                    </button>
                  )}

                  {permissions.deleteExpenses && (
                    <button onClick={() => deleteExpense(exp._id)} style={btnDelete}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const formBox = {
  border: "1px solid #ddd",
  padding: 20,
  borderRadius: 8,
  background: "#fafafa",
  marginBottom: 20
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #ccc"
};

const btnPrimary = {
  padding: "10px 14px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  marginRight: 10
};

const btnSecondary = {
  padding: "10px 14px",
  background: "#aaa",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

const expenseCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  border: "1px solid #ddd",
  padding: 12,
  borderRadius: 8,
  marginBottom: 10,
  background: "#fff"
};

const btnSmall = {
  padding: "6px 10px",
  marginRight: 6,
  border: "1px solid #007bff",
  background: "#007bff",
  color: "#fff",
  borderRadius: 5,
  cursor: "pointer"
};

const btnDelete = {
  padding: "6px 10px",
  border: "1px solid #dc3545",
  background: "#dc3545",
  color: "#fff",
  borderRadius: 5,
  cursor: "pointer"
};

export default Expenses;
