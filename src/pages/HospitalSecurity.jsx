import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalSecurity.css";

const API_BASE = "http://localhost:8081/api/hospitals";

const HospitalSecurity = () => {
  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // GET HOSPITAL ID
  // =====================================================

  const getHospitalId = () => {
    const storedHospital =
      localStorage.getItem("hospital");

    if (!storedHospital) {
      return null;
    }

    try {
      const hospital = JSON.parse(
        storedHospital
      );

      return (
        hospital.id ||
        hospital.hospitalId ||
        hospital._id ||
        localStorage.getItem("hospitalId")
      );

    } catch (err) {
      console.error(
        "Hospital data error:",
        err
      );

      return localStorage.getItem(
        "hospitalId"
      );
    }
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // PASSWORD STRENGTH
  // =====================================================

  const getPasswordStrength = () => {
    const password =
      passwordData.newPassword;

    if (!password) {
      return {
        text: "",
        className: "",
      };
    }

    if (password.length < 6) {
      return {
        text: "Weak",
        className: "weak",
      };
    }

    const hasUppercase =
      /[A-Z]/.test(password);

    const hasNumber =
      /[0-9]/.test(password);

    const hasSpecial =
      /[^A-Za-z0-9]/.test(password);

    if (
      password.length >= 8 &&
      hasUppercase &&
      hasNumber &&
      hasSpecial
    ) {
      return {
        text: "Strong",
        className: "strong",
      };
    }

    return {
      text: "Medium",
      className: "medium",
    };
  };

  const passwordStrength =
    getPasswordStrength();

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setError(
        "Please fill in all password fields."
      );

      return;
    }

    if (
      passwordData.newPassword.length < 6
    ) {
      setError(
        "New password must contain at least 6 characters."
      );

      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );

      return;
    }

    if (
      passwordData.currentPassword ===
      passwordData.newPassword
    ) {
      setError(
        "New password must be different from your current password."
      );

      return;
    }

    const hospitalId =
      getHospitalId();

    if (!hospitalId) {
      setError(
        "Hospital ID not found. Please login again."
      );

      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_BASE}/${hospitalId}/password`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            currentPassword:
              passwordData.currentPassword,

            newPassword:
              passwordData.newPassword,
          }),
        }
      );

      const responseText =
        await response.text();

      if (!response.ok) {
        throw new Error(
          responseText ||
            "Unable to change password."
        );
      }

      setMessage(
        "Password changed successfully."
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (err) {
      console.error(
        "Password change error:",
        err
      );

      setError(
        err.message ||
          "Unable to change password."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("hospital");
    localStorage.removeItem("hospitalId");
    localStorage.removeItem("hospitalName");
    localStorage.removeItem("hospitalEmail");
    localStorage.removeItem("hospitalToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate(
      "/login/hospital",
      {
        replace: true,
      }
    );
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    navigate(
      "/hospital/dashboard"
    );
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="hospital-security-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="security-header">

        <div className="security-header-left">

          <button
            type="button"
            className="security-back-button"
            onClick={handleBack}
          >
            ←
          </button>

          <div className="security-header-icon">
            🔒
          </div>

          <div>

            <h1>
              Security
            </h1>

            <p>
              Manage your hospital account security
            </p>

          </div>

        </div>


        <div className="security-header-right">

          <div className="security-online">

            <span></span>

            Hospital Online

          </div>

          <button
            type="button"
            className="security-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="security-main">

        {/* =================================================
            SECURITY INTRO
        ================================================= */}

        <section className="security-intro">

          <div className="security-large-icon">
            🔐
          </div>

          <div>

            <h2>
              Account Security
            </h2>

            <p>
              Keep your hospital account secure
              by regularly updating your password.
            </p>

          </div>

        </section>


        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (

          <div className="security-success">

            <span>
              ✓
            </span>

            {message}

          </div>

        )}


        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (

          <div className="security-error">

            <span>
              !
            </span>

            {error}

          </div>

        )}


        {/* =================================================
            CHANGE PASSWORD
        ================================================= */}

        <form
          className="security-card"
          onSubmit={handleSubmit}
        >

          <div className="security-card-header">

            <div className="security-card-icon">
              🔑
            </div>

            <div>

              <h2>
                Change Password
              </h2>

              <p>
                Change the password used to
                access your hospital account.
              </p>

            </div>

          </div>


          <div className="security-form">

            {/* CURRENT PASSWORD */}

            <div className="security-form-group">

              <label>
                Current Password
                <span>*</span>
              </label>

              <div className="password-input-wrapper">

                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  name="currentPassword"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={handleChange}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowCurrentPassword(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  {showCurrentPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>


            {/* NEW PASSWORD */}

            <div className="security-form-group">

              <label>
                New Password
                <span>*</span>
              </label>

              <div className="password-input-wrapper">

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  value={
                    passwordData.newPassword
                  }
                  onChange={handleChange}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowNewPassword(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  {showNewPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>


              {/* PASSWORD STRENGTH */}

              {passwordStrength.text && (

                <div className="password-strength">

                  <div className="strength-bar">

                    <span
                      className={
                        passwordStrength.className
                      }
                    ></span>

                  </div>

                  <small
                    className={
                      passwordStrength.className
                    }
                  >
                    Password strength:
                    {" "}
                    {passwordStrength.text}
                  </small>

                </div>

              )}

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="security-form-group">

              <label>
                Confirm New Password
                <span>*</span>
              </label>

              <div className="password-input-wrapper">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>


              {/* MATCH MESSAGE */}

              {passwordData.confirmPassword && (

                <small
                  className={
                    passwordData.newPassword ===
                    passwordData.confirmPassword
                      ? "password-match"
                      : "password-not-match"
                  }
                >
                  {passwordData.newPassword ===
                  passwordData.confirmPassword
                    ? "✓ Passwords match"
                    : "✕ Passwords do not match"}
                </small>

              )}

            </div>

          </div>


          {/* =================================================
              PASSWORD REQUIREMENTS
          ================================================= */}

          <div className="password-requirements">

            <h3>
              Password Requirements
            </h3>

            <div className="requirement-list">

              <div>
                <span>
                  ✓
                </span>

                At least 6 characters
              </div>

              <div>
                <span>
                  ✓
                </span>

                Use uppercase and lowercase letters
              </div>

              <div>
                <span>
                  ✓
                </span>

                Include numbers
              </div>

              <div>
                <span>
                  ✓
                </span>

                Use a special character for stronger security
              </div>

            </div>

          </div>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="security-actions">

            <button
              type="button"
              className="security-cancel-button"
              onClick={() => {
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });

                setMessage("");
                setError("");
              }}
              disabled={saving}
            >
              Clear
            </button>

            <button
              type="submit"
              className="security-save-button"
              disabled={saving}
            >
              {saving
                ? "Changing Password..."
                : "🔒 Change Password"}
            </button>

          </div>

        </form>


        {/* =================================================
            LOGIN SECURITY
        ================================================= */}

        <section className="login-security-card">

          <div className="login-security-icon">
            🛡️
          </div>

          <div className="login-security-content">

            <h2>
              Login Security
            </h2>

            <p>
              Your hospital account is protected
              by your login credentials. Never
              share your password with other people.
            </p>

            <div className="security-tips">

              <div>
                <span>✓</span>
                Keep your password private
              </div>

              <div>
                <span>✓</span>
                Use a strong and unique password
              </div>

              <div>
                <span>✓</span>
                Change your password regularly
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            LOGOUT CARD
        ================================================= */}

        <section className="logout-security-card">

          <div className="logout-security-icon">
            🚪
          </div>

          <div>

            <h2>
              Sign Out
            </h2>

            <p>
              Sign out from your hospital account
              on this device.
            </p>

          </div>

          <button
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </section>

      </main>

    </div>
  );
};

export default HospitalSecurity;