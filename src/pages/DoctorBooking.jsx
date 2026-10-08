
import React, { useEffect, useState } from "react";
import "./DoctorBooking.css";

const API_BASE = "http://localhost:8081/api/doctor-bookings";

const DoctorBooking = () => {
    const [doctors, setDoctors] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        patientName: localStorage.getItem("citizenName") || "",
        patientEmail: localStorage.getItem("citizenEmail") || "",
        patientPhone: localStorage.getItem("citizenPhone") || "",
        appointmentDate: "",
        appointmentTime: "",
        reason: ""
    });

    const loadDoctors = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE}/doctors`, {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error("Unable to load doctors");
            }

            const data = await response.json();
            console.log("All doctors received:", data);
            setDoctors(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadBookings = async () => {
        if (!form.patientEmail.trim()) {
            setBookings([]);
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE}/patient?email=${encodeURIComponent(form.patientEmail)}`
            );

            if (!response.ok) {
                throw new Error("Unable to load appointment history");
            }

            const data = await response.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, []);

    useEffect(() => {
        loadBookings();
    }, [form.patientEmail]);

    const updateForm = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const openBooking = (doctor) => {
        setMessage("");
        setError("");
        setSelectedDoctor(doctor);
    };

    const submitBooking = async (event) => {
        event.preventDefault();
        if (!selectedDoctor) return;

        setSubmitting(true);
        setMessage("");
        setError("");

        const payload = {
            doctorId: selectedDoctor.id,
            patientName: form.patientName.trim(),
            patientEmail: form.patientEmail.trim(),
            patientPhone: form.patientPhone.trim(),
            appointmentDate: form.appointmentDate,
            appointmentTime: form.appointmentTime,
            reason: form.reason.trim()
        };

        try {
            const response = await fetch(API_BASE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    result.message || "Appointment booking failed"
                );
            }

            setMessage("Appointment booked successfully!");
            setSelectedDoctor(null);
            setForm((previous) => ({
                ...previous,
                appointmentDate: "",
                appointmentTime: "",
                reason: ""
            }));

            await loadBookings();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const cancelBooking = async (booking) => {
        if (!window.confirm("Cancel this appointment?")) return;

        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API_BASE}/${booking.id}?patientEmail=${encodeURIComponent(form.patientEmail)}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                const result = await response.text();
                throw new Error(result || "Unable to cancel appointment");
            }

            setMessage("Appointment cancelled successfully.");
            await loadBookings();
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredDoctors = doctors.filter((doctor) => {
        const text = `${doctor.name || ""} ${doctor.specialization || ""} ${doctor.qualification || ""}`
            .toLowerCase();

        return text.includes(search.toLowerCase());
    });

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(`${date}T00:00:00`).toLocaleDateString();
    };

    return (
        <main className="doctor-booking-page">
            <header className="doctor-page-header">
                <div>
                    <span className="doctor-eyebrow">RESQNET HEALTHCARE</span>
                    <h1>Find a Doctor</h1>
                    <p>Browse doctors and book an appointment.</p>
                </div>

                <button className="refresh-doctors" onClick={loadDoctors}>
                    ↻ Refresh
                </button>
            </header>

            {message && <div className="doctor-alert success">{message}</div>}
            {error && <div className="doctor-alert danger">{error}</div>}

            <section className="doctor-search-section">
                <div>
                    <h2>Available Doctors</h2>
                    <p>
                        {loading
                            ? "Loading doctors..."
                            : `${filteredDoctors.length} doctor(s) found`}
                    </p>
                </div>

                <input
                    className="doctor-search"
                    type="search"
                    placeholder="Search name or specialization..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </section>

            {loading ? (
                <div className="doctor-empty">Loading doctors...</div>
            ) : filteredDoctors.length === 0 ? (
                <div className="doctor-empty">
                    No doctors found. Check the backend doctor API.
                </div>
            ) : (
                <section className="doctor-grid">
                    {filteredDoctors.map((doctor) => {
                        const available =
                            doctor.availability?.toLowerCase() === "available";

                        return (
                            <article className="doctor-card" key={doctor.id}>
                                <div className="doctor-card-top">
                                    <div className="doctor-avatar">
                                        {(doctor.name || "D")
                                            .trim()
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <span className={
                                        `doctor-status ${available ? "is-available" : "is-busy"}`
                                    }>
                                        {doctor.availability || "Unknown"}
                                    </span>
                                </div>

                                <h3>{doctor.name}</h3>
                                <p className="doctor-specialization">
                                    {doctor.specialization || "Specialization not specified"}
                                </p>

                                <div className="doctor-details">
                                    <p>
                                        <strong>Qualification:</strong>{" "}
                                        {doctor.qualification || "Not provided"}
                                    </p>
                                    <p>
                                        <strong>Experience:</strong>{" "}
                                        {doctor.experience ?? "—"} years
                                    </p>
                                    <p>
                                        <strong>Email:</strong>{" "}
                                        {doctor.email || "Not provided"}
                                    </p>
                                </div>

                                <button
                                    className="doctor-book-button"
                                    disabled={!available}
                                    onClick={() => openBooking(doctor)}
                                >
                                    {available ? "Book Appointment" : "Currently Busy"}
                                </button>
                            </article>
                        );
                    })}
                </section>
            )}

            <section className="appointment-history">
                <div className="history-heading">
                    <div>
                        <h2>My Appointments</h2>
                        <p>Your appointment booking history</p>
                    </div>
                    <button className="history-refresh" onClick={loadBookings}>
                        Refresh
                    </button>
                </div>

                {!form.patientEmail.trim() ? (
                    <div className="doctor-empty">
                        Sign in with your citizen account to view your appointments.
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="doctor-empty">
                        No appointments found.
                    </div>
                ) : (
                    <div className="appointment-list">
                        {bookings.map((booking) => {
                            const doctor = doctors.find(
                                (item) => item.id === booking.doctorId
                            );

                            return (
                                <article className="appointment-row" key={booking.id}>
                                    <div>
                                        <h3>
                                            {doctor?.name || `Doctor #${booking.doctorId}`}
                                        </h3>
                                        <p>
                                            {formatDate(booking.appointmentDate)}
                                            {" · "}
                                            {booking.appointmentTime}
                                        </p>
                                        <span className="appointment-status">
                                            {booking.status}
                                        </span>
                                    </div>

                                    {!["Cancelled", "Completed"].includes(
                                        booking.status
                                    ) && (
                                        <button
                                            className="cancel-appointment"
                                            onClick={() => cancelBooking(booking)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {selectedDoctor && (
                <div
                    className="doctor-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedDoctor(null);
                        }
                    }}
                >
                    <section
                        className="doctor-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="booking-title"
                    >
                        <button
                            className="doctor-modal-close"
                            type="button"
                            onClick={() => setSelectedDoctor(null)}
                            aria-label="Close"
                        >
                            ×
                        </button>

                        <span className="doctor-eyebrow">NEW APPOINTMENT</span>
                        <h2 id="booking-title">Book with {selectedDoctor.name}</h2>
                        <p className="modal-subtitle">
                            {selectedDoctor.specialization}
                        </p>

                        <form onSubmit={submitBooking} className="doctor-form">
                            <label>
                                Patient name
                                <input
                                    name="patientName"
                                    value={form.patientName}
                                    onChange={updateForm}
                                    required
                                />
                            </label>

                            <label>
                                Email
                                <input
                                    type="email"
                                    name="patientEmail"
                                    value={form.patientEmail}
                                    onChange={updateForm}
                                    required
                                />
                            </label>

                            <label>
                                Phone
                                <input
                                    type="tel"
                                    name="patientPhone"
                                    value={form.patientPhone}
                                    onChange={updateForm}
                                />
                            </label>

                            <div className="doctor-form-row">
                                <label>
                                    Appointment date
                                    <input
                                        type="date"
                                        name="appointmentDate"
                                        min={new Date().toISOString().slice(0, 10)}
                                        value={form.appointmentDate}
                                        onChange={updateForm}
                                        required
                                    />
                                </label>

                                <label>
                                    Appointment time
                                    <input
                                        type="time"
                                        name="appointmentTime"
                                        value={form.appointmentTime}
                                        onChange={updateForm}
                                        required
                                    />
                                </label>
                            </div>

                            <label>
                                Reason for appointment
                                <textarea
                                    name="reason"
                                    rows="3"
                                    value={form.reason}
                                    onChange={updateForm}
                                    placeholder="Describe your concern"
                                />
                            </label>

                            <button
                                className="doctor-book-button"
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? "Booking..." : "Confirm Appointment"}
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
};

export default DoctorBooking;
