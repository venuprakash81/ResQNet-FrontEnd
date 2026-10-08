
import React, { useEffect, useMemo, useState } from "react";
import "./HospitalAllDoctors.css";

const API_URL = "http://localhost:8081/api/doctor-bookings/doctors";

function HospitalAllDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Failed to fetch doctors (${response.status})`);
      }

      const data = await response.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const specializations = useMemo(() => {
    return [
      "All",
      ...new Set(
        doctors
          .map((doctor) => doctor.specialization)
          .filter(Boolean)
      ),
    ];
  }, [doctors]);

  const filteredDoctors = doctors.filter((doctor) => {
    const name = doctor.name || doctor.doctorName || "";
    const spec = doctor.specialization || "";
    const email = doctor.email || doctor.doctorEmail || "";
    const query = search.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(query) ||
      spec.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query);

    const matchesSpecialization =
      specialization === "All" ||
      spec === specialization;

    return matchesSearch && matchesSpecialization;
  });

  return (
    <div className="hospital-doctors-page">
      <header className="hospital-doctors-header">
        <div>
          <span className="hospital-doctors-label">
            HOSPITAL MANAGEMENT
          </span>
          <h1>All Doctors</h1>
          <p>View and manage doctors registered in ResQNet.</p>
        </div>

        <button
          className="doctor-refresh-btn"
          onClick={fetchDoctors}
          disabled={loading}
        >
          ↻ {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <section className="doctor-stats">
        <div className="doctor-stat-card">
          <div className="doctor-stat-icon">👨‍⚕️</div>
          <div>
            <p>Total Doctors</p>
            <h2>{doctors.length}</h2>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="doctor-stat-icon">🩺</div>
          <div>
            <p>Specializations</p>
            <h2>{specializations.length - 1}</h2>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="doctor-stat-icon">🔎</div>
          <div>
            <p>Filtered Doctors</p>
            <h2>{filteredDoctors.length}</h2>
          </div>
        </div>
      </section>

      <section className="doctor-list-section">
        <div className="doctor-list-heading">
          <div>
            <h2>Registered Doctors</h2>
            <p>Doctors retrieved from the database</p>
          </div>
        </div>

        <div className="doctor-filters">
          <input
            type="search"
            placeholder="Search by name, email or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            {specializations.map((item) => (
              <option key={item} value={item}>
                {item === "All"
                  ? "All Specializations"
                  : item}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="doctor-message">
            <div className="doctor-spinner"></div>
            <p>Loading doctors...</p>
          </div>
        ) : error ? (
          <div className="doctor-message doctor-error">
            <h3>Unable to load doctors</h3>
            <p>{error}</p>
            <button onClick={fetchDoctors}>Try Again</button>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="doctor-message">
            <div className="doctor-empty-icon">🩺</div>
            <h3>No doctors found</h3>
            <p>
              {doctors.length === 0
                ? "No doctors are currently registered."
                : "Try changing your search or filter."}
            </p>
          </div>
        ) : (
          <div className="doctor-table-wrapper">
            <table className="hospital-doctor-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Hospital ID</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>

              <tbody>
                {filteredDoctors.map((doctor, index) => (
                  <tr key={doctor.id ?? index}>
                    <td>
                      <div className="doctor-name-cell">
                        <div className="doctor-avatar">
                          {(doctor.name ||
                            doctor.doctorName ||
                            "D")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <strong>
                            {doctor.name ||
                              doctor.doctorName ||
                              "Unnamed Doctor"}
                          </strong>
                          <small>
                            ID: {doctor.id ?? "N/A"}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="doctor-specialty">
                        {doctor.specialization || "Not specified"}
                      </span>
                    </td>

                    <td>
                      {doctor.hospitalId ?? "N/A"}
                    </td>

                    <td>
                      {doctor.email ||
                        doctor.doctorEmail ||
                        "N/A"}
                    </td>

                    <td>
                      {doctor.phone ||
                        doctor.phoneNumber ||
                        "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default HospitalAllDoctors;
