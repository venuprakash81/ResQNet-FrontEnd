import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VolunteerSettings.css";

const VolunteerSettings = () => {
  const navigate = useNavigate();

  const [openSection, setOpenSection] = useState(null);

  // =========================================================
  // NOTIFICATION SETTINGS
  // =========================================================
  const [notifications, setNotifications] = useState({
    emergencyAlerts: true,
    messageAlerts: true,
    bookingAlerts: true,
  });

  // =========================================================
  // PASSWORD SETTINGS
  // =========================================================
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // =========================================================
  // LOCATION SETTINGS
  // =========================================================
  const [locationData, setLocationData] = useState({
    address: localStorage.getItem("volunteerAddress") || "",
    city: localStorage.getItem("volunteerCity") || "",
    latitude: localStorage.getItem("volunteerLatitude") || "",
    longitude: localStorage.getItem("volunteerLongitude") || "",
  });

  const [locationMessage, setLocationMessage] = useState("");

  // =========================================================
  // OPEN / CLOSE SETTINGS
  // =========================================================
  const toggleSection = (section) => {
    setOpenSection((previous) =>
      previous === section ? null : section
    );

    setPasswordMessage("");
    setPasswordError("");
    setLocationMessage("");
  };

  // =========================================================
  // PASSWORD INPUT
  // =========================================================
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      /*
       * IMPORTANT:
       * Change this endpoint if your Spring Boot backend
       * uses a different password API.
       */
      const email =
        localStorage.getItem("volunteerEmail") ||
        localStorage.getItem("email");

      const response = await fetch(
        "https://resqnet-backend-1.onrender.com/api/volunteers/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            currentPassword,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        let errorText = "Unable to change password.";

        try {
          const data = await response.json();

          if (data?.message) {
            errorText = data.message;
          }
        } catch {
          // Ignore invalid JSON response
        }

        throw new Error(errorText);
      }

      setPasswordMessage(
        "Password changed successfully."
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(
        error.message ||
          "Unable to change password. Please try again."
      );
    }
  };

  // =========================================================
  // LOCATION INPUT
  // =========================================================
  const handleLocationChange = (e) => {
    const { name, value } = e.target;

    setLocationData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setLocationMessage("");
  };

  // =========================================================
  // GET CURRENT LOCATION
  // =========================================================
  const getCurrentLocation = () => {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage(
        "Location is not supported by this browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude.toFixed(6);

        const longitude =
          position.coords.longitude.toFixed(6);

        setLocationData((previous) => ({
          ...previous,
          latitude,
          longitude,
        }));

        setLocationMessage(
          "Current location detected successfully."
        );
      },
      () => {
        setLocationMessage(
          "Unable to get your current location. Please allow location permission."
        );
      }
    );
  };

  // =========================================================
  // SAVE LOCATION
  // =========================================================
  const saveLocation = () => {
    localStorage.setItem(
      "volunteerAddress",
      locationData.address
    );

    localStorage.setItem(
      "volunteerCity",
      locationData.city
    );

    localStorage.setItem(
      "volunteerLatitude",
      locationData.latitude
    );

    localStorage.setItem(
      "volunteerLongitude",
      locationData.longitude
    );

    setLocationMessage(
      "Location saved successfully."
    );
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
      return;
    }

    localStorage.removeItem("volunteerEmail");
    localStorage.removeItem("volunteer");
    localStorage.removeItem("volunteerAddress");
    localStorage.removeItem("volunteerCity");
    localStorage.removeItem("volunteerLatitude");
    localStorage.removeItem("volunteerLongitude");

    navigate("/login/volunteer");
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="volunteer-settings-page">

      {/* =====================================================
          TOP HEADER
      ====================================================== */}
      <header className="settings-header">

        <button
          className="settings-back-btn"
          onClick={() => navigate("/volunteer-dashboard")}
        >
          ←
        </button>

        <div className="settings-header-title">
          <h1>Settings</h1>
          <p>Manage your ResQNet account</p>
        </div>

      </header>

      {/* =====================================================
          MAIN SETTINGS
      ====================================================== */}
      <main className="settings-container">

        {/* ===================================================
            PROFILE
        ==================================================== */}
        <div
          className="setting-item"
          onClick={() =>
            navigate("/volunteer/profile")
          }
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" ||
              e.key === " "
            ) {
              navigate("/volunteer/profile");
            }
          }}
        >
          <div className="setting-left">

            <div className="setting-icon profile-icon">
              👤
            </div>

            <div className="setting-content">
              <strong>Profile</strong>
              <span>Manage your personal information</span>
            </div>

          </div>

          <div className="setting-arrow">
            →
          </div>
        </div>

        {/* ===================================================
            NOTIFICATIONS
        ==================================================== */}
        <div className="setting-group">

          <div
            className="setting-item"
            onClick={() =>
              toggleSection("notifications")
            }
          >
            <div className="setting-left">

              <div className="setting-icon notification-icon">
                🔔
              </div>

              <div className="setting-content">
                <strong>Notifications</strong>
                <span>
                  Manage emergency and message alerts
                </span>
              </div>

            </div>

            <div
              className={`setting-arrow ${
                openSection === "notifications"
                  ? "rotate"
                  : ""
              }`}
            >
              ›
            </div>
          </div>

          {openSection === "notifications" && (
            <div className="setting-panel">

              <div className="switch-row">

                <div>
                  <strong>
                    Emergency Alerts
                  </strong>

                  <span>
                    Receive emergency notifications
                  </span>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={
                      notifications.emergencyAlerts
                    }
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emergencyAlerts:
                          e.target.checked,
                      })
                    }
                  />

                  <span className="slider"></span>
                </label>

              </div>

              <div className="switch-row">

                <div>
                  <strong>
                    Message Alerts
                  </strong>

                  <span>
                    Get notified about new messages
                  </span>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={
                      notifications.messageAlerts
                    }
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        messageAlerts:
                          e.target.checked,
                      })
                    }
                  />

                  <span className="slider"></span>
                </label>

              </div>

              <div className="switch-row">

                <div>
                  <strong>
                    Booking Alerts
                  </strong>

                  <span>
                    Receive emergency vehicle booking alerts
                  </span>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={
                      notifications.bookingAlerts
                    }
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        bookingAlerts:
                          e.target.checked,
                      })
                    }
                  />

                  <span className="slider"></span>
                </label>

              </div>

            </div>
          )}

        </div>

        {/* ===================================================
            PRIVACY & SECURITY
        ==================================================== */}
        <div className="setting-group">

          <div
            className="setting-item"
            onClick={() =>
              toggleSection("security")
            }
          >
            <div className="setting-left">

              <div className="setting-icon security-icon">
                🔒
              </div>

              <div className="setting-content">
                <strong>
                  Privacy & Security
                </strong>

                <span>
                  Password and account security
                </span>
              </div>

            </div>

            <div
              className={`setting-arrow ${
                openSection === "security"
                  ? "rotate"
                  : ""
              }`}
            >
              ›
            </div>
          </div>

          {openSection === "security" && (
            <div className="setting-panel">

              <div className="security-heading">
                <h3>Change Password</h3>

                <p>
                  Update your password to keep your
                  volunteer account secure.
                </p>
              </div>

              <form
                className="password-form"
                onSubmit={handleChangePassword}
              >

                <div className="input-group">

                  <label>
                    Current Password
                  </label>

                  <input
                    type="password"
                    name="currentPassword"
                    value={
                      passwordData.currentPassword
                    }
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />

                </div>

                <div className="input-group">

                  <label>
                    New Password
                  </label>

                  <input
                    type="password"
                    name="newPassword"
                    value={
                      passwordData.newPassword
                    }
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />

                </div>

                <div className="input-group">

                  <label>
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={
                      passwordData.confirmPassword
                    }
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />

                </div>

                {passwordError && (
                  <div className="error-message">
                    {passwordError}
                  </div>
                )}

                {passwordMessage && (
                  <div className="success-message">
                    {passwordMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="save-btn"
                >
                  Change Password
                </button>

              </form>

            </div>
          )}

        </div>

        {/* ===================================================
            LOCATION
        ==================================================== */}
        <div className="setting-group">

          <div
            className="setting-item"
            onClick={() =>
              toggleSection("location")
            }
          >
            <div className="setting-left">

              <div className="setting-icon location-icon">
                📍
              </div>

              <div className="setting-content">
                <strong>Location</strong>

                <span>
                  Manage your emergency response location
                </span>
              </div>

            </div>

            <div
              className={`setting-arrow ${
                openSection === "location"
                  ? "rotate"
                  : ""
              }`}
            >
              ›
            </div>
          </div>

          {openSection === "location" && (
            <div className="setting-panel">

              <div className="location-heading">

                <h3>
                  Volunteer Location
                </h3>

                <p>
                  Your location can be used to find
                  nearby emergencies and rescue teams.
                </p>

              </div>

              <div className="location-grid">

                <div className="input-group">

                  <label>
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={locationData.address}
                    onChange={handleLocationChange}
                    placeholder="Enter your address"
                  />

                </div>

                <div className="input-group">

                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={locationData.city}
                    onChange={handleLocationChange}
                    placeholder="Enter city"
                  />

                </div>

                <div className="input-group">

                  <label>
                    Latitude
                  </label>

                  <input
                    type="text"
                    name="latitude"
                    value={locationData.latitude}
                    onChange={handleLocationChange}
                    placeholder="17.385044"
                  />

                </div>

                <div className="input-group">

                  <label>
                    Longitude
                  </label>

                  <input
                    type="text"
                    name="longitude"
                    value={locationData.longitude}
                    onChange={handleLocationChange}
                    placeholder="78.486671"
                  />

                </div>

              </div>

              <div className="location-buttons">

                <button
                  type="button"
                  className="location-btn"
                  onClick={getCurrentLocation}
                >
                  📍 Use Current Location
                </button>

                <button
                  type="button"
                  className="save-btn"
                  onClick={saveLocation}
                >
                  Save Location
                </button>

              </div>

              {locationMessage && (
                <div className="success-message location-message">
                  {locationMessage}
                </div>
              )}

            </div>
          )}

        </div>

        {/* ===================================================
            LOGOUT
        ==================================================== */}
        <div
          className="setting-item logout-setting"
          onClick={handleLogout}
          role="button"
          tabIndex={0}
        >
          <div className="setting-left">

            <div className="setting-icon logout-icon">
              🚪
            </div>

            <div className="setting-content">
              <strong>Logout</strong>

              <span>
                Sign out from your volunteer account
              </span>
            </div>

          </div>

          <div className="setting-arrow">
            →
          </div>
        </div>

      </main>

    </div>
  );
};

export default VolunteerSettings;
