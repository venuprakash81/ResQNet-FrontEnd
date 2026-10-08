import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./MedicalEmergencies.css";

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
// MEDICAL EMERGENCIES
// =========================================================

function MedicalEmergencies() {

  const navigate = useNavigate();

  const [emergencies, setEmergencies] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =======================================================
  // CHECK VALID COORDINATES
  // =======================================================

  const hasValidLocation = (emergency) => {

    const latitude = Number(
      emergency?.latitude
    );

    const longitude = Number(
      emergency?.longitude
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return false;
    }

    if (
      latitude < -90 ||
      latitude > 90
    ) {
      return false;
    }

    if (
      longitude < -180 ||
      longitude > 180
    ) {
      return false;
    }

    return true;
  };


  // =======================================================
  // LOAD ALL EMERGENCIES
  // =======================================================

  const loadMedicalEmergencies = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await fetch(
        "http://localhost:8081/api/emergencies"
      );

      if (!response.ok) {

        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "ALL EMERGENCIES:",
        data
      );


      // ===================================================
      // FILTER MEDICAL
      // ===================================================

      const medicalOnly =
        Array.isArray(data)
          ? data.filter((emergency) => {

              const type =
                emergency?.emergencyType
                  ?.toString()
                  .trim()
                  .toLowerCase();

              return (
                type === "medical" ||
                type ===
                  "medical emergency"
              );

            })
          : [];


      console.log(
        "MEDICAL EMERGENCIES:",
        medicalOnly
      );


      setEmergencies(
        medicalOnly
      );

    } catch (err) {

      console.error(
        "Error loading medical emergencies:",
        err
      );

      setError(
        err.message ||
        "Unable to load medical emergencies."
      );

    } finally {

      setLoading(false);
    }
  };


  // =======================================================
  // LOAD PAGE
  // =======================================================

  useEffect(() => {

    loadMedicalEmergencies();

  }, []);


  // =======================================================
  // IMAGE URL
  // =======================================================

  const getImageUrl = (
    emergency
  ) => {

    if (
      !emergency?.imagePath
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

    return (
      `http://localhost:8081` +
      emergency.imagePath
    );
  };


  // =======================================================
  // STATUS
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
  // SEVERITY
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

      <div className="medical-loading">

        <div className="medical-loading-card">

          <div className="medical-spinner"></div>

          <h2>
            Loading Medical Emergencies
          </h2>

          <p>
            Please wait while we retrieve
            emergency reports...
          </p>

        </div>

      </div>
    );
  }


  // =======================================================
  // MAIN
  // =======================================================

  return (

    <div className="medical-emergency-page">


      {/* =================================================
          HEADER
      ================================================== */}

      <header className="medical-header">

        <div className="medical-brand">

          <div className="medical-brand-icon">
            🏥
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


        <div className="medical-header-title">

          <h1>
            Medical Emergencies
          </h1>

          <p>
            All reported medical emergencies
          </p>

        </div>


        <button
          type="button"
          className="medical-dashboard-btn"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Back
        </button>

      </header>


      {/* =================================================
          CONTENT
      ================================================== */}

      <main className="medical-content">


        {/* =================================================
            SUMMARY
        ================================================== */}

        <div className="medical-summary">

          <div className="medical-summary-left">

            <div className="medical-summary-icon">
              🚑
            </div>

            <div>

              <span>
                Total Medical Emergencies
              </span>

              <strong>
                {emergencies.length}
              </strong>

            </div>

          </div>


          <button
            type="button"
            className="refresh-medical-btn"
            onClick={
              loadMedicalEmergencies
            }
          >
            ↻ Refresh
          </button>

        </div>


        {/* =================================================
            ERROR
        ================================================== */}

        {error && (

          <div className="medical-error">

            <span>
              ⚠️
            </span>

            <div>

              <strong>
                Unable to load emergencies
              </strong>

              <p>
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={
                loadMedicalEmergencies
              }
            >
              Try Again
            </button>

          </div>
        )}


        {/* =================================================
            EMPTY
        ================================================== */}

        {!error &&
          emergencies.length === 0 && (

            <div className="medical-empty">

              <div className="medical-empty-icon">
                🏥
              </div>

              <h2>
                No Medical Emergencies
              </h2>

              <p>
                There are currently no reported
                medical emergencies.
              </p>

            </div>
          )}


        {/* =================================================
            MEDICAL CARDS
        ================================================== */}

        {emergencies.length > 0 && (

          <div className="medical-grid">

            {emergencies.map(
              (emergency) => {

                const hasLocation =
                  hasValidLocation(
                    emergency
                  );


                const latitude =
                  Number(
                    emergency.latitude
                  );

                const longitude =
                  Number(
                    emergency.longitude
                  );


                return (

                  <div
                    className="medical-card"
                    key={emergency.id}
                  >


                    {/* =====================================
                        CARD HEADER
                    ====================================== */}

                    <div className="medical-card-header">

                      <div>

                        <span className="medical-report-label">
                          Emergency Report
                        </span>

                        <strong>
                          #{emergency.id}
                        </strong>

                      </div>


                      <span
                        className={`medical-status ${getStatusClass(
                          emergency.status
                        )}`}
                      >

                        {emergency.status ||
                          "PENDING"}

                      </span>

                    </div>


                    {/* =====================================
                        TITLE
                    ====================================== */}

                    <div className="medical-title">

                      <div className="medical-title-icon">
                        🚑
                      </div>

                      <div>

                        <h2>
                          Medical Emergency
                        </h2>

                        <span
                          className={`medical-severity ${getSeverityClass(
                            emergency.severity
                          )}`}
                        >

                          {emergency.severity ||
                            "N/A"}

                        </span>

                      </div>

                    </div>


                    {/* =====================================
                        DETAILS
                    ====================================== */}

                    <div className="medical-details">


                      <div className="medical-detail">

                        <span>
                          📍 Location
                        </span>

                        <strong>
                          {emergency.location ||
                            "N/A"}
                        </strong>

                      </div>


                      <div className="medical-detail">

                        <span>
                          📝 Description
                        </span>

                        <strong>
                          {emergency.description ||
                            "N/A"}
                        </strong>

                      </div>


                      <div className="medical-detail">

                        <span>
                          📞 Contact Number
                        </span>

                        <strong>
                          {emergency.contactNumber ||
                            "N/A"}
                        </strong>

                      </div>


                      <div className="medical-detail">

                        <span>
                          🗺️ Coordinates
                        </span>

                        <strong>

                          {hasLocation
                            ? `${latitude.toFixed(
                                6
                              )} , ${longitude.toFixed(
                                6
                              )}`
                            : "Location coordinates unavailable"}

                        </strong>

                      </div>


                      <div className="medical-detail">

                        <span>
                          🕒 Reported Time
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


                    {/* =====================================
                        IMAGE
                    ====================================== */}

                    <div className="medical-image">

                      <img
                        src={getImageUrl(
                          emergency
                        )}
                        alt="Medical Emergency"
                        onError={(e) => {

                          e.currentTarget.onerror =
                            null;

                          e.currentTarget.src =
                            "/images/default-emergency.jpg";

                        }}
                      />

                    </div>


                    {/* =====================================
                        MAP
                    ====================================== */}

                    {hasLocation ? (

                      <div className="medical-map">

                        <MapContainer
                          center={[
                            latitude,
                            longitude,
                          ]}
                          zoom={15}
                          scrollWheelZoom={false}
                          style={{
                            width: "100%",
                            height: "100%",
                          }}
                        >

                          <TileLayer
                            attribution="&copy; OpenStreetMap contributors"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />


                          <Marker
                            position={[
                              latitude,
                              longitude,
                            ]}
                          >

                            <Popup>

                              <div
                                style={{
                                  minWidth:
                                    "170px",
                                }}
                              >

                                <strong>
                                  🚑 Medical Emergency
                                </strong>

                                <br />

                                <br />

                                <span>
                                  {emergency.location ||
                                    "Location unavailable"}
                                </span>

                                <br />

                                <br />

                                <span>
                                  Latitude:{" "}
                                  {latitude.toFixed(
                                    6
                                  )}
                                </span>

                                <br />

                                <span>
                                  Longitude:{" "}
                                  {longitude.toFixed(
                                    6
                                  )}
                                </span>

                              </div>

                            </Popup>

                          </Marker>

                        </MapContainer>

                      </div>

                    ) : (

                      <div className="medical-no-map">

                        <div>
                          📍
                        </div>

                        <strong>
                          Location Not Available
                        </strong>

                        <span>
                          This emergency does not
                          contain valid map coordinates.
                        </span>

                      </div>

                    )}


                    {/* =====================================
                        FOOTER
                    ====================================== */}

                    <div className="medical-card-footer">

                      {hasLocation ? (

                        <button
                          type="button"
                          className="view-location-btn"
                          onClick={() => {

                            window.open(
                              `https://www.google.com/maps?q=${latitude},${longitude}`,
                              "_blank"
                            );

                          }}
                        >

                          📍 Open Location

                        </button>

                      ) : (

                        <button
                          type="button"
                          className="view-location-btn disabled"
                          disabled
                        >

                          📍 Location Unavailable

                        </button>

                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </main>

    </div>
  );
}

export default MedicalEmergencies;