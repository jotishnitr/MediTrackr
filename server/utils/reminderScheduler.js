const cron = require("node-cron");
const Medicine = require("../models/Medicine");
const PushSubscription = require("../models/PushSubscription");
const Settings = require("../models/Settings");
const webpush = require("./webPush");

// Runs every minute
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

    if (medicines.length === 0) {
      return;
    }

    console.log(`${medicines.length} medicine(s) due.`);

    // Group due medicines by userId
    const userMedicines = {};
    medicines.forEach((medicine) => {
      const uId = medicine.userId.toString();
      if (!userMedicines[uId]) {
        userMedicines[uId] = [];
      }
      userMedicines[uId].push(medicine);
    });

    // Send reminders to each user
    for (const uId of Object.keys(userMedicines)) {
      try {
        // 1. Check user settings if browserAlerts is enabled
        const settings = await Settings.findOne({ userId: uId });
        if (settings && !settings.browserAlerts) {
          console.log(`User ${uId} has disabled browser alerts. Skipping.`);
          continue;
        }

        // 2. Find subscriptions for this user
        const subscriptions = await PushSubscription.find({ userId: uId });
        if (subscriptions.length === 0) {
          console.log(`No subscribed devices for user ${uId}.`);
          continue;
        }

        const userMeds = userMedicines[uId];
        const body = userMeds
          .map(
            (medicine) =>
              `• ${medicine.name} (${medicine.dosage} ${medicine.unit})`,
          )
          .join("\n");

        const payload = JSON.stringify({
          title: "💊 Medicine Reminder",
          body:
            userMeds.length === 1
              ? `Time to take\n\n${body}`
              : `You have ${userMeds.length} medicines to take.\n\n${body}`,

          data: {
            medicines: userMeds.map((medicine) => ({
              id: medicine._id,
              name: medicine.name,
              dosage: medicine.dosage,
              unit: medicine.unit,
              time: medicine.time,
            })),
          },
        });

        await Promise.all(
          subscriptions.map(async (subscription) => {
            try {
              await webpush.sendNotification(subscription.toObject(), payload);
            } catch (err) {
              console.log(
                `Notification failed for user ${uId}: ${err.statusCode || ""} ${err.message}`,
              );

              if (err.statusCode === 404 || err.statusCode === 410) {
                await PushSubscription.deleteOne({
                  endpoint: subscription.endpoint,
                });

                console.log("Expired subscription removed.");
              }
            }
          }),
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
