import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Login.css"; // We will create this file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'

import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

library.add(fas, far, fab)

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);

      const user = JSON.parse(localStorage.getItem("user"));

      if (user.role === "admin") navigate("/admin");
      else if (user.role === "parent") navigate("/member");
      else navigate("/child");

    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="user-icon">
          <FontAwesomeIcon className="profile-icon" icon="fa-regular fa-user" />
        </div>

        <h2>Welcome back</h2>
        <p className="subtitle">Please sign in to continue</p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleLogin}>

          {/* EMAIL FIELD */}
          <div className="input-box1">
            <FontAwesomeIcon className="email-icon" icon="fa-solid fa-envelope" />
            <input
              type="email"
              placeholder="Email address - john@gmail.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD FIELD */}
          <div className="input-box2">
            <FontAwesomeIcon className="password-icon" icon="fa-solid fa-key" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password - 123456"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <FontAwesomeIcon
              icon={showPass ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}
              className="eye-icon"
              onClick={() => setShowPass(!showPass)}
            />
          </div>

          <div className="login-options">
            <label className="remember">
              <input type="checkbox" /> Remember me
            </label>
            <span className="forgot">Forgot password?</span>
          </div>

          <button type="submit" className="login-btn">Sign In</button>

        </form>

        <p className="signup-text">
          Don't have an account? <Link className="signup-link" to='/register'>Sign up</Link>
        </p>
        <h5 className="blinking-text">You can use default login credentials as displayed in the placeholder or Sign up!!!</h5>
      </div>
    </div>
  );
};

export default Login;
