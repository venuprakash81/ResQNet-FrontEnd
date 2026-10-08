
import React, { useEffect, useMemo, useState } from "react";
import {
  Truck,
  MapPin,
  Clock,
  User,
  Phone,
  RefreshCw,
  AlertCircle,
  ClipboardList,
  CheckCircle,
  Play,
} from "lucide-react";
import "./VolunteerVehicleBooking1.css";

const API_BASE = "http://localhost:8081/api";

export default function VolunteerVehicleBooking1() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  // Load all bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/volunteer-vehicle-bookings/all`
      );

      if (!response.ok) {
        throw new Error(`Unable to load bookings (${response.status})`);
      }

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError(err.message || "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Update booking status
  const updateBookingStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/volunteer-vehicle-bookings/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to update booking status.");
      }

      // Update the UI immediately after a successful response
      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        )
      );

      // Reload the list to reflect the backend's saved data
      await fetchBookings();
    } catch (err) {
      console.error("Update status error:", err);
      setError(
        err.message ||
          "Could not update status. Check your backend endpoint."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatus = (status) =>
    String(status || "PENDING").trim().toUpperCase();

  const counts = useMemo(() => {
    return {
      ALL: bookings.length,
      PENDING: bookings.filter(
        (booking) => getStatus(booking.status) === "PENDING"
      ).length,
      ACTIVE: bookings.filter(
        (booking) => getStatus(booking.status) === "ACTIVE"
      ).length,
      COMPLETED: bookings.filter(
        (booking) => getStatus(booking.status) === "COMPLETED"
      ).length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (filter === "ALL") return bookings;

    return bookings.filter(
      (booking) => getStatus(booking.status) === filter
    );
  }, [bookings, filter]);

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  };

  const getStatusClass = (status) => {
    const normalized = getStatus(status).toLowerCase();
    return `status-badge status-${normalized}`;
  };

  return (
    <div className="volunteer-bookings-page">
      <div className="bookings-header">
        <div className="bookings-heading">
          <div className="bookings-icon">
            <Truck size={26} />
          </div>

          <div>
            <h1>Vehicle Bookings</h1>
            <p>View bookings and update their status</p>
          </div>
        </div>

        <button
          className="refresh-bookings-btn"
          onClick={fetchBookings}
          disabled={loading || updatingId !== null}
        >
          <RefreshCw size={17} className={loading ? "spinning" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="booking-error">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      <div className="booking-stats">
        {[
          { key: "ALL", label: "All Bookings", icon: ClipboardList },
          { key: "PENDING", label: "Pending", icon: Clock },
          { key: "ACTIVE", label: "Active", icon: Play },
          { key: "COMPLETED", label: "Completed", icon: CheckCircle },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`booking-stat-card ${
              filter === key ? "selected" : ""
            }`}
            onClick={() => setFilter(key)}
          >
            <div className={`stat-icon stat-${key.toLowerCase()}`}>
              <Icon size={21} />
            </div>

            <div className="stat-details">
              <span>{label}</span>
              <strong>{counts[key]}</strong>
            </div>
          </button>
        ))}
      </div>

      <div className="booking-list-heading">
        <h2>
          {filter === "ALL"
            ? "All Bookings"
            : `${filter.charAt(0)}${filter.slice(1).toLowerCase()} Bookings`}
        </h2>
        <span>{filteredBookings.length} bookings</span>
      </div>

      {loading ? (
        <div className="booking-message">
          <RefreshCw size={25} className="spinning" />
          <p>Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="booking-message empty-bookings">
          <ClipboardList size={38} />
          <h3>No bookings found</h3>
          <p>There are no bookings in this category.</p>
        </div>
      ) : (
        <div className="booking-cards">
          {filteredBookings.map((booking) => {
            const status = getStatus(booking.status);
            const id = booking.id;

            return (
              <div className="vehicle-booking-card" key={id}>
                <div className="vehicle-booking-top">
                  <div className="booking-title">
                    <div className="booking-truck-icon">
                      <Truck size={22} />
                    </div>

                    <div>
                      <h3>Booking #{id ?? "N/A"}</h3>
                      <p>
                        {formatDate(
                          booking.createdAt ||
                            booking.bookingDate ||
                            booking.date
                        )}
                      </p>
                    </div>
                  </div>

                  <span className={getStatusClass(status)}>
                    {status}
                  </span>
                </div>

                <div className="booking-details-grid">
                  <div className="booking-detail">
                    <User size={17} />
                    <div>
                      <small>Citizen Name</small>
                      <strong>
                        {booking.citizenName ||
                          booking.name ||
                          "Not provided"}
                      </strong>
                    </div>
                  </div>

                  <div className="booking-detail">
                    <Phone size={17} />
                    <div>
                      <small>Mobile Number</small>
                      <strong>
                        {booking.mobile ||
                          booking.phone ||
                          "Not provided"}
                      </strong>
                    </div>
                  </div>

                  <div className="booking-detail">
                    <MapPin size={17} />
                    <div>
                      <small>Pickup Location</small>
                      <strong>
                        {booking.pickupLocation || "Not provided"}
                      </strong>
                    </div>
                  </div>

                  <div className="booking-detail">
                    <MapPin size={17} />
                    <div>
                      <small>Destination</small>
                      <strong>
                        {booking.destination || "Not provided"}
                      </strong>
                    </div>
                  </div>

                  <div className="booking-detail">
                    <Truck size={17} />
                    <div>
                      <small>Distance</small>
                      <strong>
                        {booking.distance !== null &&
                        booking.distance !== undefined
                          ? `${booking.distance} km`
                          : "Not provided"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="booking-card-footer">
                  <div className="booking-status-text">
                    <span>Status:</span>
                    <strong>{status}</strong>
                  </div>

                  <div className="booking-actions">
                    {status === "PENDING" && (
                      <button
                        className="booking-action-btn mark-active-btn"
                        onClick={() =>
                          updateBookingStatus(id, "ACTIVE")
                        }
                        disabled={updatingId === id}
                      >
                        {updatingId === id ? (
                          "Updating..."
                        ) : (
                          <>
                            <Play size={16} />
                            Mark Active
                          </>
                        )}
                      </button>
                    )}

                    {status === "ACTIVE" && (
                      <button
                        className="booking-action-btn mark-complete-btn"
                        onClick={() =>
                          updateBookingStatus(id, "COMPLETED")
                        }
                        disabled={updatingId === id}
                      >
                        {updatingId === id ? (
                          "Updating..."
                        ) : (
                          <>
                            <CheckCircle size={17} />
                            Mark Complete
                          </>
                        )}
                      </button>
                    )}

                    {status === "COMPLETED" && (
                      <span className="completed-text">
                        <CheckCircle size={17} />
                        Booking Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
