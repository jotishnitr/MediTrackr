const Medicine = require("../models/Medicine.js");
const statusMedicine = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const medicine = await Medicine.findOne({ _id: req.query.id });
    medicine.status = !medicine.status;
    if (medicine.status) {
      medicine.takenDate = today;
    } else {
      medicine.takenDate = "";
    }
    await medicine.save();

    res.status(200).json(medicine);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = statusMedicine;
