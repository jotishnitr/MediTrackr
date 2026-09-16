const Medicine = require("../models/Medicine");

const getMedicine = async (req, res) => {
  try {
    const userId = req.user.id;

    const medicines = await Medicine.find({ userId });
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const { day } = req.query;

    for (let medicine of medicines) {
      let changed = false;
      const medDays = Array.isArray(medicine.days) && medicine.days.length > 0
        ? medicine.days
        : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      // 1. Log taken medicines if status is true and takenDate was before today
      if (medicine.status && medicine.takenDate && new Date(medicine.takenDate) < today) {
        const takenDay = new Date(medicine.takenDate);
        const dayExists = medicine.history.some(h => 
          new Date(h.date).toDateString() === takenDay.toDateString()
        );
        if (!dayExists) {
          medicine.history.push({ date: takenDay, status: true });
        }
        medicine.status = false;
        medicine.takenDate = null;
        changed = true;
      }

      // 2. Backfill missed days (last 7 days) if there's no history entry AND it was scheduled on that day
      const createdDate = new Date(new Date(medicine._id.getTimestamp()).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      createdDate.setHours(0, 0, 0, 0);

      for (let i = 7; i >= 1; i--) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate < createdDate) {
          continue;
        }

        const checkDayName = checkDate.toLocaleDateString("en-US", { weekday: "long" });
        const isScheduledOnDay = medDays.includes(checkDayName) || medDays.includes(checkDayName.slice(0, 3));

        if (!isScheduledOnDay) {
          continue;
        }

        const hasEntry = medicine.history.some(h => 
          new Date(h.date).toDateString() === checkDate.toDateString()
        );

        if (!hasEntry) {
          medicine.history.push({ date: checkDate, status: false });
          changed = true;
        }
      }

      if (changed) {
        await medicine.save();
      }
    }

    let result = medicines;
    if (day) {
      const targetDay = day.toLowerCase() === "today" 
        ? now.toLocaleDateString("en-US", { weekday: "long" }) 
        : day;
      
      result = medicines.filter(m => {
        const mDays = Array.isArray(m.days) && m.days.length > 0
          ? m.days
          : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return mDays.some(d => d.toLowerCase() === targetDay.toLowerCase() || d.toLowerCase() === targetDay.slice(0, 3).toLowerCase());
      });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = getMedicine;
