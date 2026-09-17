import React, { useState } from "react";
import "./logins.css";
import { useGoogleLogin } from "@react-oauth/google";
import { Capacitor } from "@capacitor/core";
import { performNativeGoogleSignIn } from "./utils/googleAuth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

export default function Login({
  onSignUpRedirect,
  onForgotPasswordRedirect,
  setCurrentPage,
  setIsAuthenticated,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        setSuccess("Welcome back! Redirecting...");
        if (typeof setCurrentPage === "function") {
          setCurrentPage("Dashboard");
        }
        navigate("/dashboard");
      } else {
        setError(data.message || "Google login failed.");
      }
    } catch (err) {
      console.error("CRITICAL GOOGLE LOGIN ERROR:", err);
      if (err && typeof err === 'object') {
        console.error("Error details:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      }
      setError(err?.message ? `Login failed: ${err.message}` : "Google login failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const webGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      authenticateWithBackend({ accessToken: tokenResponse.access_token });
    },
    onError: (err) => {
      console.error("Web Google Login Error:", err);
      setError("Google login was cancelled or failed.");
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
        console.error("Native Google Sign In Error:", err);
        if (err?.message !== "SIGN_IN_CANCELED" && err?.code !== "SIGN_IN_CANCELED") {
          setError(err?.message || "Google Sign-In failed on device.");
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      webGoogleLogin();
    }
  };

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

      if (typeof setIsAuthenticated === "function") {
        setIsAuthenticated(true);
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
      {/* Top Right Language Selector */}
      <LanguageSelector variant="auth" />

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
        <h2 className="login-card-title">{t("auth.loginTitle", "Welcome Back")}</h2>
        <p className="login-card-subtitle">
          {t("auth.loginSubtitle", "Enter your credentials to access your health dashboard.")}
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
              {t("auth.emailLabel", "Email Address")}
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
                placeholder={t("auth.emailPlaceholder", "name@example.com")}
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
                {t("auth.passwordLabel", "Password")}
              </label>
              <span
                className="forgot-password-link"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (onForgotPasswordRedirect) {
                    onForgotPasswordRedirect();
                  } else if (setCurrentPage) {
                    setCurrentPage("ForgotPassword");
                  } else {
                    navigate("/forgot-password");
                  }
                }}
              >
                {t("auth.forgotPassword", "Forgot Password?")}
              </span>
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
              Remember me
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            <span>{isLoading ? t("auth.signingIn", "Logging in...") : t("auth.signInBtn", "Login to Dashboard")}</span>
            {!isLoading && (
              <span className="material-symbols-outlined login-btn-arrow">
                arrow_forward
              </span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">{t("auth.orContinueWith", "OR CONTINUE WITH")}</div>

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

        {/* Redirect to Sign Up */}
        <div className="signup-redirect">
          {t("auth.dontHaveAccount", "Don't have an account?")}{" "}
          <span className="signup-link" onClick={onSignUpRedirect}>
            {t("auth.registerLink", "Create Account")}
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
