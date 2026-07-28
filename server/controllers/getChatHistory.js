const ChatHistory = require("../models/ChatHistory");
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatDoc = await ChatHistory.findOne({ userId });

    res.status(200).json({ messages: chatDoc ? chatDoc.messages : [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load History" });
  }
};

module.exports = getChatHistory;