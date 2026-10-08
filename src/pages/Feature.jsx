import React from "react";
import { Link } from "react-router-dom";
import "./Feature.css";

function Feature() {
  const features = [
    {
      icon: "🆘",
      title: "Emergency SOS",
      description:
        "Citizens can send an emergency SOS request with their current location, emergency type, and number of people requiring assistance.",
      tag: "Emergency"
    },
    {
      icon: "📱",
      title: "Disaster Reporting",
      description:
        "Users can report floods, fires, earthquakes, cyclones, landslides and other incidents with location and supporting information.",
      tag: "Reporting"
    },
    {
      icon: "🗺️",
      title: "Live Disaster Map",
      description:
        "An interactive map displays active disaster locations, affected areas, emergency facilities, shelters and response teams.",
      tag: "GIS"
    },
    {
      icon: "🚑",
      title: "Rescue Coordination",
      description:
        "Authorities can assign emergency response teams to incidents and monitor the progress of rescue operations.",
      tag: "Response"
    },
    {
      icon: "📢",
      title: "Emergency Alerts",
      description:
        "The platform can provide disaster warnings, evacuation information and important emergency notifications.",
      tag: "Communication"
    },
    {
      icon: "🏠",
      title: "Shelter Management",
      description:
        "Citizens can find nearby shelters while authorities can manage shelter capacity, occupancy and available facilities.",
      tag: "Shelters"
    },
    {
      icon: "📦",
      title: "Resource Management",
      description:
        "Emergency resources such as food, water, medicines, vehicles and rescue equipment can be tracked and allocated.",
      tag: "Resources"
    },
    {
      icon: "🤖",
      title: "AI Risk Analysis",
      description:
        "AI and machine learning techniques can analyze disaster-related data to support risk assessment and preparedness.",
      tag: "AI / ML"
    },
    {
      icon: "📊",
      title: "Analytics & Reports",
      description:
        "Authorities can view disaster statistics, response information, resource usage and generate management reports.",
      tag: "Analytics"
    },
    {
      icon: "👨‍🚒",
      title: "Responder Management",
      description:
        "Emergency responders can view assignments, update mission status and coordinate their activities through the platform.",
      tag: "Responders"
    },
    {
      icon: "📍",
      title: "Location Services",
      description:
        "Location information helps identify affected areas, locate emergency requests and find nearby support facilities.",
      tag: "Location"
    },
    {
      icon: "🔐",
      title: "Secure Access",
      description:
        "Role-based access allows citizens, responders, authorities and administrators to access appropriate system functions.",
      tag: "Security"
    }
  ];

  return (
    <div className="feature-page">

      {/* HERO */}
      <section className="feature-hero">

        <div className="feature-hero-content">
          <span className="feature-badge">
            ⚡ RESQNET FEATURES
          </span>

          <h1>
            Powerful Features for
            <span> Disaster Management</span>
          </h1>

          <p>
            RESQNET combines emergency communication, disaster reporting,
            rescue coordination, live mapping, resource management and
            intelligent analytics into one unified platform.
          </p>

          <div className="hero-buttons">
            <Link to="/process" className="primary-btn">
              View Process →
            </Link>

            <Link to="/about" className="secondary-btn">
              About RESQNET
            </Link>
          </div>
        </div>

        <div className="feature-hero-visual">
          <div className="feature-orbit orbit-one">
            🆘
          </div>

          <div className="feature-orbit orbit-two">
            🗺️
          </div>

          <div className="feature-orbit orbit-three">
            🚑
          </div>

          <div className="feature-center">
            <span>🛡️</span>
            <strong>RESQNET</strong>
            <small>Smart Response</small>
          </div>
        </div>

      </section>


      {/* INTRO */}
      <section className="feature-intro">

        <div className="section-heading">
          <span>01</span>

          <div>
            <small>PLATFORM CAPABILITIES</small>
            <h2>Everything Connected</h2>
          </div>
        </div>

        <p className="intro-text">
          RESQNET is designed around a connected emergency response model.
          Information collected from citizens and emergency sources can be
          processed and shared with authorized responders and authorities to
          support coordinated disaster management.
        </p>

      </section>


      {/* FEATURE GRID */}
      <section className="feature-list-section">

        <div className="section-heading">
          <span>02</span>

          <div>
            <small>CORE FEATURES</small>
            <h2>What RESQNET Provides</h2>
          </div>
        </div>

        <div className="feature-grid">

          {features.map((feature, index) => (
            <div className="feature-box" key={index}>

              <div className="feature-box-top">
                <div className="feature-icon">
                  {feature.icon}
                </div>

                <span className="feature-tag">
                  {feature.tag}
                </span>
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

              <div className="feature-number">
                {String(index + 1).padStart(2, "0")}
              </div>

            </div>
          ))}

        </div>

      </section>


      {/* ROLE BASED FEATURES */}
      <section className="role-feature-section">

        <div className="section-heading">
          <span>03</span>

          <div>
            <small>ROLE BASED SYSTEM</small>
            <h2>Features by User</h2>
          </div>
        </div>

        <div className="role-feature-grid">

          <div className="role-feature-card citizen">
            <div className="role-icon">👥</div>

            <h3>Citizens</h3>

            <ul>
              <li>🆘 Send Emergency SOS</li>
              <li>📱 Report Disaster</li>
              <li>🗺️ View Disaster Map</li>
              <li>📢 Receive Alerts</li>
              <li>🏠 Find Shelters</li>
              <li>🚑 Track Rescue</li>
            </ul>
          </div>


          <div className="role-feature-card responder">
            <div className="role-icon">👨‍🚒</div>

            <h3>Responders</h3>

            <ul>
              <li>📋 View Emergency Requests</li>
              <li>🚑 Accept Rescue Mission</li>
              <li>🗺️ Navigate to Location</li>
              <li>📍 Share Team Location</li>
              <li>🔄 Update Mission Status</li>
              <li>✅ Complete Rescue</li>
            </ul>
          </div>


          <div className="role-feature-card authority">
            <div className="role-icon">🏢</div>

            <h3>Authorities</h3>

            <ul>
              <li>🚨 Manage Disasters</li>
              <li>👨‍🚒 Assign Response Teams</li>
              <li>📦 Allocate Resources</li>
              <li>🏠 Manage Shelters</li>
              <li>📢 Send Public Alerts</li>
              <li>📊 View Analytics</li>
            </ul>
          </div>


          <div className="role-feature-card admin">
            <div className="role-icon">👨‍💻</div>

            <h3>Administrators</h3>

            <ul>
              <li>👥 Manage Users</li>
              <li>🔐 Manage Roles</li>
              <li>📊 System Analytics</li>
              <li>📋 Manage Reports</li>
              <li>⚙️ System Configuration</li>
              <li>🛡️ Security Management</li>
            </ul>
          </div>

        </div>

      </section>


      {/* TECHNOLOGY */}
      <section className="feature-tech-section">

        <div className="section-heading">
          <span>04</span>

          <div>
            <small>TECHNOLOGY</small>
            <h2>Technology Behind RESQNET</h2>
          </div>
        </div>

        <div className="tech-feature-grid">

          <div>
            <span>⚛️</span>
            <h3>React.js</h3>
            <p>Interactive frontend and responsive user interfaces.</p>
          </div>

          <div>
            <span>☕</span>
            <h3>Spring Boot</h3>
            <p>Backend services and REST API development.</p>
          </div>

          <div>
            <span>🗄️</span>
            <h3>MySQL</h3>
            <p>Storage and management of application data.</p>
          </div>

          <div>
            <span>🤖</span>
            <h3>AI / ML</h3>
            <p>Risk analysis and intelligent disaster insights.</p>
          </div>

          <div>
            <span>🗺️</span>
            <h3>Maps API</h3>
            <p>Location-based emergency and mapping services.</p>
          </div>

          <div>
            <span>📡</span>
            <h3>REST APIs</h3>
            <p>Communication between frontend and backend services.</p>
          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="feature-cta">

        <div className="cta-icon">🛡️</div>

        <h2>Built for Faster Emergency Response</h2>

        <p>
          RESQNET brings disaster information, people, responders and
          resources together on a single platform.
        </p>

        <div className="cta-buttons">
          <Link to="/process" className="primary-btn">
            Explore Process →
          </Link>

          <Link to="/help" className="secondary-btn">
            Need Help?
          </Link>
        </div>

      </section>

    </div>
  );
}

export default Feature;
