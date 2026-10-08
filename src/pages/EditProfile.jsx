import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

const API = "http://localhost:8081/api/citizens";

function EditProfile() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fields = [
    { key: "fullName", label: "Full Name", required: true },
    { key: "email", label: "Email", required: true },
    { key: "phone", label: "Phone Number", required: true },
    { key: "dateOfBirth", label: "Date of Birth", type: "date" },
    { key: "gender", label: "Gender", type: "gender" },
    { key: "address", label: "Address", type: "textarea" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "pincode", label: "Pincode" },
    {
      key: "emergencyContactName",
      label: "Emergency Contact Name",
    },
    {
      key: "emergencyContactPhone",
      label: "Emergency Contact Phone",
    },
  ];

  // Load citizen email from login data
  useEffect(() => {
    try {
      const citizen = JSON.parse(
        localStorage.getItem("citizen") || "{}"
      );

      if (!citizen.email) {
        setError("Citizen email not found. Please log in again.");
        setLoading(false);
        return;
      }

      setEmail(citizen.email);
    } catch {
      setError("Unable to read citizen login details.");
      setLoading(false);
    }
  }, []);

  // Fetch citizen details using email
  useEffect(() => {
    if (!email) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API}/email/${encodeURIComponent(email)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Profile not found");
        }

        setProfile(data);
        setForm(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setForm({ ...profile });
    setEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setForm({ ...profile });
    setEditing(false);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {};

    fields.forEach((field) => {
      payload[field.key] = form[field.key] ?? "";
    });

    if (
      !payload.fullName.trim() ||
      !payload.email.trim() ||
      !payload.phone.trim()
    ) {
      setError("Name, email, and phone are required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API}/email/${encodeURIComponent(email)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      const newEmail = payload.email.trim();

      const getResponse = await fetch(
        `${API}/email/${encodeURIComponent(newEmail)}`
      );

      const updatedProfile = await getResponse.json();

      if (!getResponse.ok) {
        throw new Error(
          updatedProfile.message || "Unable to reload profile"
        );
      }

      setProfile(updatedProfile);
      setForm(updatedProfile);
      setEmail(updatedProfile.email);
      setEditing(false);
      setSuccess("Profile updated successfully!");

      const oldCitizen = JSON.parse(
        localStorage.getItem("citizen") || "{}"
      );

      localStorage.setItem(
        "citizen",
        JSON.stringify({
          ...oldCitizen,
          ...updatedProfile,
        })
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ep-loading">
        <div className="ep-spinner"></div>
        <p>Loading citizen profile...</p>
      </div>
    );
  }

  if (error && !profile.id) {
    return (
      <div className="ep-page">
        <div className="ep-container">
          <div className="ep-error">{error}</div>
          <button
            className="ep-back-btn"
            onClick={() => navigate("/citizen/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-page">
      <div className="ep-container">

        {/* Header */}
        <div className="ep-header">
          <div>
            <h1>My Profile</h1>
            <p>Manage your personal information</p>
          </div>

          {!editing && (
            <button
              className="ep-edit-btn"
              onClick={handleEdit}
            >
              ✎ Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="ep-error">{error}</div>
        )}

        {success && (
          <div className="ep-success">{success}</div>
        )}

        {/* Profile summary */}
        <div className="ep-profile-top">
          <div className="ep-avatar">
            {(profile.fullName || "C")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h2>{profile.fullName}</h2>
            <p>{profile.email}</p>
            <span>Citizen ID: {profile.id}</span>
          </div>
        </div>

        <form onSubmit={handleSave}>

          {/* Personal information */}
          <section className="ep-section">
            <h3>Personal Information</h3>

            <div className="ep-grid">
              {fields.slice(0, 5).map((field) => (
                <div className="ep-field" key={field.key}>
                  <label>{field.label}</label>

                  {editing ? (
                    field.type === "gender" ? (
                      <select
                        name={field.key}
                        value={form[field.key] || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <input
                        type={field.type || "text"}
                        name={field.key}
                        value={form[field.key] || ""}
                        onChange={handleChange}
                        required={field.required || false}
                      />
                    )
                  ) : (
                    <div className="ep-value">
                      {profile[field.key] || "Not provided"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Address information */}
          <section className="ep-section">
            <h3>Address Information</h3>

            <div className="ep-grid">
              {fields.slice(5, 9).map((field) => (
                <div className="ep-field" key={field.key}>
                  <label>{field.label}</label>

                  {editing ? (
                    field.type === "textarea" ? (
                      <textarea
                        name={field.key}
                        value={form[field.key] || ""}
                        onChange={handleChange}
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        name={field.key}
                        value={form[field.key] || ""}
                        onChange={handleChange}
                      />
                    )
                  ) : (
                    <div className="ep-value">
                      {profile[field.key] || "Not provided"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Emergency contact */}
          <section className="ep-section">
            <h3>Emergency Contact Information</h3>

            <div className="ep-grid">
              {fields.slice(9).map((field) => (
                <div className="ep-field" key={field.key}>
                  <label>{field.label}</label>

                  {editing ? (
                    <input
                      type="text"
                      name={field.key}
                      value={form[field.key] || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="ep-value">
                      {profile[field.key] || "Not provided"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Action buttons */}
          {editing && (
            <div className="ep-actions">
              <button
                type="button"
                className="ep-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="ep-save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>

        {!editing && (
          <div className="ep-bottom">
            <button
              className="ep-back-btn"
              onClick={() => navigate("/citizen-dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default EditProfile;