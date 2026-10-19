const CopilotHistory = require("../models/CopilotHistory");

const updateCopilotHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId, timeStamp, actionStatus = "executed" } = req.body || {};

    const chatDoc = await CopilotHistory.findOne({ userId });
    if (!chatDoc || !chatDoc.messages || chatDoc.messages.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Copilot history not found",
      });
    }

    let targetMsg = null;

    if (messageId) {
      targetMsg = chatDoc.messages.find(
        (m) => m._id && m._id.toString() === messageId.toString()
      );
    }

    if (!targetMsg && timeStamp) {
      const targetTime = new Date(timeStamp).getTime();
      targetMsg = chatDoc.messages.find((m) => {
        const msgTime = new Date(m.timeStamp).getTime();
        return Math.abs(msgTime - targetTime) <= 10000;
      });
    }

    // Fallback: If still not matched, find the most recent message with action
    if (!targetMsg) {
      for (let i = chatDoc.messages.length - 1; i >= 0; i--) {
        const m = chatDoc.messages[i];
        if (m.action && (!m.actionStatus || m.actionStatus === "pending")) {
          targetMsg = m;
          break;
        }
      }
    }

    if (!targetMsg) {
      return res.status(404).json({
        success: false,
        error: "Message to update not found",
      });
    }

    targetMsg.actionStatus = actionStatus;
    chatDoc.markModified("messages");
    await chatDoc.save();

    return res.status(200).json({
      success: true,
      message: "Copilot message status updated successfully",
      actionStatus: targetMsg.actionStatus,
      messageId: targetMsg._id,
    });
  } catch (err) {
    console.error("Failed to update copilot message status:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update Copilot message status",
    });
  }
};

module.exports = updateCopilotHistory;
