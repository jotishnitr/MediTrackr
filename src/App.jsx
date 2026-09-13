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
import MedicineModal from "./MedicineModal";
import NotificationModal from "./NotificationModal";

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

  const [isMedicineModalOpen, setIsMedicineModalOpen] = React.useState(false);
  const [editingMedicine, setEditingMedicine] = React.useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [showHelpBot, setShowHelpBot] = React.useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = React.useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = React.useState(0);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/getNotifications`, {
        credentials: "include",
      });
      if (res.status === 401) return;
      const data = await res.json();
      if (data && data.success && Array.isArray(data.notifications)) {
        setUnreadNotificationsCount(data.notifications.length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications count:", err);
    }
  };

  const handleOpenNotificationModal = () => {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    setIsNotificationModalOpen(true);
  };

  const handleOpenAddMedicine = (initialData = null) => {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    setEditingMedicine(
      initialData && typeof initialData === "object" && initialData.name
        ? initialData
        : null
    );
    setIsMedicineModalOpen(true);
  };

  const handleOpenEditMedicine = (med) => {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    setEditingMedicine(med);
    setIsMedicineModalOpen(true);
  };

  const handleCloseMedicineModal = () => {
    setIsMedicineModalOpen(false);
    setEditingMedicine(null);
  };

  const handleSaveMedicine = (savedMed, mode) => {
    if (mode === "add") {
      setMedicines((prev) => [
        ...(Array.isArray(prev) ? prev.filter(Boolean) : []),
        savedMed,
      ]);
    } else if (mode === "update") {
      setMedicines((prev) =>
        (Array.isArray(prev) ? prev.filter(Boolean) : []).map((m) =>
          m._id === savedMed._id ? savedMed : m
        )
      );
    }
  };

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

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // Helper to guard auth-required actions
  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      navigate("/login");
      return false;
    }
    if (typeof callback === "function") {
      callback();
    }
    return true;
  };

  React.useEffect(() => {
    async function getCurrentUser() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/getCurrentUser`,
          { credentials: "include" },
        );
        const data = await response.json();
        const path = location.pathname.toLowerCase();
        const isAuthRoute =
          path.includes("login") ||
          path.includes("register") ||
          path.includes("forgot-password") ||
          path.includes("reset-password");

        if (data.success) {
          setIsAuthenticated(true);
          if (isAuthRoute || path === "/") {
            navigate("/dashboard");
          }
        } else {
          setIsAuthenticated(false);
          // If on root, route to dashboard without redirecting unauthenticated users to login
          if (path === "/") {
            navigate("/dashboard");
          }
        }
      } catch (err) {
        setIsAuthenticated(false);
        const path = location.pathname.toLowerCase();
        if (path === "/") {
          navigate("/dashboard");
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
    familyMembersEmails: [],
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
          familyMembersEmails: profile.familyMembersEmails || [],
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
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
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
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          requireAuth={requireAuth}
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
                medicines={medicines}
                setMedicines={setMedicines}
                onOpenAddMedicine={handleOpenAddMedicine}
                onOpenEditMedicine={handleOpenEditMedicine}
                sleepHours={sleepHours}
                bloodPressure={bloodPressure}
                weight={weight}
                selectedSymptoms={selectedSymptoms}
                notes={notes}
                profileDetails={profileDetails}
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
                requireAuth={requireAuth}
                unreadNotificationsCount={unreadNotificationsCount}
                onOpenNotificationModal={handleOpenNotificationModal}
              />
            }
          />
          <Route
            path="/myMedicines"
            element={
              <MyMedicines
                medicines={medicines}
                setMedicines={setMedicines}
                onOpenAddMedicine={handleOpenAddMedicine}
                onOpenEditMedicine={handleOpenEditMedicine}
                setCurrentPage={setCurrentPage}
                requireAuth={requireAuth}
                setIsAuthenticated={setIsAuthenticated}
                unreadNotificationsCount={unreadNotificationsCount}
                onOpenNotificationModal={handleOpenNotificationModal}
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
                onOpenAddMedicine={handleOpenAddMedicine}
                onOpenEditMedicine={handleOpenEditMedicine}
                setCurrentPage={setCurrentPage}
                requireAuth={requireAuth}
                setIsAuthenticated={setIsAuthenticated}
                unreadNotificationsCount={unreadNotificationsCount}
                onOpenNotificationModal={handleOpenNotificationModal}
              />
            }
          />
          <Route path="/reminders" element={<Navigate to="/remainders" replace />} />
          <Route
            path="/searchMedicines"
            element={
              <SearchMedicine
                setCurrentPage={setCurrentPage}
                onOpenAddMedicine={handleOpenAddMedicine}
                requireAuth={requireAuth}
                setIsAuthenticated={setIsAuthenticated}
                unreadNotificationsCount={unreadNotificationsCount}
                onOpenNotificationModal={handleOpenNotificationModal}
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
                onOpenAddMedicine={handleOpenAddMedicine}
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
                requireAuth={requireAuth}
                setIsAuthenticated={setIsAuthenticated}
                unreadNotificationsCount={unreadNotificationsCount}
                onOpenNotificationModal={handleOpenNotificationModal}
              />
            }
          />
          <Route
            path="/aiHealthAssistance"
            element={
              <AiAssistance
                profileDetails={profileDetails}
                requireAuth={requireAuth}
                setCurrentPage={setCurrentPage}
                setIsAuthenticated={setIsAuthenticated}
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
                setIsAuthenticated={setIsAuthenticated}
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
                setIsAuthenticated={setIsAuthenticated}
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

      {isMedicineModalOpen && (
        <MedicineModal
          isOpen={isMedicineModalOpen}
          onClose={handleCloseMedicineModal}
          medicineData={editingMedicine}
          onSave={handleSaveMedicine}
          requireAuth={requireAuth}
          setIsAuthenticated={setIsAuthenticated}
          setCurrentPage={setCurrentPage}
        />
      )}

      {isNotificationModalOpen && (
        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          requireAuth={requireAuth}
          setCurrentPage={setCurrentPage}
          setIsAuthenticated={setIsAuthenticated}
          onNotificationRead={(remainingCount) => setUnreadNotificationsCount(remainingCount)}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          profileDetails={profileDetails}
          setProfileDetails={setProfileDetails}
          onClose={() => setShowProfileModal(false)}
          requireAuth={requireAuth}
          setCurrentPage={setCurrentPage}
          setIsAuthenticated={setIsAuthenticated}
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
