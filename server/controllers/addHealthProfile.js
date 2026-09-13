const HealthProfile = require("../models/HealthProfile");
const User = require("../models/user");
const addHealthProfile = async (req, res) => {
    try {
        const {
            fullName,
            age,
            bloodType,
            height,
            weight,
            allergies,
            emergencyContact,
            familyMembersEmails,
        } = req.body;

        // Process Family Members if emails array provided
        let familyMembersEmailsList = [];
        if (Array.isArray(familyMembersEmails)) {
            const cleanedEmails = familyMembersEmails
                .filter(Boolean)
                .map((email) => email.trim().toLowerCase())
                .filter((email) => email !== req.user?.email?.toLowerCase());

            let familyUserIds = [];
            if (cleanedEmails.length > 0) {
                const familyUsers = await User.find({
                    email: { $in: cleanedEmails },
                    _id: { $ne: req.user.id },
                }).select("_id");

                familyUserIds = familyUsers.map((u) => u._id);
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { familyMembersUserId: familyUserIds },
                { new: true }
            ).populate("familyMembersUserId", "email name");

            familyMembersEmailsList = (updatedUser?.familyMembersUserId || [])
                .map((u) => (typeof u === "object" && u !== null ? u.email : u))
                .filter(Boolean);
        } else {
            const currentUser = await User.findById(req.user.id).populate("familyMembersUserId", "email name");
            familyMembersEmailsList = (currentUser?.familyMembersUserId || [])
                .map((u) => (typeof u === "object" && u !== null ? u.email : u))
                .filter(Boolean);
        }

        const existingProfile = await HealthProfile.findOne({ user: req.user.id });
        if (existingProfile) {
            existingProfile.fullName = fullName;
            existingProfile.age = age;
            existingProfile.bloodType = bloodType;
            existingProfile.height = height;
            existingProfile.weight = weight;
            existingProfile.allergies = allergies;
            existingProfile.emergencyContact = emergencyContact;
            await existingProfile.save();
            return res.status(200).json({
                success: true,
                profile: {
                    ...existingProfile.toObject(),
                    email: req.user?.email,
                    familyMembersEmails: familyMembersEmailsList,
                },
            });
        }

        const profile = await HealthProfile.create({
            user: req.user.id,
            fullName,
            age,
            bloodType,
            height,
            weight,
            allergies,
            emergencyContact,
        });
        res.status(201).json({
            success: true,
            profile: {
                ...profile.toObject(),
                email: req.user?.email,
                familyMembersEmails: familyMembersEmailsList,
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
module.exports = addHealthProfile;
