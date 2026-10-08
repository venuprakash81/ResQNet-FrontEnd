import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CitizenRegister.css";

const CitizenRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://resqnet-backend-1.onrender.com/api/citizens/register",
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
        setMessage(
          data.message || "Citizen registration successful!"
        );

        setFormData({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
        });

        setTimeout(() => {
          navigate("/login/citizen");
        }, 1500);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (err) {
      setError(
        "Unable to connect to server. Please make sure Spring Boot is running on port 8081."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="citizen-register-page">

      {/* NAVBAR */}
      <nav className="citizen-navbar">
        <div className="citizen-logo">
          <span className="logo-icon">🚨</span>
          <span>ResQNet</span>
        </div>

        <Link to="/register" className="back-link">
          ← Back to User Types
        </Link>
      </nav>

      {/* HEADER */}
      <section className="citizen-header">
        <div className="header-icon">👤</div>

        <h1>Citizen Registration</h1>

        <p>
          Create your ResQNet citizen account to report emergencies,
          request rescue assistance and receive disaster alerts.
        </p>
      </section>

      {/* FORM */}
      <main className="citizen-form-container">

        <form onSubmit={handleSubmit} className="citizen-form">

          {/* PERSONAL INFORMATION */}
          <div className="form-section">
            <div className="section-title">
              <span>👤</span>
              <div>
                <h2>Personal Information</h2>
                <p>Enter your basic personal details.</p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Gender</label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            </div>
          </div>

          {/* ACCOUNT INFORMATION */}
          <div className="form-section">

            <div className="section-title">
              <span>🔐</span>

              <div>
                <h2>Account Security</h2>
                <p>Create your secure ResQNet login.</p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>Password *</label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                />
              </div>

            </div>
          </div>

          {/* ADDRESS */}
          <div className="form-section">

            <div className="section-title">
              <span>📍</span>

              <div>
                <h2>Address Information</h2>
                <p>
                  This information helps rescue teams locate you
                  during emergencies.
                </p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-group full-width">
                <label>Address *</label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House number, street, area..."
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>City *</label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div className="form-group">
                <label>State *</label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  required
                />
              </div>

              <div className="form-group">
                <label>Pincode *</label>

                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Enter pincode"
                  required
                />
              </div>

            </div>
          </div>

          {/* EMERGENCY CONTACT */}
          <div className="form-section">

            <div className="section-title">
              <span>🚨</span>

              <div>
                <h2>Emergency Contact</h2>
                <p>
                  Add someone who can be contacted during an emergency.
                </p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>Emergency Contact Name *</label>

                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Contact person's name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Phone *</label>

                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="Contact phone number"
                  required
                />
              </div>

            </div>
          </div>

          {/* MESSAGE */}

          {message && (
            <div className="success-message">
              ✅ {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {/* BUTTON */}

          <div className="form-actions">

            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Citizen Account →"}
            </button>

            <p>
              Already have an account?{" "}
              <Link to="/login/citizen">
                Login as Citizen
              </Link>
            </p>

          </div>

        </form>

      </main>

      <footer className="citizen-footer">
        <p>
          © 2026 ResQNet | Smart Disaster Response & Emergency
          Management System
        </p>
      </footer>

    </div>
  );
};

export default CitizenRegister;
