const Medicine = require("../models/Medicine");

const weeklyAdherence = async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.user.id });
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);
    const weeklyData = [
      { day: "Sun", taken: 0, missed: 0 },
      { day: "Mon", taken: 0, missed: 0 },
      { day: "Tue", taken: 0, missed: 0 },
      { day: "Wed", taken: 0, missed: 0 },
      { day: "Thu", taken: 0, missed: 0 },
      { day: "Fri", taken: 0, missed: 0 },
      { day: "Sat", taken: 0, missed: 0 },
    ];

    medicines.forEach((medicine) => {
      const createdDate = new Date(medicine._id.getTimestamp());
      createdDate.setHours(0, 0, 0, 0);

      medicine.history.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate < createdDate) {
          return;
        }

        const dayIndex = entryDate.getDay();

        if (entry.status && entryDate >= weekAgo && entryDate <= today) {
          weeklyData[dayIndex].taken++;
        } else if (
          !entry.status &&
          entryDate >= weekAgo &&
          entryDate <= today
        ) {
          weeklyData[dayIndex].missed++;
        }
      });
    });

    res.status(200).json(weeklyData);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = weeklyAdherence;
