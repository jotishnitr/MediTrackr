import { useState } from "react";
import { motion } from "framer-motion";

export default function HealthLog({
  getHealthLog,
  setCurrentPage,
  setShowAddMed,
  sleepHours,
  setSleepHours,
  bloodPressure,
  setBloodPressure,
  weight,
  setWeight,
  selectedSymptoms,
  setSelectedSymptoms,
  notes,
  setNotes,
  lastSaved,
  setLastSaved,
}) {
  const [isSaving, setIsSaving] = useState(false);

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
  ];

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSave = () => {
    setIsSaving(true);

    setTimeout(async () => {
      setIsSaving(false);
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`${import.meta.env.VITE_API_URL}/healthLog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          date: today,

          bloodPressure: bloodPressure,

          sleepHours: sleepHours,

          weight: weight,

          symptoms: selectedSymptoms,

          notes: notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await getHealthLog();
      }
    }, 800);
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
      <div className="med-header">
        <div className="health-log-header-left">
          <h1 className="dashboard-title">Health Log</h1>
          <p className="health-log-subtitle">
            Track your daily wellness journey
          </p>
        </div>
        <div className="health-log-header-right">
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
      <div className="health-log-grid">
        {/* Left column - Symptoms & Vitals */}
        <div className="health-log-left-col">
          {/* Symptoms Card */}
          <div className="health-log-card symptoms-card">
            <div className="card-header">
              <span className="card-icon">
                {/* Clean inline SVG sparkle/star icon */}
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
              <h2>Symptoms</h2>
            </div>

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

            <div className="section-label" style={{ marginBottom: "14px" }}>
              ADDITIONAL SYMPTOMS
            </div>

            <textarea
              className="notes-textarea"
              placeholder="List any other symptoms or details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Vitals Card */}
          <div className="health-log-card vitals-card">
            <div className="card-header">
              <span className="card-icon">
                {/* Clean inline SVG clipboard/edit icon */}
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </span>
              <h2>Vital Measurements</h2>
            </div>

            <div className="vitals-grid">
              <div className="vital-input-group">
                <div className="section-label">DURATION OF SLEEP(HRS)</div>
                <input
                  type="text"
                  className="vital-input"
                  placeholder="e.g. 72"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                />
              </div>

              <div className="vital-input-group">
                <div className="section-label">BLOOD PRESSURE (mmHg)</div>
                <input
                  type="text"
                  className="vital-input"
                  placeholder="e.g. 120/80"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                />
              </div>

              <div className="vital-input-group">
                <div className="section-label">WEIGHT (KG)</div>
                <input
                  type="text"
                  className="vital-input"
                  placeholder="e.g. 70.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Save CTA */}
        <div className="health-log-right-col">
          <div className="health-log-card save-card">
            <button
              className="save-log-btn"
              disabled={isSaving}
              onClick={handleSave}
            >
              {/* Inline SVG Floppy/Save Icon */}
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
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span className="btn-text">
                {isSaving ? "SAVING..." : "SAVE DAILY LOG"}
              </span>
            </button>
            <div className="last-saved-text">LAST SAVED: {lastSaved}</div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
