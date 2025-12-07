import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

const Bills = () => {
  const { permissions } = useContext(AuthContext);

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Electricity",
    amount: "",
    dueDate: new Date().toISOString().split("T")[0],
    items: []
  });

  const [itemInput, setItemInput] = useState({ name: "", price: "" });

  const billCategories = [
    "Electricity",
    "WiFi",
    "Mobile Recharge",
    "Groceries",
    "Water Bill",
    "House Rent",
    "Other"
  ];

  // Fetch Bills
  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await API.get("/bills");
      setBills(res.data);
    } catch (err) {
      console.error(err.response?.data || err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Handle Changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add grocery item
  const addItem = () => {
    if (!itemInput.name || !itemInput.price) return;
    setForm({
      ...form,
      items: [...form.items, itemInput]
    });
    setItemInput({ name: "", price: "" });
  };

  const removeItem = (index) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index)
    });
  };

  // Save Bill
  const saveBill = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await API.post("/bills", form);
      setForm({
        title: "",
        category: "Electricity",
        amount: "",
        dueDate: new Date().toISOString().split("T")[0],
        items: []
      });
      fetchBills();
    } catch (err) {
      console.error(err.response?.data || err);
    }

    setSaving(false);
  };

  // Mark bill as paid
  const payBill = async (id) => {
    try {
      await API.put(`/bills/${id}/pay`);
      fetchBills();
    } catch (err) {
      console.error("Pay error:", err.response?.data || err);
    }
  };

  // Delete Bill
  const deleteBill = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await API.delete(`/bills/${id}`);
      fetchBills();
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  // --------------------------
  // REMINDER CALCULATION LOGIC
  // --------------------------
  const getReminder = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return {
        message: `⚠ ${diffDays} day(s) left to pay this bill`,
        color: "#ffcc00"
      };
    }

    if (diffDays === 0) {
      return {
        message: "⛔ This bill is DUE TODAY!",
        color: "#ff3300"
      };
    }

    if (diffDays < 0) {
      return {
        message: `❗ OVERDUE by ${Math.abs(diffDays)} day(s)!`,
        color: "#cc0000"
      };
    }
  };

  // Permission Check
  if (!permissions.viewBills) {
    return (
      <div>
        <Navbar />
        <h2 style={{ padding: 20 }}>You do not have permission to view bills.</h2>
      </div>
    );
  }


  return (
    <div>
      <Navbar />
      <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
        <h2>Bills</h2>

        {/* ---------------- ADD BILL FORM ---------------- */}
        <form onSubmit={saveBill} style={formBox}>
          <h3>Add Bill</h3>

          <input
            type="text"
            name="title"
            placeholder="Bill Title (optional)"
            value={form.title}
            onChange={handleChange}
            style={input}
          />

          <select name="category" value={form.category} onChange={handleChange} style={input}>
            {billCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <input
            type="number"
            name="amount"
            placeholder="Amount"
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

          {/* Grocery Items */}
          {form.category === "Groceries" && (
            <div style={{ marginBottom: 20 }}>
              <h4>Grocery Items</h4>

              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  placeholder="Item"
                  value={itemInput.name}
                  onChange={(e) => setItemInput({ ...itemInput, name: e.target.value })}
                  style={input}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={itemInput.price}
                  onChange={(e) => setItemInput({ ...itemInput, price: e.target.value })}
                  style={input}
                />
                <button type="button" onClick={addItem} style={btnSmall}>
                  Add
                </button>
              </div>

              {form.items.length > 0 && (
                <ul>
                  {form.items.map((it, i) => (
                    <li key={i}>
                      {it.name} — ₹{it.price} &nbsp;
                      <button type="button" onClick={() => removeItem(i)} style={btnDeleteSmall}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button type="submit" disabled={saving} style={btnPrimary}>
            {saving ? "Saving..." : "Add Bill"}
          </button>
        </form>

        {/* ---------------- BILL LIST ---------------- */}
        <h3 style={{ marginTop: 30 }}>All Bills</h3>

        {loading ? (
          <p>Loading...</p>
        ) : bills.length === 0 ? (
          <p>No bills found.</p>
        ) : (
          bills.map((bill) => {
            const reminder = !bill.paid ? getReminder(bill.dueDate) : null;

            return (
              <div key={bill._id} style={billCard}>
                
                {/* REMINDER BLOCK */}
                {!bill.paid && reminder && (
                  <div
                    style={{
                      background: reminder.color,
                      padding: "10px",
                      borderRadius: "6px",
                      marginBottom: "10px",
                      color: "#fff",
                      fontWeight: "bold"
                    }}
                  >
                    {reminder.message}
                  </div>
                )}

                <div>
                  <h4>{bill.title || bill.category}</h4>
                  <p>₹ {bill.amount}</p>
                  <p>Due: {new Date(bill.dueDate).toLocaleDateString()}</p>

                  {bill.category === "Groceries" && bill.items.length > 0 && (
                    <details>
                      <summary>Grocery Items</summary>
                      <ul>
                        {bill.items.map((item, i) => (
                          <li key={i}>{item.name} — ₹{item.price}</li>
                        ))}
                      </ul>
                    </details>
                  )}

                  <p>Status: {bill.paid ? "Paid" : "Pending"}</p>
                </div>

                <div>
                  {!bill.paid && (
                    <button onClick={() => payBill(bill._id)} style={btnSmall}>
                      Mark as Paid
                    </button>
                  )}

                  <button onClick={() => deleteBill(bill._id)} style={btnDelete}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};


// ----------- STYLES -----------

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
  cursor: "pointer"
};

const btnSmall = {
  padding: "6px 10px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
  marginLeft: 5
};

const btnDeleteSmall = {
  padding: "4px 8px",
  background: "#dc3545",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  cursor: "pointer"
};

const billCard = {
  padding: 15,
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  marginBottom: 20
};

const btnDelete = {
  padding: "6px 10px",
  background: "#dc3545",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
  marginLeft: 6
};

export default Bills;
