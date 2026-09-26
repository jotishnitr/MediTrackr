const cron = require("node-cron");
const Settings = require("../models/Settings");
const User = require("../models/user");
const admin = require("../config/firebase");
const Notification = require("../models/Notification");
const HealthLog = require("../models/HealthLog");

/**
 * Checks for users who haven't logged their daily health metrics today
 * and sends in-app notifications and Firebase Push notifications.
 */
const checkHealthLogReminders = async () => {
  try {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const todayIST = now.toISOString().split("T")[0];
    const todayUTC = new Date().toISOString().split("T")[0];

    console.log(`[HealthLogReminder] Running check for date: ${todayIST} (IST) / ${todayUTC} (UTC)...`);

    // Retrieve all active users
    const users = await User.find({});
    if (!users || users.length === 0) return;

    for (const user of users) {
      try {
        const userId = user._id;

        // Check if user has logged their health log today
        const todayLog = await HealthLog.findOne({
          userId,
          date: { $in: [todayIST, todayUTC] },
        });

        // If user already filled their health log today, skip
        if (todayLog) continue;

        // Check user settings for browser/push alert preferences
        const settings = await Settings.findOne({ userId });
        const alertsEnabled = !settings || settings.browserAlerts !== false;

        const title = "📝 Daily Health Log Reminder";
        const messageText = "Please log your daily vitals, symptoms, and health measurements today.";

        // 1. Create in-app notification in DB
        const userNotification = new Notification({
          userId,
          title,
          message: messageText,
          type: "reminder",
          isRead: false,
        });
        await userNotification.save();

        // 2. Send Push Notification if user has FCM tokens and alerts enabled
        if (alertsEnabled && Array.isArray(user.fcmTokens) && user.fcmTokens.length > 0) {
          const message = {
            notification: {
              title,
              body: messageText,
            },
            data: {
              type: "healthLog",
            },
            tokens: user.fcmTokens,
          };

          const response = await admin.messaging().sendEachForMulticast(message);

          const deadTokens = [];
          response.responses.forEach((res, idx) => {
            if (!res.success) {
              const code = res.error?.code;
              if (
                code === "messaging/registration-token-not-registered" ||
                code === "messaging/invalid-registration-token"
              ) {
                deadTokens.push(user.fcmTokens[idx]);
              }
            }
          });

          if (deadTokens.length > 0) {
            user.fcmTokens = user.fcmTokens.filter((t) => !deadTokens.includes(t));
            await user.save();
            console.log(`[HealthLogReminder] Cleaned up ${deadTokens.length} stale token(s) for user ${userId}.`);
          }

          console.log(
            `[HealthLogReminder] User ${userId}: push sent (${response.successCount} succeeded, ${response.failureCount} failed).`
          );
        }
      } catch (userErr) {
        console.error(`[HealthLogReminder] Error processing user ${user._id}:`, userErr.message);
      }
    }
  } catch (err) {
    console.error("[HealthLogReminder] Error in cron execution:", err.message);
  }
};

// Schedule to run every day at 12:00 PM and 10:00 PM (12:00 and 22:00 IST)
cron.schedule("0 12,22 * * *", checkHealthLogReminders, {
  timezone: "Asia/Kolkata",
});

module.exports = checkHealthLogReminders;
