require("dotenv").config();
const { OpenAI } = require("openai");

// Initialize OpenRouter client
const openrouterAssistant = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || "dummy_key",
    baseURL: "https://openrouter.ai/api/v1"
});

module.exports = openrouterAssistant;
