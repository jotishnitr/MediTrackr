require("dotenv").config();
const { OpenAI } = require("openai");

// Initialize OpenRouter client
const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
});

module.exports = openrouter;

