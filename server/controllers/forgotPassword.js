const crypto = require("node:crypto");
const User = require("../models/user.js");
const { sendResetPasswordEmail } = require("../utils/email.js");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    // Generate 32-byte secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash token to store in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Set token and 15-minute expiration
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // Determine client base URL for the reset link
    let clientBase = process.env.CLIENT_URL;

    // If not explicitly set or missing repo subpath, extract from referer header
    if (!clientBase && req.headers.referer) {
      try {
        const refererUrl = new URL(req.headers.referer);
        const pathSegments = refererUrl.pathname.split("/").filter(Boolean);
        const subPath =
          pathSegments.length > 0 && !pathSegments[0].startsWith("#")
            ? `/${pathSegments[0]}`
            : "";
        clientBase = `${refererUrl.origin}${subPath}`;
      } catch {
        clientBase = req.headers.origin;
      }
    }

    if (!clientBase) {
      clientBase =
        req.headers.origin || "https://jotishnitr.github.io/MediTrackr";
    }

    // Fix for GitHub Pages subpath if omitted
    if (
      clientBase.includes("jotishnitr.github.io") &&
      !clientBase.includes("MediTrackr")
    ) {
      clientBase = clientBase.replace(
        "jotishnitr.github.io",
        "jotishnitr.github.io/MediTrackr",
      );
    }

    // Clean trailing slashes
    clientBase = clientBase.replace(/\/+$/, "");

    // Ensure HashRouter '#/' is present for GitHub Pages and React HashRouter
    const baseUrl = clientBase.includes("#")
      ? clientBase
      : `${clientBase}/#`;

    const resetUrl = `${baseUrl.replace(/\/+$/, "")}/reset-password/${rawToken}`;

    // Send reset password email asynchronously
    sendResetPasswordEmail(user.email, resetUrl, user.name).catch((err) => {
      console.error("[Forgot Password Error] Failed to send email:", err);
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email. Please check your inbox.",
    });
  } catch (error) {
    console.error("[Forgot Password Controller Error]:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process forgot password request.",
    });
  }
};

module.exports = forgotPassword;
