const AssistantHistory = require("../models/AssistantHistory");

const deleteAssistantHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    await AssistantHistory.deleteOne({ userId });
    res.status(200).json({
      success: true,
      message: "Chat history cleared successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to clear history",
    });
  }
};

module.exports = deleteAssistantHistory;
