import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VolunteerProfile.css";

const API_BASE = "http://localhost:8081/api/volunteers";

const VolunteerProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    bloodGroup: "",
    skills: "",
    availability: "Available",
    about: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN VOLUNTEER EMAIL
  // =====================================================

  const getVolunteerEmail = () => {
    return (
      localStorage.getItem("volunteerEmail") ||
      localStorage.getItem("email") ||
      localStorage.getItem("userEmail") ||
      ""
    );
  };

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    const loadProfile = async () => {
      const email = getVolunteerEmail();

      if (!email) {
        setError("Volunteer login information not found.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/email/${encodeURIComponent(email)}`
        );

        if (!response.ok) {
          throw new Error("Unable to load volunteer profile.");
        }

        const data = await response.json();

        setProfile({
          id: data.id || "",
          name: data.name || data.fullName || "",
          email: data.email || email,
          phone: data.phone || data.mobile || "",
          address: data.address || "",
          city: data.city || "",
          bloodGroup: data.bloodGroup || "",
          skills: data.skills || "",
          availability: data.availability || "Available",
          about: data.about || "",
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!profile.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!profile.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/${profile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("Profile update failed.");
      }

      const updatedData = await response.json();

      setProfile((prev) => ({
        ...prev,
        ...updatedData,
      }));

      setMessage("Profile updated successfully.");

      // Optional: update stored name
      localStorage.setItem("volunteerName", profile.name);

      setTimeout(() => {
        navigate("/volunteer-dashboard");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to update profile. Please check your backend API."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    navigate("/volunteer-dashboard");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="profile-page">

      {/* TOP HEADER */}
      <header className="profile-header">
        <div
          className="profile-brand"
          onClick={() => navigate("/volunteer-dashboard")}
        >
          <div className="brand-logo">SOS</div>

          <div>
            <h2>ResQNet</h2>
            <span>Volunteer Network</span>
          </div>
        </div>

        <button
          className="back-dashboard-btn"
          onClick={() => navigate("/volunteer-dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      {/* MAIN */}
      <main className="profile-container">

        {/* PAGE TITLE */}
        <div className="profile-heading">
          <div>
            <span className="profile-label">ACCOUNT</span>
            <h1>Edit Profile</h1>
            <p>
              Manage your volunteer information and emergency service
              details.
            </p>
          </div>
        </div>

        {/* PROFILE CARD */}
        <section className="profile-card">

          {/* PROFILE TOP */}
          <div className="profile-card-top">

            <div className="profile-avatar">
              {profile.name
                ? profile.name.charAt(0).toUpperCase()
                : "V"}
            </div>

            <div className="profile-user-info">
              <h2>{profile.name || "Volunteer"}</h2>

              <p>{profile.email}</p>

              <div className="account-status">
                <span className="status-dot"></span>
                Volunteer Account
              </div>
            </div>

          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>

            {/* PERSONAL INFORMATION */}
            <div className="form-section">

              <div className="section-title">
                <div className="section-icon">👤</div>

                <div>
                  <h3>Personal Information</h3>
                  <p>Your basic volunteer information</p>
                </div>
              </div>

              <div className="form-grid">

                {/* NAME */}
                <div className="form-group">
                  <label>
                    Full Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* EMAIL */}
                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                  />

                  <small>Email cannot be changed here.</small>
                </div>

                {/* PHONE */}
                <div className="form-group">
                  <label>
                    Phone Number <span>*</span>
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>

                {/* CITY */}
                <div className="form-group">
                  <label>City</label>

                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                  />
                </div>

                {/* BLOOD GROUP */}
                <div className="form-group">
                  <label>Blood Group</label>

                  <select
                    name="bloodGroup"
                    value={profile.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* AVAILABILITY */}
                <div className="form-group">
                  <label>Availability</label>

                  <select
                    name="availability"
                    value={profile.availability}
                    onChange={handleChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Unavailable">
                      Unavailable
                    </option>
                  </select>
                </div>

              </div>

              {/* ADDRESS */}
              <div className="form-group full-width">
                <label>Address</label>

                <textarea
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="Enter your complete address"
                  rows="3"
                />
              </div>

            </div>

            {/* VOLUNTEER INFORMATION */}
            <div className="form-section">

              <div className="section-title">
                <div className="section-icon">🚑</div>

                <div>
                  <h3>Volunteer Information</h3>
                  <p>Information that helps during emergencies</p>
                </div>
              </div>

              {/* SKILLS */}
              <div className="form-group full-width">
                <label>Emergency Skills</label>

                <input
                  type="text"
                  name="skills"
                  value={profile.skills}
                  onChange={handleChange}
                  placeholder="Example: First Aid, CPR, Driving"
                />

                <small>
                  Separate multiple skills with commas.
                </small>
              </div>

              {/* ABOUT */}
              <div className="form-group full-width">
                <label>About Me</label>

                <textarea
                  name="about"
                  value={profile.about}
                  onChange={handleChange}
                  placeholder="Tell us a little about yourself..."
                  rows="5"
                />
              </div>

            </div>

            {/* MESSAGE */}
            {message && (
              <div className="success-message">
                <span>✓</span>
                {message}
              </div>
            )}

            {error && (
              <div className="error-message">
                <span>!</span>
                {error}
              </div>
            )}

            {/* BUTTONS */}
            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-btn"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    ✓ Save Changes
                  </>
                )}
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
};

export default VolunteerProfile;