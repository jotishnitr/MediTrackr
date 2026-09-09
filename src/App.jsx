import Navbar from "./Navbar";
import Dashboard from "./Dashboard";
import MyMedicines from "./MyMedicines";
import SearchMedicine from "./SearchMedicine";
import Reminders from "./Reminders";
import HealthLog from "./HealthLog";
import ProfileModal from "./ProfileModal";
import Login from "./logins";
import Register from "./Register";
import HelpBot from "./HelpBot";
import AiAssistance from "./AiAssistant";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

import React from "react";
import { useLocation, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { subscribeUser } from "./utils/pushNotification";

// Mapping between routes and section page names
const pathToPageMap = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/myMedicines": "myMedicines",
  "/medicines": "myMedicines",
  "/remainders": "Remainders",
  "/reminders": "Remainders",
  "/searchMedicines": "SearchMedicines",
  "/search": "SearchMedicines",
  "/healthLog": "HealthLog",
  "/aiHealthAssistance": "aiHealthAssistance",
  "/ai-assistant": "aiHealthAssistance",
  "/register": "Register",
  "/login": "Login",
  "/forgot-password": "ForgotPassword",
};

const pageToPathMap = {
  Dashboard: "/dashboard",
  myMedicines: "/myMedicines",
  Remainders: "/remainders",
  SearchMedicines: "/searchMedicines",
  HealthLog: "/healthLog",
  aiHealthAssistance: "/aiHealthAssistance",
  Register: "/register",
  Login: "/login",
  ForgotPassword: "/forgot-password",
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive active section name from current URL path
  const normalizedPath = location.pathname.toLowerCase();
  const currentPage =
    pathToPageMap[location.pathname] ||
    (normalizedPath.includes("forgot-password")
      ? "ForgotPassword"
      : normalizedPath.includes("reset-password")
      ? "ResetPassword"
      : normalizedPath.includes("login")
      ? "Login"
      : normalizedPath.includes("register")
      ? "Register"
      : normalizedPath.includes("search")
      ? "SearchMedicines"
      : normalizedPath.includes("medicine")
      ? "myMedicines"
      : normalizedPath.includes("remaind") || normalizedPath.includes("remind")
      ? "Remainders"
      : normalizedPath.includes("healthlog")
      ? "HealthLog"
      : normalizedPath.includes("ai")
      ? "aiHealthAssistance"
      : "Dashboard");

  // Router-aware page switcher for all child components
  const setCurrentPage = (pageName) => {
    const targetPath = pageToPathMap[pageName] || `/${pageName}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const [showAddMed, setShowAddMed] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [showHelpBot, setShowHelpBot] = React.useState(false);

  React.useEffect(() => {
    async function init() {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register(
            `${import.meta.env.BASE_URL}service-worker.js`,
            {
              scope: import.meta.env.BASE_URL,
            },
          );

          await subscribeUser();
        } catch (err) {
          console.error(
            "Service Worker registration/subscription failed:",
            err,
          );
        }
      }

      if ("Notification" in window) {
        try {
          const permission = await Notification.requestPermission();
          console.log("Notification permission status:", permission);
        } catch (err) {
          console.error("Notification permission request failed:", err);
        }
      }
    }

    init();
  }, []);

  React.useEffect(() => {
    function handleMessage(event) {
      console.log("Received message:", event.data);

      if (event.data.type === "PLAY_NOTIFICATION_SOUND") {
        console.log("Playing sound...");

        const audio = new Audio("/sounds/notificationSound.mp3");
        audio.volume = 1;

        audio
          .play()
          .then(() => {
            console.log("Audio started");
          })
          .catch((err) => {
            console.error("Audio failed:", err);
          });
      }
    }

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  React.useEffect(() => {
    async function getCurrentUser() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/getCurrentUser`,
          { credentials: "include" },
        );
        const data = await response.json();
        if (data.success) {
          if (location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/") {
            navigate("/dashboard");
          }
        } else {
          if (location.pathname !== "/login" && location.pathname !== "/register") {
            navigate("/register");
          }
        }
      } catch (err) {
        if (location.pathname !== "/login" && location.pathname !== "/register") {
          navigate("/register");
        }
      }
    }
    getCurrentUser();
  }, []);

  const [medicines, setMedicines] = React.useState([]);
  React.useEffect(() => {
    async function loadMedicines() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/getMedicine`,
          { credentials: "include" },
        );
        if (response.status === 401) {
          setMedicines([]);
          return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setMedicines(data);
        } else {
          setMedicines([]);
        }
      } catch (err) {
        console.error("Failed to load medicines:", err);
        setMedicines([]);
      }
    }

    if (currentPage !== "Register" && currentPage !== "Login") {
      loadMedicines();
    }
  }, [currentPage]);

  // Profile modal states
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [profileDetails, setProfileDetails] = React.useState({
    name: "User Name",
    age: "",
    bloodType: "",
    height: "",
    weight: "",
    allergies: "",
    emergencyContact: "",
    email: "",
  });

  // Lifted vitals and symptoms state with safe initializers (null if not logged today)
  const [sleepHours, setSleepHours] = React.useState(null);
  const [bloodPressure, setBloodPressure] = React.useState(null);
  const [weight, setWeight] = React.useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = React.useState([]);
  const [notes, setNotes] = React.useState("");
  const [lastSaved, setLastSaved] = React.useState("");

  async function getHealthLog() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/healthLog/api`,
        { credentials: "include" },
      );
      if (response.status === 401) return;
      const data = await response.json();

      if (!data || data.success === false || data === null) {
        setSleepHours(null);
        setBloodPressure(null);
        setWeight(null);
        setSelectedSymptoms([]);
        setNotes("");
        setLastSaved("");
        return;
      }

      setSleepHours(data.sleepHours ?? null);
      setBloodPressure(data.bloodPressure || null);
      setWeight(data.weight ?? null);
      setSelectedSymptoms(data.symptoms || []);
      setNotes(data.notes || "");
      setLastSaved(data.date || "");
    } catch (err) {
      console.error("Failed to load health log:", err);
      setSleepHours(null);
      setBloodPressure(null);
      setWeight(null);
      setSelectedSymptoms([]);
      setNotes("");
      setLastSaved("");
    }
  }

  async function fetchHealthProfile() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/getHealthProfile`,
        { credentials: "include" },
      );
      if (response.status === 401) return;
      const data = await response.json();
      if (data && data.success && data.profile) {
        const profile = data.profile;
        const details = {
          name: profile.fullName || "",
          age: profile.age || "",
          bloodType: profile.bloodType || "",
          height: profile.height || "",
          weight: profile.weight || "",
          allergies: profile.allergies || "",
          emergencyContact: profile.emergencyContact || "",
          email: profile.email || "",
        };
        setProfileDetails(details);
      }
    } catch (err) {
      console.error("Failed to load health profile:", err);
    }
  }

  const isAuthPage =
    currentPage === "Register" ||
    currentPage === "Login" ||
    currentPage === "ForgotPassword" ||
    currentPage === "ResetPassword" ||
    normalizedPath.includes("login") ||
    normalizedPath.includes("register") ||
    normalizedPath.includes("forgot-password") ||
    normalizedPath.includes("reset-password");

  React.useEffect(() => {
    if (!isAuthPage) {
      getHealthLog();
      fetchHealthProfile();
    }
  }, [currentPage, isAuthPage]);

  return (
    <>
      {!isAuthPage && (
        <Navbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          profileDetails={profileDetails}
          setShowProfileModal={setShowProfileModal}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                showAddMed={showAddMed}
                setShowAddMed={setShowAddMed}
                medicines={medicines}
                setMedicines={setMedicines}
                sleepHours={sleepHours}
                bloodPressure={bloodPressure}
                weight={weight}
                selectedSymptoms={selectedSymptoms}
                notes={notes}
                profileDetails={profileDetails}
              />
            }
          />
          <Route
            path="/myMedicines"
            element={
              <MyMedicines
                setShowAddMed={setShowAddMed}
                showAddMed={showAddMed}
                medicines={medicines}
                setCurrentPage={setCurrentPage}
              />
            }
          />
          <Route path="/medicines" element={<Navigate to="/myMedicines" replace />} />
          <Route
            path="/remainders"
            element={
              <Reminders
                medicines={medicines}
                setMedicines={setMedicines}
                setCurrentPage={setCurrentPage}
                setShowAddMed={setShowAddMed}
              />
            }
          />
          <Route path="/reminders" element={<Navigate to="/remainders" replace />} />
          <Route
            path="/searchMedicines"
            element={
              <SearchMedicine
                setCurrentPage={setCurrentPage}
                setShowAddMed={setShowAddMed}
              />
            }
          />
          <Route path="/search" element={<Navigate to="/searchMedicines" replace />} />
          <Route
            path="/healthLog"
            element={
              <HealthLog
                getHealthLog={getHealthLog}
                setCurrentPage={setCurrentPage}
                setShowAddMed={setShowAddMed}
                sleepHours={sleepHours}
                setSleepHours={setSleepHours}
                bloodPressure={bloodPressure}
                setBloodPressure={setBloodPressure}
                weight={weight}
                setWeight={setWeight}
                selectedSymptoms={selectedSymptoms}
                setSelectedSymptoms={setSelectedSymptoms}
                notes={notes}
                setNotes={setNotes}
                lastSaved={lastSaved}
                setLastSaved={setLastSaved}
              />
            }
          />
          <Route
            path="/aiHealthAssistance"
            element={
              <AiAssistance
                profileDetails={profileDetails}
              />
            }
          />
          <Route path="/ai-assistant" element={<Navigate to="/aiHealthAssistance" replace />} />
          <Route
            path="/register"
            element={
              <Register
                setCurrentPage={setCurrentPage}
                onSignInRedirect={() => setCurrentPage("Login")}
              />
            }
          />
          <Route
            path="/login"
            element={
              <Login
                setCurrentPage={setCurrentPage}
                onSignUpRedirect={() => setCurrentPage("Register")}
                onForgotPasswordRedirect={() => setCurrentPage("ForgotPassword")}
              />
            }
          />
          <Route
            path="/forgot-password"
            element={
              <ForgotPassword
                setCurrentPage={setCurrentPage}
                onSignInRedirect={() => setCurrentPage("Login")}
              />
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <ResetPassword
                setCurrentPage={setCurrentPage}
                onSignInRedirect={() => setCurrentPage("Login")}
              />
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>

      {showProfileModal && (
        <ProfileModal
          profileDetails={profileDetails}
          setProfileDetails={setProfileDetails}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {!isAuthPage && (
        <>
          {showHelpBot ? (
            <HelpBot
              setShowHelpBot={setShowHelpBot}
              showHelpBot={showHelpBot}
            />
          ) : (
            <div
              className="chatbot-launcher"
              onClick={() => setShowHelpBot(true)}
            >
              <img src="forum.png" alt="Help Bot Launcher" />
            </div>
          )}
        </>
      )}
    </>
  );
}
