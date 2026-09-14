const User = require("./models/user");
const HealthProfile = require("./models/HealthProfile");
const HealthLog = require("./models/HealthLog");
const Medicine = require("./models/Medicine");

// Helper to find all bidirectional connected family member IDs
const getConnectedFamilyIds = async (userId) => {
  const user = await User.findById(userId);
  const directFamily = (user?.familyMembersUserId || []).map((id) => id.toString());
  const reverseFamilyUsers = await User.find({ familyMembersUserId: userId }).select("_id");
  const reverseFamily = reverseFamilyUsers.map((u) => u._id.toString());
  return Array.from(new Set([...directFamily, ...reverseFamily])).filter((id) => id !== userId.toString());
};

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
  getFamilyMembers: async ({ userId }) => {
    const familyIds = await getConnectedFamilyIds(userId);
    return await User.find({ _id: { $in: familyIds } }).select("_id name email");
  },
  getFamilyMemberHealthLog: async ({ userId }) => {
    const familyIds = await getConnectedFamilyIds(userId);
    return await HealthLog.find({ userId: { $in: familyIds } })
      .populate("userId", "_id name email")
      .sort({ date: -1 })
      .limit(15);
  },
  getFamilyMeberHealthLog: async ({ userId }) => {
    const familyIds = await getConnectedFamilyIds(userId);
    return await HealthLog.find({ userId: { $in: familyIds } })
      .populate("userId", "_id name email")
      .sort({ date: -1 })
      .limit(15);
  },
  getFamilyMemberMedicines: async ({ userId }) => {
    const familyIds = await getConnectedFamilyIds(userId);
    return await Medicine.find({ userId: { $in: familyIds } })
      .populate("userId", "_id name email");
  },
  getFamilyMemberHealthProfile: async ({ userId }) => {
    const familyIds = await getConnectedFamilyIds(userId);
    return await HealthProfile.find({ user: { $in: familyIds } })
      .populate("user", "_id name email");
  },
  getFamilyMemberUserProfile: async ({ userId }) => {
    const familyIds = await getConnectedFamilyIds(userId);
    return await User.find({ _id: { $in: familyIds } }).select("-password");
  },
};

module.exports = tools;