const CopilotHistory = require("../models/CopilotHistory");

const getCopilotHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatDoc = await CopilotHistory.findOne({ userId });

    res.status(200).json({
      messages: chatDoc ? chatDoc.messages : [],
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to load Copilot History",
    });
  }
};

module.exports = getCopilotHistory;
