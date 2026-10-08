import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalDashboard.css";

const API_BASE = "https://resqnet-backend-1.onrender.com/api";

const HospitalDashboard = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("home");
  const [hospital, setHospital] = useState(null);

  const [emergencies, setEmergencies] = useState([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState(false);
  const [completingEmergencyId, setCompletingEmergencyId] = useState(null);
  const [emergencyError, setEmergencyError] = useState("");

  const [emergencyFilter, setEmergencyFilter] = useState("all");

  const [services, setServices] = useState({
    doctors: 0,
    beds: 0,
    ambulances: 0,
    icuBeds: 0,
  });

  const [serviceError, setServiceError] = useState("");

  // =====================================================
  // GET LOGGED-IN HOSPITAL
  // =====================================================
  useEffect(() => {
    const storedHospital = localStorage.getItem("hospital");

    if (!storedHospital) {
      navigate("/login/hospital", { replace: true });
      return;
    }

    try {
      const hospitalData = JSON.parse(storedHospital);
      setHospital(hospitalData);

      const hospitalId =
        hospitalData.id ||
        hospitalData.hospitalId ||
        hospitalData._id;

      if (hospitalId) {
        localStorage.setItem("hospitalId", String(hospitalId));
      }
    } catch (error) {
      console.error("Hospital data parsing error:", error);
      localStorage.removeItem("hospital");
      navigate("/login/hospital", { replace: true });
    }
  }, [navigate]);

  // =====================================================
  // HOSPITAL ID
  // =====================================================
  const getHospitalId = useCallback(() => {
    if (!hospital) {
      return localStorage.getItem("hospitalId");
    }

    return (
      hospital.id ||
      hospital.hospitalId ||
      hospital._id ||
      localStorage.getItem("hospitalId")
    );
  }, [hospital]);

  // =====================================================
  // EMERGENCY HELPERS
  // =====================================================
  const getEmergencyId = (emergency) =>
    emergency.id || emergency._id || emergency.emergencyId;

  const getEmergencyStatus = (emergency) =>
    String(
      emergency.status ||
        emergency.emergencyStatus ||
        "pending"
    )
      .trim()
      .toLowerCase();

  const getEmergencyType = (emergency) =>
    String(
      emergency.emergencyType ||
        emergency.type ||
        emergency.category ||
        ""
    )
      .trim()
      .toLowerCase();

  // =====================================================
  // LOAD EMERGENCIES
  // Backend: GET /api/emergencies
  // =====================================================
  const loadEmergencies = useCallback(async () => {
    setLoadingEmergencies(true);
    setEmergencyError("");

    try {
      const response = await fetch(`${API_BASE}/emergencies`);

      if (!response.ok) {
        throw new Error(
          `Emergency request failed (${response.status})`
        );
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
        ? data.content
        : [];

      setEmergencies(list);
    } catch (error) {
      console.error("Emergency loading error:", error);
      setEmergencyError(
        error.message || "Could not load emergencies."
      );
      setEmergencies([]);
    } finally {
      setLoadingEmergencies(false);
    }
  }, []);

  // =====================================================
  // LOAD HOSPITAL SERVICES
  // =====================================================
  const loadServices = useCallback(async () => {
    const hospitalId = getHospitalId();

    if (!hospitalId) {
      setServiceError("Hospital ID not found.");
      return;
    }

    setServiceError("");

    try {
      const [
        doctorsResponse,
        bedsResponse,
        ambulanceResponse,
      ] = await Promise.all([
        fetch(`${API_BASE}/hospitals/${hospitalId}/doctors`),
        fetch(`${API_BASE}/beds/hospital/${hospitalId}`),
        fetch(`${API_BASE}/hospitals/${hospitalId}/ambulances`),
      ]);

      if (!doctorsResponse.ok) {
        throw new Error(
          `Doctors request failed (${doctorsResponse.status})`
        );
      }

      if (!bedsResponse.ok) {
        throw new Error(
          `Beds request failed (${bedsResponse.status})`
        );
      }

      if (!ambulanceResponse.ok) {
        throw new Error(
          `Ambulances request failed (${ambulanceResponse.status})`
        );
      }

      const [
        doctorsData,
        bedsData,
        ambulanceData,
      ] = await Promise.all([
        doctorsResponse.json(),
        bedsResponse.json(),
        ambulanceResponse.json(),
      ]);

      const doctors = Array.isArray(doctorsData)
        ? doctorsData
        : [];

      const beds = Array.isArray(bedsData)
        ? bedsData
        : [];

      const ambulances = Array.isArray(ambulanceData)
        ? ambulanceData
        : [];

      let availableBeds = 0;
      let availableICUBeds = 0;

      beds.forEach((bed) => {
        const available = Number(
          bed.availableBeds ??
            bed.available ??
            (String(bed.status || "").toLowerCase() ===
            "available"
              ? 1
              : 0)
        );

        availableBeds += Number.isFinite(available)
          ? available
          : 0;

        const bedType = String(
          bed.bedType || bed.type || ""
        ).toLowerCase();

        const ward = String(
          bed.ward || bed.department || ""
        ).toLowerCase();

        if (
          bedType.includes("icu") ||
          ward.includes("icu")
        ) {
          availableICUBeds += Number.isFinite(available)
            ? available
            : 0;
        }
      });

      const availableAmbulances = ambulances.reduce(
        (total, ambulance) => {
          const count = Number(
            ambulance.availableAmbulances ??
              (String(ambulance.status || "").toLowerCase() ===
              "available"
                ? 1
                : 0)
          );

          return total + (Number.isFinite(count) ? count : 0);
        },
        0
      );

      setServices({
        doctors: doctors.length,
        beds: availableBeds,
        ambulances: availableAmbulances,
        icuBeds: availableICUBeds,
      });
    } catch (error) {
      console.error("Services loading error:", error);
      setServiceError(
        error.message || "Could not load hospital services."
      );

      setServices({
        doctors: 0,
        beds: 0,
        ambulances: 0,
        icuBeds: 0,
      });
    }
  }, [getHospitalId]);

  // =====================================================
  // LOAD DATA AND AUTO REFRESH
  // =====================================================
  useEffect(() => {
    if (!hospital) return;

    loadEmergencies();
    loadServices();

    const interval = setInterval(() => {
      loadEmergencies();
    }, 5000);

    return () => clearInterval(interval);
  }, [hospital, loadEmergencies, loadServices]);

  // =====================================================
  // MARK EMERGENCY COMPLETED
  // Backend: PUT /api/emergencies/{id}/status?status=COMPLETED
  // =====================================================
  const handleMarkCompleted = async (emergency) => {
    const emergencyId = getEmergencyId(emergency);

    if (!emergencyId) {
      alert("Emergency ID not found.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to mark this emergency as completed?"
      )
    ) {
      return;
    }

    setCompletingEmergencyId(emergencyId);

    try {
      const url = new URL(
        `${API_BASE}/emergencies/${emergencyId}/status`
      );

      url.searchParams.set("status", "COMPLETED");

      const response = await fetch(url.toString(), {
        method: "PUT",
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText ||
            `Could not update emergency (${response.status})`
        );
      }

      setEmergencies((previous) =>
        previous.map((item) =>
          String(getEmergencyId(item)) ===
          String(emergencyId)
            ? { ...item, status: "COMPLETED" }
            : item
        )
      );

      alert("Emergency marked as completed.");
    } catch (error) {
      console.error("Complete emergency error:", error);
      alert(
        error.message || "Unable to complete emergency."
      );
    } finally {
      setCompletingEmergencyId(null);
    }
  };

  // =====================================================
  // EMERGENCY COUNTS
  // =====================================================
  const totalEmergencies = emergencies.length;

  const pendingEmergencies = emergencies.filter(
    (emergency) =>
      ["pending", "new"].includes(
        getEmergencyStatus(emergency)
      )
  ).length;

  const completedEmergencies = emergencies.filter(
    (emergency) =>
      ["completed", "complete"].includes(
        getEmergencyStatus(emergency)
      )
  ).length;

  const activeEmergencies = emergencies.filter(
    (emergency) =>
      ["active", "in progress", "in_progress"].includes(
        getEmergencyStatus(emergency)
      )
  ).length;

  const cancelledEmergencies = emergencies.filter(
    (emergency) =>
      ["cancelled", "canceled"].includes(
        getEmergencyStatus(emergency)
      )
  ).length;

  const medicalEmergencies = emergencies.filter(
    (emergency) =>
      getEmergencyType(emergency).includes("medical")
  ).length;

  const accidentEmergencies = emergencies.filter(
    (emergency) =>
      getEmergencyType(emergency).includes("accident")
  ).length;

  const fireEmergencies = emergencies.filter(
    (emergency) =>
      getEmergencyType(emergency).includes("fire")
  ).length;

  // =====================================================
  // FILTER EMERGENCIES
  // =====================================================
  const filteredEmergencies = emergencies.filter(
    (emergency) => {
      const status = getEmergencyStatus(emergency);

      if (emergencyFilter === "pending") {
        return ["pending", "new"].includes(status);
      }

      if (emergencyFilter === "completed") {
        return ["completed", "complete"].includes(status);
      }

      if (emergencyFilter === "active") {
        return [
          "active",
          "in progress",
          "in_progress",
        ].includes(status);
      }

      if (emergencyFilter === "cancelled") {
        return ["cancelled", "canceled"].includes(status);
      }

      return true;
    }
  );

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = () => {
    if (
      !window.confirm(
        "Are you sure you want to logout?"
      )
    ) {
      return;
    }

    [
      "hospital",
      "hospitalId",
      "hospitalName",
      "hospitalEmail",
      "hospitalToken",
      "token",
      "user",
    ].forEach((key) => localStorage.removeItem(key));

    navigate("/login/hospital", { replace: true });
  };

  // =====================================================
  // MENU
  // =====================================================
  const menuItems = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "bookings", icon: "📅", label: "Bookings" },
    { id: "services", icon: "🏥", label: "Services" },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  const handleMenuClick = (id) => {
    if (id === "bookings") {
      navigate("/mybooking");
      return;
    }

    if (id === "messages") {
      navigate("/chats");
      return;
    }

    setActiveSection(id);
  };

  if (!hospital) {
    return (
      <div className="hospital-loading">
        Loading Hospital Dashboard...
      </div>
    );
  }

  const hospitalDisplayName =
    hospital.name ||
    hospital.hospitalName ||
    hospital.fullName ||
    "Hospital";

  // =====================================================
  // RETURN
  // =====================================================
  return (
    <div className="hospital-dashboard">
      {/* HEADER */}
      <header className="hospital-header">
        <div className="hospital-brand">
          <div className="hospital-logo">🏥</div>
          <div>
            <h1>RESQNET</h1>
            <p>Hospital Emergency Portal</p>
          </div>
        </div>

        <div className="hospital-profile">
          <div className="hospital-profile-text">
            <strong>{hospitalDisplayName}</strong>
            <span>Hospital Account</span>
          </div>
          <div className="hospital-profile-icon">🏥</div>
        </div>
      </header>

      {/* MAIN */}
      <main className="hospital-main">
        {/* HOME */}
        {activeSection === "home" && (
          <section>
            <section className="hospital-welcome">
              <div>
                <p className="welcome-label">WELCOME</p>
                <h2>{hospitalDisplayName}</h2>
                <p>
                  Manage emergency requests and hospital
                  operations from one place.
                </p>
              </div>

              <div className="hospital-welcome-actions">
                <div className="hospital-status">
                  <span></span>
                  Hospital Online
                </div>

                <button
                  type="button"
                  className="hospital-ai-button"
                  onClick={() => navigate("/ai-chat")}
                >
                  🤖 AI Chat
                </button>
              </div>
            </section>

            {/* EMERGENCY HEADER */}
            <div className="home-section-header">
              <div>
                <div className="section-icon">🚨</div>
                <div>
                  <h2>Emergency Requests</h2>
                  <p>
                    Emergency requests available in the
                    system.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="refresh-button"
                onClick={() => {
                  loadEmergencies();
                  loadServices();
                }}
                disabled={loadingEmergencies}
              >
                {loadingEmergencies
                  ? "↻ Loading..."
                  : "↻ Refresh"}
              </button>
            </div>

            {emergencyError && (
              <div className="empty-card">
                <p>{emergencyError}</p>
                <button
                  type="button"
                  className="refresh-button"
                  onClick={loadEmergencies}
                >
                  Retry
                </button>
              </div>
            )}

            {/* EMERGENCY SUMMARY */}
            <div className="emergency-summary">
              <button
                type="button"
                className={`summary-card summary-filter ${
                  emergencyFilter === "all"
                    ? "selected"
                    : ""
                }`}
                onClick={() => setEmergencyFilter("all")}
              >
                <div className="summary-icon">🚨</div>
                <div>
                  <strong>{totalEmergencies}</strong>
                  <span>Total Emergencies</span>
                </div>
              </button>

              <button
                type="button"
                className={`summary-card summary-filter pending-card ${
                  emergencyFilter === "pending"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setEmergencyFilter("pending")
                }
              >
                <div className="summary-icon">⏳</div>
                <div>
                  <strong>{pendingEmergencies}</strong>
                  <span>Pending</span>
                </div>
              </button>

              <button
                type="button"
                className={`summary-card summary-filter completed-card ${
                  emergencyFilter === "completed"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setEmergencyFilter("completed")
                }
              >
                <div className="summary-icon">✅</div>
                <div>
                  <strong>{completedEmergencies}</strong>
                  <span>Completed</span>
                </div>
              </button>

              <div className="summary-card medical-card">
                <div className="summary-icon">❤️</div>
                <div>
                  <strong>{medicalEmergencies}</strong>
                  <span>Medical Emergencies</span>
                </div>
              </div>
            </div>

            {/* ADDITIONAL STATUS COUNTS */}
            
            {/* FILTER BAR */}
            <div className="emergency-filter-bar">
              <div>
                <h3>Emergency List</h3>
                <p>
                  Showing{" "}
                  <strong>
                    {filteredEmergencies.length}
                  </strong>{" "}
                  emergency request(s)
                </p>
              </div>

              <div className="emergency-filter-buttons">
                {[
                  "all",
                  "pending",
                  "active",
                  "completed",
                  "cancelled",
                ].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={
                      emergencyFilter === filter
                        ? `filter-button active ${filter}`
                        : "filter-button"
                    }
                    onClick={() =>
                      setEmergencyFilter(filter)
                    }
                  >
                    {filter.charAt(0).toUpperCase() +
                      filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* EMERGENCY LIST */}
            {loadingEmergencies ? (
              <div className="empty-card">
                <div className="loading-spinner"></div>
                <p>Loading emergency requests...</p>
              </div>
            ) : filteredEmergencies.length === 0 ? (
              <div className="empty-card">
                <div className="empty-icon">🚨</div>
                <h3>
                  {emergencyFilter === "all"
                    ? "No Emergency Requests"
                    : `No ${emergencyFilter} Emergencies`}
                </h3>
                <p>
                  No emergency requests are available
                  for this filter.
                </p>
              </div>
            ) : (
              <div className="emergency-list">
                {filteredEmergencies.map(
                  (emergency, index) => {
                    const emergencyId =
                      getEmergencyId(emergency) ||
                      index + 1;

                    const status =
                      getEmergencyStatus(emergency);

                    const emergencyType =
                      emergency.emergencyType ||
                      emergency.type ||
                      emergency.category ||
                      "Emergency";

                    const isMedical =
                      getEmergencyType(
                        emergency
                      ).includes("medical");

                    const isCompleted = [
                      "completed",
                      "complete",
                    ].includes(status);

                    return (
                      <div
                        className={`emergency-item ${
                          isCompleted
                            ? "completed-emergency"
                            : ""
                        } ${
                          isMedical
                            ? "medical-emergency-item"
                            : ""
                        }`}
                        key={emergencyId}
                      >
                        <div className="emergency-item-icon">
                          {isCompleted
                            ? "✅"
                            : isMedical
                            ? "❤️"
                            : "🚨"}
                        </div>

                        <div className="emergency-item-content">
                          <div className="emergency-item-top">
                            <div>
                              <h3>{emergencyType}</h3>
                              <span className="request-number">
                                Request #{emergencyId}
                              </span>
                            </div>

                            <span
                              className={`status ${status.replace(
                                /\s+/g,
                                "-"
                              )}`}
                            >
                              {status}
                            </span>
                          </div>

                          <p className="emergency-description">
                            {emergency.description ||
                              "Emergency assistance required."}
                          </p>

                          <div className="emergency-details">
                            <span>
                              👤 <strong>Citizen:</strong>{" "}
                              {emergency.citizenName ||
                                emergency.userName ||
                                emergency.name ||
                                "Citizen"}
                            </span>

                            <span>
                              📍 <strong>Location:</strong>{" "}
                              {emergency.location ||
                                emergency.address ||
                                "Location unavailable"}
                            </span>

                            <span>
                              📞 <strong>Phone:</strong>{" "}
                              {emergency.phone ||
                                emergency.mobile ||
                                emergency.contactNumber ||
                                "N/A"}
                            </span>

                            <span>
                              🕐 <strong>Time:</strong>{" "}
                              {emergency.createdAt ||
                                emergency.date ||
                                "N/A"}
                            </span>
                          </div>

                          {emergency.latitude != null &&
                            emergency.longitude != null && (
                              <div className="coordinates">
                                📍 Coordinates:{" "}
                                {emergency.latitude},{" "}
                                {emergency.longitude}
                              </div>
                            )}
                        </div>

                        <div className="emergency-actions">
                          {!isCompleted ? (
                            <button
                              className="complete-emergency-button"
                              type="button"
                              onClick={() =>
                                handleMarkCompleted(
                                  emergency
                                )
                              }
                              disabled={
                                completingEmergencyId !==
                                null
                              }
                            >
                              {String(
                                completingEmergencyId
                              ) === String(emergencyId)
                                ? "Completing..."
                                : "✓ Mark Completed"}
                            </button>
                          ) : (
                            <div className="completed-label">
                              ✓ Completed
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        )}

        {/* SERVICES */}
        {activeSection === "services" && (
          <section>
            <PageTitle
              icon="🏥"
              title="Hospital Services"
              description="Manage services available at this hospital."
            />

            {serviceError && (
              <div className="empty-card">
                <p>{serviceError}</p>
                <button
                  className="refresh-button"
                  type="button"
                  onClick={loadServices}
                >
                  Retry
                </button>
              </div>
            )}

            <div className="service-grid">
              <ServiceCard
                icon="👨‍⚕️"
                title="Doctors"
                value={services.doctors}
                description="Registered doctors"
              />

              <ServiceCard
                icon="🛏️"
                title="Beds"
                value={services.beds}
                description="Available beds"
              />

              <ServiceCard
                icon="🚑"
                title="Ambulances"
                value={services.ambulances}
                description="Available ambulances"
              />

              <ServiceCard
                icon="❤️"
                title="ICU Beds"
                value={services.icuBeds}
                description="Available ICU beds"
              />
            </div>

            <div className="service-actions">
              <button
                type="button"
                onClick={() =>
                  navigate("/hospital/doctors")
                }
              >
                👨‍⚕️ Manage Doctors
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/hospital/beds")
                }
              >
                🛏️ Manage Beds
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/hospital/ambulances")
                }
              >
                🚑 Manage Ambulances
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/hospital/services")
                }
              >
                ⚕️ Hospital Services
              </button>
            </div>
          </section>
        )}

        {/* SETTINGS */}
        {activeSection === "settings" && (
          <section>
            <PageTitle
              icon="⚙️"
              title="Settings"
              description="Manage your hospital account."
            />

            <div className="settings-grid">
              <SettingCard
                icon="🏥"
                title="Hospital Profile"
                description="Manage hospital information."
                onClick={() =>
                  navigate("/hospital/profile")
                }
              />

              <SettingCard
                icon="👨‍⚕️"
                title="Doctors"
                description="Manage hospital doctors."
                onClick={() =>
                  navigate("/hospital/doctors")
                }
              />

              <SettingCard
                icon="🛏️"
                title="Beds"
                description="Manage bed availability."
                onClick={() =>
                  navigate("/hospital/beds")
                }
              />

              <SettingCard
                icon="🚑"
                title="Ambulances"
                description="Manage hospital ambulances."
                onClick={() =>
                  navigate("/hospital/ambulances")
                }
              />

              <SettingCard
                icon="🔔"
                title="Notifications"
                description="Manage notifications."
              />

              <SettingCard
                icon="📍"
                title="Location"
                description="Manage hospital location."
              />

              <SettingCard
                icon="🔒"
                title="Security"
                description="Manage account security."
                onClick={() =>
                  navigate("/hospital/security")
                }
              />

              <SettingCard
                icon="🚪"
                title="Logout"
                description="Sign out from this hospital account."
                onClick={handleLogout}
                extraClass="logout"
              />
            </div>
          </section>
        )}
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="hospital-bottom-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={
              activeSection === item.id
                ? "hospital-nav-item active"
                : "hospital-nav-item"
            }
            onClick={() => handleMenuClick(item.id)}
            type="button"
          >
            <span className="hospital-nav-icon">
              {item.icon}
            </span>
            <span className="hospital-nav-label">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// =====================================================
// PAGE TITLE
// =====================================================
const PageTitle = ({ icon, title, description }) => (
  <div className="page-title">
    <div className="page-title-icon">{icon}</div>
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  </div>
);

// =====================================================
// SERVICE CARD
// =====================================================
const ServiceCard = ({
  icon,
  title,
  value,
  description,
}) => (
  <div className="service-card">
    <div className="service-icon">{icon}</div>
    <div>
      <h3>{title}</h3>
      <strong>{value}</strong>
      <p>{description}</p>
    </div>
  </div>
);

// =====================================================
// SETTING CARD
// =====================================================
const SettingCard = ({
  icon,
  title,
  description,
  onClick,
  extraClass = "",
}) => (
  <button
    className={`setting-card ${extraClass}`}
    type="button"
    onClick={onClick}
  >
    <div className="setting-card-icon">{icon}</div>
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <span>→</span>
  </button>
);

export default HospitalDashboard;
