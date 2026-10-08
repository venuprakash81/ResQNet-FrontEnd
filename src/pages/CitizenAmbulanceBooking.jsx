
import React, { useEffect, useState } from "react";
import "./CitizenAmbulanceBooking.css";

const API = "http://localhost:8081/api";

function CitizenAmbulanceBooking() {
  const citizen = JSON.parse(localStorage.getItem("citizen") || "{}");
  const email = citizen.email || citizen.citizenEmail || "";

  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    citizenName: citizen.name || citizen.fullName || "",
    citizenEmail: email,
    citizenPhone: citizen.phone || "",
    pickupLocation: "",
    destination: "",
    emergencyType: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    setError("");

    try {
      const [ambulanceRes, hospitalRes] = await Promise.all([
        fetch(`${API}/hospitals/ambulances/all`),
        fetch(`${API}/hospitals`)
      ]);

      if (!ambulanceRes.ok) {
        throw new Error(
          "Could not load ambulances. Check the ambulance list endpoint."
        );
      }

      const ambulanceData = await ambulanceRes.json();
      const hospitalData = hospitalRes.ok
        ? await hospitalRes.json()
        : [];

      setAmbulances(Array.isArray(ambulanceData) ? ambulanceData : []);
      setHospitals(Array.isArray(hospitalData) ? hospitalData : []);

      if (email) await loadBookings(email);
    } catch (err) {
      setError(err.message || "Unable to load ambulance information.");
    } finally {
      setLoading(false);
    }
  }

  async function loadBookings(userEmail = email) {
    if (!userEmail) {
      setBookings([]);
      return;
    }

    const response = await fetch(
      `${API}/ambulance-bookings/citizen/${encodeURIComponent(userEmail)}`
    );

    if (!response.ok) throw new Error("Could not load your bookings.");

    const data = await response.json();
    setBookings(Array.isArray(data) ? data : []);
  }

  function hospitalName(id) {
    const hospital = hospitals.find(
      (item) => String(item.id ?? item.hospitalId) === String(id)
    );

    return (
      hospital?.hospitalName ||
      hospital?.name ||
      hospital?.nameOfHospital ||
      `Hospital #${id}`
    );
  }

  function openBooking(ambulance) {
    setSelected(ambulance);
    setForm({
      citizenName: citizen.name || citizen.fullName || "",
      citizenEmail: email,
      citizenPhone: citizen.phone || "",
      pickupLocation: "",
      destination: "",
      emergencyType: ""
    });
    setError("");
    setSuccess("");
  }

  function closeBooking() {
    setSelected(null);
    setError("");
  }

  function changeForm(event) {
    setForm((old) => ({
      ...old,
      [event.target.name]: event.target.value
    }));
  }

  async function submitBooking(event) {
    event.preventDefault();
    if (!selected) return;

    if (!form.citizenEmail.trim()) {
      setError("Please log in as a citizen before booking.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      hospitalId: selected.hospitalId,
      ambulanceId: selected.id,
      citizenName: form.citizenName.trim(),
      citizenEmail: form.citizenEmail.trim(),
      citizenPhone: form.citizenPhone.trim(),
      pickupLocation: form.pickupLocation.trim(),
      destination: form.destination.trim(),
      emergencyType: form.emergencyType.trim()
    };

    try {
      const response = await fetch(`${API}/ambulance-bookings/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Ambulance booking failed.");
      }

      setSelected(null);
      setSuccess("Your ambulance booking request has been submitted.");
      await Promise.all([loadBookings(form.citizenEmail), loadAmbulances()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function loadAmbulances() {
    const response = await fetch(`${API}/hospitals/ambulances/all`);
    if (!response.ok) return;
    const data = await response.json();
    setAmbulances(Array.isArray(data) ? data : []);
  }

  async function deleteBooking(booking) {
    const id = booking.id;
    if (!id) return;

    if (!window.confirm("Delete this ambulance booking request?")) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API}/ambulance-bookings/${id}/citizen/${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Could not delete booking.");
      }

      setSuccess("Booking deleted successfully.");
      await loadBookings();
    } catch (err) {
      setError(err.message);
    }
  }

  function statusClass(status) {
    return String(status || "PENDING").toLowerCase();
  }

  const availableAmbulances = ambulances.filter(
    (item) =>
      String(item.status || "Active").toLowerCase() === "active" &&
      Number(item.availableAmbulances) > 0
  );

  return (
    <main className="citizen-ambulance-page">
      <header className="citizen-ambulance-header">
        <div>
          <p className="citizen-ambulance-eyebrow">RESQNET EMERGENCY SERVICES</p>
          <h1>Book an Ambulance</h1>
          <p>Find available hospital ambulances and request emergency transport.</p>
        </div>
        <button className="ambulance-refresh" onClick={loadPage}>
          Refresh
        </button>
      </header>

      {error && !selected && <div className="ambulance-alert error">{error}</div>}
      {success && <div className="ambulance-alert success">{success}</div>}

      <section className="citizen-ambulance-section">
        <div className="citizen-ambulance-section-title">
          <div>
            <h2>Available Ambulances</h2>
            <p>Choose an ambulance from a hospital.</p>
          </div>
          <span>{availableAmbulances.length} available</span>
        </div>

        {loading ? (
          <div className="ambulance-empty">Loading ambulances...</div>
        ) : availableAmbulances.length === 0 ? (
          <div className="ambulance-empty">
            No ambulances are currently available.
          </div>
        ) : (
          <div className="citizen-ambulance-grid">
            {availableAmbulances.map((ambulance) => (
              <article className="citizen-ambulance-card" key={ambulance.id}>
                <div className="ambulance-card-top">
                  <div className="ambulance-icon">🚑</div>
                  <span className="ambulance-available-tag">AVAILABLE</span>
                </div>

                <h3>{hospitalName(ambulance.hospitalId)}</h3>
                <p className="ambulance-type">
                  {ambulance.ambulanceType || "Ambulance"}
                </p>

                <div className="citizen-ambulance-details">
                  <div>
                    <span>Vehicle number</span>
                    <strong>{ambulance.ambulanceNumber || "—"}</strong>
                  </div>
                  <div>
                    <span>Driver</span>
                    <strong>{ambulance.driverName || "—"}</strong>
                  </div>
                  <div>
                    <span>Driver phone</span>
                    <strong>{ambulance.driverPhone || "—"}</strong>
                  </div>
                  <div>
                    <span>Available units</span>
                    <strong>{ambulance.availableAmbulances}</strong>
                  </div>
                </div>

                <button
                  className="citizen-book-ambulance-button"
                  onClick={() => openBooking(ambulance)}
                >
                  Book Ambulance
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="citizen-my-ambulance-bookings">
        <div className="citizen-ambulance-section-title">
          <div>
            <h2>My Ambulance Bookings</h2>
            <p>Track the status of your requests.</p>
          </div>
          <button
            className="ambulance-refresh"
            onClick={() => loadBookings()}
          >
            Refresh Bookings
          </button>
        </div>

        {!email ? (
          <div className="ambulance-empty">
            Please log in as a citizen to view your bookings.
          </div>
        ) : bookings.length === 0 ? (
          <div className="ambulance-empty">
            You have not made any ambulance bookings yet.
          </div>
        ) : (
          <div className="citizen-my-booking-list">
            {bookings.map((booking) => (
              <article className="citizen-my-booking-card" key={booking.id}>
                <div className="citizen-my-booking-top">
                  <div>
                    <h3>{hospitalName(booking.hospitalId)}</h3>
                    <p>Booking #{booking.id}</p>
                  </div>
                  <span className={`ambulance-booking-status ${statusClass(booking.status)}`}>
                    {booking.status || "PENDING"}
                  </span>
                </div>

                <div className="citizen-my-booking-details">
                  <p><strong>Patient:</strong> {booking.citizenName}</p>
                  <p><strong>Phone:</strong> {booking.citizenPhone}</p>
                  <p><strong>Pickup:</strong> {booking.pickupLocation}</p>
                  <p><strong>Destination:</strong> {booking.destination}</p>
                  <p><strong>Emergency:</strong> {booking.emergencyType || "—"}</p>
                  <p>
                    <strong>Requested:</strong>{" "}
                    {booking.bookingTime
                      ? new Date(booking.bookingTime).toLocaleString()
                      : "—"}
                  </p>
                </div>

                {["PENDING", "REJECTED"].includes(
                  String(booking.status || "").toUpperCase()
                ) && (
                  <div className="citizen-booking-actions">
                    <button
                      className="citizen-delete-ambulance-booking"
                      onClick={() => deleteBooking(booking)}
                    >
                      Delete Request
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="ambulance-modal-overlay" onClick={closeBooking}>
          <div
            className="ambulance-booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ambulance-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ambulance-modal-header">
              <div>
                <p className="citizen-ambulance-eyebrow">NEW REQUEST</p>
                <h2 id="ambulance-modal-title">Ambulance Booking</h2>
              </div>
              <button className="ambulance-modal-close" onClick={closeBooking}>
                ×
              </button>
            </div>

            <div className="ambulance-selected-summary">
              <strong>{hospitalName(selected.hospitalId)}</strong>
              <span>{selected.ambulanceType || "Ambulance"}</span>
              <span>Vehicle: {selected.ambulanceNumber || "—"}</span>
            </div>

            <form className="ambulance-booking-form" onSubmit={submitBooking}>
              <label>
                Citizen / Patient name
                <input
                  name="citizenName"
                  value={form.citizenName}
                  onChange={changeForm}
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="citizenEmail"
                  value={form.citizenEmail}
                  onChange={changeForm}
                  required
                  disabled={Boolean(email)}
                />
              </label>

              <label>
                Phone number
                <input
                  name="citizenPhone"
                  value={form.citizenPhone}
                  onChange={changeForm}
                  required
                />
              </label>

              <label>
                Pickup location
                <textarea
                  name="pickupLocation"
                  value={form.pickupLocation}
                  onChange={changeForm}
                  rows="2"
                  required
                  placeholder="Enter pickup address or location"
                />
              </label>

              <label>
                Destination
                <textarea
                  name="destination"
                  value={form.destination}
                  onChange={changeForm}
                  rows="2"
                  required
                  placeholder="Enter destination hospital or address"
                />
              </label>

              <label>
                Emergency type
                <select
                  name="emergencyType"
                  value={form.emergencyType}
                  onChange={changeForm}
                  required
                >
                  <option value="">Select emergency type</option>
                  <option value="Medical emergency">Medical emergency</option>
                  <option value="Accident">Accident</option>
                  <option value="Patient transfer">Patient transfer</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              {error && <div className="ambulance-alert error">{error}</div>}

              <div className="ambulance-modal-actions">
                <button
                  type="button"
                  className="ambulance-cancel-button"
                  onClick={closeBooking}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="citizen-book-ambulance-button"
                  disabled={saving}
                >
                  {saving ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default CitizenAmbulanceBooking;
