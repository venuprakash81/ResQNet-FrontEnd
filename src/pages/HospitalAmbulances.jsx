import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalAmbulances.css";

const API_BASE = "http://localhost:8081/api/hospitals";

const HospitalAmbulances = () => {
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [hospitalId, setHospitalId] = useState(null);

  const [ambulances, setAmbulances] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    ambulanceNumber: "",
    ambulanceType: "Basic Life Support",
    driverName: "",
    driverPhone: "",
    totalAmbulances: "",
    availableAmbulances: "",
    assignedAmbulances: "",
    status: "Active",
  });

  // =====================================================
  // CHECK HOSPITAL LOGIN
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

      const id =
        hospitalData.id ||
        hospitalData.hospitalId ||
        hospitalData._id ||
        localStorage.getItem("hospitalId");

      if (!id) {
        localStorage.removeItem("hospital");

        navigate("/login/hospital", {
          replace: true,
        });

        return;
      }

      setHospital(hospitalData);
      setHospitalId(id);

    } catch (error) {
      console.error(
        "Hospital login data error:",
        error
      );

      localStorage.removeItem("hospital");

      navigate("/login/hospital", {
        replace: true,
      });
    }
  }, [navigate]);

  // =====================================================
  // LOAD AMBULANCES
  // =====================================================

  useEffect(() => {
    if (!hospitalId) {
      return;
    }

    loadAmbulances();
  }, [hospitalId]);

  const loadAmbulances = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/${hospitalId}/ambulances`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load ambulances"
        );
      }

      const data =
        await response.json();

      setAmbulances(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        "Ambulance loading error:",
        error
      );

      setAmbulances([]);

      alert(
        "Unable to load ambulances. Please check your backend."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setEditingId(null);

    setForm({
      ambulanceNumber: "",
      ambulanceType:
        "Basic Life Support",
      driverName: "",
      driverPhone: "",
      totalAmbulances: "",
      availableAmbulances: "",
      assignedAmbulances: "",
      status: "Active",
    });
  };

  // =====================================================
  // ADD / UPDATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const total =
      Number(form.totalAmbulances);

    const available =
      Number(form.availableAmbulances);

    const assigned =
      Number(form.assignedAmbulances);

    if (
      form.totalAmbulances === "" ||
      form.availableAmbulances === "" ||
      form.assignedAmbulances === ""
    ) {
      alert(
        "Please enter total, available and assigned ambulances."
      );

      return;
    }

    if (
      total < 0 ||
      available < 0 ||
      assigned < 0
    ) {
      alert(
        "Ambulance values cannot be negative."
      );

      return;
    }

    if (
      available + assigned > total
    ) {
      alert(
        "Available + assigned ambulances cannot exceed total ambulances."
      );

      return;
    }

    const ambulanceData = {
      ambulanceNumber:
        form.ambulanceNumber,

      ambulanceType:
        form.ambulanceType,

      driverName:
        form.driverName,

      driverPhone:
        form.driverPhone,

      totalAmbulances:
        total,

      availableAmbulances:
        available,

      assignedAmbulances:
        assigned,

      status:
        form.status,
    };

    setSaving(true);

    try {
      let response;

      if (editingId) {
        response = await fetch(
          `${API_BASE}/${hospitalId}/ambulances/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              ambulanceData
            ),
          }
        );
      } else {
        response = await fetch(
          `${API_BASE}/${hospitalId}/ambulances`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              ambulanceData
            ),
          }
        );
      }

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Unable to save ambulance."
        );
      }

      await loadAmbulances();

      alert(
        editingId
          ? "Ambulance updated successfully."
          : "Ambulance added successfully."
      );

      resetForm();

    } catch (error) {
      console.error(
        "Ambulance save error:",
        error
      );

      alert(
        error.message ||
          "Unable to save ambulance."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (ambulance) => {
    setEditingId(ambulance.id);

    setForm({
      ambulanceNumber:
        ambulance.ambulanceNumber ||
        "",

      ambulanceType:
        ambulance.ambulanceType ||
        "Basic Life Support",

      driverName:
        ambulance.driverName ||
        "",

      driverPhone:
        ambulance.driverPhone ||
        "",

      totalAmbulances:
        ambulance.totalAmbulances ??
        "",

      availableAmbulances:
        ambulance.availableAmbulances ??
        "",

      assignedAmbulances:
        ambulance.assignedAmbulances ??
        "",

      status:
        ambulance.status ||
        "Active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (ambulanceId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this ambulance?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/${hospitalId}/ambulances/${ambulanceId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Unable to delete ambulance."
        );
      }

      setAmbulances((previous) =>
        previous.filter(
          (item) =>
            item.id !== ambulanceId
        )
      );

      if (editingId === ambulanceId) {
        resetForm();
      }

    } catch (error) {
      console.error(
        "Ambulance delete error:",
        error
      );

      alert(
        error.message ||
          "Unable to delete ambulance."
      );
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

    navigate("/login/hospital", {
      replace: true,
    });
  };

  // =====================================================
  // SUMMARY COUNTS
  // =====================================================

  const totalAmbulances =
    ambulances.reduce(
      (sum, ambulance) =>
        sum +
        Number(
          ambulance.totalAmbulances || 0
        ),
      0
    );

  const availableAmbulances =
    ambulances.reduce(
      (sum, ambulance) =>
        sum +
        Number(
          ambulance.availableAmbulances ||
            0
        ),
      0
    );

  const assignedAmbulances =
    ambulances.reduce(
      (sum, ambulance) =>
        sum +
        Number(
          ambulance.assignedAmbulances ||
            0
        ),
      0
    );

  // =====================================================
  // HOSPITAL NAME
  // =====================================================

  const hospitalName =
    hospital?.name ||
    hospital?.hospitalName ||
    hospital?.fullName ||
    "Hospital";

  // =====================================================
  // LOGIN CHECK LOADING
  // =====================================================

  if (!hospital) {
    return (
      <div className="ambulance-loading">
        Checking hospital login...
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="hospital-ambulance-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="ambulance-header">

        <div className="ambulance-brand">

          <div className="ambulance-logo">
            🚑
          </div>

          <div>
            <h1>
              RESQNET
            </h1>

            <p>
              Hospital Ambulance Management
            </p>
          </div>

        </div>


        <div className="ambulance-header-right">

          <div className="ambulance-hospital-name">

            <span>
              Hospital
            </span>

            <strong>
              {hospitalName}
            </strong>

          </div>


          <button
            type="button"
            className="dashboard-btn"
            onClick={() =>
              navigate(
                "/hospital/dashboard"
              )
            }
          >
            Dashboard
          </button>


          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="ambulance-main">

        {/* PAGE TITLE */}

        <div className="ambulance-title">

          <div className="ambulance-title-icon">
            🚑
          </div>

          <div>

            <h2>
              Ambulance Management
            </h2>

            <p>
              Enter and manage the
              ambulances available at
              your hospital.
            </p>

          </div>

        </div>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="ambulance-summary">

          <div className="ambulance-summary-card">

            <div className="summary-icon">
              🚑
            </div>

            <div>
              <strong>
                {totalAmbulances}
              </strong>

              <span>
                Total Ambulances
              </span>
            </div>

          </div>


          <div className="ambulance-summary-card available-card">

            <div className="summary-icon">
              🟢
            </div>

            <div>
              <strong>
                {availableAmbulances}
              </strong>

              <span>
                Available
              </span>
            </div>

          </div>


          <div className="ambulance-summary-card assigned-card">

            <div className="summary-icon">
              🔴
            </div>

            <div>
              <strong>
                {assignedAmbulances}
              </strong>

              <span>
                Assigned
              </span>
            </div>

          </div>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <section className="ambulance-form-card">

          <div className="ambulance-form-heading">

            <div>

              <h2>
                {editingId
                  ? "Edit Ambulance"
                  : "Add Ambulance"}
              </h2>

              <p>
                Enter ambulance details
                below.
              </p>

            </div>


            {editingId && (

              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>

            )}

          </div>


          <form
            className="ambulance-form"
            onSubmit={handleSubmit}
          >

            {/* AMBULANCE NUMBER */}

            <div className="form-group">

              <label>
                Ambulance Number
              </label>

              <input
                type="text"
                name="ambulanceNumber"
                placeholder="TS09AB1234"
                value={
                  form.ambulanceNumber
                }
                onChange={handleChange}
              />

            </div>


            {/* TYPE */}

            <div className="form-group">

              <label>
                Ambulance Type
              </label>

              <select
                name="ambulanceType"
                value={
                  form.ambulanceType
                }
                onChange={handleChange}
              >

                <option value="Basic Life Support">
                  Basic Life Support
                </option>

                <option value="Advanced Life Support">
                  Advanced Life Support
                </option>

                <option value="ICU Ambulance">
                  ICU Ambulance
                </option>

                <option value="Patient Transport">
                  Patient Transport
                </option>

                <option value="Neonatal Ambulance">
                  Neonatal Ambulance
                </option>

              </select>

            </div>


            {/* DRIVER */}

            <div className="form-group">

              <label>
                Driver Name
              </label>

              <input
                type="text"
                name="driverName"
                placeholder="Enter driver name"
                value={
                  form.driverName
                }
                onChange={handleChange}
              />

            </div>


            {/* PHONE */}

            <div className="form-group">

              <label>
                Driver Phone
              </label>

              <input
                type="tel"
                name="driverPhone"
                placeholder="Enter phone number"
                value={
                  form.driverPhone
                }
                onChange={handleChange}
              />

            </div>


            {/* TOTAL */}

            <div className="form-group">

              <label>
                Total Ambulances *
              </label>

              <input
                type="number"
                min="0"
                name="totalAmbulances"
                placeholder="0"
                value={
                  form.totalAmbulances
                }
                onChange={handleChange}
                required
              />

            </div>


            {/* AVAILABLE */}

            <div className="form-group">

              <label>
                Available Ambulances *
              </label>

              <input
                type="number"
                min="0"
                name="availableAmbulances"
                placeholder="0"
                value={
                  form.availableAmbulances
                }
                onChange={handleChange}
                required
              />

            </div>


            {/* ASSIGNED */}

            <div className="form-group">

              <label>
                Assigned Ambulances *
              </label>

              <input
                type="number"
                min="0"
                name="assignedAmbulances"
                placeholder="0"
                value={
                  form.assignedAmbulances
                }
                onChange={handleChange}
                required
              />

            </div>


            {/* STATUS */}

            <div className="form-group">

              <label>
                Status
              </label>

              <select
                name="status"
                value={
                  form.status
                }
                onChange={handleChange}
              >

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

              </select>

            </div>


            {/* BUTTONS */}

            <div className="ambulance-form-actions">

              <button
                type="submit"
                className="save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Ambulance"
                  : "Add Ambulance"}
              </button>


              {editingId && (

                <button
                  type="button"
                  className="clear-btn"
                  onClick={resetForm}
                >
                  Clear
                </button>

              )}

            </div>

          </form>

        </section>


        {/* =================================================
            AMBULANCE LIST
        ================================================= */}

        <section className="ambulance-list-card">

          <div className="ambulance-list-heading">

            <div>

              <h2>
                Hospital Ambulances
              </h2>

              <p>
                {ambulances.length} ambulance
                {ambulances.length !== 1
                  ? " records"
                  : " record"}
              </p>

            </div>


            <button
              type="button"
              className="refresh-btn"
              onClick={loadAmbulances}
            >
              ↻ Refresh
            </button>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="ambulance-empty">

              <div className="loading-spinner"></div>

              <p>
                Loading ambulance information...
              </p>

            </div>

          ) : ambulances.length === 0 ? (

            /* EMPTY */

            <div className="ambulance-empty">

              <div className="empty-icon">
                🚑
              </div>

              <h3>
                No Ambulances Added
              </h3>

              <p>
                Add your hospital ambulance
                information using the form
                above.
              </p>

            </div>

          ) : (

            /* TABLE */

            <div className="ambulance-table-wrapper">

              <table className="ambulance-table">

                <thead>

                  <tr>

                    <th>
                      Ambulance
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Driver
                    </th>

                    <th>
                      Total
                    </th>

                    <th>
                      Available
                    </th>

                    <th>
                      Assigned
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {ambulances.map(
                    (ambulance) => (

                      <tr
                        key={
                          ambulance.id
                        }
                      >

                        <td>

                          <strong>
                            {ambulance.ambulanceNumber ||
                              "N/A"}
                          </strong>

                        </td>


                        <td>
                          {ambulance.ambulanceType ||
                            "N/A"}
                        </td>


                        <td>

                          <strong>
                            {ambulance.driverName ||
                              "N/A"}
                          </strong>

                          <small>
                            {ambulance.driverPhone ||
                              "N/A"}
                          </small>

                        </td>


                        <td>
                          {ambulance.totalAmbulances ??
                            0}
                        </td>


                        <td>

                          <span className="available-number">
                            {ambulance.availableAmbulances ??
                              0}
                          </span>

                        </td>


                        <td>

                          <span className="assigned-number">
                            {ambulance.assignedAmbulances ??
                              0}
                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              ambulance.status ===
                              "Active"
                                ? "status-active"
                                : "status-inactive"
                            }
                          >
                            {ambulance.status ||
                              "Active"}
                          </span>

                        </td>


                        <td>

                          <div className="ambulance-actions">

                            <button
                              type="button"
                              className="edit-btn"
                              onClick={() =>
                                handleEdit(
                                  ambulance
                                )
                              }
                            >
                              Edit
                            </button>


                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  ambulance.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
};

export default HospitalAmbulances;