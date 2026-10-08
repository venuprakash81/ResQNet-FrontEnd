import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalDoctors.css";

const API_URL = "http://localhost:8081/api/hospitals";

function HospitalDoctors() {
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    qualification: "",
    phone: "",
    email: "",
    experience: "",
    availability: "Available",
  });

  // =====================================================
  // CHECK HOSPITAL LOGIN
  // =====================================================
  useEffect(() => {
    const storedHospital = localStorage.getItem("hospital");

    if (!storedHospital) {
      navigate("/login/hospital", {
        replace: true,
      });
      return;
    }

    try {
      const hospitalData = JSON.parse(storedHospital);

      setHospital(hospitalData);

      loadDoctors(hospitalData);
    } catch (error) {
      console.error("Hospital data error:", error);

      localStorage.removeItem("hospital");

      navigate("/login/hospital", {
        replace: true,
      });
    }
  }, [navigate]);

  // =====================================================
  // GET HOSPITAL ID
  // =====================================================
  const getHospitalId = (hospitalData = hospital) => {
    if (!hospitalData) {
      return null;
    }

    return (
      hospitalData.id ||
      hospitalData.hospitalId ||
      hospitalData._id ||
      localStorage.getItem("hospitalId")
    );
  };

  // =====================================================
  // LOAD DOCTORS
  // =====================================================
  const loadDoctors = async (hospitalData = hospital) => {
    const hospitalId = getHospitalId(hospitalData);

    if (!hospitalId) {
      console.error("Hospital ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/${hospitalId}/doctors`
      );

      if (!response.ok) {
        throw new Error("Failed to load doctors");
      }

      const data = await response.json();

      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading doctors:", error);

      alert(
        "Unable to load doctors. Make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD / UPDATE DOCTOR
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const hospitalId = getHospitalId();

    if (!hospitalId) {
      alert("Hospital ID not found.");
      return;
    }

    if (!formData.name.trim()) {
      alert("Please enter doctor name.");
      return;
    }

    if (!formData.specialization.trim()) {
      alert("Please enter specialization.");
      return;
    }

    try {
      setSaving(true);

      let response;

      const doctorData = {
        name: formData.name.trim(),
        specialization: formData.specialization.trim(),
        qualification: formData.qualification.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        experience: formData.experience
          ? Number(formData.experience)
          : 0,
        availability: formData.availability,
      };

      // UPDATE
      if (editingId) {
        response = await fetch(
          `${API_URL}/${hospitalId}/doctors/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(doctorData),
          }
        );
      }

      // ADD
      else {
        response = await fetch(
          `${API_URL}/${hospitalId}/doctors`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(doctorData),
          }
        );
      }

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || "Failed to save doctor"
        );
      }

      await response.json();

      alert(
        editingId
          ? "Doctor updated successfully."
          : "Doctor added successfully."
      );

      resetForm();

      await loadDoctors();
    } catch (error) {
      console.error("Doctor save error:", error);

      alert(
        error.message ||
          "Unable to save doctor."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT DOCTOR
  // =====================================================
  const handleEdit = (doctor) => {
    setEditingId(doctor.id);

    setFormData({
      name: doctor.name || "",
      specialization:
        doctor.specialization || "",
      qualification:
        doctor.qualification || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
      experience:
        doctor.experience ?? "",
      availability:
        doctor.availability || "Available",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE DOCTOR
  // =====================================================
  const handleDelete = async (doctorId) => {
    const hospitalId = getHospitalId();

    if (!hospitalId) {
      alert("Hospital ID not found.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this doctor?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${hospitalId}/doctors/${doctorId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || "Failed to delete doctor"
        );
      }

      alert("Doctor deleted successfully.");

      await loadDoctors();
    } catch (error) {
      console.error(
        "Delete doctor error:",
        error
      );

      alert(
        error.message ||
          "Unable to delete doctor."
      );
    }
  };

  // =====================================================
  // RESET FORM
  // =====================================================
  const resetForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      specialization: "",
      qualification: "",
      phone: "",
      email: "",
      experience: "",
      availability: "Available",
    });
  };

  // =====================================================
  // LOGOUT
  // =====================================================
  const logout = () => {
    localStorage.removeItem("hospital");
    localStorage.removeItem("hospitalToken");
    localStorage.removeItem("hospitalId");
    localStorage.removeItem("hospitalName");
    localStorage.removeItem("hospitalEmail");

    navigate("/login/hospital", {
      replace: true,
    });
  };

  // =====================================================
  // DASHBOARD
  // =====================================================
  const goDashboard = () => {
    navigate("/hospital/dashboard");
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (!hospital) {
    return (
      <div className="doctor-loading">
        <div className="loading-box">
          Checking hospital login...
        </div>
      </div>
    );
  }

  const hospitalName =
    hospital.name ||
    hospital.hospitalName ||
    hospital.fullName ||
    "Hospital";

  return (
    <div className="hospital-doctors-page">

      {/* =================================================
          HEADER
      ================================================= */}
      <header className="doctor-header">

        <div className="doctor-brand">

          <div className="doctor-logo">
            R
          </div>

          <div className="doctor-brand-text">
            <h2>RESQNET</h2>
            <span>Hospital Management Portal</span>
          </div>

        </div>

        <div className="doctor-header-right">

          <div className="hospital-name-header">
            <span>Logged in as</span>
            <strong>{hospitalName}</strong>
          </div>

          <button
            className="dashboard-button"
            onClick={goDashboard}
          >
            Dashboard
          </button>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}
      <main className="doctor-main">

        {/* =================================================
            PAGE TITLE
        ================================================= */}
        <section className="page-title-section">

          <div>
            <div className="page-label">
              HOSPITAL PORTAL
            </div>

            <h1>Manage Doctors</h1>

            <p>
              Add, update and manage doctors
              working in your hospital.
            </p>
          </div>

          <div className="doctor-count-card">

            <div className="count-icon">
              👨‍⚕️
            </div>

            <div>
              <strong>{doctors.length}</strong>
              <span>Total Doctors</span>
            </div>

          </div>

        </section>


        {/* =================================================
            ADD / EDIT FORM
        ================================================= */}
        <section className="doctor-form-card">

          <div className="card-header">

            <div className="card-header-icon">
              {editingId ? "✏️" : "+"}
            </div>

            <div>
              <h2>
                {editingId
                  ? "Edit Doctor"
                  : "Add New Doctor"}
              </h2>

              <p>
                Enter the doctor's details below.
              </p>
            </div>

          </div>


          <form
            onSubmit={handleSubmit}
            className="doctor-form"
          >

            <div className="form-grid">

              {/* NAME */}
              <div className="form-group">

                <label>
                  Doctor Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Dr. John Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* SPECIALIZATION */}
              <div className="form-group">

                <label>
                  Specialization <span>*</span>
                </label>

                <input
                  type="text"
                  name="specialization"
                  placeholder="Cardiologist"
                  value={
                    formData.specialization
                  }
                  onChange={handleChange}
                  required
                />

              </div>


              {/* QUALIFICATION */}
              <div className="form-group">

                <label>
                  Qualification
                </label>

                <input
                  type="text"
                  name="qualification"
                  placeholder="MBBS, MD"
                  value={
                    formData.qualification
                  }
                  onChange={handleChange}
                />

              </div>


              {/* EXPERIENCE */}
              <div className="form-group">

                <label>
                  Experience
                </label>

                <input
                  type="number"
                  name="experience"
                  min="0"
                  placeholder="5"
                  value={
                    formData.experience
                  }
                  onChange={handleChange}
                />

              </div>


              {/* PHONE */}
              <div className="form-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="text"
                  name="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />

              </div>


              {/* EMAIL */}
              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="doctor@hospital.com"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>


              {/* AVAILABILITY */}
              <div className="form-group">

                <label>
                  Availability
                </label>

                <select
                  name="availability"
                  value={
                    formData.availability
                  }
                  onChange={handleChange}
                >

                  <option value="Available">
                    Available
                  </option>

                  <option value="Busy">
                    Busy
                  </option>

                  <option value="On Leave">
                    On Leave
                  </option>

                </select>

              </div>

            </div>


            {/* FORM BUTTONS */}
            <div className="form-buttons">

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Doctor"
                  : "Add Doctor"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>


        {/* =================================================
            DOCTOR LIST
        ================================================= */}
        <section className="doctor-list-card">

          <div className="list-header">

            <div>
              <h2>Hospital Doctors</h2>

              <p>
                Doctors registered under this hospital.
              </p>
            </div>

            <div className="list-count">
              {doctors.length} Doctors
            </div>

          </div>


          {/* LOADING */}
          {loading ? (
            <div className="doctor-message">
              <div className="spinner"></div>
              <p>Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (

            /* EMPTY */
            <div className="doctor-empty">

              <div className="empty-icon">
                👨‍⚕️
              </div>

              <h3>
                No Doctors Added
              </h3>

              <p>
                Add your first doctor using
                the form above.
              </p>

            </div>

          ) : (

            /* TABLE */
            <div className="doctor-table-container">

              <table className="doctor-table">

                <thead>

                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Qualification</th>
                    <th>Experience</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {doctors.map((doctor) => (

                    <tr key={doctor.id}>

                      {/* DOCTOR */}
                      <td>

                        <div className="doctor-profile">

                          <div className="doctor-avatar">
                            {doctor.name
                              ? doctor.name
                                  .charAt(0)
                                  .toUpperCase()
                              : "D"}
                          </div>

                          <div className="doctor-info">

                            <strong>
                              {doctor.name ||
                                "Doctor"}
                            </strong>

                            <small>
                              {doctor.email ||
                                "No email"}
                            </small>

                          </div>

                        </div>

                      </td>


                      {/* SPECIALIZATION */}
                      <td>
                        <span className="specialization">
                          {doctor.specialization ||
                            "N/A"}
                        </span>
                      </td>


                      {/* QUALIFICATION */}
                      <td>
                        {doctor.qualification ||
                          "N/A"}
                      </td>


                      {/* EXPERIENCE */}
                      <td>
                        {doctor.experience ??
                          0}{" "}
                        years
                      </td>


                      {/* CONTACT */}
                      <td>
                        {doctor.phone ||
                          "N/A"}
                      </td>


                      {/* STATUS */}
                      <td>

                        <span
                          className={`status-badge ${String(
                            doctor.availability ||
                              "Available"
                          )
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            )}`}
                        >
                          {doctor.availability ||
                            "Available"}
                        </span>

                      </td>


                      {/* ACTIONS */}
                      <td>

                        <div className="action-buttons">

                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEdit(
                                doctor
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(
                                doctor.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default HospitalDoctors;