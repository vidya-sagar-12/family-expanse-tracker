import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Register.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";

library.add(fas, far, fab);

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await register(name, email, password, familyName);
      navigate("/admin");
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">

        <div className="user-icon">
          <FontAwesomeIcon className="profile-icon" icon="fa-regular fa-user" />
        </div>

        <h2>Create Family Account</h2>
        <p className="subtitle">Admin registration</p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleRegister}>

          {/* FAMILY NAME */}
          <div className="input-box">
            <FontAwesomeIcon className="icon-left" icon="fa-solid fa-users" />
            <input
              type="text"
              placeholder="Family Name"
              value={familyName}
              required
              onChange={(e) => setFamilyName(e.target.value)}
            />
          </div>

          {/* ADMIN NAME */}
          <div className="input-box">
            <FontAwesomeIcon className="icon-left" icon="fa-solid fa-user-tie" />
            <input
              type="text"
              placeholder="Your Name (Admin)"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* EMAIL */}
          <div className="input-box">
            <FontAwesomeIcon className="icon-left" icon="fa-solid fa-envelope" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="input-box">
            <FontAwesomeIcon className="icon-left" icon="fa-solid fa-key" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <FontAwesomeIcon
              icon={showPass ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}
              className="icon-right"
              onClick={() => setShowPass(!showPass)}
            />
          </div>

          <button type="submit" className="register-btn">Register</button>
        </form>

        <p className="signup-text">
          Already have an account? <Link className="signup-link" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
