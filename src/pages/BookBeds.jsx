
import React, { useEffect, useState } from "react";
import "./BookBeds.css";

const API = "http://localhost:8081/api";

const emptyForm = {
  patientName: "",
  citizenEmail: "",
  phone: "",
  patientAge: "",
  gender: "",
  reason: ""
};

function BookBeds() {
  const citizen = JSON.parse(localStorage.getItem("citizen") || "{}");
  const citizenEmail = citizen.email || citizen.citizenEmail || "";

  const [beds, setBeds] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [form, setForm] = useState({
    ...emptyForm,
    patientName: citizen.name || citizen.fullName || "",
    citizenEmail,
    phone: citizen.phone || ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    setLoading(true);
    setError("");

    try {
      const [bedsRes, hospitalsRes] = await Promise.all([
        fetch(`${API}/beds/available`),
        fetch(`${API}/hospitals`)
      ]);

      if (!bedsRes.ok) throw new Error("Could not load available beds.");

      const bedsData = await bedsRes.json();
      const hospitalsData = hospitalsRes.ok
        ? await hospitalsRes.json()
        : [];

      setBeds(Array.isArray(bedsData) ? bedsData : []);
      setHospitals(Array.isArray(hospitalsData) ? hospitalsData : []);

      if (citizenEmail) {
        await loadBookings(citizenEmail);
      }
    } catch (err) {
      setError(err.message || "Unable to load page data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadBookings(email = citizenEmail) {
    if (!email) {
      setBookings([]);
      return;
    }

    const response = await fetch(
      `${API}/bed-bookings/citizen/${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      throw new Error("Could not load your bookings.");
    }

    const data = await response.json();
    setBookings(Array.isArray(data) ? data : []);
  }

  async function refreshBeds() {
    const response = await fetch(`${API}/beds/available`);
    if (!response.ok) return;
    const data = await response.json();
    setBeds(Array.isArray(data) ? data : []);
  }

  function hospitalName(hospitalId) {
    const hospital = hospitals.find(
      (item) =>
        String(item.id ?? item.hospitalId) === String(hospitalId)
    );

    return (
      hospital?.hospitalName ||
      hospital?.name ||
      hospital?.nameOfHospital ||
      `Hospital #${hospitalId}`
    );
  }

  function openNewBooking(bed) {
    setSelectedBed(bed);
    setEditingBooking(null);
    setForm({
      ...emptyForm,
      patientName: citizen.name || citizen.fullName || "",
      citizenEmail,
      phone: citizen.phone || ""
    });
    setError("");
    setSuccess("");
  }

  function openEditBooking(booking) {
    setSelectedBed(null);
    setEditingBooking(booking);
    setForm({
      patientName: booking.patientName || "",
      citizenEmail: booking.citizenEmail || citizenEmail,
      phone: booking.phone || "",
      patientAge: booking.patientAge ?? "",
      gender: booking.gender || "",
      reason: booking.reason || ""
    });
    setError("");
    setSuccess("");
  }

  function closeModal() {
    setSelectedBed(null);
    setEditingBooking(null);
    setError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function submitNewBooking(event) {
    event.preventDefault();
    if (!selectedBed) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      hospitalId: selectedBed.hospitalId,
      bedId: selectedBed.id,
      patientName: form.patientName.trim(),
      citizenEmail: form.citizenEmail.trim(),
      phone: form.phone.trim(),
      patientAge: Number(form.patientAge),
      gender: form.gender,
      bedType: selectedBed.bedType,
      reason: form.reason.trim()
    };

    try {
      const response = await fetch(`${API}/bed-bookings/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || data.error || "Booking failed.");
      }

      closeModal();
      setSuccess("Booking request submitted successfully.");
      await Promise.all([loadBookings(form.citizenEmail), refreshBeds()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateBooking(event) {
    event.preventDefault();
    if (!editingBooking) return;

    const bookingId = editingBooking.id ?? editingBooking.bookingId;
    if (!bookingId) {
      setError("Booking ID is missing.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      patientName: form.patientName.trim(),
      citizenEmail: form.citizenEmail.trim(),
      phone: form.phone.trim(),
      patientAge: Number(form.patientAge),
      gender: form.gender,
      reason: form.reason.trim()
    };

    try {
      // Requires PUT /api/bed-bookings/{bookingId} in the backend.
      const response = await fetch(`${API}/bed-bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Could not update booking. Check that the backend PUT endpoint exists."
        );
      }

      closeModal();
      setSuccess("Booking updated successfully.");
      await loadBookings(form.citizenEmail);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteBooking(booking) {
    const bookingId = booking.id ?? booking.bookingId;
    if (!bookingId) {
      setError("Booking ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Delete booking for ${booking.patientName || "this patient"}?`
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      // Requires DELETE /api/bed-bookings/{bookingId} in the backend.
      const response = await fetch(`${API}/bed-bookings/${bookingId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.message ||
          data.error ||
          "Could not delete booking. Check that the backend DELETE endpoint exists."
        );
      }

      setSuccess("Booking deleted successfully.");
      await Promise.all([loadBookings(), refreshBeds()]);
    } catch (err) {
      setError(err.message);
    }
  }

  function statusClass(status) {
    return String(status || "PENDING").toLowerCase();
  }

  const modalOpen = Boolean(selectedBed || editingBooking);

  return (
    <main className="citizen-bed-page">
      <header className="bed-page-header">
        <div>
          <p className="bed-eyebrow">RESQNET HEALTHCARE</p>
          <h1>Hospital Bed Booking</h1>
          <p className="bed-subtitle">
            Find available hospital beds and manage your booking requests.
          </p>
        </div>
        <button className="refresh-button" onClick={loadPageData}>
          Refresh
        </button>
      </header>

      {error && !modalOpen && <div className="bed-alert error">{error}</div>}
      {success && <div className="bed-alert success">{success}</div>}

      <section className="available-beds-section">
        <div className="section-heading">
          <div>
            <h2>Available Beds</h2>
            <p>Select a bed to send a booking request.</p>
          </div>
          <span className="result-count">{beds.length} beds listed</span>
        </div>

        {loading ? (
          <div className="empty-state">Loading available beds...</div>
        ) : beds.filter(
          (bed) =>
            String(bed.status || "ACTIVE").toUpperCase() === "ACTIVE" &&
            Number(bed.availableBeds) > 0
        ).length === 0 ? (
          <div className="empty-state">No available beds at the moment.</div>
        ) : (
          <div className="available-bed-grid">
            {beds
              .filter(
                (bed) =>
                  String(bed.status || "ACTIVE").toUpperCase() === "ACTIVE" &&
                  Number(bed.availableBeds) > 0
              )
              .map((bed) => (
                <article className="available-bed-card" key={bed.id}>
                  <div className="bed-card-icon">✚</div>
                  <div className="bed-card-content">
                    <span className="available-label">AVAILABLE</span>
                    <h3>{hospitalName(bed.hospitalId)}</h3>
                    <p className="bed-type">{bed.bedType || "General"} Bed</p>

                    <div className="bed-info">
                      <span>
                        <strong>Ward</strong>
                        {bed.ward || "Not specified"}
                      </span>
                      <span>
                        <strong>Available</strong>
                        {bed.availableBeds}
                      </span>
                      <span>
                        <strong>Total beds</strong>
                        {bed.totalBeds ?? "—"}
                      </span>
                    </div>

                    <button
                      className="book-bed-button"
                      onClick={() => openNewBooking(bed)}
                    >
                      Book Bed
                    </button>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>

      {/* My Bookings is intentionally placed below the available beds. */}
      <section className="my-bookings-section">
        <div className="section-heading">
          <div>
            <h2>My Bookings</h2>
            <p>View, edit, or delete your bed booking requests.</p>
          </div>
          <button
            className="refresh-button"
            onClick={() => loadBookings()}
          >
            Refresh Bookings
          </button>
        </div>

        {!citizenEmail ? (
          <div className="empty-state">
            Please log in as a citizen to view your bookings.
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            You have no bookings yet. Choose an available bed above to book.
          </div>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => {
              const bookingId = booking.id ?? booking.bookingId;
              const status = String(booking.status || "PENDING").toUpperCase();
              const canEdit = status === "PENDING";

              return (
                <article className="my-booking-card" key={bookingId}>
                  <div className="booking-card-top">
                    <div>
                      <h3>{booking.patientName || "Patient"}</h3>
                      <p>{hospitalName(booking.hospitalId)}</p>
                    </div>
                    <span className={`booking-status ${statusClass(status)}`}>
                      {status}
                    </span>
                  </div>

                  <div className="booking-details">
                    <span><strong>Booking ID:</strong> {bookingId}</span>
                    <span><strong>Bed type:</strong> {booking.bedType || "—"}</span>
                    <span><strong>Age:</strong> {booking.patientAge ?? "—"}</span>
                    <span><strong>Gender:</strong> {booking.gender || "—"}</span>
                    <span><strong>Phone:</strong> {booking.phone || "—"}</span>
                    <span>
                      <strong>Date:</strong>{" "}
                      {booking.bookingDate
                        ? new Date(booking.bookingDate).toLocaleString()
                        : "—"}
                    </span>
                  </div>

                  {booking.reason && (
                    <p className="booking-reason">
                      <strong>Reason:</strong> {booking.reason}
                    </p>
                  )}

                  <div className="booking-actions">
                    <button
                      className="edit-booking-button"
                      onClick={() => openEditBooking(booking)}
                      disabled={!canEdit}
                      title={!canEdit ? "Only pending bookings can be edited" : ""}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-booking-button"
                      onClick={() => deleteBooking(booking)}
                    >
                      Delete
                    </button>
                  </div>

                  {!canEdit && (
                    <p className="edit-note">
                      Editing is available only while a booking is pending.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="bed-modal-overlay" onClick={closeModal}>
          <div
            className="bed-booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bed-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="bed-eyebrow">
                  {editingBooking ? "EDIT REQUEST" : "NEW REQUEST"}
                </p>
                <h2 id="bed-modal-title">
                  {editingBooking ? "Edit Booking" : "Book a Hospital Bed"}
                </h2>
              </div>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {selectedBed && (
              <div className="selected-bed-summary">
                <strong>{hospitalName(selectedBed.hospitalId)}</strong>
                <span>
                  {selectedBed.bedType || "General"} Bed · Ward{" "}
                  {selectedBed.ward || "—"}
                </span>
                <span>{selectedBed.availableBeds} bed(s) available</span>
              </div>
            )}

            {editingBooking && (
              <div className="selected-bed-summary">
                <strong>{hospitalName(editingBooking.hospitalId)}</strong>
                <span>Booking #{editingBooking.id ?? editingBooking.bookingId}</span>
              </div>
            )}

            <form
              className="bed-booking-form"
              onSubmit={editingBooking ? updateBooking : submitNewBooking}
            >
              <label>
                Patient name
                <input
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  required
                  placeholder="Enter patient name"
                />
              </label>

              <label>
                Citizen email
                <input
                  type="email"
                  name="citizenEmail"
                  value={form.citizenEmail}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  disabled={Boolean(editingBooking)}
                />
              </label>

              <div className="form-row">
                <label>
                  Phone number
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="Phone number"
                  />
                </label>

                <label>
                  Patient age
                  <input
                    type="number"
                    name="patientAge"
                    min="0"
                    max="120"
                    value={form.patientAge}
                    onChange={handleChange}
                    required
                    placeholder="Age"
                  />
                </label>
              </div>

              <label>
                Gender
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Reason for booking
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  rows="3"
                  required
                  placeholder="Describe the reason"
                />
              </label>

              {error && <div className="bed-alert error">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-booking-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="book-bed-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingBooking
                    ? "Save Changes"
                    : "Submit Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default BookBeds;
