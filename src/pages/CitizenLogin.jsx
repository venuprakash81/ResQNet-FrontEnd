import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CitizenLogin.css";

const API_BASE = "https://resqnet-backend-1.onrender.com/api";

function CitizenLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/citizens/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      console.log("Citizen login response:", response.status);
      console.log("Citizen login data:", data);

      if (!response.ok) {
        setError(
          data.message ||
          data.error ||
          "Invalid email or password."
        );
        return;
      }

      // The backend may return the citizen directly or inside "citizen".
      const citizenData = data.citizen || data;

      // Accept common ID field names.
      const citizenId =
        citizenData.citizenId ??
        citizenData.id ??
        citizenData.userId;

      if (citizenId == null) {
        console.error("Citizen ID missing from login response:", data);
        setError(
          "Login succeeded, but the server did not return a Citizen ID. Check your backend login response."
        );
        return;
      }

      const savedCitizen = {
        ...citizenData,
        citizenId,
      };

      // Save citizen information for the dashboard and profile page.
      localStorage.setItem(
        "citizen",
        JSON.stringify(savedCitizen)
      );

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("citizenToken", data.token);
      }

      navigate("/citizen/dashboard", {
        replace: true,
      });
    } catch (err) {
      console.error("Citizen login error:", err);
      setError(
        "Cannot connect to the server. Make sure Spring Boot is running on port 8081."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="citizen-login-page">
      <nav className="citizen-login-navbar">
        <a href="/" className="citizen-login-logo">
          <span>🚨</span>
          <span>ResQNet</span>
        </a>

        <a href="/register" className="back-role-link">
          Create Account
        </a>
      </nav>

      <main className="citizen-login-main">
        <div className="citizen-login-card">
          <div className="citizen-login-header">
            <div className="citizen-login-icon">👤</div>
            <h1>Citizen Login</h1>
            <p>Login to your ResQNet account</p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="email">Email Address</label>

              <div className="login-input-wrapper">
                <span>📧</span>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Password</label>

              <div className="login-input-wrapper">
                <span>🔒</span>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <div className="forgot-password">
              <button
                type="button"
                onClick={() =>
                  alert("Forgot password feature will be added soon.")
                }
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="citizen-login-button"
              disabled={loading}
            >
              <span>{loading ? "⏳" : "🔐"}</span>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="create-account">
            <p>Don't have an account?</p>
            <a href="/register">Create Account</a>
          </div>

          <div className="login-security">
            <span>🔒</span>
            <div>
              <strong>Secure Login</strong>
              <p>
                Your login information is securely processed and protected.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="citizen-login-footer">
        <p>
          © 2026 ResQNet. Emergency Response & Citizen Support System.
        </p>
      </footer>
    </div>
  );
}

export default CitizenLogin;
