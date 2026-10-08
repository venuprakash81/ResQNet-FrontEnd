import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  AlertTriangle,
  LocateFixed,
  ShieldCheck
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./CitizenEmergencyLocations.css";

const API = "https://resqnet-backend-1.onrender.com/api/emergency-locations";

const emergencyIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapFocus({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(
        [Number(location.latitude), Number(location.longitude)],
        15,
        { duration: 0.8 }
      );
    }
  }, [location, map]);

  return null;
}

export default function CitizenEmergencyLocations() {
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myPosition, setMyPosition] = useState(null);

  const loadLocations = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      const validLocations = Array.isArray(data)
        ? data.filter(
            (item) =>
              Number.isFinite(Number(item.latitude)) &&
              Number.isFinite(Number(item.longitude))
          )
        : [];

      setLocations(validLocations);

      setSelected((current) =>
        current
          ? validLocations.find((item) => item.id === current.id) || null
          : null
      );
    } catch (err) {
      setError(
        "Unable to load emergency locations. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const filteredLocations = locations.filter((location) => {
    const searchText = [
      location.title,
      location.emergencyType,
      location.description,
      location.address
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  const showOnMap = (location) => {
    setSelected(location);
  };

  const getDirections = (location) => {
    const destination = `${location.latitude},${location.longitude}`;
    const origin = myPosition
      ? `&origin=${myPosition.latitude},${myPosition.longitude}`
      : "";

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${encodeURIComponent(destination)}` +
      origin +
      `&travelmode=driving`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getMyLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setMyPosition(point);

        // Open Google Maps to show the user's current position.
        window.open(
          `https://www.google.com/maps?q=${point.latitude},${point.longitude}`,
          "_blank",
          "noopener,noreferrer"
        );
      },
      () => {
        setError(
          "Location permission was denied or your current position is unavailable."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="citizen-emergency-page">
      <header className="citizen-emergency-header">
        <div className="citizen-emergency-heading">
          <div className="citizen-emergency-heading-icon">
            <AlertTriangle size={26} />
          </div>

          <div>
            <h1>Emergency Locations</h1>
            <p>
              View emergency locations added by the ResQNet admin.
            </p>
          </div>
        </div>

        <div className="citizen-emergency-header-actions">
          <button
            className="citizen-location-button"
            onClick={getMyLocation}
          >
            <LocateFixed size={17} />
            My Location
          </button>

          <button
            className="citizen-refresh-button"
            onClick={loadLocations}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "citizen-refresh-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="citizen-emergency-error">
          <span>{error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="citizen-emergency-search">
        <Search size={19} />
        <input
          type="text"
          placeholder="Search emergency type, title, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="citizen-emergency-stats">
        <div className="citizen-stat-icon">
          <ShieldCheck size={21} />
        </div>
        <div>
          <strong>{filteredLocations.length}</strong>
          <span>Emergency locations available</span>
        </div>
      </div>

      <div className="citizen-emergency-layout">
        <section className="citizen-emergency-map-card">
          <div className="citizen-emergency-section-heading">
            <div>
              <h2>
                <MapPin size={19} />
                Emergency Map
              </h2>
              <p>Select a marker to view its details.</p>
            </div>
          </div>

          <MapContainer
            center={[17.385, 78.4867]}
            zoom={11}
            scrollWheelZoom
            className="citizen-emergency-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFocus location={selected} />

            {filteredLocations.map((location) => (
              <Marker
                key={location.id}
                position={[
                  Number(location.latitude),
                  Number(location.longitude)
                ]}
                icon={emergencyIcon}
                eventHandlers={{
                  click: () => setSelected(location)
                }}
              >
                <Popup>
                  <div className="citizen-emergency-popup">
                    <h3>{location.title || "Emergency Location"}</h3>
                    <p>
                      {location.emergencyType || "Emergency support"}
                    </p>
                    <button onClick={() => getDirections(location)}>
                      <Navigation size={14} />
                      Get directions
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="citizen-map-footer">
            <span>
              <MapPin size={15} />
              {filteredLocations.length} locations shown on map
            </span>
          </div>
        </section>

        <section className="citizen-emergency-list-panel">
          <div className="citizen-emergency-section-heading">
            <div>
              <h2>Available Locations</h2>
              <p>Choose a location to view it on the map.</p>
            </div>
          </div>

          {loading ? (
            <div className="citizen-emergency-empty">
              <RefreshCw size={25} className="citizen-refresh-spin" />
              <p>Loading emergency locations...</p>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="citizen-emergency-empty">
              <MapPin size={32} />
              <h3>No locations found</h3>
              <p>
                No emergency locations match your search.
              </p>
            </div>
          ) : (
            <div className="citizen-emergency-list">
              {filteredLocations.map((location) => (
                <article
                  key={location.id}
                  className={`citizen-emergency-item ${
                    selected?.id === location.id ? "active" : ""
                  }`}
                  onClick={() => showOnMap(location)}
                >
                  <div className="citizen-item-icon">
                    <MapPin size={21} />
                  </div>

                  <div className="citizen-item-content">
                    <h3>
                      {location.title || "Emergency Location"}
                    </h3>

                    <span className="citizen-emergency-type">
                      {location.emergencyType || "Emergency support"}
                    </span>

                    {location.address && (
                      <p className="citizen-item-address">
                        {location.address}
                      </p>
                    )}

                    {location.description && (
                      <p className="citizen-item-description">
                        {location.description}
                      </p>
                    )}

                    <div className="citizen-item-coordinates">
                      <span>
                        {Number(location.latitude).toFixed(5)},{" "}
                        {Number(location.longitude).toFixed(5)}
                      </span>
                    </div>

                    <div className="citizen-item-actions">
                      <button
                        className="citizen-show-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          showOnMap(location);
                        }}
                      >
                        <MapPin size={15} />
                        Location
                      </button>

                      <button
                        className="citizen-directions-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          getDirections(location);
                        }}
                      >
                        <Navigation size={15} />
                        Directions
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
