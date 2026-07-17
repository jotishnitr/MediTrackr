const PushSubscription = require("../models/PushSubscription");
const webpush = require("../utils/webPush");

const testNotification = async (req, res) => {
  try {
    const subscriptions = await PushSubscription.find();

    const payload = JSON.stringify({
      title: "MediTrack",
      body: "This is your first push notification 🎉",
    });

    for (const subscription of subscriptions) {
      await webpush.sendNotification(subscription.toObject(), payload);
    }

    res.json({
      success: true,
      message: "Notification sent",
    });
  } catch (err) {
    console.log(err);

    if (err.body) {
      console.log("Body:", err.body);
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = testNotification;
