const HealthProfile = require("../models/HealthProfile");
const User = require("../models/user");

const getHealthProfile = async (req, res) => {
    try {
        const profile = await HealthProfile.findOne({ user: req.user.id });
        const user = await User.findById(req.user.id)
            .populate("familyMembersUserId", "email name")
            .populate("pendingFamilyMembersUserId", "email name");

        const connectedList = (user?.familyMembersUserId || []).map((member) => ({
            email: typeof member === "object" && member !== null ? member.email : "",
            name: typeof member === "object" && member !== null ? member.name : "",
            status: "connected",
        })).filter((m) => Boolean(m.email));

        const pendingUserList = (user?.pendingFamilyMembersUserId || []).map((member) => ({
            email: typeof member === "object" && member !== null ? member.email : "",
            name: typeof member === "object" && member !== null ? member.name : "",
            status: "pending",
        })).filter((m) => Boolean(m.email));

        const pendingEmailList = (user?.pendingFamilyEmails || []).map((email) => ({
            email,
            name: "",
            status: "pending",
        })).filter((m) => Boolean(m.email));

        const allFamilyMembers = [...connectedList, ...pendingUserList, ...pendingEmailList];
        const familyMembersEmails = allFamilyMembers.map((m) => m.email);
        const connectedFamilyEmails = connectedList.map((m) => m.email);
        const pendingFamilyEmails = [...pendingUserList, ...pendingEmailList].map((m) => m.email);

        const profileData = {
            email: req.user.email,
            familyMembers: allFamilyMembers,
            familyMembersEmails,
            connectedFamilyEmails,
            pendingFamilyEmails,
        };

        res.status(200).json({
            success: true,
            profile: profile
                ? {
                    ...profile.toObject(),
                    ...profileData,
                }
                : profileData,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

module.exports = getHealthProfile;
