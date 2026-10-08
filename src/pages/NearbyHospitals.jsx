import React, { useEffect, useMemo, useState } from "react";
import {
  Hospital,
  Search,
  Phone,
  MapPin,
  RefreshCw,
  Navigation,
  LocateFixed,
  Bed,
  AlertCircle,
  UserRound,
} from "lucide-react";
import "./NearbyHospitals.css";

const API_URL = "https://resqnet-backend-1.onrender.com/api/hospitals";

function NearbyHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState("all");
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");

  const getName = (hospital) =>
    hospital.hospitalName ||
    hospital.name ||
    hospital.fullName ||
    "Hospital";

  const getPhone = (hospital) =>
    hospital.phone ||
    hospital.phoneNumber ||
    hospital.contactNumber ||
    hospital.mobile ||
    "";

  const getEmail = (hospital) =>
    hospital.email || hospital.emailId || "";

  const getAddress = (hospital) =>
    hospital.address ||
    hospital.location ||
    hospital.city ||
    "Address not available";

  const getBeds = (hospital) =>
    hospital.availableBeds ??
    hospital.bedsAvailable ??
    hospital.availableBedCount ??
    null;

  const getCoordinates = (hospital) => {
    const latitude =
      hospital.latitude ??
      hospital.lat ??
      hospital.locationLatitude;

    const longitude =
      hospital.longitude ??
      hospital.lng ??
      hospital.locationLongitude;

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

    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchHospitals = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          `Server error ${response.status}: ${details || "Unable to load hospitals"}`
        );
      }

      const data = await response.json();
      setHospitals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Hospital fetch error:", err);
      setError(
        err.message ||
          "Unable to load hospitals. Check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by this browser."
      );
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
          message = "Location request timed out. Try again.";
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
    fetchHospitals();
    getCurrentLocation();
  }, []);

  const hospitalsWithDistance = useMemo(() => {
    return hospitals
      .map((hospital) => {
        const coordinates = getCoordinates(hospital);
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
          ...hospital,
          _coordinates: coordinates,
          _distance: distance,
        };
      })
      .sort((a, b) => {
        if (a._distance === null) return 1;
        if (b._distance === null) return -1;
        return a._distance - b._distance;
      });
  }, [hospitals, userLocation]);

  const filteredHospitals = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return hospitalsWithDistance.filter((hospital) => {
      const matchesSearch = [
        getName(hospital),
        getPhone(hospital),
        getEmail(hospital),
        getAddress(hospital),
      ].some((value) =>
        String(value).toLowerCase().includes(searchText)
      );

      const matchesRadius =
        radius === "all" ||
        (hospital._distance !== null &&
          hospital._distance <= Number(radius));

      return matchesSearch && matchesRadius;
    });
  }, [hospitalsWithDistance, search, radius]);

  const handleContact = (hospital) => {
    const phone = getPhone(hospital);

    if (!phone) {
      alert("Hospital phone number is not available.");
      return;
    }

    window.location.href = `tel:${phone}`;
  };

  const handleLocation = (hospital) => {
    const coordinates = hospital._coordinates;
    let mapsUrl;

    if (coordinates) {
      mapsUrl =
        `https://www.google.com/maps/dir/?api=1&destination=` +
        `${coordinates.lat},${coordinates.lng}`;
    } else {
      const address = getAddress(hospital);

      if (address === "Address not available") {
        alert("Hospital location is not available.");
        return;
      }

      mapsUrl =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(address);
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
    <div className="nearby-hospitals-page">
      {/* Page header */}
      <header className="nearby-hospitals-header">
        <div className="nearby-hospitals-heading">
          <div className="nearby-hospitals-heading-icon">
            <Hospital size={28} />
          </div>

          <div>
            <h1>Nearby Hospitals</h1>
            <p>Find hospitals and emergency care near you</p>
          </div>
        </div>

        <button
          className="nh-refresh-btn"
          onClick={fetchHospitals}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "nh-spin" : ""}
          />
          Refresh
        </button>
      </header>

      {/* Current location */}
      <section className="nh-location-panel">
        <div className="nh-location-icon">
          <LocateFixed size={23} />
        </div>

        <div className="nh-location-info">
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
          className="nh-location-btn"
          onClick={getCurrentLocation}
          disabled={locationLoading}
        >
          <Navigation size={16} />
          {locationLoading ? "Locating..." : "Get Location"}
        </button>
      </section>

      {locationError && (
        <div className="nh-alert">
          <AlertCircle size={17} />
          <span>{locationError}</span>
        </div>
      )}

      {error && (
        <div className="nh-alert">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary */}
      <section className="nh-summary">
        <div className="nh-summary-card">
          <div className="nh-summary-icon">
            <Hospital size={23} />
          </div>
          <div>
            <span>Total Hospitals</span>
            <strong>{hospitals.length}</strong>
          </div>
        </div>

        <div className="nh-summary-card">
          <div className="nh-summary-icon nh-summary-green">
            <MapPin size={23} />
          </div>
          <div>
            <span>Hospitals with GPS</span>
            <strong>
              {
                hospitalsWithDistance.filter(
                  (hospital) => hospital._distance !== null
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="nh-summary-card">
          <div className="nh-summary-icon nh-summary-purple">
            <Navigation size={23} />
          </div>
          <div>
            <span>Matching Results</span>
            <strong>{filteredHospitals.length}</strong>
          </div>
        </div>
      </section>

      {/* Search and distance filter */}
      <section className="nh-toolbar">
        <div className="nh-search-box">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search by hospital name, address, or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="nh-radius-select"
          value={radius}
          onChange={(event) => setRadius(event.target.value)}
          aria-label="Filter hospitals by distance"
        >
          <option value="all">All distances</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="25">Within 25 km</option>
          <option value="50">Within 50 km</option>
          <option value="100">Within 100 km</option>
        </select>
      </section>

      {/* Results */}
      <div className="nh-results-heading">
        <h2>Hospital Directory</h2>
        <span>{filteredHospitals.length} hospitals</span>
      </div>

      {loading ? (
        <div className="nh-state">
          <div className="nh-loader"></div>
          <p>Loading hospitals...</p>
        </div>
      ) : filteredHospitals.length === 0 ? (
        <div className="nh-state nh-empty">
          <Hospital size={48} />
          <h3>No hospitals found</h3>
          <p>
            {hospitals.length === 0
              ? "No hospitals are registered yet."
              : "Try changing your search or distance filter."}
          </p>
        </div>
      ) : (
        <div className="nh-hospitals-grid">
          {filteredHospitals.map((hospital, index) => {
            const id =
              hospital.id ??
              hospital.hospitalId ??
              `${getName(hospital)}-${index}`;

            const name = getName(hospital);
            const phone = getPhone(hospital);
            const email = getEmail(hospital);
            const address = getAddress(hospital);
            const beds = getBeds(hospital);

            return (
              <article className="nh-hospital-card" key={id}>
                <div className="nh-card-header">
                  <div className="nh-hospital-avatar">
                    {hospital.profileImage || hospital.imageUrl ? (
                      <img
                        src={
                          hospital.profileImage ||
                          hospital.imageUrl
                        }
                        alt={name}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Hospital size={30} />
                    )}
                  </div>

                  <div className="nh-hospital-name">
                    <h3>{name}</h3>
                    <span className="nh-hospital-badge">
                      <span></span>
                      Registered Hospital
                    </span>
                  </div>
                </div>

                <div className="nh-distance">
                  <MapPin size={17} />
                  <strong>
                    {formatDistance(hospital._distance)}
                  </strong>
                </div>

                <div className="nh-hospital-details">
                  <div className="nh-detail-row">
                    <Phone size={17} />
                    <span>
                      {phone || "Phone not available"}
                    </span>
                  </div>

                  <div className="nh-detail-row">
                    <MapPin size={17} />
                    <span>{address}</span>
                  </div>

                  {email && (
                    <div className="nh-detail-row">
                      <UserRound size={17} />
                      <span>{email}</span>
                    </div>
                  )}

                  {beds !== null && (
                    <div className="nh-detail-row">
                      <Bed size={17} />
                      <span>
                        {beds} available beds
                      </span>
                    </div>
                  )}
                </div>

                <div className="nh-card-actions">
                  <button
                    className="nh-contact-btn"
                    onClick={() => handleContact(hospital)}
                  >
                    <Phone size={16} />
                    Contact
                  </button>

                  <button
                    className="nh-map-btn"
                    onClick={() => handleLocation(hospital)}
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

export default NearbyHospitals;
