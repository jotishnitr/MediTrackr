const Medicine = require("../models/Medicine.js");
const statusMedicine = async (req, res) => {
  try {
    const localNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const year = localNow.getFullYear();
    const month = String(localNow.getMonth() + 1).padStart(2, "0");
    const day = String(localNow.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;
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
