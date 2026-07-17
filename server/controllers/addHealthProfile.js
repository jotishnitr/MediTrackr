const HealthProfile = require("../models/HealthProfile");
const addHealthProfile = async (req, res) => {
    try {
        const { fullName, age, bloodType, height, weight, allergies, emergencyContact } = req.body;
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
                profile: existingProfile,
            });
        }
        const profile = await HealthProfile.create({
            user: req.user.id,
            userEmail: req.user.email,
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
            profile,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
module.exports = addHealthProfile;
