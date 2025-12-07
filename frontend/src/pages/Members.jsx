import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axiosInstance";
import "./Members.css";

const Members = () => {
    const [members, setMembers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "child",
    });

    const [editForm, setEditForm] = useState(null);

    // Fetch members
    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await API.get("/members");
            setMembers(res.data);
        } catch (err) {
            console.error("Fetch error:", err.response?.data || err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleChange = (e) => {
        if (editForm) {
            setEditForm({ ...editForm, [e.target.name]: e.target.value });
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    // Add Member
    const addMember = async (e) => {
        e.preventDefault();
        try {
            await API.post("/members", form);
            setShowForm(false);
            setForm({ name: "", email: "", password: "", role: "child" });
            fetchMembers();
        } catch (err) {
            console.error("Add member error:", err.response?.data || err);
            alert(err.response?.data?.message || "Failed to add member");
        }
    };

    // Delete Member
    const deleteMember = async (id) => {
        if (!window.confirm("Remove this family member?")) return;
        try {
            await API.delete(`/members/${id}`);
            fetchMembers();
        } catch (err) {
            console.error("Delete error:", err.response?.data || err);
        }
    };

    // Open Edit Modal
    const openEditModal = (m) => {
        setEditForm({
            id: m._id,
            name: m.name,
            email: m.email,
            password: "",
            role: m.role,
        });
    };

    // Save Edit
    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/members/${editForm.id}`, editForm);
            setEditForm(null);
            fetchMembers();
        } catch (err) {
            console.error("Edit error:", err.response?.data || err);
            alert(err.response?.data?.message || "Failed to update member");
        }
    };

    return (
        <div>
            <Navbar />

            <div className="members-container">
                <div className="members-header">
                    <h2>Family Members</h2>
                    <button className="add-btn" onClick={() => setShowForm(true)}>
                        + Add Member
                    </button>
                </div>

                {/* Add Member Modal */}
                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Add New Member</h3>

                            <form onSubmit={addMember}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                />

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                />

                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="parent">Parent</option>
                                    <option value="child">Child</option>
                                </select>

                                <button className="submit-btn" type="submit">Add Member</button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Member Modal */}
                {editForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Edit Member</h3>

                            <form onSubmit={saveEdit}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    required
                                    value={editForm.name}
                                    onChange={handleChange}
                                />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    required
                                    value={editForm.email}
                                    onChange={handleChange}
                                />

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="New Password (optional)"
                                    value={editForm.password}
                                    onChange={handleChange}
                                />

                                <select
                                    name="role"
                                    value={editForm.role}
                                    onChange={handleChange}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="parent">Parent</option>
                                    <option value="child">Child</option>
                                </select>

                                <button className="submit-btn" type="submit">Save Changes</button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setEditForm(null)}
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Members Grid */}
                {loading ? (
                    <p>Loading members...</p>
                ) : members.length === 0 ? (
                    <p>No members added yet.</p>
                ) : (
                    <div className="members-grid">
                        {members.map((m) => (
                            <div key={m._id} className="member-card">
                                <h3>{m.name}</h3>
                                <p className="role">{m.role.toUpperCase()}</p>

                                <p><b>Email:</b> {m.email}</p>
                                <p>Joined: {new Date(m.createdAt).toLocaleDateString()}</p>

                                <div className="member-actions">
                                    <button className="edit-btn" onClick={() => openEditModal(m)}>
                                        Edit
                                    </button>

                                    <button
                                        className="delete-btn"
                                        onClick={() => deleteMember(m._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Members;
