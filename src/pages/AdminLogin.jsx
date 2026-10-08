import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "https://resqnet-backend-1.onrender.com/api/admin/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Invalid email or password"
                );
            }

            localStorage.setItem("adminLoggedIn", "true");

            localStorage.setItem(
                "admin",
                JSON.stringify({
                    id: data.id,
                    name: data.name,
                    email: data.email
                })
            );

            navigate("/admin/dashboard");

        } catch (err) {
            console.error("Admin login error:", err);
            setError(
                err.message || "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">

                <div className="admin-login-logo">
                    🛡️
                </div>

                <h1>Admin Login</h1>

                <p className="admin-login-subtitle">
                    Welcome to ResQNet Administration
                </p>

                <form onSubmit={handleSubmit}>

                    <label htmlFor="admin-email">
                        Email Address
                    </label>

                    <input
                        id="admin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        autoComplete="username"
                        required
                    />

                    <label htmlFor="admin-password">
                        Password
                    </label>

                    <input
                        id="admin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        autoComplete="current-password"
                        required
                    />

                    {error && (
                        <div
                            className="admin-login-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Please wait..." : "Login"}
                    </button>

                </form>

                <div className="admin-login-footer">
                    ResQNet Emergency Healthcare Network
                </div>

            </div>
        </div>
    );
}

export default AdminLogin;
