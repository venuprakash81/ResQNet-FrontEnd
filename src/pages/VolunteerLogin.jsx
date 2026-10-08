
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VolunteerLogin.css";

function VolunteerLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8081/api/volunteers/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Clear old session
        localStorage.removeItem("volunteerId");
        localStorage.removeItem("volunteerName");
        localStorage.removeItem("volunteerEmail");
        localStorage.removeItem("volunteerLoggedIn");

        sessionStorage.removeItem("volunteerId");
        sessionStorage.removeItem("volunteerName");
        sessionStorage.removeItem("volunteerEmail");
        sessionStorage.removeItem("volunteerLoggedIn");

        // Save successful login
        const storage = rememberMe
          ? localStorage
          : sessionStorage;

        storage.setItem("volunteerId", data.id ?? "");
        storage.setItem(
          "volunteerName",
          data.fullName ?? ""
        );
        storage.setItem(
          "volunteerEmail",
          data.email ?? formData.email
        );

        // Login flag used by the dashboard
        storage.setItem("volunteerLoggedIn", "true");

        setMessage("Login successful!");

        navigate("/volunteer-dashboard", {
          replace: true,
        });
      } else {
        setMessage(
          data.message || "Invalid email or password."
        );
      }
    } catch (error) {
      console.error("Volunteer login error:", error);
      setMessage(
        "Unable to connect to the RESQNET server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="volunteer-login-page">
      <div className="volunteer-login-card">

        {/* HEADER */}
        <div className="login-header">
          <div className="resqnet-logo">
            RESQNET
          </div>

          <h1>Volunteer Login</h1>

          <p>
            Sign in to access your volunteer account
          </p>
        </div>

        {/* FORM */}
        <form
          className="login-form"
          onSubmit={handleLogin}
        >
          {/* EMAIL */}
          <div className="input-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your registered email"
              required
              autoComplete="email"
            />
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="password-box">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* OPTIONS */}
          <div className="login-options">
            <label className="remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
              />

              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={() =>
                alert(
                  "Please contact RESQNET administration to reset your password."
                )
              }
            >
              Forgot Password?
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login as Volunteer"}
          </button>

          {/* MESSAGE */}
          {message && (
            <div
              className={`login-message ${
                message.includes("successful")
                  ? "success"
                  : "error"
              }`}
            >
              {message}
            </div>
          )}
        </form>

        {/* REGISTER */}
        <div className="register-section">
          <p>
            Don't have a volunteer account?
          </p>

          <button
            type="button"
            onClick={() => navigate("/volunteer")}
          >
            Register as Volunteer
          </button>
        </div>

        {/* BACK */}
        <div className="back-section">
          <button
            type="button"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}

export default VolunteerLogin;
