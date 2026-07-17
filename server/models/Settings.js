const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  browserAlerts: {
    type: Boolean,
    default: true,
  },

  notificationSound: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Settings", settingsSchema);
