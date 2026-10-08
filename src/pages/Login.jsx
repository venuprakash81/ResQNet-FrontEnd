import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {

  const userTypes = [
    {
      icon: "👤",
      title: "Citizen",
      description:
        "Login to report emergencies, request help and track your rescue status.",
      path: "/login/citizen",
    },
    {
      icon: "🚑",
      title: "Rescue Team",
      description:
        "Login to receive emergency assignments and manage rescue operations.",
      path: "/login/rescue-team",
    },
    {
      icon: "🤝",
      title: "Volunteer",
      description:
        "Login to manage volunteer activities and support disaster relief.",
      path: "/login/volunteer",
    },
    {
      icon: "🏥",
      title: "Hospital",
      description:
        "Login to manage emergency cases, beds and medical resources.",
      path: "/login/hospital",
    },
    {
      icon: "🏛️",
      title: "Authority / Admin",
      description:
        "Login to monitor disasters and coordinate emergency response.",
      path: "/login/admin",
    },
    {
      icon: "🏢",
      title: "NGO",
      description:
        "Login to coordinate humanitarian services and relief operations.",
      path: "/login",
    },
  ];

  return (
    <div className="login-page">

      {/* ================= NAVBAR ================= */}

      <div className="login-navbar">

        <Link to="/" className="login-logo">

          <span className="login-logo-icon">
            🚨
          </span>

          <span className="login-logo-text">
            ResQ<span>Net</span>
          </span>

        </Link>

        <Link to="/" className="login-back">
          ← Back to Home
        </Link>

      </div>


      {/* ================= MAIN ================= */}

      <main className="login-container">

        {/* HEADER */}

        <div className="login-header">

          <div className="login-header-icon">
            🔐
          </div>

          <span className="login-label">
            WELCOME BACK
          </span>

          <h1>
            Login to ResQNet
          </h1>

          <p>
            Select your user type to continue.
            <br />
            Access your ResQNet emergency response dashboard.
          </p>

        </div>


        {/* ================= USER TYPES ================= */}

        <div className="login-user-grid">

          {userTypes.map((user) => (

            <Link
              to={user.path}
              className="login-user-card"
              key={user.title}
            >

              {/* CARD TOP */}

              <div className="login-card-top">

                <div className="login-user-icon">
                  {user.icon}
                </div>

                <div className="login-arrow">
                  →
                </div>

              </div>


              {/* CARD CONTENT */}

              <div className="login-card-content">

                <h2>
                  {user.title}
                </h2>

                <p>
                  {user.description}
                </p>

              </div>


              {/* LOGIN */}

              <div className="login-continue">

                <span>
                  Continue to Login
                </span>

                <span className="continue-arrow">
                  →
                </span>

              </div>

            </Link>

          ))}

        </div>


        {/* ================= REGISTER ================= */}

        <div className="no-account">

          <span>
            Don't have a ResQNet account?
          </span>

          <Link to="/register">
            Create Account
          </Link>

        </div>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="login-footer">

        <p>
          © 2026 ResQNet. Smart Disaster Response & Emergency
          Management System.
        </p>

      </footer>

    </div>
  );
};

export default Login;
