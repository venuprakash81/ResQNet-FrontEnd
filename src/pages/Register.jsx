import React from "react";
import { Link } from "react-router-dom";
import "./Register.css";

const Register = () => {

  const userTypes = [
    {
      icon: "👤",
      title: "Citizen",
      description:
        "Report emergencies, request help and track your rescue status.",
      path: "/register/citizen",
    },
    {
      icon: "🚑",
      title: "Rescue Team",
      description:
        "Receive emergency assignments and manage rescue operations.",
      path: "/register/team",
    },
    {
      icon: "🤝",
      title: "Volunteer",
      description:
        "Support disaster relief activities and help affected communities.",
      path: "/register/volunteer",
    },
    {
      icon: "🏥",
      title: "Hospital",
      description:
        "Manage emergency cases, beds, medical resources and facilities.",
      path: "/register/hospital",
    },
    {
      icon: "🏛️",
      title: "Ahority / Admin",
      description:
        "Monitor disasters, coordinate resources and manage response.",
      path: "/register",
    },
    {
      icon: "🏢",
      title: "NGO",
      description:
        "Coordinate humanitarian services, relief activities and resources.",
      path: "/register",
    },
  ];

  return (
    <div className="register-page">

      {/* ================= BACK TO HOME ================= */}

      <div className="register-navbar">

        <Link to="/" className="register-logo">
          <span className="register-logo-icon">
            🚨
          </span>

          <span className="register-logo-text">
            ResQ<span>Net</span>
          </span>
        </Link>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

      </div>


      {/* ================= HEADER ================= */}

      <main className="register-container">

        <div className="register-header">

          <div className="register-header-icon">
            🚨
          </div>

          <span className="register-label">
            JOIN RESQNET
          </span>

          <h1>
            Create Your ResQNet Account
          </h1>

          <p>
            Select your user type to continue with registration.
            <br />
            Choose the role that best describes you.
          </p>

        </div>


        {/* ================= USER TYPES ================= */}

        <div className="user-type-grid">

          {userTypes.map((user) => (

            <Link
              to={user.path}
              className="user-type-card"
              key={user.title}
            >

              <div className="user-card-top">

                <div className="user-type-icon">
                  {user.icon}
                </div>

                <div className="arrow-icon">
                  →
                </div>

              </div>


              <div className="user-card-content">

                <h2>
                  {user.title}
                </h2>

                <p>
                  {user.description}
                </p>

              </div>


              <div className="continue-text">
                Continue Registration
                <span>→</span>
              </div>

            </Link>

          ))}

        </div>


        {/* ================= LOGIN ================= */}

        <div className="already-account">

          <span>
            Already have a ResQNet account?
          </span>

          <Link to="/login">
            Login
          </Link>

        </div>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="register-footer">

        <p>
          © 2026 ResQNet. Smart Disaster Response & Emergency
          Management System.
        </p>

      </footer>

    </div>
  );
};

export default Register;
