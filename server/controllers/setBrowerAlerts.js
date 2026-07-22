const Settings = require("../models/Settings");

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.id });

    if (!settings) {
      settings = await Settings.create({
        userId: req.user.id,
        browserAlerts: false,
        notificationSound: true,
      });
    } else {
      settings.browserAlerts = !settings.browserAlerts;
      await settings.save();
    }

    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = updateSettings;
