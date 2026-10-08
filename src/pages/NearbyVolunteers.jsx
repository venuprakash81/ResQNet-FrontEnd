import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Phone,
  MapPin,
  RefreshCw,
  UserRound,
  Mail,
  Navigation,
  LocateFixed,
  AlertCircle,
} from "lucide-react";
import "./NearbyVolunteers.css";

const API_URL = "https://resqnet-backend-1.onrender.com/api/volunteers";

function NearbyVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState("all");
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");

  // Get volunteer fields while supporting common naming variations.
  const getName = (volunteer) =>
    volunteer.fullName ||
    volunteer.name ||
    volunteer.volunteerName ||
    "Volunteer";

  const getPhone = (volunteer) =>
    volunteer.phone ||
    volunteer.phoneNumber ||
    volunteer.mobile ||
    "";

  const getEmail = (volunteer) =>
    volunteer.email || volunteer.emailId || "";

  const getAddress = (volunteer) =>
    volunteer.address ||
    volunteer.location ||
    volunteer.city ||
    "Location not available";

  const getCoordinates = (volunteer) => {
    const latitude =
      volunteer.latitude ??
      volunteer.lat ??
      volunteer.locationLatitude;

    const longitude =
      volunteer.longitude ??
      volunteer.lng ??
      volunteer.locationLongitude;

    if (
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined ||
      latitude === "" ||
      longitude === ""
    ) {
      return null;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return null;
    }

    return { lat, lng };
  };

  // Calculate distance between two GPS points in kilometers.
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadius = 6371;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  };

  // Fetch volunteers from Spring Boot.
  const fetchVolunteers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setVolunteers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Volunteer fetch error:", err);
      setError(
        err.message ||
          "Unable to load volunteers. Check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // Request current browser location.
  const getCurrentLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        let message = "Unable to get your current location.";

        if (err.code === 1) {
          message =
            "Location permission denied. Allow location access in your browser.";
        } else if (err.code === 2) {
          message = "Your current location is unavailable.";
        } else if (err.code === 3) {
          message = "Location request timed out. Please try again.";
        }

        setLocationError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    fetchVolunteers();
    getCurrentLocation();
  }, []);

  // Add distance information and sort volunteers by distance.
  const volunteersWithDistance = useMemo(() => {
    return volunteers
      .map((volunteer) => {
        const coordinates = getCoordinates(volunteer);

        let distance = null;

        if (userLocation && coordinates) {
          distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            coordinates.lat,
            coordinates.lng
          );
        }

        return {
          ...volunteer,
          _distance: distance,
          _coordinates: coordinates,
        };
      })
      .sort((a, b) => {
        if (a._distance === null) return 1;
        if (b._distance === null) return -1;
        return a._distance - b._distance;
      });
  }, [volunteers, userLocation]);

  // Search and filter by distance.
  const filteredVolunteers = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return volunteersWithDistance.filter((volunteer) => {
      const matchesSearch = [
        getName(volunteer),
        getPhone(volunteer),
        getEmail(volunteer),
        getAddress(volunteer),
      ].some((value) =>
        String(value).toLowerCase().includes(searchText)
      );

      const matchesRadius =
        radius === "all" ||
        (volunteer._distance !== null &&
          volunteer._distance <= Number(radius));

      return matchesSearch && matchesRadius;
    });
  }, [volunteersWithDistance, search, radius]);

  const handleContact = (volunteer) => {
    const phone = getPhone(volunteer);

    if (!phone) {
      alert("Phone number is not available.");
      return;
    }

    window.location.href = `tel:${phone}`;
  };

  const handleLocation = (volunteer) => {
    const coordinates = volunteer._coordinates;

    let mapsUrl;

    if (coordinates) {
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    } else {
      const address = getAddress(volunteer);

      if (address === "Location not available") {
        alert("Location is not available for this volunteer.");
        return;
      }

      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`;
    }

    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) {
      return "Distance unavailable";
    }

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m away`;
    }

    return `${distance.toFixed(1)} km away`;
  };

  return (
    <div className="nearby-volunteers-page">
      {/* Header */}
      <div className="nearby-volunteers-header">
        <div className="nearby-volunteers-title">
          <div className="nearby-volunteers-title-icon">
            <Users size={27} />
          </div>

          <div>
            <h1>Nearby Volunteers</h1>
            <p>Find and contact volunteers near your location</p>
          </div>
        </div>

        <button
          className="nearby-refresh-btn"
          onClick={fetchVolunteers}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "nearby-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Location status */}
      <div className="nearby-location-panel">
        <div className="nearby-location-icon">
          <LocateFixed size={23} />
        </div>

        <div className="nearby-location-info">
          <h3>Your Current Location</h3>

          {userLocation ? (
            <p>
              GPS location detected
              <span>
                {userLocation.lat.toFixed(5)},{" "}
                {userLocation.lng.toFixed(5)}
              </span>
            </p>
          ) : locationLoading ? (
            <p>Detecting your location...</p>
          ) : (
            <p>Location not detected</p>
          )}
        </div>

        <button
          className="nearby-location-btn"
          onClick={getCurrentLocation}
          disabled={locationLoading}
        >
          <Navigation size={16} />
          {locationLoading ? "Locating..." : "Get Location"}
        </button>
      </div>

      {locationError && (
        <div className="nearby-alert">
          <AlertCircle size={17} />
          <span>{locationError}</span>
        </div>
      )}

      {error && (
        <div className="nearby-alert">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary */}
      <div className="nearby-volunteers-summary">
        <div className="nearby-summary-card">
          <div className="nearby-summary-icon">
            <Users size={22} />
          </div>
          <div>
            <span>Total Volunteers</span>
            <strong>{volunteers.length}</strong>
          </div>
        </div>

        <div className="nearby-summary-card">
          <div className="nearby-summary-icon nearby-summary-green">
            <MapPin size={22} />
          </div>
          <div>
            <span>Volunteers with GPS</span>
            <strong>
              {
                volunteersWithDistance.filter(
                  (volunteer) => volunteer._distance !== null
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="nearby-summary-card">
          <div className="nearby-summary-icon nearby-summary-purple">
            <Navigation size={22} />
          </div>
          <div>
            <span>Matching Results</span>
            <strong>{filteredVolunteers.length}</strong>
          </div>
        </div>
      </div>

      {/* Search and distance filter */}
      <div className="nearby-volunteers-toolbar">
        <div className="nearby-search-box">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search volunteers by name, phone, email, location..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="nearby-radius-select"
          value={radius}
          onChange={(event) => setRadius(event.target.value)}
          aria-label="Filter volunteers by distance"
        >
          <option value="all">All distances</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="25">Within 25 km</option>
          <option value="50">Within 50 km</option>
          <option value="100">Within 100 km</option>
        </select>
      </div>

      <div className="nearby-results-heading">
        <h2>Volunteer Directory</h2>
        <span>{filteredVolunteers.length} volunteers</span>
      </div>

      {/* Volunteer list */}
      {loading ? (
        <div className="nearby-state">
          <div className="nearby-loader"></div>
          <p>Loading volunteers...</p>
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="nearby-state nearby-empty">
          <Users size={48} />
          <h3>No volunteers found</h3>
          <p>
            {volunteers.length === 0
              ? "No volunteers are registered yet."
              : "Try changing your search or distance filter."}
          </p>
        </div>
      ) : (
        <div className="nearby-volunteers-grid">
          {filteredVolunteers.map((volunteer, index) => {
            const id =
              volunteer.id ??
              volunteer.volunteerId ??
              `${getEmail(volunteer)}-${index}`;

            const name = getName(volunteer);
            const phone = getPhone(volunteer);
            const email = getEmail(volunteer);
            const address = getAddress(volunteer);

            return (
              <article className="nearby-volunteer-card" key={id}>
                <div className="nearby-card-header">
                  <div className="nearby-volunteer-avatar">
                    {volunteer.profileImage ||
                    volunteer.imageUrl ? (
                      <img
                        src={
                          volunteer.profileImage ||
                          volunteer.imageUrl
                        }
                        alt={name}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <UserRound size={30} />
                    )}
                  </div>

                  <div className="nearby-volunteer-name">
                    <h3>{name}</h3>
                    <span className="nearby-volunteer-badge">
                      <span></span>
                      Volunteer
                    </span>
                  </div>
                </div>

                <div className="nearby-distance">
                  <MapPin size={17} />
                  <strong>
                    {formatDistance(volunteer._distance)}
                  </strong>
                </div>

                <div className="nearby-volunteer-details">
                  <div className="nearby-detail-row">
                    <Phone size={17} />
                    <span>{phone || "Phone not available"}</span>
                  </div>

                  <div className="nearby-detail-row">
                    <Mail size={17} />
                    <span>{email || "Email not available"}</span>
                  </div>

                  <div className="nearby-detail-row">
                    <MapPin size={17} />
                    <span>{address}</span>
                  </div>
                </div>

                <div className="nearby-card-actions">
                  <button
                    className="nearby-contact-btn"
                    onClick={() => handleContact(volunteer)}
                  >
                    <Phone size={16} />
                    Contact
                  </button>

                  <button
                    className="nearby-map-btn"
                    onClick={() => handleLocation(volunteer)}
                  >
                    <MapPin size={16} />
                    Location
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NearbyVolunteers;
