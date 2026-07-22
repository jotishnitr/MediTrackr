const Medicine = require("../models/Medicine");

const getMedicine = async (req, res) => {
  try {
    const userId = req.user.id;

    const medicines = await Medicine.find({ userId });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let medicine of medicines) {
      let changed = false;

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

      // 2. Backfill missed days (last 7 days) if there's no history entry
      const createdDate = new Date(medicine._id.getTimestamp());
      createdDate.setHours(0, 0, 0, 0);

      for (let i = 7; i >= 1; i--) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate < createdDate) {
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

    res.status(200).json(medicines);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = getMedicine;
