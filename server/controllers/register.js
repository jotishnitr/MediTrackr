const User = require("../models/user.js");
const Settings = require("../models/Settings.js");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }
    if (password == confirmPassword) {
      const emailUser = await User.findOne({ email });
      if (emailUser) {
        res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
          name,
          email,
          password: hashedPassword,
        });

        // Create default settings for user
        await Settings.create({
          userId: user._id,
          browserAlerts: true,
          notificationSound: true,
        });

        res.status(201).json({
          success: true,
          message: "User registered successfully",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Password does not match",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = register;
