const Medicine = require("../models/Medicine.js");

const updateMedicine = async (req, res) => {
  try {
    const { id, name, dosage, unit, type, time, instructions, reminder } = req.body;
    const medicineId = id || req.query.id;

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    const updatedMedicine = await Medicine.findOneAndUpdate(
      {
        _id: medicineId,
        userId: req.user.id,
      },
      {
        ...(name !== undefined && { name }),
        ...(dosage !== undefined && { dosage }),
        ...(unit !== undefined && { unit }),
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
