const Medicine = require("../models/Medicine.js");
const reminderMedicine = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const medicine = await Medicine.findOne({ _id: req.query.id });
    medicine.reminder = !medicine.reminder;

    await medicine.save();

    res.status(200).json(medicine);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = reminderMedicine;
