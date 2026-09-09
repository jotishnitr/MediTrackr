const dns = require("node:dns");
const User = require("../models/user.js");
const Settings = require("../models/Settings.js");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// 1 & 2. Prefer IPv4 over IPv6 across all Node DNS lookups to prevent ENETUNREACH errors
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

// 6. Verify EMAIL_USER and EMAIL_PASS exist before creating transporters
let primaryTransporter = null;
let fallbackTransporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  // 4. Primary explicit SMTP configuration (Port 465 - SSL)
  primaryTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 5. Fallback explicit SMTP configuration (Port 587 - TLS)
  fallbackTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 7. Detailed logging for transporter.verify() and connection status
  primaryTransporter.verify((error) => {
    if (error) {
      console.error("[SMTP Connection Failure] Port 465 verification failed:", error.message);
      fallbackTransporter.verify((fallbackErr) => {
        if (fallbackErr) {
          console.error("[SMTP Connection Failure] Port 587 fallback verification failed:", fallbackErr.message);
        } else {
          console.log("[SMTP Connection Success] Fallback transporter ready on port 587 (TLS).");
        }
      });
    } else {
      console.log("[SMTP Connection Success] Primary transporter ready on port 465 (SSL).");
    }
  });
} else {
  console.warn("[SMTP Configuration] EMAIL_USER or EMAIL_PASS not set. Email notifications disabled.");
}

// Helper function to send email with automatic port 587 fallback and detailed logging
const sendMailWithFallback = async (mailOptions) => {
  if (!primaryTransporter) {
    console.warn("[Welcome Email] Skipped: EMAIL_USER or EMAIL_PASS not set in environment variables.");
    return;
  }

  try {
    const info = await primaryTransporter.sendMail(mailOptions);
    console.log(`[Welcome Email Success] Sent via port 465 to ${mailOptions.to}. MessageId: ${info.messageId}`);
    return info;
  } catch (primaryError) {
    console.warn(`[Welcome Email Warning] Port 465 failed for ${mailOptions.to}: ${primaryError.message}. Attempting port 587 fallback...`);
    try {
      const fallbackInfo = await fallbackTransporter.sendMail(mailOptions);
      console.log(`[Welcome Email Success] Sent via port 587 fallback to ${mailOptions.to}. MessageId: ${fallbackInfo.messageId}`);
      return fallbackInfo;
    } catch (fallbackError) {
      console.error(`[Welcome Email Error] Both port 465 and 587 failed to send to ${mailOptions.to}:`, fallbackError.message);
      throw fallbackError;
    }
  }
};

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
      const mailOptions = {
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
      };

      sendMailWithFallback(mailOptions).catch(() => {});
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
