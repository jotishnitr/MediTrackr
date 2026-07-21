const cron = require("node-cron");
const Medicine = require("../models/Medicine");
const PushSubscription = require("../models/PushSubscription");
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
      second: "2-digit",
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

    const subscriptions = await PushSubscription.find();

    if (subscriptions.length === 0) {
      console.log("No subscribed devices.");
      return;
    }

    // Build notification body
    const body = medicines
      .map(
        (medicine) =>
          `• ${medicine.name} (${medicine.dosage} ${medicine.unit})`,
      )
      .join("\n");

    const payload = JSON.stringify({
      title: "💊 Medicine Reminder",
      body:
        medicines.length === 1
          ? `Time to take\n\n${body}`
          : `You have ${medicines.length} medicines to take.\n\n${body}`,

      data: {
        medicines: medicines.map((medicine) => ({
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
            `Notification failed: ${err.statusCode || ""} ${err.message}`,
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

    console.log("Reminder notification sent.");
  } catch (err) {
    console.error("Reminder Scheduler Error:", err);
  }
});

module.exports = {};
