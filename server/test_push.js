const mongoose = require("mongoose");
const webpush = require("./utils/webPush");
const PushSubscription = require("./models/PushSubscription");

const testPush = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://djotishkumar2020_db_user:test12345@ac-p14liep-shard-00-00.a3gua90.mongodb.net:27017,ac-p14liep-shard-00-01.a3gua90.mongodb.net:27017,ac-p14liep-shard-00-02.a3gua90.mongodb.net:27017/meditrack?ssl=true&replicaSet=atlas-10xeiz-shard-0&authSource=admin&appName=MediTrackr");
    console.log("Connected to MongoDB");

    const subscriptions = await PushSubscription.find();
    console.log(`Found ${subscriptions.length} subscriptions`);

    if (subscriptions.length === 0) {
      console.log("No subscriptions found in the database. Please subscribe first.");
      mongoose.connection.close();
      return;
    }

    const payload = JSON.stringify({
      title: "🧪 Test Push Notification",
      body: "This is a test notification from the backend to verify service worker delivery when inactive."
    });

    for (const sub of subscriptions) {
      console.log(`Sending to endpoint: ${sub.endpoint.substring(0, 60)}...`);
      try {
        const res = await webpush.sendNotification(sub.toObject(), payload);
        console.log(`SUCCESS! Status code: ${res.statusCode}`);
      } catch (err) {
        console.error(`FAILED! Status: ${err.statusCode}, Message: ${err.message}`);
      }
    }

    mongoose.connection.close();
  } catch (err) {
    console.error("Database connection or execution error:", err);
  }
};

testPush();
