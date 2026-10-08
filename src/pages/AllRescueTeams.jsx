
import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  MapPin,
  Phone,
  Mail,
  Trash2,
  RefreshCw,
  Shield,
  AlertCircle,
  Navigation,
  UserRound,
} from "lucide-react";
import "./AllRescueTeams.css";

const API = "http://localhost:8081/api/teams";

export default function AllRescueTeams() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  // Fetch all rescue teams
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
      console.error("Error fetching rescue teams:", err);
      setError(
        "Unable to load rescue teams. Check your Spring Boot server and API."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get team information
  const getTeamName = (team, index) =>
    team.teamName ||
    team.name ||
    team.fullName ||
    team.username ||
    `Rescue Team ${index + 1}`;

  const getTeamLocation = (team) =>
    team.location ||
    team.address ||
    team.city ||
    "";

  const getTeamPhone = (team) =>
    team.phone ||
    team.mobile ||
    team.phoneNumber ||
    "";

  const getTeamEmail = (team) =>
    team.email ||
    team.teamEmail ||
    "";

  const getTeamMembers = (team) =>
    team.membersCount ??
    team.numberOfMembers ??
    team.memberCount ??
    null;

  // Search teams
  const filteredTeams = teams.filter((team, index) => {
    const searchText = [
      getTeamName(team, index),
      getTeamLocation(team),
      getTeamPhone(team),
      getTeamEmail(team),
      team.teamId,
      team.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  // Open team location in Google Maps
  const showLocation = (team) => {
    let location = "";

    if (
      team.latitude != null &&
      team.longitude != null
    ) {
      location = `${team.latitude},${team.longitude}`;
    } else {
      location = getTeamLocation(team);
    }

    if (!location || !String(location).trim()) {
      alert("Location is not available for this rescue team.");
      return;
    }

    const url =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(location);

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Delete team
  const deleteTeam = async (team) => {
    if (team.id == null) {
      alert("Team ID is missing. Cannot delete this record.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        team.teamName || team.name || "this rescue team"
      }?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/${encodeURIComponent(team.id)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP ${response.status}`);
      }

      setTeams((previous) =>
        previous.filter(
          (item) => String(item.id) !== String(team.id)
        )
      );

      alert("Rescue team deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Unable to delete rescue team: ${err.message}`);
    }
  };

  // Contact team by email or phone
  const contactTeam = (team) => {
    const phone = getTeamPhone(team);
    const email = getTeamEmail(team);

    if (phone) {
      window.location.href = `tel:${phone}`;
    } else if (email) {
      window.location.href = `mailto:${email}`;
    } else {
      alert("Contact information is not available.");
    }
  };

  return (
    <div className="all-teams-page">
      {/* Header */}
      <div className="teams-header">
        <div className="teams-header-content">
          <div className="teams-heading-icon">
            <Shield size={28} />
          </div>

          <div>
            <h1>All Rescue Teams</h1>
            <p>Manage and view registered rescue teams</p>
          </div>
        </div>

        <button
          className="teams-refresh-btn"
          onClick={fetchTeams}
          disabled={loading}
          type="button"
        >
          <RefreshCw
            size={17}
            className={loading ? "refresh-spinning" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="teams-stats">
        <div className="teams-stat-card">
          <div className="teams-stat-icon blue">
            <Users size={23} />
          </div>
          <div>
            <span>Total Rescue Teams</span>
            <h2>{teams.length}</h2>
          </div>
        </div>

        <div className="teams-stat-card">
          <div className="teams-stat-icon green">
            <Shield size={23} />
          </div>
          <div>
            <span>Matching Teams</span>
            <h2>{filteredTeams.length}</h2>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="teams-search-section">
        <div className="teams-search-box">
          <Search size={19} />
          <input
            type="search"
            placeholder="Search by team name, location, email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="teams-message">
          <div className="teams-loader"></div>
          <p>Loading rescue teams...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="teams-error">
          <AlertCircle size={22} />
          <p>{error}</p>
          <button onClick={fetchTeams} type="button">
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredTeams.length === 0 && (
        <div className="teams-empty">
          <Users size={45} />
          <h3>
            {teams.length === 0
              ? "No Rescue Teams Found"
              : "No Matching Teams"}
          </h3>
          <p>
            {teams.length === 0
              ? "No rescue teams are currently registered."
              : "Try searching with a different keyword."}
          </p>
        </div>
      )}

      {/* Rescue team cards */}
      {!loading && !error && filteredTeams.length > 0 && (
        <div className="teams-grid">
          {filteredTeams.map((team, index) => {
            const name = getTeamName(team, index);
            const location = getTeamLocation(team);
            const phone = getTeamPhone(team);
            const email = getTeamEmail(team);
            const members = getTeamMembers(team);

            return (
              <div
                className="rescue-team-card"
                key={team.id ?? index}
              >
                {/* Card top */}
                <div className="team-card-top">
                  <div className="team-avatar">
                    {team.profileImage || team.imageUrl ? (
                      <img
                        src={team.profileImage || team.imageUrl}
                        alt={name}
                      />
                    ) : (
                      <UserRound size={31} />
                    )}
                  </div>

                  <div className="team-card-title">
                    <h3>{name}</h3>
                    <span className="team-status">
                      {team.status || "Registered"}
                    </span>
                  </div>
                </div>

                {/* Team details */}
                <div className="team-details">
                  <div className="team-detail-row">
                    <MapPin size={17} />
                    <span>
                      {location || "Location not provided"}
                    </span>
                  </div>

                  <div className="team-detail-row">
                    <Phone size={17} />
                    <span>
                      {phone || "Phone not provided"}
                    </span>
                  </div>

                  <div className="team-detail-row">
                    <Mail size={17} />
                    <span>
                      {email || "Email not provided"}
                    </span>
                  </div>

                  {members !== null && (
                    <div className="team-detail-row">
                      <Users size={17} />
                      <span>{members} members</span>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="team-card-actions">
                  <button
                    type="button"
                    className="team-contact-btn"
                    onClick={() => contactTeam(team)}
                  >
                    <Phone size={16} />
                    Contact
                  </button>

                  <button
                    type="button"
                    className="team-location-btn"
                    onClick={() => showLocation(team)}
                  >
                    <Navigation size={16} />
                    Location
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
