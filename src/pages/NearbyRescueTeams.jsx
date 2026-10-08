
import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Navigation,
  Phone,
  Search,
  RefreshCw,
  Users,
  LocateFixed,
  AlertCircle,
  Map,
  Clock,
} from "lucide-react";
import "./NearbyRescueTeams.css";

const API = "https://resqnet-backend-1.onrender.com/api/teams";

// Calculate distance between two GPS coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const R = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NearbyRescueTeams() {
  const [teams, setTeams] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(25);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");

  // Load rescue teams
  const fetchTeams = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      setTeams(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to load teams:", err);
      setError("Unable to load rescue teams. Check your backend server.");
    } finally {
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        let message = "Unable to get your location.";

        if (err.code === 1) {
          message = "Location permission denied. Allow location access in your browser.";
        } else if (err.code === 2) {
          message = "Your current location is unavailable.";
        } else if (err.code === 3) {
          message = "Location request timed out. Please try again.";
        }

        setLocationError(message);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  useEffect(() => {
    fetchTeams();
    getCurrentLocation();
  }, []);

  // Get team coordinates
  const getCoordinates = (team) => {
    const latitude = Number(
      team.latitude ?? team.lat ?? team.locationLatitude
    );
    const longitude = Number(
      team.longitude ?? team.lng ?? team.lon ?? team.locationLongitude
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return null;
    }

    return { latitude, longitude };
  };

  const getTeamName = (team, index) =>
    team.teamName ||
    team.name ||
    team.fullName ||
    team.username ||
    `Rescue Team ${index + 1}`;

  const getTeamLocation = (team) =>
    team.location || team.address || team.city || "Location not provided";

  const getTeamPhone = (team) =>
    team.phone || team.mobile || team.phoneNumber || "";

  // Calculate distance and filter teams
  const nearbyTeams = useMemo(() => {
    if (!userLocation) return [];

    return teams
      .map((team, index) => {
        const coordinates = getCoordinates(team);

        if (!coordinates) return null;

        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          coordinates.latitude,
          coordinates.longitude
        );

        return {
          ...team,
          _index: index,
          _distance: distance,
          _coordinates: coordinates,
        };
      })
      .filter(Boolean)
      .filter((team) => team._distance <= radius)
      .filter((team) => {
        const text = [
          getTeamName(team, team._index),
          getTeamLocation(team),
          getTeamPhone(team),
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(search.toLowerCase());
      })
      .sort((a, b) => a._distance - b._distance);
  }, [teams, userLocation, radius, search]);

  // Open Google Maps directions
  const openDirections = (team) => {
    const destination = team._coordinates;

    const url = userLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Contact team
  const contactTeam = (team) => {
    const phone = getTeamPhone(team);

    if (!phone) {
      alert("Phone number is not available.");
      return;
    }

    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="nearby-rescue-page">
      {/* Header */}
      <div className="nearby-rescue-header">
        <div className="nearby-header-title">
          <div className="nearby-header-icon">
            <Users size={27} />
          </div>
          <div>
            <h1>Nearby Rescue Teams</h1>
            <p>Find rescue teams near your current location</p>
          </div>
        </div>

        <button
          className="nearby-refresh-btn"
          type="button"
          onClick={() => {
            fetchTeams();
            getCurrentLocation();
          }}
          disabled={loading || locating}
        >
          <RefreshCw
            size={17}
            className={loading || locating ? "nearby-spinning" : ""}
          />
          Refresh
        </button>
      </div>

      {/* User location */}
      <div className="nearby-location-panel">
        <div className="nearby-location-left">
          <div className="nearby-location-icon">
            <LocateFixed size={23} />
          </div>
          <div>
            <h3>Your Current Location</h3>
            {userLocation ? (
              <p>
                {userLocation.latitude.toFixed(5)},{" "}
                {userLocation.longitude.toFixed(5)}
              </p>
            ) : (
              <p>
                {locating
                  ? "Getting your location..."
                  : "Location not detected"}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="get-location-btn"
          onClick={getCurrentLocation}
          disabled={locating}
        >
          <Navigation size={16} />
          {locating ? "Locating..." : "Get Location"}
        </button>
      </div>

      {locationError && (
        <div className="nearby-location-error">
          <AlertCircle size={17} />
          <span>{locationError}</span>
        </div>
      )}

      {/* Search and radius */}
      <div className="nearby-filter-panel">
        <div className="nearby-search-box">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search rescue teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="nearby-radius-control">
          <label htmlFor="nearby-radius">Search radius</label>
          <select
            id="nearby-radius"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
            <option value={500}>500 km</option>
          </select>
        </div>
      </div>

      {/* Results summary */}
      <div className="nearby-results-heading">
        <div>
          <h2>Rescue Teams Near You</h2>
          <p>
            {userLocation
              ? `${nearbyTeams.length} teams within ${radius} km`
              : "Waiting for your location"}
          </p>
        </div>

        {userLocation && (
          <span className="nearby-sort-label">
            <Navigation size={14} />
            Nearest first
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="nearby-state">
          <div className="nearby-loader"></div>
          <p>Loading rescue teams...</p>
        </div>
      )}

      {/* Backend error */}
      {!loading && error && (
        <div className="nearby-error">
          <AlertCircle size={25} />
          <p>{error}</p>
          <button type="button" onClick={fetchTeams}>
            Try Again
          </button>
        </div>
      )}

      {/* Location required */}
      {!loading && !error && !userLocation && !locationError && (
        <div className="nearby-empty">
          <MapPin size={42} />
          <h3>Location Required</h3>
          <p>Allow location access to find nearby rescue teams.</p>
        </div>
      )}

      {/* No matching teams */}
      {!loading &&
        !error &&
        userLocation &&
        nearbyTeams.length === 0 && (
          <div className="nearby-empty">
            <Users size={42} />
            <h3>No Nearby Rescue Teams</h3>
            <p>
              No teams with GPS coordinates were found within{" "}
              {radius} km. Try increasing the search radius.
            </p>
          </div>
        )}

      {/* Nearby team cards */}
      {!loading && !error && userLocation && nearbyTeams.length > 0 && (
        <div className="nearby-team-grid">
          {nearbyTeams.map((team) => (
            <div
              className="nearby-team-card"
              key={team.id ?? team._index}
            >
              <div className="nearby-team-top">
                <div className="nearby-team-avatar">
                  <Users size={27} />
                </div>

                <div className="nearby-team-heading">
                  <h3>{getTeamName(team, team._index)}</h3>
                  <span className="nearby-team-status">
                    {team.status || "Registered"}
                  </span>
                </div>
              </div>

              <div className="nearby-distance">
                <div className="nearby-distance-icon">
                  <Navigation size={19} />
                </div>
                <div>
                  <strong>
                    {team._distance < 1
                      ? `${(team._distance * 1000).toFixed(0)} m`
                      : `${team._distance.toFixed(2)} km`}
                  </strong>
                  <span>From your location</span>
                </div>
              </div>

              <div className="nearby-team-details">
                <div className="nearby-detail-row">
                  <MapPin size={16} />
                  <span>{getTeamLocation(team)}</span>
                </div>

                <div className="nearby-detail-row">
                  <Phone size={16} />
                  <span>
                    {getTeamPhone(team) || "Phone not available"}
                  </span>
                </div>

                {team.email && (
                  <div className="nearby-detail-row">
                    <Clock size={16} />
                    <span>{team.email}</span>
                  </div>
                )}
              </div>

              <div className="nearby-team-actions">
                <button
                  type="button"
                  className="nearby-contact-btn"
                  onClick={() => contactTeam(team)}
                >
                  <Phone size={16} />
                  Contact
                </button>

                <button
                  type="button"
                  className="nearby-directions-btn"
                  onClick={() => openDirections(team)}
                >
                  <Map size={16} />
                  Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
