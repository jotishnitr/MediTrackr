const CopilotHistory = require("../models/CopilotHistory");

const deleteCopilotHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    await CopilotHistory.deleteOne({ userId });
    res.status(200).json({
      success: true,
      message: "Copilot history cleared successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to clear Copilot history",
    });
  }
};

module.exports = deleteCopilotHistory;
