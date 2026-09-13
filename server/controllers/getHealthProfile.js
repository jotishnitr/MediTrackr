const HealthProfile = require("../models/HealthProfile");
const User = require("../models/user");

const getHealthProfile = async (req, res) => {
    try {
        const profile = await HealthProfile.findOne({ user: req.user.id });
        const user = await User.findById(req.user.id).populate("familyMembersUserId", "email name");
        const familyMembersEmails = (user?.familyMembersUserId || [])
            .map((member) => (typeof member === "object" && member !== null ? member.email : member))
            .filter(Boolean);

        res.status(200).json({
            success: true,
            profile: profile ? {
                ...profile.toObject(),
                email: req.user.email,
                familyMembersEmails,
            } : {
                email: req.user.email,
                familyMembersEmails,
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

module.exports = getHealthProfile;
