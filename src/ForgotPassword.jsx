import React, { useState } from "react";
import "./logins.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

export default function ForgotPassword({ setCurrentPage, onSignInRedirect }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send reset link.");
      }

      setSuccess(
        data.message ||
          "Password reset link has been sent! Please check your inbox.",
      );
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (onSignInRedirect) {
      onSignInRedirect();
    } else if (setCurrentPage) {
      setCurrentPage("Login");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="login-page-container">
      {/* Top Right Language Selector */}
      <LanguageSelector variant="auth" />

      {/* Brand Header Row */}
      <div className="login-header-row">
        <img
          className="register-page-logo-img"
          src="icon.png"
          alt="MediTrackr Logo"
        />
        <span className="login-brand-name">MediTrackr</span>
      </div>

      {/* Main Forgot Password Card */}
      <main className="login-card">
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(78, 222, 163, 0.12)",
              color: "#4edea3",
              marginBottom: "12px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "30px" }}
            >
              lock_reset
            </span>
          </div>
          <h2 className="login-card-title">{t("auth.forgotPassword", "Forgot Password?")}</h2>
          <p className="login-card-subtitle" style={{ marginBottom: "20px" }}>
            Enter your registered email address and we'll send you a secure link to reset your password.
          </p>
        </div>

        {error && (
          <div
            className="error-text"
            style={{
              marginBottom: "16px",
              background: "rgba(255, 94, 94, 0.1)",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 94, 94, 0.2)",
              fontSize: "14px",
              color: "#ff8080",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "20px",
              color: "#4edea3",
              background: "rgba(78, 222, 163, 0.12)",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(78, 222, 163, 0.3)",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>
              ✓ Email Dispatched
            </div>
            {success}
          </div>
        )}

        {!success ? (
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="login-form-group">
              <label className="login-form-label" htmlFor="reset-email">
                {t("auth.emailLabel", "Email Address")}
              </label>
              <div className="login-input-wrapper">
                <span className="material-symbols-outlined login-input-icon-left">
                  mail
                </span>
                <input
                  type="email"
                  id="reset-email"
                  name="email"
                  className="login-form-input"
                  placeholder={t("auth.emailPlaceholder", "name@example.com")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              <span>{isLoading ? "Sending link..." : "Send Reset Link"}</span>
              {!isLoading && (
                <span className="material-symbols-outlined login-btn-arrow">
                  send
                </span>
              )}
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="login-submit-btn"
            onClick={handleBackToLogin}
            style={{ marginTop: "10px" }}
          >
            <span>Return to Login</span>
            <span className="material-symbols-outlined login-btn-arrow">
              arrow_forward
            </span>
          </button>
        )}

        {/* Back to Login Link */}
        <div className="signup-redirect" style={{ marginTop: "24px" }}>
          Remember your password?{" "}
          <span className="signup-link" onClick={handleBackToLogin}>
            {t("auth.loginLink", "Sign In")}
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
