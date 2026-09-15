const Medicine = require("../models/Medicine");

const getUpcomingRefills = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      userId: req.user.id,
    });

    const upcomingRefills = [];

    for (const medicine of medicines) {
      const count = typeof medicine.count === "number" ? medicine.count : (Number(medicine.count) || 0);
      const dosage = Number(medicine.dosage) > 0 ? Number(medicine.dosage) : 1;
      const remainingDays = Math.max(0, Math.floor(count / dosage));

      upcomingRefills.push({
        id: medicine._id,
        _id: medicine._id,
        name: medicine.name,
        type: medicine.type,
        dosage: medicine.dosage,
        unit: medicine.unit,
        time: medicine.time,
        count,
        remainingDays,
      });
    }

    // Sort by refills needed earliest first
    upcomingRefills.sort((a, b) => a.remainingDays - b.remainingDays);

    res.status(200).json({
      success: true,
      upcomingRefills,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = getUpcomingRefills;