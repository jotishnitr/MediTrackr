import { useState } from "react";
import { getMedicineStatus } from "./utils/medicineUtils";
import { motion } from "framer-motion";
import MedicineModal from "./MedicineModal";

export default function MyMedicines({
  setCurrentPage,
  setShowAddMed,
  medicines,
  setMedicines,
  requireAuth,
  setIsAuthenticated,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const safeMedicines = Array.isArray(medicines) ? medicines.filter(Boolean) : [];

  const filteredMedicines = safeMedicines.filter((med) =>
    med && med.name && med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    setEditingMedicine(med);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMedicine(null);
  };

  const handleSaveMedicine = (savedMed, mode) => {
    if (typeof setMedicines === "function") {
      if (mode === "add") {
        setMedicines((prev) => [...(Array.isArray(prev) ? prev.filter(Boolean) : []), savedMed]);
      } else if (mode === "update") {
        setMedicines((prev) =>
          (Array.isArray(prev) ? prev.filter(Boolean) : []).map((m) =>
            m._id === savedMed._id ? savedMed : m
          )
        );
      }
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

        <button className="add-med-btn" onClick={handleOpenAdd}>
          + Add Medicine
        </button>
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

      {isModalOpen && (
        <MedicineModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          medicineData={editingMedicine}
          onSave={handleSaveMedicine}
          requireAuth={requireAuth}
          setIsAuthenticated={setIsAuthenticated}
          setCurrentPage={setCurrentPage}
        />
      )}
    </motion.section>
  );
}