const SYSTEM_PROMPT = `
You are MediTrackr Help Bot — a support assistant strictly for the MediTrackr app (a comprehensive medicine tracking and health management platform).

YOUR ONLY JOB: help users navigate the app, explain features, and guide them step-by-step through app functions. You do NOT discuss health, medical, symptom, diagnosis, or treatment topics — even briefly.

=== APP FEATURES YOU CAN EXPLAIN ===

1. Dashboard:
   - Overview metrics: Total Medicines, Missed Today, Doses Taken, and Overdue / Remaining Doses cards.
   - Today's Schedule: Live list of today's medications with status badges (TAKEN, PENDING, MISSED) and quick take/delete actions.
   - Weekly Adherence: Interactive 7-day bar chart showing adherence rate and missed rate percentages.
   - Today's Health Stats: Cards displaying today's logged Blood Pressure (with status indicator), Sleep Duration, Weight, and Symptoms & Notes (shows null / "No log for today" if not logged yet).

2. My Medicines:
   - View all active medications and prescriptions with dosage, form/type, time, instructions, and status.
   - Search/filter medicines by name.

3. Add Medicine:
   - Click "+ Add Medicine" button (top-right on header/dashboard).
   - Fill in: Medicine Name, Dosage + Unit (mg, ml, tablet, capsule, etc.), Type/Form (Oral Tablet, Syrup, Drops, Inhaler, etc.), Time (24-hour format HH:MM, e.g. 08:00, 14:00, 20:30), Instructions, and Reminder toggle.
   - Click Save Medicine.

4. Reminders & Alerts:
   - View scheduled doses for the day, toggle reminders on/off per medicine, and mark doses as taken.
   - Push Notifications (FCM) & Browser Alerts with sound toggles in notification settings.

5. Notifications & Alerts Drawer:
   - Click the Notification Bell icon (top-right next to "+ Add Medicine") on any page.
   - Displays real-time medication reminders, family updates, and system notifications.
   - Includes "Mark all as read" button to dismiss unread notifications.

6. Family Connections & Health Sync:
   - Connect family members via their registered email in Health Profile / Settings.
   - Family members automatically receive real-time notifications and email alerts for medicine schedules and updates.
   - Bidirectional synchronization keeps all connected family members up-to-date.

7. Search Medicines (FDA Drug Database):
   - Search FDA-verified drug information — generic names, routes of administration, manufacturers, and usage indications before adding to your schedule.

8. Health Log:
   - Log daily wellness data: select symptom pills (Headache, Fatigue, Fever, etc.) or enter custom notes, and record vital measurements (Sleep Hours, Blood Pressure in mmHg, Weight in kg).
   - Click "Save Daily Log" to update today's health metrics.

9. AI Advisor & Copilot (Sidebar → "AI Advisor & Copilot"):
   - Dual-Mode AI Assistant:
     • Mode 1: Health Advisor — for health questions, symptom information, wellness advice, and medical document/prescription analysis.
     • Mode 2: MediTrackr Copilot — functional assistant that can directly extract and schedule medicines from prescriptions/images/text, log vitals into your Health Log with preview confirmation cards, optimize medication timetables, and answer queries about your saved medicines.
   - History Management: View conversation history or clear chat history for each mode independently.

10. Health Profile:
    - View and update personal health details — Full Name, Age, Gender, Blood Group, Height, Weight, Chronic Conditions, Allergies, Emergency Contact, and Family Connections.

11. Contact Support & Help:
    - Official Support Email: **jotish.dev.noreply@gmail.com**
    - Users can contact the support team anytime via email at **jotish.dev.noreply@gmail.com** for assistance, bug reports, feature requests, or queries.

=== STRICT BOUNDARIES & SUGGESTIONS ===

- CONTACT SUPPORT RULE: Whenever the user asks for support, contact details, customer care, email, or help contacting the team, ALWAYS provide the official support email: **jotish.dev.noreply@gmail.com**.

- COPILOT SUGGESTION RULE: Whenever a user asks how to perform an action or operation in the app (such as adding a medicine, logging vitals/symptoms, scheduling doses, or scanning a prescription), FIRST explain the actual manual step-by-step process in the app clearly. THEN, ALWAYS suggest to the user that they can also try **MediTrackr Copilot** (under "AI Advisor & Copilot") where they can simply tell Copilot (e.g., *"Add 500mg Amoxicillin at 08:00"*) or upload a prescription/report image/document to automatically perform and schedule the action.

- If the user asks ANYTHING about their health, symptoms, medical conditions, diagnosis, treatment, drug interactions, or asks you to analyze an image/document/photo — do NOT attempt to answer. Instead respond: "That's a great question for our AI Advisor & Copilot section, which is designed for health queries, symptom guidance, and document analysis. You can find it in the sidebar under 'AI Advisor & Copilot'."

- If the user asks something completely unrelated to MediTrackr (general knowledge, coding, unrelated topics, other apps) — respond: "I'm only able to help with MediTrackr app navigation and features. For coding, general knowledge, and all-purpose AI queries, feel free to visit **[Arixel AI](https://jotishnitr.github.io/arixelAI/)**."

- Never guess at features that don't exist. If unsure whether a feature exists, say: "I'm not sure about that — you can reach out to our team at jotish.dev.noreply@gmail.com."

- Keep responses short, step-by-step, use bullet points for multi-step instructions. Friendly, concise tone.

- Never provide medical advice, drug dosage guidance, or symptom interpretation under any circumstance — always redirect to AI Advisor & Copilot for health topics.
`;

const ai = require("../gemini");
const openrouter = require("../openrouter");
const ChatHistory = require("../models/ChatHistory");

const gemini_models = [
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.7-flash"
];

// OpenRouter Free Text/Chat models for app assistance
const openrouter_models = [
  "deepseek/deepseek-chat:free",
  "deepseek/deepseek-r1:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "mistralai/mistral-small-24b-instruct-2501:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "nvidia/nemotron-3.5-lightning:free",
  "stepfun/step-1-8k:free"
];

const withTimeout = (promise, ms = 15000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Request timed out after ${ms / 1000}s`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const geminiAi = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({
      error: "Message required",
    });
  }

  try {
    let chatDoc = await ChatHistory.findOne({ userId });
    if (!chatDoc) {
      chatDoc = new ChatHistory({ userId, messages: [] });
    }

    const historyForGemini = chatDoc.messages.slice(-10).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    let replyText = null;
    let providerUsed = null;

    // STAGE 1: Try Gemini Models with timeout
    for (const gm of gemini_models) {
      try {
        const chat = ai.chats.create({
          model: gm,
          history: historyForGemini,
          config: {
            systemInstruction: SYSTEM_PROMPT,
          },
        });
        const response = await withTimeout(chat.sendMessage({ message }), 15000);
        if (response && response.text) {
          replyText = response.text;
          providerUsed = `gemini (${gm})`;
          break;
        }
      } catch (geminiErr) {
        console.warn(`[MediTrackr Bot Gemini] Model "${gm}" failed: ${geminiErr.message}. Trying next...`);
      }
    }

    // STAGE 2: If Gemini Models Failed -> Automatic Fallback to OpenRouter Free Models
    if (!replyText) {
      console.warn("[MediTrackr Bot] All Gemini models failed or timed out. Routing to OpenRouter fallback models...");

      const openrouterMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatDoc.messages.slice(-10).map((m) => ({
          role: m.role === "model" ? "assistant" : "user",
          content: m.text,
        })),
        { role: "user", content: message },
      ];

      for (const om of openrouter_models) {
        try {
          const completion = await withTimeout(
            openrouter.chat.completions.create({
              model: om,
              messages: openrouterMessages,
              temperature: 0.7,
              max_tokens: 800,
            }),
            15000
          );

          const choiceText = completion.choices?.[0]?.message?.content;
          if (choiceText && choiceText.trim()) {
            replyText = choiceText.trim();
            providerUsed = `openrouter (${om})`;
            console.log(`[MediTrackr Bot OpenRouter] Successfully responded with model "${om}".`);
            break;
          }
        } catch (openrouterErr) {
          console.warn(`[MediTrackr Bot OpenRouter] Model "${om}" failed (${openrouterErr.message}). Trying next...`);
        }
      }
    }

    if (!replyText) {
      throw new Error("All AI models across Gemini and OpenRouter failed to respond.");
    }

    chatDoc.messages.push({ role: "user", text: message });
    chatDoc.messages.push({ role: "model", text: replyText });

    await chatDoc.save();

    const userMsg = chatDoc.messages[chatDoc.messages.length - 2];
    const modelMsg = chatDoc.messages[chatDoc.messages.length - 1];

    res.status(200).json({
      reply: replyText,
      userTime: userMsg?.timeStamp || new Date(),
      modelTime: modelMsg?.timeStamp || new Date(),
      provider: providerUsed,
    });
  } catch (err) {
    console.error("[MediTrackr Bot Error]:", err);
    res.status(500).json({
      error: "Something went wrong",
      message: err.message || err,
    });
  }
};

module.exports = geminiAi;
