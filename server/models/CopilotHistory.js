const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "model", "assistant"],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    default: null,
  },
  actionData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const copilotHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  messages: [messageSchema],
});

module.exports = mongoose.model("CopilotHistory", copilotHistorySchema);
