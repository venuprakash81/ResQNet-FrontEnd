
import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// =====================================================
// MAIN PAGES
// =====================================================

import EmergencyMap from "./pages/EmergencyMap";
import Home from "./pages/Home";
import About from "./pages/About";
import Process from "./pages/Process";
import Feature from "./pages/Feature";

// =====================================================
// GENERAL AUTHENTICATION
// =====================================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

// =====================================================
// CITIZEN
// =====================================================

import CitizenLogin from "./pages/CitizenLogin";
import CitizenRegister from "./pages/CitizenRegister";
import CitizenDashboard from "./pages/CitizenDashboard";
import ReportEmergency from "./pages/ReportEmergency";
import CitizenEmergencies from "./pages/CitizenEmergencies";
import CitizenLocation from "./pages/CitizenLocation";
import CitizenEmergencyLocations from "./pages/CitizenEmergencyLocations";
import CitizenHospitalServices from "./pages/CitizenHospitalServices";
import CitizenAmbulanceBooking from "./pages/CitizenAmbulanceBooking";
import EditProfile from "./pages/EditProfile";
import Notifications from "./pages/Notifications";

// =====================================================
// RESCUE TEAM
// =====================================================

import Team from "./pages/Team";
import TeamLogin from "./pages/TeamLogin";
import RescueDashboard from "./pages/RescueDashboard";
import TeamProfile from "./pages/TeamProfile";
import NearbyRescueTeams from "./pages/NearbyRescueTeams";
import AllRescueTeams from "./pages/AllRescueTeams";
import MedicalEmergencies from "./pages/MedicalEmergencies";
import RescueTeamMessages from "./pages/RescueTeamMessages";

// =====================================================
// VOLUNTEER
// =====================================================

import Volunteer from "./pages/Volunteer";
import VolunteerLogin from "./pages/VolunteerLogin";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import VolunteerProfile from "./pages/VolunteerProfile";
import VolunteerSettings from "./pages/VolunteerSettings";
import VolunteerChat from "./pages/VolunteerChat";
import NearbyVolunteers from "./pages/NearbyVolunteers";
import AllVolunteers from "./pages/AllVolunteers";
import VolunteerVehicleBooking from "./pages/VolunteerVehicleBooking";
import VolunteerVehicleBooking1 from "./pages/VolunteerVehicleBooking1";

// =====================================================
// HOSPITAL
// =====================================================

import HospitalRegister from "./pages/HospitalRegister";
import HospitalLogin from "./pages/HospitalLogin";
import HospitalDashboard from "./pages/HospitalDashboard";
import HospitalDashboard1 from "./pages/HospitalDashboard1";
import HospitalProfile from "./pages/HospitalProfile";
import HospitalDoctors from "./pages/HospitalDoctors";
import HospitalBeds from "./pages/HospitalBeds";
import HospitalAmbulances from "./pages/HospitalAmbulances";
import HospitalSecurity from "./pages/HospitalSecurity";
import HospitalServices from "./pages/HospitalServices";
import HospitalAllDoctors from "./pages/HospitalAllDoctors";
import HospitalBedBookings from "./pages/HospitalBedBookings";
import HospitalAmbulanceBookings from "./pages/HospitalAmbulanceBookings";
import NearbyHospitals from "./pages/NearbyHospitals";
import DoctorBooking from "./pages/DoctorBooking";
import BookBeds from "./pages/BookBeds";

// =====================================================
// ADMIN AND OTHER PAGES
// =====================================================

import ChangePassword from "./pages/ChangePassword";
import AdminEmergencyLocations from "./pages/AdminEmergencyLocations";
import ChatPage from "./pages/ChatPage";
import AdminChats from "./pages/AdminChats";
import HospitalChat from "./pages/HospitalChat";
import AIChat from "./pages/AIChat";

// =====================================================
// PAGE TITLES
// =====================================================

const pageTitles = {
  // Main website
  "/": "ResQNet | Home",
  "/about": "About Us | ResQNet",
  "/process": "How It Works | ResQNet",
  "/features": "Features | ResQNet",

  // General authentication
  "/login": "Login | ResQNet",
  "/register": "Register | ResQNet",

  // Admin
  "/admin/login": "Admin Login | ResQNet",
  "/admin/dashboard": "Admin Dashboard | ResQNet",
  "/admin/chats": "Admin Messages | ResQNet",
  "/admin/emergency-map": "Emergency Locations | ResQNet",

  // Citizen
  "/login/citizen": "Citizen Login | ResQNet",
  "/register/citizen": "Citizen Registration | ResQNet",
  "/citizen/dashboard": "Citizen Dashboard | ResQNet",
  "/citizen/profile": "My Profile | ResQNet",
  "/citizen/privacy": "Privacy & Security | ResQNet",
  "/citizen/map": "Emergency Map | ResQNet",
  "/citizen/report-emergency": "Report Emergency | ResQNet",
  "/citizen/requests": "My Emergency Requests | ResQNet",
  "/citizen/location-settings": "Location Settings | ResQNet",
  "/citizen/notifications": "Notifications | ResQNet",
  "/safe-locations": "Safe Locations | ResQNet",
  "/nearby-hospitals": "Nearby Hospitals | ResQNet",
  "/hospital-services": "Hospital Services | ResQNet",
  "/ambulances": "Book an Ambulance | ResQNet",
  "/doctor-booking": "Doctor Booking | ResQNet",
  "/book-beds": "Book Hospital Beds | ResQNet",

  // Rescue team
  "/register/team": "Rescue Team Registration | ResQNet",
  "/login/rescue-team": "Rescue Team Login | ResQNet",
  "/rescue-team/dashboard": "Rescue Team Dashboard | ResQNet",
  "/team-profile": "Rescue Team Profile | ResQNet",
  "/nearby-rescue-teams": "Nearby Rescue Teams | ResQNet",
  "/all-rescue-teams": "All Rescue Teams | ResQNet",
  "/rescue-team-messages": "Rescue Team Messages | ResQNet",
  "/medical-emergencies": "Medical Emergencies | ResQNet",

  // Volunteer
  "/register/volunteer": "Volunteer Registration | ResQNet",
  "/login/volunteer": "Volunteer Login | ResQNet",
  "/volunteer-dashboard": "Volunteer Dashboard | ResQNet",
  "/volunteer-profile": "Volunteer Profile | ResQNet",
  "/volunteer/settings": "Volunteer Settings | ResQNet",
  "/volunteer-messages": "Volunteer Messages | ResQNet",
  "/nearby-volunteers": "Nearby Volunteers | ResQNet",
  "/all-volunteers": "All Volunteers | ResQNet",
  "/book-emergency-vehicle": "Emergency Vehicle Booking | ResQNet",
  "/volunteer/booking": "My Vehicle Bookings | ResQNet",

  // Hospital
  "/register/hospital": "Hospital Registration | ResQNet",
  "/login/hospital": "Hospital Login | ResQNet",
  "/hospital/dashboard": "Hospital Dashboard | ResQNet",
  "/hospital/profile": "Hospital Profile | ResQNet",
  "/hospital/services": "Hospital Services Management | ResQNet",
  "/hospital/doctors": "Manage Doctors | ResQNet",
  "/hospital/beds": "Manage Hospital Beds | ResQNet",
  "/hospital/ambulances": "Manage Ambulances | ResQNet",
  "/hospital/security": "Hospital Security | ResQNet",
  "/hospital/all-doctors": "All Hospital Doctors | ResQNet",
  "/hospital/bed-bookings": "Bed Bookings | ResQNet",
  "/hospital/ambulance-bookings": "Ambulance Bookings | ResQNet",
  "/mybooking": "My Bookings | ResQNet",

  // Chat and AI
  "/chats": "Hospital Messages | ResQNet",
  "/ai-chat": "AI Emergency Assistant | ResQNet",
};

// =====================================================
// AUTOMATIC BROWSER TITLE
// =====================================================

function PageTitle() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    let title = pageTitles[path];

    if (!title) {
      if (path.startsWith("/rescue-messages/")) {
        title = "Emergency Conversation | ResQNet";
      } else {
        title = "ResQNet | Emergency Support Network";
      }
    }

    document.title = title;
  }, [location.pathname]);

  return null;
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <PageTitle />

      <Routes>
        {/* MAIN WEBSITE */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/process" element={<Process />} />
        <Route path="/features" element={<Feature />} />

        {/* GENERAL AUTHENTICATION */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route
          path="/admin/chats"
          element={<AdminChats />}
        />
        <Route
          path="/admin/emergency-map"
          element={<AdminEmergencyLocations />}
        />

        {/* CITIZEN */}
        <Route
          path="/login/citizen"
          element={<CitizenLogin />}
        />
        <Route
          path="/register/citizen"
          element={<CitizenRegister />}
        />
        <Route
          path="/citizen/dashboard"
          element={<CitizenDashboard />}
        />
        <Route
          path="/citizen/profile"
          element={<EditProfile />}
        />
        <Route
          path="/citizen/privacy"
          element={<ChangePassword />}
        />
        <Route
          path="/citizen/map"
          element={<EmergencyMap />}
        />
        <Route
          path="/citizen/report-emergency"
          element={<ReportEmergency />}
        />
        <Route
          path="/citizen/requests"
          element={<CitizenEmergencies />}
        />
        <Route
          path="/citizen/location-settings"
          element={<CitizenLocation />}
        />
        <Route
          path="/citizen/notifications"
          element={<Notifications />}
        />
        <Route
          path="/safe-locations"
          element={<CitizenEmergencyLocations />}
        />
        <Route
          path="/nearby-hospitals"
          element={<NearbyHospitals />}
        />
        <Route
          path="/hospital-services"
          element={<CitizenHospitalServices />}
        />
        <Route
          path="/ambulances"
          element={<CitizenAmbulanceBooking />}
        />
        <Route
          path="/doctor-booking"
          element={<DoctorBooking />}
        />
        <Route
          path="/book-beds"
          element={<BookBeds />}
        />

        {/* RESCUE TEAM */}
        <Route
          path="/register/team"
          element={<Team />}
        />
        <Route
          path="/login/rescue-team"
          element={<TeamLogin />}
        />
        <Route
          path="/rescue-team/dashboard"
          element={<RescueDashboard />}
        />
        <Route
          path="/team-profile"
          element={<TeamProfile />}
        />
        <Route
          path="/nearby-rescue-teams"
          element={<NearbyRescueTeams />}
        />
        <Route
          path="/all-rescue-teams"
          element={<AllRescueTeams />}
        />
        <Route
          path="/rescue-team-messages"
          element={<RescueTeamMessages />}
        />
        <Route
          path="/medical-emergencies"
          element={<MedicalEmergencies />}
        />

        {/* VOLUNTEER */}
        <Route
          path="/register/volunteer"
          element={<Volunteer />}
        />
        <Route
          path="/login/volunteer"
          element={<VolunteerLogin />}
        />
        <Route
          path="/volunteer-dashboard"
          element={<VolunteerDashboard />}
        />
        <Route
          path="/volunteer-profile"
          element={<VolunteerProfile />}
        />
        <Route
          path="/volunteer/settings"
          element={<VolunteerSettings />}
        />
        <Route
          path="/volunteer-messages"
          element={<VolunteerChat />}
        />
        <Route
          path="/nearby-volunteers"
          element={<NearbyVolunteers />}
        />
        <Route
          path="/all-volunteers"
          element={<AllVolunteers />}
        />
        <Route
          path="/book-emergency-vehicle"
          element={<VolunteerVehicleBooking />}
        />
        <Route
          path="/volunteer/booking"
          element={<VolunteerVehicleBooking1 />}
        />

        {/* HOSPITAL AUTHENTICATION */}
        <Route
          path="/register/hospital"
          element={<HospitalRegister />}
        />
        <Route
          path="/login/hospital"
          element={<HospitalLogin />}
        />

        {/* HOSPITAL DASHBOARD */}
        <Route
          path="/hospital/dashboard"
          element={<HospitalDashboard />}
        />
        <Route
          path="/hospital/profile"
          element={<HospitalProfile />}
        />
        <Route
          path="/hospital/services"
          element={<HospitalServices />}
        />
        <Route
          path="/hospital/doctors"
          element={<HospitalDoctors />}
        />
        <Route
          path="/hospital/beds"
          element={<HospitalBeds />}
        />
        <Route
          path="/hospital/ambulances"
          element={<HospitalAmbulances />}
        />
        <Route
          path="/hospital/security"
          element={<HospitalSecurity />}
        />
        <Route
          path="/hospital/all-doctors"
          element={<HospitalAllDoctors />}
        />
        <Route
          path="/hospital/bed-bookings"
          element={<HospitalBedBookings />}
        />
        <Route
          path="/hospital/ambulance-bookings"
          element={<HospitalAmbulanceBookings />}
        />
        <Route
          path="/mybooking"
          element={<HospitalDashboard1 />}
        />

        {/* CHAT */}
        <Route
          path="/rescue-messages/:conversationId"
          element={<ChatPage />}
        />
        <Route
          path="/chats"
          element={<HospitalChat />}
        />
        <Route
          path="/ai-chat"
          element={<AIChat />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
