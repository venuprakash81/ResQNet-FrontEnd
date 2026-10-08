import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Phone,
  MapPin,
  Trash2,
  RefreshCw,
  UserRound,
  Mail,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import "./AllVolunteers.css";

const API_BASE = "https://resqnet-backend-1.onrender.com/api";

function AllVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchVolunteers();
  }, []);
const fetchVolunteers = async () => {
  setLoading(true);
  setError("");

  try {
    const response = await fetch(
      "http://localhost:8081/api/volunteers"
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Server error ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    setVolunteers(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Volunteer fetch error:", err);
    setError(err.message || "Unable to load volunteers.");
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (volunteer) => {
    const id = volunteer.id ?? volunteer.volunteerId;

    if (id == null) {
      setError("Volunteer ID is missing. Cannot delete this record.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        volunteer.name || volunteer.fullName || "this volunteer"
      }?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/volunteers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`);
      }

      setVolunteers((previous) =>
        previous.filter(
          (item) => (item.id ?? item.volunteerId) !== id
        )
      );

      setMessage("Volunteer deleted successfully.");
      setError("");
    } catch (err) {
      setError(err.message || "Unable to delete volunteer.");
      setMessage("");
    }
  };

  const getName = (volunteer) =>
    volunteer.name ||
    volunteer.fullName ||
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

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return { lat, lng };
  };

  const handleLocation = (volunteer) => {
    const coordinates = getCoordinates(volunteer);

    let url;

    if (coordinates) {
      url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
    } else {
      const address = getAddress(volunteer);

      if (address === "Location not available") {
        alert("Location is not available for this volunteer.");
        return;
      }

      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const searchText = search.toLowerCase();

    return [
      getName(volunteer),
      getEmail(volunteer),
      getPhone(volunteer),
      getAddress(volunteer),
    ].some((value) => String(value).toLowerCase().includes(searchText));
  });

  return (
    <div className="all-volunteers-page">
      <header className="volunteers-header">
        <div className="volunteers-heading">
          <div className="volunteers-heading-icon">
            <Users size={28} />
          </div>

          <div>
            <h1>All Volunteers</h1>
            <p>Manage and connect with registered ResQNet volunteers</p>
          </div>
        </div>

        <button
          className="volunteers-refresh-btn"
          onClick={fetchVolunteers}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "refresh-spin" : ""} />
          Refresh
        </button>
      </header>

      <section className="volunteers-summary">
        <div className="volunteers-summary-icon">
          <Users size={24} />
        </div>
        <div>
          <span>Total Volunteers</span>
          <strong>{volunteers.length}</strong>
        </div>
      </section>

      <section className="volunteers-toolbar">
        <div className="volunteers-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search by name, email, phone, or location..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </section>

      {message && (
        <div className="volunteers-message success-message">
          <CheckCircle size={18} />
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {error && (
        <div className="volunteers-message error-message">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {loading ? (
        <div className="volunteers-state">
          <div className="volunteers-loader"></div>
          <p>Loading volunteers...</p>
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="volunteers-state empty-volunteers">
          <Users size={48} />
          <h3>No volunteers found</h3>
          <p>
            {search
              ? "Try a different search term."
              : "No volunteers are registered yet."}
          </p>
        </div>
      ) : (
        <div className="volunteers-grid">
          {filteredVolunteers.map((volunteer, index) => {
            const id = volunteer.id ?? volunteer.volunteerId ?? index;
            const name = getName(volunteer);
            const phone = getPhone(volunteer);
            const email = getEmail(volunteer);
            const address = getAddress(volunteer);

            return (
              <article className="volunteer-card" key={id}>
                <div className="volunteer-card-top">
                  <div className="volunteer-avatar">
                    {volunteer.profileImage || volunteer.imageUrl ? (
                      <img
                        src={
                          volunteer.profileImage || volunteer.imageUrl
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

                  <div className="volunteer-card-title">
                    <h2>{name}</h2>
                    <span className="volunteer-status">
                      <span className="status-dot"></span>
                      Registered Volunteer
                    </span>
                  </div>
                </div>

                <div className="volunteer-details">
                  <div className="volunteer-detail-row">
                    <Phone size={17} />
                    <span>{phone || "Phone not available"}</span>
                  </div>

                  <div className="volunteer-detail-row">
                    <Mail size={17} />
                    <span>{email || "Email not available"}</span>
                  </div>

                  <div className="volunteer-detail-row">
                    <MapPin size={17} />
                    <span>{address}</span>
                  </div>
                </div>

                <div className="volunteer-card-actions">
                  <button
                    className="volunteer-action contact-action"
                    onClick={() => {
                      if (!phone) {
                        alert("Phone number is not available.");
                        return;
                      }

                      window.location.href = `tel:${phone}`;
                    }}
                  >
                    <Phone size={16} />
                    Contact
                  </button>

                  <button
                    className="volunteer-action location-action"
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

export default AllVolunteers;
