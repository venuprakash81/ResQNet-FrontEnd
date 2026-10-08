import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalLogin.css";

function HospitalLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://resqnet-backend-1.onrender.com/api/hospitals/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        setError(
          data.message ||
            data.error ||
            "Invalid email or password."
        );
        setLoading(false);
        return;
      }

      /*
       * ============================================
       * GET HOSPITAL DATA
       * ============================================
       */

      const hospitalData = data.hospital || data;

      const hospitalId =
        hospitalData.id ||
        hospitalData.hospitalId ||
        hospitalData._id ||
        data.hospitalId ||
        data.id ||
        data._id ||
        "";

      const hospitalName =
        hospitalData.name ||
        hospitalData.hospitalName ||
        data.name ||
        data.hospitalName ||
        "Hospital";

      const hospitalEmail =
        hospitalData.email ||
        data.email ||
        email.trim();

      /*
       * ============================================
       * CREATE HOSPITAL OBJECT
       * ============================================
       */

      const hospital = {
        ...hospitalData,

        id: hospitalId,

        hospitalId: hospitalId,

        _id: hospitalId,

        name: hospitalName,

        hospitalName: hospitalName,

        email: hospitalEmail,

        hospitalEmail: hospitalEmail,
      };

      console.log(
        "HOSPITAL SAVED:",
        hospital
      );

      /*
       * ============================================
       * SAVE HOSPITAL
       * ============================================
       */

      localStorage.setItem(
        "hospital",
        JSON.stringify(hospital)
      );

      localStorage.setItem(
        "hospitalId",
        String(hospitalId)
      );

      localStorage.setItem(
        "hospitalName",
        hospitalName
      );

      localStorage.setItem(
        "hospitalEmail",
        hospitalEmail
      );

      if (data.token) {
        localStorage.setItem(
          "hospitalToken",
          data.token
        );

        localStorage.setItem(
          "token",
          data.token
        );
      }

      /*
       * ============================================
       * OPEN DASHBOARD
       * ============================================
       */

      navigate("/hospital/dashboard", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "HOSPITAL LOGIN ERROR:",
        error
      );

      setError(
        "Unable to connect to Spring Boot server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hospital-login-page">

      <div className="hospital-login-card">

        <div className="hospital-login-icon">
          🏥
        </div>

        <h1>
          Hospital Login
        </h1>

        <p className="hospital-login-subtitle">
          Sign in to access your hospital dashboard
        </p>

        <form onSubmit={handleSubmit}>

          <div className="hospital-input-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter hospital email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
            />

          </div>

          <div className="hospital-input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
            />

          </div>

          {error && (
            <div className="hospital-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="hospital-login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <div className="hospital-register-link">

          Don't have a hospital account?{" "}

          <span
            onClick={() =>
              navigate("/register/hospital")
            }
          >
            Register
          </span>

        </div>

      </div>

    </div>
  );
}

export default HospitalLogin;
