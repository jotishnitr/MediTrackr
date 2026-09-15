const cron = require("node-cron");
const Medicine = require("../models/Medicine");
const Settings = require("../models/Settings");
const User = require("../models/user");
const admin = require("../config/firebase");
const Notification = require("../models/Notification");

// Helper to format Date to 24-hour "HH:mm" in Asia/Kolkata timezone
const formatTimeIST = (date) => {
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Check refills function (can be run via cron or manually tested)
const checkRefills = async () => {
  console.log("[Refill Reminder] Starting daily refill check...");

  try {
    // 1. Find all users with connected family members
    const users = await User.find({})
      .select("_id email name familyMembersUserId fcmTokens")
      .populate({
        path: "familyMembersUserId",
        select: "_id email name",
      });

    if (!users.length) {
      console.log("[Refill Reminder] No users found.");
      return;
    }

    // 2. For each user, check medicines for themselves and connected family members
    for (const user of users) {
      try {
        // Collect all target members: user + direct family members
        const directMembers = (user.familyMembersUserId || []).map((m) => ({
          _id: m._id,
          name: m.name || m.email,
          email: m.email,
        }));

        // Also look up reverse family connections
        const reverseFamilyUsers = await User.find({ familyMembersUserId: user._id }).select("_id name email");
        const reverseMembers = reverseFamilyUsers.map((m) => ({
          _id: m._id,
          name: m.name || m.email,
          email: m.email,
        }));

        // Deduplicate member IDs
        const seenMemberIds = new Set();
        const members = [
          { _id: user._id, name: user.name || user.email, email: user.email },
          ...directMembers,
          ...reverseMembers,
        ].filter((m) => {
          if (!m._id) return false;
          const idStr = m._id.toString();
          if (seenMemberIds.has(idStr)) return false;
          seenMemberIds.add(idStr);
          return true;
        });

        for (const member of members) {
          const memberId = member._id;
          const isSelf = memberId.toString() === user._id.toString();

          // Fetch all medicines for this member
          const medicines = await Medicine.find({
            userId: memberId,
          });

          if (!medicines.length) continue;

          // Calculate daily dose frequency by normalized medicine name
          const frequencyMap = {};
          for (const med of medicines) {
            const normalizedName = (med.name || "").trim().toLowerCase();
            frequencyMap[normalizedName] = (frequencyMap[normalizedName] || 0) + 1;
          }

          // Identify medicines needing refill (<= 3 days of stock remaining)
          const urgentRefills = [];

          for (const med of medicines) {
            const normalizedName = (med.name || "").trim().toLowerCase();
            const dailyFrequency = frequencyMap[normalizedName] || 1;
            const count = typeof med.count === "number" ? med.count : 0;
            const remainingDays = Math.max(0, Math.floor(count / dailyFrequency));

            if (remainingDays <= 3) {
              urgentRefills.push({
                _id: med._id,
                name: med.name,
                dosage: med.dosage,
                unit: med.unit,
                count,
                remainingDays,
              });
            }
          }

          if (urgentRefills.length > 0) {
            // Check if notification already sent today to prevent spam
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const existingNotification = await Notification.findOne({
              userId: user._id,
              userName: memberId,
              type: "refill",
              createdAt: { $gte: startOfToday },
            });

            if (existingNotification) {
              continue;
            }

            const outOfStockMeds = urgentRefills.filter((m) => m.remainingDays === 0);
            const lowStockMeds = urgentRefills.filter((m) => m.remainingDays > 0);

            let title = isSelf ? "💊 Upcoming Refill Reminder" : `👨‍👩‍👧 Refill Alert: ${member.name}`;
            if (outOfStockMeds.length > 0) {
              title = isSelf ? "🚨 Medicine Out of Stock" : `🚨 Out of Stock: ${member.name}`;
            }

            const refillLines = urgentRefills.map((m) => {
              if (m.remainingDays === 0) {
                return `• ${m.name} (${m.count} ${m.unit || "units"} left) - OUT OF STOCK`;
              }
              return `• ${m.name} (${m.count} ${m.unit || "units"} left) - ${m.remainingDays} ${m.remainingDays === 1 ? "day" : "days"} remaining`;
            });

            const messageText = isSelf
              ? `You have ${urgentRefills.length} medicine(s) needing refill soon:\n\n${refillLines.join("\n")}`
              : `${member.name} has ${urgentRefills.length} medicine(s) needing refill soon:\n\n${refillLines.join("\n")}`;

            // Save in-app notification to DB
            try {
              const notification = new Notification({
                userId: user._id,
                title,
                message: messageText,
                userName: memberId,
                type: "refill",
                medicineId: urgentRefills[0]._id,
                isRead: false,
              });
              await notification.save();

              console.log(`[Refill Reminder] Created notification for user ${user.email} (Target: ${member.name}).`);
            } catch (notifErr) {
              console.error(`[Refill Reminder] Failed to save notification for ${member.name}:`, notifErr);
            }

            // Send Push Notification via Firebase Cloud Messaging (FCM)
            const settings = await Settings.findOne({ userId: user._id });
            const pushEnabled = !settings || settings.browserAlerts;

            if (pushEnabled && Array.isArray(user.fcmTokens) && user.fcmTokens.length > 0) {
              try {
                const fcmMessage = {
                  notification: {
                    title,
                    body: messageText,
                  },
                  data: {
                    type: "refill",
                    memberId: memberId.toString(),
                    timestamp: Date.now().toString(),
                  },
                  tokens: user.fcmTokens,
                };

                const response = await admin.messaging().sendEachForMulticast(fcmMessage);

                // Clean up dead tokens
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
                  console.log(`[Refill Reminder] Removed ${deadTokens.length} dead FCM token(s) for user ${user.email}.`);
                }

                console.log(`[Refill Reminder] Sent push notification to ${user.email}: ${response.successCount} success.`);
              } catch (fcmErr) {
                console.error(`[Refill Reminder] Failed to send push notification to ${user.email}:`, fcmErr);
              }
            }
          }
        }
      } catch (userErr) {
        console.error(`[Refill Reminder] Error processing user ${user.email}:`, userErr);
      }
    }

    console.log("[Refill Reminder] Daily refill check completed.");
  } catch (error) {
    console.error("[Refill Reminder] Error during daily check:", error);
  }
};

// cron scheduler: runs every day at 05:00 AM IST
const setupRefillReminderCron = () => {
  cron.schedule(
    "0 5 * * *",
    async () => {
      await checkRefills();
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("[Refill Reminder] Refill reminder cron job scheduled for 05:00 AM IST daily.");
};

// Start cron job on load
setupRefillReminderCron();

module.exports = {
  setupRefillReminderCron,
  checkRefills,
  formatTimeIST,
};