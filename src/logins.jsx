import React, { useState } from "react";
import "./logins.css";
import { GoogleLogin } from "@react-oauth/google";
export default function Login({ onSignUpRedirect, setCurrentPage }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error on input change
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { email, password } = formData;

    if (!email.trim() || !password) {
      setError("Please fill out all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials.");
      }

      setSuccess("Welcome back! Redirecting...");
      setCurrentPage("Dashboard");
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Brand Header Row */}
      <div className="login-header-row">
        <img
          className="register-page-logo-img"
          src="icon.png"
          alt="Register-page-brand-logo"
        ></img>
        <span className="login-brand-name">MediTrackr</span>
      </div>

      {/* Main Login Card */}
      <main className="login-card">
        <h2 className="login-card-title">Welcome Back</h2>
        <p className="login-card-subtitle">
          Enter your credentials to access your health dashboard.
        </p>

        {error && (
          <div
            className="error-text"
            style={{
              marginBottom: "16px",
              background: "rgba(255, 94, 94, 0.1)",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 94, 94, 0.2)",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "16px",
              color: "#4edea3",
              background: "rgba(78, 222, 163, 0.1)",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid rgba(78, 222, 163, 0.2)",
              fontSize: "14px",
            }}
          >
            {success}
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="login-form-group">
            <label className="login-form-label" htmlFor="email">
              Email Address
            </label>
            <div className="login-input-wrapper">
              <span className="material-symbols-outlined login-input-icon-left">
                mail
              </span>
              <input
                type="email"
                id="email"
                name="email"
                className="login-form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="login-form-group">
            <div className="login-label-row">
              <label className="login-form-label" htmlFor="password">
                Password
              </label>
              <span className="forgot-password-link">Forgot Password?</span>
            </div>
            <div className="login-input-wrapper">
              <span className="material-symbols-outlined login-input-icon-left">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="login-form-input"
                placeholder="********"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="login-input-icon-right material-symbols-outlined"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "visibility_off" : "visibility"}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="remember-me-container">
            <input
              type="checkbox"
              id="rememberMe"
              className="login-custom-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="remember-me-text">
              Remember me for 30 days
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            <span>{isLoading ? "Logging in..." : "Login to Dashboard"}</span>
            {!isLoading && (
              <span className="material-symbols-outlined login-btn-arrow">
                arrow_forward
              </span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">OR CONTINUE WITH</div>

        <div className="google-auth-btn-wrapper">
          <GoogleLogin
            theme="outline"
            shape="rectangular"
            size="large"
            width="360"
            onSuccess={async (credentialResponse) => {
              try {
                const response = await fetch(
                  `${import.meta.env.VITE_API_URL}/googleLogin`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                      credential: credentialResponse.credential,
                    }),
                  },
                );

                const data = await response.json();
                if (data.success) {
                  setSuccess("Welcome back! Redirecting...");
                  setCurrentPage("Dashboard");
                } else {
                  setError(data.message || "Google login failed.");
                }
              } catch (error) {
                console.error(error);
                setError("Google login failed. Please try again.");
              }
            }}
            onError={() => {
              console.log("Google Login Failed");
              setError("Google Login Failed");
            }}
          />
        </div>

        {/* Redirect to Sign Up */}
        <div className="signup-redirect">
          Don't have an account?{" "}
          <span className="signup-link" onClick={onSignUpRedirect}>
            Create Account
          </span>
        </div>
      </main>

      {/* Bottom Footer Links */}
      <footer className="login-outer-footer">
        <span className="outer-footer-link">Privacy Policy</span>
        <span className="outer-footer-dot">•</span>
        <span className="outer-footer-link">Terms of Service</span>
      </footer>
    </div>
  );
}
