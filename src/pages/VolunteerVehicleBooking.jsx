import React, { useCallback, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  Truck,
  MapPin,
  Navigation,
  Clock,
  User,
  Phone,
  Mail,
  Route,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  LocateFixed,
  Pencil,
  Trash2,
} from "lucide-react";

import "leaflet/dist/leaflet.css";
import "./VolunteerVehicleBooking.css";

const API_BASE = "https://resqnet-backend-1.onrender.com/api";

const defaultCenter = [17.385, 78.4867];

const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const initialForm = {
  citizenName: "",
  mobile: "",
  pickupLocation: "",
  destination: "",
  distance: "",
};

function getCitizenDetails() {
  const stores = [localStorage, sessionStorage];

  let citizen = {};

  for (const store of stores) {
    try {
      const savedCitizen = store.getItem("citizen");

      if (savedCitizen) {
        const parsed = JSON.parse(savedCitizen);

        if (parsed && typeof parsed === "object") {
          citizen = { ...citizen, ...parsed };
        }
      }
    } catch (error) {
      console.error("Could not read saved citizen details:", error);
    }
  }

  const readValue = (keys) => {
    for (const store of stores) {
      for (const key of keys) {
        const value = store.getItem(key);

        if (value && value.trim()) {
          return value.trim();
        }
      }
    }

    return "";
  };

  return {
    ...citizen,
    email:
      citizen.email ||
      citizen.citizenEmail ||
      readValue(["citizenEmail", "email", "userEmail"]),
    name:
      citizen.citizenName ||
      citizen.name ||
      readValue(["citizenName", "userName", "name"]),
    mobile:
      citizen.mobileNumber ||
      citizen.mobile ||
      citizen.phone ||
      readValue(["mobileNumber", "mobile", "phone"]),
  };
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function calculateDistance(point1, point2) {
  if (!point1 || !point2) return "";

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadius = 6371;

  const lat1 = toRadians(point1[0]);
  const lat2 = toRadians(point2[0]);
  const deltaLat = toRadians(point2[0] - point1[0]);
  const deltaLng = toRadians(point2[1] - point1[1]);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return (earthRadius * c).toFixed(2);
}

function getCoordinates(booking, type) {
  const isPickup = type === "pickup";

  const latitude = isPickup
    ? booking.pickupLatitude
    : booking.destinationLatitude;

  const longitude = isPickup
    ? booking.pickupLongitude
    : booking.destinationLongitude;

  if (latitude == null || longitude == null) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return [lat, lng];
}

function VolunteerVehicleBooking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [notice, setNotice] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState(initialForm);
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapSelection, setMapSelection] = useState("pickup");

  const citizen = getCitizenDetails();
  const email = citizen.email;

  const showNotice = useCallback((type, message) => {
    setNotice({ type, message });
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!email) {
      setBookings([]);
      setLoading(false);
      setNotice({
        type: "error",
        message:
          "Citizen email not found. Please sign in again.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/volunteer-vehicle-bookings/email/${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        throw new Error(
          `Could not load bookings. Server returned ${response.status}.`
        );
      }

      const data = await response.json();

      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotice("error", error.message || "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, [email, showNotice]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (!pickup || !destination) {
      setForm((previous) => ({
        ...previous,
        distance: "",
      }));
      return;
    }

    setForm((previous) => ({
      ...previous,
      distance: calculateDistance(pickup, destination),
    }));
  }, [pickup, destination]);

  const openBookingModal = (booking = null) => {
    setNotice({ type: "", message: "" });
    setEditingBooking(booking);

    if (booking) {
      const pickupPoint = getCoordinates(booking, "pickup");
      const destinationPoint = getCoordinates(booking, "destination");

      setPickup(pickupPoint);
      setDestination(destinationPoint);

      setForm({
        citizenName:
          booking.citizenName || citizen.name || "",
        mobile:
          booking.mobileNumber ||
          booking.mobile ||
          citizen.mobile ||
          "",
        pickupLocation:
          booking.fromAddress ||
          booking.pickupLocation ||
          "",
        destination:
          booking.destinationAddress ||
          booking.destination ||
          "",
        distance:
          booking.distanceKm ?? booking.distance ?? "",
      });

      setMapCenter(
        pickupPoint || destinationPoint || defaultCenter
      );
    } else {
      setForm({
        ...initialForm,
        citizenName: citizen.name || "",
        mobile: citizen.mobile || "",
      });

      setPickup(null);
      setDestination(null);
      setMapCenter(defaultCenter);
    }

    setMapSelection("pickup");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingBooking(null);
    setForm(initialForm);
    setPickup(null);
    setDestination(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleMapClick = (point) => {
    const coordinates = `${point[0].toFixed(5)}, ${point[1].toFixed(5)}`;

    if (mapSelection === "pickup") {
      setPickup(point);

      setForm((previous) => ({
        ...previous,
        pickupLocation: `Location (${coordinates})`,
      }));
    } else {
      setDestination(point);

      setForm((previous) => ({
        ...previous,
        destination: `Location (${coordinates})`,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      showNotice("error", "Please sign in before booking.");
      return;
    }

    if (!pickup || !destination) {
      showNotice(
        "error",
        "Select both pickup and destination points on the map."
      );
      return;
    }

    if (
      !form.citizenName.trim() ||
      !form.mobile.trim() ||
      !form.pickupLocation.trim() ||
      !form.destination.trim()
    ) {
      showNotice("error", "Please complete all required fields.");
      return;
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(form.mobile.trim())) {
      showNotice("error", "Please enter a valid mobile number.");
      return;
    }

    const distance = Number(calculateDistance(pickup, destination));

    if (distance <= 0) {
      showNotice(
        "error",
        "Pickup and destination must be different locations."
      );
      return;
    }

    // These names match the backend fields described for ResQNet.
    const payload = {
      citizenName: form.citizenName.trim(),
      mobileNumber: form.mobile.trim(),
      email,
      vehicleType: "Volunteer Van",
      fromAddress: form.pickupLocation.trim(),
      destinationAddress: form.destination.trim(),
      pickupLatitude: pickup[0],
      pickupLongitude: pickup[1],
      destinationLatitude: destination[0],
      destinationLongitude: destination[1],
      distanceKm: distance,
    };

    setSaving(true);

    try {
      const isEditing = Boolean(editingBooking);

      const url = isEditing
        ? `${API_BASE}/volunteer-vehicle-bookings/${editingBooking.id}`
        : `${API_BASE}/volunteer-vehicle-bookings`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") ||
          localStorage.getItem("citizenToken")
            ? {
                Authorization: `Bearer ${
                  localStorage.getItem("token") ||
                  localStorage.getItem("citizenToken")
                }`,
              }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText ||
            `Booking ${isEditing ? "update" : "creation"} failed (${response.status}).`
        );
      }

      setModalOpen(false);
      setEditingBooking(null);
      setForm(initialForm);
      setPickup(null);
      setDestination(null);

      await fetchBookings();

      showNotice(
        "success",
        isEditing
          ? "Booking updated successfully."
          : "Volunteer van booked successfully."
      );
    } catch (error) {
      showNotice(
        "error",
        error.message || "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (booking) => {
    if (
      !window.confirm(
        `Are you sure you want to delete booking #${booking.id}?`
      )
    ) {
      return;
    }

    setDeletingId(booking.id);

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("citizenToken");

      const response = await fetch(
        `${API_BASE}/volunteer-vehicle-bookings/${booking.id}`,
        {
          method: "DELETE",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || "Could not delete this booking."
        );
      }

      setBookings((previous) =>
        previous.filter((item) => item.id !== booking.id)
      );

      showNotice("success", "Booking deleted successfully.");
    } catch (error) {
      showNotice(
        "error",
        error.message || "Could not delete booking."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  };

  const openMap = (booking) => {
    const point = getCoordinates(booking, "pickup");

    if (!point) {
      showNotice("error", "Pickup coordinates are unavailable.");
      return;
    }

    window.open(
      `https://www.google.com/maps?q=${point[0]},${point[1]}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="vvb-page">
      <div className="vvb-container">
        <header className="vvb-header">
          <div className="vvb-heading">
            <div className="vvb-heading-icon">
              <Truck size={25} />
            </div>

            <div>
              <h1>Volunteer Van Booking</h1>
              <p>
                Book and manage your emergency transport requests.
              </p>
            </div>
          </div>

          <button
            className="vvb-primary-button"
            onClick={() => openBookingModal()}
            type="button"
          >
            <Plus size={18} />
            Book Volunteer Van
          </button>
        </header>

        {notice.message && (
          <div className={`vvb-notice ${notice.type}`}>
            {notice.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}

            <span>{notice.message}</span>

            <button
              type="button"
              className="vvb-notice-close"
              onClick={() =>
                setNotice({ type: "", message: "" })
              }
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="vvb-bookings-section">
          <div className="vvb-section-title">
            <div>
              <h2>My Bookings</h2>
              <p>Your volunteer van booking history</p>
            </div>

            <span className="vvb-count">
              {bookings.length} bookings
            </span>
          </div>

          {loading ? (
            <div className="vvb-state">
              <div className="vvb-spinner" />
              <p>Loading your bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="vvb-empty">
              <div className="vvb-empty-icon">
                <Truck size={30} />
              </div>

              <h3>No bookings yet</h3>
              <p>
                Your volunteer van bookings will appear here.
              </p>

              <button
                type="button"
                className="vvb-primary-button"
                onClick={() => openBookingModal()}
              >
                <Plus size={17} />
                Create a Booking
              </button>
            </div>
          ) : (
            <div className="vvb-booking-list">
              {bookings.map((booking) => (
                <article
                  className="vvb-booking-card"
                  key={booking.id}
                >
                  <div className="vvb-card-top">
                    <div className="vvb-vehicle">
                      <div className="vvb-vehicle-icon">
                        <Truck size={20} />
                      </div>

                      <div>
                        <h3>Volunteer Van</h3>
                        <span>Booking #{booking.id}</span>
                      </div>
                    </div>

                    <span className="vvb-status">
                      {booking.status || "PENDING"}
                    </span>
                  </div>

                  <div className="vvb-route">
                    <div className="vvb-route-line">
                      <span className="vvb-route-dot pickup-dot" />

                      <div className="vvb-route-text">
                        <small>Pickup location</small>
                        <p>
                          {booking.fromAddress ||
                            booking.pickupLocation ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="vvb-route-line">
                      <span className="vvb-route-dot destination-dot" />

                      <div className="vvb-route-text">
                        <small>Destination</small>
                        <p>
                          {booking.destinationAddress ||
                            booking.destination ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="vvb-card-details">
                    <span>
                      <Route size={15} />
                      {(booking.distanceKm ?? booking.distance) != null
                        ? `${booking.distanceKm ?? booking.distance} km`
                        : "Distance unavailable"}
                    </span>

                    <span>
                      <User size={15} />
                      {booking.citizenName || "Citizen"}
                    </span>

                    <span>
                      <Clock size={15} />
                      {formatDate(
                        booking.bookingTime ||
                          booking.createdAt ||
                          booking.bookingDate ||
                          booking.date
                      )}
                    </span>
                  </div>

                  <div className="vvb-card-actions">
                    <button
                      type="button"
                      className="vvb-edit-button"
                      onClick={() => openBookingModal(booking)}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="vvb-delete-button"
                      disabled={deletingId === booking.id}
                      onClick={() => handleDelete(booking)}
                    >
                      <Trash2 size={15} />
                      {deletingId === booking.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                    {getCoordinates(booking, "pickup") && (
                      <button
                        type="button"
                        className="vvb-map-button"
                        onClick={() => openMap(booking)}
                      >
                        <MapPin size={15} />
                        Map
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {modalOpen && (
        <div
          className="vvb-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="vvb-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vvb-modal-title"
          >
            <div className="vvb-modal-header">
              <div>
                <h2 id="vvb-modal-title">
                  {editingBooking
                    ? "Edit Booking"
                    : "Book Volunteer Van"}
                </h2>

                <p>
                  {editingBooking
                    ? "Update your transport details."
                    : "Enter your details and select locations."}
                </p>
              </div>

              <button
                type="button"
                className="vvb-modal-close"
                onClick={closeModal}
                aria-label="Close booking form"
                disabled={saving}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="vvb-form">
              <div className="vvb-form-grid">
                <label className="vvb-field">
                  <span>
                    <User size={15} /> Citizen name
                  </span>

                  <input
                    name="citizenName"
                    value={form.citizenName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </label>

                <label className="vvb-field">
                  <span>
                    <Phone size={15} /> Mobile number
                  </span>

                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    type="tel"
                    required
                  />
                </label>

                <label className="vvb-field vvb-full">
                  <span>
                    <Mail size={15} /> Email
                  </span>

                  <input
                    value={email}
                    readOnly
                    type="email"
                  />
                </label>
              </div>

              <div className="vvb-map-heading">
                <div>
                  <h3>Select locations</h3>
                  <p>
                    Choose a location mode, then click on the map.
                  </p>
                </div>

                <span className="vvb-map-hint">
                  <LocateFixed size={15} />
                  Map selection
                </span>
              </div>

              <div className="vvb-map-controls">
                <button
                  type="button"
                  className={
                    mapSelection === "pickup"
                      ? "vvb-location-choice active"
                      : "vvb-location-choice"
                  }
                  onClick={() => setMapSelection("pickup")}
                >
                  <span className="vvb-choice-dot pickup-dot" />
                  Set pickup
                </button>

                <button
                  type="button"
                  className={
                    mapSelection === "destination"
                      ? "vvb-location-choice active"
                      : "vvb-location-choice"
                  }
                  onClick={() => setMapSelection("destination")}
                >
                  <span className="vvb-choice-dot destination-dot" />
                  Set destination
                </button>
              </div>

              <div className="vvb-map-wrapper">
                <MapContainer
                  center={mapCenter}
                  zoom={12}
                  scrollWheelZoom
                  className="vvb-map"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapClickHandler onMapClick={handleMapClick} />

                  {pickup && (
                    <Marker position={pickup} icon={markerIcon}>
                      <Popup>Pickup location</Popup>
                    </Marker>
                  )}

                  {destination && (
                    <Marker
                      position={destination}
                      icon={markerIcon}
                    >
                      <Popup>Destination</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              <div className="vvb-location-summary">
                <div className="vvb-location-item">
                  <span className="vvb-route-dot pickup-dot" />

                  <div>
                    <small>Pickup</small>
                    <p>
                      {pickup
                        ? `${pickup[0].toFixed(5)}, ${pickup[1].toFixed(5)}`
                        : "Click the map to select pickup"}
                    </p>
                  </div>
                </div>

                <div className="vvb-location-item">
                  <span className="vvb-route-dot destination-dot" />

                  <div>
                    <small>Destination</small>
                    <p>
                      {destination
                        ? `${destination[0].toFixed(5)}, ${destination[1].toFixed(5)}`
                        : "Click the map to select destination"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="vvb-distance">
                <Navigation size={17} />
                <span>Estimated straight-line distance</span>

                <strong>
                  {form.distance ? `${form.distance} km` : "--"}
                </strong>
              </div>

              <div className="vvb-modal-actions">
                <button
                  type="button"
                  className="vvb-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="vvb-primary-button"
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
    </div>
  );
}

export default VolunteerVehicleBooking;
