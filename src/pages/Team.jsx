import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Team.css";

function Team() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    teamName: "",
    leaderName: "",
    email: "",
    phone: "",
    organization: "",
    location: "",
    teamSize: "",
    teamType: "",
    specialization: "",
    experience: "",
    description: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  // =========================
  // HANDLE REGISTRATION
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    try {

      const response = await fetch(
        "https://resqnet-backend-1.onrender.com/api/teams/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(formData)
        }
      );


      const data = await response.json();


      // =========================
      // SUCCESS
      // =========================

      if (response.ok) {

        setMessage(
          data.message ||
          "Rescue team registered successfully!"
        );


        // Clear form

        setFormData({
          teamName: "",
          leaderName: "",
          email: "",
          phone: "",
          organization: "",
          location: "",
          teamSize: "",
          teamType: "",
          specialization: "",
          experience: "",
          description: ""
        });


        // =========================
        // GO TO LOGIN PAGE
        // =========================

        setTimeout(() => {

          navigate("/login/rescue-team");

        }, 1500);

      }


      // =========================
      // ERROR
      // =========================

      else {

        setError(
          data.message ||
          "Team registration failed."
        );

      }

    }

    catch (error) {

      console.error(error);

      setError(
        "Unable to connect to the server. Please make sure Spring Boot is running."
      );

    }

  };


  return (

    <div className="team-page">

      <div className="team-container">


        {/* =========================
            HEADER
        ========================= */}

        <div className="team-header">

          <div className="resq-icon">
            🚨
          </div>

          <h1>
            RESQNET
          </h1>

          <p>
            Rescue Team Registration
          </p>

          <span>
            Join the disaster response network
          </span>

        </div>


        {/* =========================
            SUCCESS MESSAGE
        ========================= */}

        {message && (

          <div className="success-message">

            ✅ {message}

            <div>
              Redirecting to Rescue Team Login...
            </div>

          </div>

        )}


        {/* =========================
            ERROR MESSAGE
        ========================= */}

        {error && (

          <div className="error-message">

            ❌ {error}

          </div>

        )}


        {/* =========================
            FORM
        ========================= */}

        <form onSubmit={handleSubmit}>


          {/* =========================
              TEAM INFORMATION
          ========================= */}

          <div className="section-title">

            <span>
              01
            </span>

            Team Information

          </div>


          <div className="form-grid">


            {/* TEAM NAME */}

            <div className="form-group">

              <label>
                Team Name *
              </label>

              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                placeholder="Enter rescue team name"
                required
              />

            </div>


            {/* TEAM LEADER */}

            <div className="form-group">

              <label>
                Team Leader *
              </label>

              <input
                type="text"
                name="leaderName"
                value={formData.leaderName}
                onChange={handleChange}
                placeholder="Enter team leader name"
                required
              />

            </div>


            {/* EMAIL */}

            <div className="form-group">

              <label>
                Email *
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="team@example.com"
                required
              />

            </div>


            {/* PHONE */}

            <div className="form-group">

              <label>
                Phone Number *
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                required
              />

            </div>

          </div>


          {/* =========================
              ORGANIZATION
          ========================= */}

          <div className="section-title">

            <span>
              02
            </span>

            Organization Details

          </div>


          <div className="form-grid">


            {/* ORGANIZATION */}

            <div className="form-group">

              <label>
                Organization
              </label>

              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="NGO / Government / Private / Volunteer"
              />

            </div>


            {/* LOCATION */}

            <div className="form-group">

              <label>
                Operating Location *
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City / District / State"
                required
              />

            </div>


            {/* TEAM SIZE */}

            <div className="form-group">

              <label>
                Team Size *
              </label>

              <input
                type="number"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                placeholder="Number of members"
                min="1"
                required
              />

            </div>


            {/* TEAM TYPE */}

            <div className="form-group">

              <label>
                Team Type *
              </label>

              <select
                name="teamType"
                value={formData.teamType}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select team type
                </option>

                <option value="Government">
                  Government
                </option>

                <option value="NGO">
                  NGO
                </option>

                <option value="Medical">
                  Medical
                </option>

                <option value="Fire & Rescue">
                  Fire & Rescue
                </option>

                <option value="Volunteer">
                  Volunteer
                </option>

                <option value="Private">
                  Private Organization
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

          </div>


          {/* =========================
              RESCUE CAPABILITIES
          ========================= */}

          <div className="section-title">

            <span>
              03
            </span>

            Rescue Capabilities

          </div>


          <div className="form-grid">


            {/* SPECIALIZATION */}

            <div className="form-group">

              <label>
                Specialization *
              </label>

              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select specialization
                </option>

                <option value="Flood Rescue">
                  Flood Rescue
                </option>

                <option value="Fire Rescue">
                  Fire Rescue
                </option>

                <option value="Medical Emergency">
                  Medical Emergency
                </option>

                <option value="Earthquake Response">
                  Earthquake Response
                </option>

                <option value="Search and Rescue">
                  Search & Rescue
                </option>

                <option value="Emergency Transport">
                  Emergency Transport
                </option>

                <option value="Food and Relief">
                  Food & Relief
                </option>

                <option value="Multi Disaster">
                  Multi-Disaster Response
                </option>

              </select>

            </div>


            {/* EXPERIENCE */}

            <div className="form-group">

              <label>
                Experience
              </label>

              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
              >

                <option value="">
                  Select experience
                </option>

                <option value="Less than 1 year">
                  Less than 1 year
                </option>

                <option value="1-3 years">
                  1 - 3 years
                </option>

                <option value="3-5 years">
                  3 - 5 years
                </option>

                <option value="5-10 years">
                  5 - 10 years
                </option>

                <option value="10+ years">
                  10+ years
                </option>

              </select>

            </div>

          </div>


          {/* DESCRIPTION */}

          <div className="form-group full">

            <label>
              Team Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your team's rescue capabilities, equipment and resources..."
              rows="5"
            />

          </div>


          {/* =========================
              SUBMIT
          ========================= */}

          <div className="submit-section">

            <button
              type="submit"
              className="register-button"
            >

              🚨 Register Rescue Team

            </button>

            <p>

              By registering, your team can be connected
              with disaster response coordination activities.

            </p>

          </div>

        </form>

      </div>

    </div>

  );
}

export default Team;
