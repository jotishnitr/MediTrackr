import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function MedicineModal({
  isOpen,
  onClose,
  medicineData,
  onSave,
  requireAuth,
  setIsAuthenticated,
  setCurrentPage,
}) {
  const { t } = useTranslation();
  const isEditing = Boolean(medicineData && medicineData._id);

  const [medDetails, setMedDetails] = useState({
    name: "",
    dosage: "",
    unit: "mg",
    count: "",
    type: "Oral Tablet",
    time: "",
    instructions: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medicineData && medicineData._id) {
      setMedDetails({
        name: medicineData.name || "",
        dosage: medicineData.dosage !== undefined ? medicineData.dosage : "",
        unit: medicineData.unit || "mg",
        count: medicineData.count !== undefined ? medicineData.count : "",
        type: medicineData.type || "Oral Tablet",
        time: medicineData.time || "",
        instructions: medicineData.instructions || "",
      });
    } else if (medicineData && medicineData.name) {
      setMedDetails({
        name: medicineData.name || "",
        dosage: medicineData.dosage !== undefined ? medicineData.dosage : "",
        unit: medicineData.unit || "mg",
        count: medicineData.count !== undefined ? medicineData.count : "",
        type: medicineData.type || "Oral Tablet",
        time: medicineData.time || "",
        instructions: medicineData.instructions || "",
      });
    } else {
      setMedDetails({
        name: "",
        dosage: "",
        unit: "mg",
        count: "",
        type: "Oral Tablet",
        time: "",
        instructions: "",
      });
    }
  }, [medicineData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMedDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (typeof requireAuth === "function" && !requireAuth()) {
      onClose();
      return;
    }

    if (!medDetails.name.trim() || !medDetails.time.trim()) {
      alert(t("medicineModal.errorFillRequired", "Please fill in medicine name and scheduled time"));
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        // Update Medicine
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/updateMedicine`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: medicineData._id,
              name: medDetails.name.trim(),
              dosage: Number(medDetails.dosage) || 0,
              unit: medDetails.unit,
              count: medDetails.count !== "" ? Number(medDetails.count) : 0,
              type: medDetails.type,
              time: medDetails.time,
              instructions: medDetails.instructions,
            }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
            if (typeof setCurrentPage === "function") setCurrentPage("Login");
          }
          throw new Error("Failed to update medicine");
        }

        const data = await response.json();
        if (data && data.medicine) {
          onSave(data.medicine, "update");
        }
        onClose();
      } else {
        // Add Medicine
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/addMedicine`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: medDetails.name.trim(),
              dosage: Number(medDetails.dosage) || 0,
              unit: medDetails.unit,
              count: medDetails.count !== "" ? Number(medDetails.count) : 0,
              type: medDetails.type,
              time: medDetails.time,
              instructions: medDetails.instructions,
              status: false,
            }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
            if (typeof setCurrentPage === "function") setCurrentPage("Login");
          }
          throw new Error("Failed to add medicine");
        }

        const data = await response.json();
        if (data && data.medicine) {
          onSave(data.medicine, "add");
        }
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred while saving the medicine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="addMed-overlay" onClick={onClose}>
      <div className="addMed-modal" onClick={(e) => e.stopPropagation()}>
        <div className="addMed-header">
          <h2>
            {isEditing
              ? t("medicineModal.editTitle", "Edit Medicine")
              : t("medicineModal.addTitle", "Add Medicine")}
          </h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="addMed-body">
          <div className="form-group">
            <label>{t("medicineModal.nameLabel", "Medicine Name")}</label>
            <input
              type="text"
              placeholder={t("medicineModal.namePlaceholder", "e.g. Metformin HCl")}
              onChange={handleChange}
              name="name"
              value={medDetails.name}
            />
          </div>

          <div className="form-group">
            <label>{t("medicineModal.dosageLabel", "Dosage")}</label>
            <div className="dosage-row">
              <input
                type="number"
                placeholder={t("medicineModal.dosagePlaceholder", "500")}
                onChange={handleChange}
                name="dosage"
                value={medDetails.dosage}
              />
              <select
                onChange={handleChange}
                name="unit"
                value={medDetails.unit}
              >
                <option>mg</option>
                <option>ml</option>
                <option>g</option>
                <option>mcg</option>
                <option>tablet</option>
                <option>pill</option>
                <option>capsule</option>
                <option>drop</option>
                <option>puff</option>
                <option>spray</option>
                <option>patch</option>
                <option>spoon</option>
                <option>unit</option>
                <option>IU</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{t("medicineModal.pillCountLabel", "Quantity / Stock Count")}</label>
            <input
              type="number"
              min="0"
              placeholder={t("medicineModal.pillCountPlaceholder", "e.g. 30")}
              onChange={handleChange}
              name="count"
              value={medDetails.count}
            />
          </div>

          <div className="form-group">
            <label>{t("medicineModal.typeLabel", "Type")}</label>
            <select
              onChange={handleChange}
              name="type"
              value={medDetails.type}
            >
              <option>Oral Tablet</option>
              <option>Capsule</option>
              <option>Syrup</option>
              <option>Injection</option>
              <option>Inhaler</option>
              <option>Drops</option>
              <option>Cream / Ointment</option>
              <option>Spray</option>
              <option>Liquid (Oral)</option>
              <option>Suspension</option>
              <option>Powder</option>
              <option>Patch</option>
              <option>Suppository</option>
              <option>Lotion</option>
              <option>Gel</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t("medicineModal.timeLabel", "Time")}</label>
            <input
              type="time"
              onChange={handleChange}
              name="time"
              value={medDetails.time}
            />
          </div>

          <div className="form-group">
            <label>{t("medicineModal.instructionsLabel", "Instructions")}</label>
            <input
              type="text"
              placeholder={t("medicineModal.instructionsPlaceholder", "e.g. After food")}
              onChange={handleChange}
              name="instructions"
              value={medDetails.instructions}
            />
          </div>

          <div className="addMed-footer">
            <button
              className="save-med-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditing
                  ? t("common.loading", "Updating...")
                  : t("healthLog.saving", "Saving...")
                : isEditing
                ? t("medicineModal.updateBtn", "Update Medicine")
                : t("medicineModal.saveBtn", "Save Medicine")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
