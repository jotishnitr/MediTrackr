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
  const medicinesUrl = "https://jotishnitr.github.io/MediTrackr/#/myMedicines";
  const logoUrl = "https://jotishnitr.github.io/MediTrackr/icon.png";
  const supportEmail = "jotish.dev.noreply@gmail.com";
  const subject = `Welcome to MediTrackr, ${name}! 🏥 Your Smart Health Companion`;

  const textContent = `Hello ${name}!

Welcome to MediTrackr! Your account (${email}) has been successfully created.

MediTrackr is your intelligent, all-in-one companion designed to help you stay in complete control of your daily medications and health vitals.

--- GETTING STARTED IN 3 EASY STEPS ---
1. Add Your Prescriptions: Input your medicine names, dosages, frequencies, and scheduled intake times.
2. Enable Smart Reminders: Turn on notifications to receive timely audio chimes and alerts.
3. Track Vitals & Consult AI: Log daily metrics (Blood Pressure, Sugar, Heart Rate) and chat with your Gemini AI Health Copilot.

--- CORE FEATURES AT A GLANCE ---
💊 Smart Medication Management: 1-click dose tracking (Taken / Skipped) and weekly adherence scoring.
⏰ Automated Dose Reminders: Timely audio and browser alerts synchronized to your timezone.
🔍 OpenFDA Safety & Drug Search: Instant access to official FDA composition, warnings, and precautions.
📊 Daily Health Logs: Record and visualize BP, glucose, heart rate, and overall wellness trends.
🤖 AI Clinical Health Copilot: Ask questions about drug interactions, symptoms, and health advice.
📑 Exportable Clinical Reports: Download clean PDF summaries ready for your doctor appointments.

Access your dashboard anytime:
${appUrl}

Need Help or Have Questions?
Contact our team directly at: ${supportEmail}

Stay healthy & empowered,
The MediTrackr Team`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MediTrackr</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 640px; background-color: #0a1122; border: 1px solid rgba(78, 222, 163, 0.25); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Hero Header with Actual Logo -->
          <tr>
            <td style="padding: 40px 32px 30px 32px; background: linear-gradient(145deg, #091a38 0%, #061928 60%, #08201a 100%); border-bottom: 1px solid rgba(78, 222, 163, 0.2); text-align: center;">
              
              <!-- Actual App Logo -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 16px;">
                <tr>
                  <td align="center">
                    <img 
                      src="${logoUrl}" 
                      alt="MediTrackr Logo" 
                      width="64" 
                      height="64" 
                      style="display: block; border-radius: 16px; border: 2px solid rgba(78, 222, 163, 0.5); box-shadow: 0 8px 24px rgba(78, 222, 163, 0.35); background-color: #0b1326;" 
                    />
                  </td>
                </tr>
              </table>

              <!-- Badge -->
              <div style="display: inline-block; background: rgba(78, 222, 163, 0.12); border: 1px solid rgba(78, 222, 163, 0.4); border-radius: 20px; padding: 5px 14px; margin-bottom: 14px;">
                <span style="font-size: 11px; font-weight: 700; color: #4edea3; letter-spacing: 1px; text-transform: uppercase;">
                  ✦ Official Welcome Guide
                </span>
              </div>

              <!-- Title -->
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 26px; font-weight: 800; line-height: 1.25; letter-spacing: -0.3px;">
                Welcome to MediTrackr, <span style="color: #4edea3;">${name}</span>! 👋
              </h1>
              <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.5; max-width: 460px; margin: 0 auto;">
                Your intelligent, personalized health companion designed to simplify medication schedules, track vitals, and empower your wellness.
              </p>
            </td>
          </tr>

          <!-- Onboarding 3-Step Quick Start -->
          <tr>
            <td style="padding: 28px 32px 12px 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 16px; color: #38bdf8; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase;">
                🚀 Getting Started in 3 Simple Steps
              </h2>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 18px 20px;">
                <!-- Step 1 -->
                <tr>
                  <td width="32" valign="top" style="font-size: 18px; font-weight: 800; color: #4edea3; line-height: 1.4;">1.</td>
                  <td style="padding-bottom: 14px;">
                    <strong style="color: #ffffff; font-size: 14px;">Add Your Prescriptions & Schedule</strong>
                    <p style="margin: 2px 0 0 0; color: #94a3b8; font-size: 13px; line-height: 1.45;">
                      Navigate to <strong>My Medicines</strong> and add your prescribed drugs, dosage strengths, and intake times (morning, afternoon, night).
                    </p>
                  </td>
                </tr>
                <!-- Step 2 -->
                <tr>
                  <td width="32" valign="top" style="font-size: 18px; font-weight: 800; color: #4edea3; line-height: 1.4;">2.</td>
                  <td style="padding-bottom: 14px;">
                    <strong style="color: #ffffff; font-size: 14px;">Enable Smart Audio & Push Alerts</strong>
                    <p style="margin: 2px 0 0 0; color: #94a3b8; font-size: 13px; line-height: 1.45;">
                      Turn on browser notifications and sound chimes so you receive timely dose reminders without checking the clock.
                    </p>
                  </td>
                </tr>
                <!-- Step 3 -->
                <tr>
                  <td width="32" valign="top" style="font-size: 18px; font-weight: 800; color: #4edea3; line-height: 1.4;">3.</td>
                  <td>
                    <strong style="color: #ffffff; font-size: 14px;">Log Health Vitals & Consult the AI Copilot</strong>
                    <p style="margin: 2px 0 0 0; color: #94a3b8; font-size: 13px; line-height: 1.45;">
                      Record Blood Pressure, Glucose, and Heart Rate daily. Use the <strong>AI Health Assistant</strong> for drug queries and symptom insights.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Deep-Dive Features Showcase -->
          <tr>
            <td style="padding: 20px 32px 10px 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 16px; color: #4edea3; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase;">
                ✨ Complete Feature & Function Breakdown
              </h2>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <!-- Feature 1: Medication Tracking -->
                <tr>
                  <td style="background: #0f1c33; border: 1px solid rgba(78, 222, 163, 0.15); border-radius: 12px; padding: 16px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="36" valign="top" style="font-size: 22px;">💊</td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff; font-weight: 700;">Smart Medication Management</h3>
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                            Detailed prescription management with custom dosages, meal instructions (before/after food), and 1-click dose confirmation (Taken/Skipped).
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="12"></td></tr>

                <!-- Feature 2: Reminders -->
                <tr>
                  <td style="background: #0f1c33; border: 1px solid rgba(78, 222, 163, 0.15); border-radius: 12px; padding: 16px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="36" valign="top" style="font-size: 22px;">⏰</td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff; font-weight: 700;">Intelligent Dose Reminders</h3>
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                            Background push notifications and custom audio chime alerts synced with your local timezone ensure zero missed doses.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="12"></td></tr>

                <!-- Feature 3: FDA Safety Search -->
                <tr>
                  <td style="background: #0f1c33; border: 1px solid rgba(78, 222, 163, 0.15); border-radius: 12px; padding: 16px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="36" valign="top" style="font-size: 22px;">🔍</td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff; font-weight: 700;">OpenFDA Clinical Database & Safety Search</h3>
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                            Search over 100,000+ FDA-approved drugs for active ingredients, indications, safety warnings, and contraindications in real time.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="12"></td></tr>

                <!-- Feature 4: Health Logs -->
                <tr>
                  <td style="background: #0f1c33; border: 1px solid rgba(78, 222, 163, 0.15); border-radius: 12px; padding: 16px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="36" valign="top" style="font-size: 22px;">📊</td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff; font-weight: 700;">Daily Health Vitals & Adherence Analytics</h3>
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                            Log Blood Pressure, Blood Sugar, Heart Rate, and Weight. Track your weekly medication adherence percentage with visual progress charts.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="12"></td></tr>

                <!-- Feature 5: AI Health Assistant -->
                <tr>
                  <td style="background: #0f1c33; border: 1px solid rgba(78, 222, 163, 0.15); border-radius: 12px; padding: 16px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="36" valign="top" style="font-size: 22px;">🤖</td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff; font-weight: 700;">AI Health Assistant & Copilot</h3>
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                            Powered by Google Gemini AI, ask queries on drug interactions, clarify medication instructions, and receive tailored wellness tips.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="12"></td></tr>

                <!-- Feature 6: PDF Reports -->
                <tr>
                  <td style="background: #0f1c33; border: 1px solid rgba(78, 222, 163, 0.15); border-radius: 12px; padding: 16px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="36" valign="top" style="font-size: 22px;">📄</td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff; font-weight: 700;">Exportable Clinical PDF Reports</h3>
                          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                            Generate professional health reports and adherence summaries in one click to share directly with doctors or caregivers.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Account Details Card -->
          <tr>
            <td style="padding: 16px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(30, 41, 59, 0.4); border: 1px dashed rgba(255, 255, 255, 0.12); border-radius: 12px; padding: 14px 18px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Account Summary
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #e2e8f0;">
                      Registered Email: <strong style="color: #4edea3;">${email}</strong> &bull; Status: <strong style="color: #38bdf8;">Active</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td align="center" style="padding: 24px 32px 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #4edea3 0%, #22c55e 100%); box-shadow: 0 6px 25px rgba(78, 222, 163, 0.35);">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 16px 38px; font-size: 15px; font-weight: 800; color: #070f1e; text-decoration: none; border-radius: 10px; letter-spacing: 0.3px;">
                      Launch MediTrackr Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support & Inquiries Section -->
          <tr>
            <td style="padding: 24px 32px; background: #060b17; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 6px 0; font-size: 14px; color: #ffffff; font-weight: 700;">
                      💬 Questions, Feedback, or Inquiries?
                    </p>
                    <p style="margin: 0 0 14px 0; font-size: 13px; line-height: 1.5; color: #94a3b8; max-width: 440px;">
                      Our team is here to assist you with any questions or technical support. Please contact us anytime at:
                      <br/>
                      <a href="mailto:${supportEmail}" style="color: #4edea3; font-weight: 700; text-decoration: none; font-size: 14px;">
                        ${supportEmail}
                      </a>
                    </p>
                    <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 16px 0;" />
                    <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.4;">
                      © ${new Date().getFullYear()} MediTrackr &bull; Built with care for your health and wellness.<br/>
                      You received this email because you registered on MediTrackr.
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

  const logoUrl = "https://jotishnitr.github.io/MediTrackr/icon.png";
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
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #dae2fd;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0a1122; border: 1px solid rgba(78, 222, 163, 0.25); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header Banner with Logo -->
          <tr>
            <td style="padding: 36px 30px 24px 30px; background: linear-gradient(145deg, #091a38 0%, #061928 60%, #08201a 100%); border-bottom: 1px solid rgba(78, 222, 163, 0.2); text-align: center;">
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 14px;">
                <tr>
                  <td align="center">
                    <img 
                      src="${logoUrl}" 
                      alt="MediTrackr Logo" 
                      width="56" 
                      height="56" 
                      style="display: block; border-radius: 14px; border: 2px solid rgba(78, 222, 163, 0.5); box-shadow: 0 8px 20px rgba(78, 222, 163, 0.35); background-color: #0b1326;" 
                    />
                  </td>
                </tr>
              </table>

              <div style="display: inline-block; background: rgba(78, 222, 163, 0.12); border: 1px solid rgba(78, 222, 163, 0.4); border-radius: 20px; padding: 4px 12px; margin-bottom: 10px;">
                <span style="font-size: 11px; font-weight: 700; color: #4edea3; letter-spacing: 1px; text-transform: uppercase;">
                  🔒 Security Alert
                </span>
              </div>

              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">
                Password Reset Request
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
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 15px 38px; background: linear-gradient(135deg, #4edea3 0%, #22c55e 100%); color: #070f1e; font-size: 15px; font-weight: 800; text-decoration: none; border-radius: 10px; letter-spacing: 0.3px; box-shadow: 0 6px 25px rgba(78, 222, 163, 0.35);">
                      Reset Password Now →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid #ef4444; border-radius: 6px; padding: 12px 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #fca5a5;">
                  ⏳ <strong>Security Notice:</strong> This password reset link will expire in <strong>15 minutes</strong>.
                </p>
              </div>

              <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                If the button above doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px 0; font-size: 12px; line-height: 1.5; word-break: break-all; color: #38bdf8; background: #060b17; padding: 12px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.2);">
                ${resetUrl}
              </p>

              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                🛡️ If you did not request a password reset, you can safely ignore this email. Your password and account remain completely safe.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background: #060b17; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;">
                Need help? Reach out at <a href="mailto:${supportEmail}" style="color: #4edea3; font-weight: 700; text-decoration: none;">${supportEmail}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                © ${new Date().getFullYear()} MediTrackr &bull; All rights reserved.
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

/**
 * Send notification email when a user adds a family member/caregiver
 * @param {string} recipientEmail - The family member's email
 * @param {string} patientName - Name of the user who added them
 * @param {string} patientEmail - Email of the user who added them
 */
const sendFamilyConnectionRequestEmail = async (recipientEmail, patientName, patientEmail) => {
  const rawApiKey = process.env.BREVO_API_KEY;
  const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;

  if (!rawApiKey) {
    console.warn("[Family Email] Skipped: BREVO_API_KEY not set in environment variables.");
    return;
  }

  const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");
  const senderEmail = rawSenderEmail ? rawSenderEmail.trim().replace(/^["']|["']$/g, "") : null;

  if (!senderEmail) {
    console.warn("[Family Email] Skipped: BREVO_SENDER_EMAIL (or EMAIL_USER) not set in environment variables.");
    return;
  }

  const appUrl = "https://jotishnitr.github.io/MediTrackr/#/dashboard";
  const logoUrl = "https://jotishnitr.github.io/MediTrackr/icon.png";
  const displayName = patientName || patientEmail || "A family member";
  const subject = `🤝 ${displayName} sent you a Family Connection Request on MediTrackr`;

  const textContent = `Hello!

${displayName} (${patientEmail}) has sent you a family connection request on MediTrackr.

Status: ⏳ Pending Your Acceptance

As a connected family member on MediTrackr:
• You will receive automated family alerts if ${displayName} misses scheduled medication doses (after 30 minutes).
• You can help ensure their wellness, adherence, and timely care.

To accept or decline this request, please open MediTrackr and check your notification drawer:
${appUrl}

Stay healthy & empowered,
The MediTrackr Team`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Family Connection Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0a1122; border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header -->
          <tr>
            <td style="padding: 36px 32px 28px; background: linear-gradient(145deg, #1b0a2a 0%, #110e28 60%, #08201a 100%); border-bottom: 1px solid rgba(168, 85, 247, 0.25); text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 14px;">
                <tr>
                  <td align="center">
                    <img 
                      src="${logoUrl}" 
                      alt="MediTrackr Logo" 
                      width="58" 
                      height="58" 
                      style="display: block; border-radius: 14px; border: 2px solid rgba(168, 85, 247, 0.5); box-shadow: 0 8px 24px rgba(168, 85, 247, 0.35); background-color: #0b1326;" 
                    />
                  </td>
                </tr>
              </table>
              <div style="display: inline-block; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #c084fc; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                🤝 Family Connection Request
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #f8fafc; line-height: 1.3;">
                Connection Request Received
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px 20px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                Hello,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                <strong style="color: #c084fc;">${displayName}</strong> (<a href="mailto:${patientEmail}" style="color: #38bdf8; text-decoration: none;">${patientEmail}</a>) has sent you a request to connect as a family member / caregiver on <strong style="color: #4edea3;">MediTrackr</strong>.
              </p>

              <!-- Status Notice Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 14px; color: #fbbf24; font-weight: 600;">
                    ⏳ Status: Pending Your Acceptance
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #cbd5e1; line-height: 1.5; padding-top: 6px;">
                    This connection will only be established after you accept the request. Log in to MediTrackr and check your Notification Center (🔔) to Accept or Decline.
                  </td>
                </tr>
              </table>

              <!-- Highlight Info Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(15, 28, 51, 0.8); border: 1px solid rgba(78, 222, 163, 0.2); border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #4edea3; font-weight: 700;">
                      🛡️ Once connected:
                    </h3>
                    <ul style="margin: 0; padding-left: 18px; color: #94a3b8; font-size: 13.5px; line-height: 1.6;">
                      <li style="margin-bottom: 6px;">
                        <strong style="color: #f1f5f9;">Missed Dose Alerts:</strong> Receive notifications if ${displayName} misses scheduled medications (triggered 30 mins after due time).
                      </li>
                      <li style="margin-bottom: 6px;">
                        <strong style="color: #f1f5f9;">Mutual Support:</strong> Help your loved ones stay on track with their wellness and treatments.
                      </li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); box-shadow: 0 6px 25px rgba(168, 85, 247, 0.35);">
                          <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 14.5px; font-weight: 800; color: #ffffff; text-decoration: none; border-radius: 10px; letter-spacing: 0.3px;">
                            Review Request in MediTrackr →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background: #060b17; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.4;">
                © ${new Date().getFullYear()} MediTrackr &bull; Smart Health Management System.<br/>
                This email was sent to ${recipientEmail} because you were invited as a family member on MediTrackr.
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
          name: "MediTrackr Health",
          email: senderEmail,
        },
        to: [
          {
            email: recipientEmail,
          },
        ],
        subject: subject,
        textContent: textContent,
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`[Family Email Error] Failed to send to ${recipientEmail}: Status code: ${response.status}`, data);
      return;
    }

    const messageId = data?.messageId || data?.messageIds?.[0] || "delivered";
    console.log(`[Family Email Success] Sent successfully to ${recipientEmail}. MessageId: ${messageId}`);
    return data;
  } catch (error) {
    console.error(`[Family Email Error] Failed to send to ${recipientEmail}:`, error?.message || error);
  }
};

const sendFamilyMemberAddedEmail = sendFamilyConnectionRequestEmail;

/**
 * Send notification email when a family member connection is removed
 * @param {string} recipientEmail - The removed family member's email
 * @param {string} patientName - Name of the user who disconnected
 * @param {string} patientEmail - Email of the user who disconnected
 */
const sendFamilyMemberRemovedEmail = async (recipientEmail, patientName, patientEmail) => {
  const rawApiKey = process.env.BREVO_API_KEY;
  const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;

  if (!rawApiKey) {
    console.warn("[Family Removed Email] Skipped: BREVO_API_KEY not set in environment variables.");
    return;
  }

  const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");
  const senderEmail = rawSenderEmail ? rawSenderEmail.trim().replace(/^["']|["']$/g, "") : null;

  if (!senderEmail) {
    console.warn("[Family Removed Email] Skipped: BREVO_SENDER_EMAIL (or EMAIL_USER) not set in environment variables.");
    return;
  }

  const appUrl = "https://jotishnitr.github.io/MediTrackr/#/dashboard";
  const logoUrl = "https://jotishnitr.github.io/MediTrackr/icon.png";
  const displayName = patientName || patientEmail || "A family member";
  const subject = `ℹ️ Family Connection Update on MediTrackr`;

  const textContent = `Hello!

This is a notification to inform you that your family connection with ${displayName} (${patientEmail}) on MediTrackr has been removed.

You will no longer receive medication reminders or missed dose safety alerts for ${displayName}.

If you believe this was done in error, please contact ${displayName} or manage your family connections in your MediTrackr dashboard:
${appUrl}

Stay healthy & empowered,
The MediTrackr Team`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Family Connection Removed - MediTrackr</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0a1122; border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header -->
          <tr>
            <td style="padding: 36px 32px 28px; background: linear-gradient(145deg, #1f1124 0%, #170d1e 60%, #0d1522 100%); border-bottom: 1px solid rgba(244, 63, 94, 0.2); text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 14px;">
                <tr>
                  <td align="center">
                    <img 
                      src="${logoUrl}" 
                      alt="MediTrackr Logo" 
                      width="58" 
                      height="58" 
                      style="display: block; border-radius: 14px; border: 2px solid rgba(244, 63, 94, 0.5); box-shadow: 0 8px 24px rgba(244, 63, 94, 0.35); background-color: #0b1326;" 
                    />
                  </td>
                </tr>
              </table>
              <div style="display: inline-block; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.35); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #f43f5e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                ℹ️ Connection Removed
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #f8fafc; line-height: 1.3;">
                Family Connection Disconnected
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px 20px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                Hello,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                This email confirms that your family connection with <strong style="color: #f43f5e;">${displayName}</strong> (<a href="mailto:${patientEmail}" style="color: #38bdf8; text-decoration: none;">${patientEmail}</a>) has been removed from MediTrackr.
              </p>

              <!-- Info Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(28, 18, 30, 0.8); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #cbd5e1; font-size: 13.5px; line-height: 1.6;">
                      You will no longer receive automated missed-dose alerts or family reminder updates for ${displayName}.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #334155 0%, #1e293b 100%); border: 1px solid rgba(255, 255, 255, 0.15);">
                          <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 14px; font-weight: 700; color: #f8fafc; text-decoration: none; border-radius: 10px;">
                            Go to MediTrackr Dashboard →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background: #060b17; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.4;">
                © ${new Date().getFullYear()} MediTrackr &bull; Smart Health Management System.<br/>
                This email was sent to ${recipientEmail} regarding your MediTrackr family circle.
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
          name: "MediTrackr Health",
          email: senderEmail,
        },
        to: [
          {
            email: recipientEmail,
          },
        ],
        subject: subject,
        textContent: textContent,
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error(`[Family Removed Email Error] Failed to send to ${recipientEmail}: Status code: ${response.status}`, data);
      return;
    }
    console.log(`[Family Removed Email Success] Sent successfully to ${recipientEmail}.`);
    return data;
  } catch (error) {
    console.error(`[Family Removed Email Error] Failed to send to ${recipientEmail}:`, error?.message || error);
  }
};

/**
 * Send confirmation email to the user modifying their family list
 * @param {string} userEmail - The user making the change
 * @param {string} userName - The user's name
 * @param {string} targetEmail - The email of the family member added/removed
 * @param {string} actionType - 'added' | 'removed'
 */
/**
 * Send email to the requester confirming their connection request was dispatched (Pending)
 * @param {string} userEmail - The requester's email
 * @param {string} userName - The requester's name
 * @param {string} targetEmail - The invited member's email
 */
const sendFamilyRequestSentEmail = async (userEmail, userName, targetEmail) => {
  const rawApiKey = process.env.BREVO_API_KEY;
  const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;

  if (!rawApiKey || !rawSenderEmail) return;

  const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");
  const senderEmail = rawSenderEmail.trim().replace(/^["']|["']$/g, "");

  const appUrl = "https://jotishnitr.github.io/MediTrackr/#/dashboard";
  const logoUrl = "https://jotishnitr.github.io/MediTrackr/icon.png";
  const subject = `⏳ Family Connection Request Sent to ${targetEmail}`;

  const textContent = `Hello ${userName || "there"},

You have sent a family connection request to ${targetEmail} on MediTrackr.

Status: ⏳ Pending Their Acceptance

Once ${targetEmail} logs into MediTrackr and accepts your request from their notification center, you will both be officially linked to share medication reminders and safety alerts.

Manage your profile:
${appUrl}

Stay healthy,
The MediTrackr Team`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Family Connection Request Sent</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0a1122; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 20px; overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(145deg, #1f1406 0%, #061928 100%);">
              <img src="${logoUrl}" alt="MediTrackr" width="52" height="52" style="border-radius: 12px; margin-bottom: 12px;" />
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #f8fafc;">
                Connection Request Sent
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px 20px;">
              <p style="margin: 0 0 14px 0; font-size: 15px; color: #e2e8f0;">
                Hello <strong style="color: #4edea3;">${userName || "there"}</strong>,
              </p>
              <p style="margin: 0 0 16px 0; font-size: 14.5px; line-height: 1.6; color: #cbd5e1;">
                Your family connection request to <strong style="color: #fbbf24;">${targetEmail}</strong> has been sent successfully.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 13.5px; color: #fbbf24; line-height: 1.5; font-weight: 600;">
                    ⏳ Status: Pending Acceptance
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #94a3b8; line-height: 1.5; padding-top: 6px;">
                    They have been notified by email. Once they log into MediTrackr and click "Accept" in their Notification Drawer, your accounts will be connected for alerts.
                  </td>
                </tr>
              </table>
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 8px; background: #4edea3;">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #070f1e; text-decoration: none; border-radius: 8px;">
                      View Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px; background: #060b17; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} MediTrackr
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
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "MediTrackr Health",
          email: senderEmail,
        },
        to: [{ email: userEmail }],
        subject: subject,
        textContent: textContent,
        htmlContent: htmlContent,
      }),
    });
  } catch (err) {
    console.error(`[Family Request Sent Email Error] Failed to send to ${userEmail}:`, err);
  }
};

/**
 * Send email when a family connection request is accepted (sent to both parties)
 * @param {string} recipientEmail - Email of the recipient receiving this notification
 * @param {string} recipientName - Name of the recipient
 * @param {string} otherUserEmail - Email of the other user in the connection
 * @param {string} otherUserName - Name of the other user in the connection
 * @param {string} role - 'requester' | 'acceptor'
 */
const sendFamilyConnectionAcceptedEmail = async (recipientEmail, recipientName, otherUserEmail, otherUserName, role) => {
  const rawApiKey = process.env.BREVO_API_KEY;
  const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;

  if (!rawApiKey || !rawSenderEmail) return;

  const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");
  const senderEmail = rawSenderEmail.trim().replace(/^["']|["']$/g, "");

  const appUrl = "https://jotishnitr.github.io/MediTrackr/#/dashboard";
  const logoUrl = "https://jotishnitr.github.io/MediTrackr/icon.png";
  const isRequester = role === "requester";
  const otherDisplayName = otherUserName || otherUserEmail;

  const subject = isRequester
    ? `✅ ${otherDisplayName} accepted your Family Connection Request!`
    : `✅ You are now connected with ${otherDisplayName} on MediTrackr`;

  const textContent = `Hello ${recipientName || "there"},

${isRequester 
  ? `Great news! ${otherDisplayName} (${otherUserEmail}) has accepted your family connection request on MediTrackr.`
  : `You have successfully accepted the family connection request from ${otherDisplayName} (${otherUserEmail}) on MediTrackr.`}

Status: ✅ Successfully Connected

You are now connected as family members and will receive automated medicine schedule alerts and safety notifications.

Open MediTrackr Dashboard:
${appUrl}

Stay healthy,
The MediTrackr Team`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Family Connection Established</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0a1122; border: 1px solid rgba(78, 222, 163, 0.35); border-radius: 20px; overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(145deg, #091a38 0%, #062b1b 100%);">
              <img src="${logoUrl}" alt="MediTrackr" width="52" height="52" style="border-radius: 12px; margin-bottom: 12px;" />
              <div style="display: inline-block; background: rgba(78, 222, 163, 0.15); border: 1px solid rgba(78, 222, 163, 0.35); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #4edea3; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                ✅ Connected
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #f8fafc;">
                Family Connection Established
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px 20px;">
              <p style="margin: 0 0 14px 0; font-size: 15px; color: #e2e8f0;">
                Hello <strong style="color: #4edea3;">${recipientName || "there"}</strong>,
              </p>
              <p style="margin: 0 0 16px 0; font-size: 14.5px; line-height: 1.6; color: #cbd5e1;">
                ${isRequester 
                  ? `<strong style="color: #4edea3;">${otherDisplayName}</strong> has accepted your family connection request.`
                  : `You have successfully connected with <strong style="color: #4edea3;">${otherDisplayName}</strong> on MediTrackr.`}
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(15, 28, 51, 0.8); border: 1px solid rgba(78, 222, 163, 0.2); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 13.5px; color: #94a3b8; line-height: 1.5;">
                    🛡️ <strong style="color: #f1f5f9;">Active Protection:</strong> You are now linked to share real-time dose reminders, adherence tracking, and missed medicine alerts.
                  </td>
                </tr>
              </table>
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 8px; background: #4edea3;">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #070f1e; text-decoration: none; border-radius: 8px;">
                      Open MediTrackr Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px; background: #060b17; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} MediTrackr
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
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "MediTrackr Health",
          email: senderEmail,
        },
        to: [{ email: recipientEmail }],
        subject: subject,
        textContent: textContent,
        htmlContent: htmlContent,
      }),
    });
  } catch (err) {
    console.error(`[Family Connection Accepted Email Error] Failed to send to ${recipientEmail}:`, err);
  }
};

/**
 * Send email when a family connection request is declined (sent to both parties)
 * @param {string} recipientEmail - Email of the recipient receiving this notification
 * @param {string} recipientName - Name of the recipient
 * @param {string} otherUserEmail - Email of the other user
 * @param {string} otherUserName - Name of the other user
 * @param {string} role - 'requester' | 'rejector'
 */
const sendFamilyConnectionDeclinedEmail = async (recipientEmail, recipientName, otherUserEmail, otherUserName, role) => {
  const rawApiKey = process.env.BREVO_API_KEY;
  const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;

  if (!rawApiKey || !rawSenderEmail) return;

  const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");
  const senderEmail = rawSenderEmail.trim().replace(/^["']|["']$/g, "");

  const appUrl = "https://jotishnitr.github.io/MediTrackr/#/dashboard";
  const logoUrl = "https://jotishnitr.github.io/MediTrackr/icon.png";
  const isRequester = role === "requester";
  const otherDisplayName = otherUserName || otherUserEmail;

  const subject = isRequester
    ? `ℹ️ Family Connection Request to ${otherDisplayName} was declined`
    : `ℹ️ You declined the Family Connection Request from ${otherDisplayName}`;

  const textContent = `Hello ${recipientName || "there"},

${isRequester 
  ? `${otherDisplayName} (${otherUserEmail}) declined the family connection request on MediTrackr.`
  : `You have declined the family connection request from ${otherDisplayName} (${otherUserEmail}) on MediTrackr.`}

Status: ❌ Connection Request Declined

No connection was established and no medicine alerts are shared. You can manage your family settings at any time in MediTrackr.

Open MediTrackr:
${appUrl}

Stay healthy,
The MediTrackr Team`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connection Request Declined</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0a1122; border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 20px; overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(145deg, #1f0a10 0%, #061928 100%);">
              <img src="${logoUrl}" alt="MediTrackr" width="52" height="52" style="border-radius: 12px; margin-bottom: 12px;" />
              <div style="display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #f87171; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                ℹ️ Declined
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #f8fafc;">
                Connection Request Declined
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px 20px;">
              <p style="margin: 0 0 14px 0; font-size: 15px; color: #e2e8f0;">
                Hello <strong style="color: #cbd5e1;">${recipientName || "there"}</strong>,
              </p>
              <p style="margin: 0 0 16px 0; font-size: 14.5px; line-height: 1.6; color: #cbd5e1;">
                ${isRequester 
                  ? `<strong style="color: #f87171;">${otherDisplayName}</strong> declined the family connection request.`
                  : `You have declined the family connection request from <strong style="color: #cbd5e1;">${otherDisplayName}</strong>.`}
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(15, 28, 51, 0.8); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 13.5px; color: #94a3b8; line-height: 1.5;">
                    No connection was created. You can manage or send new family connection requests at any time from your MediTrackr profile settings.
                  </td>
                </tr>
              </table>
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 8px; background: #334155;">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #f8fafc; text-decoration: none; border-radius: 8px;">
                      Open MediTrackr →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px; background: #060b17; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} MediTrackr
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
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "MediTrackr Health",
          email: senderEmail,
        },
        to: [{ email: recipientEmail }],
        subject: subject,
        textContent: textContent,
        htmlContent: htmlContent,
      }),
    });
  } catch (err) {
    console.error(`[Family Connection Declined Email Error] Failed to send to ${recipientEmail}:`, err);
  }
};

const sendFamilyMemberConfirmationEmail = async (userEmail, userName, targetEmail, actionType) => {
  if (actionType === "added") {
    return sendFamilyRequestSentEmail(userEmail, userName, targetEmail);
  }

  const rawApiKey = process.env.BREVO_API_KEY;
  const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;

  if (!rawApiKey || !rawSenderEmail) return;

  const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");
  const senderEmail = rawSenderEmail.trim().replace(/^["']|["']$/g, "");

  const appUrl = "https://jotishnitr.github.io/MediTrackr/#/dashboard";
  const logoUrl = "https://jotishnitr.github.io/MediTrackr/icon.png";
  const subject = `ℹ️ Family Member Removed: ${targetEmail}`;

  const textContent = `Hello ${userName || "there"},

You have removed ${targetEmail} from your family circle on MediTrackr. They will no longer receive your medication alerts.

Manage your profile:
${appUrl}

Stay healthy,
The MediTrackr Team`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Family Member Removed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0a1122; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(145deg, #091a38 0%, #061928 100%);">
              <img src="${logoUrl}" alt="MediTrackr" width="52" height="52" style="border-radius: 12px; margin-bottom: 12px;" />
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #f8fafc;">
                Family Circle Updated
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px 20px;">
              <p style="margin: 0 0 14px 0; font-size: 15px; color: #e2e8f0;">
                Hello <strong style="color: #4edea3;">${userName || "there"}</strong>,
              </p>
              <p style="margin: 0 0 16px 0; font-size: 14.5px; line-height: 1.6; color: #cbd5e1;">
                You have removed <strong style="color: #f43f5e;">${targetEmail}</strong> from your connected family list on MediTrackr.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(15, 28, 51, 0.8); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 13.5px; color: #94a3b8; line-height: 1.5;">
                    ℹ️ They have been unlinked and will no longer receive your medication notifications or safety alerts.
                  </td>
                </tr>
              </table>
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 8px; background: #4edea3;">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #070f1e; text-decoration: none; border-radius: 8px;">
                      View Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px; background: #060b17; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} MediTrackr
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
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "MediTrackr Health",
          email: senderEmail,
        },
        to: [{ email: userEmail }],
        subject: subject,
        textContent: textContent,
        htmlContent: htmlContent,
      }),
    });
  } catch (err) {
    console.error(`[Family Removal Confirmation Email Error] Failed to send to ${userEmail}:`, err);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendFamilyConnectionRequestEmail,
  sendFamilyMemberAddedEmail,
  sendFamilyRequestSentEmail,
  sendFamilyConnectionAcceptedEmail,
  sendFamilyConnectionDeclinedEmail,
  sendFamilyMemberRemovedEmail,
  sendFamilyMemberConfirmationEmail,
};
