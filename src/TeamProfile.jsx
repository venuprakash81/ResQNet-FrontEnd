import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeamProfile.css";

const TeamProfile = () => {
  const navigate = useNavigate();

  const [team, setTeam] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    status: "ACTIVE",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTeamProfile();
  }, []);

  const loadTeamProfile = async () => {
    try {
      const teamId = localStorage.getItem("teamId");
      const teamName = localStorage.getItem("teamName");
      const teamEmail = localStorage.getItem("teamEmail");
      const teamPhone = localStorage.getItem("teamPhone");

      // If team ID is available, get latest data from backend
      if (teamId) {
        try {
          const response = await fetch(
            `http://localhost:8081/api/teams/${teamId}`
          );

          if (response.ok) {
            const data = await response.json();

            setTeam({
              id: data.id || teamId,
              name: data.name || teamName || "",
              email: data.email || teamEmail || "",
              phone: data.phone || teamPhone || "",
              location: data.location || "",
              status: data.status || "ACTIVE",
              description: data.description || "",
            });

            setLoading(false);
            return;
          }
        } catch (error) {
          console.log("Backend profile fetch failed:", error);
        }
      }

      // Fallback to localStorage
      setTeam({
        id: teamId || "",
        name: teamName || "",
        email: teamEmail || "",
        phone: teamPhone || "",
        location: localStorage.getItem("teamLocation") || "",
        status: localStorage.getItem("teamStatus") || "ACTIVE",
        description: localStorage.getItem("teamDescription") || "",
      });

      setLoading(false);
    } catch (error) {
      console.error("Profile loading error:", error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setTeam({
      ...team,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setMessage("");

      if (!team.name.trim()) {
        setMessage("Team name is required.");
        return;
      }

      if (!team.email.trim()) {
        setMessage("Email is required.");
        return;
      }

      if (!team.phone.trim()) {
        setMessage("Phone number is required.");
        return;
      }

      if (team.id) {
        try {
          const response = await fetch(
            `http://localhost:8081/api/teams/${team.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(team),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update profile");
          }

          const updatedData = await response.json();

          setTeam({
            ...team,
            ...updatedData,
          });
        } catch (error) {
          console.log(
            "Backend update unavailable, saving profile locally."
          );
        }
      }

      // Save important profile information locally
      localStorage.setItem("teamName", team.name);
      localStorage.setItem("teamEmail", team.email);
      localStorage.setItem("teamPhone", team.phone);
      localStorage.setItem("teamLocation", team.location);
      localStorage.setItem("teamStatus", team.status);
      localStorage.setItem("teamDescription", team.description);

      const existingTeam = localStorage.getItem("team");

      if (existingTeam) {
        try {
          const parsedTeam = JSON.parse(existingTeam);

          localStorage.setItem(
            "team",
            JSON.stringify({
              ...parsedTeam,
              ...team,
            })
          );
        } catch (error) {
          localStorage.setItem("team", JSON.stringify(team));
        }
      } else {
        localStorage.setItem("team", JSON.stringify(team));
      }

      setEditing(false);
      setMessage("Profile updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Save error:", error);
      setMessage("Unable to update profile.");
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("rescueTeamLoggedIn");
    localStorage.removeItem("teamId");
    localStorage.removeItem("teamName");
    localStorage.removeItem("teamEmail");
    localStorage.removeItem("teamPhone");
    localStorage.removeItem("teamLocation");
    localStorage.removeItem("teamStatus");
    localStorage.removeItem("teamDescription");
    localStorage.removeItem("team");

    navigate("/login/rescue-team");
  };

  if (loading) {
    return (
      <div className="team-profile-loading">
        <div className="profile-spinner"></div>
        <p>Loading team profile...</p>
      </div>
    );
  }

  return (
    <div className="team-profile-page">

      {/* HEADER */}
      <header className="team-profile-header">
        <div className="profile-header-left">

          <button
            className="profile-back-btn"
            onClick={() => navigate("/rescue-dashboard")}
          >
            ←
          </button>

          <div>
            <h1>Team Profile</h1>
            <p>Manage your rescue team information</p>
          </div>
        </div>

        <div className="profile-header-right">
          <div className="profile-status">
            <span
              className={`status-dot ${
                team.status?.toLowerCase() === "active"
                  ? "online"
                  : "offline"
              }`}
            ></span>

            {team.status || "ACTIVE"}
          </div>

          <button
            className="header-dashboard-btn"
            onClick={() => navigate("/rescue-dashboard")}
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="team-profile-content">

        {/* SUCCESS / ERROR MESSAGE */}
        {message && (
          <div
            className={`profile-message ${
              message.includes("successfully")
                ? "success-message"
                : "error-message"
            }`}
          >
            <span>
              {message.includes("successfully") ? "✓" : "!"}
            </span>

            {message}
          </div>
        )}

        {/* PROFILE HERO */}
        <section className="profile-hero-card">

          <div className="team-avatar-large">
            {team.name
              ? team.name.charAt(0).toUpperCase()
              : "R"}
          </div>

          <div className="profile-hero-info">
            <span className="profile-role">
              RESCUE TEAM
            </span>

            <h2>
              {team.name || "Rescue Team"}
            </h2>

            <p>
              <span>✉</span>
              {team.email || "No email available"}
            </p>

            <div className="hero-status">
              <span className="status-dot online"></span>
              {team.status || "ACTIVE"}
            </div>
          </div>

          <div className="hero-action">
            {!editing ? (
              <button
                className="edit-profile-btn"
                onClick={() => setEditing(true)}
              >
                <span>✎</span>
                Edit Profile
              </button>
            ) : (
              <button
                className="cancel-edit-btn"
                onClick={() => {
                  setEditing(false);
                  setMessage("");
                  loadTeamProfile();
                }}
              >
                Cancel
              </button>
            )}
          </div>

        </section>

        {/* PROFILE GRID */}
        <div className="profile-layout">

          {/* PERSONAL INFORMATION */}
          <section className="profile-card">

            <div className="profile-card-header">
              <div className="card-icon blue-icon">
                👤
              </div>

              <div>
                <h3>Team Information</h3>
                <p>Basic information about your rescue team</p>
              </div>
            </div>

            <div className="profile-form">

              <div className="profile-field">
                <label>Team Name</label>

                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={team.name}
                    onChange={handleChange}
                    placeholder="Enter team name"
                  />
                ) : (
                  <div className="field-value">
                    {team.name || "Not provided"}
                  </div>
                )}
              </div>

              <div className="profile-field">
                <label>Team ID</label>

                <div className="field-value readonly-field">
                  {team.id || "Not available"}
                </div>
              </div>

              <div className="profile-field">
                <label>Email Address</label>

                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={team.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                ) : (
                  <div className="field-value">
                    {team.email || "Not provided"}
                  </div>
                )}
              </div>

              <div className="profile-field">
                <label>Phone Number</label>

                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={team.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="field-value">
                    {team.phone || "Not provided"}
                  </div>
                )}
              </div>

              <div className="profile-field full-field">
                <label>Location</label>

                {editing ? (
                  <input
                    type="text"
                    name="location"
                    value={team.location}
                    onChange={handleChange}
                    placeholder="Enter team location"
                  />
                ) : (
                  <div className="field-value">
                    {team.location || "Location not provided"}
                  </div>
                )}
              </div>

              <div className="profile-field full-field">
                <label>Team Description</label>

                {editing ? (
                  <textarea
                    name="description"
                    value={team.description}
                    onChange={handleChange}
                    placeholder="Enter a short description about your rescue team"
                    rows="4"
                  ></textarea>
                ) : (
                  <div className="field-value description-value">
                    {team.description ||
                      "No description has been added for this rescue team."}
                  </div>
                )}
              </div>

            </div>

            {editing && (
              <div className="profile-save-area">

                <button
                  className="profile-cancel-btn"
                  onClick={() => {
                    setEditing(false);
                    setMessage("");
                    loadTeamProfile();
                  }}
                >
                  Cancel
                </button>

                <button
                  className="profile-save-btn"
                  onClick={handleSave}
                >
                  ✓ Save Changes
                </button>

              </div>
            )}

          </section>

          {/* RIGHT SIDE */}
          <aside className="profile-side">

            {/* ACCOUNT STATUS */}
            <div className="profile-card status-card">

              <div className="profile-card-header">
                <div className="card-icon green-icon">
                  ✓
                </div>

                <div>
                  <h3>Account Status</h3>
                  <p>Current team availability</p>
                </div>
              </div>

              <div className="account-status-box">

                <div
                  className={`large-status-icon ${
                    team.status?.toLowerCase() === "active"
                      ? "active-status-icon"
                      : "inactive-status-icon"
                  }`}
                >
                  {team.status?.toLowerCase() === "active"
                    ? "✓"
                    : "!"}
                </div>

                <div>
                  <strong>
                    {team.status || "ACTIVE"}
                  </strong>

                  <span>
                    {team.status?.toLowerCase() === "active"
                      ? "Your team is available for emergencies."
                      : "Your team is currently unavailable."}
                  </span>
                </div>

              </div>

            </div>

            {/* QUICK ACTIONS */}
            <div className="profile-card">

              <div className="profile-card-header">
                <div className="card-icon purple-icon">
                  ⚡
                </div>

                <div>
                  <h3>Quick Actions</h3>
                  <p>Manage your rescue operations</p>
                </div>
              </div>

              <div className="quick-actions">

                <button
                  onClick={() =>
                    navigate("/rescue-dashboard")
                  }
                >
                  <span className="quick-icon blue">
                    🚨
                  </span>

                  <div>
                    <strong>Emergencies</strong>
                    <small>View emergency requests</small>
                  </div>

                  <span className="arrow">›</span>
                </button>

                <button
                  onClick={() =>
                    navigate("/rescue-dashboard")
                  }
                >
                  <span className="quick-icon green">
                    👥
                  </span>

                  <div>
                    <strong>Team Members</strong>
                    <small>Manage team members</small>
                  </div>

                  <span className="arrow">›</span>
                </button>

                <button
                  onClick={() =>
                    navigate("/rescue-dashboard")
                  }
                >
                  <span className="quick-icon orange">
                    💬
                  </span>

                  <div>
                    <strong>Messages</strong>
                    <small>Check team messages</small>
                  </div>

                  <span className="arrow">›</span>
                </button>

              </div>

            </div>

            {/* LOGOUT */}
            <button
              className="profile-logout-btn"
              onClick={handleLogout}
            >
              <span>↪</span>
              Logout from Rescue Team
            </button>

          </aside>

        </div>

      </main>
    </div>
  );
};

export default TeamProfile;