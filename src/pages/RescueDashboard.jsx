import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "./RescueDashboard.css";

/* =========================================================
   API
========================================================= */

const API_BASE = "http://localhost:8081/api";

const EMERGENCIES_API = `${API_BASE}/emergencies`;
const TEAM_MEMBERS_API = `${API_BASE}/team-members`;
const TEAMS_API = `${API_BASE}/teams`;

/* =========================================================
   LEAFLET MARKER FIX
========================================================= */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* =========================================================
   MAP CENTER
========================================================= */

const MapCenter = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);

  return null;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const RescueDashboard = () => {
  const navigate = useNavigate();

  /* =======================================================
     TEAM
  ======================================================= */

  const [teamId, setTeamId] = useState(
    localStorage.getItem("teamId") || ""
  );

  const [teamName, setTeamName] = useState(
    localStorage.getItem("teamName") || "RESCUE TEAM"
  );

  const teamEmail = localStorage.getItem("teamEmail") || "";

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const [activePage, setActivePage] = useState("home");
  const [showSettings, setShowSettings] = useState(false);

  /* =======================================================
     COMMON
  ======================================================= */

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     EMERGENCIES
  ======================================================= */

  const [emergencies, setEmergencies] = useState([]);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  const [emergencyFilter, setEmergencyFilter] =
    useState("ALL");

  const [statusUpdatingId, setStatusUpdatingId] =
    useState(null);

  /* =======================================================
     MAP
  ======================================================= */

  const [showMap, setShowMap] = useState(false);
  const [selectedEmergency, setSelectedEmergency] =
    useState(null);

  /* =======================================================
     MEMBERS
  ======================================================= */

  const [teamMembers, setTeamMembers] = useState([]);
  const [membersLoading, setMembersLoading] =
    useState(false);

  const [membersError, setMembersError] = useState("");
  const [showMemberModal, setShowMemberModal] =
    useState(false);

  const [editingMemberId, setEditingMemberId] =
    useState(null);

  const [memberSaving, setMemberSaving] = useState(false);

  const emptyMember = {
    name: "",
    role: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
    availability: "Available",
    skills: "",
  };

  const [memberForm, setMemberForm] =
    useState(emptyMember);

  /* =======================================================
     TEAMS
  ======================================================= */

  const [allTeams, setAllTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  /* =======================================================
     AI
  ======================================================= */

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  /* =======================================================
     LOGIN CHECK
  ======================================================= */

  useEffect(() => {
    const loggedIn =
      localStorage.getItem("rescueTeamLoggedIn") ===
      "true";

    if (!loggedIn) {
      navigate("/login/rescue-team", {
        replace: true,
      });

      return;
    }

    const storedTeamId = localStorage.getItem("teamId");
    const storedTeamName =
      localStorage.getItem("teamName");

    if (storedTeamId) {
      setTeamId(storedTeamId);
    }

    if (storedTeamName) {
      setTeamName(storedTeamName);
    }
  }, [navigate]);

  /* =======================================================
     FETCH EMERGENCIES
  ======================================================= */

  const fetchEmergencies = async () => {
    try {
      setEmergencyLoading(true);
      setErrorMessage("");

      const response = await fetch(EMERGENCIES_API);

      if (!response.ok) {
        throw new Error(
          "Unable to load emergencies."
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setEmergencies(data);
      } else if (Array.isArray(data.emergencies)) {
        setEmergencies(data.emergencies);
      } else if (Array.isArray(data.data)) {
        setEmergencies(data.data);
      } else {
        setEmergencies([]);
      }
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Unable to load emergency requests."
      );
    } finally {
      setEmergencyLoading(false);
    }
  };

  /* =======================================================
     FETCH MEMBERS
  ======================================================= */

  const fetchMembers = async () => {
    if (!teamId) {
      return;
    }

    try {
      setMembersLoading(true);
      setMembersError("");

      const response = await fetch(
        `${TEAM_MEMBERS_API}/team/${teamId}`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load team members."
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setTeamMembers(data);
      } else if (Array.isArray(data.members)) {
        setTeamMembers(data.members);
      } else if (Array.isArray(data.data)) {
        setTeamMembers(data.data);
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error(error);

      setMembersError(
        "Unable to load team members."
      );
    } finally {
      setMembersLoading(false);
    }
  };

  /* =======================================================
     FETCH TEAMS
  ======================================================= */

  const fetchTeams = async () => {
    try {
      setTeamsLoading(true);

      const response = await fetch(TEAMS_API);

      if (!response.ok) {
        throw new Error(
          "Unable to load rescue teams."
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setAllTeams(data);
      } else if (Array.isArray(data.teams)) {
        setAllTeams(data.teams);
      } else if (Array.isArray(data.rescueTeams)) {
        setAllTeams(data.rescueTeams);
      } else if (Array.isArray(data.data)) {
        setAllTeams(data.data);
      } else {
        setAllTeams([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTeamsLoading(false);
    }
  };

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
    fetchEmergencies();
  }, []);

  useEffect(() => {
    if (teamId) {
      fetchMembers();
    }

    fetchTeams();
  }, [teamId]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNavigation = (page) => {
    setActivePage(page);
    setShowSettings(false);
    setMessage("");
    setErrorMessage("");

    if (page === "home") {
      fetchEmergencies();
    }

    if (page === "members") {
      fetchMembers();
    }

    if (page === "teams") {
      fetchTeams();
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    localStorage.removeItem("rescueTeamLoggedIn");
    localStorage.removeItem("team");
    localStorage.removeItem("teamId");
    localStorage.removeItem("teamName");
    localStorage.removeItem("teamEmail");
    localStorage.removeItem("teamPhone");

    navigate("/login/rescue-team", {
      replace: true,
    });
  };

  /* =======================================================
     STATUS
  ======================================================= */

  const getStatus = (emergency) => {
    return String(
      emergency?.status || "PENDING"
    ).toUpperCase();
  };

  /* =======================================================
     STATUS COUNTS
  ======================================================= */

  const statusCounts = useMemo(() => {
    return {
      ALL: emergencies.length,

      PENDING: emergencies.filter(
        (item) => getStatus(item) === "PENDING"
      ).length,

      ACTIVE: emergencies.filter(
        (item) => getStatus(item) === "ACTIVE"
      ).length,

      COMPLETED: emergencies.filter(
        (item) => getStatus(item) === "COMPLETED"
      ).length,

      CANCELLED: emergencies.filter(
        (item) => getStatus(item) === "CANCELLED"
      ).length,
    };
  }, [emergencies]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredEmergencies = useMemo(() => {
    if (emergencyFilter === "ALL") {
      return emergencies;
    }

    return emergencies.filter(
      (emergency) =>
        getStatus(emergency) === emergencyFilter
    );
  }, [emergencies, emergencyFilter]);

  /* =======================================================
     UPDATE EMERGENCY STATUS
  ======================================================= */

  const updateEmergencyStatus = async (
    emergency,
    newStatus
  ) => {
    if (!emergency?.id) {
      setErrorMessage(
        "Emergency ID is missing."
      );

      return;
    }

    const currentStatus = getStatus(emergency);

    if (
      currentStatus === "COMPLETED" ||
      currentStatus === "CANCELLED"
    ) {
      return;
    }

    if (
      currentStatus === "PENDING" &&
      newStatus !== "ACTIVE"
    ) {
      return;
    }

    if (
      currentStatus === "ACTIVE" &&
      !["COMPLETED", "CANCELLED"].includes(
        newStatus
      )
    ) {
      return;
    }

    let confirmationText = "";

    if (newStatus === "ACTIVE") {
      confirmationText =
        "Accept this emergency and move it to ACTIVE?";
    }

    if (newStatus === "COMPLETED") {
      confirmationText =
        "Mark this emergency as COMPLETED?";
    }

    if (newStatus === "CANCELLED") {
      confirmationText =
        "Mark this emergency as CANCELLED?";
    }

    if (!window.confirm(confirmationText)) {
      return;
    }

    try {
      setStatusUpdatingId(emergency.id);
      setMessage("");
      setErrorMessage("");

      const response = await fetch(
        `${EMERGENCIES_API}/${emergency.id}/status?status=${encodeURIComponent(
          newStatus
        )}`,
        {
          method: "PUT",
        }
      );

      const text = await response.text();

      let data = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message ||
              "Unable to update emergency status."
        );
      }

      setEmergencies((previous) =>
        previous.map((item) =>
          item.id === emergency.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      if (newStatus === "ACTIVE") {
        setMessage(
          "Emergency accepted and moved to ACTIVE."
        );
      }

      if (newStatus === "COMPLETED") {
        setMessage(
          "Emergency marked as COMPLETED."
        );
      }

      if (newStatus === "CANCELLED") {
        setMessage(
          "Emergency marked as CANCELLED."
        );
      }

      await fetchEmergencies();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error.message ||
          "Unable to update emergency."
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  /* =======================================================
     LOCATION PARSER
     
     Coordinates are used ONLY internally for the map.
     They are NOT displayed in the emergency card.
  ======================================================= */

  const getCoordinates = (emergency) => {
    let latitude = emergency?.latitude;
    let longitude = emergency?.longitude;

    if (
      latitude !== null &&
      latitude !== undefined &&
      longitude !== null &&
      longitude !== undefined &&
      latitude !== "" &&
      longitude !== ""
    ) {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        return [lat, lng];
      }
    }

    const location = emergency?.location;

    if (typeof location === "string") {
      const parts = location
        .split(",")
        .map((item) => item.trim());

      if (parts.length >= 2) {
        const lat = Number(parts[0]);
        const lng = Number(parts[1]);

        if (
          Number.isFinite(lat) &&
          Number.isFinite(lng)
        ) {
          return [lat, lng];
        }
      }
    }

    return null;
  };

  /* =======================================================
     OPEN MAP
  ======================================================= */

  const openEmergencyMap = (emergency) => {
    const coordinates =
      getCoordinates(emergency);

    if (!coordinates) {
      setErrorMessage(
        "Location coordinates are not available for this emergency."
      );

      return;
    }

    setSelectedEmergency(emergency);
    setShowMap(true);
  };

  /* =======================================================
     CLOSE MAP
  ======================================================= */

  const closeMap = () => {
    setShowMap(false);
    setSelectedEmergency(null);
  };

  /* =======================================================
     EMERGENCY TYPE
  ======================================================= */

  const getEmergencyType = (emergency) => {
    return (
      emergency?.emergencyType ||
      emergency?.type ||
      "Emergency"
    );
  };

  /* =======================================================
     EMERGENCY LOCATION
  ======================================================= */

  const getEmergencyLocation = (emergency) => {
    const location = emergency?.location;

    /*
      If location contains coordinates only,
      do not display the coordinates.
    */

    if (
      typeof location === "string" &&
      location.trim() !== ""
    ) {
      const parts = location
        .split(",")
        .map((item) => item.trim());

      if (
        parts.length >= 2 &&
        Number.isFinite(Number(parts[0])) &&
        Number.isFinite(Number(parts[1]))
      ) {
        return "Emergency location available";
      }

      return location;
    }

    return "Location not available";
  };

  /* =======================================================
     STATUS CLASS
  ======================================================= */

  const getStatusClass = (status) => {
    return String(status || "PENDING")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  /* =======================================================
     MEMBER FORM
  ======================================================= */

  const handleMemberChange = (event) => {
    const { name, value } = event.target;

    setMemberForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddMember = () => {
    setEditingMemberId(null);
    setMemberForm(emptyMember);
    setShowMemberModal(true);
  };

  const openEditMember = (member) => {
    setEditingMemberId(member.id);

    setMemberForm({
      name: member.name || "",
      role: member.role || "",
      phone: member.phone || "",
      email: member.email || "",
      age: member.age || "",
      gender: member.gender || "",
      availability:
        member.availability || "Available",
      skills: member.skills || "",
    });

    setShowMemberModal(true);
  };

  /* =======================================================
     SAVE MEMBER
  ======================================================= */

  const saveMember = async (event) => {
    event.preventDefault();

    if (!teamId) {
      setErrorMessage("Team ID not found.");
      return;
    }

    if (!memberForm.name.trim()) {
      setErrorMessage(
        "Please enter member name."
      );

      return;
    }

    try {
      setMemberSaving(true);
      setMessage("");
      setErrorMessage("");

      const payload = {
        name: memberForm.name.trim(),
        role: memberForm.role,
        phone: memberForm.phone.trim(),
        email: memberForm.email.trim(),

        age: memberForm.age
          ? Number(memberForm.age)
          : null,

        gender: memberForm.gender,

        availability:
          memberForm.availability,

        skills: memberForm.skills.trim(),

        teamId: Number(teamId),
      };

      const url = editingMemberId
        ? `${TEAM_MEMBERS_API}/${editingMemberId}`
        : TEAM_MEMBERS_API;

      const method = editingMemberId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(payload),
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(
          text || "Unable to save member."
        );
      }

      setMessage(
        editingMemberId
          ? "Member updated successfully."
          : "Member added successfully."
      );

      setShowMemberModal(false);
      setEditingMemberId(null);
      setMemberForm(emptyMember);

      await fetchMembers();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error.message ||
          "Unable to save member."
      );
    } finally {
      setMemberSaving(false);
    }
  };

  /* =======================================================
     DELETE MEMBER
  ======================================================= */

  const deleteMember = async (id) => {
    if (
      !window.confirm(
        "Remove this member from your rescue team?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${TEAM_MEMBERS_API}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to delete member."
        );
      }

      setMessage(
        "Member removed successfully."
      );

      await fetchMembers();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  /* =======================================================
     AI
  ======================================================= */

  const askAI = () => {
    const question = aiQuestion
      .trim()
      .toLowerCase();

    if (!question) {
      setAiResponse(
        "Please enter a question."
      );

      return;
    }

    if (question.includes("emergency")) {
      setAiResponse(
        "Use the emergency status filters to manage Pending, Active, Completed and Cancelled requests."
      );

      return;
    }

    if (question.includes("member")) {
      setAiResponse(
        "Open Members from the bottom navigation to add or manage your rescue team members."
      );

      return;
    }

    if (
      question.includes("map") ||
      question.includes("location")
    ) {
      setAiResponse(
        "Click View Map on an emergency card to see the emergency location on the map."
      );

      return;
    }

    setAiResponse(
      "I can help with emergency requests, maps, team members and rescue operations."
    );
  };

  /* =======================================================
     HOME
  ======================================================= */

  const renderHome = () => {
    return (
      <div className="dashboard-content">

        {/* WELCOME */}

        <section className="welcome-card">

          <div>
            <span className="welcome-label">
              RESQNET • RESCUE NETWORK
            </span>

            <h1>
              Welcome, {teamName}
            </h1>

            <p>
              Monitor emergency requests,
              coordinate rescue operations
              and manage your team.
            </p>
          </div>

          <div className="welcome-symbol">
            🚑
          </div>
<button
      type="button"
      className="ai-chat-button"
      onClick={() => navigate("/ai-chat")}
    >
      Open AI Chat
      <span>→</span>
    </button>
        </section>

        {/* MESSAGES */}

        {message && (
          <div className="dashboard-success">
            ✓ {message}
          </div>
        )}

        {errorMessage && (
          <div className="dashboard-error">
            ⚠ {errorMessage}
          </div>
        )}

        {/* EMERGENCY MANAGEMENT */}

        <section className="main-card">

          <div className="card-heading">

            <div>
              <span>
                EMERGENCY MANAGEMENT
              </span>

              <h2>
                Emergency Requests
              </h2>
            </div>

            <button
              className="refresh-btn"
              onClick={fetchEmergencies}
            >
              ↻ Refresh
            </button>

          </div>

          {/* STATUS FILTERS */}

          <div className="status-filter">

            <button
              className={
                emergencyFilter === "ALL"
                  ? "status-filter-btn all active"
                  : "status-filter-btn all"
              }
              onClick={() =>
                setEmergencyFilter("ALL")
              }
            >
              <span>All</span>

              <strong>
                {statusCounts.ALL}
              </strong>
            </button>

            <button
              className={
                emergencyFilter === "PENDING"
                  ? "status-filter-btn pending active"
                  : "status-filter-btn pending"
              }
              onClick={() =>
                setEmergencyFilter("PENDING")
              }
            >
              <span>Pending</span>

              <strong>
                {statusCounts.PENDING}
              </strong>
            </button>

            <button
              className={
                emergencyFilter === "ACTIVE"
                  ? "status-filter-btn active-status active"
                  : "status-filter-btn active-status"
              }
              onClick={() =>
                setEmergencyFilter("ACTIVE")
              }
            >
              <span>Active</span>

              <strong>
                {statusCounts.ACTIVE}
              </strong>
            </button>

            <button
              className={
                emergencyFilter === "COMPLETED"
                  ? "status-filter-btn completed active"
                  : "status-filter-btn completed"
              }
              onClick={() =>
                setEmergencyFilter("COMPLETED")
              }
            >
              <span>Completed</span>

              <strong>
                {statusCounts.COMPLETED}
              </strong>
            </button>

            <button
              className={
                emergencyFilter === "CANCELLED"
                  ? "status-filter-btn cancelled active"
                  : "status-filter-btn cancelled"
              }
              onClick={() =>
                setEmergencyFilter("CANCELLED")
              }
            >
              <span>Cancelled</span>

              <strong>
                {statusCounts.CANCELLED}
              </strong>
            </button>

          </div>

          {/* LOADING */}

          {emergencyLoading ? (
            <div className="loading-state">

              <div className="spinner"></div>

              <p>
                Loading emergency requests...
              </p>

            </div>
          ) : filteredEmergencies.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h3>
                No emergencies found
              </h3>

              <p>
                There are no emergency
                requests in this category.
              </p>

            </div>

          ) : (

            <div className="emergency-list">

              {filteredEmergencies.map(
                (emergency) => {

                  const status =
                    getStatus(emergency);

                  const coordinates =
                    getCoordinates(emergency);

                  const isUpdating =
                    statusUpdatingId ===
                    emergency.id;

                  return (
                    <div
                      className="emergency-item"
                      key={emergency.id}
                    >

                      {/* TOP */}

                      <div className="emergency-item-top">

                        <div className="emergency-icon">
                          🚨
                        </div>

                        <div className="emergency-title">

                          <h3>
                            {getEmergencyType(
                              emergency
                            )}
                          </h3>

                          <span>
                            Emergency #
                            {emergency.id}
                          </span>

                        </div>

                        <span
                          className={`status-badge ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </div>

                      {/* DETAILS */}

                      <div className="emergency-info-grid">

                        <div className="info-box">
                          <span>
                            LOCATION
                          </span>

                          <strong>
                            {getEmergencyLocation(
                              emergency
                            )}
                          </strong>
                        </div>

                        <div className="info-box">
                          <span>
                            SEVERITY
                          </span>

                          <strong>
                            {emergency.severity ||
                              "Not specified"}
                          </strong>
                        </div>

                        <div className="info-box">
                          <span>
                            CITIZEN
                          </span>

                          <strong>
                            {emergency.citizenEmail ||
                              "Not available"}
                          </strong>
                        </div>

                        <div className="info-box">
                          <span>
                            CONTACT
                          </span>

                          <strong>
                            {emergency.contactNumber ||
                              "Not available"}
                          </strong>
                        </div>

                      </div>

                      {/* DESCRIPTION */}

                      {emergency.description && (
                        <div className="description-box">

                          <span>
                            DESCRIPTION
                          </span>

                          <p>
                            {emergency.description}
                          </p>

                        </div>
                      )}

                      {/* ACTIONS */}

                      <div className="emergency-action-row">

                        {/* PENDING */}

                        {status === "PENDING" && (
                          <button
                            className="accept-btn"
                            disabled={isUpdating}
                            onClick={() =>
                              updateEmergencyStatus(
                                emergency,
                                "ACTIVE"
                              )
                            }
                          >
                            {isUpdating
                              ? "Updating..."
                              : "✓ Accept Emergency"}
                          </button>
                        )}

                        {/* ACTIVE */}

                        {status === "ACTIVE" && (
                          <>
                            <button
                              className="complete-btn"
                              disabled={isUpdating}
                              onClick={() =>
                                updateEmergencyStatus(
                                  emergency,
                                  "COMPLETED"
                                )
                              }
                            >
                              {isUpdating
                                ? "Updating..."
                                : "✓ Mark Completed"}
                            </button>

                            <button
                              className="cancel-btn"
                              disabled={isUpdating}
                              onClick={() =>
                                updateEmergencyStatus(
                                  emergency,
                                  "CANCELLED"
                                )
                              }
                            >
                              {isUpdating
                                ? "Updating..."
                                : "× Cancel"}
                            </button>
                          </>
                        )}

                        {/* COMPLETED */}

                        {status === "COMPLETED" && (
                          <div className="finished-message completed-message">
                            ✓ Emergency Completed
                          </div>
                        )}

                        {/* CANCELLED */}

                        {status === "CANCELLED" && (
                          <div className="finished-message cancelled-message">
                            × Emergency Cancelled
                          </div>
                        )}

                        {/* MAP */}

                        <button
                          className="map-btn"
                          disabled={!coordinates}
                          onClick={() =>
                            openEmergencyMap(
                              emergency
                            )
                          }
                        >
                          📍 View Map
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* AI */}

        <section className="main-card ai-section">

          <div className="card-heading">

            <div>
              <span>
                RESQNET ASSISTANT
              </span>

              <h2>
                AI Emergency Assistant
              </h2>
            </div>

            <div className="ai-badge">
              AI
            </div>

          </div>

          <p className="ai-description">
            Ask about emergency management,
            team members or emergency locations.
          </p>

          <div className="ai-input">

            <input
              type="text"
              value={aiQuestion}
              onChange={(event) =>
                setAiQuestion(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  askAI();
                }
              }}
              placeholder="Ask ResQNet AI..."
            />

            <button onClick={askAI}>
              Ask
            </button>

          </div>

          {aiResponse && (
            <div className="ai-response">

              <strong>
                ResQNet AI
              </strong>

              <p>
                {aiResponse}
              </p>

            </div>
          )}

        </section>

      </div>
    );
  };

  /* =======================================================
     MEMBERS
  ======================================================= */

  const renderMembers = () => {
    return (
      <div className="dashboard-content">

        <section className="page-header-card">

          <div>
            <span>
              TEAM MANAGEMENT
            </span>

            <h1>
              Team Members
            </h1>

            <p>
              Manage members of your rescue team.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={openAddMember}
          >
            + Add Member
          </button>

        </section>

        {message && (
          <div className="dashboard-success">
            ✓ {message}
          </div>
        )}

        {membersError && (
          <div className="dashboard-error">
            ⚠ {membersError}
          </div>
        )}

        {membersLoading ? (

          <div className="loading-state">
            <div className="spinner"></div>

            <p>
              Loading members...
            </p>
          </div>

        ) : teamMembers.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              👥
            </div>

            <h3>
              No team members
            </h3>

            <p>
              Add members to your rescue team.
            </p>

            <button
              className="primary-btn"
              onClick={openAddMember}
            >
              + Add Member
            </button>

          </div>

        ) : (

          <div className="members-grid">

            {teamMembers.map((member) => (

              <div
                className="member-card"
                key={member.id}
              >

                <div className="member-top">

                  <div className="member-avatar">
                    {member.name
                      ?.charAt(0)
                      .toUpperCase() || "M"}
                  </div>

                  <div>

                    <h3>
                      {member.name}
                    </h3>

                    <span>
                      {member.role ||
                        "Team Member"}
                    </span>

                  </div>

                </div>

                <div className="member-details">

                  <p>
                    📞{" "}
                    {member.phone ||
                      "No phone"}
                  </p>

                  <p>
                    ✉{" "}
                    {member.email ||
                      "No email"}
                  </p>

                  <p>
                    🛠{" "}
                    {member.skills ||
                      "No skills added"}
                  </p>

                </div>

                <div className="member-actions">

                  <button
                    className="edit-btn"
                    onClick={() =>
                      openEditMember(member)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteMember(member.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>
    );
  };

  /* =======================================================
     MESSAGES
  ======================================================= */

 const renderMessages = () => {
  return (
    <div className="dashboard-content">
      <section className="page-header-card">
        <div>
          <span>RESQNET COMMUNICATION</span>
          <h1>Messages</h1>
          <p>Communicate with citizens, hospitals, volunteers, and admins.</p>
        </div>
      </section>

      <div className="messages-card">
        <div className="messages-icon">
          <MessageCircle size={32} />
        </div>

        <h2>Rescue Team Chats</h2>
        <p>Open your chat page to view and send messages.</p>

        <button
          type="button"
          className="dashboard-chat-button"
          onClick={() => navigate("/rescue-team-messages")}
        >
          <MessageCircle size={20} />
          <span>Open Chats</span>
        </button>
      </div>
    </div>
  );
};
  /* =======================================================
     TEAMS
  ======================================================= */

  const renderTeams = () => {
    return (
      <div className="dashboard-content">

        <section className="page-header-card">

          <div>

            <span>
              RESQNET NETWORK
            </span>

            <h1>
              Rescue Teams
            </h1>

            <p>
              View other registered rescue teams.
            </p>

          </div>

          <button
            className="refresh-btn"
            onClick={fetchTeams}
          >
            ↻ Refresh
          </button>

        </section>

        {teamsLoading ? (

          <div className="loading-state">

            <div className="spinner"></div>

            <p>
              Loading rescue teams...
            </p>

          </div>

        ) : (

          <div className="teams-grid">

            {allTeams.map((team, index) => (

              <div
                className="team-card"
                key={
                  team.id ||
                  team.teamId ||
                  index
                }
              >

                <div className="team-icon">
                  🚑
                </div>

                <div>

                  <h3>
                    {team.teamName ||
                      team.name ||
                      `Rescue Team ${
                        index + 1
                      }`}
                  </h3>

                  <p>
                    {team.email ||
                      "Email not available"}
                  </p>

                  <p>
                    {team.phone ||
                      "Phone not available"}
                  </p>

                </div>

                <span>
                  Available
                </span>

              </div>

            ))}

          </div>
        )}

      </div>
    );
  };

  /* =======================================================
     SETTINGS
  ======================================================= */

  const renderSettings = () => {
    return (
      <div className="dashboard-content">

        <section className="page-header-card">

          <div>

            <span>
              ACCOUNT
            </span>

            <h1>
              Settings
            </h1>

            <p>
              Manage your Rescue Team account.
            </p>

          </div>

          <div className="header-page-icon">
            ⚙
          </div>

        </section>

        <div className="settings-list">

          <div
  className="setting-card clickable-setting"
  onClick={() => navigate("/team-profile")}
>
  <div className="setting-icon">
    👥
  </div>

  <div className="setting-content">
    <h3>
      Team Profile
    </h3>

    <p>
      {teamName}
    </p>
  </div>

  <span className="setting-arrow">
    →
  </span>
</div>

          <div className="setting-card">

            <div className="setting-icon">
              ✉
            </div>

            <div>

              <h3>
                Team Email
              </h3>

              <p>
                {teamEmail ||
                  "Not available"}
              </p>

            </div>

          </div>

          <div className="setting-card logout-card">

            <div className="setting-icon">
              🚪
            </div>

            <div>

              <h3>
                Logout
              </h3>

              <p>
                Sign out from your Rescue
                Team account.
              </p>

            </div>

            <button
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </div>
    );
  };

  /* =======================================================
     MEMBER MODAL
  ======================================================= */

  const renderMemberModal = () => {
    if (!showMemberModal) {
      return null;
    }

    return (
      <div
        className="modal-overlay"
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            setShowMemberModal(false);
          }
        }}
      >

        <div className="member-modal">

          <div className="modal-header">

            <div>

              <span>
                TEAM MANAGEMENT
              </span>

              <h2>
                {editingMemberId
                  ? "Edit Member"
                  : "Add Member"}
              </h2>

            </div>

            <button
              className="modal-close"
              onClick={() =>
                setShowMemberModal(false)
              }
            >
              ×
            </button>

          </div>

          <form
            className="member-form"
            onSubmit={saveMember}
          >

            <div className="form-grid">

              <div>
                <label>
                  Full Name *
                </label>

                <input
                  name="name"
                  value={memberForm.name}
                  onChange={handleMemberChange}
                  placeholder="Enter name"
                  required
                />
              </div>

              <div>
                <label>
                  Role *
                </label>

                <select
                  name="role"
                  value={memberForm.role}
                  onChange={handleMemberChange}
                  required
                >
                  <option value="">
                    Select role
                  </option>

                  <option>
                    Team Leader
                  </option>

                  <option>
                    Rescue Officer
                  </option>

                  <option>
                    Paramedic
                  </option>

                  <option>
                    Driver
                  </option>

                  <option>
                    Medical Responder
                  </option>

                  <option>
                    Fire Responder
                  </option>

                  <option>
                    Volunteer
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Phone *
                </label>

                <input
                  name="phone"
                  value={memberForm.phone}
                  onChange={handleMemberChange}
                  placeholder="Phone"
                  required
                />
              </div>

              <div>
                <label>
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  value={memberForm.email}
                  onChange={handleMemberChange}
                  placeholder="Email"
                />
              </div>

              <div>
                <label>
                  Age
                </label>

                <input
                  name="age"
                  type="number"
                  value={memberForm.age}
                  onChange={handleMemberChange}
                  placeholder="Age"
                />
              </div>

              <div>
                <label>
                  Gender
                </label>

                <select
                  name="gender"
                  value={memberForm.gender}
                  onChange={handleMemberChange}
                >
                  <option value="">
                    Select
                  </option>

                  <option>
                    Male
                  </option>

                  <option>
                    Female
                  </option>

                  <option>
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Availability
                </label>

                <select
                  name="availability"
                  value={
                    memberForm.availability
                  }
                  onChange={handleMemberChange}
                >
                  <option>
                    Available
                  </option>

                  <option>
                    Busy
                  </option>

                  <option>
                    On Duty
                  </option>

                  <option>
                    Off Duty
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Skills
                </label>

                <input
                  name="skills"
                  value={memberForm.skills}
                  onChange={handleMemberChange}
                  placeholder="First Aid, Driving..."
                />
              </div>

            </div>

            <div className="modal-actions">

              <button
                type="button"
                className="modal-cancel"
                onClick={() =>
                  setShowMemberModal(false)
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="modal-save"
                disabled={memberSaving}
              >
                {memberSaving
                  ? "Saving..."
                  : editingMemberId
                  ? "Update Member"
                  : "Add Member"}
              </button>

            </div>

          </form>

        </div>

      </div>
    );
  };

  /* =======================================================
     MAP MODAL
     
     IMPORTANT:
     Latitude / longitude are NOT displayed.
     They are only used internally by Leaflet.
  ======================================================= */

  const renderMapModal = () => {
    if (
      !showMap ||
      !selectedEmergency
    ) {
      return null;
    }

    const coordinates =
      getCoordinates(selectedEmergency);

    if (!coordinates) {
      return null;
    }

    return (
      <div className="map-overlay">

        <div className="map-modal">

          <div className="map-header">

            <div>

              <span>
                EMERGENCY LOCATION
              </span>

              <h2>
                {getEmergencyType(
                  selectedEmergency
                )}
              </h2>

              <p>
                Emergency #
                {selectedEmergency.id}
              </p>

            </div>

            <button
              className="map-close"
              onClick={closeMap}
            >
              ×
            </button>

          </div>

          {/* ONLY LOCATION NAME/ADDRESS */}

          <div className="map-location-bar">

            <div>
              <span>
                📍 Emergency Location
              </span>

              <strong>
                {getEmergencyLocation(
                  selectedEmergency
                )}
              </strong>
            </div>

            <div>
              <span>
                Emergency Status
              </span>

              <strong>
                {getStatus(
                  selectedEmergency
                )}
              </strong>
            </div>

          </div>

          {/* MAP */}

          <div className="map-container">

            <MapContainer
              center={coordinates}
              zoom={16}
              scrollWheelZoom={true}
              style={{
                width: "100%",
                height: "100%",
              }}
            >

              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapCenter
                position={coordinates}
              />

              <Marker
                position={coordinates}
              >

                <Popup>

                  <div className="map-popup">

                    <strong>
                      🚨{" "}
                      {getEmergencyType(
                        selectedEmergency
                      )}
                    </strong>

                    <p>
                      {getEmergencyLocation(
                        selectedEmergency
                      )}
                    </p>

                    <small>
                      Status:{" "}
                      {getStatus(
                        selectedEmergency
                      )}
                    </small>

                  </div>

                </Popup>

              </Marker>

            </MapContainer>

          </div>

          {/* MAP FOOTER WITHOUT COORDINATES */}

          <div className="map-footer">

            <div>
              <span>
                Emergency
              </span>

              <strong>
                #{selectedEmergency.id}
              </strong>
            </div>

            <div>
              <span>
                Status
              </span>

              <strong>
                {getStatus(
                  selectedEmergency
                )}
              </strong>
            </div>

            <button
              onClick={() => {
                window.open(
                  `https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}`,
                  "_blank"
                );
              }}
            >
              Open Google Maps
            </button>

          </div>

        </div>

      </div>
    );
  };

  /* =======================================================
     MAIN RETURN
  ======================================================= */

  return (
    <div className="rescue-dashboard">

      {/* HEADER */}

      <header className="top-header">

        <div className="brand">

          <div className="brand-logo">
            R
          </div>

          <div>

            <h2>
              RESQNET
            </h2>

            <span>
              Rescue Network
            </span>

          </div>

        </div>

        <div className="header-right">
          

          <button
            className="header-message"
            onClick={() =>
              handleNavigation("messages")
            }
          >
            💬
            <span>
              Messages
            </span>
          </button>

          <button
            className="header-settings"
            onClick={() =>
              setShowSettings(
                (previous) => !previous
              )
            }
          >
            ⚙
          </button>

        </div>

        {/* SETTINGS DROPDOWN */}

        {showSettings && (

          <div className="settings-dropdown">

            <div className="profile-dropdown">

              <div className="profile-avatar">

                {teamName
                  .charAt(0)
                  .toUpperCase()}

              </div>

              <div>

                <strong>
                  {teamName}
                </strong>

                <span>
                  {teamEmail ||
                    "Rescue Team"}
                </span>

              </div>

            </div>

            <button
              onClick={() =>
                handleNavigation(
                  "settings"
                )
              }
            >
              ⚙ Settings
            </button>

            <button
              className="logout-dropdown"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>

          </div>

        )}

      </header>

      {/* CONTENT */}

      <main className="rescue-main">

        {activePage === "home" &&
          renderHome()}

        {activePage === "members" &&
          renderMembers()}

        {activePage === "messages" &&
          renderMessages()}

        {activePage === "teams" &&
          renderTeams()}

        {activePage === "settings" &&
          renderSettings()}

      </main>

      {/* BOTTOM NAVIGATION */}

      <nav className="bottom-nav">

        <button
          className={
            activePage === "home"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            handleNavigation("home")
          }
        >
          <span>⌂</span>
          <small>
            Home
          </small>
        </button>

        <button
          className={
            activePage === "members"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            handleNavigation("members")
          }
        >
          <span>👥</span>
          <small>
            Members
          </small>
        </button>

        <button
          className={
            activePage === "messages"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            handleNavigation("messages")
          }
        >
          <span>💬</span>
          <small>
            Messages
          </small>
        </button>

        <button
          className={
            activePage === "teams"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            handleNavigation("teams")
          }
        >
          <span>🚑</span>
          <small>
            Teams
          </small>
        </button>

        <button
          className={
            activePage === "settings"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            handleNavigation("settings")
          }
        >
          <span>⚙</span>
          <small>
            Settings
          </small>
        </button>

      </nav>

      {/* MODALS */}

      {renderMemberModal()}
      {renderMapModal()}

    </div>
  );
};

export default RescueDashboard;