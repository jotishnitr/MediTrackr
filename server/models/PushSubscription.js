const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  clientId: {
    type: String,
    unique: true,
    sparse: true,
  },

  endpoint: {
    type: String,
    required: true,
    unique: true,
  },

  keys: {
    p256dh: String,
    auth: String,
  },
});

module.exports = mongoose.model("PushSubscription", pushSubscriptionSchema);
