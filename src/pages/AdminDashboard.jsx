
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  UserRound,
  Hospital,
  Settings,
  MessageCircle,
  Bot,
  AlertTriangle,
  Bell,
  Search,
  ArrowLeft,
  Activity,
  MapPin,
  Clock,
  LogOut,
  Send,
  Trash2,
  Navigation,
} from "lucide-react";

import "./AdminDashboard.css";

const API = "https://resqnet-backend-1.onrender.com/api";

const sections = [
  { name: "All Citizens", key: "citizens", icon: <Users />, color: "blue" },
  { name: "Rescue Teams", key: "teams", icon: <UserRound />, color: "purple" },
  { name: "Volunteers", key: "volunteers", icon: <Users />, color: "green" },
  { name: "Hospitals", key: "hospitals", icon: <Hospital />, color: "orange" },
  {
    name: "Emergencies",
    key: "emergencies",
    icon: <AlertTriangle />,
    color: "red",
  },
  {
    name: "Chat",
    key: "chat",
    icon: <MessageCircle />,
    color: "cyan",
  },
  { name: "AI Chat", key: "ai-chat", icon: <Bot />, color: "pink" },
  { name: "Settings", key: "settings", icon: <Settings />, color: "gray" },
];

const bottomItems = [
  { key: "home", label: "Home", icon: <Home size={23} /> },
  {
    key: "emergencies",
    label: "Emergencies",
    icon: <AlertTriangle size={23} />,
  },
  {
    key: "emergency-map",
    label: "Emergency Map",
    icon: <MapPin size={23} />,
  },
  { key: "chat", label: "Chat", icon: <MessageCircle size={23} /> },
  { key: "ai-chat", label: "AI Chat", icon: <Bot size={23} /> },
  { key: "settings", label: "Settings", icon: <Settings size={23} /> },
];

const dataKeys = [
  "citizens",
  "teams",
  "volunteers",
  "hospitals",
  "emergencies",
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("home");
  const [data, setData] = useState({
    citizens: [],
    teams: [],
    volunteers: [],
    hospitals: [],
    emergencies: [],
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState({
    notifications: true,
    sound: false,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  // Load data from the backend
  async function loadEndpoint(endpoint) {
    const response = await fetch(`${API}/${endpoint}`);

    if (!response.ok) {
      throw new Error(`Failed to load ${endpoint}: ${response.status}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result : [];
  }

  async function loadAllData() {
    setLoading(true);

    const results = await Promise.allSettled(
      dataKeys.map((endpoint) => loadEndpoint(endpoint))
    );

    setData((previous) => {
      const updated = { ...previous };

      results.forEach((result, index) => {
        const key = dataKeys[index];

        if (result.status === "fulfilled") {
          updated[key] = result.value;
        } else {
          console.error(`Error loading ${key}:`, result.reason);
        }
      });

      return updated;
    });

    setLoading(false);
  }

  // Dashboard navigation
  function openPage(page) {
  setSearch("");

  if (page === "chat") {
    navigate("/admin/chats");
    return;
  }

  if (page === "ai-chat") {
    navigate("/ai-chat");
    return;
  }

  if (page === "emergency-map") {
    navigate("/admin/emergency-map");
    return;
  }

  setActivePage(page);
}

  function getCount(key) {
    return data[key]?.length || 0;
  }

  function getRecordName(item, index) {
    return (
      item.name ||
      item.fullName ||
      item.citizenName ||
      item.hospitalName ||
      item.teamName ||
      item.volunteerName ||
      item.username ||
      `Record ${index + 1}`
    );
  }

  function getRecordDetails(item) {
    return (
      item.email ||
      item.phone ||
      item.mobile ||
      item.location ||
      item.address ||
      "No additional details"
    );
  }

  function getEmergencyType(item) {
    return item.emergencyType || item.type || "Emergency";
  }

  function getEmergencyLocation(item) {
    return item.location || item.address || "Location not provided";
  }

  // Open the record location in Google Maps
  function showLocation(item) {
    let location = "";

    if (
      item.latitude !== undefined &&
      item.latitude !== null &&
      item.longitude !== undefined &&
      item.longitude !== null
    ) {
      location = `${item.latitude},${item.longitude}`;
    } else {
      location = item.location || item.address || "";
    }

    if (!String(location).trim()) {
      alert("Location is not available for this record.");
      return;
    }

    const mapsUrl =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(location);

    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  }

  // Delete a record from the backend
  async function deleteRecord(key, item) {
    if (item.id === undefined || item.id === null) {
      alert("Cannot delete this record because its ID is missing.");
      return;
    }

    const recordName =
      item.name ||
      item.fullName ||
      item.citizenName ||
      item.hospitalName ||
      item.teamName ||
      item.volunteerName ||
      getEmergencyType(item);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${recordName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/${key}/${encodeURIComponent(item.id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Delete failed with status ${response.status}`
        );
      }

      setData((previous) => ({
        ...previous,
        [key]: previous[key].filter(
          (record) => String(record.id) !== String(item.id)
        ),
      }));

      alert("Record deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Unable to delete record: ${error.message}`);
    }
  }

  // Local demo chat
  function sendMessage(event) {
    event.preventDefault();

    const message = chatMessage.trim();
    if (!message) return;

    setMessages((previous) => [
      ...previous,
      { text: message, sender: "admin" },
    ]);

    setChatMessage("");
  }

  // Home page
  function renderHome() {
    return (
      <>
        <section className="admin-welcome">
          <div>
            <span className="welcome-label">RESQNET ADMIN</span>
            <h1>Welcome, Admin</h1>
            <p>Manage emergency services from one place.</p>
          </div>

          <div className="welcome-avatar">
            <Activity size={26} />
          </div>
        </section>

        <section className="home-summary">
          <div className="summary-heading">
            <h2>Dashboard Overview</h2>
            <button
              className="refresh-button"
              onClick={loadAllData}
              type="button"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="summary-grid">
            <div className="summary-card">
              <span>Emergencies</span>
              <strong>{getCount("emergencies")}</strong>
              <AlertTriangle className="summary-red" size={20} />
            </div>

            <div className="summary-card">
              <span>Citizens</span>
              <strong>{getCount("citizens")}</strong>
              <Users className="summary-blue" size={20} />
            </div>

            <div className="summary-card">
              <span>Hospitals</span>
              <strong>{getCount("hospitals")}</strong>
              <Hospital className="summary-green" size={20} />
            </div>

            <div className="summary-card">
              <span>Rescue Teams</span>
              <strong>{getCount("teams")}</strong>
              <UserRound className="summary-purple" size={20} />
            </div>
          </div>
        </section>

        <section className="home-tools">
          <div className="section-heading">
            <div>
              <h2>Admin Services</h2>
              <p>Choose a section to manage</p>
            </div>
          </div>

          <div className="service-grid">
            {sections.map((section) => (
              <button
                type="button"
                className="service-button"
                key={section.key}
                onClick={() => openPage(section.key)}
              >
                <span className={`service-icon ${section.color}`}>
                  {section.icon}
                </span>

                <span className="service-name">{section.name}</span>

                {dataKeys.includes(section.key) && (
                  <span className="service-count">
                    {getCount(section.key)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="home-emergencies">
          <div className="section-heading">
            <div>
              <h2>Recent Emergencies</h2>
              <p>Latest emergency reports</p>
            </div>

            <button
              className="text-link"
              onClick={() => openPage("emergencies")}
              type="button"
            >
              View all
            </button>
          </div>

          {loading ? (
            <div className="empty-state">Loading emergencies...</div>
          ) : data.emergencies.length === 0 ? (
            <div className="empty-state">
              <AlertTriangle size={25} />
              <p>No emergency reports available.</p>
            </div>
          ) : (
            data.emergencies.slice(0, 3).map((item, index) => (
              <div
                className="recent-emergency"
                key={item.id ?? index}
              >
                <div className="recent-emergency-icon">
                  <AlertTriangle size={20} />
                </div>

                <div className="recent-emergency-info">
                  <strong>{getEmergencyType(item)}</strong>
                  <span>
                    <MapPin size={13} />
                    {getEmergencyLocation(item)}
                  </span>
                </div>

                <span className="emergency-status">
                  {item.status || "Pending"}
                </span>
              </div>
            ))
          )}
        </section>
      </>
    );
  }

  // Citizens, teams, volunteers, hospitals and emergencies
  function renderDirectory(key, title) {
    const records = data[key] || [];

    const filtered = records.filter((item, index) => {
      const text = `
        ${getRecordName(item, index)}
        ${getRecordDetails(item)}
        ${item.location || ""}
        ${item.address || ""}
        ${item.status || ""}
        ${getEmergencyType(item)}
      `.toLowerCase();

      return text.includes(search.toLowerCase());
    });

    return (
      <section className="content-section">
        <div className="section-heading">
          <div>
            <h2>{title}</h2>
            <p>{records.length} records</p>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={loadAllData}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            type="search"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Users size={27} />
            <p>No records found.</p>
          </div>
        ) : (
          <div className="record-list">
            {filtered.map((item, index) => (
              <article
                className="record-card"
                key={item.id ?? index}
              >
                <div className="record-avatar">
                  {key === "hospitals" ? (
                    <Hospital size={22} />
                  ) : key === "emergencies" ? (
                    <AlertTriangle size={22} />
                  ) : (
                    <UserRound size={22} />
                  )}
                </div>

                <div className="record-info">
                  <strong>
                    {key === "emergencies"
                      ? getEmergencyType(item)
                      : getRecordName(item, index)}
                  </strong>

                  <span>
                    {key === "emergencies"
                      ? getEmergencyLocation(item)
                      : getRecordDetails(item)}
                  </span>

                  {key === "emergencies" && (
                    <small>
                      <Clock size={13} />
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "Time not available"}
                    </small>
                  )}

                  {key === "emergencies" && (
                    <span className="emergency-status">
                      {item.status || "Pending"}
                    </span>
                  )}
                </div>

                <div className="record-actions">
                  <button
                    type="button"
                    className="location-button"
                    onClick={() => showLocation(item)}
                    title="View location"
                  >
                    <Navigation size={16} />
                    <span>Location</span>
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => deleteRecord(key, item)}
                    title="Delete record"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  // Existing chat interface (kept as a fallback)
  function renderChat(isAI = false) {
    return (
      <section className="chat-section">
        <div className="chat-heading">
          <div className={`chat-avatar ${isAI ? "ai-avatar" : ""}`}>
            {isAI ? <Bot size={23} /> : <MessageCircle size={23} />}
          </div>

          <div>
            <h2>{isAI ? "ResQNet AI Chat" : "Admin Chat"}</h2>
            <p>{isAI ? "AI assistant interface" : "Admin messages"}</p>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              {isAI ? <Bot size={35} /> : <MessageCircle size={35} />}
              <strong>
                {isAI ? "AI chat interface" : "Start a conversation"}
              </strong>
              <p>
                {isAI
                  ? "Connect this interface to your AI backend to receive automated answers."
                  : "This local chat interface is ready for backend integration."}
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                className={`chat-bubble ${message.sender}`}
                key={index}
              >
                {message.text}
              </div>
            ))
          )}
        </div>

        <form className="chat-input-area" onSubmit={sendMessage}>
          <input
            value={chatMessage}
            onChange={(event) => setChatMessage(event.target.value)}
            placeholder="Type a message..."
          />

          <button type="submit" aria-label="Send message">
            <Send size={19} />
          </button>
        </form>
      </section>
    );
  }

  // Settings
  function renderSettings() {
    return (
      <section className="content-section">
        <div className="section-heading">
          <div>
            <h2>Settings</h2>
            <p>Manage dashboard preferences</p>
          </div>
        </div>

        <div className="settings-card">
          <div>
            <strong>Notifications</strong>
            <p>Enable dashboard notification preferences</p>
          </div>

          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(event) =>
              setSettings((previous) => ({
                ...previous,
                notifications: event.target.checked,
              }))
            }
          />
        </div>

        <div className="settings-card">
          <div>
            <strong>Notification sound</strong>
            <p>Enable sound preference</p>
          </div>

          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(event) =>
              setSettings((previous) => ({
                ...previous,
                sound: event.target.checked,
              }))
            }
          />
        </div>

        <button
          className="logout-button"
          type="button"
          onClick={() => {
            localStorage.removeItem("adminToken");
            navigate("/admin/login", { replace: true });
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </section>
    );
  }

  function renderPage() {
    switch (activePage) {
      case "citizens":
        return renderDirectory("citizens", "All Citizens");

      case "teams":
        return renderDirectory("teams", "Rescue Teams");

      case "volunteers":
        return renderDirectory("volunteers", "Volunteers");

      case "hospitals":
        return renderDirectory("hospitals", "Hospitals");

      case "emergencies":
        return renderDirectory("emergencies", "Emergencies");

      case "chat":
        return renderChat(false);

      case "ai-chat":
        return renderChat(true);

      case "settings":
        return renderSettings();

      default:
        return renderHome();
    }
  }

  const currentTitle =
    sections.find((section) => section.key === activePage)?.name || "Home";

  return (
    <div className="admin-mobile-app">
      <header className="admin-mobile-header">
        {activePage === "home" ? (
          <div className="mobile-logo">
            <span className="mobile-logo-icon">
              <Activity size={21} />
            </span>
            <span>ResQNet</span>
          </div>
        ) : (
          <button
            className="back-button"
            type="button"
            onClick={() => openPage("home")}
          >
            <ArrowLeft size={22} />
            <strong>{currentTitle}</strong>
          </button>
        )}

        <div className="header-actions">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => openPage("emergencies")}
          >
            <Bell size={22} />
          </button>

          <button
            type="button"
            className="header-profile"
            aria-label="Profile"
            onClick={() => openPage("settings")}
          >
            A
          </button>
        </div>
      </header>

      <main className="admin-mobile-main">
        {renderPage()}
      </main>

      <nav className="admin-bottom-nav">
        {bottomItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={activePage === item.key ? "selected" : ""}
            onClick={() => openPage(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
