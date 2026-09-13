const Notification = require("../models/Notification");
const User = require("../models/user");

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ userId, isRead: false }).sort({ createdAt: -1 });
        const populatedNotifications = await Promise.all(notifications.map(async (notification) => {
            const notifObj = notification.toObject ? notification.toObject() : notification;
            if (notifObj.userName) {
                const user = await User.findById(notifObj.userName);
                if (user) {
                    notifObj.userName = user.name;
                }
            }
            return notifObj;
        }));
        res.status(200).json({
            success: true,
            notifications: populatedNotifications,
        });
    } catch (err) {
        console.error("Error getting notifications:", err);
        res.status(500).json({
            success: false,
            error: "Failed to get notifications",
        });
    }
};

module.exports = getNotifications;