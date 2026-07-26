const ai = require("../gemini");

const geminiAi = async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({
      error: "Message required",
    });
  }
  try {
    const chat = ai.chats.create({
      model: "gemini-flash-latest",
      history: history || []
    })
    const response = await chat.sendMessage({ message });
    res.status(200).json({ reply: response.text });
  } catch (err) {
    res.status(500).json({
      error: "Something went wrong",
      message: err,
    });
  }
};

module.exports = geminiAi;
