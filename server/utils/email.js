const { BrevoClient } = require("@getbrevo/brevo");

/**
 * Send welcome email via Brevo Transactional Emails API (HTTP-based)
 * @param {string} name - User's full name
 * @param {string} email - Recipient email address
 */
const sendWelcomeEmail = async (name, email) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;

  if (!apiKey) {
    console.warn("[Welcome Email] Skipped: BREVO_API_KEY not set in environment variables.");
    return;
  }

  if (!senderEmail) {
    console.warn("[Welcome Email] Skipped: BREVO_SENDER_EMAIL (or EMAIL_USER) not set in environment variables.");
    return;
  }

  const subject = "Welcome to MediTrackr! 🏥";
  const textContent = `Hello ${name}!\n\nThank you for registering with MediTrackr. We're excited to have you on board to manage and track your medicines and health effectively.`;
  const htmlContent = `
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
  `;

  try {
    const client = new BrevoClient({ apiKey });
    const response = await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: "MediTrackr",
        email: senderEmail,
      },
      to: [
        {
          name: name || "User",
          email: email,
        },
      ],
      subject: subject,
      textContent: textContent,
      htmlContent: htmlContent,
    });

    const messageId = response?.messageId || response?.messageIds?.[0] || "delivered";
    console.log(`[Welcome Email Success] Sent successfully to ${email}. MessageId: ${messageId}`);
    return response;
  } catch (error) {
    const errorMessage = error?.response?.body?.message || error?.message || error;
    console.error(`[Welcome Email Error] Failed to send to ${email}:`, errorMessage);
  }
};

module.exports = {
  sendWelcomeEmail,
};
