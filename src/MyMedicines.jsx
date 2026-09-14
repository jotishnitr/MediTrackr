import { useState } from "react";
import { getMedicineStatus } from "./utils/medicineUtils";
import { motion } from "framer-motion";

export default function MyMedicines({
  setCurrentPage,
  medicines,
  setMedicines,
  onOpenAddMedicine,
  onOpenEditMedicine,
  requireAuth,
  setIsAuthenticated,
  unreadNotificationsCount = 0,
  onOpenNotificationModal,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const safeMedicines = Array.isArray(medicines) ? medicines.filter(Boolean) : [];

  const filteredMedicines = safeMedicines.filter((med) =>
    med && med.name && med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleOpenAdd = () => {
    if (typeof onOpenAddMedicine === "function") {
      onOpenAddMedicine();
    }
  };

  const handleOpenEdit = (med) => {
    if (typeof onOpenEditMedicine === "function") {
      onOpenEditMedicine(med);
    }
  };

  return (
    <motion.section
      className="my-medicines"
      initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, scale: 0.98, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="med-header">
        <div className="dashboard-header-left">
          <h1>My Medicines</h1>
          <p>{safeMedicines.length} ACTIVE PRESCRIPTIONS</p>
        </div>

        <div className="med-header-actions">
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
          <button className="add-med-btn" onClick={handleOpenAdd}>
            + Add Medicine
          </button>
        </div>
      </div>

      <div className="search-container">
        <span className="material-symbols-outlined search-icon">
          <img src="search.png" alt="search"></img>
        </span>

        <input
          type="text"
          placeholder="Search by medicine name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="medicine-grid-myMedicines">
        {filteredMedicines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💊</div>
            <h3>No medicines found</h3>
            <p>Search for another name or add a new medicine to get started.</p>
          </div>
        ) : (
          filteredMedicines.map((med, index) => {
            const status = getMedicineStatus(med);

            return (
              <div key={med._id || index} className="medicine-card-myMed">
                <div className="card-top">
                  <div className="med-icon">💊</div>

                  <div className="card-top-right-actions">
                    <button
                      className="med-edit-btn"
                      title="Edit Medicine"
                      onClick={() => handleOpenEdit(med)}
                      aria-label="Edit Medicine"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "17px" }}
                      >
                        edit
                      </span>
                    </button>
                    <span className={`status-badge ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </div>
                </div>

                <h2>{med.name}</h2>

                <p className="med-info">
                  {med.dosage} {med.unit ? med.unit.toUpperCase() : "MG"} • {med.type}
                  {med.count !== undefined && med.count !== null && med.count !== "" ? ` • Qty: ${med.count}` : ""}
                </p>

                <div className="card-divider"></div>

                <div className="card-bottom">
                  <div>
                    <span className="card-label">INSTRUCTIONS</span>
                    <h4>{med.instructions || "None"}</h4>
                  </div>

                  <div>
                    <span className="card-label">TIME</span>
                    <h4>{med.time}</h4>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </motion.section>
  );
}