const User = require("./models/user");
const HealthProfile = require("./models/HealthProfile");
const HealthLog = require("./models/HealthLog");
const Medicine = require("./models/Medicine");

const tools = {
  getUserProfile: async ({ userId }) => {
    return await User.findById(userId).select("-password");
  },
  getHealthProfile: async ({ userId }) => {
    return await HealthProfile.findOne({ user: userId });
  },
  getHealthLog: async ({ userId }) => {
    return await HealthLog.find({ userId }).sort({ date: -1 }).limit(7);
  },
  getMedicines: async ({ userId }) => {
    return await Medicine.find({ userId });
  },
};

module.exports = tools;