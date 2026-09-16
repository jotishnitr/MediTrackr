import React, { useState } from "react";
import "./Register.css";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

export default function Register({ onSignInRedirect, setCurrentPage, setIsAuthenticated }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
      setError(
        err.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      {/* Top Right Language Selector */}
      <LanguageSelector variant="auth" />

      {/* Brand Header */}
      <div className="register-header-row">
        <img
          className="register-page-logo-img"
          src="icon.png"
          alt="Register-page-brand-logo"
        />
        <div className="register-brand-title-wrap">
          <span className="register-brand-name">MediTrackr</span>
          <span className="register-tagline-badge">PRECISION HEALTH OS</span>
        </div>
      </div>

      {/* Main Card */}
      <main className="register-card">
        <h2 className="card-title">{t("auth.registerTitle", "Create Account")}</h2>
        <p className="card-subtitle">
          {t("auth.registerSubtitle", "Access the next generation of personalized health management tools.")}
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

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="register-form-group">
            <label className="register-form-label" htmlFor="name">
              {t("auth.nameLabel", "Full Name")}
            </label>
            <div className="register-input-wrapper">
              <span className="material-symbols-outlined register-input-icon-left">
                person
              </span>
              <input
                type="text"
                id="name"
                name="name"
                className="register-form-input"
                placeholder={t("auth.namePlaceholder", "Enter your full name")}
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="register-form-group">
            <label className="register-form-label" htmlFor="email">
              {t("auth.emailLabel", "Email Address")}
            </label>
            <div className="register-input-wrapper">
              <span className="material-symbols-outlined register-input-icon-left">
                mail
              </span>
              <input
                type="email"
                id="email"
                name="email"
                className="register-form-input"
                placeholder={t("auth.emailPlaceholder", "name@example.com")}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Password & Confirm Row */}
          <div className="register-form-row">
            <div className="register-form-group">
              <label className="register-form-label" htmlFor="password">
                {t("auth.passwordLabel", "Password")}
              </label>
              <div className="register-input-wrapper">
                <span className="material-symbols-outlined register-input-icon-left">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="register-form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="register-input-icon-right material-symbols-outlined"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "visibility_off" : "visibility"}
                </button>
              </div>
            </div>

            <div className="register-form-group">
              <label className="register-form-label" htmlFor="confirmPassword">
                {t("auth.confirmPasswordLabel", "Confirm Password")}
              </label>
              <div className="register-input-wrapper">
                <span className="material-symbols-outlined register-input-icon-left">
                  shield
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="register-form-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="register-input-icon-right material-symbols-outlined"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Privacy Checkbox */}
          <div className="register-terms-container">
            <input
              type="checkbox"
              id="terms"
              className="register-custom-checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
            />
            <label htmlFor="terms" className="register-terms-text">
              I agree to the{" "}
              <span className="register-terms-link">Terms of Service</span> and{" "}
              <span className="register-terms-link">Privacy Policy</span>.
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="register-submit-btn" disabled={isLoading}>
            <span>{isLoading ? t("auth.signingUp", "Creating...") : t("auth.signUpBtn", "Create Account")}</span>
            {!isLoading && (
              <span className="material-symbols-outlined register-btn-arrow">
                arrow_forward
              </span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="register-divider">{t("auth.orContinueWith", "OR CONTINUE WITH")}</div>

        {/* Google Login */}
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
                  if (typeof setIsAuthenticated === "function") {
                    setIsAuthenticated(true);
                  }
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
          {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
          <span className="signin-link" onClick={onSignInRedirect}>
            {t("auth.loginLink", "Sign In")}{" "}
            <span className="material-symbols-outlined signin-icon">login</span>
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
          <span className="material-symbols-outlined badge-icon">
            health_and_safety
          </span>
          <span className="badge-text">HIPAA COMPLIANT</span>
        </div>
      </footer>
    </div>
  );
}
