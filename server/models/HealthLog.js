const mongoose = require("mongoose");

const healthLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },

  bloodPressure: {
    type: String,
    default: "0/0",
  },

  sleepHours: {
    type: Number,
    default: 0,
  },

  symptoms: {
    type: Array,
    default: [],
  },
  notes: {
    type: String,
    default: "",
  },
  weight: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("HealthLog", healthLogSchema);
