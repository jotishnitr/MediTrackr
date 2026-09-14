const Medicine = require("../models/Medicine.js");
const statusMedicine = async (req, res) => {
  try {
    const localNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const year = localNow.getFullYear();
    const month = String(localNow.getMonth() + 1).padStart(2, "0");
    const day = String(localNow.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;
    const medicine = await Medicine.findOne({ _id: req.query.id });
    if (!medicine) {
      return res.status(404).json({ success: false, message: "Medicine not found" });
    }

    medicine.status = !medicine.status;
    const currentCount = typeof medicine.count === "number" ? medicine.count : 0;

    if (medicine.status) {
      // Medicine was taken -> decrease available quantity/stock
      medicine.takenDate = today;
      if (currentCount > 0) {
        medicine.count = currentCount - 1;
      }
    } else {
      // Medicine was un-marked -> restore available quantity/stock
      medicine.takenDate = "";
      medicine.count = currentCount + 1;
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
