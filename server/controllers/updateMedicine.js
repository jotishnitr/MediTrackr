const Medicine = require("../models/Medicine.js");

const updateMedicine = async (req, res) => {
  try {
    const { id, name, actualName, days, dosage, unit, count, type, time, instructions, reminder } = req.body;
    const medicineId = id || req.query.id;

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const assignedDays = Array.isArray(days) && days.length > 0 ? days : undefined;

    const updatedMedicine = await Medicine.findOneAndUpdate(
      {
        _id: medicineId,
        userId: req.user.id,
      },
      {
        ...(name !== undefined && { name }),
        ...(actualName !== undefined && { actualName: actualName ? actualName.trim() : "" }),
        ...(assignedDays !== undefined && { days: assignedDays }),
        ...(dosage !== undefined && { dosage }),
        ...(unit !== undefined && { unit }),
        ...(count !== undefined && { count: count !== "" ? Number(count) : 0 }),
        ...(type !== undefined && { type }),
        ...(time !== undefined && { time }),
        ...(instructions !== undefined && { instructions }),
        ...(reminder !== undefined && { reminder }),
      },
      { new: true }
    );

    if (!updatedMedicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      medicine: updatedMedicine,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = updateMedicine;
