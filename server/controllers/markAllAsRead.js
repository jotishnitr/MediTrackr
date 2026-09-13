const Notification = require("../models/Notification");

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (err) {
        console.error("Error marking notifications as read:", err);
        res.status(500).json({
            success: false,
            error: "Failed to mark all notifications as read",
        });
    }
};

module.exports = markAllAsRead;