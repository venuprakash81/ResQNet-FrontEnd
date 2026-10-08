
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalBeds.css";

const API = "https://resqnet-backend-1.onrender.com/api";

const initialForm = {
  bedType: "General",
  totalBeds: "",
  ward: "",
  status: "ACTIVE"
};

export default function HospitalBeds() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [hospitalId, setHospitalId] = useState("");
  const [beds, setBeds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("hospital");

    if (!stored) {
      navigate("/login/hospital", { replace: true });
      return;
    }

    try {
      const data = JSON.parse(stored);
      const id =
        data.id ??
        data.hospitalId ??
        data._id ??
        localStorage.getItem("hospitalId");

      if (!id) {
        setError("Hospital ID is missing. Please log in again.");
        return;
      }

      setHospital(data);
      setHospitalId(String(id));
    } catch {
      setError("Invalid hospital login data.");
    }
  }, [navigate]);

  const loadData = useCallback(async () => {
    if (!hospitalId) return;

    setLoading(true);
    setError("");

    try {
      const [bedResponse, bookingResponse] = await Promise.all([
        fetch(`${API}/beds/hospital/${encodeURIComponent(hospitalId)}`),
        fetch(`${API}/bed-bookings/hospital/${encodeURIComponent(hospitalId)}`)
      ]);

      if (!bedResponse.ok) {
        throw new Error("Could not load this hospital's beds.");
      }

      if (!bookingResponse.ok) {
        throw new Error("Could not load bed booking requests.");
      }

      const bedData = await bedResponse.json();
      const bookingData = await bookingResponse.json();

      setBeds(Array.isArray(bedData) ? bedData : []);
      setBookings(Array.isArray(bookingData) ? bookingData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    if (hospitalId) loadData();
  }, [hospitalId, loadData]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((old) => ({ ...old, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const total = Number(form.totalBeds);

    if (!form.bedType || !form.ward.trim() ||
        form.totalBeds === "" || !Number.isInteger(total) || total < 1) {
      setMessage("Enter a bed type, ward, and a valid total of at least 1.");
      return;
    }

    const existing = editingId
      ? beds.find((bed) => bed.id === editingId)
      : null;

    const occupied = existing ? Number(existing.occupiedBeds || 0) : 0;

    if (total < occupied) {
      setMessage(`Total beds cannot be less than the ${occupied} occupied beds.`);
      return;
    }

    const payload = {
      hospitalId: Number(hospitalId),
      bedType: form.bedType,
      ward: form.ward.trim(),
      totalBeds: total,
      occupiedBeds: occupied,
      availableBeds: total - occupied,
      status: form.status.toUpperCase()
    };

    setSaving(true);

    try {
      const url = editingId
        ? `${API}/beds/${editingId}`
        : `${API}/beds`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Unable to save bed.");
      }

      await loadData();
      resetForm();
      setMessage(editingId ? "Bed record updated." : "Bed record added.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (bed) => {
    setEditingId(bed.id);
    setForm({
      bedType: bed.bedType || "General",
      totalBeds: String(bed.totalBeds ?? ""),
      ward: bed.ward || "",
      status: (bed.status || "ACTIVE").toUpperCase()
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bed record?")) return;

    setMessage("");

    try {
      const response = await fetch(`${API}/beds/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Unable to delete bed.");
      }

      if (editingId === id) resetForm();
      await loadData();
      setMessage("Bed record deleted.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const updateBooking = async (bookingId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this booking?`)) return;

    setMessage("");

    try {
      const response = await fetch(
        `${API}/bed-bookings/${bookingId}/${action}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error(await response.text() || "Unable to update booking.");
      }

      await loadData();
      setMessage(`Booking ${action}ed successfully.`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const totalBeds = beds.reduce((sum, bed) => sum + Number(bed.totalBeds || 0), 0);
  const availableBeds = beds.reduce((sum, bed) => sum + Number(bed.availableBeds || 0), 0);
  const occupiedBeds = beds.reduce((sum, bed) => sum + Number(bed.occupiedBeds || 0), 0);
  const pendingBookings = bookings.filter(
    (booking) => booking.status?.toUpperCase() === "PENDING"
  );

  const hospitalName = hospital?.name || hospital?.hospitalName || "Hospital";

  if (!hospitalId) {
    return <div className="hb-page"><p>{error || "Checking hospital login..."}</p></div>;
  }

  return (
    <div className="hb-page">
      <header className="hb-header">
        <div>
          <h1>ResQNet | Bed Management</h1>
          <p>{hospitalName} · Hospital ID: {hospitalId}</p>
        </div>
        <div className="hb-header-actions">
          <button onClick={() => navigate("/hospital/dashboard")}>Dashboard</button>
          <button onClick={loadData}>Refresh</button>
        </div>
      </header>

      <main className="hb-main">
        <div className="hb-title">
          <h2>Hospital Bed Inventory</h2>
          <p>Add and update beds and respond to citizen requests.</p>
        </div>

        <div className="hb-stats">
          <div><span>Total Beds</span><strong>{totalBeds}</strong></div>
          <div><span>Available Beds</span><strong>{availableBeds}</strong></div>
          <div><span>Occupied Beds</span><strong>{occupiedBeds}</strong></div>
          <div><span>Pending Requests</span><strong>{pendingBookings.length}</strong></div>
        </div>

        {message && <div className="hb-message">{message}</div>}
        {error && <div className="hb-error">{error}</div>}

        <section className="hb-panel">
          <h2>{editingId ? "Update Bed Record" : "Add Beds to Your Hospital"}</h2>
          <form className="hb-form" onSubmit={handleSubmit}>
            <label>
              Bed Type
              <select name="bedType" value={form.bedType} onChange={handleChange}>
                {["General", "ICU", "Emergency", "Private", "Semi-Private", "Pediatric", "Maternity"].map((type) =>
                  <option key={type} value={type}>{type}</option>
                )}
              </select>
            </label>

            <label>
              Ward
              <input name="ward" value={form.ward} onChange={handleChange}
                placeholder="Example: A Block" required />
            </label>

            <label>
              Total Beds
              <input name="totalBeds" type="number" min="1"
                value={form.totalBeds} onChange={handleChange} required />
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>

            <div className="hb-form-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Bed" : "Add Bed"}
              </button>
              {editingId && <button type="button" className="hb-secondary" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
          <p className="hb-note">
            Available beds are calculated as total beds minus occupied beds.
            Pending requests do not occupy beds until confirmed.
          </p>
        </section>

        <section className="hb-panel">
          <div className="hb-section-heading">
            <div>
              <h2>Your Bed Records</h2>
              <p>Only beds belonging to this hospital are shown.</p>
            </div>
          </div>

          {loading ? <p>Loading beds...</p> : beds.length === 0 ? (
            <p className="hb-empty">No bed records yet. Add beds using the form above.</p>
          ) : (
            <div className="hb-table-wrap">
              <table className="hb-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Type</th><th>Ward</th>
                    <th>Total</th><th>Available</th><th>Occupied</th>
                    <th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {beds.map((bed) => (
                    <tr key={bed.id}>
                      <td>{bed.id}</td>
                      <td>{bed.bedType}</td>
                      <td>{bed.ward}</td>
                      <td>{bed.totalBeds}</td>
                      <td>{bed.availableBeds}</td>
                      <td>{bed.occupiedBeds}</td>
                      <td>
                        <span className={`hb-status ${bed.status?.toLowerCase()}`}>
                          {bed.status}
                        </span>
                      </td>
                      <td>
                        <div className="hb-row-actions">
                          <button className="hb-edit" onClick={() => handleEdit(bed)}>Edit</button>
                          <button className="hb-delete" onClick={() => handleDelete(bed.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="hb-panel">
          <div className="hb-section-heading">
            <div>
              <h2>Citizen Bed Booking Requests</h2>
              <p>Confirm or reject requests for your hospital.</p>
            </div>
          </div>

          {loading ? <p>Loading requests...</p> : bookings.length === 0 ? (
            <p className="hb-empty">No booking requests found.</p>
          ) : (
            <div className="hb-table-wrap">
              <table className="hb-table">
                <thead>
                  <tr>
                    <th>Patient</th><th>Email</th><th>Phone</th>
                    <th>Age</th><th>Bed Type</th><th>Reason</th>
                    <th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const pending = booking.status?.toUpperCase() === "PENDING";
                    return (
                      <tr key={booking.id}>
                        <td>{booking.patientName}</td>
                        <td>{booking.citizenEmail}</td>
                        <td>{booking.phone}</td>
                        <td>{booking.patientAge}</td>
                        <td>{booking.bedType}</td>
                        <td>{booking.reason}</td>
                        <td>
                          <span className={`hb-status ${booking.status?.toLowerCase()}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          {pending ? (
                            <div className="hb-row-actions">
                              <button className="hb-edit"
                                onClick={() => updateBooking(booking.id, "confirm")}>
                                Confirm
                              </button>
                              <button className="hb-delete"
                                onClick={() => updateBooking(booking.id, "reject")}>
                                Reject
                              </button>
                            </div>
                          ) : <span>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
