import React, { useState } from "react";
import "./Register.css";
import { useGoogleLogin } from "@react-oauth/google";
import { Capacitor } from "@capacitor/core";
import { performNativeGoogleSignIn } from "./utils/googleAuth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

export default function Register({ onSignInRedirect, setCurrentPage, setIsAuthenticated }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const authenticateWithBackend = async (authPayload) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/googleLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(authPayload),
      });

      const data = await response.json();
      if (data.success) {
        if (typeof setIsAuthenticated === "function") {
          setIsAuthenticated(true);
        }
        setSuccess("Account verified! Redirecting to Dashboard...");
        if (typeof setCurrentPage === "function") {
          setCurrentPage("Dashboard");
        }
        navigate("/dashboard");
      } else {
        setError(data.message || "Google registration failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Google registration failed. Please check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const webGoogleRegister = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      authenticateWithBackend({ accessToken: tokenResponse.access_token });
    },
    onError: (err) => {
      console.error("Web Google Register Error:", err);
      setError("Google registration was cancelled or failed.");
    },
  });

  const handleGoogleClick = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        setIsLoading(true);
        setError("");
        const nativeResult = await performNativeGoogleSignIn();
        if (nativeResult) {
          await authenticateWithBackend(nativeResult);
        }
      } catch (err) {
        console.error("Native Google Register Error:", err);
        if (err?.message !== "SIGN_IN_CANCELED" && err?.code !== "SIGN_IN_CANCELED") {
          setError(err?.message || "Google Sign-In failed on device.");
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      webGoogleRegister();
    }
  };

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
          <button
            type="button"
            className="google-custom-btn"
            onClick={() => handleGoogleClick()}
            disabled={isLoading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>{t("auth.continueWithGoogle", "Continue with Google")}</span>
          </button>
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
