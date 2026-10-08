import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChangePassword.css";

const API_BASE = "http://localhost:8081/api/citizens";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setMessage("");
  };

  const toggleShow = (field) => {
    setShow((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    const citizenData = JSON.parse(localStorage.getItem("citizen") || "null");
    const email = citizenData?.email;

    if (!email) {
      setMessage("Citizen login details were not found. Please log in again.");
      setMessageType("error");
      return;
    }

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage("Please fill in all password fields.");
      setMessageType("error");
      return;
    }

    if (form.newPassword.length < 8) {
      setMessage("New password must contain at least 8 characters.");
      setMessageType("error");
      return;
    }

    if (form.newPassword === form.currentPassword) {
      setMessage("Your new password must be different from your current password.");
      setMessageType("error");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/email/${encodeURIComponent(email)}/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || result.error || "Unable to change password.");
      }

      setMessage(result.message || "Password changed successfully.");
      setMessageType("success");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        <button
          type="button"
          className="change-password-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="change-password-icon">🔐</div>
        <h2>Change Password</h2>
        <p className="change-password-subtitle">
          Update your account password to keep your account secure.
        </p>

        <form onSubmit={handleSubmit}>
          {[
            {
              name: "currentPassword",
              label: "Current Password",
              placeholder: "Enter current password",
            },
            {
              name: "newPassword",
              label: "New Password",
              placeholder: "Enter new password",
            },
            {
              name: "confirmPassword",
              label: "Confirm New Password",
              placeholder: "Confirm new password",
            },
          ].map((field) => (
            <div className="password-field" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>

              <div className="password-input-wrapper">
                <input
                  id={field.name}
                  type={show[field.name] ? "text" : "password"}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => toggleShow(field.name)}
                  aria-label={show[field.name] ? "Hide password" : "Show password"}
                >
                  {show[field.name] ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          ))}

          <p className="password-hint">
            Use at least 8 characters for your new password.
          </p>

          {message && (
            <div className={`password-message ${messageType}`} role="alert">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="change-password-submit"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}