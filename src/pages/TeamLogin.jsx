import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeamLogin.css";

const API_BASE = "http://localhost:8081/api/teams";

function TeamLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // CHECK IF ALREADY LOGGED IN
  // =====================================================
  useEffect(() => {
    const loggedIn =
      localStorage.getItem("rescueTeamLoggedIn") === "true";

    if (loggedIn) {
      navigate("/rescue-team/dashboard", {
        replace: true,
      });
    }
  }, [navigate]);

  // =====================================================
  // LOGIN
  // =====================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanEmail) {
      setError("Please enter your registered email.");
      return;
    }

    if (!cleanPhone) {
      setError("Please enter your registered phone number.");
      return;
    }

    setLoading(true);

    try {
      console.log("LOGIN REQUEST:", {
        email: cleanEmail,
        phone: cleanPhone,
      });

      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: cleanEmail,
          phone: cleanPhone,
        }),
      });

      // =================================================
      // HANDLE JSON / TEXT RESPONSE
      // =================================================
      let data = {};

      const contentType =
        response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        data = {
          message: text,
        };
      }

      console.log("LOGIN STATUS:", response.status);
      console.log("LOGIN RESPONSE:", data);

      // =================================================
      // LOGIN SUCCESS
      // =================================================
      if (response.ok) {
        /*
          Backend may return:

          {
            "team": {
              "id": 1,
              "teamName": "Hyderabad Rescue Team",
              "email": "...",
              "phone": "..."
            }
          }

          OR directly:

          {
            "id": 1,
            "teamName": "Hyderabad Rescue Team",
            "email": "...",
            "phone": "..."
          }
        */

        const team =
          data.team ||
          data.rescueTeam ||
          data;

        // -----------------------------------------------
        // IMPORTANT SESSION FLAG
        // -----------------------------------------------
        localStorage.setItem(
          "rescueTeamLoggedIn",
          "true"
        );

        // -----------------------------------------------
        // SAVE COMPLETE TEAM DATA
        // -----------------------------------------------
        localStorage.setItem(
          "team",
          JSON.stringify(team)
        );

        // -----------------------------------------------
        // SAVE TEAM ID
        // -----------------------------------------------
        if (team.id) {
          localStorage.setItem(
            "teamId",
            String(team.id)
          );
        }

        if (team.teamId) {
          localStorage.setItem(
            "teamId",
            String(team.teamId)
          );
        }

        // -----------------------------------------------
        // SAVE TEAM NAME
        // -----------------------------------------------
        localStorage.setItem(
          "teamName",
          team.teamName ||
            team.name ||
            team.leaderName ||
            "RESCUE TEAM"
        );

        // -----------------------------------------------
        // SAVE EMAIL
        // -----------------------------------------------
        localStorage.setItem(
          "teamEmail",
          team.email ||
            team.teamEmail ||
            cleanEmail
        );

        // -----------------------------------------------
        // SAVE PHONE
        // -----------------------------------------------
        localStorage.setItem(
          "teamPhone",
          team.phone ||
            team.phoneNumber ||
            cleanPhone
        );

        console.log(
          "LOGIN SUCCESS"
        );

        console.log(
          "rescueTeamLoggedIn:",
          localStorage.getItem(
            "rescueTeamLoggedIn"
          )
        );

        console.log(
          "team:",
          localStorage.getItem("team")
        );

        setMessage(
          data.message ||
            "Team login successful!"
        );

        // -----------------------------------------------
        // REDIRECT TO DASHBOARD
        // -----------------------------------------------
        setTimeout(() => {
          navigate(
            "/rescue-team/dashboard",
            {
              replace: true,
            }
          );
        }, 500);
      }

      // =================================================
      // LOGIN FAILED
      // =================================================
      else {
        console.error(
          "LOGIN FAILED:",
          data
        );

        setError(
          data.message ||
            data.error ||
            "Invalid email or phone number."
        );

        // Remove old invalid session
        localStorage.removeItem(
          "rescueTeamLoggedIn"
        );

        localStorage.removeItem(
          "team"
        );

        localStorage.removeItem(
          "teamId"
        );

        localStorage.removeItem(
          "teamName"
        );

        localStorage.removeItem(
          "teamEmail"
        );

        localStorage.removeItem(
          "teamPhone"
        );
      }
    } catch (err) {
      console.error(
        "RESCUE TEAM LOGIN ERROR:",
        err
      );

      setError(
        "Unable to connect to the server. Make sure Spring Boot is running on port 8081."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================
  const handleRegister = () => {
    navigate("/team");
  };

  return (
    <div className="team-login-page">

      <div className="team-login-card">

        {/* ================= HEADER ================= */}

        <div className="team-login-header">

          <div className="login-icon">
            🚨
          </div>

          <h1>
            RESQNET
          </h1>

          <h2>
            Rescue Team Login
          </h2>

          <p>
            Access your emergency response dashboard
          </p>

        </div>

        {/* ================= SUCCESS ================= */}

        {message && (
          <div className="login-success">
            ✅ {message}
          </div>
        )}

        {/* ================= ERROR ================= */}

        {error && (
          <div className="login-error">
            ❌ {error}
          </div>
        )}

        {/* ================= FORM ================= */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div className="login-form-group">

            <label>
              Team Email
            </label>

            <input
              type="email"
              placeholder="Enter registered email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setMessage("");
              }}
              autoComplete="email"
              required
            />

          </div>

          {/* PHONE */}

          <div className="login-form-group">

            <label>
              Registered Phone Number
            </label>

            <input
              type="tel"
              placeholder="Enter registered phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
                setMessage("");
              }}
              autoComplete="tel"
              required
            />

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="team-login-button"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="login-spinner"></span>
                Logging in...
              </>
            ) : (
              <>
                🚨 Login as Rescue Team
              </>
            )}

          </button>

        </form>

        {/* ================= REGISTER ================= */}

        <div className="team-login-footer">

          <p>
            Not registered as a rescue team?
          </p>

          <button
            type="button"
            onClick={handleRegister}
            className="register-link"
          >
            Register Your Team
          </button>

        </div>

        {/* ================= SECURITY ================= */}

        <div className="login-security">
          🔒 Secure ResQNet Emergency Network
        </div>

      </div>

    </div>
  );
}

export default TeamLogin;