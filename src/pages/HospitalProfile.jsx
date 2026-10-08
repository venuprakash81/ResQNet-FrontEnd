import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalProfile.css";

const API_BASE = "http://localhost:8081/api/hospitals";

const HospitalProfile = () => {
  const navigate = useNavigate();

  // =====================================================
  // HOSPITAL STATE
  // =====================================================

  const [hospital, setHospital] = useState(null);
  const [hospitalId, setHospitalId] = useState("");

  // =====================================================
  // PROFILE FORM
  // =====================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    registrationNumber: "",
    hospitalType: "",
    emergencyContact: "",
    website: "",
    description: "",
  });

  // =====================================================
  // PASSWORD FORM
  // =====================================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // =====================================================
  // UI STATE
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  // =====================================================
  // LOAD LOGGED-IN HOSPITAL
  // =====================================================

  useEffect(() => {
    const storedHospital =
      localStorage.getItem("hospital");

    if (!storedHospital) {
      navigate("/login/hospital", {
        replace: true,
      });

      return;
    }

    try {
      const hospitalData =
        JSON.parse(storedHospital);

      setHospital(hospitalData);

      const id =
        hospitalData.id ||
        hospitalData.hospitalId ||
        hospitalData._id ||
        localStorage.getItem("hospitalId");

      if (!id) {
        setError(
          "Hospital ID not found. Please login again."
        );

        setLoading(false);

        return;
      }

      setHospitalId(String(id));

      localStorage.setItem(
        "hospitalId",
        String(id)
      );

      // =================================================
      // LOAD PROFILE DATA
      // =================================================

      setFormData({
        name:
          hospitalData.name ||
          hospitalData.hospitalName ||
          "",

        email:
          hospitalData.email ||
          hospitalData.hospitalEmail ||
          "",

        phone:
          hospitalData.phone ||
          hospitalData.contactNumber ||
          hospitalData.mobile ||
          "",

        address:
          hospitalData.address ||
          hospitalData.location ||
          "",

        city:
          hospitalData.city ||
          "",

        state:
          hospitalData.state ||
          "",

        pincode:
          hospitalData.pincode ||
          hospitalData.pinCode ||
          "",

        registrationNumber:
          hospitalData.registrationNumber ||
          hospitalData.registrationNo ||
          "",

        hospitalType:
          hospitalData.hospitalType ||
          "",

        emergencyContact:
          hospitalData.emergencyContact ||
          "",

        website:
          hospitalData.website ||
          "",

        description:
          hospitalData.description ||
          "",
      });

      setLoading(false);

    } catch (err) {
      console.error(
        "Hospital profile parsing error:",
        err
      );

      localStorage.removeItem("hospital");

      navigate("/login/hospital", {
        replace: true,
      });
    }
  }, [navigate]);

  // =====================================================
  // PROFILE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // PASSWORD INPUT CHANGE
  // =====================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  // =====================================================
  // SAVE HOSPITAL PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hospitalId) {
      setError(
        "Hospital ID not found. Please login again."
      );

      return;
    }

    if (!formData.name.trim()) {
      setError(
        "Hospital name is required."
      );

      return;
    }

    if (!formData.email.trim()) {
      setError(
        "Hospital email is required."
      );

      return;
    }

    setSaving(true);

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/${hospitalId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );

      const responseText =
        await response.text();

      if (!response.ok) {
        throw new Error(
          responseText ||
            "Failed to update hospital profile."
        );
      }

      let updatedHospital;

      try {
        updatedHospital =
          JSON.parse(responseText);
      } catch {
        updatedHospital = {
          ...hospital,
          ...formData,
        };
      }

      const hospitalForStorage = {
        ...(hospital || {}),
        ...updatedHospital,
        ...formData,
      };

      // =================================================
      // UPDATE LOCAL STORAGE
      // =================================================

      localStorage.setItem(
        "hospital",
        JSON.stringify(
          hospitalForStorage
        )
      );

      localStorage.setItem(
        "hospitalId",
        String(hospitalId)
      );

      localStorage.setItem(
        "hospitalName",
        formData.name
      );

      localStorage.setItem(
        "hospitalEmail",
        formData.email
      );

      setHospital(
        hospitalForStorage
      );

      setMessage(
        "Hospital profile updated successfully."
      );

    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err.message ||
          "Unable to update hospital profile."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // RESET PROFILE
  // =====================================================

  const handleReset = () => {
    if (!hospital) {
      return;
    }

    setFormData({
      name:
        hospital.name ||
        hospital.hospitalName ||
        "",

      email:
        hospital.email ||
        hospital.hospitalEmail ||
        "",

      phone:
        hospital.phone ||
        hospital.contactNumber ||
        hospital.mobile ||
        "",

      address:
        hospital.address ||
        hospital.location ||
        "",

      city:
        hospital.city ||
        "",

      state:
        hospital.state ||
        "",

      pincode:
        hospital.pincode ||
        hospital.pinCode ||
        "",

      registrationNumber:
        hospital.registrationNumber ||
        hospital.registrationNo ||
        "",

      hospitalType:
        hospital.hospitalType ||
        "",

      emergencyContact:
        hospital.emergencyContact ||
        "",

      website:
        hospital.website ||
        "",

      description:
        hospital.description ||
        "",
    });

    setMessage("");
    setError("");
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError(
        "Please fill all password fields."
      );

      return;
    }

    if (
      passwordData.newPassword.length < 6
    ) {
      setPasswordError(
        "New password must contain at least 6 characters."
      );

      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setPasswordError(
        "New password and confirm password do not match."
      );

      return;
    }

    if (
      passwordData.currentPassword ===
      passwordData.newPassword
    ) {
      setPasswordError(
        "New password should be different from the current password."
      );

      return;
    }

    if (!hospitalId) {
      setPasswordError(
        "Hospital ID not found."
      );

      return;
    }

    setPasswordSaving(true);

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
            "Failed to change password."
        );
      }

      setPasswordMessage(
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

      setPasswordError(
        err.message ||
          "Unable to change password."
      );

    } finally {
      setPasswordSaving(false);
    }
  };

  // =====================================================
  // CLEAR PASSWORD FORM
  // =====================================================

  const handleClearPassword = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordMessage("");
    setPasswordError("");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmLogout =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmLogout) {
      return;
    }

    localStorage.removeItem("hospital");
    localStorage.removeItem("hospitalId");
    localStorage.removeItem("hospitalName");
    localStorage.removeItem("hospitalEmail");
    localStorage.removeItem("hospitalToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login/hospital", {
      replace: true,
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="hospital-profile-loading">

        <div className="profile-spinner"></div>

        <p>
          Loading hospital profile...
        </p>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="hospital-profile-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="profile-header">

        <div className="profile-header-left">

          <button
            type="button"
            className="profile-back-button"
            onClick={() =>
              navigate(
                "/hospital/dashboard"
              )
            }
          >
            ←
          </button>

          <div className="profile-header-icon">
            🏥
          </div>

          <div>

            <h1>
              Hospital Profile
            </h1>

            <p>
              Manage hospital information
            </p>

          </div>

        </div>


        <div className="profile-header-right">

          <div className="profile-online">

            <span></span>

            Hospital Online

          </div>

          <button
            type="button"
            className="profile-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="profile-main">

        {/* =================================================
            PROFILE INTRO
        ================================================= */}

        <section className="profile-intro">

          <div className="profile-large-icon">
            🏥
          </div>

          <div>

            <h2>
              {formData.name ||
                "Hospital"}
            </h2>

            <p>
              Edit your hospital information,
              contact details and account password.
            </p>

          </div>

        </section>


        {/* =================================================
            PROFILE SUCCESS
        ================================================= */}

        {message && (

          <div className="profile-success">

            <span>
              ✓
            </span>

            {message}

          </div>

        )}


        {/* =================================================
            PROFILE ERROR
        ================================================= */}

        {error && (

          <div className="profile-error">

            <span>
              !
            </span>

            {error}

          </div>

        )}


        {/* =================================================
            PROFILE FORM
        ================================================= */}

        <form
          className="hospital-profile-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section className="profile-form-section">

            <div className="form-section-title">

              <div className="form-title-icon">
                🏥
              </div>

              <div>

                <h2>
                  Basic Information
                </h2>

                <p>
                  General information about your
                  hospital.
                </p>

              </div>

            </div>


            <div className="profile-form-grid">

              {/* Hospital Name */}

              <div className="form-group">

                <label>
                  Hospital Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter hospital name"
                  required
                />

              </div>


              {/* Hospital Type */}

              <div className="form-group">

                <label>
                  Hospital Type
                </label>

                <select
                  name="hospitalType"
                  value={
                    formData.hospitalType
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Select hospital type
                  </option>

                  <option value="Government">
                    Government Hospital
                  </option>

                  <option value="Private">
                    Private Hospital
                  </option>

                  <option value="Corporate">
                    Corporate Hospital
                  </option>

                  <option value="Multi-Speciality">
                    Multi-Speciality Hospital
                  </option>

                  <option value="Speciality">
                    Speciality Hospital
                  </option>

                  <option value="Clinic">
                    Clinic
                  </option>

                </select>

              </div>


              {/* Registration Number */}

              <div className="form-group">

                <label>
                  Registration Number
                </label>

                <input
                  type="text"
                  name="registrationNumber"
                  value={
                    formData.registrationNumber
                  }
                  onChange={handleChange}
                  placeholder="Hospital registration number"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              CONTACT INFORMATION
          ================================================= */}

          <section className="profile-form-section">

            <div className="form-section-title">

              <div className="form-title-icon">
                📞
              </div>

              <div>

                <h2>
                  Contact Information
                </h2>

                <p>
                  Contact details used for
                  emergency communication.
                </p>

              </div>

            </div>


            <div className="profile-form-grid">

              {/* Email */}

              <div className="form-group">

                <label>
                  Email Address
                  <span>*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hospital@example.com"
                  required
                />

              </div>


              {/* Phone */}

              <div className="form-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Hospital phone number"
                />

              </div>


              {/* Emergency Contact */}

              <div className="form-group">

                <label>
                  Emergency Contact
                </label>

                <input
                  type="tel"
                  name="emergencyContact"
                  value={
                    formData.emergencyContact
                  }
                  onChange={handleChange}
                  placeholder="24/7 emergency contact"
                />

              </div>


              {/* Website */}

              <div className="form-group">

                <label>
                  Website
                </label>

                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              LOCATION
          ================================================= */}

          <section className="profile-form-section">

            <div className="form-section-title">

              <div className="form-title-icon">
                📍
              </div>

              <div>

                <h2>
                  Hospital Location
                </h2>

                <p>
                  Location details used by
                  emergency teams.
                </p>

              </div>

            </div>


            <div className="profile-form-grid">

              {/* Address */}

              <div className="form-group full-width">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete hospital address"
                  rows="3"
                />

              </div>


              {/* City */}

              <div className="form-group">

                <label>
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />

              </div>


              {/* State */}

              <div className="form-group">

                <label>
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                />

              </div>


              {/* Pincode */}

              <div className="form-group">

                <label>
                  Pincode
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Enter pincode"
                  maxLength="10"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <section className="profile-form-section">

            <div className="form-section-title">

              <div className="form-title-icon">
                📝
              </div>

              <div>

                <h2>
                  Hospital Description
                </h2>

                <p>
                  Add information about your
                  hospital.
                </p>

              </div>

            </div>


            <div className="form-group full-width">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter hospital description..."
                rows="5"
              />

            </div>

          </section>


          {/* =================================================
              PROFILE BUTTONS
          ================================================= */}

          <div className="profile-form-actions">

            <button
              type="button"
              className="profile-cancel-button"
              onClick={handleReset}
              disabled={saving}
            >
              ↻ Reset
            </button>

            <button
              type="submit"
              className="profile-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "✓ Save Changes"}
            </button>

          </div>

        </form>


        {/* =================================================
            PASSWORD SECTION
        ================================================= */}

        <form
          className="password-section"
          onSubmit={handlePasswordSubmit}
        >

          <div className="form-section-title">

            <div className="form-title-icon password-icon">
              🔒
            </div>

            <div>

              <h2>
                Change Password
              </h2>

              <p>
                Update the password used to
                login to your hospital account.
              </p>

            </div>

          </div>


          {/* PASSWORD SUCCESS */}

          {passwordMessage && (

            <div className="profile-success">

              <span>
                ✓
              </span>

              {passwordMessage}

            </div>

          )}


          {/* PASSWORD ERROR */}

          {passwordError && (

            <div className="profile-error">

              <span>
                !
              </span>

              {passwordError}

            </div>

          )}


          <div className="password-form">

            {/* Current Password */}

            <div className="form-group">

              <label>
                Current Password
                <span>*</span>
              </label>

              <input
                type="password"
                name="currentPassword"
                value={
                  passwordData.currentPassword
                }
                onChange={
                  handlePasswordChange
                }
                placeholder="Enter current password"
                autoComplete="current-password"
              />

            </div>


            {/* New Password */}

            <div className="form-group">

              <label>
                New Password
                <span>*</span>
              </label>

              <input
                type="password"
                name="newPassword"
                value={
                  passwordData.newPassword
                }
                onChange={
                  handlePasswordChange
                }
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
              />

              <small>
                Minimum 6 characters
              </small>

            </div>


            {/* Confirm Password */}

            <div className="form-group">

              <label>
                Confirm New Password
                <span>*</span>
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={
                  passwordData.confirmPassword
                }
                onChange={
                  handlePasswordChange
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
              />

            </div>

          </div>


          {/* PASSWORD BUTTONS */}

          <div className="password-actions">

            <button
              type="button"
              className="profile-cancel-button"
              onClick={
                handleClearPassword
              }
              disabled={passwordSaving}
            >
              Clear
            </button>

            <button
              type="submit"
              className="profile-save-button password-save-button"
              disabled={passwordSaving}
            >
              {passwordSaving
                ? "Changing..."
                : "🔒 Change Password"}
            </button>

          </div>

        </form>


        {/* =================================================
            SECURITY INFORMATION
        ================================================= */}

        <div className="security-information">

          <div className="security-info-icon">
            🔐
          </div>

          <div>

            <h3>
              Account Security
            </h3>

            <p>
              Your password is not displayed
              anywhere on this page. To change
              your password, enter your current
              password and create a new one.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
};

export default HospitalProfile;