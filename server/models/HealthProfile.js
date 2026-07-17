const mongoose = require("mongoose");

const healthProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        age: Number,
        bloodType: String,
        height: Number,
        weight: Number,
        allergies: String,
        emergencyContact: String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("HealthProfile", healthProfileSchema);