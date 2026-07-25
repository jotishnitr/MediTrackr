const cron = require("node-cron");
const Medicine = require("../models/Medicine");
const Settings = require("../models/Settings");
const User = require("../models/user");
const admin = require("../config/firebase");

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const currentDate = now.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const currentTime = now.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    console.log(`Checking reminders: ${currentDate} ${currentTime} IST`);

    const medicines = await Medicine.find({
      reminder: true,
      time: currentTime,
      status: false,
    });
    if (medicines.length === 0) return;

    console.log(`${medicines.length} medicine(s) due.`);

    const userMedicines = {};
    medicines.forEach((medicine) => {
      const uId = medicine.userId.toString();
      if (!userMedicines[uId]) userMedicines[uId] = [];
      userMedicines[uId].push(medicine);
    });

    for (const uId of Object.keys(userMedicines)) {
      try {
        const settings = await Settings.findOne({ userId: uId });
        if (settings && !settings.browserAlerts) {
          console.log(`User ${uId} disabled alerts. Skipping.`);
          continue;
        }

        const user = await User.findById(uId);
        if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
          console.log(`No FCM tokens for user ${uId}.`);
          continue;
        }

        const userMeds = userMedicines[uId];
        const body = userMeds
          .map((m) => `• ${m.name} (${m.dosage} ${m.unit})`)
          .join("\n");

        const message = {
          notification: {
            title: "💊 Medicine Reminder",
            body:
              userMeds.length === 1
                ? `Time to take\n\n${body}`
                : `You have ${userMeds.length} medicines to take.\n\n${body}`,
          },
          data: {
            medicines: JSON.stringify(
              userMeds.map((m) => ({
                id: m._id.toString(),
                name: m.name,
                dosage: m.dosage,
                unit: m.unit,
                time: m.time,
              })),
            ),
          },
          tokens: user.fcmTokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        const deadTokens = [];
        response.responses.forEach((res, idx) => {
          if (!res.success) {
            const code = res.error.code;
            if (
              code === "messaging/registration-token-not-registered" ||
              code === "messaging/invalid-registration-token"
            ) {
              deadTokens.push(user.fcmTokens[idx]);
            }
          }
        });

        if (deadTokens.length) {
          user.fcmTokens = user.fcmTokens.filter(
            (t) => !deadTokens.includes(t),
          );
          await user.save();
          console.log(
            `Removed ${deadTokens.length} dead token(s) for user ${uId}.`,
          );
        }

        console.log(
          `User ${uId}: sent ${response.successCount}, failed ${response.failureCount}`,
        );
      } catch (userErr) {
        console.error(`Error processing reminders for user ${uId}:`, userErr);
      }
    }

    console.log("Reminder notifications processed.");
  } catch (err) {
    console.error("Reminder Scheduler Error:", err);
  }
});

module.exports = {};
