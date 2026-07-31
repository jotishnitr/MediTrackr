require("dotenv");

const { GoogleGenAI } = require("@google/genai");

const MediTrackrAssistant = new GoogleGenAI({
  apiKey: process.env.GEMINI_ASSISTANT_API_KEY,
});

module.exports = MediTrackrAssistant;
