import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

const Debts = () => {
  const { permissions, user } = useContext(AuthContext);

  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FORM STATE FOR ADDING DEBTS
  const [form, setForm] = useState({
    from: "",
    to: "",
    amount: "",
    purpose: "",
    dueDate: "",
  });

  // REPAYMENT FORM STATE
  const [repayInput, setRepayInput] = useState({
    amount: "",
    note: "",
  });

  const [repayTarget, setRepayTarget] = useState(null);

  // Fetch all debts
  const fetchDebts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/debts");
      setDebts(res.data);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add Debt
  const saveDebt = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await API.post("/debts", form);
      setForm({
        from: "",
        to: "",
        amount: "",
        purpose: "",
        dueDate: "",
      });
      fetchDebts();
    } catch (err) {
      console.error("Save error:", err.response?.data || err);
    }

    setSaving(false);
  };

  // Add repayment
  const addRepayment = async () => {
    if (!repayInput.amount) return;

    try {
      await API.put(`/debts/${repayTarget}/repay`, {
        amount: repayInput.amount,
        note: repayInput.note,
      });

      setRepayInput({ amount: "", note: "" });
      setRepayTarget(null);
      fetchDebts();
    } catch (err) {
      console.error("Repay error:", err.response?.data || err);
    }
  };

  // Delete Debt
  const deleteDebt = async (id) => {
    if (!window.confirm("Delete this debt?")) return;

    try {
      await API.delete(`/debts/${id}`);
      fetchDebts();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err);
    }
  };

  // Permission check
  if (!permissions.viewDebts) {
    return (
      <div>
        <Navbar />
        <h2 style={{ padding: 20 }}>
          You do not have permission to view debts.
        </h2>
      </div>
    );
  }

  // Calculate total outstanding
  const totalOutstanding = debts.reduce((sum, db) => {
    const paid = db.ledger?.reduce((s, r) => s + r.amount, 0) || 0;
    return sum + (db.amount - paid);
  }, 0);

  // Due Date Reminder System
  const getReminder = (dueDate, repaid) => {
    if (!dueDate || repaid) return null;

    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays > 0)
      return { msg: `${diffDays} day(s) left`, color: "#ffcc00" };

    if (diffDays === 0)
      return { msg: "Due Today!", color: "#ff3300" };

    return {
      msg: `Overdue by ${Math.abs(diffDays)} day(s)!`,
      color: "#cc0000",
    };
  };

  return (
    <div>
      <Navbar />

      <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
        <h2>Debts</h2>

        {/* TOTAL OUTSTANDING CARD */}
        <div style={totalBox}>
          <h3>Total Outstanding Debt: ₹{totalOutstanding}</h3>
        </div>

        {/* ADD DEBT FORM */}
        <form onSubmit={saveDebt} style={formBox}>
          <h3>Add Debt</h3>

          <input
            type="text"
            name="from"
            placeholder="From (Lender)"
            required
            value={form.from}
            onChange={handleChange}
            style={input}
          />

          <input
            type="text"
            name="to"
            placeholder="To (Borrower)"
            required
            value={form.to}
            onChange={handleChange}
            style={input}
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            required
            value={form.amount}
            onChange={handleChange}
            style={input}
          />

          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            style={input}
          />

          <textarea
            name="purpose"
            placeholder="Purpose (optional)"
            value={form.purpose}
            onChange={handleChange}
            style={{ ...input, height: 70 }}
          />

          <button type="submit" style={btnPrimary} disabled={saving}>
            {saving ? "Saving..." : "Add Debt"}
          </button>
        </form>

        {/* DEBT LIST */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          debts.map((db) => {
            const paid = db.ledger.reduce((sum, r) => sum + r.amount, 0);
            const remaining = db.amount - paid;

            const reminder = getReminder(db.dueDate, remaining <= 0);

            return (
              <div key={db._id} style={debtCard}>
                
                {/* REMINDER */}
                {reminder && (
                  <div
                    style={{
                      background: reminder.color,
                      padding: 10,
                      borderRadius: 6,
                      color: "#fff",
                      marginBottom: 10,
                      fontWeight: "bold",
                    }}
                  >
                    {reminder.msg}
                  </div>
                )}

                <div>
                  <h4>₹{db.amount}</h4>
                  <p>
                    <b>From:</b> {db.from}
                  </p>
                  <p>
                    <b>To:</b> {db.to}
                  </p>

                  <p>{db.purpose}</p>

                  <small>Taken on: {new Date(db.createdAt).toLocaleDateString()}</small>
                  <br />

                  {db.dueDate && (
                    <small>Due: {new Date(db.dueDate).toLocaleDateString()}</small>
                  )}

                  <hr />

                  {/* LEDGER */}
                  <p><b>Repayments:</b></p>
                  {db.ledger.length === 0 ? (
                    <small>No repayments yet</small>
                  ) : (
                    <ul>
                      {db.ledger.map((r, i) => (
                        <li key={i}>
                          Paid ₹{r.amount} on{" "}
                          {new Date(r.date).toLocaleDateString()}
                          {r.note && ` — ${r.note}`}
                        </li>
                      ))}
                    </ul>
                  )}

                  <p>
                    <b>Remaining:</b> ₹{remaining}
                  </p>
                </div>

                <div>
                  {/* Add repayment */}
                  {remaining > 0 && (
                    <>
                      <button
                        style={btnSmallGreen}
                        onClick={() => setRepayTarget(db._id)}
                      >
                        Add Repayment
                      </button>
                    </>
                  )}

                  {/* Delete */}
                  <button
                    style={btnDelete}
                    onClick={() => deleteDebt(db._id)}
                  >
                    Delete
                  </button>
                </div>

                {/* REPAYMENT INPUT BOX */}
                {repayTarget === db._id && (
                  <div style={repayBox}>
                    <h4>Add Repayment</h4>

                    <input
                      type="number"
                      placeholder="Amount"
                      value={repayInput.amount}
                      onChange={(e) =>
                        setRepayInput({ ...repayInput, amount: e.target.value })
                      }
                      style={input}
                    />

                    <textarea
                      placeholder="Note (optional)"
                      value={repayInput.note}
                      onChange={(e) =>
                        setRepayInput({ ...repayInput, note: e.target.value })
                      }
                      style={{ ...input, height: 70 }}
                    />

                    <button style={btnPrimary} onClick={addRepayment}>
                      Save Repayment
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Styles
const totalBox = {
  background: "#e3f2fd",
  border: "1px solid #2196f3",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "20px",
  color: "#0d47a1",
  textAlign: "center",
  fontSize: "18px",
  fontWeight: "bold",
};

const formBox = {
  border: "1px solid #ddd",
  padding: 20,
  borderRadius: 8,
  background: "#fafafa",
  marginBottom: 20,
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const btnPrimary = {
  padding: "10px 14px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const debtCard = {
  padding: 15,
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  marginBottom: 20,
};

const btnSmallGreen = {
  padding: "6px 10px",
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
  marginRight: 6,
};

const btnDelete = {
  padding: "6px 10px",
  background: "#dc3545",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
};

const repayBox = {
  borderTop: "1px solid #ddd",
  marginTop: 15,
  paddingTop: 10,
  background: "#f9f9f9",
  borderRadius: 8,
  padding: 12,
};

export default Debts;
