const Settings = require("../models/Settings");

const setNotificationSound = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        browserAlerts: true,
        notificationSound: true,
      });
    } else {
      settings.notificationSound = !settings.notificationSound;
      await settings.save();
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

module.exports = setNotificationSound;
