const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "model"], required: true },
  text: { type: String, required: true },
  timeStamp: { type: Date, default: Date.now },
});

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [messageSchema],
});

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
