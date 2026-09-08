require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const MediTrackrAssistant = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

module.exports = MediTrackrAssistant;
