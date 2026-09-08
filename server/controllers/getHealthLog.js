const HealthLog = require("../models/HealthLog");

const healthLog = async (req, res) => {
  try {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const todayIST = now.toISOString().split("T")[0];
    const todayUTC = new Date().toISOString().split("T")[0];

    const todayLog = await HealthLog.findOne({
      userId: req.user.id,
      date: { $in: [todayIST, todayUTC] },
    }).sort({ date: -1 });

    res.status(200).json(todayLog || null);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = healthLog;
