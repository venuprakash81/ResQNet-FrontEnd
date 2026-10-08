import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CitizenDashboard.css";

// =====================================================
// PAGE ROUTES
// Update these paths to match your App.js routes.
// =====================================================

const PAGE_ROUTES = {
  dashboard: "/citizen/dashboard",
  reportEmergency: "/citizen/report-emergency",
  safeLocations: "/safe-locations",
  aiAssistant: "/ai-chat",

  doctors: "/doctor-booking",
  beds: "/book-beds",
  ambulances: "/ambulances",
  hospitalServices: "/hospital-services",
  hospitalMessages: "/rescue-messages//:conversationId",
  nearbyHospitals: "/nearby-hospitals",

  nearbyRescueTeams: "/nearby-rescue-teams",
  rescueMessages: "/rescue-messages//:conversationId",
  allRescueTeams: "/all-rescue-teams",

  nearbyVolunteers: "/nearby-volunteers",
  volunteerMessages: "/rescue-messages//:conversationId",
  allVolunteers: "/all-volunteers",
  bookEmergencyVehicle: "/book-emergency-vehicle",

  profile: "/citizen/profile",
  privacy: "/citizen/privacy",
  notifications: "/citizen/notifications",
  locationSettings: "/citizen/location-settings",
  language: "/citizen/dashboard",
  appearance: "/citizen/dashboard",
  emergencyPreferences: "/citizen/dashboard",
  about: "/about",
};

// =====================================================
// CITIZEN DASHBOARD
// =====================================================

const CitizenDashboard = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("home");
  const [citizen, setCitizen] = useState(null);

  // =====================================================
  // CHECK CITIZEN LOGIN
  // =====================================================

  useEffect(() => {
    const storedCitizen = localStorage.getItem("citizen");

    if (!storedCitizen) {
      navigate("/login/citizen", { replace: true });
      return;
    }

    try {
      const citizenData = JSON.parse(storedCitizen);
      setCitizen(citizenData);
    } catch (error) {
      console.error("Invalid citizen data:", error);
      localStorage.removeItem("citizen");
      navigate("/login/citizen", { replace: true });
    }
  }, [navigate]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("citizen");
    localStorage.removeItem("token");
    localStorage.removeItem("citizenToken");
    localStorage.removeItem("user");

    navigate("/login/citizen", { replace: true });
  };

  // =====================================================
  // NAVIGATION MENU
  // =====================================================

  const menuItems = [
    { id: "home", icon: "⌂", label: "Home" },
    { id: "hospital", icon: "🏥", label: "Hospital" },
    { id: "rescue", icon: "🚑", label: "Rescue" },
    { id: "volunteers", icon: "🤝", label: "Volunteers" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  // =====================================================
  // LOADING
  // =====================================================

  if (!citizen) {
    return (
      <div className="citizen-loading">
        Loading Citizen Dashboard...
      </div>
    );
  }

  // =====================================================
  // CITIZEN NAME
  // =====================================================

  const citizenName =
    citizen.name ||
    citizen.fullName ||
    citizen.username ||
    "Citizen";

  // =====================================================
  // PAGE HEADER
  // =====================================================

  const PageHeader = ({ icon, title, description }) => (
    <div className="page-header">
      <div className="page-header-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );

  // =====================================================
  // OPTION CARD
  // =====================================================

  const OptionCard = ({
    icon,
    title,
    description,
    route,
  }) => (
    <button
      className="option-card"
      type="button"
      onClick={() => navigate(route)}
    >
      <div className="option-icon">{icon}</div>

      <div className="option-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <span className="option-arrow">→</span>
    </button>
  );

  // =====================================================
  // SETTINGS CARD
  // =====================================================

  const SettingCard = ({
    icon,
    title,
    description,
    route,
  }) => (
    <button
      className="setting-card"
      type="button"
      onClick={() => navigate(route)}
    >
      <div className="setting-icon">{icon}</div>

      <div className="setting-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <span className="setting-arrow">→</span>
    </button>
  );

  return (
    <div className="citizen-app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="top-header">
        <div className="brand-section">
          <div className="brand-logo">🛡️</div>

          <div className="brand-details">
            <h1>RESQNET</h1>
            <span>Citizen Emergency Portal</span>
          </div>
        </div>

        <div className="header-right">
          <button
            className="notification-button"
            title="Notifications"
            type="button"
            onClick={() => navigate(PAGE_ROUTES.notifications)}
          >
            🔔
            <span className="notification-dot"></span>
          </button>

          <button
            className="profile-button"
            title="Profile"
            type="button"
            onClick={() => navigate(PAGE_ROUTES.profile)}
          >
            👤
          </button>
        </div>
      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main-content">

        {/* =================================================
            HOME
        ================================================= */}

        {activeSection === "home" && (
          <div className="home-page">

            {/* WELCOME */}

            <section className="welcome-section">
              <div className="welcome-text">
                <p className="welcome-small">
                  WELCOME BACK 👋
                </p>

                <h2>Stay Safe, Stay Connected</h2>

                <p className="welcome-description">
                  Hello {citizenName}. Get quick access to
                  emergency assistance, hospitals, rescue teams
                  and volunteers.
                </p>
              </div>

              {/* TOP SERVICE BUTTONS */}

              <div className="top-service-buttons">
                <button
                  className="top-service-button safe-button"
                  type="button"
                  onClick={() => navigate(PAGE_ROUTES.safeLocations)}
                >
                  <div className="top-service-icon">📍</div>

                  <div className="top-service-text">
                    <strong>Safe Locations</strong>
                    <span>Find nearby safe places</span>
                  </div>

                  <span className="top-service-arrow">→</span>
                </button>

                <button
                  className="top-service-button ai-button"
                  type="button"
                  onClick={() => navigate(PAGE_ROUTES.aiAssistant)}
                >
                  <div className="top-service-icon">🤖</div>

                  <div className="top-service-text">
                    <strong>AI Assistant</strong>
                    <span>Get emergency guidance</span>
                  </div>

                  <span className="top-service-arrow">→</span>
                </button>
              </div>
            </section>

            {/* ONLINE STATUS */}

            <div className="online-status">
              <span></span>
              All Emergency Services Online
            </div>

            {/* EMERGENCY */}

            <section className="emergency-section">
              <div className="emergency-card">
                <div className="emergency-left">
                  <div className="emergency-icon">🚨</div>

                  <div className="emergency-info">
                    <h2>Emergency Assistance</h2>

                    <p>
                      Need immediate help? Report your emergency
                      and connect with the nearest available
                      emergency team.
                    </p>
                  </div>
                </div>

                <button
                  className="emergency-button"
                  type="button"
                  onClick={() =>
                    navigate(PAGE_ROUTES.reportEmergency)
                  }
                >
                  REPORT EMERGENCY
                </button>
              </div>
            </section>

            {/* WELCOME TO RESQNET */}

            <section className="citizen-welcome-card">
              <div className="citizen-welcome-icon">🛡️</div>

              <div className="citizen-welcome-content">
                <p className="citizen-welcome-label">
                  WELCOME TO RESQNET
                </p>

                <h2>Your Safety. Our Priority.</h2>

                <p>
                  Welcome to the RESQNET Citizen Emergency
                  Portal. This platform helps you quickly
                  connect with emergency services, hospitals,
                  rescue teams and volunteers when you need
                  assistance.
                </p>

                <p>
                  From this platform, you can report an
                  emergency, find nearby hospitals, locate
                  rescue teams, connect with volunteers and
                  find emergency safe locations.
                </p>

                <p>
                  RESQNET is designed to help citizens get
                  the right emergency support quickly and
                  efficiently.
                </p>
              </div>
            </section>

            {/* WHAT YOU CAN DO */}

            <section className="quick-info-section">
              <div className="quick-info-title">
                <h2>What You Can Do</h2>
                <p>
                  Use the navigation below to access RESQNET
                  services.
                </p>
              </div>

              <div className="quick-info-grid">
                <div
                  className="quick-info-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(PAGE_ROUTES.nearbyHospitals)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      navigate(PAGE_ROUTES.nearbyHospitals);
                    }
                  }}
                >
                  <div className="quick-info-icon">🏥</div>
                  <div>
                    <h3>Find Hospitals</h3>
                    <p>
                      Find nearby hospitals, doctors, beds
                      and ambulances.
                    </p>
                  </div>
                </div>

                <div
                  className="quick-info-card"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(PAGE_ROUTES.nearbyRescueTeams)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      navigate(PAGE_ROUTES.nearbyRescueTeams);
                    }
                  }}
                >
                  <div className="quick-info-icon">🚑</div>
                  <div>
                    <h3>Get Rescue Support</h3>
                    <p>
                      Connect with nearby rescue teams during
                      emergencies.
                    </p>
                  </div>
                </div>

                <div
                  className="quick-info-card"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(PAGE_ROUTES.nearbyVolunteers)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      navigate(PAGE_ROUTES.nearbyVolunteers);
                    }
                  }}
                >
                  <div className="quick-info-icon">🤝</div>
                  <div>
                    <h3>Connect With Volunteers</h3>
                    <p>
                      Find nearby volunteers who can provide
                      emergency assistance.
                    </p>
                  </div>
                </div>

                <div
                  className="quick-info-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(PAGE_ROUTES.safeLocations)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      navigate(PAGE_ROUTES.safeLocations);
                    }
                  }}
                >
                  <div className="quick-info-icon">📍</div>
                  <div>
                    <h3>Emergency Safe Locations</h3>
                    <p>
                      Locate emergency shelters and safe
                      places near you.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ABOUT */}

            <section className="about-section">
              <div className="about-icon">ℹ️</div>

              <div>
                <h3>About RESQNET</h3>
                <p>
                  RESQNET is an emergency assistance platform
                  designed to connect citizens with hospitals,
                  rescue teams and volunteers.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* =================================================
            HOSPITAL
        ================================================= */}

        {activeSection === "hospital" && (
          <div className="inner-page">
            <PageHeader
              icon="🏥"
              title="Hospital"
              description="Access nearby hospital and medical services."
            />

            <div className="option-grid">
              <OptionCard
                icon="👨‍⚕️"
                title="Doctors"
                description="Find available doctors and medical specialists."
                route={PAGE_ROUTES.doctors}
              />

              <OptionCard
                icon="🛏️"
                title="Beds"
                description="Check available hospital beds and view your bookings."
                route={PAGE_ROUTES.beds}
              />

              <OptionCard
                icon="🚑"
                title="Ambulances"
                description="Find and request nearby ambulances."
                route={PAGE_ROUTES.ambulances}
              />

              <OptionCard
                icon="⚕️"
                title="Hospital Services"
                description="View available emergency medical services."
                route={PAGE_ROUTES.hospitalServices}
              />

              <OptionCard
                icon="💬"
                title="Messages"
                description="Message hospitals and medical teams."
                route={PAGE_ROUTES.hospitalMessages}
              />

              <OptionCard
                icon="📍"
                title="Nearby Hospitals"
                description="Find hospitals near your location."
                route={PAGE_ROUTES.nearbyHospitals}
              />
            </div>
          </div>
        )}

        {/* =================================================
            RESCUE
        ================================================= */}

        {activeSection === "rescue" && (
          <div className="inner-page">
            <PageHeader
              icon="🚑"
              title="Rescue Teams"
              description="Connect with emergency rescue teams."
            />

            <div className="option-grid">
              <OptionCard
                icon="📍"
                title="Nearby Rescue Teams"
                description="Find rescue teams available near you."
                route={PAGE_ROUTES.nearbyRescueTeams}
              />

              <OptionCard
                icon="💬"
                title="Messages"
                description="Communicate with rescue teams."
                route={PAGE_ROUTES.rescueMessages}
              />

              <OptionCard
                icon="👥"
                title="All Teams"
                description="View all registered rescue teams."
                route={PAGE_ROUTES.allRescueTeams}
              />
            </div>
          </div>
        )}

        {/* =================================================
            VOLUNTEERS
        ================================================= */}

        {activeSection === "volunteers" && (
          <div className="inner-page">
            <PageHeader
              icon="🤝"
              title="Volunteers"
              description="Connect with emergency volunteers."
            />

            <div className="option-grid">
              <OptionCard
                icon="📍"
                title="Nearby Volunteers"
                description="Find volunteers available near your location."
                route={PAGE_ROUTES.nearbyVolunteers}
              />

              <OptionCard
                icon="💬"
                title="Messages"
                description="Communicate with emergency volunteers."
                route={PAGE_ROUTES.volunteerMessages}
              />

              <OptionCard
                icon="👥"
                title="All Volunteers"
                description="View all registered volunteers."
                route={PAGE_ROUTES.allVolunteers}
              />

              <OptionCard
                icon="🚗"
                title="Book Emergency Vehicle"
                description="Book an available emergency vehicle."
                route={PAGE_ROUTES.bookEmergencyVehicle}
              />
            </div>
          </div>
        )}

        {/* =================================================
            SETTINGS
        ================================================= */}

        {activeSection === "settings" && (
          <div className="inner-page">
            <PageHeader
              icon="⚙️"
              title="Settings"
              description="Manage your account and preferences."
            />

            <div className="settings-list">
              <SettingCard
                icon="👤"
                title="Profile"
                description="Edit your personal information."
                route={PAGE_ROUTES.profile}
              />

              <SettingCard
                icon="🔒"
                title="Privacy & Security"
                description="Manage privacy and security settings."
                route={PAGE_ROUTES.privacy}
              />

              <SettingCard
                icon="🔔"
                title="Notifications"
                description="Manage emergency notifications."
                route={PAGE_ROUTES.notifications}
              />

              <SettingCard
                icon="📍"
                title="Location"
                description="Manage location permissions."
                route={PAGE_ROUTES.locationSettings}
              />

              <SettingCard
                icon="🌐"
                title="Language"
                description="Choose your preferred language."
                route={PAGE_ROUTES.language}
              />

              <SettingCard
                icon="🎨"
                title="Appearance"
                description="Manage application appearance."
                route={PAGE_ROUTES.appearance}
              />

              <SettingCard
                icon="🆘"
                title="Emergency Preferences"
                description="Manage emergency response preferences."
                route={PAGE_ROUTES.emergencyPreferences}
              />

              <SettingCard
                icon="ℹ️"
                title="About RESQNET"
                description="View information about RESQNET."
                route={PAGE_ROUTES.about}
              />

              {/* LOGOUT */}

              <button
                className="setting-card danger"
                onClick={handleLogout}
                type="button"
              >
                <div className="setting-icon">🚪</div>

                <div className="setting-content">
                  <h3>Logout</h3>
                  <p>
                    Sign out from your RESQNET account.
                  </p>
                </div>

                <span className="setting-arrow">→</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* =================================================
          BOTTOM NAVIGATION
      ================================================= */}

      <nav className="bottom-navigation">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={
              activeSection === item.id
                ? "bottom-nav-item active"
                : "bottom-nav-item"
            }
            onClick={() => setActiveSection(item.id)}
            type="button"
          >
            <span className="bottom-nav-icon">
              {item.icon}
            </span>

            <span className="bottom-nav-label">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CitizenDashboard;
