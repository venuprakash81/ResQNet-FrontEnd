
import React, { useCallback, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
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
  let citizen = {};

  try {
    const saved = localStorage.getItem("citizen");

    if (saved) {
      citizen = JSON.parse(saved) || {};
    }
  } catch (error) {
    console.error("Error reading citizen data:", error);
  }

  return {
    email:
      citizen.email ||
      citizen.citizenEmail ||
      localStorage.getItem("citizenEmail") ||
      localStorage.getItem("email") ||
      localStorage.getItem("userEmail") ||
      "",
    name:
      citizen.citizenName ||
      citizen.name ||
      localStorage.getItem("citizenName") ||
      localStorage.getItem("userName") ||
      "",
    mobile:
      citizen.mobileNumber ||
      citizen.mobile ||
      citizen.phone ||
      localStorage.getItem("mobileNumber") ||
      localStorage.getItem("mobile") ||
      "",
  };
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
    ? booking.fromLatitude ?? booking.pickupLatitude
    : booking.destinationLatitude;

  const longitude = isPickup
    ? booking.fromLongitude ?? booking.pickupLongitude
    : booking.destinationLongitude;

  if (latitude == null || longitude == null) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return [lat, lng];
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function MapCenterUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}

async function getApiError(response) {
  const raw = await response.text();

  try {
    const data = JSON.parse(raw);

    if (typeof data === "string") {
      return data;
    }

    return (
      data.message ||
      data.error ||
      `Request failed with status ${response.status}`
    );
  } catch {
    return raw || `Request failed with status ${response.status}`;
  }
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

  const [citizen] = useState(getCitizenDetails);
  const email = String(citizen.email || "").trim();

  const showNotice = useCallback((type, message) => {
    setNotice({ type, message });
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!email) {
      setBookings([]);
      setLoading(false);

      showNotice(
        "error",
        "Citizen email not found. Please sign in again."
      );

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/volunteer-vehicle-bookings/email/${encodeURIComponent(
          email
        )}`
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const data = await response.json();

      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotice(
        "error",
        error.message || "Could not load your bookings."
      );
    } finally {
      setLoading(false);
    }
  }, [email, showNotice]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const distance = calculateDistance(pickup, destination);

    setForm((previous) => ({
      ...previous,
      distance,
    }));
  }, [pickup, destination]);

  const openBookingModal = (booking = null) => {
    setNotice({ type: "", message: "" });
    setEditingBooking(booking);

    if (booking) {
      const pickupPoint = getCoordinates(booking, "pickup");
      const destinationPoint = getCoordinates(
        booking,
        "destination"
      );

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

      setMapSelection(
        pickupPoint && !destinationPoint
          ? "destination"
          : "pickup"
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
      setMapSelection("pickup");
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingBooking(null);
    setForm(initialForm);
    setPickup(null);
    setDestination(null);
    setMapCenter(defaultCenter);
    setMapSelection("pickup");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleMapClick = (point) => {
    const locationText = `Location (${point[0].toFixed(
      5
    )}, ${point[1].toFixed(5)})`;

    if (mapSelection === "pickup") {
      setPickup(point);

      setForm((previous) => ({
        ...previous,
        pickupLocation: locationText,
      }));

      // Automatically switch to destination mode.
      setMapSelection("destination");
    } else {
      setDestination(point);

      setForm((previous) => ({
        ...previous,
        destination: locationText,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

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

    const citizenName = form.citizenName.trim();
    const mobileNumber = form.mobile.trim();
    const fromAddress = form.pickupLocation.trim();
    const destinationAddress = form.destination.trim();

    if (
      !citizenName ||
      !mobileNumber ||
      !fromAddress ||
      !destinationAddress
    ) {
      showNotice("error", "Please complete all required fields.");
      return;
    }

    // Matches your Spring Boot controller's 10-digit validation.
    if (!/^[0-9]{10}$/.test(mobileNumber)) {
      showNotice(
        "error",
        "Enter a valid 10-digit mobile number."
      );
      return;
    }

    if (
      !/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(email)
    ) {
      showNotice("error", "Enter a valid email address.");
      return;
    }

    const distance = Number(
      calculateDistance(pickup, destination)
    );

    if (distance <= 0) {
      showNotice(
        "error",
        "Pickup and destination must be different locations."
      );
      return;
    }

    // Exact field names expected by your Spring Boot controller.
    const payload = {
      citizenName,
      mobileNumber,
      email,
      vehicleType: "Volunteer Van",
      fromAddress,
      destinationAddress,
      fromLatitude: Number(pickup[0]),
      fromLongitude: Number(pickup[1]),
      destinationLatitude: Number(destination[0]),
      destinationLongitude: Number(destination[1]),
      distanceKm: distance,
    };

    setSaving(true);

    try {
      const isEditing = Boolean(editingBooking);

      const url = isEditing
        ? `${API_BASE}/volunteer-vehicle-bookings/${editingBooking.id}`
        : `${API_BASE}/volunteer-vehicle-bookings`;

      const token =
        localStorage.getItem("citizenToken") ||
        localStorage.getItem("token");

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      setModalOpen(false);
      setEditingBooking(null);
      setForm(initialForm);
      setPickup(null);
      setDestination(null);
      setMapCenter(defaultCenter);
      setMapSelection("pickup");

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
    const confirmed = window.confirm(
      `Are you sure you want to delete booking #${booking.id}?`
    );

    if (!confirmed) return;

    setDeletingId(booking.id);

    try {
      const token =
        localStorage.getItem("citizenToken") ||
        localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/volunteer-vehicle-bookings/${booking.id}`,
        {
          method: "DELETE",
          headers: {
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      setBookings((previous) =>
        previous.filter((item) => item.id !== booking.id)
      );

      showNotice(
        "success",
        "Booking deleted successfully."
      );
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
      showNotice(
        "error",
        "Pickup coordinates are unavailable."
      );
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
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
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
                disabled={saving}
                aria-label="Close booking form"
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
                    placeholder="Enter 10-digit mobile number"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                  />
                </label>

                <label className="vvb-field vvb-full">
                  <span>
                    <Mail size={15} /> Email
                  </span>

                  <input
                    name="email"
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
                    {mapSelection === "pickup"
                      ? "Click on the map to select your pickup location."
                      : !destination
                        ? "Pickup selected. Now click on the map to select your destination."
                        : "Both locations selected. You can change either location."}
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

                  <MapCenterUpdater center={mapCenter} />

                  <MapClickHandler onMapClick={handleMapClick} />

                  {pickup && (
                    <Marker
                      position={pickup}
                      icon={markerIcon}
                    >
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
                  {form.distance
                    ? `${form.distance} km`
                    : "--"}
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
