import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalServices.css";

const API_BASE = "http://localhost:8081/api/hospitals";

function HospitalServices() {
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [hospitalId, setHospitalId] = useState(null);

  const [services, setServices] = useState({
    doctors: 0,
    beds: 0,
    ambulances: 0,
    icuBeds: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // CHECK LOGGED-IN HOSPITAL
  // =====================================================

  useEffect(() => {
    const storedHospital = localStorage.getItem("hospital");

    if (!storedHospital) {
      navigate("/login/hospital", { replace: true });
      return;
    }

    try {
      const hospitalData = JSON.parse(storedHospital);

      const id =
        hospitalData.id ||
        hospitalData.hospitalId ||
        hospitalData._id ||
        localStorage.getItem("hospitalId");

      if (!id) {
        setError("Hospital information not found.");
        setLoading(false);
        return;
      }

      setHospital(hospitalData);
      setHospitalId(id);

      localStorage.setItem("hospitalId", String(id));

    } catch (err) {
      console.error(err);

      localStorage.removeItem("hospital");

      navigate("/login/hospital", {
        replace: true,
      });
    }
  }, [navigate]);

  // =====================================================
  // LOAD ONLY LOGGED-IN HOSPITAL DATA
  // =====================================================

  useEffect(() => {
    if (hospitalId) {
      loadHospitalServices();
    }
  }, [hospitalId]);

  const loadHospitalServices = async () => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------
      // DOCTORS
      // -------------------------------

      const doctorsResponse = await fetch(
        `${API_BASE}/${hospitalId}/doctors`
      );

      let doctors = [];

      if (doctorsResponse.ok) {
        doctors = await doctorsResponse.json();
      }

      // -------------------------------
      // BEDS
      // -------------------------------

      const bedsResponse = await fetch(
        `${API_BASE}/${hospitalId}/beds`
      );

      let beds = [];

      if (bedsResponse.ok) {
        beds = await bedsResponse.json();
      }

      // -------------------------------
      // AMBULANCES
      // -------------------------------

      const ambulanceResponse = await fetch(
        `${API_BASE}/${hospitalId}/ambulances`
      );

      let ambulances = [];

      if (ambulanceResponse.ok) {
        ambulances = await ambulanceResponse.json();
      }

      // -------------------------------
      // CALCULATE BED DETAILS
      // -------------------------------

      let availableBeds = 0;
      let availableICUBeds = 0;

      beds.forEach((bed) => {
        const available = Number(
          bed.availableBeds || 0
        );

        availableBeds += available;

        const bedType = String(
          bed.bedType || ""
        ).toLowerCase();

        const ward = String(
          bed.ward || ""
        ).toLowerCase();

        if (
          bedType.includes("icu") ||
          ward.includes("icu")
        ) {
          availableICUBeds += available;
        }
      });

      // -------------------------------
      // CALCULATE AMBULANCE DETAILS
      // -------------------------------

      let availableAmbulances = 0;

      ambulances.forEach((ambulance) => {
        availableAmbulances += Number(
          ambulance.availableAmbulances || 0
        );
      });

      // -------------------------------
      // SET DATA
      // -------------------------------

      setServices({
        doctors: doctors.length,
        beds: availableBeds,
        ambulances: availableAmbulances,
        icuBeds: availableICUBeds,
      });

    } catch (err) {
      console.error(
        "Hospital services error:",
        err
      );

      setError(
        "Unable to load hospital service details."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("hospital");
    localStorage.removeItem("hospitalId");
    localStorage.removeItem("hospitalName");
    localStorage.removeItem("hospitalEmail");
    localStorage.removeItem("hospitalToken");

    navigate("/login/hospital", {
      replace: true,
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="hospital-services-page">
        <div className="services-loading">
          <div className="loading-spinner"></div>
          <p>Loading hospital information...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // HOSPITAL DETAILS
  // =====================================================

  const hospitalName =
    hospital?.name ||
    hospital?.hospitalName ||
    localStorage.getItem("hospitalName") ||
    "Hospital";

  const hospitalEmail =
    hospital?.email ||
    hospital?.hospitalEmail ||
    localStorage.getItem("hospitalEmail") ||
    "Email not available";

  const hospitalPhone =
    hospital?.phone ||
    hospital?.contactNumber ||
    hospital?.mobile ||
    "Not available";

  const hospitalAddress =
    hospital?.address ||
    hospital?.location ||
    "Hospital address not available";

  const hospitalCity =
    hospital?.city ||
    "Not available";

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="hospital-services-page">

      {/* ==========================================
          TOP HEADER
      ========================================== */}

      <header className="services-header">

        <div className="header-left">

          <button
            className="back-btn"
            onClick={() =>
              navigate("/hospital/dashboard")
            }
          >
            ←
          </button>

          <div className="header-logo">
            🏥
          </div>

          <div className="header-text">
            <h1>Hospital Services</h1>
            <p>
              {hospitalName}
            </p>
          </div>

        </div>

        <div className="header-right">

          <div className="online-status">
            <span></span>
            Online
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* ==========================================
          MAIN
      ========================================== */}

      <main className="services-main">

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {/* ======================================
            HOSPITAL INFORMATION
        ======================================= */}

        <section className="hospital-info-card">

          <div className="hospital-info-top">

            <div className="hospital-large-icon">
              🏥
            </div>

            <div className="hospital-main-info">

              <h2>
                {hospitalName}
              </h2>

              <p>
                Hospital Service & Facility
                Information
              </p>

            </div>

          </div>

          <div className="hospital-details-grid">

            <div className="hospital-detail">
              <span className="detail-icon">
                ✉️
              </span>

              <div>
                <small>Email</small>
                <strong>
                  {hospitalEmail}
                </strong>
              </div>
            </div>

            <div className="hospital-detail">
              <span className="detail-icon">
                📞
              </span>

              <div>
                <small>Phone</small>
                <strong>
                  {hospitalPhone}
                </strong>
              </div>
            </div>

            <div className="hospital-detail">
              <span className="detail-icon">
                📍
              </span>

              <div>
                <small>Address</small>
                <strong>
                  {hospitalAddress}
                </strong>
              </div>
            </div>

            <div className="hospital-detail">
              <span className="detail-icon">
                🌐
              </span>

              <div>
                <small>City</small>
                <strong>
                  {hospitalCity}
                </strong>
              </div>
            </div>

          </div>

        </section>

        {/* ======================================
            INTRODUCTION
        ======================================= */}

        <section className="services-intro">

          <div className="intro-icon">
            🏥
          </div>

          <div>

            <h2>
              Hospital Facilities
            </h2>

            <p>
              {hospitalName} provides essential
              healthcare facilities to support
              patients and emergency response
              services. The information below
              represents the resources currently
              available at this hospital.
            </p>

          </div>

        </section>

        {/* ======================================
            SERVICE BOXES
        ======================================= */}

        <section className="services-section">

          <div className="section-title">

            <h2>
              Available Services
            </h2>

            <p>
              Current hospital resources
            </p>

          </div>

          <div className="small-service-grid">

            {/* ==================================
                DOCTORS
            ================================== */}

            <div className="small-service-card">

              <div className="small-service-top">

                <div className="small-service-icon doctor">
                  👨‍⚕️
                </div>

                <span className="service-number">
                  {services.doctors}
                </span>

              </div>

              <h3>
                Doctors
              </h3>

              <p>
                Qualified medical professionals
                available to provide patient care
                and emergency treatment.
              </p>

              <button
                onClick={() =>
                  navigate("/hospital/doctors")
                }
              >
                View Doctors →
              </button>

            </div>

            {/* ==================================
                BEDS
            ================================== */}

            <div className="small-service-card">

              <div className="small-service-top">

                <div className="small-service-icon beds">
                  🛏️
                </div>

                <span className="service-number">
                  {services.beds}
                </span>

              </div>

              <h3>
                Hospital Beds
              </h3>

              <p>
                Beds currently available for
                admitted patients and emergency
                medical requirements.
              </p>

              <button
                onClick={() =>
                  navigate("/hospital/beds")
                }
              >
                Manage Beds →
              </button>

            </div>

            {/* ==================================
                AMBULANCES
            ================================== */}

            <div className="small-service-card">

              <div className="small-service-top">

                <div className="small-service-icon ambulance">
                  🚑
                </div>

                <span className="service-number">
                  {services.ambulances}
                </span>

              </div>

              <h3>
                Ambulances
              </h3>

              <p>
                Ambulances available for emergency
                transportation and patient
                transfers.
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/hospital/ambulances"
                  )
                }
              >
                Manage Ambulances →
              </button>

            </div>

            {/* ==================================
                ICU
            ================================== */}

            <div className="small-service-card">

              <div className="small-service-top">

                <div className="small-service-icon icu">
                  ❤️
                </div>

                <span className="service-number">
                  {services.icuBeds}
                </span>

              </div>

              <h3>
                ICU Beds
              </h3>

              <p>
                Intensive care beds available for
                patients requiring continuous
                medical monitoring and support.
              </p>

              <button
                onClick={() =>
                  navigate("/hospital/beds")
                }
              >
                Manage ICU →
              </button>

            </div>

          </div>

        </section>

        {/* ======================================
            HOSPITAL MESSAGE
        ======================================= */}

        <section className="hospital-message">

          <div className="message-icon">
            ❤️
          </div>

          <div>

            <h2>
              Supporting Emergency Care
            </h2>

            <p>
              Our hospital services help doctors,
              rescue teams, volunteers and citizens
              coordinate emergency medical care.
              Real-time availability of doctors,
              beds, ambulances and ICU facilities
              helps emergency teams make faster
              decisions.
            </p>

          </div>

        </section>

        {/* ======================================
            BOTTOM ACTIONS
        ======================================= */}

        <div className="bottom-actions">

          <button
            onClick={() =>
              navigate("/hospital/dashboard")
            }
          >
            🏠 Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/hospital/messages")
            }
          >
            💬 Messages
          </button>

          <button
            onClick={loadHospitalServices}
          >
            🔄 Refresh
          </button>

        </div>

      </main>

    </div>
  );
}

export default HospitalServices;