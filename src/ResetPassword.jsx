import React, { useState } from "react";
import "./logins.css";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword({ setCurrentPage, onSignInRedirect }) {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      setError("Please fill out both password fields.");
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

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password, confirmPassword }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to reset password. The link may have expired.",
        );
      }

      setSuccess(
        "Password reset successfully! Redirecting you to login...",
      );

      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        if (onSignInRedirect) {
          onSignInRedirect();
        } else if (setCurrentPage) {
          setCurrentPage("Login");
        } else {
          navigate("/login");
        }
      }, 2000);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (onSignInRedirect) {
      onSignInRedirect();
    } else if (setCurrentPage) {
      setCurrentPage("Login");
    } else {
      navigate("/login");
    }
  };

  const handleRequestNewLink = () => {
    if (setCurrentPage) {
      setCurrentPage("ForgotPassword");
    } else {
      navigate("/forgot-password");
    }
  };

  return (
    <div className="login-page-container">
      {/* Brand Header Row */}
      <div className="login-header-row">
        <img
          className="register-page-logo-img"
          src="icon.png"
          alt="MediTrackr Logo"
        />
        <span className="login-brand-name">MediTrackr</span>
      </div>

      {/* Main Reset Password Card */}
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
              key
            </span>
          </div>
          <h2 className="login-card-title">Set New Password</h2>
          <p className="login-card-subtitle" style={{ marginBottom: "20px" }}>
            Please enter your new password below. Make sure it has at least 6
            characters.
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
            {error.toLowerCase().includes("expired") && (
              <div style={{ marginTop: "8px" }}>
                <span
                  onClick={handleRequestNewLink}
                  style={{
                    color: "#4edea3",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: "500",
                  }}
                >
                  Click here to request a new link
                </span>
              </div>
            )}
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
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>
              ✓ Success!
            </div>
            {success}
          </div>
        )}

        {!success ? (
          <form className="login-form" onSubmit={handleResetPassword}>
            {/* New Password Input */}
            <div className="login-form-group">
              <label className="login-form-label" htmlFor="new-password">
                New Password
              </label>
              <div className="login-input-wrapper">
                <span className="material-symbols-outlined login-input-icon-left">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="new-password"
                  name="password"
                  className="login-form-input"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="login-input-icon-right material-symbols-outlined"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "visibility_off" : "visibility"}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="login-form-group">
              <label className="login-form-label" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <div className="login-input-wrapper">
                <span className="material-symbols-outlined login-input-icon-left">
                  lock_reset
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  name="confirmPassword"
                  className="login-form-input"
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="login-input-icon-right material-symbols-outlined"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              <span>
                {isLoading ? "Updating Password..." : "Update Password"}
              </span>
              {!isLoading && (
                <span className="material-symbols-outlined login-btn-arrow">
                  check_circle
                </span>
              )}
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="login-submit-btn"
            onClick={handleGoToLogin}
            style={{ marginTop: "10px" }}
          >
            <span>Go to Login Now</span>
            <span className="material-symbols-outlined login-btn-arrow">
              arrow_forward
            </span>
          </button>
        )}

        {/* Back to Login Link */}
        <div className="signup-redirect" style={{ marginTop: "24px" }}>
          Remember your password?{" "}
          <span className="signup-link" onClick={handleGoToLogin}>
            Back to Login
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
