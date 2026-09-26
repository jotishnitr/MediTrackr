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
  waterIntake: {
    type: Number,
    default: 0,
  },
  heartRate: {
    type: Number,
    default: null,
  },
  bodyTemperature: {
    type: Number,
    default: null,
  },
  bloodSugar: {
    type: Number,
    default: null,
  },
  bloodSugarContext: {
    type: String,
    default: "",
  },
  mood: {
    type: String,
    default: "",
  },
  stressLevel: {
    type: Number,
    default: null,
  },
  energyLevel: {
    type: String,
    default: "",
  },
  painLevel: {
    type: Number,
    default: 0,
  },
  activityLevel: {
    type: String,
    default: "",
  },
  lifestyleTags: {
    type: [String],
    default: [],
  },
  AIsummarization: {
    summary: String,
    providerUsed: String,

  },
});

module.exports = mongoose.model("HealthLog", healthLogSchema);
