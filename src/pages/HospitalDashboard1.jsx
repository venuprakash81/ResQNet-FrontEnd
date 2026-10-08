
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Bed,
  Ambulance,
  ArrowRight,
  Hospital,
  LogOut
} from "lucide-react";
import "./HospitalDashboard1.css";

function HospitalDashboard1() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Doctors",
      description: "View and manage all registered doctors.",
      icon: Stethoscope,
      color: "blue",
      path: "/hospital/all-doctors"
    },
    {
      title: "Beds",
      description: "View and manage available hospital beds.",
      icon: Bed,
      color: "green",
      path: "/hospital/bed-bookings"
    },
    {
      title: "Ambulances",
      description: "View and manage hospital ambulances.",
      icon: Ambulance,
      color: "orange",
      path: "/hospital/ambulance-bookings"
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("hospital");
    navigate("/hospital/login");
  };

  return (
    <div className="hospital-dashboard">
      <header className="hospital-topbar">
        <div className="hospital-brand">
          <div className="hospital-logo">
            <Hospital size={25} />
          </div>
          <div>
            <h2>ResQNet</h2>
            <span>Hospital Portal</span>
          </div>
        </div>

        <button className="hospital-logout" onClick={handleLogout}>
          <LogOut size={17} />
          Logout
        </button>
      </header>

      <main className="hospital-main">
        <section className="hospital-welcome">
          <div>
            <span className="hospital-welcome-tag">
              HOSPITAL MANAGEMENT
            </span>
            <h1>Welcome to Hospital Dashboard</h1>
            <p>
              Manage your doctors, beds, and emergency
              ambulance services from one place.
            </p>
          </div>
        </section>

        <section className="hospital-section">
          <div className="hospital-section-heading">
            <div>
              <h2>Management Services</h2>
              <p>Select a service to continue</p>
            </div>
          </div>

          <div className="hospital-card-grid">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  type="button"
                  className="hospital-service-card"
                  key={section.title}
                  onClick={() => navigate(section.path)}
                >
                  <div className={`hospital-card-icon ${section.color}`}>
                    <Icon size={30} />
                  </div>

                  <div className="hospital-card-content">
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                  </div>

                  <div className="hospital-card-footer">
                    <span>Open {section.title}</span>
                    <ArrowRight size={19} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="hospital-footer">
        <p>© 2026 ResQNet | Emergency Healthcare Network</p>
      </footer>
    </div>
  );
}

export default HospitalDashboard1;
