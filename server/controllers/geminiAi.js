const ai = require("../gemini");
const ChatHistory = require("../models/ChatHistory");

const geminiAi = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.userId;

  if (!message) {
    return res.status(400).json({
      error: "Message required",
    });
  }
  try {
    let chatDoc = await ChatHistory.findOne({ userId });
    if (!chatDoc) {
      chatDoc = new ChatHistory({ userId, messages: [] });
    }

    const historyForGemini = chatDoc.messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const chat = ai.chats.create({
      model: "gemini-model-latest",
      history: historyForGemini,
    });
    const response = await chat.sendMessage({ message });

    chatDoc.messages.push({ role: "user", text: message });
    chatDoc.messages.push({ role: "model", text: response.text });

    await chatDoc.save();

    res.status(200).json({ reply: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Something went wrong",
      message: err.message || err,
    });
  }
};

module.exports = geminiAi;
