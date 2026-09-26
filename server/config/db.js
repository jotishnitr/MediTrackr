const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!uri) {
      console.warn("MongoDB connection URI not found in environment variables (MONGO_URI / MONGODB_URI). Database operations will fail until set.");
      return;
    }
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
};

module.exports = connectDB;
