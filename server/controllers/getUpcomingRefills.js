const Medicine = require("../models/Medicine");

const getUpcomingRefills = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      userId: req.user.id,
    });

    // Calculate daily frequency for each medicine name to accurately compute remaining days
    const frequencyMap = {};
    for (const med of medicines) {
      const normalizedName = (med.name || "").trim().toLowerCase();
      frequencyMap[normalizedName] = (frequencyMap[normalizedName] || 0) + 1;
    }

    const upcomingRefills = [];

    for (const medicine of medicines) {
      const normalizedName = (medicine.name || "").trim().toLowerCase();
      const dailyFrequency = frequencyMap[normalizedName] || 1;
      const count = typeof medicine.count === "number" ? medicine.count : 0;
      const remainingDays = Math.max(0, Math.floor(count / dailyFrequency));

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