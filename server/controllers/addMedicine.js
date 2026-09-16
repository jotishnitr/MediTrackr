const Medicine = require("../models/Medicine.js");
const User = require("../models/user.js");

const addMedicine = async (req, res) => {
  try {
    const {
      name,
      actualName,
      days,
      dosage,
      unit,
      count,
      frequency,
      time,
      reminder,
      type,
      instructions,
      targetUserId,
      familyMemberId,
      targetEmail,
    } = req.body;

    let targetId = req.user.id;

    // Check if adding for a connected family member
    const requestedTarget = targetUserId || familyMemberId;
    if (requestedTarget || targetEmail) {
      const currentUser = await User.findById(req.user.id);
      const directFamily = (currentUser?.familyMembersUserId || []).map((id) => id.toString());
      const reverseFamilyUsers = await User.find({ familyMembersUserId: req.user.id }).select("_id");
      const reverseFamily = reverseFamilyUsers.map((u) => u._id.toString());
      const connectedFamilyIds = Array.from(new Set([...directFamily, ...reverseFamily]));

      if (requestedTarget && connectedFamilyIds.includes(requestedTarget.toString())) {
        targetId = requestedTarget;
      } else if (targetEmail) {
        const targetUser = await User.findOne({ email: targetEmail.trim().toLowerCase() });
        if (targetUser && connectedFamilyIds.includes(targetUser._id.toString())) {
          targetId = targetUser._id;
        }
      }
    }

    const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const assignedDays = Array.isArray(days) && days.length > 0 ? days : allDays;

    const medicine = await Medicine.create({
      userId: targetId,
      name,
      actualName: actualName ? actualName.trim() : "",
      days: assignedDays,
      dosage,
      unit,
      count: count !== undefined && count !== "" ? Number(count) : 0,
      type,
      time,
      instructions,
    });
    await medicine.save();

    res.status(201).json({
      success: true,
      sucess: true,
      medicine,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = addMedicine;
