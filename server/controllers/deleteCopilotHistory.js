const CopilotHistory = require("../models/CopilotHistory");

const deleteCopilotHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId, timeStamp } = req.body || {};

    if (messageId || timeStamp) {
      // Delete specific message from copilot history
      const chatDoc = await CopilotHistory.findOne({ userId });
      if (chatDoc && chatDoc.messages && chatDoc.messages.length > 0) {
        if (messageId) {
          chatDoc.messages = chatDoc.messages.filter(
            (m) => m._id.toString() !== messageId.toString()
          );
        } else if (timeStamp) {
          const targetTime = new Date(timeStamp).getTime();
          chatDoc.messages = chatDoc.messages.filter((m) => {
            const msgTime = new Date(m.timeStamp).getTime();
            return Math.abs(msgTime - targetTime) > 5000;
          });
        }
        await chatDoc.save();
      }
      return res.status(200).json({
        success: true,
        message: "Message deleted from Copilot history",
      });
    }

    // Default: Clear entire Copilot chat history
    await CopilotHistory.deleteOne({ userId });
    res.status(200).json({
      success: true,
      message: "Copilot history cleared successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to delete Copilot history",
    });
  }
};

module.exports = deleteCopilotHistory;
