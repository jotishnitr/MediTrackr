import React from "react";
import { getMedicineStatus, formatDaysLabel, isMedicineScheduledToday } from "./utils/medicineUtils";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import {
  requestPermission,
  scheduleReminder,
  cancelReminder,
  rescheduleAll,
} from "./utils/notificationUtils";

export default function Reminders({
  medicines,
  setMedicines,
  setCurrentPage,
  onOpenAddMedicine,
  onOpenEditMedicine,
  requireAuth,
  setIsAuthenticated,
  unreadNotificationsCount = 0,
  onOpenNotificationModal,
}) {
  const { t } = useTranslation();
  // Helper to format time to { time: "HH:MM", ampm: "AM/PM" }
  const formatTime = (timeStr) => {
    if (!timeStr) return { time: "--:--", ampm: "" };
    const [hoursStr, minutesStr] = timeStr.split(":");
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return { time: `${formattedHours}:${minutesStr}`, ampm };
  };

  const [weeklyData, setWeeklyData] = React.useState([]);

  React.useEffect(() => {
    async function fetchWeeklyData() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/weeklyAdherence`, { credentials: "include" });
        if (!response.ok) {
          throw new Error("Failed to fetch weekly adherence data");
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setWeeklyData(data);
        } else {
          setWeeklyData([]);
        }
      } catch (error) {
        console.error("Error fetching weekly data:", error);
        setWeeklyData([]);
      }
    }
    fetchWeeklyData();
  }, []);

  const totalTaken = weeklyData.reduce((sum, day) => sum + day.taken, 0);

  const totalMissed = weeklyData.reduce((sum, day) => sum + day.missed, 0);

  const totalDoses = totalTaken + totalMissed;

  const adherenceRate =
    totalDoses === 0 ? 0 : Math.round((totalTaken / totalDoses) * 100);

  const safeMedicines = Array.isArray(medicines) ? medicines.filter(Boolean) : [];

  // Filter medicines scheduled for today
  const currentDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayMedicines = safeMedicines.filter((m) => isMedicineScheduledToday(m, currentDayName));

  // Calculate stats dynamically from todayMedicines
  const takenCount = todayMedicines.filter(
    (m) => getMedicineStatus(m) === "TAKEN",
  ).length;
  const pendingCount = todayMedicines.filter(
    (m) => getMedicineStatus(m) === "PENDING",
  ).length;
  const missedCount = todayMedicines.filter(
    (m) => getMedicineStatus(m) === "MISSED",
  ).length;

  async function handleStatusChange(id) {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/statusMedicine?id=${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    if (!response.ok) {
      if (response.status === 401) {
        if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
        setCurrentPage("Login");
      }
      console.error("Failed to update status");
      return;
    }

    const updatedMedicine = await response.json();
    if (!updatedMedicine || !updatedMedicine._id) return;
    setMedicines((prev) =>
      (Array.isArray(prev) ? prev.filter(Boolean) : []).map((medicine) =>
        medicine._id === updatedMedicine._id ? updatedMedicine : medicine,
      ),
    );
  }

  // Notification System
  async function toggleNotification(id) {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/reminderMedicine?id=${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    if (!response.ok) {
      if (response.status === 401) {
        if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
        setCurrentPage("Login");
      }
      return;
    }
    const updatedMedicine = await response.json();
    if (!updatedMedicine || !updatedMedicine._id) return;

    if (updatedMedicine.reminder) {
      await scheduleReminder(updatedMedicine);
    } else {
      await cancelReminder(updatedMedicine._id);
    }

    setMedicines((prev) =>
      (Array.isArray(prev) ? prev.filter(Boolean) : []).map((medicine) =>
        medicine._id === updatedMedicine._id ? updatedMedicine : medicine,
      ),
    );
  }
  const [notificationStatus, setNotificationStatus] = React.useState(false);
  const [soundStatus, setSoundStatus] = React.useState(false);
  React.useEffect(() => {
    async function getSettings() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/getSettings`, { credentials: "include" });
        if (!response.ok) return;
        const data = await response.json();

        setNotificationStatus(data.browserAlerts);
        setSoundStatus(data.notificationSound);
      } catch (err) {
        console.error(err);
      }
    }

    getSettings();
  }, []);
  async function toggleNotificationStatus() {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/setBrowserAlerts`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      if (response.status === 401) {
        if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
        setCurrentPage("Login");
      }
      return;
    }

    const data = await response.json();

    setNotificationStatus(data.browserAlerts);
  }

  async function toggleSoundStatus() {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/setNotificationSound`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      if (response.status === 401) {
        if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
        setCurrentPage("Login");
      }
      return;
    }

    const data = await response.json();

    setSoundStatus(data.notificationSound);
  }

  React.useEffect(() => {
    async function syncNativeReminders() {
      await requestPermission();
      if (Array.isArray(medicines) && medicines.length > 0) {
        await rescheduleAll(medicines);
      }
    }
    syncNativeReminders();
  }, [medicines]);

  return (
    <motion.section
      className="reminders"
      initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, scale: 0.98, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="reminders-header">
        <div className="dashboard-header-left">
          <h1>{t("reminders.title", "Reminders")}</h1>
          <p>{t("reminders.subtitle", "Daily medication schedule & browser notifications")}</p>
        </div>

        <div className="reminders-header-actions">
          <LanguageSelector variant="header" />
          <button
            className="notification-btn"
            onClick={() => {
              if (typeof onOpenNotificationModal === "function") {
                onOpenNotificationModal();
              }
            }}
            title={t("notifications.title", "View Notifications")}
            aria-label="View Notifications"
          >
            <div className="notification-btn-icon-wrapper">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadNotificationsCount > 0 && (
                <span className="notification-badge-count">
                  {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                </span>
              )}
            </div>
          </button>
          <button
            className="add-med-btn"
            onClick={() => {
              if (typeof onOpenAddMedicine === "function") {
                onOpenAddMedicine();
              }
            }}
          >
            {t("medicines.addMedicine", "+ Add Medicine")}
          </button>
        </div>
      </div>
      {/* Main Grid */}
      <div className="reminders-main-grid">
        {/* Left Column: Stats and Today's Schedule */}
        <div className="reminders-left-col">
          {/* Stats Boxes */}
          <div className="reminders-stats-row">
            <div className="reminder-stat-card taken">
              <span className="stat-label">{t("dashboard.taken", "TAKEN")}</span>
              <span className="stat-value">{takenCount}</span>
            </div>
            <div className="reminder-stat-card pending">
              <span className="stat-label">{t("dashboard.pending", "PENDING")}</span>
              <span className="stat-value">{pendingCount}</span>
            </div>
            <div className="reminder-stat-card missed">
              <span className="stat-label">{t("dashboard.missed", "MISSED")}</span>
              <span className="stat-value">{missedCount}</span>
            </div>
          </div>

          {/* Today's Schedule Panel */}
          <div className="schedule-panel">
            <div className="schedule-panel-header">
              <div className="schedule-title-area">
                <h2>{t("reminders.todayReminders", "Today's Reminders")}</h2>
                <span className="pending-badge">{pendingCount} {t("dashboard.pending", "PENDING")}</span>
              </div>
              <div className="schedule-controls"></div>
            </div>

            {todayMedicines.length === 0 ? (
              <div className="empty-schedule">
                <p>
                  {t("dashboard.noMedicinesToday", "No medicines scheduled for today. Add medicines to get started.")}
                </p>
              </div>
            ) : (
              <div className="timeline-wrapper">
                <div className="timeline-line"></div>
                <div className="timeline-list">
                  {todayMedicines.map((med) => {
                    const status = getMedicineStatus(med);
                    const timeInfo = formatTime(med.time);

                    // Determine CSS class modifiers based on status
                    let statusClass = "pending";
                    if (status === "TAKEN") statusClass = "taken";
                    if (status === "MISSED") statusClass = "missed";

                    return (
                      <div
                        key={med._id}
                        className={`timeline-item ${statusClass}`}
                      >
                        {/* Timeline Node on Left */}
                        <div className="timeline-node">
                          <div className={`node-circle ${statusClass}`}></div>
                        </div>

                        {/* Medicine Card Content */}
                        <div className={`timeline-card ${statusClass}`}>
                          {/* Time display block */}
                          <div className="time-block">
                            <span className="time-value">{timeInfo.time}</span>
                            <span className="time-ampm">{timeInfo.ampm}</span>
                          </div>

                          {/* Medicine Name and Instructions */}
                          <div className="med-info-block">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                              <span className="medicine-name">{med.name}</span>
                              {med.actualName && med.actualName !== med.name && (
                                <span className="med-actual-name-chip" style={{ fontSize: "11.5px" }}>
                                  ({med.actualName})
                                </span>
                              )}
                              <span className="med-days-tag">{formatDaysLabel(med.days)}</span>
                            </div>
                            <span className="medicine-instructions">
                              <span className="fork-icon">🍴</span>{" "}
                              {med.instructions || "No instructions"}
                            </span>
                          </div>

                          {/* Controls (Toggle Notifications & Taken Action) */}
                          <div className="card-actions">
                            <div className="toggle-notification-wrap">
                              <span className="toggle-label">ENABLED</span>
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={med.reminder}
                                  onChange={() => toggleNotification(med._id)}
                                />
                                <span className="slider-round"></span>
                              </label>
                            </div>

                            {status === "TAKEN" ? (
                              <button
                                className="check-btn taken"
                                title="Mark as Pending"
                                onClick={() => handleStatusChange(med._id)}
                              >
                                <span className="material-symbols-outlined">
                                  check_circle
                                </span>
                              </button>
                            ) : (
                              <button
                                className="check-btn action"
                                title="Mark as Taken"
                                onClick={() => handleStatusChange(med._id)}
                              >
                                <span className="material-symbols-outlined">
                                  check
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Right Column: Settings and Tips */}
        <div className="reminders-right-col">
          {/* Notification Settings Panel */}
          <div className="settings-panel">
            <div className="settings-header">
              <span className="material-symbols-outlined settings-icon">
                settings
              </span>
              <h2>Notification Settings</h2>
            </div>
            <div className="settings-options">
              {/* Browser Alerts */}
              <div className="setting-row">
                <div className="setting-info">
                  <h3>Browser Alerts</h3>
                  <p>Instant push notifications</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationStatus}
                    onChange={() => toggleNotificationStatus()}
                  />
                  <span className="slider-round"></span>
                </label>
              </div>

              {/* Notification Sound */}
              <div className="setting-row">
                <div className="setting-info">
                  <h3>Notification Sound</h3>
                  <p>Gentle alert tone</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={soundStatus}
                    onChange={() => toggleSoundStatus()}
                  />
                  <span className="slider-round"></span>
                </label>
              </div>
            </div>{" "}
            {/* Close settings-options */}
          </div>{" "}
          {/* Close settings-panel */}
          {/* Adherence Tip Box */}
          <div className="adherence-tip-box">
            <h3>Adherence Tip</h3>
            <p>
              Consistency is key! You have maintained an {adherenceRate}%
              adherence rate this week. Keep taking your medications at the same
              time daily for better blood pressure and overall health control.
            </p>
          </div>
        </div>{" "}
        {/* Close reminders-right-col */}
      </div>{" "}
      {/* Close reminders-main-grid */}
    </motion.section>
  );
}
