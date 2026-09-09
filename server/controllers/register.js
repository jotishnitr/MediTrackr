const User = require("../models/user.js");
const Settings = require("../models/Settings.js");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Create transporter using SMTP with explicit host and SSL port 465
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password does not match",
      });
    }

    const emailUser = await User.findOne({ email });
    if (emailUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

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

    // Send welcome email asynchronously without blocking registration
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter
        .sendMail({
          from: `"MediTrackr" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Welcome to MediTrackr! 🏥",
          text: `Hello ${name}!\n\nThank you for registering with MediTrackr. We're excited to have you on board to manage and track your medicines and health effectively.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border-radius: 12px; background: #0b1326; color: #dae2fd; border: 1px solid rgba(78, 222, 163, 0.2);">
              <h2 style="color: #4edea3; margin-top: 0;">Welcome to MediTrackr, ${name}! 👋</h2>
              <p style="color: #dae2fd; font-size: 14px; line-height: 1.6;">
                Thank you for joining <strong>MediTrackr</strong>. Your account has been successfully created.
              </p>
              <p style="color: #dae2fd; font-size: 14px; line-height: 1.6;">
                You can now schedule medication reminders, log daily health vitals, track adherence, and chat with your AI Health Assistant & Copilot.
              </p>
              <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 20px 0;" />
              <p style="color: #8c9ba5; font-size: 12px; margin-bottom: 0;">
                Stay healthy,<br/>
                <strong style="color: #4edea3;">The MediTrackr Team</strong>
              </p>
            </div>
          `,
        })
        .then((info) => console.log(`[Welcome Email] Sent successfully to ${email}. MessageId: ${info.messageId}`))
        .catch((err) => console.error(`[Welcome Email Error] Failed to send to ${email}:`, err.message));
    } else {
      console.warn("[Welcome Email] Skipped: EMAIL_USER or EMAIL_PASS not set in environment variables.");
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = register;
