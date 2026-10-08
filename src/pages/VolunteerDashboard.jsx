
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./VolunteerDashboard.css";

const API_BASE = "https://resqnet-backend-1.onrender.com/api";
const EMERGENCIES_API = `${API_BASE}/emergencies`;
const TEAMS_API = `${API_BASE}/teams`;
const VOLUNTEERS_API = `${API_BASE}/volunteers`;

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const emergencyIcon = L.divIcon({
  className: "emergency-marker-wrapper",
  html: '<div class="emergency-marker"><span></span></div>',
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

function getLatitude(item) {
  const value =
    item?.latitude ?? item?.lat ?? item?.locationLatitude;

  return value === null || value === undefined || value === ""
    ? null
    : Number(value);
}

function getLongitude(item) {
  const value =
    item?.longitude ??
    item?.lng ??
    item?.lon ??
    item?.locationLongitude;

  return value === null || value === undefined || value === ""
    ? null
    : Number(value);
}

function getEmergencyStatus(item) {
  return item?.status || item?.emergencyStatus || "Pending";
}

function normalizeArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function MapFocus({ selected }) {
  const map = useMap();

  useEffect(() => {
    if (!selected) return;

    const lat = getLatitude(selected);
    const lng = getLongitude(selected);

    if (
      lat !== null &&
      lng !== null &&
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {
      map.flyTo([lat, lng], 15, { duration: 0.8 });
    }
  }, [selected, map]);

  return null;
}

export default function VolunteerDashboard() {
  const navigate = useNavigate();

  const [page, setPage] = useState("home");
  const [emergencies, setEmergencies] = useState([]);
  const [rescueTeams, setRescueTeams] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  const [loadingEmergencies, setLoadingEmergencies] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);

  const [emergencyError, setEmergencyError] = useState("");
  const [teamError, setTeamError] = useState("");
  const [volunteerError, setVolunteerError] = useState("");

  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [settings, setSettings] = useState({
    notifications: true,
    location: true,
    emergencyAlerts: true,
    darkMode: false,
  });

  // Fetch emergency requests
  const fetchEmergencies = async () => {
    setLoadingEmergencies(true);
    setEmergencyError("");

    try {
      const response = await fetch(EMERGENCIES_API);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setEmergencies(normalizeArray(data, ["emergencies", "data"]));
    } catch (error) {
      console.error("Emergency fetch error:", error);
      setEmergencyError(
        "Unable to load emergencies. Check the emergency API."
      );
    } finally {
      setLoadingEmergencies(false);
    }
  };

  // Fetch rescue teams
  const fetchTeams = async () => {
    setLoadingTeams(true);
    setTeamError("");

    try {
      const response = await fetch(TEAMS_API);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setRescueTeams(
        normalizeArray(data, ["teams", "rescueTeams", "data"])
      );
    } catch (error) {
      console.error("Rescue team fetch error:", error);
      setTeamError("Unable to load rescue teams. Check /api/teams.");
    } finally {
      setLoadingTeams(false);
    }
  };

  // Fetch volunteers
  const fetchVolunteers = async () => {
    setLoadingVolunteers(true);
    setVolunteerError("");

    try {
      const response = await fetch(VOLUNTEERS_API);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setVolunteers(
        normalizeArray(data, ["volunteers", "data"])
      );
    } catch (error) {
      console.error("Volunteer fetch error:", error);
      setVolunteerError(
        "Unable to load volunteers. Check the volunteers API."
      );
    } finally {
      setLoadingVolunteers(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
    fetchTeams();
    fetchVolunteers();
  }, []);

  // Navigation
  const openPage = (nextPage) => {
    if (nextPage === "bookings") {
      navigate("/volunteer/booking");
      return;
    }

    if (nextPage === "ai") {
      navigate("/ai-chat");
      return;
    }

    setPage(nextPage);
    setSearch("");
  };

  const handleLogout = () => {
    localStorage.removeItem("volunteer");
    localStorage.removeItem("volunteerEmail");
    navigate("/login/volunteer");
  };

  // Settings
  const toggleSetting = (key) => {
    setSettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  // Emergency counts
  const counts = useMemo(() => {
    const result = {
      All: emergencies.length,
      Pending: 0,
      Active: 0,
      Completed: 0,
      Cancelled: 0,
    };

    emergencies.forEach((item) => {
      const status = getEmergencyStatus(item).toLowerCase();

      if (status === "pending") result.Pending++;
      if (status === "active") result.Active++;
      if (status === "completed") result.Completed++;

      if (status === "cancelled" || status === "canceled") {
        result.Cancelled++;
      }
    });

    return result;
  }, [emergencies]);

  const filteredEmergencies = useMemo(() => {
    if (statusFilter === "All") return emergencies;

    return emergencies.filter(
      (item) =>
        getEmergencyStatus(item).toLowerCase() ===
        statusFilter.toLowerCase()
    );
  }, [emergencies, statusFilter]);

  // Search rescue teams
  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return rescueTeams;

    return rescueTeams.filter((team) =>
      [
        team.teamName,
        team.name,
        team.email,
        team.teamEmail,
        team.phone,
        team.location,
        team.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [rescueTeams, search]);

  // Search volunteers
  const filteredVolunteers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return volunteers;

    return volunteers.filter((volunteer) =>
      [
        volunteer.name,
        volunteer.fullName,
        volunteer.email,
        volunteer.phone,
        volunteer.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [volunteers, search]);

  const statusClass = (status) => {
    const value = String(status).toLowerCase();

    if (value === "active") return "active";
    if (value === "completed") return "completed";

    if (value === "cancelled" || value === "canceled") {
      return "cancelled";
    }

    return "pending";
  };

  // Home page
  const renderHome = () => (
    <div className="vol-page">
      <div className="vol-welcome">
        <div>
          <span className="vol-eyebrow">
            RESQNET VOLUNTEER PORTAL
          </span>
          <h1>Welcome, Volunteer</h1>
          <p>
            Connect with emergency services, volunteers, and rescue
            teams.
          </p>
        </div>

        <div className="vol-live-indicator">
          <span />
          Dashboard active
        </div>
      </div>

      <div className="vol-home-grid">
        <button
          type="button"
          className="vol-home-card vol-card-ai"
          onClick={() => navigate("/ai-chat")}
        >
          <span className="vol-card-icon">🤖</span>
          <span className="vol-card-title">AI Chat</span>
          <span className="vol-card-description">
            Get emergency-related guidance from the AI assistant.
          </span>
          <span className="vol-card-action">
            Open AI Chat <span>→</span>
          </span>
        </button>

        <button
          type="button"
          className="vol-home-card vol-card-emergency"
          onClick={() => openPage("emergencies")}
        >
          <span className="vol-card-icon">🚨</span>
          <span className="vol-card-title">Emergencies</span>
          <span className="vol-card-description">
            View emergency requests, their status, and map locations.
          </span>
          <span className="vol-card-action">
            View Emergencies <span>→</span>
          </span>
        </button>

        <button
          type="button"
          className="vol-home-card vol-card-volunteers"
          onClick={() => openPage("volunteers")}
        >
          <span className="vol-card-icon">🤝</span>
          <span className="vol-card-title">All Volunteers</span>
          <span className="vol-card-description">
            Find registered volunteers and their contact details.
          </span>
          <span className="vol-card-action">
            View Volunteers <span>→</span>
          </span>
        </button>
      </div>

      <div className="vol-home-note">
        <span className="vol-note-icon">ℹ️</span>
        <div>
          <strong>Emergency response information</strong>
          <p>
            Check emergency details and locations before coordinating
            assistance. For immediate danger, contact local emergency
            services.
          </p>
        </div>
      </div>
    </div>
  );

  // Emergencies page
  const renderEmergencies = () => (
    <div className="vol-page">
      <div className="vol-page-header">
        <div>
          <span className="vol-eyebrow">EMERGENCY MANAGEMENT</span>
          <h1>Emergencies</h1>
          <p>
            Review emergency requests and view their locations.
          </p>
        </div>

        <div className="vol-live-indicator">
          <span />
          Dashboard active
        </div>
      </div>

      <div className="vol-status-grid">
        {[
          ["All", counts.All],
          ["Pending", counts.Pending],
          ["Active", counts.Active],
          ["Completed", counts.Completed],
          ["Cancelled", counts.Cancelled],
        ].map(([label, count]) => (
          <button
            type="button"
            key={label}
            className={`vol-status-card ${
              statusFilter === label ? "selected" : ""
            } status-${label.toLowerCase()}`}
            onClick={() => setStatusFilter(label)}
          >
            <span className="vol-status-label">{label}</span>
            <strong>{count}</strong>
            <span className="vol-status-sub">Requests</span>
          </button>
        ))}
      </div>

      <div className="vol-emergency-layout">
        <section className="vol-panel">
          <div className="vol-panel-heading">
            <div>
              <h2>Emergency Requests</h2>
              <p>
                {filteredEmergencies.length} requests displayed
              </p>
            </div>

            <select
              className="vol-filter-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              {[
                "All",
                "Pending",
                "Active",
                "Completed",
                "Cancelled",
              ].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {loadingEmergencies ? (
            <div className="vol-empty-state">
              Loading emergencies...
            </div>
          ) : emergencyError ? (
            <div className="vol-error-state">
              <strong>Unable to load emergencies</strong>
              <p>{emergencyError}</p>
              <button
                type="button"
                className="vol-retry-button"
                onClick={fetchEmergencies}
              >
                Try again
              </button>
            </div>
          ) : filteredEmergencies.length === 0 ? (
            <div className="vol-empty-state">
              <span>🚨</span>
              <strong>No emergency requests</strong>
              <p>No requests match the selected filter.</p>
            </div>
          ) : (
            <div className="vol-emergency-list">
              {filteredEmergencies.map((item, index) => {
                const status = getEmergencyStatus(item);
                const lat = getLatitude(item);
                const lng = getLongitude(item);
                const validCoordinates =
                  lat !== null &&
                  lng !== null &&
                  Number.isFinite(lat) &&
                  Number.isFinite(lng);

                return (
                  <article
                    className={`vol-emergency-item ${
                      selectedEmergency === item ? "is-selected" : ""
                    }`}
                    key={item.id ?? item.emergencyId ?? index}
                  >
                    <div className="vol-emergency-top">
                      <div className="vol-emergency-symbol">
                        🚨
                      </div>

                      <div className="vol-emergency-main">
                        <h3>
                          {item.emergencyType ||
                            item.type ||
                            "Emergency Request"}
                        </h3>
                        <span
                          className={`vol-status-pill ${statusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>

                    <p className="vol-emergency-description">
                      {item.description ||
                        item.message ||
                        "No additional description provided."}
                    </p>

                    <div className="vol-emergency-meta">
                      <strong>Citizen:</strong>{" "}
                      {item.citizenName ||
                        item.name ||
                        item.citizenEmail ||
                        "Not available"}
                    </div>

                    <div className="vol-emergency-meta">
                      <strong>Location:</strong>{" "}
                      {item.location ||
                        item.address ||
                        "Not available"}
                    </div>

                    <div className="vol-emergency-meta">
                      <strong>Coordinates:</strong>{" "}
                      {validCoordinates
                        ? `${lat}, ${lng}`
                        : "Not available"}
                    </div>

                    <div className="vol-emergency-actions">
                      <button
                        type="button"
                        className="vol-map-button"
                        disabled={!validCoordinates}
                        onClick={() => setSelectedEmergency(item)}
                      >
                        View on map
                      </button>

                      {validCoordinates && (
                        <a
                          className="vol-directions-button"
                          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Directions ↗
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="vol-panel vol-map-panel">
          <div className="vol-panel-heading">
            <div>
              <h2>Emergency Map</h2>
              <p>Select a request to focus its location.</p>
            </div>

            <span className="vol-map-count">
              {
                filteredEmergencies.filter((item) => {
                  const lat = getLatitude(item);
                  const lng = getLongitude(item);

                  return (
                    lat !== null &&
                    lng !== null &&
                    Number.isFinite(lat) &&
                    Number.isFinite(lng)
                  );
                }).length
              }{" "}
              locations
            </span>
          </div>

          <div className="vol-map">
            <MapContainer
              center={[17.421922, 78.650954]}
              zoom={11}
              scrollWheelZoom
              className="vol-leaflet-map"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapFocus selected={selectedEmergency} />

              {filteredEmergencies.map((item, index) => {
                const lat = getLatitude(item);
                const lng = getLongitude(item);

                if (
                  lat === null ||
                  lng === null ||
                  !Number.isFinite(lat) ||
                  !Number.isFinite(lng)
                ) {
                  return null;
                }

                return (
                  <Marker
                    key={item.id ?? item.emergencyId ?? index}
                    position={[lat, lng]}
                    icon={emergencyIcon}
                    eventHandlers={{
                      click: () => setSelectedEmergency(item),
                    }}
                  >
                    <Popup>
                      <strong>
                        {item.emergencyType ||
                          item.type ||
                          "Emergency"}
                      </strong>
                      <br />
                      Status: {getEmergencyStatus(item)}
                      <br />
                      {item.location || item.address || ""}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {selectedEmergency && (
            <div className="vol-map-selected">
              <div>
                <strong>
                  {selectedEmergency.emergencyType ||
                    selectedEmergency.type ||
                    "Selected emergency"}
                </strong>
                <span className="vol-emergency-meta">
                  {selectedEmergency.location ||
                    selectedEmergency.address ||
                    "Location selected"}
                </span>
              </div>

              <button
                type="button"
                className="vol-clear-button"
                onClick={() => setSelectedEmergency(null)}
              >
                Clear
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );

  // Rescue teams page
  const renderTeams = () => (
    <div className="vol-page">
      <div className="vol-page-header">
        <div>
          <span className="vol-eyebrow">RESCUE NETWORK</span>
          <h1>Rescue Teams</h1>
          <p>Browse rescue teams registered in the database.</p>
        </div>

        <span className="vol-total-count">
          {rescueTeams.length} teams
        </span>
      </div>

      <div className="vol-directory-toolbar">
        <input
          className="vol-search"
          type="search"
          placeholder="Search rescue teams..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button
          type="button"
          className="vol-retry-button"
          onClick={fetchTeams}
          disabled={loadingTeams}
        >
          {loadingTeams ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loadingTeams ? (
        <div className="vol-empty-state">
          Loading rescue teams...
        </div>
      ) : teamError ? (
        <div className="vol-error-state">
          <strong>Unable to load rescue teams</strong>
          <p>{teamError}</p>
          <button
            type="button"
            className="vol-retry-button"
            onClick={fetchTeams}
          >
            Try again
          </button>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="vol-empty-state">
          <span>🚑</span>
          <strong>No rescue teams found</strong>
          <p>
            No teams match your search or no teams are registered.
          </p>
        </div>
      ) : (
        <div className="vol-directory-grid">
          {filteredTeams.map((team, index) => {
            const name =
              team.teamName ||
              team.name ||
              `Rescue Team ${index + 1}`;
            const email = team.email || team.teamEmail || "";
            const phone =
              team.phone || team.phoneNumber || team.mobile || "";

            return (
              <article
                className="vol-person-card"
                key={team.id ?? team.teamId ?? email ?? index}
              >
                <div className="vol-person-avatar team-avatar">
                  🚑
                </div>

                <div className="vol-person-info">
                  <h3>{name}</h3>
                  <p>Registered Rescue Team</p>
                </div>

                <div className="vol-person-details">
                  <div>
                    <strong>Email:</strong>{" "}
                    {email || "Not available"}
                  </div>
                  <div>
                    <strong>Phone:</strong>{" "}
                    {phone || "Not available"}
                  </div>
                  <div>
                    <strong>Location:</strong>{" "}
                    {team.location || team.address || "Not available"}
                  </div>
                </div>

                {email ? (
                  <a
                    className="vol-contact-button"
                    href={`mailto:${email}`}
                  >
                    ✉ Contact Team
                  </a>
                ) : phone ? (
                  <a
                    className="vol-contact-button"
                    href={`tel:${phone}`}
                  >
                    ☎ Call Team
                  </a>
                ) : (
                  <button
                    type="button"
                    className="vol-contact-button disabled"
                    disabled
                  >
                    Contact unavailable
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );

  // All volunteers page
  const renderVolunteers = () => (
    <div className="vol-page">
      <div className="vol-page-header">
        <div>
          <span className="vol-eyebrow">VOLUNTEER NETWORK</span>
          <h1>All Volunteers</h1>
          <p>Find volunteers registered in ResQNet.</p>
        </div>

        <span className="vol-total-count">
          {volunteers.length} volunteers
        </span>
      </div>

      <div className="vol-directory-toolbar">
        <input
          className="vol-search"
          type="search"
          placeholder="Search volunteers..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button
          type="button"
          className="vol-retry-button"
          onClick={fetchVolunteers}
          disabled={loadingVolunteers}
        >
          {loadingVolunteers ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loadingVolunteers ? (
        <div className="vol-empty-state">
          Loading volunteers...
        </div>
      ) : volunteerError ? (
        <div className="vol-error-state">
          <strong>Unable to load volunteers</strong>
          <p>{volunteerError}</p>
          <button
            type="button"
            className="vol-retry-button"
            onClick={fetchVolunteers}
          >
            Try again
          </button>
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="vol-empty-state">
          <span>🤝</span>
          <strong>No volunteers found</strong>
          <p>No volunteers match your search.</p>
        </div>
      ) : (
        <div className="vol-directory-grid">
          {filteredVolunteers.map((volunteer, index) => {
            const name =
              volunteer.name ||
              volunteer.fullName ||
              `Volunteer ${index + 1}`;
            const email = volunteer.email || "";
            const phone =
              volunteer.phone || volunteer.phoneNumber || "";

            return (
              <article
                className="vol-person-card"
                key={
                  volunteer.id ??
                  volunteer.volunteerId ??
                  email ??
                  index
                }
              >
                <div className="vol-person-avatar">
                  {name.charAt(0).toUpperCase()}
                </div>

                <div className="vol-person-info">
                  <h3>{name}</h3>
                  <p>Registered Volunteer</p>
                </div>

                <div className="vol-person-details">
                  <div>
                    <strong>Email:</strong>{" "}
                    {email || "Not available"}
                  </div>
                  <div>
                    <strong>Phone:</strong>{" "}
                    {phone || "Not available"}
                  </div>
                  <div>
                    <strong>Location:</strong>{" "}
                    {volunteer.location ||
                      volunteer.address ||
                      "Not available"}
                  </div>
                </div>

                {email ? (
                  <a
                    className="vol-contact-button"
                    href={`mailto:${email}`}
                  >
                    ✉ Contact Volunteer
                  </a>
                ) : phone ? (
                  <a
                    className="vol-contact-button"
                    href={`tel:${phone}`}
                  >
                    ☎ Call Volunteer
                  </a>
                ) : (
                  <button
                    type="button"
                    className="vol-contact-button disabled"
                    disabled
                  >
                    Contact unavailable
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );

  // Messages page
  const renderMessages = () => (
    <div className="vol-page">
      <div className="vol-page-header">
        <div>
          <span className="vol-eyebrow">COMMUNICATION</span>
          <h1>Messages</h1>
          <p>Communicate with rescue teams and volunteers.</p>
        </div>
      </div>

      <div className="vol-panel">
        <div className="vol-empty-state">
          <span>💬</span>
          <strong>Messages</strong>
          <p>Open your messaging page to view conversations.</p>

          <button
            type="button"
            className="vol-retry-button"
            onClick={() => navigate("/volunteer-messages")}
          >
            Open Messages
          </button>
        </div>
      </div>
    </div>
  );

  // AI Chat page link
  const renderAI = () => (
    <div className="vol-page">
      <div className="vol-page-header">
        <div>
          <span className="vol-eyebrow">RESQNET ASSISTANT</span>
          <h1>AI Chat</h1>
          <p>Open the AI assistant in its dedicated page.</p>
        </div>
      </div>

      <div className="vol-panel">
        <div className="vol-empty-state">
          <span>🤖</span>
          <strong>AI Emergency Assistant</strong>
          <p>
            Use the separate assistant page for emergency guidance.
          </p>

          <button
            type="button"
            className="vol-retry-button"
            onClick={() => navigate("/ai-chat")}
          >
            Open AI Chat
          </button>
        </div>
      </div>
    </div>
  );

  // Settings page
  const renderSettings = () => {
    const items = [
      {
        key: "notifications",
        title: "Notifications",
        description: "Receive dashboard notifications.",
        icon: "🔔",
      },
      {
        key: "location",
        title: "Location Access",
        description: "Allow location-based features.",
        icon: "📍",
      },
      {
        key: "emergencyAlerts",
        title: "Emergency Alerts",
        description: "Receive emergency alerts.",
        icon: "🚨",
      },
      {
        key: "darkMode",
        title: "Dark Mode",
        description: "Enable the dashboard dark-mode class.",
        icon: "🌙",
      },
    ];

    return (
      <div className="vol-page">
        <div className="vol-page-header">
          <div>
            <span className="vol-eyebrow">
              ACCOUNT PREFERENCES
            </span>
            <h1>Settings</h1>
            <p>
              Manage your volunteer dashboard preferences.
            </p>
          </div>
        </div>

        <div className="vol-panel">
          {items.map((item) => (
            <div className="vol-emergency-item" key={item.key}>
              <div className="vol-emergency-top">
                <div className="vol-emergency-symbol">
                  {item.icon}
                </div>

                <div className="vol-emergency-main">
                  <h3>{item.title}</h3>
                  <p className="vol-emergency-description">
                    {item.description}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={() => toggleSetting(item.key)}
                  aria-label={item.title}
                />
              </div>
            </div>
          ))}

          <div className="vol-emergency-item">
            <div className="vol-emergency-top">
              <div className="vol-emergency-symbol">👤</div>

              <div className="vol-emergency-main">
                <h3>Volunteer Profile</h3>
                <p className="vol-emergency-description">
                  View or update your profile.
                </p>
              </div>

              <button
                type="button"
                className="vol-map-button"
                onClick={() => navigate("/volunteer-profile")}
              >
                Profile
              </button>
            </div>
          </div>

          <div className="vol-emergency-item">
            <div className="vol-emergency-top">
              <div className="vol-emergency-symbol">🚪</div>

              <div className="vol-emergency-main">
                <h3>Logout</h3>
                <p className="vol-emergency-description">
                  Sign out from your volunteer account.
                </p>
              </div>

              <button
                type="button"
                className="vol-map-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard content
  const renderContent = () => {
    switch (page) {
      case "home":
        return renderHome();
      case "emergencies":
        return renderEmergencies();
      case "volunteers":
        return renderVolunteers();
      case "teams":
        return renderTeams();
      case "messages":
        return renderMessages();
      case "bookings":
        navigate("/volunteer/booking");
        return null;
      case "ai":
        return renderAI();
      case "settings":
        return renderSettings();
      default:
        return renderHome();
    }
  };

  const navItems = [
    { id: "home", icon: "⌂", label: "Home" },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "bookings", icon: "📅", label: "Bookings" },
    { id: "teams", icon: "🚑", label: "Rescue Teams" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <div
      className={`vol-dashboard ${
        settings.darkMode ? "dark-mode" : ""
      }`}
    >
      <header className="vol-topbar">
        <button
          type="button"
          className="vol-brand"
          onClick={() => openPage("home")}
        >
          <span className="vol-brand-mark">🚑</span>
          <span>
            ResQ<span>Net</span>
          </span>
        </button>

        <div className="vol-topbar-right">
          <span className="vol-topbar-role">Volunteer</span>
          <div className="vol-top-avatar">V</div>
        </div>
      </header>

      <main className="vol-main">{renderContent()}</main>

      <nav className="vol-bottom-nav">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`vol-nav-item ${
              page === item.id ? "active" : ""
            }`}
            onClick={() => openPage(item.id)}
          >
            <span className="vol-nav-icon">{item.icon}</span>
            <span className="vol-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
