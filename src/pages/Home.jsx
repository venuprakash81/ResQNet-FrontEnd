import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-page">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar">

        <Link to="/" className="logo">
          <span className="logo-icon">🚨</span>
          <span className="logo-text">
            ResQ<span>Net</span>
          </span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/process">Process</Link>
          <Link to="/features">Features</Link>
        </div>

        <div className="nav-buttons">

          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/register" className="register-btn">
            Register
          </Link>

        </div>

      </nav>


      {/* ================= HERO ================= */}
      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">
            <span className="pulse"></span>
            SMART DISASTER RESPONSE PLATFORM
          </div>

          <h1>
            Faster Response.
            <br />
            <span>Safer Communities.</span>
          </h1>

          <p>
            ResQNet is a smart disaster response and emergency management
            system that connects citizens, rescue teams, hospitals,
            volunteers and authorities through one unified platform.
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="primary-btn">
              Get Started →
            </Link>

            <Link to="/process" className="secondary-btn">
              How It Works
            </Link>

          </div>

          <div className="hero-stats">

            <div className="stat">
              <strong>24/7</strong>
              <span>Emergency Support</span>
            </div>

            <div className="stat">
              <strong>LIVE</strong>
              <span>Disaster Monitoring</span>
            </div>

            <div className="stat">
              <strong>SMART</strong>
              <span>Response System</span>
            </div>

          </div>

        </div>


        {/* ================= HERO CARD ================= */}
        <div className="hero-visual">

          <div className="circle"></div>

          <div className="emergency-card">

            <div className="card-top">

              <span>LIVE EMERGENCY</span>

              <span className="live">
                <span className="live-dot"></span>
                LIVE
              </span>

            </div>

            <div className="emergency-main">

              <div className="emergency-icon">
                🌊
              </div>

              <div>
                <small>CRITICAL ALERT</small>

                <h3>Flood Emergency</h3>

                <p>
                  Emergency request received from affected area.
                </p>
              </div>

            </div>

            <div className="location-box">
              📍 Affected Zone
            </div>

            <div className="priority">

              <span>Priority Level</span>

              <strong>CRITICAL</strong>

            </div>

            <Link to="/" className="dispatch">
              🚑 Dispatch Rescue Team
            </Link>

          </div>

        </div>

      </section>


      {/* ================= ABOUT ================= */}
      <section className="section about">

        <div className="heading">

          <span>ABOUT RESQNET</span>

          <h2>
            One Platform for
            <br />
            <strong>Complete Disaster Management</strong>
          </h2>

          <p>
            During disasters, every second matters. ResQNet brings
            emergency-response activities together so information can
            quickly move from affected people to the right response team.
          </p>

          <Link to="/about" className="learn-more">
            Learn More About ResQNet →
          </Link>

        </div>


        <div className="about-grid">

          <div className="info-card">
            <div className="info-icon">📡</div>
            <h3>Real-Time Communication</h3>
            <p>
              Connect citizens, authorities and rescue teams through
              real-time emergency information.
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">🗺️</div>
            <h3>Location Intelligence</h3>
            <p>
              Identify emergency locations and nearby hospitals,
              shelters and rescue resources.
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">🤖</div>
            <h3>Smart Prioritization</h3>
            <p>
              Analyze emergency reports and help responders identify
              high-priority situations.
            </p>
          </div>

        </div>

      </section>


      {/* ================= PROCESS ================= */}
      <section className="section process">

        <div className="heading center">

          <span>HOW RESQNET WORKS</span>

          <h2>
            From Emergency Report
            <br />
            <strong>To Rescue</strong>
          </h2>

          <p>
            ResQNet follows a simple and coordinated emergency
            response workflow.
          </p>

        </div>


        <div className="process-grid">

          <div className="process-card">
            <div className="number">01</div>
            <div className="process-icon">📢</div>
            <h3>Report Emergency</h3>
            <p>
              Citizens report emergencies with location and details.
            </p>
          </div>

          <div className="process-card">
            <div className="number">02</div>
            <div className="process-icon">🔍</div>
            <h3>Analyze Situation</h3>
            <p>
              The system identifies the emergency type and severity.
            </p>
          </div>

          <div className="process-card">
            <div className="number">03</div>
            <div className="process-icon">🚑</div>
            <h3>Assign Rescue Team</h3>
            <p>
              Suitable rescue teams receive the emergency assignment.
            </p>
          </div>

          <div className="process-card">
            <div className="number">04</div>
            <div className="process-icon">📍</div>
            <h3>Track Response</h3>
            <p>
              Rescue teams navigate and update their operation status.
            </p>
          </div>

          <div className="process-card">
            <div className="number">05</div>
            <div className="process-icon">✅</div>
            <h3>Complete Rescue</h3>
            <p>
              The rescue operation is completed and recorded.
            </p>
          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section className="section features">

        <div className="heading center">

          <span>CORE FEATURES</span>

          <h2>
            Everything Needed for
            <br />
            <strong>Emergency Coordination</strong>
          </h2>

        </div>


        <div className="features-grid">

          <div className="feature-card">
            <div>🚨</div>
            <h3>Emergency Requests</h3>
            <p>
              Quickly submit emergency assistance requests.
            </p>
          </div>

          <div className="feature-card">
            <div>🗺️</div>
            <h3>Live Disaster Map</h3>
            <p>
              View disasters, teams, hospitals and shelters.
            </p>
          </div>

          <div className="feature-card">
            <div>🚑</div>
            <h3>Rescue Management</h3>
            <p>
              Manage rescue teams and emergency operations.
            </p>
          </div>

          <div className="feature-card">
            <div>🏥</div>
            <h3>Hospital Coordination</h3>
            <p>
              Track hospital availability and emergency capacity.
            </p>
          </div>

          <div className="feature-card">
            <div>🏠</div>
            <h3>Shelter Management</h3>
            <p>
              Manage shelters for affected people.
            </p>
          </div>

          <div className="feature-card">
            <div>🔔</div>
            <h3>Emergency Alerts</h3>
            <p>
              Send disaster warnings and response updates.
            </p>
          </div>

          <div className="feature-card">
            <div>🤖</div>
            <h3>AI Assistance</h3>
            <p>
              Help classify and prioritize emergency incidents.
            </p>
          </div>

          <div className="feature-card">
            <div>📊</div>
            <h3>Analytics</h3>
            <p>
              Monitor disaster statistics and response performance.
            </p>
          </div>

        </div>

      </section>


      {/* ================= USERS ================= */}
      <section className="section users">

        <div className="heading center">

          <span>RESQNET USERS</span>

          <h2>
            One System.
            <br />
            <strong>Multiple Response Teams.</strong>
          </h2>

          <p>
            Different users work together through one unified
            emergency response platform.
          </p>

        </div>


        <div className="users-grid">

          <div className="user-card">
            <div className="user-icon">👤</div>
            <h3>Citizen</h3>
            <p>
              Report emergencies and request immediate help.
            </p>
          </div>

          <div className="user-card">
            <div className="user-icon">🚑</div>
            <h3>Rescue Team</h3>
            <p>
              Receive emergency assignments and perform rescue operations.
            </p>
          </div>

          <div className="user-card">
            <div className="user-icon">🤝</div>
            <h3>Volunteer</h3>
            <p>
              Support disaster relief and emergency activities.
            </p>
          </div>

          <div className="user-card">
            <div className="user-icon">🏥</div>
            <h3>Hospital</h3>
            <p>
              Manage medical resources and emergency cases.
            </p>
          </div>

          <div className="user-card">
            <div className="user-icon">🏛️</div>
            <h3>Authority</h3>
            <p>
              Monitor disasters and coordinate emergency response.
            </p>
          </div>

          <div className="user-card">
            <div className="user-icon">🏢</div>
            <h3>NGO</h3>
            <p>
              Coordinate humanitarian and relief operations.
            </p>
          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="cta">

        <div className="cta-icon">
          🚨
        </div>

        <h2>
          When Every Second Matters,
          <br />
          <strong>ResQNet Responds.</strong>
        </h2>

        <p>
          Join the smart emergency response network and help build
          safer communities.
        </p>

        <Link to="/register" className="cta-button">
          Join ResQNet →
        </Link>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="footer">

        <div className="footer-content">

          <div className="footer-brand">

            <Link to="/" className="logo">
              <span className="logo-icon">🚨</span>
              <span className="logo-text">
                ResQ<span>Net</span>
              </span>
            </Link>

            <p>
              Smart Disaster Response & Emergency Management System.
            </p>

          </div>


          <div className="footer-column">

            <h4>Navigation</h4>

            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/process">Process</Link>
            <Link to="/features">Features</Link>

          </div>


          <div className="footer-column">

            <h4>Account</h4>

            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/help">Help</Link>

          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © 2026 ResQNet. All Rights Reserved.
          </span>

          <span>
            Smart Emergency Response Platform
          </span>

        </div>

      </footer>

    </div>
  );
};

export default Home;
