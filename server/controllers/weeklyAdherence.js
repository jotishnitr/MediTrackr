const Medicine = require("../models/Medicine");

const weeklyAdherence = async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.user.id });
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = new Date(now);
    today.setHours(23, 59, 59, 999);

    const weekAgo = new Date(now);
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
      const createdDate = new Date(new Date(medicine._id.getTimestamp()).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      createdDate.setHours(0, 0, 0, 0);

      // 1. Process historical entries
      medicine.history.forEach((entry) => {
        const entryDate = new Date(new Date(entry.date).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
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

      // 2. Process today's live status (not yet in history)
      const todayIndex = now.getDay();
      const [hours, minutes] = medicine.time.split(":");
      const medicineTime = new Date(now);
      medicineTime.setHours(Number(hours), Number(minutes), 0, 0);

      const createdTimestamp = new Date(new Date(medicine._id.getTimestamp()).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

      if (createdDate.toDateString() === now.toDateString()) {
        // If created today, only count if it was created before the scheduled time
        if (createdTimestamp <= medicineTime) {
          if (medicine.status) {
            weeklyData[todayIndex].taken++;
          } else if (now > medicineTime) {
            weeklyData[todayIndex].missed++;
          }
        }
      } else if (createdDate < now) {
        // If created before today
        if (medicine.status) {
          weeklyData[todayIndex].taken++;
        } else if (now > medicineTime) {
          weeklyData[todayIndex].missed++;
        }
      }
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
