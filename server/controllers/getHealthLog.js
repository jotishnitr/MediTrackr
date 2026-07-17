const HealthLog = require("../models/HealthLog");
const healthLog = async (req, res) => {
  try {
    const healthLog = await HealthLog.findOne({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json(healthLog);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = healthLog;
