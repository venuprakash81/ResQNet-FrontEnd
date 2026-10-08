import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap
} from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Trash2,
  RefreshCw,
  Crosshair,
  ShieldCheck,
  Navigation
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./AdminEmergencyLocations.css";

const API = "https://resqnet-backend-1.onrender.com/api/emergency-locations";

// Saved safe location marker
const safeIcon = new L.DivIcon({
  className: "safe-map-marker",
  html: '<div class="safe-marker-inner">✓</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

// Selected map location marker
const selectedIcon = new L.DivIcon({
  className: "selected-map-marker",
  html: '<div class="selected-marker-inner">+</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

// Map click handler
function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    }
  });

  return null;
}

// Focus the map on a selected location
function MapFocus({ point }) {
  const map = useMap();

  useEffect(() => {
    if (point) {
      map.flyTo(
        [point.latitude, point.longitude],
        15,
        { duration: 1 }
      );
    }
  }, [point, map]);

  return null;
}

export default function AdminEmergencyLocations() {
  const [locations, setLocations] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load saved locations
  const loadLocations = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error(`Failed to load locations (${response.status})`);
      }

      const data = await response.json();

      const validLocations = Array.isArray(data)
        ? data.filter(
            (item) =>
              item.id != null &&
              Number.isFinite(Number(item.latitude)) &&
              Number.isFinite(Number(item.longitude))
          )
        : [];

      setLocations(validLocations);
    } catch (err) {
      setError(
        err.message || "Could not load saved emergency locations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // Save a new safe location
  const saveSafeLocation = async () => {
    if (!selectedPoint) {
      setError("Please click on the map to select a location.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      title: "Safe Emergency Location",
      emergencyType: "Safe Location",
      description: "Admin-marked safe emergency location",
      address: "Admin-selected map location",
      contactNumber: "",
      latitude: selectedPoint.latitude,
      longitude: selectedPoint.longitude,
      safeLocation: true
    };

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          detail || `Failed to save location (${response.status})`
        );
      }

      setSelectedPoint(null);
      setMessage("Safe emergency location saved successfully.");
      await loadLocations();
    } catch (err) {
      setError(
        err.message || "Could not save the safe emergency location."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete a saved location
  const deleteLocation = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this safe location?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          detail || `Failed to delete location (${response.status})`
        );
      }

      setLocations((current) =>
        current.filter((location) => location.id !== id)
      );

      setMessage("Safe location deleted successfully.");
    } catch (err) {
      setError(err.message || "Could not delete this location.");
    }
  };

  // Select browser's current position
  const useCurrentLocation = () => {
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedPoint({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });

        setMessage(
          "Current position selected. Click Save Safe Location to add it."
        );
      },
      (err) => {
        setError(
          err.code === 1
            ? "Location permission was denied."
            : "Could not retrieve your current location."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  };

  // Open directions
  const openDirections = (location) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="admin-emergency-locations">
      <header className="emergency-locations-header">
        <div>
          <h1>Safe Emergency Locations</h1>
          <p>
            Select locations on the map to make them available to citizens.
          </p>
        </div>

        <button
          className="emergency-refresh-button"
          onClick={loadLocations}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "emergency-spinning" : ""}
          />
          Refresh
        </button>
      </header>

      {error && (
        <div className="emergency-alert error">
          <span>{error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {message && (
        <div className="emergency-alert success">
          <span>{message}</span>
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <section className="emergency-map-card">
        <div className="card-heading">
          <div>
            <h2>
              <MapPin size={20} />
              Select Safe Location
            </h2>
            <p>Click anywhere on the map to choose a safe location.</p>
          </div>

          <button
            className="current-location-button"
            onClick={useCurrentLocation}
          >
            <Crosshair size={16} />
            Use my location
          </button>
        </div>

        <MapContainer
          center={[17.385, 78.4867]}
          zoom={11}
          scrollWheelZoom
          className="emergency-leaflet-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onSelect={setSelectedPoint} />
          <MapFocus point={selectedPoint} />

          {locations.map((location) => (
            <Marker
              key={location.id}
              position={[
                Number(location.latitude),
                Number(location.longitude)
              ]}
              icon={safeIcon}
            >
              <Popup>
                <div className="emergency-map-popup">
                  <strong>Safe Emergency Location</strong>
                  <p>
                    {Number(location.latitude).toFixed(6)},{" "}
                    {Number(location.longitude).toFixed(6)}
                  </p>
                  <button onClick={() => openDirections(location)}>
                    <Navigation size={14} />
                    Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {selectedPoint && (
            <Marker
              position={[
                selectedPoint.latitude,
                selectedPoint.longitude
              ]}
              icon={selectedIcon}
            >
              <Popup>New selected safe location</Popup>
            </Marker>
          )}
        </MapContainer>

        <div className="selected-location-footer">
          <div className="selected-coordinates">
            {selectedPoint ? (
              <>
                <strong>Selected coordinates</strong>
                <p>
                  Latitude: {selectedPoint.latitude.toFixed(6)}
                  <br />
                  Longitude: {selectedPoint.longitude.toFixed(6)}
                </p>
              </>
            ) : (
              <p>Click the map to select a location.</p>
            )}
          </div>

          <button
            className="emergency-add-button"
            onClick={saveSafeLocation}
            disabled={!selectedPoint || saving}
          >
            <ShieldCheck size={18} />
            {saving ? "Saving..." : "Save Safe Location"}
          </button>
        </div>
      </section>

      <section className="emergency-saved-section">
        <div className="saved-section-heading">
          <h2>Saved Safe Locations</h2>
          <span>{locations.length} locations</span>
        </div>

        {loading ? (
          <div className="emergency-empty-state">
            <p>Loading locations...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="emergency-empty-state">
            <MapPin size={32} />
            <p>No saved safe locations yet.</p>
          </div>
        ) : (
          <div className="emergency-saved-list">
            {locations.map((location) => (
              <div className="emergency-saved-item" key={location.id}>
                <div className="emergency-saved-icon">
                  <ShieldCheck size={20} />
                </div>

                <div className="emergency-saved-details">
                  <strong>Safe Emergency Location</strong>
                  <p>
                    Latitude: {Number(location.latitude).toFixed(6)}
                    <br />
                    Longitude: {Number(location.longitude).toFixed(6)}
                  </p>
                </div>

                <div className="emergency-saved-actions">
                  <button
                    className="emergency-view-button"
                    onClick={() => openDirections(location)}
                    title="Open directions"
                  >
                    <Navigation size={17} />
                  </button>

                  <button
                    className="emergency-delete-button"
                    onClick={() => deleteLocation(location.id)}
                    title="Delete location"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
