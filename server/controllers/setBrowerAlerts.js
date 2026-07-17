const Settings = require("../models/Settings");

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        browserAlerts: true,
        notificationSound: false,
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
