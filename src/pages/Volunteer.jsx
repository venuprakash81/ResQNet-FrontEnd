import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Volunteer.css";

const Volunteer = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    city: "",
    state: "",
    skills: "",
    availability: "",
    emergencyContact: "",
    password: "",
  });

  const [message, setMessage] = useState("");
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
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8081/api/volunteers/register",
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
        setMessage("Volunteer registration successful!");

        // Wait for 1 second, then open volunteer login page
        setTimeout(() => {
          navigate("/login/volunteer");
        }, 1000);

        // Clear form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          age: "",
          gender: "",
          city: "",
          state: "",
          skills: "",
          availability: "",
          emergencyContact: "",
          password: "",
        });
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="volunteer-page">
      <div className="volunteer-container">

        <div className="volunteer-header">
          <h1>RESQNET</h1>

          <h2>Volunteer Registration</h2>

          <p>
            Join our disaster response network and help communities during
            emergencies.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="volunteer-form">

          {/* Full Name */}
          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email + Phone */}
          <div className="form-row">

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>

          </div>

          {/* Age + Gender */}
          <div className="form-row">

            <div className="form-group">
              <label>Age</label>

              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                min="18"
                required
              />
            </div>

            <div className="form-group">
              <label>Gender</label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </div>

          {/* City + State */}
          <div className="form-row">

            <div className="form-group">
              <label>City</label>

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
              <label>State</label>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                required
              />
            </div>

          </div>

          {/* Skills */}
          <div className="form-group">
            <label>Skills</label>

            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Example: First Aid, Rescue, Driving, Medical Support"
              required
            />
          </div>

          {/* Availability */}
          <div className="form-group">
            <label>Availability</label>

            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              required
            >
              <option value="">Select Availability</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Emergency Only">
                Emergency Only
              </option>
            </select>
          </div>

          {/* Emergency Contact */}
          <div className="form-group">
            <label>Emergency Contact</label>

            <input
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Emergency contact number"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password"
              required
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register as Volunteer"}
          </button>

          {/* Message */}
          {message && (
            <div
              className={
                message.includes("successful")
                  ? "registration-message success"
                  : "registration-message error"
              }
            >
              {message}
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default Volunteer;