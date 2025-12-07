import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

const Savings = () => {
    const { permissions, user } = useContext(AuthContext);

    const [savings, setSavings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        amount: "",
        note: "",
        date: new Date().toISOString().split("T")[0],
    });

    //Calculate Savings
    const totalSavings = savings.reduce((sum, s) => sum + Number(s.amount), 0);


    // Fetch savings
    const fetchSavings = async () => {
        setLoading(true);
        try {
            const res = await API.get("/savings");
            setSavings(res.data);
        } catch (err) {
            console.error("Savings fetch error:", err.response?.data || err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSavings();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const saveSavings = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await API.post("/savings", form);
            setForm({
                amount: "",
                note: "",
                date: new Date().toISOString().split("T")[0],
            });
            fetchSavings();
        } catch (err) {
            console.error("Save error:", err.response?.data || err);
        }

        setSaving(false);
    };

    const deleteSaving = async (id) => {
        if (!window.confirm("Delete this saving entry?")) return;
        try {
            await API.delete(`/savings/${id}`);
            fetchSavings();
        } catch (err) {
            console.error("Delete error:", err.response?.data || err);
        }
    };

    // Permission: view savings?
    if (!permissions.viewSavings) {
        return (
            <div>
                <Navbar />
                <h2 style={{ padding: 20 }}>
                    You do not have permission to view savings.
                </h2>
            </div>
        );
    }

    return (
        <div>
            <Navbar />

            <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
                <h2>Savings</h2>
                <div style={totalBox}>
                    <h3>Total Savings: ₹{totalSavings}</h3>
                </div>


                {/* ADD SAVINGS FORM */}
                {permissions.addSavings && (
                    <form onSubmit={saveSavings} style={formBox}>
                        <h3>Add Saving</h3>

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

                        <button type="submit" style={btnPrimary} disabled={saving}>
                            {saving ? "Saving..." : "Add Saving"}
                        </button>
                    </form>
                )}

                {/* SAVINGS LIST */}
                <h3 style={{ marginTop: 30 }}>Saving Records</h3>

                {loading ? (
                    <p>Loading...</p>
                ) : savings.length === 0 ? (
                    <p>No savings found.</p>
                ) : (
                    savings.map((sv) => (
                        <div key={sv._id} style={savingCard}>
                            <div>
                                <h4>₹{sv.amount}</h4>
                                <p>{sv.note}</p>
                                <small>{new Date(sv.date).toLocaleDateString()}</small><br />
                                <small>By: {sv.userName || "You"}</small>
                            </div>

                            <div>
                                {/* Admin can delete everything, user can delete their own */}
                                {(permissions.addSavings || user._id === sv.userId) && (
                                    <button
                                        onClick={() => deleteSaving(sv._id)}
                                        style={btnDelete}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// -------------------------
// Styles
// -------------------------

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

const savingCard = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    background: "#fff",
};

const btnDelete = {
    padding: "6px 10px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
};

const totalBox = {
  background: "#e8f5e9",
  border: "1px solid #4caf50",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "20px",
  color: "#2e7d32",
  textAlign: "center",
  fontSize: "18px",
  fontWeight: "bold"
};


export default Savings;
