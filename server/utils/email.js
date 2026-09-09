/**
 * Send welcome email via Brevo Transactional Emails HTTP API
 * @param {string} name - User's full name
 * @param {string} email - Recipient email address
 */
const sendWelcomeEmail = async (name, email) => {
  const rawApiKey = process.env.BREVO_API_KEY;
  const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;

  if (!rawApiKey) {
    console.warn("[Welcome Email] Skipped: BREVO_API_KEY not set in environment variables.");
    return;
  }

  // Clean and sanitize environment variables (removes accidental quotes, spaces, or newlines)
  const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");
  const senderEmail = rawSenderEmail ? rawSenderEmail.trim().replace(/^["']|["']$/g, "") : null;

  if (!senderEmail) {
    console.warn("[Welcome Email] Skipped: BREVO_SENDER_EMAIL (or EMAIL_USER) not set in environment variables.");
    return;
  }

  // Diagnostic warning if key doesn't match standard Brevo v3 API key prefix
  if (!apiKey.startsWith("xkeysib-")) {
    console.warn(
      "[Welcome Email Warning] BREVO_API_KEY does not start with 'xkeysib-'. " +
      "Make sure you generated an API Key from: Brevo Dashboard -> SMTP & API -> API Keys (tab) -> Generate a new API key."
    );
  }

  const appUrl = "https://jotishnitr.github.io/MediTrackr/#/dashboard";
  const supportEmail = "jotish.dev.noreply@gmail.com";
  const subject = `Welcome to MediTrackr, ${name}! 🏥 Your Smart Health Companion`;

  const textContent = `Hello ${name}!

Welcome to MediTrackr! Your account has been successfully created.

MediTrackr is designed to help you stay in control of your daily health and medications with precision and ease.

Here is what you can do with MediTrackr:
1. 💊 Smart Medication Tracking: Add your medicines with custom dosages, intake times, and track daily adherence.
2. ⏰ Intelligent Reminders: Get automated browser & sound notifications so you never miss a dose.
3. 🔍 FDA Drug Information Search: Search the official OpenFDA database for drug composition, usage, and safety warnings.
4. 📊 Health Vitals & Adherence Logs: Log and monitor your vitals (Blood Pressure, Sugar, Heart Rate) and track your weekly adherence score.
5. 🤖 AI Health Assistant & Copilot: Ask health questions, explore interactions, and receive personalized insights powered by Gemini AI.
6. 📑 PDF Health Reports: Export comprehensive health and medication summaries for your doctor visits.

Get Started: Visit ${appUrl} and log in to explore your dashboard.

Need Help?
For any questions, queries, or feedback, contact us anytime at: ${supportEmail}

Stay healthy,
The MediTrackr Team`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MediTrackr</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050a14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #dae2fd;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #050a14; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #0b1326; border: 1px solid rgba(78, 222, 163, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 30px 24px 30px; background: linear-gradient(135deg, #0b1a3a 0%, #061e2e 100%); border-bottom: 1px solid rgba(78, 222, 163, 0.2); text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: rgba(78, 222, 163, 0.15); border: 1px solid #4edea3; border-radius: 12px; padding: 8px 16px; margin-bottom: 12px;">
                      <span style="font-size: 20px; font-weight: 800; color: #4edea3; letter-spacing: 0.5px;">🏥 MediTrackr</span>
                    </div>
                    <h1 style="margin: 8px 0 4px 0; color: #ffffff; font-size: 24px; font-weight: 700; line-height: 1.3;">
                      Welcome aboard, <span style="color: #4edea3;">${name}</span>! 👋
                    </h1>
                    <p style="margin: 0; color: #94a3b8; font-size: 14px;">
                      Your smart, personalized medication and health tracking companion
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Intro Message -->
          <tr>
            <td style="padding: 28px 30px 16px 30px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                Thank you for joining <strong>MediTrackr</strong>. Your account is now active and ready. We're here to help you effortlessly manage your daily prescriptions, track health vitals, and gain intelligent AI insights.
              </p>
              
              <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; border-radius: 4px; padding: 12px 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #bae6fd;">
                  💡 <strong>Quick Tip:</strong> Start by adding your regular medications and setting your daily intake times to receive automated reminders.
                </p>
              </div>
            </td>
          </tr>

          <!-- Features Section Header -->
          <tr>
            <td style="padding: 10px 30px 6px 30px;">
              <h2 style="margin: 0; font-size: 18px; color: #4edea3; font-weight: 700; letter-spacing: 0.3px;">
                ✨ Explore MediTrackr Features & Functions
              </h2>
            </td>
          </tr>

          <!-- Feature 1 & 2 -->
          <tr>
            <td style="padding: 12px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <!-- Feature 1 -->
                <tr>
                  <td style="background: #111d38; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="38" valign="top" style="font-size: 24px; line-height: 1;">💊</td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 15px; color: #ffffff; font-weight: 600;">Smart Medication Management</h3>
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                            Add your medicines with precise dosage, frequency, and time schedules. Easily mark doses as taken or skipped with one click.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="12"></td></tr>

                <!-- Feature 2 -->
                <tr>
                  <td style="background: #111d38; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="38" valign="top" style="font-size: 24px; line-height: 1;">⏰</td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 15px; color: #ffffff; font-weight: 600;">Automated Dose Reminders</h3>
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                            Receive timely browser notifications and custom audio alerts synchronized with your time zone so you never miss a dose.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="12"></td></tr>

                <!-- Feature 3 -->
                <tr>
                  <td style="background: #111d38; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="38" valign="top" style="font-size: 24px; line-height: 1;">🔍</td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 15px; color: #ffffff; font-weight: 600;">FDA Drug Safety & Info Search</h3>
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                            Search the official OpenFDA drug database for comprehensive details on ingredients, indications, precautions, and contraindications.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="12"></td></tr>

                <!-- Feature 4 -->
                <tr>
                  <td style="background: #111d38; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="38" valign="top" style="font-size: 24px; line-height: 1;">📊</td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 15px; color: #ffffff; font-weight: 600;">Daily Health Logs & Adherence Analytics</h3>
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                            Log daily vitals including Blood Pressure, Glucose levels, and Heart Rate. View your weekly adherence percentage and progress charts.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="12"></td></tr>

                <!-- Feature 5 -->
                <tr>
                  <td style="background: #111d38; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="38" valign="top" style="font-size: 24px; line-height: 1;">🤖</td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 15px; color: #ffffff; font-weight: 600;">AI Health Assistant & Copilot</h3>
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                            Powered by Gemini AI, ask queries regarding your medications, potential interactions, lifestyle tips, and general wellness advice.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="12"></td></tr>

                <!-- Feature 6 -->
                <tr>
                  <td style="background: #111d38; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="38" valign="top" style="font-size: 24px; line-height: 1;">📄</td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 15px; color: #ffffff; font-weight: 600;">Exportable PDF Medical Reports</h3>
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                            Generate professional PDF health summaries of your prescriptions and health logs to share with your physician or healthcare team.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 24px 30px 28px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #4edea3 0%, #22c55e 100%);">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #0b1326; text-decoration: none; border-radius: 8px; letter-spacing: 0.3px;">
                      Launch MediTrackr Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact & Support Section -->
          <tr>
            <td style="padding: 20px 30px; background: #070d1a; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff; font-weight: 600;">
                      💬 Questions, Feedback, or Assistance?
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                      We're always here to help! For any queries, technical support, or suggestions, please contact us at:
                      <br/>
                      <a href="mailto:${supportEmail}" style="color: #4edea3; font-weight: 600; text-decoration: none;">
                        ${supportEmail}
                      </a>
                    </p>
                    <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 16px 0;" />
                    <p style="margin: 0; font-size: 12px; color: #64748b;">
                      © ${new Date().getFullYear()} MediTrackr. All rights reserved.<br/>
                      Empowering your wellness with smart medication tracking.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
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
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.message || `HTTP ${response.status} ${response.statusText}`;
      console.error(`[Welcome Email Error] Failed to send to ${email}: Status code: ${response.status}`, data);
      return;
    }

    const messageId = data?.messageId || data?.messageIds?.[0] || "delivered";
    console.log(`[Welcome Email Success] Sent successfully to ${email}. MessageId: ${messageId}`);
    return data;
  } catch (error) {
    console.error(`[Welcome Email Error] Failed to send to ${email}:`, error?.message || error);
  }
};

/**
 * Send password reset email via Brevo Transactional Emails HTTP API
 * @param {string} email - Recipient email address
 * @param {string} resetUrl - Complete password reset link (frontend URL with token)
 * @param {string} name - User's name (optional)
 */
const sendResetPasswordEmail = async (email, resetUrl, name = "User") => {
  const rawApiKey = process.env.BREVO_API_KEY;
  const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;

  if (!rawApiKey) {
    console.warn("[Reset Password Email] Skipped: BREVO_API_KEY not set in environment variables.");
    return;
  }

  const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");
  const senderEmail = rawSenderEmail ? rawSenderEmail.trim().replace(/^["']|["']$/g, "") : null;

  if (!senderEmail) {
    console.warn("[Reset Password Email] Skipped: BREVO_SENDER_EMAIL (or EMAIL_USER) not set in environment variables.");
    return;
  }

  const supportEmail = "jotish.dev.noreply@gmail.com";
  const subject = "🔒 Reset Your MediTrackr Password";

  const textContent = `Hello ${name},

You recently requested to reset your password for your MediTrackr account.

Click the link below to set a new password:
${resetUrl}

This link is valid for 15 minutes.

If you did not request a password reset, please ignore this email. Your password will remain completely secure and unchanged.

For questions or assistance, contact: ${supportEmail}

Stay healthy,
The MediTrackr Team`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - MediTrackr</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050a14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #dae2fd;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #050a14; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0b1326; border: 1px solid rgba(78, 222, 163, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 30px 20px 30px; background: linear-gradient(135deg, #0b1a3a 0%, #061e2e 100%); border-bottom: 1px solid rgba(78, 222, 163, 0.2); text-align: center;">
              <div style="display: inline-block; background: rgba(78, 222, 163, 0.15); border: 1px solid #4edea3; border-radius: 12px; padding: 8px 16px; margin-bottom: 12px;">
                <span style="font-size: 18px; font-weight: 800; color: #4edea3; letter-spacing: 0.5px;">🏥 MediTrackr</span>
              </div>
              <h1 style="margin: 8px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 700;">
                Password Reset Request 🔒
              </h1>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 28px 30px 20px 30px;">
              <p style="margin: 0 0 14px 0; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
                Hello <strong style="color: #4edea3;">${name}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                We received a request to reset the password for your MediTrackr account associated with <strong style="color: #dae2fd;">${email}</strong>.
              </p>

              <!-- Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #4edea3 0%, #22c55e 100%); color: #0b1326; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; letter-spacing: 0.3px; box-shadow: 0 4px 20px rgba(78, 222, 163, 0.4);">
                      Reset Password Now →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid #ef4444; border-radius: 6px; padding: 12px 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #fca5a5;">
                  ⏳ <strong>Important:</strong> This password reset link will expire in <strong>15 minutes</strong> for security reasons.
                </p>
              </div>

              <p style="margin: 0 0 10px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                If the button above doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px 0; font-size: 12px; line-height: 1.5; word-break: break-all; color: #38bdf8; background: #060d1b; padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.2);">
                ${resetUrl}
              </p>

              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                🛡️ If you did not request a password reset, you can safely ignore this email. Your password and account remain completely safe.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background: #070d1a; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;">
                Need help? Reach out at <a href="mailto:${supportEmail}" style="color: #4edea3; text-decoration: none;">${supportEmail}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                © ${new Date().getFullYear()} MediTrackr. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "MediTrackr Security",
          email: senderEmail,
        },
        to: [
          {
            name: name,
            email: email,
          },
        ],
        subject: subject,
        textContent: textContent,
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.message || `HTTP ${response.status} ${response.statusText}`;
      console.error(`[Reset Password Email Error] Failed to send to ${email}: Status code: ${response.status}`, data);
      return;
    }

    const messageId = data?.messageId || data?.messageIds?.[0] || "delivered";
    console.log(`[Reset Password Email Success] Sent successfully to ${email}. MessageId: ${messageId}`);
    return data;
  } catch (error) {
    console.error(`[Reset Password Email Error] Failed to send to ${email}:`, error?.message || error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendResetPasswordEmail,
};
