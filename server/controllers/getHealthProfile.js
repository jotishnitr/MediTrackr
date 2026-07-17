const HealthProfile = require("../models/HealthProfile");
const getHealthProfile = async (req, res) => {
    try {
        const profile = await HealthProfile.findOne({ user: req.user.id });
        res.status(200).json({
            success: true,
            profile: profile ? {
                ...profile.toObject(),
                email: req.user.email
            } : {
                email: req.user.email
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
