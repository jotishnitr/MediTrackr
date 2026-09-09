require("dotenv").config();
const { OpenAI } = require("openai");

// Initialize Haimaker client (OpenAI-compatible gateway)
const haimaker = new OpenAI({
  apiKey: process.env.HAIMAKER_API_KEY || "dummy_key",
  baseURL: "https://api.haimaker.ai/v1",
});

module.exports = haimaker;
