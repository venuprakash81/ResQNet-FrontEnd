
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./CitizenLocation.css";

// Fix default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const STORAGE_KEY = "citizenLocation";

// Default map center when no saved or current location is available
const DEFAULT_POSITION = {
  lat: 17.385,
  lng: 78.4867,
};

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16, {
        animate: true,
        duration: 1,
      });
    }
  }, [position, map]);

  return null;
}

function MapClickHandler({ editing, onSelect }) {
  useMapEvents({
    click(event) {
      if (editing) {
        onSelect({
          lat: event.latlng.lat,
          lng: event.latlng.lng,
        });
      }
    },
  });

  return null;
}

export default function CitizenLocation() {
  const [savedPosition, setSavedPosition] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [selectedPosition, setSelectedPosition] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const currentPosition = editing
    ? selectedPosition || savedPosition || DEFAULT_POSITION
    : savedPosition || DEFAULT_POSITION;

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showMessage("Geolocation is not supported by your browser.", "error");
      return;
    }

    setLoading(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (editing) {
          setSelectedPosition(newPosition);
        } else {
          setSavedPosition(newPosition);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosition));
        }

        setLoading(false);
        showMessage(
          "Current location detected. Save it to confirm your location.",
          "success"
        );
      },
      (error) => {
        setLoading(false);

        const errorMessage =
          error.code === 1
            ? "Location permission denied. Allow location access in your browser."
            : error.code === 2
            ? "Your current location is unavailable."
            : "Could not get your location. Please try again.";

        showMessage(errorMessage, "error");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const startEditing = () => {
    setSelectedPosition(savedPosition || DEFAULT_POSITION);
    setEditing(true);
    setMessage("");
    setMessageType("");
  };

  const saveLocation = () => {
    if (!selectedPosition) {
      showMessage("Please select a location on the map.", "error");
      return;
    }

    setSavedPosition(selectedPosition);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPosition));
    setEditing(false);
    setMessage("Your location has been saved in this browser.");
    setMessageType("success");
  };

  const cancelEditing = () => {
    setSelectedPosition(null);
    setEditing(false);
    setMessage("");
    setMessageType("");
  };

  return (
    <div className="citizen-location-page">
      <div className="citizen-location-card">
        <div className="location-header">
          <div>
            <span className="location-eyebrow">RESQNET CITIZEN</span>
            <h2>My Location</h2>
            <p>
              View your current location or select a different point on the map.
            </p>
          </div>

          <div className="location-header-icon">📍</div>
        </div>

        <div className="location-toolbar">
          <button
            type="button"
            className="location-button current-location-button"
            onClick={getCurrentLocation}
            disabled={loading}
          >
            {loading ? "Detecting..." : "◎ Use Current Location"}
          </button>

          {!editing ? (
            <button
              type="button"
              className="location-button edit-location-button"
              onClick={startEditing}
            >
              ✎ Edit Location
            </button>
          ) : (
            <>
              <button
                type="button"
                className="location-button save-location-button"
                onClick={saveLocation}
              >
                ✓ Save Location
              </button>

              <button
                type="button"
                className="location-button cancel-location-button"
                onClick={cancelEditing}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {editing && (
          <div className="location-edit-hint">
            <span>✋</span>
            Click anywhere on the map to choose your location. You can also use
            the current-location button.
          </div>
        )}

        {message && (
          <div className={`location-message ${messageType}`} role="status">
            {message}
          </div>
        )}

        <div className="citizen-map-wrapper">
          <MapContainer
            center={[currentPosition.lat, currentPosition.lng]}
            zoom={15}
            scrollWheelZoom={true}
            className="citizen-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater position={currentPosition} />

            <MapClickHandler
              editing={editing}
              onSelect={setSelectedPosition}
            />

            <Marker
              position={[currentPosition.lat, currentPosition.lng]}
              draggable={editing}
              eventHandlers={{
                dragend: (event) => {
                  const marker = event.target;
                  const point = marker.getLatLng();
                  setSelectedPosition({
                    lat: point.lat,
                    lng: point.lng,
                  });
                },
              }}
            >
              <Popup>
                {editing ? "Selected location" : "Your saved location"}
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="location-details">
          <div className="location-details-heading">
            <h3>{editing ? "Selected Location" : "Location Details"}</h3>
            <span className={editing ? "editing-status" : "saved-status"}>
              {editing ? "Editing" : savedPosition ? "Saved" : "Not saved"}
            </span>
          </div>

          <div className="coordinates-grid">
            <div className="coordinate-box">
              <span>Latitude</span>
              <strong>{currentPosition.lat.toFixed(6)}</strong>
            </div>

            <div className="coordinate-box">
              <span>Longitude</span>
              <strong>{currentPosition.lng.toFixed(6)}</strong>
            </div>
          </div>

          {!editing && !savedPosition && (
            <p className="location-note">
              This map is showing a default starting point. Select Use Current
              Location or Edit Location to set your location.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
