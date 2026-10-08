
import React, { useEffect, useState } from "react";
import "./HospitalBedBookings.css";

const API = "https://resqnet-backend-1.onrender.com/api";

function HospitalBedBookings() {
  const [hospitalId, setHospitalId] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedHospital = JSON.parse(
      localStorage.getItem("hospital") || "{}"
    );

    const id =
      storedHospital.id ??
      storedHospital.hospitalId ??
      storedHospital.hospital_id;

    if (!id) {
      setError("Hospital ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    setHospitalId(String(id));
    loadBookings(String(id));
  }, []);

  async function loadBookings(id = hospitalId) {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/bed-bookings/hospital/${encodeURIComponent(id)}`
      );

      if (!response.ok) {
        throw new Error("Unable to load hospital bed bookings.");
      }

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(booking, action) {
    const bookingId = booking.id ?? booking.bookingId;

    if (!bookingId) {
      setError("Booking ID is missing.");
      return;
    }

    const actionLabel = action === "confirm" ? "confirm" : "reject";

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} this bed booking?`
      )
    ) {
      return;
    }

    setProcessingId(bookingId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/bed-bookings/${bookingId}/${action}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" }
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Unable to ${actionLabel} this booking.`
        );
      }

      setMessage(
        action === "confirm"
          ? "Booking confirmed successfully."
          : "Booking rejected successfully."
      );

      await loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  function getStatusClass(status) {
    return String(status || "PENDING").toLowerCase();
  }

  const filteredBookings =
    filter === "ALL"
      ? bookings
      : bookings.filter(
          (booking) =>
            String(booking.status || "PENDING").toUpperCase() === filter
        );

  const countByStatus = (status) =>
    bookings.filter(
      (booking) =>
        String(booking.status || "PENDING").toUpperCase() === status
    ).length;

  return (
    <div className="hospital-bookings-page">
      <header className="hospital-bookings-header">
        <div>
          <p className="hospital-bookings-eyebrow">RESQNET HOSPITAL PORTAL</p>
          <h1>Bed Booking Requests</h1>
          <p className="hospital-bookings-subtitle">
            View and manage patient bed booking requests for your hospital.
          </p>
        </div>

        <button
          className="hospital-bookings-refresh"
          onClick={() => loadBookings()}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {error && <div className="hospital-bookings-alert error">{error}</div>}
      {message && (
        <div className="hospital-bookings-alert success">{message}</div>
      )}

      <section className="booking-stats">
        <button
          className={`booking-stat ${filter === "ALL" ? "selected" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          <span className="booking-stat-label">All Bookings</span>
          <strong>{bookings.length}</strong>
        </button>

        <button
          className={`booking-stat pending ${filter === "PENDING" ? "selected" : ""}`}
          onClick={() => setFilter("PENDING")}
        >
          <span className="booking-stat-label">Pending</span>
          <strong>{countByStatus("PENDING")}</strong>
        </button>

        <button
          className={`booking-stat confirmed ${filter === "CONFIRMED" ? "selected" : ""}`}
          onClick={() => setFilter("CONFIRMED")}
        >
          <span className="booking-stat-label">Confirmed</span>
          <strong>{countByStatus("CONFIRMED")}</strong>
        </button>

        <button
          className={`booking-stat rejected ${filter === "REJECTED" ? "selected" : ""}`}
          onClick={() => setFilter("REJECTED")}
        >
          <span className="booking-stat-label">Rejected</span>
          <strong>{countByStatus("REJECTED")}</strong>
        </button>
      </section>

      <section className="hospital-bookings-list-section">
        <div className="hospital-bookings-list-heading">
          <div>
            <h2>
              {filter === "ALL"
                ? "All Bed Bookings"
                : `${filter.charAt(0)}${filter.slice(1).toLowerCase()} Bookings`}
            </h2>
            <p>
              {filteredBookings.length} request
              {filteredBookings.length === 1 ? "" : "s"} found
            </p>
          </div>

          <select
            className="booking-filter-select"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter bookings by status"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="hospital-bookings-empty">
            Loading bed booking requests...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="hospital-bookings-empty">
            <div className="empty-booking-icon">▤</div>
            <h3>No bookings found</h3>
            <p>
              There are no bed booking requests in this category.
            </p>
          </div>
        ) : (
          <div className="hospital-booking-cards">
            {filteredBookings.map((booking) => {
              const id = booking.id ?? booking.bookingId;
              const status = String(
                booking.status || "PENDING"
              ).toUpperCase();
              const isPending = status === "PENDING";
              const isProcessing = processingId === id;

              return (
                <article className="hospital-booking-card" key={id}>
                  <div className="hospital-booking-card-header">
                    <div className="patient-heading">
                      <div className="patient-avatar">
                        {(booking.patientName || "P").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3>{booking.patientName || "Unknown patient"}</h3>
                        <p>Booking ID: {id ?? "—"}</p>
                      </div>
                    </div>

                    <span
                      className={`hospital-booking-status ${getStatusClass(status)}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="hospital-booking-details">
                    <div className="booking-detail-item">
                      <span>Patient age</span>
                      <strong>{booking.patientAge ?? "—"}</strong>
                    </div>
                    <div className="booking-detail-item">
                      <span>Gender</span>
                      <strong>{booking.gender || "—"}</strong>
                    </div>
                    <div className="booking-detail-item">
                      <span>Phone</span>
                      <strong>{booking.phone || "—"}</strong>
                    </div>
                    <div className="booking-detail-item">
                      <span>Bed type</span>
                      <strong>{booking.bedType || "—"}</strong>
                    </div>
                    <div className="booking-detail-item">
                      <span>Bed ID</span>
                      <strong>{booking.bedId ?? "—"}</strong>
                    </div>
                    <div className="booking-detail-item">
                      <span>Booking date</span>
                      <strong>
                        {booking.bookingDate
                          ? new Date(booking.bookingDate).toLocaleString()
                          : "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="booking-contact">
                    <span className="contact-label">Citizen email</span>
                    <span>{booking.citizenEmail || "—"}</span>
                  </div>

                  <div className="booking-reason-box">
                    <strong>Reason for booking</strong>
                    <p>{booking.reason || "No reason provided."}</p>
                  </div>

                  {isPending && (
                    <div className="hospital-booking-actions">
                      <button
                        className="reject-booking-button"
                        onClick={() => updateStatus(booking, "reject")}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Please wait..." : "Reject"}
                      </button>

                      <button
                        className="confirm-booking-button"
                        onClick={() => updateStatus(booking, "confirm")}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Please wait..." : "Confirm Booking"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default HospitalBedBookings;
