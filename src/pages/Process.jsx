import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-page">

      <section className="about-hero">
        <div className="hero-content">
          <span className="hero-badge">🚨 RESQNET</span>

          <h1>
            Smart Disaster Response &
            <span> Emergency Management System</span>
          </h1>

          <p>
            RESQNET is a smart digital platform designed to improve disaster
            preparedness, emergency communication, rescue coordination and
            resource management.
          </p>

          <button>Explore RESQNET</button>
        </div>

        <div className="hero-visual">
          <div className="emergency-circle">🚨</div>
        </div>
      </section>

      <section className="about-section">
        <div className="section-title">
          <span>01</span>
          <div>
            <small>INTRODUCTION</small>
            <h2>About the Project</h2>
          </div>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <div className="card-icon">🎯</div>
            <h3>Our Objective</h3>
            <p>
              To provide a centralized platform that connects citizens,
              emergency responders and authorities for faster and coordinated
              disaster response.
            </p>
          </div>

          <div className="about-card">
            <div className="card-icon">⚠️</div>
            <h3>The Problem</h3>
            <p>
              During disasters, emergency information can be fragmented,
              response may be delayed and resources may not be efficiently
              coordinated.
            </p>
          </div>

          <div className="about-card">
            <div className="card-icon">💡</div>
            <h3>Our Solution</h3>
            <p>
              RESQNET combines disaster reporting, SOS requests, live maps,
              rescue coordination, alerts, shelters and resource management.
            </p>
          </div>
        </div>
      </section>

      <section className="workflow-section">
        <div className="section-title">
          <span>02</span>
          <div>
            <small>SYSTEM PROCESS</small>
            <h2>How RESQNET Works</h2>
          </div>
        </div>

        <div className="workflow">
          <div className="workflow-card">
            <div className="step-number">01</div>
            <div className="step-icon">🔍</div>
            <h3>Detect</h3>
            <p>Identify disaster incidents and emergency situations.</p>
          </div>

          <div className="arrow">→</div>

          <div className="workflow-card">
            <div className="step-number">02</div>
            <div className="step-icon">📱</div>
            <h3>Report</h3>
            <p>Citizens report incidents or send an emergency SOS.</p>
          </div>

          <div className="arrow">→</div>

          <div className="workflow-card">
            <div className="step-number">03</div>
            <div className="step-icon">🤝</div>
            <h3>Coordinate</h3>
            <p>Authorities coordinate teams and emergency resources.</p>
          </div>

          <div className="arrow">→</div>

          <div className="workflow-card">
            <div className="step-number">04</div>
            <div className="step-icon">🚑</div>
            <h3>Respond</h3>
            <p>Responders perform rescue operations and update status.</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="section-title">
          <span>03</span>
          <div>
            <small>CAPABILITIES</small>
            <h2>Key Features</h2>
          </div>
        </div>

        <div className="features-grid">

          <div className="feature-card">
            <div>🆘</div>
            <h3>Emergency SOS</h3>
            <p>Send an emergency request with location and incident details.</p>
          </div>

          <div className="feature-card">
            <div>🗺️</div>
            <h3>Live Disaster Map</h3>
            <p>View disasters, shelters, responders and emergency facilities.</p>
          </div>

          <div className="feature-card">
            <div>🚑</div>
            <h3>Rescue Coordination</h3>
            <p>Assign and track rescue teams during emergency operations.</p>
          </div>

          <div className="feature-card">
            <div>📢</div>
            <h3>Emergency Alerts</h3>
            <p>Send disaster warnings and important emergency notifications.</p>
          </div>

          <div className="feature-card">
            <div>🏠</div>
            <h3>Shelter Management</h3>
            <p>Find shelters and view capacity and availability information.</p>
          </div>

          <div className="feature-card">
            <div>📦</div>
            <h3>Resource Management</h3>
            <p>Manage food, water, medicines, vehicles and equipment.</p>
          </div>

          <div className="feature-card">
            <div>🤖</div>
            <h3>AI & Risk Analysis</h3>
            <p>Analyze disaster data to support risk assessment and planning.</p>
          </div>

          <div className="feature-card">
            <div>📊</div>
            <h3>Analytics</h3>
            <p>Generate statistics and reports about disaster response.</p>
          </div>

        </div>
      </section>

      <section className="users-section">
        <div className="section-title">
          <span>04</span>
          <div>
            <small>USER ROLES</small>
            <h2>Who Can Use RESQNET?</h2>
          </div>
        </div>

        <div className="users-grid">

          <div className="user-card">
            <div className="user-icon">👨‍👩‍👧</div>
            <h3>Citizens</h3>
            <p>
              Report disasters, send SOS requests, receive alerts and find
              emergency facilities.
            </p>
          </div>

          <div className="user-card">
            <div className="user-icon">👨‍🚒</div>
            <h3>Responders</h3>
            <p>
              Receive emergency assignments and coordinate rescue operations.
            </p>
          </div>

          <div className="user-card">
            <div className="user-icon">🏢</div>
            <h3>Authorities</h3>
            <p>
              Manage disasters, resources, shelters, teams and public alerts.
            </p>
          </div>

          <div className="user-card">
            <div className="user-icon">👨‍💻</div>
            <h3>Administrators</h3>
            <p>
              Manage users, permissions, reports and system operations.
            </p>
          </div>

        </div>
      </section>

      <section className="technology-section">
        <div className="section-title">
          <span>05</span>
          <div>
            <small>DEVELOPMENT</small>
            <h2>Technology Stack</h2>
          </div>
        </div>

        <div className="tech-grid">

          <div className="tech-card">
            <span>⚛️</span>
            <h3>Frontend</h3>
            <p>React.js, HTML5, CSS3, JavaScript</p>
          </div>

          <div className="tech-card">
            <span>☕</span>
            <h3>Backend</h3>
            <p>Java, Spring Boot, REST APIs</p>
          </div>

          <div className="tech-card">
            <span>🗄️</span>
            <h3>Database</h3>
            <p>MySQL</p>
          </div>

          <div className="tech-card">
            <span>🤖</span>
            <h3>AI / ML</h3>
            <p>Python, NumPy, Pandas, Scikit-learn</p>
          </div>

          <div className="tech-card">
            <span>🗺️</span>
            <h3>Maps</h3>
            <p>Google Maps API</p>
          </div>

          <div className="tech-card">
            <span>🔧</span>
            <h3>Tools</h3>
            <p>Git, GitHub, VS Code, Postman</p>
          </div>

        </div>
      </section>

      <section className="team-section">
        <div className="section-title">
          <span>06</span>
          <div>
            <small>PROJECT INFORMATION</small>
            <h2>Project Team</h2>
          </div>
        </div>

        <div className="team-box">
          <div className="team-logo">🛡️</div>

          <div>
            <h2>RESQNET</h2>
            <p>
              Smart Disaster Response & Emergency Management System
            </p>

            <div className="team-details">
              <div>
                <strong>Department</strong>
                <span>Computer Science & Engineering</span>
              </div>

              <div>
                <strong>Academic Year</strong>
                <span>2026 – 2027</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-footer">
        <div className="footer-icon">🛡️</div>

        <h2>Technology for a Safer Tomorrow</h2>

        <p>
          RESQNET brings people, technology and emergency response services
          together to support faster and coordinated disaster management.
        </p>
      </section>

    </div>
  );
}

export default About;
