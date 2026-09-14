const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        userName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        type: {
            type: String,
            enum: ["reminder", "alert", "system", "refill", "connection"],
            default: "reminder",
        },
        connectionStatus: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
        medicineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medicine",
            default: null,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
