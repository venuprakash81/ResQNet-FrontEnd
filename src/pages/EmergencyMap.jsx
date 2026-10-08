import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./EmergencyMap.css";

// ============================================================
// FIX LEAFLET DEFAULT MARKER ICON
// ============================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


// ============================================================
// DEFAULT MAP LOCATION
// Hyderabad
// ============================================================

const DEFAULT_LOCATION = [17.3850, 78.4867];


// ============================================================
// MOVE MAP TO USER LOCATION
// ============================================================

function LocateUser({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, {
        duration: 1.5,
      });
    }
  }, [position, map]);

  return null;
}


// ============================================================
// MAIN EMERGENCY MAP
// ============================================================

function EmergencyMap() {

  const [userLocation, setUserLocation] = useState(null);

  const [emergencies, setEmergencies] = useState([]);

  const [loading, setLoading] = useState(false);

  const [locationError, setLocationError] = useState("");

  const [apiError, setApiError] = useState("");


  // ==========================================================
  // GET CITIZEN CURRENT LOCATION
  // ==========================================================

  const getCurrentLocation = () => {

    setLoading(true);

    setLocationError("");

    if (!navigator.geolocation) {

      setLocationError(
        "Your browser does not support location services."
      );

      setLoading(false);

      return;
    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude = position.coords.latitude;

        const longitude = position.coords.longitude;


        setUserLocation([
          latitude,
          longitude,
        ]);

        setLoading(false);
      },


      (error) => {

        console.error("Location Error:", error);


        if (error.code === 1) {

          setLocationError(
            "Location permission denied. Please allow location access."
          );

        } else if (error.code === 2) {

          setLocationError(
            "Unable to determine your location."
          );

        } else if (error.code === 3) {

          setLocationError(
            "Location request timed out. Please try again."
          );

        } else {

          setLocationError(
            "Unable to get your current location."
          );
        }


        setLoading(false);
      },


      {
        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 0,
      }
    );
  };


  // ==========================================================
  // GET EMERGENCIES FROM SPRING BOOT
  // ==========================================================

  const fetchEmergencies = async () => {

    try {

      setApiError("");


      const response = await fetch(
        "https://resqnet-backend-1.onrender.com/api/emergencies"
      );


      if (!response.ok) {

        throw new Error(
          `Server returned ${response.status}`
        );
      }


      const data = await response.json();


      console.log(
        "Emergency API Response:",
        data
      );


      setEmergencies(
        Array.isArray(data) ? data : []
      );

    } catch (error) {

      console.error(
        "Emergency API Error:",
        error
      );


      setApiError(
        "Unable to connect to the emergency server."
      );


      // Empty array instead of fake data
      setEmergencies([]);
    }
  };


  // ==========================================================
  // LOAD EMERGENCIES WHEN PAGE OPENS
  // ==========================================================

  useEffect(() => {

    fetchEmergencies();

  }, []);


  // ==========================================================
  // REFRESH EMERGENCIES
  // ==========================================================

  const handleRefresh = () => {

    fetchEmergencies();

  };


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="emergency-map-page">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="emergency-map-header">

        <div>

          <h1>
            🚨 Emergency Map
          </h1>

          <p>
            View emergency reports and their locations
          </p>

        </div>


        <div className="header-buttons">

          <button
            className="refresh-button"
            onClick={handleRefresh}
          >
            🔄 Refresh
          </button>


          <button
            className="location-button"
            onClick={getCurrentLocation}
            disabled={loading}
          >

            {loading
              ? "Getting Location..."
              : "📍 Use My Location"}

          </button>

        </div>

      </div>


      {/* ======================================================
          API ERROR
      ====================================================== */}

      {apiError && (

        <div className="location-error">

          ⚠️ {apiError}

          <button
            onClick={handleRefresh}
            className="retry-button"
          >
            Retry
          </button>

        </div>

      )}


      {/* ======================================================
          LOCATION ERROR
      ====================================================== */}

      {locationError && (

        <div className="location-error">

          ⚠️ {locationError}

        </div>

      )}


      {/* ======================================================
          MAP
      ====================================================== */}

      <div className="map-wrapper">


        <MapContainer

          center={DEFAULT_LOCATION}

          zoom={12}

          scrollWheelZoom={true}

          className="emergency-map"

        >


          {/* ==================================================
              OPEN STREET MAP
          ================================================== */}

          <TileLayer

            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'

            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

          />


          {/* ==================================================
              CITIZEN CURRENT LOCATION
          ================================================== */}

          {userLocation && (

            <>

              <Marker
                position={userLocation}
              >

                <Popup>

                  <div className="popup-content">

                    <h3>
                      📍 Your Location
                    </h3>


                    <p>

                      <strong>
                        Latitude:
                      </strong>{" "}

                      {userLocation[0].toFixed(6)}

                    </p>


                    <p>

                      <strong>
                        Longitude:
                      </strong>{" "}

                      {userLocation[1].toFixed(6)}

                    </p>

                  </div>

                </Popup>

              </Marker>


              <LocateUser
                position={userLocation}
              />

            </>

          )}


          {/* ==================================================
              EMERGENCY MARKERS
          ================================================== */}

          {emergencies.map((emergency) => {


            // ------------------------------------------------
            // FIRST TRY LATITUDE + LONGITUDE
            // ------------------------------------------------

            let latitude =
              emergency.latitude;

            let longitude =
              emergency.longitude;


            // ------------------------------------------------
            // IF LAT/LONG ARE NULL,
            // TAKE THEM FROM LOCATION
            //
            // Example:
            // "17.421922, 78.650954"
            // ------------------------------------------------

            if (
              (latitude === null ||
                latitude === undefined ||
                latitude === "") &&
              emergency.location
            ) {

              const parts =
                String(
                  emergency.location
                ).split(",");


              if (parts.length === 2) {

                latitude =
                  parseFloat(
                    parts[0].trim()
                  );

                longitude =
                  parseFloat(
                    parts[1].trim()
                  );
              }
            }


            // ------------------------------------------------
            // CONVERT TO NUMBERS
            // ------------------------------------------------

            latitude =
              Number(latitude);

            longitude =
              Number(longitude);


            // ------------------------------------------------
            // CHECK VALID LOCATION
            // ------------------------------------------------

            if (

              Number.isNaN(latitude) ||

              Number.isNaN(longitude) ||

              latitude < -90 ||

              latitude > 90 ||

              longitude < -180 ||

              longitude > 180

            ) {

              return null;

            }


            // ------------------------------------------------
            // CREATE MARKER
            // ------------------------------------------------

            return (

              <Marker

                key={emergency.id}

                position={[
                  latitude,
                  longitude,
                ]}

              >

                <Popup>


                  <div className="emergency-popup">


                    {/* ======================================
                        TITLE
                    ====================================== */}

                    <div className="popup-title">

                      🚨{" "}

                      {emergency.emergencyType ||
                        "Emergency"}

                    </div>


                    {/* ======================================
                        DESCRIPTION
                    ====================================== */}

                    <div className="popup-row">

                      <strong>
                        Description:
                      </strong>

                      <span>

                        {emergency.description ||
                          "NA"}

                      </span>

                    </div>


                    {/* ======================================
                        CONTACT
                    ====================================== */}

                    <div className="popup-row">

                      <strong>
                        Contact:
                      </strong>

                      <span>

                        {emergency.contactNumber ||
                          "NA"}

                      </span>

                    </div>


                    {/* ======================================
                        SEVERITY
                    ====================================== */}

                    <div className="popup-row">

                      <strong>
                        Severity:
                      </strong>

                      <span>

                        {emergency.severity ||
                          "NA"}

                      </span>

                    </div>


                    {/* ======================================
                        STATUS
                    ====================================== */}

                    <div className="popup-row">

                      <strong>
                        Status:
                      </strong>

                      <span>

                        {emergency.status ||
                          "NA"}

                      </span>

                    </div>


                    {/* ======================================
                        LOCATION
                    ====================================== */}

                    <div className="popup-row">

                      <strong>
                        Location:
                      </strong>

                      <span>

                        {emergency.location ||
                          `${latitude}, ${longitude}`}

                      </span>

                    </div>


                    {/* ======================================
                        LATITUDE
                    ====================================== */}

                    <div className="popup-row">

                      <strong>
                        Latitude:
                      </strong>

                      <span>

                        {latitude}

                      </span>

                    </div>


                    {/* ======================================
                        LONGITUDE
                    ====================================== */}

                    <div className="popup-row">

                      <strong>
                        Longitude:
                      </strong>

                      <span>

                        {longitude}

                      </span>

                    </div>


                    {/* ======================================
                        DATE & TIME
                    ====================================== */}

                    <div className="popup-row">

                      <strong>
                        Date & Time:
                      </strong>

                      <span>

                        {emergency.createdAt
                          ? new Date(
                              emergency.createdAt
                            ).toLocaleString()
                          : "NA"}

                      </span>

                    </div>


                  </div>


                </Popup>

              </Marker>

            );

          })}


        </MapContainer>


        {/* ==================================================
            MAP LEGEND
        ================================================== */}

        <div className="map-legend">


          <div>

            <span
              className="legend-marker emergency-marker"
            ></span>

            Emergency

          </div>


          <div>

            <span
              className="legend-marker user-marker"
            ></span>

            Your Location

          </div>


        </div>


        {/* ==================================================
            MAP STATUS
        ================================================== */}

        <div className="map-status">

          {emergencies.length > 0

            ? `Showing ${emergencies.length} emergency report${
                emergencies.length > 1
                  ? "s"
                  : ""
              }`

            : "No emergency reports found"}

        </div>


      </div>


      {/* ======================================================
          EMERGENCY COUNT
      ====================================================== */}

      <div className="emergency-count">


        <div className="count-icon">

          🚨

        </div>


        <div>

          <strong>

            {emergencies.length}

          </strong>


          <span>

            Emergency Reports

          </span>

        </div>


      </div>


    </div>

  );

}


export default EmergencyMap;
