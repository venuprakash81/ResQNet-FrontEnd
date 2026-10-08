import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Hospital,
  Stethoscope,
  Bed,
  Ambulance,
  HeartPulse,
  Droplet,
  Pill,
  FlaskConical,
  Activity,
  Baby,
  Siren,
  MapPin,
  Phone,
  Mail,
  X,
  AlertCircle,
} from "lucide-react";
import "./CitizenHospitalServices.css";

const API_BASE = "http://localhost:8081/api/hospitals";

const FILTERS = [
  "All Services",
  "Doctors",
  "Beds",
  "ICU",
  "Ambulance",
  "Emergency",
  "Blood Bank",
  "Pharmacy",
  "Laboratory",
  "Operation Theatre",
  "Maternity Care",
  "Trauma Care",
];

const getId = (hospital) =>
  hospital?.id ?? hospital?.hospitalId ?? hospital?._id;

const getName = (hospital) =>
  hospital?.hospitalName || hospital?.name || "Hospital";

const getPhone = (hospital) =>
  hospital?.phone ||
  hospital?.contactNumber ||
  hospital?.mobile ||
  hospital?.phoneNumber ||
  "";

const getAddress = (hospital) =>
  hospital?.address || hospital?.location || hospital?.city || "Address not available";

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.hospitals)) return data.hospitals;
  return [];
};

const countDoctors = (data) => {
  if (Array.isArray(data)) return data.length;
  return Number(data?.count ?? data?.total ?? 0);
};

const getAvailableBeds = (beds) =>
  beds.reduce(
    (total, bed) =>
      total + Number(bed.availableBeds ?? bed.available ?? 0),
    0
  );

const getICUBeds = (beds) =>
  beds.reduce((total, bed) => {
    const type = `${bed.bedType || ""} ${bed.ward || ""}`.toLowerCase();
    if (!type.includes("icu")) return total;
    return total + Number(bed.availableBeds ?? bed.available ?? 0);
  }, 0);

const getAmbulanceCount = (ambulances) =>
  ambulances.reduce((total, ambulance) => {
    const count =
      ambulance.availableAmbulances ??
      (ambulance.available === true ? 1 : 0);
    return total + Number(count || 0);
  }, 0);

const getFacilityStatus = (hospital, keywords) => {
  const services =
    hospital.services ||
    hospital.facilities ||
    hospital.hospitalServices ||
    hospital.availableServices ||
    [];

  if (Array.isArray(services)) {
    const names = services.map((service) =>
      (typeof service === "string"
        ? service
        : service?.name || service?.serviceName || ""
      ).toLowerCase()
    );

    if (names.some((name) => keywords.some((word) => name.includes(word)))) {
      return true;
    }
  }

  return keywords.some((word) => {
    const field = word.replace(/\s+/g, "");
    const possibleFields = [
      field,
      `${field}Available`,
      `has${field.charAt(0).toUpperCase()}${field.slice(1)}`,
    ];

    return possibleFields.some(
      (key) => hospital[key] === true || hospital[key] === "true"
    );
  });
};

function CitizenHospitalServices() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Services");
  const [selectedHospital, setSelectedHospital] = useState(null);

  const loadAllHospitals = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error(`Hospital list request failed: HTTP ${response.status}`);
      }

      const hospitalData = getList(await response.json());

      const enriched = await Promise.all(
        hospitalData.map(async (hospital) => {
          const id = getId(hospital);

          if (!id) {
            return {
              ...hospital,
              doctorsCount: null,
              bedsCount: null,
              icuBedsCount: null,
              ambulancesCount: null,
              serviceLoadError: true,
            };
          }

          const requests = [
            fetch(`${API_BASE}/${id}/doctors`),
            fetch(`${API_BASE}/${id}/beds`),
            fetch(`${API_BASE}/${id}/ambulances`),
          ];

          const [doctorsResult, bedsResult, ambulanceResult] =
            await Promise.allSettled(requests);

          const readResponse = async (result) => {
            if (result.status !== "fulfilled" || !result.value.ok) {
              return null;
            }
            try {
              return await result.value.json();
            } catch {
              return null;
            }
          };

          const [doctorsData, bedsData, ambulanceData] = await Promise.all([
            readResponse(doctorsResult),
            readResponse(bedsResult),
            readResponse(ambulanceResult),
          ]);

          const beds = getList(bedsData);
          const ambulances = getList(ambulanceData);

          return {
            ...hospital,
            doctorsCount:
              doctorsData === null ? null : countDoctors(doctorsData),
            bedsCount: bedsData === null ? null : getAvailableBeds(beds),
            icuBedsCount: bedsData === null ? null : getICUBeds(beds),
            ambulancesCount:
              ambulanceData === null ? null : getAmbulanceCount(ambulances),
            serviceLoadError:
              doctorsData === null ||
              bedsData === null ||
              ambulanceData === null,
          };
        })
      );

      setHospitals(enriched);
    } catch (err) {
      console.error("Loading all hospitals failed:", err);
      setError(err.message || "Unable to load hospitals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllHospitals();
  }, []);

  const filteredHospitals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return hospitals.filter((hospital) => {
      const name = getName(hospital).toLowerCase();
      const address = getAddress(hospital).toLowerCase();
      const city = (hospital.city || "").toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        address.includes(query) ||
        city.includes(query);

      let matchesFilter = true;

      switch (filter) {
        case "Doctors":
          matchesFilter = Number(hospital.doctorsCount) > 0;
          break;
        case "Beds":
          matchesFilter = Number(hospital.bedsCount) > 0;
          break;
        case "ICU":
          matchesFilter = Number(hospital.icuBedsCount) > 0;
          break;
        case "Ambulance":
          matchesFilter = Number(hospital.ambulancesCount) > 0;
          break;
        case "Emergency":
          matchesFilter = getFacilityStatus(hospital, ["emergency"]);
          break;
        case "Blood Bank":
          matchesFilter = getFacilityStatus(hospital, ["blood bank", "bloodbank"]);
          break;
        case "Pharmacy":
          matchesFilter = getFacilityStatus(hospital, ["pharmacy"]);
          break;
        case "Laboratory":
          matchesFilter = getFacilityStatus(hospital, ["laboratory", "lab"]);
          break;
        case "Operation Theatre":
          matchesFilter = getFacilityStatus(hospital, ["operation theatre", "operation theater"]);
          break;
        case "Maternity Care":
          matchesFilter = getFacilityStatus(hospital, ["maternity"]);
          break;
        case "Trauma Care":
          matchesFilter = getFacilityStatus(hospital, ["trauma"]);
          break;
        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [hospitals, search, filter]);

  const openLocation = (hospital) => {
    const lat = hospital.latitude ?? hospital.lat;
    const lng = hospital.longitude ?? hospital.lng ?? hospital.lon;

    const query =
      lat != null && lng != null
        ? `${lat},${lng}`
        : getAddress(hospital);

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const contactHospital = (hospital) => {
    const phone = getPhone(hospital);
    if (!phone) {
      alert("Contact number is not available.");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const facilityItems = (hospital) => [
    { name: "Emergency", available: getFacilityStatus(hospital, ["emergency"]) },
    { name: "Blood Bank", available: getFacilityStatus(hospital, ["blood bank", "bloodbank"]) },
    { name: "Pharmacy", available: getFacilityStatus(hospital, ["pharmacy"]) },
    { name: "Laboratory", available: getFacilityStatus(hospital, ["laboratory", "lab"]) },
    { name: "Operation Theatre", available: getFacilityStatus(hospital, ["operation theatre", "operation theater"]) },
    { name: "Maternity Care", available: getFacilityStatus(hospital, ["maternity"]) },
    { name: "Trauma Care", available: getFacilityStatus(hospital, ["trauma"]) },
  ];

  return (
    <div className="citizen-hospital-page">
      <header className="citizen-hospital-header">
        <div className="citizen-hospital-brand">
          <div className="citizen-hospital-logo">
            <Hospital size={25} />
          </div>
          <div>
            <h1>Hospital Services</h1>
            <p>ResQNet Citizen Healthcare</p>
          </div>
        </div>

        <button
          type="button"
          className="citizen-refresh"
          onClick={loadAllHospitals}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <main className="citizen-hospital-main">
        <section className="citizen-hospital-hero">
          <div>
            <span>RESQNET HEALTHCARE NETWORK</span>
            <h2>Find hospitals and healthcare services</h2>
            <p>
              Browse registered hospitals and check their reported resources
              and facilities.
            </p>
          </div>
          <HeartPulse size={58} />
        </section>

        <section className="citizen-hospital-controls">
          <div className="citizen-hospital-search">
            <Search size={19} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search hospital or location..."
            />
          </div>

          <div className="citizen-hospital-filters">
            {FILTERS.map((item) => (
              <button
                type="button"
                key={item}
                className={filter === item ? "selected" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="citizen-hospital-results">
          <div className="citizen-results-heading">
            <div>
              <h2>All Registered Hospitals</h2>
              <p>
                {loading
                  ? "Loading hospital information..."
                  : `${filteredHospitals.length} hospitals found`}
              </p>
            </div>
          </div>

          {error && (
            <div className="citizen-hospital-error">
              <AlertCircle size={20} />
              <span>{error}</span>
              <button type="button" onClick={loadAllHospitals}>Retry</button>
            </div>
          )}

          {loading ? (
            <div className="citizen-hospital-empty">
              <div className="citizen-loading-spinner" />
              <p>Loading all hospital services...</p>
            </div>
          ) : !error && filteredHospitals.length === 0 ? (
            <div className="citizen-hospital-empty">
              <Hospital size={38} />
              <h3>No hospitals found</h3>
              <p>Try another search or select All Services.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("All Services");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="citizen-hospital-grid">
              {filteredHospitals.map((hospital, index) => {
                const facilities = facilityItems(hospital);

                return (
                  <article
                    className="citizen-hospital-card"
                    key={getId(hospital) ?? index}
                  >
                    <div className="citizen-hospital-card-heading">
                      <div className="citizen-card-icon">
                        <Hospital size={27} />
                      </div>
                      <div className="citizen-card-name">
                        <h3>{getName(hospital)}</h3>
                        <span>Registered hospital</span>
                      </div>
                    </div>

                    <div className="citizen-hospital-address">
                      <MapPin size={16} />
                      <span>{getAddress(hospital)}</span>
                    </div>

                    <div className="citizen-hospital-stats">
                      <div>
                        <Stethoscope size={19} />
                        <strong>
                          {hospital.doctorsCount ?? "—"}
                        </strong>
                        <small>Doctors</small>
                      </div>
                      <div>
                        <Bed size={19} />
                        <strong>
                          {hospital.bedsCount ?? "—"}
                        </strong>
                        <small>Available beds</small>
                      </div>
                      <div>
                        <Activity size={19} />
                        <strong>
                          {hospital.icuBedsCount ?? "—"}
                        </strong>
                        <small>ICU beds</small>
                      </div>
                      <div>
                        <Ambulance size={19} />
                        <strong>
                          {hospital.ambulancesCount ?? "—"}
                        </strong>
                        <small>Ambulances</small>
                      </div>
                    </div>

                    <div className="citizen-facilities">
                      <h4>Other facilities</h4>
                      <div className="citizen-facility-tags">
                        {facilities.map((facility) => (
                          <span
                            key={facility.name}
                            className={
                              facility.available
                                ? "facility-tag available"
                                : "facility-tag"
                            }
                          >
                            {facility.name}
                            {facility.available ? " ✓" : ""}
                          </span>
                        ))}
                      </div>
                    </div>

                    {hospital.serviceLoadError && (
                      <p className="citizen-data-note">
                        Some resource details could not be loaded.
                      </p>
                    )}

                    <div className="citizen-hospital-actions">
                      <button
                        type="button"
                        onClick={() => contactHospital(hospital)}
                      >
                        <Phone size={16} />
                        Contact
                      </button>
                      <button
                        type="button"
                        onClick={() => openLocation(hospital)}
                      >
                        <MapPin size={16} />
                        Location
                      </button>
                      <button
                        type="button"
                        className="citizen-details-button"
                        onClick={() => setSelectedHospital(hospital)}
                      >
                        View details
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {selectedHospital && (
        <div
          className="citizen-modal-overlay"
          onClick={() => setSelectedHospital(null)}
        >
          <section
            className="citizen-hospital-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Hospital details"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="citizen-modal-heading">
              <div>
                <span>HOSPITAL DETAILS</span>
                <h2>{getName(selectedHospital)}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHospital(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="citizen-modal-body">
              <p><MapPin size={17} /> {getAddress(selectedHospital)}</p>
              <p>
                <Phone size={17} />
                {getPhone(selectedHospital) || "Phone not available"}
              </p>
              <p>
                <Mail size={17} />
                {selectedHospital.email ||
                  selectedHospital.hospitalEmail ||
                  "Email not available"}
              </p>

              <h3>Reported resources</h3>
              <ul>
                <li>Doctors: {selectedHospital.doctorsCount ?? "Not available"}</li>
                <li>Available beds: {selectedHospital.bedsCount ?? "Not available"}</li>
                <li>ICU beds: {selectedHospital.icuBedsCount ?? "Not available"}</li>
                <li>Ambulances: {selectedHospital.ambulancesCount ?? "Not available"}</li>
              </ul>

              <h3>Other facilities</h3>
              <div className="citizen-modal-facilities">
                {facilityItems(selectedHospital).map((facility) => (
                  <span key={facility.name}>
                    {facility.name}:{" "}
                    {facility.available ? "Available" : "Not confirmed"}
                  </span>
                ))}
              </div>
            </div>

            <div className="citizen-modal-actions">
              <button
                type="button"
                onClick={() => contactHospital(selectedHospital)}
              >
                <Phone size={16} /> Contact hospital
              </button>
              <button
                type="button"
                onClick={() => openLocation(selectedHospital)}
              >
                <MapPin size={16} /> Open location
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default CitizenHospitalServices;