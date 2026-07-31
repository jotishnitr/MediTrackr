require("dotenv");

const { geminiAssistant } = require("@google/genai");

const MediTrackrAssistant = new geminiAssistant({
  apiKey: process.env.GEMINI_ASSISTANT_API_KEY,
});

module.exports = MediTrackrAssistant;
