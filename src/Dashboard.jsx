import React, { useEffect, useState } from "react";
import { getMedicineStatus } from "./utils/medicineUtils";
import { motion } from "framer-motion";
import { requestFCMToken, listenForForegroundMessages } from "./firebase";
export default function Dashboard({
  setCurrentPage,
  medicines,
  setMedicines,
  onOpenAddMedicine,
  onOpenEditMedicine,
  sleepHours,
  bloodPressure,
  weight,
  selectedSymptoms,
  notes,
  profileDetails,
  isAuthenticated,
  setIsAuthenticated,
  requireAuth,
  unreadNotificationsCount = 0,
  onOpenNotificationModal,
}) {


  useEffect(() => {
    const setupFCM = async () => {
      const token = await requestFCMToken();
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/save-fcm-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });
      }
    };
    setupFCM();
    listenForForegroundMessages();
  }, []);



  const [weeklyData, setWeeklyData] = React.useState([]);
  const [upcomingRefills, setUpcomingRefills] = React.useState([]);
  const [showAllRefillsModal, setShowAllRefillsModal] = React.useState(false);

  React.useEffect(() => {
    async function fetchWeeklyData() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/weeklyAdherence`,
          { credentials: "include" },
        );
        if (response.status === 401) {
          setWeeklyData([]);
          return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setWeeklyData(data);
        } else {
          setWeeklyData([]);
        }
      } catch (err) {
        console.error("Failed to load weekly adherence data:", err);
        setWeeklyData([]);
      }
    }
    fetchWeeklyData();
  }, []);

  React.useEffect(() => {
    async function fetchUpcomingRefills() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/getUpcomingRefills`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.upcomingRefills)) {
            setUpcomingRefills(data.upcomingRefills);
          }
        }
      } catch (err) {
        console.error("Failed to load upcoming refills:", err);
      }
    }
    fetchUpcomingRefills();
  }, [medicines]);

  const safeMedicines = Array.isArray(medicines) ? medicines.filter(Boolean) : [];

  const missedToday = safeMedicines.filter(
    (medicine) => getMedicineStatus(medicine) === "MISSED",
  ).length;

  const missedAdherence =
    safeMedicines.length === 0
      ? 0
      : Math.round((missedToday / safeMedicines.length) * 100);

  const medicineTypes = new Set(safeMedicines.map((med) => med.type)).size;
  const takenToday = safeMedicines.filter((med) => med.status).length;

  const dailyAdherence =
    safeMedicines.length === 0
      ? 0
      : Math.round((takenToday / safeMedicines.length) * 100);

  const pendingToday = safeMedicines.filter(
    (med) => getMedicineStatus(med) === "PENDING",
  ).length;

  const pendingAdherence =
    safeMedicines.length === 0
      ? 0
      : Math.round((pendingToday / safeMedicines.length) * 100);
  let totalTaken = 0;
  let totalMissed = 0;
  if (weeklyData.length !== 0) {
    totalTaken = weeklyData.reduce((sum, day) => sum + day.taken, 0);
    totalMissed = weeklyData.reduce((sum, day) => sum + day.missed, 0);
  }

  const totalDoses = totalTaken + totalMissed;

  const adherenceRate =
    totalDoses === 0 ? 0 : Math.round((totalTaken / totalDoses) * 100);

  const weeklyMissedRate =
    totalDoses === 0 ? 0 : Math.round((totalMissed / totalDoses) * 100);

  function handleOpenAdd() {
    if (typeof onOpenAddMedicine === "function") {
      onOpenAddMedicine();
    }
  }

  function handleOpenEdit(medicine) {
    if (typeof onOpenEditMedicine === "function") {
      onOpenEditMedicine(medicine);
    }
  }

  function dateDisplay() {
    const today = new Date();
    const day = today.toLocaleDateString("en-US", { weekday: "long" });
    const date = today.getDate();
    const month = today.toLocaleDateString("en-US", { month: "long" });
    const year = today.getFullYear();

    const hours = today.getHours();
    let greeting;
    if (hours < 12) {
      greeting = "Good Morning";
    } else if (hours < 18) {
      greeting = "Good Afternoon";
    } else {
      greeting = "Good Evening";
    }
    return (
      <div className="dashboard-greeting-container">
        <p className="dashboard-greeting">
          {day}, {date} {month} {year} • {greeting},{" "}
          {profileDetails?.name || "User"} 👋
        </p>
      </div>
    );
  }

  async function deleteMedicine(id) {
    if (typeof requireAuth === "function" && !requireAuth()) {
      return;
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/deleteMedicine?id=${id}`,
      {
        method: "DELETE",
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
    const data = await response.json();
    if (!data || !data.id) return;
    setMedicines((prev) => (Array.isArray(prev) ? prev.filter((medicine) => medicine && medicine._id !== data.id) : []));
  }

  async function statusChange(id) {
    if (typeof requireAuth === "function" && !requireAuth()) {
      return;
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/statusMedicine?id=${id}`,
      {
        method: "PUT",
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

  const existingReminders =
    JSON.parse(localStorage.getItem("medReminders")) || [];
  const resetReminders = existingReminders.map((r) => ({
    ...r,
    notified: false,
  }));

  const sleepHealth =
    sleepHours == null || sleepHours === "" || sleepHours === 0
      ? null
      : sleepHours < 5
        ? "─ Very Poor"
        : sleepHours < 7
          ? "─ Poor"
          : sleepHours < 9
            ? "─ Healthy"
            : sleepHours <= 10
              ? "─ Good (Long Sleep)"
              : "─ Excessive";

  function getBloodPressureStatus(bp) {
    if (!bp || bp === "0/0" || typeof bp !== "string") {
      return null;
    }
    const parts = bp.split("/");
    if (parts.length !== 2) return null;
    const [sys, dia] = parts.map(Number);
    if (isNaN(sys) || isNaN(dia) || (sys === 0 && dia === 0)) return null;

    if (sys < 90 || dia < 60) {
      return {
        status: "Low BP",
        tagline: "Low blood pressure • Monitor symptoms",
        color: "#f4b400",
      };
    }

    if (sys < 120 && dia < 80) {
      return {
        status: "Normal",
        tagline: "Healthy blood pressure",
        color: "#22c55e",
      };
    }

    if (sys < 130 && dia < 80) {
      return {
        status: "Elevated",
        tagline: "Slightly elevated",
        color: "#f59e0b",
      };
    }

    if (sys < 140 && dia < 90) {
      return {
        status: "Stage 1",
        tagline: "Mildly high blood pressure",
        color: "#fb923c",
      };
    }

    if (sys < 180 && dia < 120) {
      return {
        status: "Stage 2",
        tagline: "High blood pressure",
        color: "#ef4444",
      };
    }

    return {
      status: "Crisis",
      tagline: "Seek immediate medical care",
      color: "#b91c1c",
    };
  }
  const bpInfo = getBloodPressureStatus(bloodPressure);
  return (
    <motion.section
      className="dashboard"
      initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, scale: 0.98, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-title">Dashboard</div>
          {dateDisplay()}
        </div>
        <div className="dashboard-header-right">
          <button
            className="notification-btn"
            onClick={() => {
              if (typeof onOpenNotificationModal === "function") {
                onOpenNotificationModal();
              }
            }}
            title="View Notifications"
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
          <div className="addMed-container">
            <button className="addMed-btn" onClick={handleOpenAdd}>
              + Add Medicine
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="progress-cards">
          <div className="total-med-container">
            <div className="totalMed-icon-container">
              <img className="totalMed-icon" src="totalMed.png"></img>
            </div>
            <div className="recently-added">{medicineTypes} Types</div>
            <div className="totalMed-number">{medicines.length}</div>
            <div className="totalMed-title">Total Medicines</div>
            <div className="present-time">
              Last updated:{" "}
              {new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          </div>

          <div className="scheduledToday-container">
            <div className="scheduledToday-icon-container">
              <img className="scheduledToday-icon" src="missedToday.png"></img>
            </div>
            <div className="scheduledToday-day">{missedToday} Missed</div>
            <div className="scheduledToday-number-container">
              <div className="scheduledToday-number">{missedToday}</div>
              <div className="scheduledToday-unit">doses</div>
            </div>
            <div className="scheduledToday-title">Missed Today</div>
            <div className="scheduledToday-progress-bar">
              <div
                className="scheduledToday-progress-fill"
                style={{ width: `${missedAdherence}%` }}
              ></div>
            </div>
          </div>

          <div className="dosesTaken-container">
            <div className="dosesTaken-icon-container">
              <img className="dosesTaken-icon" src="dosesTaken.png"></img>
            </div>
            <div className="dosesTaken-percent">{dailyAdherence}% Daily</div>
            <div className="dosesTaken-number">{takenToday}</div>
            <div className="dosesTaken-title">Doses Taken</div>
            <div className="dosesTaken-progress-bar">
              <div
                className="dosesTaken-progress-fill"
                style={{ width: `${dailyAdherence}%` }}
              ></div>
            </div>
          </div>

          <div className="remainingDoses-container">
            <div className="remainingDoses-icon-container">
              <img
                className="remainingDoses-icon"
                src="remainingDoses.png"
              ></img>
            </div>
            <div className="remainingDoses-overdue">{pendingToday} overdue</div>
            <div className="remainingDoses-number">{pendingToday}</div>
            <div className="remainingDoses-title">Remaining Doses</div>
            <div className="remainingDoses-progress-bar">
              <div
                className="remainingDoses-progress-fill"
                style={{ width: `${pendingAdherence}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="schedule-weeklyAdhere">
          <div className="schedule-container">
            <div className="todaySchedule-header">
              <div className="todaySchedule-header-left">
                <div className="todaySchedule-dot"></div>
                <div className="schedule-title">Today's Schedule</div>
              </div>
              <div className="todaySchedule-header-right">
                <div
                  className="view-all"
                  onClick={() => setCurrentPage("myMedicines")}
                >
                  View All →
                </div>
              </div>
            </div>

            {safeMedicines.map((medicine) => (
              <div className="medicine-container" key={medicine._id}>
                <div className="capsule-icon">💊</div>
                <div className="details-container">
                  <div className="medName">{medicine.name}</div>
                  <div className="med-time-container">
                    <div className="med-quantity">
                      {medicine.dosage} {medicine.unit.toUpperCase()}
                    </div>
                    <div> • </div>
                    <div className="med-type">{medicine.type}</div>
                    <div> • </div>
                    <div className="med-time">{medicine.instructions}</div>
                  </div>
                </div>
                <div className="time-status">
                  <div className="time">{medicine.time}</div>
                  <div
                    className={
                      getMedicineStatus(medicine) === "TAKEN"
                        ? "status-taken"
                        : getMedicineStatus(medicine) === "MISSED"
                          ? "status-missed"
                          : "status-pending"
                    }
                  >
                    {getMedicineStatus(medicine)}
                  </div>
                </div>
                <div className="checkbox">
                  {getMedicineStatus(medicine) === "MISSED" ? (
                    <input
                      className="missedCheckbox"
                      type="checkbox"
                      checked={medicine.status}
                      onChange={() => statusChange(medicine._id)}
                    ></input>
                  ) : (
                    <input
                      type="checkbox"
                      checked={medicine.status}
                      onChange={() => statusChange(medicine._id)}
                    ></input>
                  )}
                </div>
                <div className="med-actions-container">
                  <button
                    className="med-edit-btn"
                    title="Edit Medicine"
                    onClick={() => handleOpenEdit(medicine)}
                    aria-label="Edit Medicine"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>edit</span>
                  </button>
                  <div className="del-btn-container">
                    <img
                      src="del-btn.png"
                      className="del-btn"
                      onClick={() => deleteMedicine(medicine._id)}
                      alt="Delete Medicine"
                    ></img>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="adherence-refills">
            <div className="weekly-adherence">
              <div className="weeklyAdherence-header">
                <div className="weeklyAdherence-title">Weekly Adherence</div>

                <div className="this-week">THIS WEEK</div>
              </div>

              <div className="weeklyAdherence-bar">
                {weeklyData.map((item) => {
                  const total = item.taken + item.missed;
                  const takenPercentage =
                    total === 0 ? 0 : Math.round((item.taken / total) * 100);
                  const missedPercentage =
                    total === 0 ? 0 : Math.round((item.missed / total) * 100);
                  return (
                    <div className="day-column" key={item.day}>
                      <div className="day-bars">
                        {takenPercentage > 0 && (
                          <div
                            className="taken-bar"
                            style={{
                              height: `${takenPercentage}%`,
                            }}
                          ></div>
                        )}

                        {missedPercentage > 0 && (
                          <div
                            className="missed-bar"
                            style={{
                              height: `${missedPercentage}%`,
                            }}
                          ></div>
                        )}
                      </div>

                      <div className="day-label">{item.day}</div>
                    </div>
                  );
                })}
              </div>

              <div className="weeklyAdherence-details">
                <div className="adherence-rate-container">
                  <div className="adherence-rate-value">{adherenceRate}%</div>

                  <div className="adherence-rate">ADHERENCE RATE</div>
                </div>

                <div className="adherence-missed-container">
                  <div className="adherence-missed-value">
                    {weeklyMissedRate}%
                  </div>

                  <div className="adherence-missed">MISSED RATE</div>
                </div>
              </div>
            </div>

            <div className="upcoming-refills-card">
              <div className="upcoming-refills-header">
                <div className="upcoming-refills-title-wrap">
                  <span className="material-symbols-outlined upcoming-refills-icon">inventory_2</span>
                  <h2>Upcoming Refills</h2>
                </div>
                {upcomingRefills.length > 0 && (
                  <button
                    className="view-all-refills-btn"
                    onClick={() => setShowAllRefillsModal(true)}
                    type="button"
                  >
                    View All →
                  </button>
                )}
              </div>

              <div className="upcoming-refills-list">
                {upcomingRefills.length === 0 ? (
                  <div className="empty-refills">
                    <span className="empty-refills-icon">💊</span>
                    <p>No medicines need refill soon</p>
                  </div>
                ) : (
                  upcomingRefills.slice(0, 3).map((refill) => {
                    const isUrgent = refill.remainingDays <= 3;
                    const isWarning = refill.remainingDays > 3 && refill.remainingDays <= 7;
                    const badgeClass = isUrgent
                      ? "refill-urgent"
                      : isWarning
                      ? "refill-warning"
                      : "refill-normal";

                    return (
                      <div
                        className="refill-item"
                        key={refill.id || refill._id}
                        onClick={() => setShowAllRefillsModal(true)}
                        style={{ cursor: "pointer" }}
                        title="Click to view all upcoming refills"
                      >
                        <div className="refill-left">
                          <span className={`refill-dot ${badgeClass}-dot`}></span>
                          <div className="refill-info">
                            <div className="refill-med-name">{refill.name}</div>
                            <div className="refill-med-type">{refill.type || "Medicine"}</div>
                          </div>
                        </div>

                        <div className={`refill-badge ${badgeClass}`}>
                          {refill.remainingDays === 0
                            ? "Out of stock"
                            : `${refill.remainingDays} ${refill.remainingDays === 1 ? "day" : "days"} left`}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="health-stats">
          <div className="health-card pressure-card">
            <div className="health-card-left">
              <div className="health-card-label">BLOOD PRESSURE</div>

              <div className="health-card-value">
                {bloodPressure ? (
                  <>
                    {bloodPressure} <span>mmHg</span>
                  </>
                ) : (
                  <span className="health-card-empty">—</span>
                )}
              </div>

              <div className="health-card-status stable">
                <span style={{ color: bpInfo ? bpInfo.color : "#9ca3af" }}>
                  {bpInfo ? bpInfo.tagline : "No log for today"}
                </span>
              </div>
            </div>

            <div className="health-card-icon pressure-icon">❤️</div>
          </div>

          <div className="health-card heart-card">
            <div className="health-card-left">
              <div className="health-card-label">SLEEP DURATION</div>

              <div className="health-card-value">
                {sleepHours != null && sleepHours !== "" && sleepHours > 0 ? (
                  <>
                    {sleepHours} <span>HRS</span>
                  </>
                ) : (
                  <span className="health-card-empty">—</span>
                )}
              </div>

              <div className="health-card-status neutral">
                {sleepHealth || "No log for today"}
              </div>
            </div>

            <div className="health-card-icon heart-icon">🌙</div>
          </div>

          <div className="health-card weight-card">
            <div className="health-card-left">
              <div className="health-card-label">WEIGHT</div>

              <div className="health-card-value">
                {weight != null && weight !== "" && weight > 0 ? (
                  <>
                    {weight} <span>kg</span>
                  </>
                ) : (
                  <span className="health-card-empty">—</span>
                )}
              </div>

              <div className="health-card-status warning">
                {weight != null && weight !== "" && weight > 0 ? "Current Weight" : "No log for today"}
              </div>
            </div>

            <div className="health-card-icon weight-icon">⚖️</div>
          </div>

          <div className="health-card symptoms-card">
            <div
              className="health-card-left"
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <div className="health-card-label">SYMPTOMS & NOTES</div>

              <div className="dashboard-symptoms-container">
                {selectedSymptoms && selectedSymptoms.length > 0 ? (
                  <div className="dashboard-symptoms-list">
                    {selectedSymptoms.map((symptom) => (
                      <span key={symptom} className="dashboard-symptom-tag">
                        {symptom}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="no-symptoms">
                    {notes ? "No symptoms reported" : "—"}
                  </span>
                )}

                {notes ? (
                  <div className="dashboard-notes-preview">
                    <strong>Notes:</strong> {notes}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="health-card-icon symptoms-icon">✨</div>
          </div>
        </div>
      </div>

      {/* All Upcoming Refills Modal */}
      {showAllRefillsModal && (
        <div className="addMed-overlay" onClick={() => setShowAllRefillsModal(false)}>
          <div className="addMed-modal refill-modal" onClick={(e) => e.stopPropagation()}>
            <div className="addMed-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="material-symbols-outlined" style={{ color: "#4edea3", fontSize: "24px" }}>inventory_2</span>
                <h2>All Upcoming Refills</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowAllRefillsModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="refills-modal-body">
              {upcomingRefills.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px 20px" }}>
                  <div className="empty-state-icon">💊</div>
                  <h3>No Refills Needed</h3>
                  <p>All your medicines have plenty of stock remaining.</p>
                </div>
              ) : (
                <div className="refills-modal-table-container">
                  <table className="refills-table">
                    <thead>
                      <tr>
                        <th>Medicine Name</th>
                        <th>Type</th>
                        <th>Stock Count</th>
                        <th>Time</th>
                        <th>Remaining Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingRefills.map((item) => {
                        const isUrgent = item.remainingDays <= 3;
                        const isWarning = item.remainingDays > 3 && item.remainingDays <= 7;
                        const badgeClass = isUrgent
                          ? "refill-urgent"
                          : isWarning
                          ? "refill-warning"
                          : "refill-normal";

                        return (
                          <tr key={item.id || item._id}>
                            <td className="refill-td-name">
                              <span style={{ marginRight: "8px" }}>💊</span>
                              <strong>{item.name}</strong>
                              {item.dosage && (
                                <span className="refill-dosage-tag">
                                  {item.dosage} {item.unit?.toUpperCase()}
                                </span>
                              )}
                            </td>
                            <td>{item.type || "Oral Tablet"}</td>
                            <td style={{ fontWeight: "600", color: "#67e8f9" }}>
                              {item.count ?? 0} {item.unit || "units"}
                            </td>
                            <td>{item.time || "—"}</td>
                            <td>
                              <span className={`refill-badge ${badgeClass}`}>
                                {item.remainingDays === 0
                                  ? "Out of stock"
                                  : `${item.remainingDays} ${item.remainingDays === 1 ? "day" : "days"} left`}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="addMed-footer" style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <button
                className="refill-modal-close-btn"
                onClick={() => setShowAllRefillsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </motion.section>
  );
}
