import { useState } from "react";
import { getMedicineStatus } from "./utils/medicineUtils";
import { motion } from "framer-motion";

export default function MyMedicines({setCurrentPage,setShowAddMed,medicines}) {

    const [searchTerm, setSearchTerm] = useState("");


    const filteredMedicines = medicines.filter((med) =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <p>
                        {medicines.length} ACTIVE PRESCRIPTIONS
                    </p>
                </div>

                <button className="add-med-btn"  onClick={() => {
                  setCurrentPage("Dashboard");
                  setShowAddMed(true)}}>
                    + Add Medicine
                </button>
            </div>



            <div className="search-container">

                <span className="material-symbols-outlined search-icon">
                    <img src="search.png"></img>
                </span>

                <input
                    type="text"
                    placeholder="Search by medicine name..."
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(e.target.value)
                    }
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

                        const status =
                            getMedicineStatus(med);

                        return (

                            <div
                                key={index}
                                className="medicine-card-myMed"
                            >

                                <div className="card-top">

                                    <div className="med-icon">
                                        💊
                                    </div>

                                    <span
                                        className={`status-badge ${status.toLowerCase()}`}
                                    >
                                        {status}
                                    </span>

                                </div>

                                <h2>{med.name}</h2>

                                <p className="med-info">
                                    {med.dosage} {med.unit.toUpperCase()} • {med.type}
                                </p>

                                <div className="card-divider"></div>

                                <div className="card-bottom">

                                    <div>
                                        <span className="card-label">
                                            INSTRUCTIONS
                                        </span>

                                        <h4>
                                            {med.instructions}
                                        </h4>
                                    </div>

                                    <div>
                                        <span className="card-label">
                                            TIME
                                        </span>

                                        <h4>
                                            {med.time}
                                        </h4>
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