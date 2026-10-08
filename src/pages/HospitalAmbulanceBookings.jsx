
import React, { useEffect, useState } from "react";
import "./HospitalAmbulanceBookings.css";

const API = "https://resqnet-backend-1.onrender.com/api";

function HospitalAmbulanceBookings() {
  const hospital = JSON.parse(localStorage.getItem("hospital") || "{}");
  const hospitalId =
    hospital.id ?? hospital.hospitalId ?? hospital.hospital_id;

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (hospitalId) loadBookings();
    else {
      setError("Hospital ID not found. Please log in again.");
      setLoading(false);
    }
  }, []);

  async function loadBookings() {
    if (!hospitalId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/ambulance-bookings/hospital/${hospitalId}`
      );
      if (!response.ok) throw new Error("Could not load ambulance bookings.");

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(booking, action) {
    const id = booking.id;
    const label =
      action === "confirm"
        ? "confirm"
        : action === "reject"
        ? "reject"
        : "complete";

    if (!id) {
      setError("Booking ID is missing.");
      return;
    }

    if (!window.confirm(`Are you sure you want to ${label} this request?`)) {
      return;
    }

    setProcessingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API}/ambulance-bookings/${id}/${action}/${hospitalId}`,
        { method: "PUT" }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `Unable to ${label} booking.`);
      }

      setSuccess(`Booking ${label}ed successfully.`);
      await loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  const visibleBookings =
    filter === "ALL"
      ? bookings
      : bookings.filter(
          (booking) =>
            String(booking.status || "PENDING").toUpperCase() === filter
        );

  const count = (status) =>
    bookings.filter(
      (booking) =>
        String(booking.status || "PENDING").toUpperCase() === status
    ).length;

  return (
    <main className="hospital-ambulance-bookings">
      <header className="hospital-ambulance-header">
        <div>
          <p>RESQNET HOSPITAL PORTAL</p>
          <h1>Ambulance Booking Requests</h1>
          <span>Manage ambulance requests received from citizens.</span>
        </div>
        <button onClick={loadBookings} disabled={loading}>
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {error && <div className="hospital-ambulance-alert error">{error}</div>}
      {success && (
        <div className="hospital-ambulance-alert success">{success}</div>
      )}

      <div className="hospital-ambulance-stats">
        {[
          ["ALL", "All Requests", bookings.length],
          ["PENDING", "Pending", count("PENDING")],
          ["CONFIRMED", "Confirmed", count("CONFIRMED")],
          ["REJECTED", "Rejected", count("REJECTED")]
        ].map(([value, label, total]) => (
          <button
            key={value}
            className={filter === value ? "selected" : ""}
            onClick={() => setFilter(value)}
          >
            <span>{label}</span>
            <strong>{total}</strong>
          </button>
        ))}
      </div>

      <section className="hospital-ambulance-request-section">
        <div className="hospital-ambulance-request-heading">
          <div>
            <h2>{filter === "ALL" ? "All Requests" : `${filter} Requests`}</h2>
            <p>{visibleBookings.length} request(s)</p>
          </div>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="hospital-ambulance-empty">Loading requests...</div>
        ) : visibleBookings.length === 0 ? (
          <div className="hospital-ambulance-empty">
            No ambulance booking requests found.
          </div>
        ) : (
          <div className="hospital-ambulance-request-grid">
            {visibleBookings.map((booking) => {
              const status = String(
                booking.status || "PENDING"
              ).toUpperCase();
              const busy = processingId === booking.id;

              return (
                <article className="hospital-ambulance-request-card" key={booking.id}>
                  <div className="hospital-ambulance-request-top">
                    <div>
                      <h3>{booking.citizenName}</h3>
                      <p>Request #{booking.id}</p>
                    </div>
                    <span className={`hospital-ambulance-status ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </div>

                  <div className="hospital-ambulance-request-details">
                    <p><strong>Phone:</strong> {booking.citizenPhone}</p>
                    <p><strong>Email:</strong> {booking.citizenEmail}</p>
                    <p><strong>Ambulance ID:</strong> {booking.ambulanceId}</p>
                    <p><strong>Emergency:</strong> {booking.emergencyType || "—"}</p>
                    <p><strong>Pickup:</strong> {booking.pickupLocation}</p>
                    <p><strong>Destination:</strong> {booking.destination}</p>
                    <p>
                      <strong>Requested:</strong>{" "}
                      {booking.bookingTime
                        ? new Date(booking.bookingTime).toLocaleString()
                        : "—"}
                    </p>
                  </div>

                  {status === "PENDING" && (
                    <div className="hospital-ambulance-request-actions">
                      <button
                        className="hospital-reject-button"
                        disabled={busy}
                        onClick={() => changeStatus(booking, "reject")}
                      >
                        Reject
                      </button>
                      <button
                        className="hospital-confirm-button"
                        disabled={busy}
                        onClick={() => changeStatus(booking, "confirm")}
                      >
                        Confirm
                      </button>
                    </div>
                  )}

                  {status === "CONFIRMED" && (
                    <div className="hospital-ambulance-request-actions">
                      <button
                        className="hospital-complete-button"
                        disabled={busy}
                        onClick={() => changeStatus(booking, "complete")}
                      >
                        Mark Completed
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default HospitalAmbulanceBookings;
