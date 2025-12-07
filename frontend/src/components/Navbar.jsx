import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
    const { user, logout, permissions } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="nav">
            <div className="nav-left">
                <Link to="/" className="logo">Family Expense Tracker</Link>

                {/* Hamburger */}
                <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                    ☰
                </div>

                {/* Desktop Menu */}
                <div className="nav-links desktop-only">
                    <NavLinks permissions={permissions} logout={logout} user={user} />
                </div>
            </div>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <div className="mobile-menu">
                    <NavLinks permissions={permissions} logout={logout} user={user} isMobile />
                </div>
            )}
        </nav>
    );
};

const NavLinks = ({ permissions, logout, user, isMobile }) => {
    return (
        <div className={isMobile ? "links-mobile" : "links-desktop"}>
            <Link className="nav-link" to="/expenses">Expenses</Link>
            <Link className="nav-link" to="/bills">Bills</Link>
            <Link className="nav-link" to="/savings">Savings</Link>
            <Link className="nav-link" to="/debts">Debts</Link>

            {permissions?.viewAnalytics && (
                <Link className="nav-link" to="/analytics">Analytics</Link>
            )}

            {(user.role === "admin" || permissions?.managePermissions) && (
                <Link className="nav-link" to="/permissions">Permissions</Link>
            )}


            <Link className="nav-link" to="/members">Members</Link>

            <div className="user-section">
                <span className="username">Hi, {user?.name}</span>
                <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
        </div>
    );
};

export default Navbar;
