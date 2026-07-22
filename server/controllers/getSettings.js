const Settings = require("../models/Settings");

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.id });

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        userId: req.user.id,
        browserAlerts: true,
        notificationSound: true,
      });
    }

    res.status(200).json(settings);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = getSettings;
