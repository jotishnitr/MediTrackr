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

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const currentDate = now.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const currentTime = formatTimeIST(now);

    const currentDayName = now.toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
    });

    console.log(`Checking reminders: ${currentDate} (${currentDayName}) ${currentTime} IST`);

    // -------------------------------------------------------------
    // 1. Direct Medicine Reminders (Due at Current Time)
    // -------------------------------------------------------------
    const rawMedicines = await Medicine.find({
      reminder: true,
      time: currentTime,
      status: false,
    });

    // Only process medicines scheduled for today's day of week
    const medicines = rawMedicines.filter((m) => {
      if (!m.days || m.days.length === 0) return true;
      return m.days.includes(currentDayName) || m.days.includes(currentDayName.slice(0, 3));
    });

    if (medicines.length > 0) {
      console.log(`${medicines.length} medicine(s) due at ${currentTime}.`);

      const userMedicines = {};
      medicines.forEach((medicine) => {
        const uId = medicine.userId.toString();
        if (!userMedicines[uId]) userMedicines[uId] = [];
        userMedicines[uId].push(medicine);
      });

      for (const uId of Object.keys(userMedicines)) {
        try {
          const user = await User.findById(uId);
          if (!user) continue;

          const userMeds = userMedicines[uId];
          const body = userMeds
            .map((m) => `• ${m.name} (${m.dosage} ${m.unit})`)
            .join("\n");

          const title = "💊 Medicine Reminder";
          const messageText =
            userMeds.length === 1
              ? `Time to take ${userMeds[0].name} (${userMeds[0].dosage} ${userMeds[0].unit})`
              : `You have ${userMeds.length} medicines to take:\n\n${body}`;

          // Always store in-app notification in DB
          const userNotification = new Notification({
            userId: uId,
            title,
            message: messageText,
            type: "reminder",
            medicineId: userMeds[0]._id,
            isRead: false,
          });
          await userNotification.save();

          // Push Notifications via Firebase Cloud Messaging (FCM)
          const settings = await Settings.findOne({ userId: uId });
          const pushEnabled = !settings || settings.browserAlerts;

          if (pushEnabled && Array.isArray(user.fcmTokens) && user.fcmTokens.length > 0) {
            const message = {
              notification: {
                title,
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
                  }))
                ),
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
              console.log(`Removed ${deadTokens.length} dead token(s) for user ${uId}.`);
            }

            console.log(
              `User ${uId}: push sent ${response.successCount}, failed ${response.failureCount}`
            );
          }
        } catch (userErr) {
          console.error(`Error processing reminders for user ${uId}:`, userErr);
        }
      }
    }

    // -------------------------------------------------------------
    // 2. Family Reminders (Medicines missed 30 minutes after due time)
    // -------------------------------------------------------------
    const thirtyMinAgoDate = new Date(now.getTime() - 30 * 60 * 1000);
    const time30MinAgo = formatTimeIST(thirtyMinAgoDate);

    const familyReminderMedicines = await Medicine.find({
      reminder: true,
      time: time30MinAgo,
      status: false,
    });

    if (familyReminderMedicines.length > 0) {
      console.log(
        `${familyReminderMedicines.length} unconfirmed medicine(s) from 30 mins ago (${time30MinAgo}). Checking family alerts...`
      );

      // Group missed medicines by patient userId
      const patientMedicines = {};
      familyReminderMedicines.forEach((med) => {
        const pId = med.userId.toString();
        if (!patientMedicines[pId]) patientMedicines[pId] = [];
        patientMedicines[pId].push(med);
      });

      for (const pId of Object.keys(patientMedicines)) {
        try {
          const patient = await User.findById(pId);
          if (!patient) continue;

          // Find connected family member IDs (bidirectional)
          const directFamily = (patient.familyMembersUserId || []).map((id) => id.toString());
          const reverseFamilyUsers = await User.find({ familyMembersUserId: patient._id }).select("_id");
          const reverseFamily = reverseFamilyUsers.map((u) => u._id.toString());
          const allFamilyMemberIds = Array.from(new Set([...directFamily, ...reverseFamily])).filter(
            (id) => id !== pId
          );

          if (allFamilyMemberIds.length === 0) continue;

          const patientMeds = patientMedicines[pId];
          const medsSummary = patientMeds
            .map((m) => `${m.name} (${m.dosage} ${m.unit})`)
            .join(", ");

          for (const familyMemberId of allFamilyMemberIds) {
            try {
              // Store in-app notification for the family member
              const familyNotification = new Notification({
                userId: familyMemberId,
                title: "👨‍👩‍👧 Family Medicine Reminder",
                userName: patient._id,
                message: `${patient.name} has not taken their scheduled medicine (${medsSummary}) from ${time30MinAgo}.`,
                type: "reminder",
                medicineId: patientMeds[0]._id,
                isRead: false,
              });
              await familyNotification.save();

              // Send FCM push to family member if enabled
              const famSettings = await Settings.findOne({ userId: familyMemberId });
              const familyUser = await User.findById(familyMemberId);
              const famPushEnabled = !famSettings || famSettings.browserAlerts;

              if (
                famPushEnabled &&
                familyUser &&
                Array.isArray(familyUser.fcmTokens) &&
                familyUser.fcmTokens.length > 0
              ) {
                const famMessage = {
                  notification: {
                    title: "👨‍👩‍👧 Family Medicine Reminder",
                    body: `${patient.name} has not taken: ${medsSummary} (scheduled at ${time30MinAgo})`,
                  },
                  data: {
                    patientId: patient._id.toString(),
                    patientName: patient.name || "",
                  },
                  tokens: familyUser.fcmTokens,
                };

                const famResponse = await admin.messaging().sendEachForMulticast(famMessage);

                const deadTokens = [];
                famResponse.responses.forEach((res, idx) => {
                  if (!res.success) {
                    const code = res.error?.code;
                    if (
                      code === "messaging/registration-token-not-registered" ||
                      code === "messaging/invalid-registration-token"
                    ) {
                      deadTokens.push(familyUser.fcmTokens[idx]);
                    }
                  }
                });

                if (deadTokens.length > 0) {
                  familyUser.fcmTokens = familyUser.fcmTokens.filter((t) => !deadTokens.includes(t));
                  await familyUser.save();
                }
              }
            } catch (famMemberErr) {
              console.error(
                `Error sending family reminder to member ${familyMemberId}:`,
                famMemberErr
              );
            }
          }
        } catch (patientErr) {
          console.error(`Error processing family reminders for patient ${pId}:`, patientErr);
        }
      }
    }

    console.log("Reminder notifications processed.");
  } catch (err) {
    console.error("Reminder Scheduler Error:", err);
  }
});

module.exports = {};
