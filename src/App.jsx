import Navbar from "./Navbar";
import Dashboard from "./Dashboard";
import MyMedicines from "./MyMedicines";
import SearchMedicine from "./SearchMedicine";
import Reminders from "./Reminders";
import HealthLog from "./HealthLog";
import ProfileModal from "./ProfileModal";
import Login from "./logins";
import Register from "./Register"

import React from "react";
import { AnimatePresence } from "framer-motion";
import { subscribeUser } from "./utils/pushNotification";

export default function App() {
  const [currentPage, setCurrentPage] = React.useState("Dashboard");
  const [showAddMed, setShowAddMed] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    async function init() {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/service-worker.js");
          console.log("Service Worker Registered");
          await subscribeUser();
        } catch (err) {
          console.error("Service Worker registration/subscription failed:", err);
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/getCurrentUser`, { credentials: "include" });
        const data = await response.json();
        if (data.success) {
          setCurrentPage("Dashboard");
        } else {
          setCurrentPage("Register");
        }
      } catch (err) {
        setCurrentPage("Register");
      }
    }
    getCurrentUser();
  }, []);
  const [medicines, setMedicines] = React.useState([]);
  React.useEffect(() => {
    async function loadMedicines() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/getMedicine`, { credentials: "include" });
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

  // Lifted vitals and symptoms state with safe initializers
  const [sleepHours, setSleepHours] = React.useState(0);
  const [bloodPressure, setBloodPressure] = React.useState("0/0");
  const [weight, setWeight] = React.useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = React.useState([]);
  const [notes, setNotes] = React.useState("");
  const [lastSaved, setLastSaved] = React.useState("");

  async function getHealthLog() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/healthLog/api`, { credentials: "include" });
      if (response.status === 401) return;
      const data = await response.json();

      if (!data || data.success === false) return;

      setSleepHours(data.sleepHours || 0);
      setBloodPressure(data.bloodPressure || "0/0");
      setWeight(data.weight || 0);
      setSelectedSymptoms(data.symptoms || []);
      setNotes(data.notes || "");
      setLastSaved(data.date || "");
    } catch (err) {
      console.error("Failed to load health log:", err);
    }
  }

  async function fetchHealthProfile() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getHealthProfile`, { credentials: "include" });
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

  React.useEffect(() => {
    if (currentPage !== "Register" && currentPage !== "Login") {
      getHealthLog();
      fetchHealthProfile();
    }
  }, [currentPage]);

  return (
    <>
      {currentPage !== "Register" && currentPage !== "Login" && (
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
        {currentPage === "Dashboard" && (
          <Dashboard
            key="Dashboard"
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
        )}
        {currentPage === "myMedicines" && (
          <MyMedicines
            key="myMedicines"
            setShowAddMed={setShowAddMed}
            showAddMed={showAddMed}
            medicines={medicines}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === "Remainders" && (
          <Reminders
            key="Remainders"
            medicines={medicines}
            setMedicines={setMedicines}
            setCurrentPage={setCurrentPage}
            setShowAddMed={setShowAddMed}
          />
        )}

        {currentPage === "SearchMedicines" && (
          <SearchMedicine
            key="SearchMedicines"
            setCurrentPage={setCurrentPage}
            setShowAddMed={setShowAddMed}
          />
        )}

        {currentPage === "HealthLog" && (
          <HealthLog
            key="HealthLog"
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
        )}
      </AnimatePresence>

      {showProfileModal && (
        <ProfileModal
          profileDetails={profileDetails}
          setProfileDetails={setProfileDetails}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {currentPage === "Register" && (
        <Register
          key="Register"
          setCurrentPage={setCurrentPage}
          onSignInRedirect={() => setCurrentPage("Login")}
        />
      )}

      {currentPage === "Login" && (
        <Login
          key="Login"
          setCurrentPage={setCurrentPage}
          onSignUpRedirect={() => setCurrentPage("Register")}
        />
      )}
    </>
  );
}
