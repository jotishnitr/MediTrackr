const AssistantHistory = require("../models/AssistantHistory");
const getAssistantHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatDoc = await AssistantHistory.findOne({ userId });

    res.status(200).json({
      messages: chatDoc ? chatDoc.messages : [],
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to load History",
    });
  }
};

module.exports = getAssistantHistory;
