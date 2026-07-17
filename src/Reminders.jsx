import React from "react";
import { getMedicineStatus } from "./utils/medicineUtils";
import { motion } from "framer-motion";
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
  setShowAddMed,
}) {
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
        const response = await fetch("http://localhost:5000/weeklyAdherence", { credentials: "include" });
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

  // Calculate stats dynamically from medicines prop
  const takenCount = medicines.filter(
    (m) => getMedicineStatus(m) === "TAKEN",
  ).length;
  const pendingCount = medicines.filter(
    (m) => getMedicineStatus(m) === "PENDING",
  ).length;
  const missedCount = medicines.filter(
    (m) => getMedicineStatus(m) === "MISSED",
  ).length;

  async function handleStatusChange(id) {
    const response = await fetch(
      `http://localhost:5000/statusMedicine?id=${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      console.error("Failed to update status");
      return;
    }

    const updatedMedicine = await response.json();
    setMedicines((prev) =>
      prev.map((medicine) =>
        medicine._id === updatedMedicine._id ? updatedMedicine : medicine,
      ),
    );
  }

  // Notification System
  async function toggleNotification(id) {
    const response = await fetch(
      `http://localhost:5000/reminderMedicine?id=${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const updatedMedicine = await response.json();
    setMedicines((prev) =>
      prev.map((medicine) =>
        medicine._id === updatedMedicine._id ? updatedMedicine : medicine,
      ),
    );
  }
  const [notificationStatus, setNotificationStatus] = React.useState(false);
  const [soundStatus, setSoundStatus] = React.useState(false);
  React.useEffect(() => {
    async function getSettings() {
      const response = await fetch("http://localhost:5000/getSettings");
      const data = await response.json();

      setNotificationStatus(data.browserAlerts);
      setSoundStatus(data.notificationSound);
    }

    getSettings();
  }, []);
  async function toggleNotificationStatus() {
    const response = await fetch("http://localhost:5000/setBrowserAlerts", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    setNotificationStatus(data.browserAlerts);
  }

  async function toggleSoundStatus() {
    const response = await fetch("http://localhost:5000/setNotificationSound", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    setSoundStatus(data.notificationSound);
  }

  React.useEffect(() => {
    requestPermission();
  }, []);

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
        <div className="reminders-header-left">
          <h1>Reminders</h1>
          <p>Manage your daily schedules and alert configurations</p>
        </div>
        <div className="reminders-header-right">
          <button
            className="add-med-btn"
            onClick={() => {
              setCurrentPage("Dashboard");
              setShowAddMed(true);
            }}
          >
            + Add Medicine
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
              <span className="stat-label">TAKEN</span>
              <span className="stat-value">{takenCount}</span>
            </div>
            <div className="reminder-stat-card pending">
              <span className="stat-label">PENDING</span>
              <span className="stat-value">{pendingCount}</span>
            </div>
            <div className="reminder-stat-card missed">
              <span className="stat-label">MISSED</span>
              <span className="stat-value">{missedCount}</span>
            </div>
          </div>

          {/* Today's Schedule Panel */}
          <div className="schedule-panel">
            <div className="schedule-panel-header">
              <div className="schedule-title-area">
                <h2>Today's Schedule</h2>
                <span className="pending-badge">{pendingCount} PENDING</span>
              </div>
              <div className="schedule-controls"></div>
            </div>

            {medicines.length === 0 ? (
              <div className="empty-schedule">
                <p>
                  No medicines scheduled for today. Add medicines to get
                  started.
                </p>
              </div>
            ) : (
              <div className="timeline-wrapper">
                <div className="timeline-line"></div>
                <div className="timeline-list">
                  {medicines.map((med) => {
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
                            <span className="medicine-name">{med.name}</span>
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
