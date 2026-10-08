import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./CitizenEmergencies.css";

// =========================================================
// FIX LEAFLET MARKER ICON
// =========================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// =========================================================
// MAP LOCATION MARKER
// =========================================================

function EditLocationMarker({
  position,
  setPosition,
}) {
  useMapEvents({
    click(e) {
      const latitude = e.latlng.lat;
      const longitude = e.latlng.lng;

      setPosition([
        latitude,
        longitude,
      ]);
    },
  });

  return position ? (
    <Marker position={position} />
  ) : null;
}


// =========================================================
// MAIN COMPONENT
// =========================================================

function CitizenEmergencies() {

  const navigate = useNavigate();

  // =======================================================
  // EMERGENCIES
  // =======================================================

  const [emergencies, setEmergencies] = useState([]);

  const [loading, setLoading] = useState(true);

  // =======================================================
  // EDIT
  // =======================================================

  const [editingEmergency, setEditingEmergency] =
    useState(null);

  const [editPosition, setEditPosition] =
    useState(null);

  const [editForm, setEditForm] = useState({
    emergencyType: "",
    severity: "",
    location: "",
    latitude: "",
    longitude: "",
    description: "",
    contactNumber: "",
  });


  // =======================================================
  // GET LOGGED-IN CITIZEN
  // =======================================================

  const getCitizenEmail = () => {

    try {

      const citizen = JSON.parse(
        localStorage.getItem("citizen") || "{}"
      );

      return (
        citizen.email ||
        citizen.citizenEmail ||
        localStorage.getItem("citizenEmail") ||
        ""
      );

    } catch (error) {

      console.error(
        "Error reading citizen information:",
        error
      );

      return (
        localStorage.getItem("citizenEmail") ||
        ""
      );
    }
  };


  // =======================================================
  // LOAD USER'S EMERGENCIES
  // =======================================================

  const loadEmergencies = async () => {

    const email = getCitizenEmail();

    if (!email) {

      alert(
        "Citizen login information not found."
      );

      setLoading(false);

      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `http://localhost:8081/api/emergencies/citizen/${encodeURIComponent(
          email
        )}`
      );

      if (!response.ok) {

        throw new Error(
          "Failed to load emergencies"
        );
      }

      const data = await response.json();

      setEmergencies(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Error loading emergencies:",
        error
      );

      alert(
        "Unable to load your emergency reports."
      );

    } finally {

      setLoading(false);
    }
  };


  // =======================================================
  // LOAD WHEN PAGE OPENS
  // =======================================================

  useEffect(() => {

    loadEmergencies();

  }, []);


  // =======================================================
  // EDIT BUTTON
  // =======================================================

  const handleEdit = (emergency) => {

    setEditingEmergency(emergency);


    // -----------------------------------------------------
    // GET EXISTING COORDINATES
    // -----------------------------------------------------

    const latitude =
      emergency.latitude !== null &&
      emergency.latitude !== undefined &&
      emergency.latitude !== ""
        ? Number(emergency.latitude)
        : 17.385;

    const longitude =
      emergency.longitude !== null &&
      emergency.longitude !== undefined &&
      emergency.longitude !== ""
        ? Number(emergency.longitude)
        : 78.4867;


    // -----------------------------------------------------
    // SET MAP POSITION
    // -----------------------------------------------------

    setEditPosition([
      latitude,
      longitude,
    ]);


    // -----------------------------------------------------
    // SET FORM
    // -----------------------------------------------------

    setEditForm({

      emergencyType:
        emergency.emergencyType || "",

      severity:
        emergency.severity || "",

      location:
        emergency.location || "",

      latitude:
        emergency.latitude ?? "",

      longitude:
        emergency.longitude ?? "",

      description:
        emergency.description || "",

      contactNumber:
        emergency.contactNumber || "",
    });
  };


  // =======================================================
  // EDIT INPUT CHANGE
  // =======================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));


    // -----------------------------------------------------
    // MANUAL LATITUDE CHANGE
    // -----------------------------------------------------

    if (name === "latitude") {

      const latitude = Number(value);

      if (
        !Number.isNaN(latitude) &&
        editPosition
      ) {

        setEditPosition([
          latitude,
          editPosition[1],
        ]);
      }
    }


    // -----------------------------------------------------
    // MANUAL LONGITUDE CHANGE
    // -----------------------------------------------------

    if (name === "longitude") {

      const longitude = Number(value);

      if (
        !Number.isNaN(longitude) &&
        editPosition
      ) {

        setEditPosition([
          editPosition[0],
          longitude,
        ]);
      }
    }
  };


  // =======================================================
  // MAP LOCATION CHANGE
  // =======================================================

  const handleMapLocationChange = (
    newPosition
  ) => {

    setEditPosition(newPosition);

    setEditForm((previous) => ({

      ...previous,

      latitude:
        newPosition[0].toFixed(6),

      longitude:
        newPosition[1].toFixed(6),

    }));
  };


  // =======================================================
  // UPDATE EMERGENCY
  // =======================================================

  const handleUpdate = async (e) => {

    e.preventDefault();

    const email = getCitizenEmail();

    if (!email) {

      alert(
        "Citizen login information not found."
      );

      return;
    }


    try {

      const params =
        new URLSearchParams();


      // ---------------------------------------------------
      // CITIZEN EMAIL
      // ---------------------------------------------------

      params.append(
        "citizenEmail",
        email
      );


      // ---------------------------------------------------
      // EMERGENCY TYPE
      // ---------------------------------------------------

      params.append(
        "emergencyType",
        editForm.emergencyType ||
          "N/A"
      );


      // ---------------------------------------------------
      // SEVERITY
      // ---------------------------------------------------

      params.append(
        "severity",
        editForm.severity ||
          "N/A"
      );


      // ---------------------------------------------------
      // LOCATION
      // ---------------------------------------------------

      params.append(
        "location",
        editForm.location ||
          "N/A"
      );


      // ---------------------------------------------------
      // LATITUDE
      // ---------------------------------------------------

      params.append(
        "latitude",
        editForm.latitude ||
          "0"
      );


      // ---------------------------------------------------
      // LONGITUDE
      // ---------------------------------------------------

      params.append(
        "longitude",
        editForm.longitude ||
          "0"
      );


      // ---------------------------------------------------
      // DESCRIPTION
      // ---------------------------------------------------

      params.append(
        "description",
        editForm.description ||
          "N/A"
      );


      // ---------------------------------------------------
      // CONTACT
      // ---------------------------------------------------

      params.append(
        "contactNumber",
        editForm.contactNumber ||
          "N/A"
      );


      // ---------------------------------------------------
      // SEND UPDATE
      // ---------------------------------------------------

      const response =
        await fetch(
          `http://localhost:8081/api/emergencies/${editingEmergency.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body: params,
          }
        );


      const responseText =
        await response.text();


      let result;

      try {

        result = responseText
          ? JSON.parse(responseText)
          : null;

      } catch {

        result = responseText;
      }


      if (!response.ok) {

        throw new Error(

          typeof result === "string" &&
          result

            ? result

            : result?.message ||
              "Update failed"
        );
      }


      alert(
        "Emergency updated successfully."
      );


      setEditingEmergency(null);

      setEditPosition(null);


      await loadEmergencies();

    } catch (error) {

      console.error(
        "Update error:",
        error
      );

      alert(
        error.message ||
          "Failed to update emergency."
      );
    }
  };


  // =======================================================
  // DELETE EMERGENCY
  // =======================================================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this emergency report?"
      );


    if (!confirmDelete) {
      return;
    }


    const email =
      getCitizenEmail();


    if (!email) {

      alert(
        "Citizen login information not found."
      );

      return;
    }


    try {

      const response =
        await fetch(
          `http://localhost:8081/api/emergencies/${id}?citizenEmail=${encodeURIComponent(
            email
          )}`,
          {
            method: "DELETE",
          }
        );


      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Delete failed"
        );
      }


      alert(
        "Emergency deleted successfully."
      );


      await loadEmergencies();

    } catch (error) {

      console.error(
        "Delete error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete emergency."
      );
    }
  };


  // =======================================================
  // IMAGE URL
  // =======================================================

  const getImageUrl = (
    emergency
  ) => {

    if (
      !emergency ||
      !emergency.imagePath
    ) {

      return "/images/default-emergency.jpg";
    }


    if (
      emergency.imagePath.startsWith(
        "http"
      )
    ) {

      return emergency.imagePath;
    }


    return `http://localhost:8081${emergency.imagePath}`;
  };


  // =======================================================
  // STATUS CLASS
  // =======================================================

  const getStatusClass = (
    status
  ) => {

    return (
      status ||
      "PENDING"
    )
      .toLowerCase()
      .replace(/\s+/g, "-");
  };


  // =======================================================
  // SEVERITY CLASS
  // =======================================================

  const getSeverityClass = (
    severity
  ) => {

    return (
      severity ||
      "N/A"
    )
      .toLowerCase()
      .replace(/\s+/g, "-");
  };


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (

      <div className="citizen-emergency-loading">

        <div className="loading-card">

          <div className="loading-spinner"></div>

          <h2>
            Loading Emergency Reports
          </h2>

          <p>
            Please wait while we retrieve
            your reports...
          </p>

        </div>

      </div>
    );
  }


  // =======================================================
  // MAIN PAGE
  // =======================================================

  return (

    <div className="citizen-emergency-page">


      {/* ===================================================
          HEADER
      ==================================================== */}

      <header className="citizen-emergency-header">

        <div className="header-brand">

          <div className="brand-icon">
            🚨
          </div>

          <div className="brand-content">

            <span className="brand-name">
              ResQNet
            </span>

            <span className="brand-subtitle">
              Emergency Response Network
            </span>

          </div>

        </div>


        <div className="header-title">

          <h1>
            My Emergency Reports
          </h1>

          <p>
            View and manage the emergencies
            you have reported.
          </p>

        </div>


        <button
          type="button"
          className="back-dashboard-btn"
          onClick={() =>
            navigate(
              "/citizen/dashboard"
            )
          }
        >

          <span>
            ←
          </span>

          Dashboard

        </button>

      </header>


      {/* ===================================================
          CONTENT
      ==================================================== */}

      <main className="citizen-emergency-content">


        {/* =================================================
            SUMMARY
        ================================================== */}

        <div className="reports-summary">

          <div className="summary-left">

            <div className="summary-icon">
              📋
            </div>

            <div>

              <span className="summary-label">
                Total Reports
              </span>

              <strong className="summary-number">
                {emergencies.length}
              </strong>

            </div>

          </div>


          <button
            type="button"
            className="new-report-btn"
            onClick={() =>
              navigate(
                "/citizen/report-emergency"
              )
            }
          >

            <span>
              +
            </span>

            Report Emergency

          </button>

        </div>


        {/* =================================================
            EMPTY
        ================================================== */}

        {emergencies.length === 0 ? (

          <div className="no-emergency">

            <div className="empty-icon">
              🚨
            </div>

            <h2>
              No Emergency Reports
            </h2>

            <p>
              You have not reported any
              emergencies yet. Your submitted
              reports will appear here.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/citizen/report-emergency"
                )
              }
            >

              <span>
                +
              </span>

              Report Emergency

            </button>

          </div>

        ) : (

          /* =================================================
             EMERGENCY GRID
          ================================================== */

          <div className="emergency-grid">

            {emergencies.map(
              (emergency) => (

                <article
                  className="emergency-card"
                  key={emergency.id}
                >


                  {/* =======================================
                      CARD TOP
                  ======================================== */}

                  <div className="emergency-card-top">

                    <div className="report-id">

                      <span className="report-label">
                        Report ID
                      </span>

                      <strong>
                        #{emergency.id}
                      </strong>

                    </div>


                    <span
                      className={`status-badge ${getStatusClass(
                        emergency.status
                      )}`}
                    >

                      {emergency.status ||
                        "PENDING"}

                    </span>

                  </div>


                  {/* =======================================
                      EMERGENCY TYPE
                  ======================================== */}

                  <div className="emergency-type">

                    <div className="type-icon">
                      🚨
                    </div>

                    <div className="type-content">

                      <h2>
                        {emergency.emergencyType ||
                          "N/A"}
                      </h2>

                      <span
                        className={`severity ${getSeverityClass(
                          emergency.severity
                        )}`}
                      >

                        {emergency.severity ||
                          "N/A"}

                      </span>

                    </div>

                  </div>


                  {/* =======================================
                      DETAILS
                  ======================================== */}

                  <div className="emergency-details">


                    <div className="detail-item">

                      <span className="detail-label">

                        <span className="detail-icon">
                          📍
                        </span>

                        Location

                      </span>

                      <strong>
                        {emergency.location ||
                          "N/A"}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span className="detail-label">

                        <span className="detail-icon">
                          📝
                        </span>

                        Description

                      </span>

                      <strong className="description-text">
                        {emergency.description ||
                          "N/A"}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span className="detail-label">

                        <span className="detail-icon">
                          📞
                        </span>

                        Contact

                      </span>

                      <strong>
                        {emergency.contactNumber ||
                          "N/A"}
                      </strong>

                    </div>


                    <div className="detail-item">

                      <span className="detail-label">

                        <span className="detail-icon">
                          🗺️
                        </span>

                        Coordinates

                      </span>

                      <strong>

                        {emergency.latitude ??
                          "N/A"}

                        {" , "}

                        {emergency.longitude ??
                          "N/A"}

                      </strong>

                    </div>


                    <div className="detail-item">

                      <span className="detail-label">

                        <span className="detail-icon">
                          🕒
                        </span>

                        Reported

                      </span>

                      <strong>

                        {emergency.createdAt
                          ? new Date(
                              emergency.createdAt
                            ).toLocaleString()
                          : "N/A"}

                      </strong>

                    </div>

                  </div>


                  {/* =======================================
                      IMAGE
                  ======================================== */}

                  <div className="emergency-image-container">

                    <img
                      src={getImageUrl(
                        emergency
                      )}
                      alt={
                        emergency.emergencyType ||
                        "Emergency"
                      }
                      className="emergency-image"
                      onError={(e) => {

                        e.currentTarget.onerror =
                          null;

                        e.currentTarget.src =
                          "/images/default-emergency.jpg";

                      }}
                    />

                    <div className="image-overlay">

                      <span>
                        Emergency Evidence
                      </span>

                    </div>

                  </div>


                  {/* =======================================
                      ACTIONS
                  ======================================== */}

                  <div className="emergency-actions">

                    <button
                      type="button"
                      className="edit-emergency-btn"
                      onClick={() =>
                        handleEdit(
                          emergency
                        )
                      }
                    >

                      <span>
                        ✏️
                      </span>

                      Edit Report

                    </button>


                    <button
                      type="button"
                      className="delete-emergency-btn"
                      onClick={() =>
                        handleDelete(
                          emergency.id
                        )
                      }
                    >

                      <span>
                        🗑️
                      </span>

                      Delete

                    </button>

                  </div>

                </article>
              )
            )}

          </div>
        )}


      </main>


      {/* =====================================================
          EDIT MODAL
      ====================================================== */}

      {editingEmergency && (

        <div
          className="edit-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {

              setEditingEmergency(
                null
              );

              setEditPosition(
                null
              );
            }
          }}
        >


          <div className="edit-modal">


            {/* ===============================================
                MODAL HEADER
            ================================================ */}

            <div className="edit-modal-header">

              <div className="edit-modal-title">

                <div className="modal-icon">
                  ✏️
                </div>

                <div>

                  <h2>
                    Edit Emergency
                  </h2>

                  <p>
                    Report #
                    {editingEmergency.id}
                  </p>

                </div>

              </div>


              <button
                type="button"
                className="edit-close"
                onClick={() => {

                  setEditingEmergency(
                    null
                  );

                  setEditPosition(
                    null
                  );

                }}
              >
                ×
              </button>

            </div>


            {/* ===============================================
                FORM
            ================================================ */}

            <form
              onSubmit={handleUpdate}
              className="edit-form"
            >


              <div className="edit-form-grid">


                {/* =========================================
                    EMERGENCY TYPE
                ========================================== */}

                <label>

                  <span>
                    Emergency Type
                  </span>

                  <input
                    type="text"
                    name="emergencyType"
                    value={
                      editForm.emergencyType
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </label>


                {/* =========================================
                    SEVERITY
                ========================================== */}

                <label>

                  <span>
                    Severity
                  </span>

                  <select
                    name="severity"
                    value={
                      editForm.severity
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Severity
                    </option>

                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>

                    <option value="CRITICAL">
                      Critical
                    </option>

                  </select>

                </label>


                {/* =========================================
                    LOCATION TEXT
                ========================================== */}

                <label className="full-edit-field">

                  <span>
                    Location / Address
                  </span>

                  <input
                    type="text"
                    name="location"
                    value={
                      editForm.location
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter emergency location"
                    required
                  />

                </label>


                {/* =========================================
                    MAP
                ========================================== */}

                <div className="edit-location-section">


                  <div className="edit-location-heading">

                    <h3>
                      📍 Emergency Location on Map
                    </h3>

                    <p>
                      Click anywhere on the map
                      to change the emergency
                      location.
                    </p>

                  </div>


                  <div className="edit-map-wrapper">

                    <MapContainer
                      key={
                        editingEmergency.id
                      }
                      center={
                        editPosition ||
                        [
                          17.385,
                          78.4867,
                        ]
                      }
                      zoom={15}
                      scrollWheelZoom={
                        true
                      }
                      className="edit-emergency-map"
                    >

                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />


                      <EditLocationMarker
                        position={
                          editPosition
                        }
                        setPosition={
                          handleMapLocationChange
                        }
                      />

                    </MapContainer>

                  </div>


                  <div className="edit-map-hint">

                    📍 Click on the map to
                    select a new location.
                    The coordinates will
                    update automatically.

                  </div>


                  {/* =======================================
                      COORDINATES
                  ======================================== */}

                  <div className="edit-two-column">


                    <label>

                      <span>
                        Latitude
                      </span>

                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={
                          editForm.latitude
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </label>


                    <label>

                      <span>
                        Longitude
                      </span>

                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={
                          editForm.longitude
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </label>

                  </div>

                </div>


                {/* =========================================
                    DESCRIPTION
                ========================================== */}

                <label className="full-edit-field">

                  <span>
                    Description
                  </span>

                  <textarea
                    name="description"
                    value={
                      editForm.description
                    }
                    onChange={
                      handleChange
                    }
                    rows="5"
                    placeholder="Describe the emergency..."
                    required
                  />

                </label>


                {/* =========================================
                    CONTACT
                ========================================== */}

                <label className="full-edit-field">

                  <span>
                    Contact Number
                  </span>

                  <input
                    type="text"
                    name="contactNumber"
                    value={
                      editForm.contactNumber
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter contact number"
                  />

                </label>


              </div>


              {/* =============================================
                  MODAL ACTIONS
              ============================================== */}

              <div className="edit-modal-actions">

                <button
                  type="button"
                  className="cancel-edit-btn"
                  onClick={() => {

                    setEditingEmergency(
                      null
                    );

                    setEditPosition(
                      null
                    );

                  }}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-edit-btn"
                >

                  ✓ Save Changes

                </button>

              </div>


            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default CitizenEmergencies;