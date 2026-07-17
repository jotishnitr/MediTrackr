import React, { useState } from "react";
import "./Register.css";
import { GoogleLogin } from "@react-oauth/google";

export default function Register({ onSignInRedirect, setCurrentPage }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { name, email, password, confirmPassword } = formData;

    // Simple validations
    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to register account.");
      }

      setSuccess(data.message || "Account registered successfully!");
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setAgreeToTerms(false);

      setCurrentPage("Login");
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      {/* Brand Header */}
      <header className="register-header">
        <span className="logo-plus"><img className="register-page-logo-img" src="icon.png" alt="Register-page-brand-logo"></img></span>

        <h1 className="brand-name">MediTrack</h1>
        <span className="tagline-badge">PRECISION HEALTH OS</span>
      </header>

      {/* Main Card */}
      <main className="register-card">
        <h2 className="card-title">Create Account</h2>
        <p className="card-subtitle">
          Access the next generation of personalized health management tools.
        </p>

        {error && <div className="error-text" style={{ marginBottom: "16px", background: "rgba(255, 94, 94, 0.1)", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255, 94, 94, 0.2)" }}>{error}</div>}
        {success && <div style={{ marginBottom: "16px", color: "#4edea3", background: "rgba(78, 222, 163, 0.1)", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(78, 222, 163, 0.2)", fontSize: "14px" }}>{success}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon">person</span>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined input-icon">alternate_email</span>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="name@organization.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Password & Confirm Row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">shield</span>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="********"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Terms and Privacy Checkbox */}
          <div className="terms-container">
            <input
              type="checkbox"
              id="terms"
              className="custom-checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
            />
            <label htmlFor="terms" className="terms-text">
              I agree to the{" "}
              <span className="terms-link">Terms of Service</span> and{" "}
              <span className="terms-link">Privacy Policy</span>.
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            <span>{isLoading ? "Creating..." : "Create Account"}</span>
            {!isLoading && <span className="material-symbols-outlined btn-arrow">arrow_forward</span>}
          </button>
        </form>

        {/* Divider */}
        <div className="register-divider">OR CONTINUE WITH</div>

        {/* Google Login */}
        <div className="google-auth-btn-wrapper">
          <GoogleLogin
            theme="outline"
            shape="rectangular"
            size="large"
            width="360"
            onSuccess={async (credentialResponse) => {
              try {
                const response = await fetch("http://localhost:5000/googleLogin", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    credential: credentialResponse.credential,
                  }),
                });

                const data = await response.json();
                if (data.success) {
                  setSuccess("Account verified! Redirecting to Dashboard...");
                  setCurrentPage("Dashboard");
                } else {
                  setError(data.message || "Google registration failed.");
                }
              } catch (error) {
                console.error(error);
                setError("Google registration failed. Please try again.");
              }
            }}
            onError={() => {
              console.log("Google Registration Failed");
              setError("Google Registration Failed");
            }}
          />
        </div>

        {/* Redirect to Sign In */}
        <div className="signin-redirect">
          Already have an account?{" "}
          <span className="signin-link" onClick={onSignInRedirect}>
            Sign In <span className="material-symbols-outlined signin-icon">login</span>
          </span>
        </div>
      </main>

      {/* Footer Badges */}
      <footer className="register-footer">
        <div className="badge-item">
          <span className="material-symbols-outlined badge-icon">security</span>
          <span className="badge-text">END-TO-END ENCRYPTION</span>
        </div>
        <div className="badge-item">
          <span className="material-symbols-outlined badge-icon">health_and_safety</span>
          <span className="badge-text">HIPAA COMPLIANT</span>
        </div>
      </footer>
    </div>
  );
}
