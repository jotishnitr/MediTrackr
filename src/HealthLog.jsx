import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LanguageSelector from "./LanguageSelector";

export default function HealthLog({
  getHealthLog,
  setCurrentPage,
  onOpenAddMedicine,
  sleepHours,
  setSleepHours,
  bloodPressure,
  setBloodPressure,
  weight,
  setWeight,
  waterIntake = 0,
  setWaterIntake,
  heartRate,
  setHeartRate,
  bodyTemperature,
  setBodyTemperature,
  bloodSugar,
  setBloodSugar,
  bloodSugarContext = "",
  setBloodSugarContext,
  mood = "",
  setMood,
  stressLevel,
  setStressLevel,
  energyLevel = "",
  setEnergyLevel,
  painLevel = 0,
  setPainLevel,
  activityLevel = "",
  setActivityLevel,
  lifestyleTags = [],
  setLifestyleTags,
  selectedSymptoms = [],
  setSelectedSymptoms,
  notes = "",
  setNotes,
  lastSaved = "",
  setLastSaved,
  aiSummarization = null,
  setAiSummarization,
  requireAuth,
  setIsAuthenticated,
  unreadNotificationsCount = 0,
  onOpenNotificationModal,
}) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState("");
  const [copiedSummary, setCopiedSummary] = useState(false);

  const symptomsList = [
    "Headache",
    "Fatigue",
    "Nausea",
    "Dizziness",
    "Pain",
    "Fever",
    "Cough",
    "Insomnia",
    "Chills",
    "Congestion",
    "Sore Throat",
    "Anxiety",
  ];

  const moodOptions = [
    { id: "Great", emoji: "😄", label: "Great" },
    { id: "Good", emoji: "🙂", label: "Good" },
    { id: "Okay", emoji: "😐", label: "Okay" },
    { id: "Stressed", emoji: "😓", label: "Stressed" },
    { id: "Down", emoji: "😔", label: "Low" },
  ];

  const energyOptions = [
    { id: "Low", icon: "🪫", label: "Low" },
    { id: "Moderate", icon: "🔋", label: "Moderate" },
    { id: "High", icon: "⚡", label: "High" },
    { id: "Peak", icon: "🚀", label: "Peak" },
  ];

  const activityOptions = [
    { id: "No Exercise", icon: "🛋️", label: "No Exercise" },
    { id: "Light Walk", icon: "🚶", label: "Light Walk" },
    { id: "Moderate Workout", icon: "🏃", label: "Moderate Workout" },
    { id: "Intense Training", icon: "🏋️", label: "Intense Training" },
  ];

  const lifestyleOptions = [
    { id: "Caffeine", icon: "☕", label: "Caffeine" },
    { id: "Alcohol", icon: "🍷", label: "Alcohol" },
    { id: "High Salt", icon: "🧂", label: "High Salt" },
    { id: "Late Meal", icon: "🌙", label: "Late Meal" },
    { id: "Fasted", icon: "⏳", label: "Fasted" },
    { id: "High Sugar", icon: "🍬", label: "High Sugar" },
    { id: "Nicotine", icon: "🚬", label: "Nicotine" },
    { id: "Clean Eating", icon: "🥗", label: "Clean Eating" },
  ];

  const bloodSugarTags = [
    { id: "Fasting", label: "Fasting" },
    { id: "Post-Meal", label: "Post-Meal" },
    { id: "Random", label: "Random" },
    { id: "Bedtime", label: "Bedtime" },
  ];

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const toggleLifestyleTag = (tagId) => {
    if (lifestyleTags.includes(tagId)) {
      setLifestyleTags(lifestyleTags.filter((t) => t !== tagId));
    } else {
      setLifestyleTags([...lifestyleTags, tagId]);
    }
  };

  const adjustWater = (amount) => {
    const current = Number(waterIntake) || 0;
    const nextVal = Math.max(0, current + amount);
    setWaterIntake(nextVal);
  };

  const handleSave = () => {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    setIsSaving(true);
    setSaveSuccessMessage(false);

    setTimeout(async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(`${import.meta.env.VITE_API_URL}/healthLog`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            date: today,
            bloodPressure,
            sleepHours: sleepHours ? Number(sleepHours) : null,
            weight: weight ? Number(weight) : null,
            waterIntake: Number(waterIntake) || 0,
            heartRate: heartRate ? Number(heartRate) : null,
            bodyTemperature: bodyTemperature ? Number(bodyTemperature) : null,
            bloodSugar: bloodSugar ? Number(bloodSugar) : null,
            bloodSugarContext,
            mood,
            stressLevel: stressLevel ? Number(stressLevel) : null,
            energyLevel,
            painLevel: Number(painLevel) || 0,
            activityLevel,
            lifestyleTags,
            symptoms: selectedSymptoms,
            notes,
          }),
        });

        setIsSaving(false);

        if (!response.ok) {
          if (response.status === 401) {
            if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
            setCurrentPage("Login");
          }
          return;
        }

        setSaveSuccessMessage(true);
        setTimeout(() => setSaveSuccessMessage(false), 3000);

        if (typeof getHealthLog === "function") {
          await getHealthLog();
        }
      } catch (err) {
        console.error("Failed to save health log:", err);
        setIsSaving(false);
      }
    }, 600);
  };

  const handleGenerateAISummary = async () => {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    setIsGeneratingAI(true);
    setAiError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/health-log-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.status === 401) {
        if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
        if (typeof setCurrentPage === "function") setCurrentPage("Login");
        return;
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate AI health summary.");
      }

      if (typeof setAiSummarization === "function") {
        setAiSummarization({
          summary: data.summary,
          providerUsed: data.provider,
        });
      }
      if (typeof getHealthLog === "function") {
        await getHealthLog();
      }
    } catch (err) {
      console.error("AI Summary generation failed:", err);
      setAiError(err.message || "Unable to generate summary right now. Please make sure you have saved today's health log first.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCopySummary = () => {
    if (!aiSummarization?.summary) return;
    navigator.clipboard.writeText(aiSummarization.summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const dailyWaterTarget = 2500;
  const currentWater = Number(waterIntake) || 0;
  const waterProgress = Math.min(100, Math.round((currentWater / dailyWaterTarget) * 100));
  const waterGlasses = Math.round(currentWater / 250);

  const getPainColor = (lvl) => {
    if (lvl === 0) return "#4edea3";
    if (lvl <= 3) return "#8ae574";
    if (lvl <= 6) return "#ffb95f";
    if (lvl <= 8) return "#ff855f";
    return "#ff5c5c";
  };

  return (
    <motion.section
      className="health-log"
      initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, scale: 0.98, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="dashboard-header health-log-header">
        <div className="dashboard-header-left health-log-header-left">
          <h1 className="dashboard-title health-log-title">
            {t("healthLog.title", "Health Log")}
          </h1>
          <p className="health-log-subtitle">
            {t("healthLog.subtitle", "Track your daily wellness journey and vital health signals")}
          </p>
        </div>
        <div className="health-log-header-right">
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
      <div className="health-log-grid">
        {/* Left column - All Health Modules */}
        <div className="health-log-left-col">
          
          {/* Card 1: Vital Measurements & Biomarkers */}
          <div className="health-log-card vitals-card">
            <div className="card-header">
              <span className="card-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </span>
              <div>
                <h2>{t("healthLog.vitalsTitle", "Vital Measurements & Biomarkers")}</h2>
                <span className="card-subtitle">Essential physiological parameters</span>
              </div>
            </div>

            <div className="vitals-grid">
              {/* Blood Pressure */}
              <div className="vital-input-group">
                <div className="vital-label-row">
                  <span className="section-label">{t("dashboard.bloodPressure", "BLOOD PRESSURE")}</span>
                  <span className="vital-unit-tag">mmHg</span>
                </div>
                <div className="vital-input-wrapper">
                  <span className="vital-field-icon">🩺</span>
                  <input
                    type="text"
                    className="vital-input"
                    placeholder="e.g. 120/80"
                    value={bloodPressure || ""}
                    onChange={(e) => setBloodPressure(e.target.value)}
                  />
                </div>
              </div>

              {/* Heart Rate / Resting Pulse */}
              <div className="vital-input-group">
                <div className="vital-label-row">
                  <span className="section-label">HEART RATE / PULSE</span>
                  <span className="vital-unit-tag">BPM</span>
                </div>
                <div className="vital-input-wrapper">
                  <span className="vital-field-icon">❤️</span>
                  <input
                    type="number"
                    min="30"
                    max="220"
                    className="vital-input"
                    placeholder="e.g. 72"
                    value={heartRate ?? ""}
                    onChange={(e) => setHeartRate(e.target.value)}
                  />
                </div>
              </div>

              {/* Body Temperature */}
              <div className="vital-input-group">
                <div className="vital-label-row">
                  <span className="section-label">BODY TEMPERATURE</span>
                  <span className="vital-unit-tag">°F</span>
                </div>
                <div className="vital-input-wrapper">
                  <span className="vital-field-icon">🌡️</span>
                  <input
                    type="number"
                    step="0.1"
                    min="90"
                    max="110"
                    className="vital-input"
                    placeholder="e.g. 98.6"
                    value={bodyTemperature ?? ""}
                    onChange={(e) => setBodyTemperature(e.target.value)}
                  />
                </div>
              </div>

              {/* Sleep Duration */}
              <div className="vital-input-group">
                <div className="vital-label-row">
                  <span className="section-label">{t("dashboard.sleepDuration", "SLEEP DURATION")}</span>
                  <span className="vital-unit-tag">HRS</span>
                </div>
                <div className="vital-input-wrapper">
                  <span className="vital-field-icon">💤</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    className="vital-input"
                    placeholder="e.g. 7.5"
                    value={sleepHours ?? ""}
                    onChange={(e) => setSleepHours(e.target.value)}
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="vital-input-group">
                <div className="vital-label-row">
                  <span className="section-label">{t("dashboard.weight", "BODY WEIGHT")}</span>
                  <span className="vital-unit-tag">KG</span>
                </div>
                <div className="vital-input-wrapper">
                  <span className="vital-field-icon">⚖️</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="300"
                    className="vital-input"
                    placeholder="e.g. 70.5"
                    value={weight ?? ""}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>

              {/* Blood Sugar / Glucose */}
              <div className="vital-input-group blood-sugar-group">
                <div className="vital-label-row">
                  <span className="section-label">BLOOD SUGAR / GLUCOSE</span>
                  <span className="vital-unit-tag">mg/dL</span>
                </div>
                <div className="vital-input-wrapper">
                  <span className="vital-field-icon">🩸</span>
                  <input
                    type="number"
                    min="20"
                    max="600"
                    className="vital-input"
                    placeholder="e.g. 95"
                    value={bloodSugar ?? ""}
                    onChange={(e) => setBloodSugar(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Blood Sugar Context Tags */}
            <div className="blood-sugar-context-row">
              <span className="sub-label">GLUCOSE CONTEXT:</span>
              <div className="glucose-tags">
                {bloodSugarTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`glucose-tag-btn ${bloodSugarContext === tag.id ? "active" : ""}`}
                    onClick={() => setBloodSugarContext(bloodSugarContext === tag.id ? "" : tag.id)}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Hydration Tracker */}
          <div className="health-log-card hydration-card">
            <div className="card-header">
              <span className="card-icon hydration-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </span>
              <div>
                <h2>Water Intake & Hydration</h2>
                <span className="card-subtitle">Daily goal: 2500 ml (~10 glasses)</span>
              </div>
            </div>

            <div className="hydration-display-area">
              <div className="hydration-metrics">
                <div className="hydration-val-badge">
                  <span className="hydration-big-number">{currentWater}</span>
                  <span className="hydration-unit">ml</span>
                </div>
                <div className="hydration-sub-stat">
                  <span>≈ {waterGlasses} glasses ({waterProgress}% of daily goal)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="hydration-progress-track">
                <div
                  className="hydration-progress-fill"
                  style={{ width: `${waterProgress}%` }}
                />
              </div>

              {/* Quick Add Buttons */}
              <div className="hydration-controls">
                <button
                  type="button"
                  className="water-btn quick-add"
                  onClick={() => adjustWater(250)}
                >
                  +250ml <span className="water-hint">(1 Glass)</span>
                </button>
                <button
                  type="button"
                  className="water-btn quick-add"
                  onClick={() => adjustWater(500)}
                >
                  +500ml <span className="water-hint">(Bottle)</span>
                </button>
                <button
                  type="button"
                  className="water-btn quick-add"
                  onClick={() => adjustWater(750)}
                >
                  +750ml
                </button>
                <button
                  type="button"
                  className="water-btn water-sub"
                  onClick={() => adjustWater(-250)}
                  disabled={currentWater === 0}
                  title="Remove 250ml"
                >
                  -250ml
                </button>
                {currentWater > 0 && (
                  <button
                    type="button"
                    className="water-btn water-reset"
                    onClick={() => setWaterIntake(0)}
                    title="Reset Water Counter"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Mood, Energy & Stress Level */}
          <div className="health-log-card mental-card">
            <div className="card-header">
              <span className="card-icon mental-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </span>
              <div>
                <h2>Mood, Stress & Energy</h2>
                <span className="card-subtitle">Daily psychological & mental stamina signals</span>
              </div>
            </div>

            {/* Mood Selector */}
            <div className="form-section-block">
              <div className="section-label">MOOD STATE</div>
              <div className="mood-options-grid">
                {moodOptions.map((opt) => {
                  const isSelected = mood === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`mood-card-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => setMood(isSelected ? "" : opt.id)}
                    >
                      <span className="mood-emoji">{opt.emoji}</span>
                      <span className="mood-name">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Energy Level */}
            <div className="form-section-block" style={{ marginTop: "20px" }}>
              <div className="section-label">ENERGY LEVEL</div>
              <div className="energy-options-grid">
                {energyOptions.map((opt) => {
                  const isSelected = energyLevel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`energy-card-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => setEnergyLevel(isSelected ? "" : opt.id)}
                    >
                      <span className="energy-icon">{opt.icon}</span>
                      <span className="energy-name">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stress Level */}
            <div className="form-section-block" style={{ marginTop: "20px" }}>
              <div className="stress-header-row">
                <div className="section-label">STRESS LEVEL (1 - 5)</div>
                <span className="stress-indicator-text">
                  {stressLevel === 1 && "1 • Very Low / Calm"}
                  {stressLevel === 2 && "2 • Low / Relaxed"}
                  {stressLevel === 3 && "3 • Moderate"}
                  {stressLevel === 4 && "4 • High Stress"}
                  {stressLevel === 5 && "5 • Very High / Overwhelmed"}
                  {!stressLevel && "Not selected"}
                </span>
              </div>
              <div className="stress-scale-bar">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const isSelected = Number(stressLevel) === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      className={`stress-step-btn stress-step-${lvl} ${isSelected ? "active" : ""}`}
                      onClick={() => setStressLevel(isSelected ? null : lvl)}
                    >
                      <span className="stress-step-num">{lvl}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 4: Symptoms & Pain Severity Scale */}
          <div className="health-log-card symptoms-card">
            <div className="card-header">
              <span className="card-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
              <div>
                <h2>Symptoms & Pain Severity</h2>
                <span className="card-subtitle">Log physical discomfort, pain, or health anomalies</span>
              </div>
            </div>

            {/* Symptoms Pill Selector */}
            <div className="section-label" style={{ marginBottom: "14px" }}>
              SELECT SYMPTOMS
            </div>

            <div className="symptoms-pills">
              {symptomsList.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    className={`symptom-pill ${isSelected ? "active" : ""}`}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {symptom}
                  </button>
                );
              })}
            </div>

            {/* Pain Severity Scale (0 - 10) */}
            <div className="form-section-block" style={{ marginTop: "16px", marginBottom: "22px" }}>
              <div className="pain-header-row">
                <div className="section-label">PAIN SEVERITY SCALE (0 - 10)</div>
                <span
                  className="pain-indicator-badge"
                  style={{
                    color: getPainColor(Number(painLevel) || 0),
                    borderColor: `${getPainColor(Number(painLevel) || 0)}40`,
                    backgroundColor: `${getPainColor(Number(painLevel) || 0)}15`,
                  }}
                >
                  {painLevel === 0 && "0 • No Pain"}
                  {painLevel > 0 && painLevel <= 3 && `${painLevel} • Mild Pain`}
                  {painLevel >= 4 && painLevel <= 6 && `${painLevel} • Moderate Pain`}
                  {painLevel >= 7 && painLevel <= 9 && `${painLevel} • Severe Pain`}
                  {painLevel === 10 && "10 • Worst Possible Pain"}
                </span>
              </div>

              <div className="pain-scale-container">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isSelected = Number(painLevel) === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      className={`pain-num-btn ${isSelected ? "active" : ""}`}
                      style={
                        isSelected
                          ? {
                              backgroundColor: getPainColor(num),
                              borderColor: getPainColor(num),
                              color: num <= 3 ? "#003824" : "#ffffff",
                              boxShadow: `0 4px 14px ${getPainColor(num)}50`,
                            }
                          : {}
                      }
                      onClick={() => setPainLevel(num)}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="section-label" style={{ marginBottom: "12px" }}>
              ADDITIONAL SYMPTOMS & CLINICAL NOTES
            </div>

            <textarea
              className="notes-textarea"
              placeholder="List any other symptoms, observations, or medication side-effects..."
              value={notes || ""}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Card 5: Physical Activity & Dietary Context Tags */}
          <div className="health-log-card lifestyle-card">
            <div className="card-header">
              <span className="card-icon lifestyle-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
              </span>
              <div>
                <h2>Activity & Lifestyle Context</h2>
                <span className="card-subtitle">Factors influencing your daily vitals and medication</span>
              </div>
            </div>

            {/* Physical Activity Level */}
            <div className="form-section-block">
              <div className="section-label">PHYSICAL ACTIVITY LEVEL</div>
              <div className="activity-options-grid">
                {activityOptions.map((opt) => {
                  const isSelected = activityLevel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`activity-card-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => setActivityLevel(isSelected ? "" : opt.id)}
                    >
                      <span className="activity-icon">{opt.icon}</span>
                      <span className="activity-name">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary & Lifestyle Tags */}
            <div className="form-section-block" style={{ marginTop: "22px" }}>
              <div className="section-label">DIETARY & LIFESTYLE CONTEXT TAGS</div>
              <div className="lifestyle-tags-grid">
                {lifestyleOptions.map((opt) => {
                  const isSelected = lifestyleTags.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`lifestyle-tag-btn ${isSelected ? "active" : ""}`}
                      onClick={() => toggleLifestyleTag(opt.id)}
                    >
                      <span className="lifestyle-tag-icon">{opt.icon}</span>
                      <span className="lifestyle-tag-label">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Right column - Summary & Action */}
        <div className="health-log-right-col">
          <div className="health-log-card save-card sticky-save-card">
            <div className="save-card-header">
              <h3>Daily Overview</h3>
              <p className="save-card-desc">Review and commit today's health metrics</p>
            </div>

            {/* Quick Summary Chips */}
            <div className="summary-pills-list">
              <div className="summary-pill-item">
                <span className="summary-pill-label">💧 Hydration:</span>
                <span className="summary-pill-val">{currentWater} ml</span>
              </div>
              {mood && (
                <div className="summary-pill-item">
                  <span className="summary-pill-label">😊 Mood:</span>
                  <span className="summary-pill-val">{mood}</span>
                </div>
              )}
              {energyLevel && (
                <div className="summary-pill-item">
                  <span className="summary-pill-label">⚡ Energy:</span>
                  <span className="summary-pill-val">{energyLevel}</span>
                </div>
              )}
              {heartRate && (
                <div className="summary-pill-item">
                  <span className="summary-pill-label">❤️ Pulse:</span>
                  <span className="summary-pill-val">{heartRate} BPM</span>
                </div>
              )}
              {bloodPressure && (
                <div className="summary-pill-item">
                  <span className="summary-pill-label">🩺 BP:</span>
                  <span className="summary-pill-val">{bloodPressure}</span>
                </div>
              )}
              {bloodSugar && (
                <div className="summary-pill-item">
                  <span className="summary-pill-label">🩸 Sugar:</span>
                  <span className="summary-pill-val">
                    {bloodSugar} mg/dL {bloodSugarContext ? `(${bloodSugarContext})` : ""}
                  </span>
                </div>
              )}
              {selectedSymptoms.length > 0 && (
                <div className="summary-pill-item">
                  <span className="summary-pill-label">⚠️ Symptoms:</span>
                  <span className="summary-pill-val">{selectedSymptoms.length} logged</span>
                </div>
              )}
            </div>

            <button
              className={`save-log-btn ${saveSuccessMessage ? "saved-success" : ""}`}
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <span className="btn-text">{t("healthLog.saving", "SAVING...")}</span>
              ) : saveSuccessMessage ? (
                <>
                  <span className="save-icon">✓</span>
                  <span className="btn-text">LOG SAVED!</span>
                </>
              ) : (
                <>
                  <svg
                    className="save-icon"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span className="btn-text">
                    {t("healthLog.saveLogBtn", "SAVE DAILY LOG")}
                  </span>
                </>
              )}
            </button>

            {lastSaved && (
              <div className="last-saved-text">
                {t("dashboard.lastUpdated", "LAST SAVED")}: {lastSaved}
              </div>
            )}
          </div>

          {/* MediTrackr Health Analyst Dedicated Container */}
          <div className="health-log-card ai-summary-card">
            <div className="card-header ai-header-row">
              <span className="card-icon analyst-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Primary Glowing AI Sparkle */}
                  <path
                    d="M10 2L11.6 6.8C12 8 13 9 14.2 9.4L19 11L14.2 12.6C13 13 12 14 11.6 15.2L10 20L8.4 15.2C8 14 7 13 5.8 12.6L1 11L5.8 9.4C7 9 8 8 8.4 6.8L10 2Z"
                    fill="url(#analystSparkleGrad)"
                    stroke="#4edea3"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  {/* Secondary Sparkle */}
                  <path
                    d="M19 14L19.7 16.3C19.9 16.9 20.4 17.4 21 17.6L23.3 18.3L21 19C20.4 19.2 19.9 19.7 19.7 20.3L19 22.6L18.3 20.3C18.1 19.7 17.6 19.2 17 19L14.7 18.3L17 17.6C17.6 17.4 18.1 16.9 18.3 16.3L19 14Z"
                    fill="#4edea3"
                  />
                  <defs>
                    <linearGradient
                      id="analystSparkleGrad"
                      x1="1"
                      y1="2"
                      x2="19"
                      y2="20"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#4edea3" stopOpacity="0.85" />
                      <stop offset="1" stopColor="#10b981" stopOpacity="0.35" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <h3 className="ai-analyst-title">MediTrackr Health Analyst</h3>
            </div>

            {/* Summary Body Container */}
            <div className="ai-summary-content-area">
              {isGeneratingAI ? (
                <div className="ai-loading-state">
                  <div className="ai-loading-pulse-ring">
                    <div className="ai-loading-spinner"></div>
                  </div>
                  <div className="ai-loading-text-group">
                    <p className="ai-loading-title">Generating Health Summary...</p>
                    <p className="ai-loading-sub">Reviewing your vitals, sleep hours, symptoms & wellness trends</p>
                  </div>
                </div>
              ) : aiError ? (
                <div className="ai-error-box">
                  <span className="ai-error-icon">⚠️</span>
                  <div className="ai-error-content">
                    <p className="ai-error-message">{aiError}</p>
                    <p className="ai-error-hint">Tip: Click <strong>"SAVE DAILY LOG"</strong> above first so AI has today's metrics to review.</p>
                  </div>
                </div>
              ) : aiSummarization?.summary ? (
                <div className="ai-summary-markdown-wrapper">
                  <div className="ai-summary-top-bar">
                    <span className="ai-summary-label">Today's Health Breakdown</span>
                    <button
                      type="button"
                      className={`ai-copy-btn ${copiedSummary ? "copied" : ""}`}
                      onClick={handleCopySummary}
                      title="Copy AI Summary to Clipboard"
                    >
                      {copiedSummary ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="ai-markdown-link" />
                      ),
                    }}
                  >
                    {aiSummarization.summary}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="ai-empty-compact">
                  <p>Click below to generate a tailored AI breakdown of your vitals, flags, and daily wellness suggestions.</p>
                </div>
              )}
            </div>

            {/* AI Action Trigger Button */}
            <button
              type="button"
              className={`ai-generate-btn ${isGeneratingAI ? "generating" : ""}`}
              disabled={isGeneratingAI || isSaving}
              onClick={handleGenerateAISummary}
            >
              {isGeneratingAI ? (
                <>
                  <div className="ai-btn-spinner"></div>
                  <span>ANALYZING WITH AI...</span>
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  <span>
                    {aiSummarization?.summary ? "REGENERATE HEALTH SUMMARY" : "GENERATE HEALTH SUMMARY"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
