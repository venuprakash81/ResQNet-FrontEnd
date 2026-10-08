import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./ReportEmergency.css";

/* =====================================================
   LEAFLET MARKER FIX
===================================================== */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


/* =====================================================
   DEFAULT LOCATION
===================================================== */

const DEFAULT_LOCATION = {
  lat: 17.3850,
  lng: 78.4867,
};


/* =====================================================
   MAP MARKER
===================================================== */

function LocationMarker({
  position,
  setPosition,
}) {
  useMapEvents({
    click(event) {
      const newPosition = {
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      };

      setPosition(newPosition);
    },
  });

  return position ? (
    <Marker
      position={[
        position.lat,
        position.lng,
      ]}
    />
  ) : null;
}


/* =====================================================
   COMPONENT
===================================================== */

const ReportEmergency = () => {

  const navigate = useNavigate();


  /* ===================================================
     FORM
  =================================================== */

  const [formData, setFormData] = useState({
    emergencyType: "",
    severity: "",
    location: "",
    description: "",
    contactNumber: "",
  });


  /* ===================================================
     MAP
  =================================================== */

  const [position, setPosition] =
    useState(DEFAULT_LOCATION);


  /* ===================================================
     IMAGE
  =================================================== */

  const [image, setImage] =
    useState(null);


  /* ===================================================
     STATUS
  =================================================== */

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");


  /* ===================================================
     SUCCESS MODAL
  =================================================== */

  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  const [submittedData, setSubmittedData] =
    useState(null);


  /* ===================================================
     HANDLE INPUT
  =================================================== */

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* ===================================================
     IMAGE
  =================================================== */

  const handleImageChange = (event) => {

    const file =
      event.target.files[0];

    if (file) {
      setImage(file);
    }
  };


  /* ===================================================
     MAP LOCATION
  =================================================== */

  const handleMapLocation = (
    newPosition
  ) => {

    setPosition(newPosition);

    setFormData((previous) => ({
      ...previous,

      location:
        `${newPosition.lat.toFixed(6)}, ` +
        `${newPosition.lng.toFixed(6)}`,
    }));
  };


  /* ===================================================
     CURRENT LOCATION
  =================================================== */

  const getCurrentLocation = () => {

    if (!navigator.geolocation) {

      setMessage(
        "Location is not supported by your browser."
      );

      setMessageType("error");

      return;
    }


    setMessage(
      "Getting your current location..."
    );

    setMessageType("info");


    navigator.geolocation.getCurrentPosition(

      (location) => {

        const newPosition = {

          lat:
            location.coords.latitude,

          lng:
            location.coords.longitude,

        };


        setPosition(
          newPosition
        );


        setFormData((previous) => ({
          ...previous,

          location:
            `${newPosition.lat.toFixed(6)}, ` +
            `${newPosition.lng.toFixed(6)}`,
        }));


        setMessage(
          "Current location selected."
        );

        setMessageType(
          "success"
        );

      },


      () => {

        setMessage(
          "Unable to get your current location."
        );

        setMessageType(
          "error"
        );

      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }

    );
  };


  /* ===================================================
     GET CITIZEN EMAIL
  =================================================== */

  const getCitizenEmail = () => {

    try {

      const citizen = JSON.parse(
        localStorage.getItem("citizen") || "{}"
      );

      return (
        citizen.email ||
        localStorage.getItem("citizenEmail") ||
        ""
      );

    } catch (error) {

      console.error(
        "Citizen data error:",
        error
      );

      return (
        localStorage.getItem(
          "citizenEmail"
        ) || ""
      );
    }
  };


  /* ===================================================
     SUBMIT
  =================================================== */

  const handleSubmit = async (event) => {

    event.preventDefault();


    setMessage("");
    setMessageType("");


    /* ================================================
       VALIDATION
    ================================================ */

    if (!formData.emergencyType) {

      setMessage(
        "Please select an emergency type."
      );

      setMessageType("error");

      return;
    }


    if (!formData.severity) {

      setMessage(
        "Please select the severity."
      );

      setMessageType("error");

      return;
    }


    if (!position) {

      setMessage(
        "Please select the emergency location."
      );

      setMessageType("error");

      return;
    }


    /* ================================================
       GET LOGGED-IN CITIZEN EMAIL
    ================================================ */

    const citizenEmail =
      getCitizenEmail();


    if (!citizenEmail) {

      setMessage(
        "Citizen login information not found. Please login again."
      );

      setMessageType("error");

      return;
    }


    setLoading(true);


    try {

      /* ==============================================
         FORM DATA
      ============================================== */

      const data =
        new FormData();


      /* ==============================================
         IMPORTANT:
         SEND CITIZEN EMAIL
      ============================================== */

      data.append(
        "citizenEmail",
        citizenEmail
      );


      data.append(
        "emergencyType",
        formData.emergencyType || "N/A"
      );


      data.append(
        "severity",
        formData.severity || "N/A"
      );


      data.append(
        "location",
        formData.location || "N/A"
      );


      data.append(
        "latitude",
        position?.lat ?? "0"
      );


      data.append(
        "longitude",
        position?.lng ?? "0"
      );


      data.append(
        "description",
        formData.description || "N/A"
      );


      data.append(
        "contactNumber",
        formData.contactNumber || "N/A"
      );


      /* ==============================================
         IMAGE
      ============================================== */

      if (image) {

        data.append(
          "image",
          image
        );
      }


      /* ==============================================
         SEND TO BACKEND
      ============================================== */

      const response =
        await fetch(
          "http://localhost:8081/api/emergencies/report",
          {
            method: "POST",
            body: data,
          }
        );


      /* ==============================================
         HANDLE ERROR
      ============================================== */

      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
          "Emergency report failed."
        );
      }


      /* ==============================================
         READ RESPONSE
      ============================================== */

      const result =
        await response.json();


      console.log(
        "Emergency submitted:",
        result
      );


      /* ==============================================
         PREPARE SUCCESS DATA
      ============================================== */

      const successData = {

        id:
          result.id ||
          "N/A",

        emergencyType:
          formData.emergencyType ||
          "N/A",

        severity:
          formData.severity ||
          "N/A",

        location:
          formData.location ||
          "N/A",

        latitude:
          position?.lat !== undefined
            ? position.lat.toFixed(6)
            : "N/A",

        longitude:
          position?.lng !== undefined
            ? position.lng.toFixed(6)
            : "N/A",

        description:
          formData.description ||
          "N/A",

        contactNumber:
          formData.contactNumber ||
          "N/A",

        image:
          image
            ? URL.createObjectURL(image)
            : "/images/default-emergency.jpg",

        imageName:
          image
            ? image.name
            : "Default Emergency Image",

        status:
          result.status ||
          "PENDING",

        createdAt:
          result.createdAt ||
          new Date().toLocaleString(),

      };


      setSubmittedData(
        successData
      );


      /* ==============================================
         SHOW SUCCESS WINDOW
      ============================================== */

      setShowSuccessModal(
        true
      );


      setMessage(
        "Emergency reported successfully."
      );

      setMessageType(
        "success"
      );


      /* ==============================================
         CLEAR FORM
      ============================================== */

      setFormData({

        emergencyType: "",
        severity: "",
        location: "",
        description: "",
        contactNumber: "",

      });


      setPosition(null);

      setImage(null);


      const imageInput =
        document.getElementById(
          "emergencyImage"
        );


      if (imageInput) {
        imageInput.value = "";
      }


    } catch (error) {

      console.error(
        "Emergency error:",
        error
      );


      setMessage(
        "Unable to submit emergency. Please try again."
      );

      setMessageType(
        "error"
      );

    } finally {

      setLoading(false);

    }

  };


  /* ===================================================
     CLOSE SUCCESS MODAL
  =================================================== */

  const closeSuccessModal = () => {

    setShowSuccessModal(false);

  };


  /* ===================================================
     UI
  =================================================== */

  return (

    <div className="report-emergency-page">


      {/* =============================================
          HEADER
      ============================================== */}

      <header className="report-header">

        <div
          className="report-logo"
          onClick={() =>
            navigate(
              "/citizen/dashboard"
            )
          }
        >

          <div className="report-logo-icon">
            R
          </div>

          <div>

            <h2>
              ResQNet
            </h2>

            <span>
              Emergency Response Network
            </span>

          </div>

        </div>


        <button
          className="back-dashboard-btn"
          onClick={() =>
            navigate(
              "/citizen/dashboard"
            )
          }
        >
          ← Dashboard
        </button>

      </header>


      {/* =============================================
          MAIN
      ============================================== */}

      <main className="report-container">


        {/* TITLE */}

        <div className="report-title-section">

          <div className="danger-icon">
            !
          </div>

          <div>

            <h1>
              Report an Emergency
            </h1>

            <p>
              Provide emergency information
              and select the location on the map.
            </p>

          </div>

        </div>


        {/* WARNING */}

        <div className="emergency-warning">

          <strong>
            Emergency?
          </strong>

          <span>
            Provide accurate information so
            responders can reach the location.
          </span>

        </div>


        {/* ==========================================
            FORM
        =========================================== */}

        <form
          className="emergency-form"
          onSubmit={handleSubmit}
        >


          {/* ==========================================
              EMERGENCY INFORMATION
          =========================================== */}

          <div className="form-section">

            <div className="section-heading">

              <span>
                01
              </span>

              <div>

                <h3>
                  Emergency Information
                </h3>

                <p>
                  Tell us what happened.
                </p>

              </div>

            </div>


            <div className="form-grid">


              {/* TYPE */}

              <div className="form-group">

                <label>
                  Emergency Type
                  <span>*</span>
                </label>


                <select
                  name="emergencyType"
                  value={
                    formData.emergencyType
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select emergency type
                  </option>

                  <option value="Medical Emergency">
                    Medical Emergency
                  </option>

                  <option value="Fire">
                    Fire
                  </option>

                  <option value="Road Accident">
                    Road Accident
                  </option>

                  <option value="Natural Disaster">
                    Natural Disaster
                  </option>

                  <option value="Flood">
                    Flood
                  </option>

                  <option value="Building Collapse">
                    Building Collapse
                  </option>

                  <option value="Missing Person">
                    Missing Person
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* SEVERITY */}

              <div className="form-group">

                <label>
                  Severity
                  <span>*</span>
                </label>


                <select
                  name="severity"
                  value={
                    formData.severity
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select severity
                  </option>

                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                  <option value="Critical">
                    Critical
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* ==========================================
              LOCATION
          =========================================== */}

          <div className="form-section">

            <div className="section-heading">

              <span>
                02
              </span>

              <div>

                <h3>
                  Emergency Location
                </h3>

                <p>
                  Click on the map to select the
                  emergency location.
                </p>

              </div>

            </div>


            <div className="map-wrapper">

              <MapContainer
                center={[
                  DEFAULT_LOCATION.lat,
                  DEFAULT_LOCATION.lng,
                ]}
                zoom={12}
                scrollWheelZoom={true}
                className="emergency-map"
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                <LocationMarker
                  position={position}
                  setPosition={
                    handleMapLocation
                  }
                />

              </MapContainer>

            </div>


            <button
              type="button"
              className="current-location-btn"
              onClick={
                getCurrentLocation
              }
            >
              📍 Use My Current Location
            </button>


            <div className="selected-location">

              <div className="location-title">
                📌 Selected Location
              </div>


              {position ? (

                <div className="coordinates">

                  <div>

                    <strong>
                      Latitude
                    </strong>

                    <span>
                      {position.lat.toFixed(6)}
                    </span>

                  </div>


                  <div>

                    <strong>
                      Longitude
                    </strong>

                    <span>
                      {position.lng.toFixed(6)}
                    </span>

                  </div>

                </div>

              ) : (

                <p>
                  N/A
                </p>

              )}

            </div>

          </div>


          {/* ==========================================
              DESCRIPTION
          =========================================== */}

          <div className="form-section">

            <div className="section-heading">

              <span>
                03
              </span>

              <div>

                <h3>
                  Emergency Details
                </h3>

                <p>
                  Describe the situation.
                </p>

              </div>

            </div>


            <div className="form-group">

              <label>
                Description
              </label>


              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                placeholder="Describe the emergency..."
                rows="6"
              />

            </div>

          </div>


          {/* ==========================================
              CONTACT
          =========================================== */}

          <div className="form-section">

            <div className="section-heading">

              <span>
                04
              </span>

              <div>

                <h3>
                  Contact Information
                </h3>

                <p>
                  Contact number for responders.
                </p>

              </div>

            </div>


            <div className="form-group">

              <label>
                Contact Number
              </label>


              <input
                type="tel"
                name="contactNumber"
                value={
                  formData.contactNumber
                }
                onChange={
                  handleChange
                }
                placeholder="Enter contact number"
                maxLength="10"
              />

            </div>

          </div>


          {/* ==========================================
              IMAGE
          =========================================== */}

          <div className="form-section">

            <div className="section-heading">

              <span>
                05
              </span>

              <div>

                <h3>
                  Supporting Image
                </h3>

                <p>
                  Upload an image if required.
                </p>

              </div>

            </div>


            <div className="upload-area">

              <div className="upload-icon">
                📷
              </div>


              <label
                htmlFor="emergencyImage"
                className="upload-label"
              >
                Choose Image
              </label>


              <input
                id="emergencyImage"
                type="file"
                accept="image/*"
                onChange={
                  handleImageChange
                }
              />


              {image && (

                <p className="selected-file">

                  Selected:
                  {" "}
                  {image.name}

                </p>

              )}


              {!image && (

                <p className="default-image-text">

                  Default emergency image
                  will be used if no image
                  is uploaded.

                </p>

              )}

            </div>

          </div>


          {/* MESSAGE */}

          {message && (

            <div
              className={
                messageType === "success"
                  ? "success-message"
                  : messageType === "info"
                  ? "info-message"
                  : "error-message"
              }
            >
              {message}
            </div>

          )}


          {/* ACTIONS */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate(
                  "/citizen/dashboard"
                )
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              className="submit-emergency-btn"
              disabled={loading}
            >

              {loading
                ? "Submitting..."
                : "🚨 Report Emergency"}

            </button>

          </div>

        </form>

      </main>


      {/* =============================================
          SUCCESS MODAL
      ============================================== */}

      {showSuccessModal &&
        submittedData && (

        <div className="success-modal-overlay">

          <div className="success-modal">


            {/* MODAL HEADER */}

            <div className="success-modal-header">

              <div className="success-check">
                ✓
              </div>

              <div>

                <h2>
                  Emergency Reported
                </h2>

                <p>
                  Your emergency report was
                  submitted successfully.
                </p>

              </div>

            </div>


            {/* DETAILS */}

            <div className="submitted-details">

              <div className="submitted-row">

                <span>
                  Report ID
                </span>

                <strong>
                  {submittedData.id}
                </strong>

              </div>


              <div className="submitted-row">

                <span>
                  Emergency Type
                </span>

                <strong>
                  {submittedData.emergencyType}
                </strong>

              </div>


              <div className="submitted-row">

                <span>
                  Severity
                </span>

                <strong>
                  {submittedData.severity}
                </strong>

              </div>


              <div className="submitted-row">

                <span>
                  Location
                </span>

                <strong>
                  {submittedData.location}
                </strong>

              </div>


              <div className="submitted-row">

                <span>
                  Latitude
                </span>

                <strong>
                  {submittedData.latitude}
                </strong>

              </div>


              <div className="submitted-row">

                <span>
                  Longitude
                </span>

                <strong>
                  {submittedData.longitude}
                </strong>

              </div>


              <div className="submitted-row">

                <span>
                  Description
                </span>

                <strong>
                  {submittedData.description}
                </strong>

              </div>


              <div className="submitted-row">

                <span>
                  Contact
                </span>

                <strong>
                  {submittedData.contactNumber}
                </strong>

              </div>


              <div className="submitted-row">

                <span>
                  Status
                </span>

                <strong className="pending-status">
                  {submittedData.status}
                </strong>

              </div>


              <div className="submitted-image-section">

                <span>
                  Image
                </span>


                <img
                  src={
                    submittedData.image
                  }
                  alt="Emergency"
                  className="submitted-image"
                />


                <small>
                  {submittedData.imageName}
                </small>

              </div>

            </div>


            {/* BUTTONS */}

            <div className="success-modal-actions">

              <button
                className="modal-close-btn"
                onClick={
                  closeSuccessModal
                }
              >
                Close
              </button>


              <button
                className="modal-dashboard-btn"
                onClick={() =>
                  navigate(
                    "/citizen/dashboard"
                  )
                }
              >
                Go to Dashboard
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};


export default ReportEmergency;