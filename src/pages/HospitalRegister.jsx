import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalRegister.css";

function HospitalRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hospitalName: "",
    hospitalId: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    hospitalType: "",
    emergencyServices: "",
    password: "",
    confirmPassword: "",
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

    // Check empty fields
    for (const key in formData) {
      if (!formData[key]) {
        setError("Please fill all the fields.");
        return;
      }
    }

    // Password validation
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
        "http://localhost:8081/api/hospitals/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hospitalName: formData.hospitalName,
            hospitalId: formData.hospitalId,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            hospitalType: formData.hospitalType,
            emergencyServices: formData.emergencyServices,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Hospital registration successful! Redirecting to login..."
        );

        setTimeout(() => {
          navigate("/login/hospital");
        }, 1500);
      } else {
        setError(data.message || "Hospital registration failed.");
      }
    } catch (err) {
      console.error("Hospital registration error:", err);

      setError(
        "Unable to connect to backend. Please make sure Spring Boot is running on port 8081."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hospital-register-page">

      <div className="hospital-register-card">

        {/* Header */}
        <div className="hospital-header">

          <div className="hospital-logo">
            🏥
          </div>

          <h1>Hospital Registration</h1>

          <p>
            Register your hospital with the ResQNet Emergency Response
            Network
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          {/* Hospital Information */}
          <div className="section-title">
            Hospital Information
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Hospital Name *</label>

              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                placeholder="Enter hospital name"
              />
            </div>

            <div className="form-group">
              <label>Hospital ID *</label>

              <input
                type="text"
                name="hospitalId"
                value={formData.hospitalId}
                onChange={handleChange}
                placeholder="Enter hospital ID"
              />
            </div>

          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Email *</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hospital@example.com"
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

          </div>

          <div className="form-group full-width">
            <label>Hospital Address *</label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete hospital address"
            ></textarea>
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>City *</label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
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
              />
            </div>

          </div>

          {/* Services */}
          <div className="section-title">
            Hospital Services
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Hospital Type *</label>

              <select
                name="hospitalType"
                value={formData.hospitalType}
                onChange={handleChange}
              >
                <option value="">
                  Select hospital type
                </option>

                <option value="Government">
                  Government
                </option>

                <option value="Private">
                  Private
                </option>

                <option value="Multi-Speciality">
                  Multi-Speciality
                </option>

                <option value="Speciality">
                  Speciality
                </option>

                <option value="Clinic">
                  Clinic
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Emergency Services *</label>

              <select
                name="emergencyServices"
                value={formData.emergencyServices}
                onChange={handleChange}
              >
                <option value="">
                  Select option
                </option>

                <option value="Available">
                  Available
                </option>

                <option value="Not Available">
                  Not Available
                </option>
              </select>
            </div>

          </div>

          {/* Security */}
          <div className="section-title">
            Account Security
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Password *</label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
              />
            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="success-message">
              ✅ {message}
            </div>
          )}

          {/* Register */}
          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Registering Hospital..."
              : "Register Hospital"}
          </button>

          {/* Login */}
          <div className="login-link">

            Already registered?

            <span
              onClick={() => navigate("/login/hospital")}
            >
              Hospital Login
            </span>

          </div>

        </form>

      </div>

    </div>
  );
}

export default HospitalRegister;