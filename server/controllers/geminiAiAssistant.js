const ASSISTANT_SYSTEM_PROMPT = `

You are the MediTrackr AI Assistant. You have TWO jobs, strictly separated. Detect intent first, then respond in ONLY that mode.

=== MODE A: APP HELP (MediTrackr features/navigation) ===
Trigger: questions about app features, how-to, navigation, MediTrackr functions/advantages.

APP FEATURES:
1. Dashboard: Total Medicines, Missed Today, Doses Taken, Remaining Doses cards, Today's Schedule, Weekly Adherence chart.
2. My Medicines: active prescriptions w/ dosage, type, instructions, status (Missed/Pending/Taken). Search by name.
3. Add Medicine: "+ Add Medicine" button (top-right). Fill Name, Dosage+unit, Type, Time, Instructions. Save.
4. Reminders: today's schedule, toggle reminders, mark taken via checkmark. Notification Settings: Browser Alerts, Sound.
5. Search Medicines: FDA-verified drug info — generic name, route, manufacturer, usage.
6. Health Log: log symptoms + vitals (sleep, BP, weight). Save Daily Log.
7. Profile: age, blood type, height, weight, allergies/conditions, emergency contact.
8. AI Health Assistant: sidebar section for health Q&A, symptom discussion, document analysis.
9. Feedback: "Give Feedback" button to MediTrackr team.

Rules for Mode A:
- Short, step-by-step, bullet points, friendly concise tone.
- When explaining app operations (like adding medicines, logging vitals, scheduling, or uploading prescriptions), explain the manual steps clearly and ALSO suggest: "💡 *Tip: You can also switch to the **MediTrackr Copilot** tab above to automatically add medicines, schedule doses, or log vitals using natural language or by uploading an image/document!*"
- Unsure if feature exists → "I'm not sure about that — check Settings or contact support via Feedback button."
- Never give medical advice here — redirect: "That's a great question for our AI Health Assistant — sidebar → 'AI Health Assistant'."

=== MODE B: HEALTH/MEDICAL ===
Trigger: symptoms, conditions, body, medicine info, treatment, wellness, medical docs/images.

- Answer ONLY health/medical topics. Off-topic (non-app, non-health) → "I'm only able to help with MediTrackr app questions or health topics. For anything else, try a general-purpose model."
- Precise, evidence-based. No guessing/fabricating drug names or stats. Flag uncertainty explicitly.
- End every medical answer with: "⚠️ This is general information, not a diagnosis. Please consult a licensed doctor for your specific situation."
- Suggest relevant specialist type (Dermatologist, Cardiologist, Pediatrician, Psychiatrist, Orthopedic, Gynecologist, Gastroenterologist, General Physician) based on symptom — never name real specific doctors/clinics.
- Emergency symptoms (chest pain, breathing difficulty, stroke signs, severe bleeding, suicidal ideation) → tell user to seek emergency care/call emergency number FIRST.
- Never definitive diagnosis — "could be associated with," not "you have."
- Analyze shared medical images/reports cautiously; note it's not a substitute for professional review.
- You are MediTrackr AI Health Assistant. You help users understand health questions and analyze uploaded documents/images (lab reports, prescriptions, medicine packaging).
- When analyzing a file: describe what you see factually, summarize key values if it's a lab report, explain what a prescription/medicine label shows.


=== ROUTING ===
- Completely unrelated to MediTrackr AND unrelated to health (coding, trivia, other apps) → "I'm only able to help with MediTrackr app questions or health-related topics. For anything else, try a general assistant."
- If ambiguous, ask one clarifying question: app-related or health-related?

TONE: precise, no fluff, bullets for steps/lists.
`;

const MediTrackrAssistant = require("../geminiAssistant");
const haimakerAssistant = require("../haimakerAssistant");
const openrouter = require("../openrouter");
const AssistantHistory = require("../models/AssistantHistory");
const { processUploadedFile } = require("../utils/fileProcessor");

const gemini_models = [
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash"
];

// Haimaker auto-routing and free models
const haimaker_models = [
  "haimaker/auto",
  "haimaker/auto-free",
  "haimaker/free",
  "auto",
  "meta-llama/llama-3.2-11b-vision-instruct:free",
  "qwen/qwen-2.5-vl-72b-instruct:free",
  "deepseek/deepseek-r1:free",
  "deepseek/deepseek-chat:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "mistralai/mistral-small-24b-instruct-2501:free"
];

// OpenRouter fallback models if Haimaker is unavailable
const openrouter_models = [
  "nvidia/nemotron-3.5-lightning:free",
  "deepseek/deepseek-r1:free",
  "deepseek/deepseek-chat:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free"
];

// Helper function to enforce a strict 15-second timeout per model request
const withTimeout = (promise, ms = 15000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Request timed out after ${ms / 1000}s`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const geminiAiAssistant = async (req, res) => {
  const { message, file } = req.body;
  const userId = req.user.id;

  if (!message && !file) {
    return res.status(400).json({
      error: "Message or file required",
      message: "Message or file required",
    });
  }

  try {
    let chatDoc = await AssistantHistory.findOne({ userId });

    if (!chatDoc) {
      chatDoc = new AssistantHistory({ userId, messages: [] });
    }

    let processed = null;
    if (file) {
      processed = await processUploadedFile(file);
    }

    let aiReply = "";
    let lastError = null;

    // ==========================================================
    // STAGE 1: Try Google Gemini API Models First (15s timeout each)
    // ==========================================================
    const historyForGemini = chatDoc.messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const messageParts = [];
    if (processed?.geminiPart) {
      messageParts.push(processed.geminiPart);
    }
    if (message) {
      messageParts.push({ text: message });
    } else if (file && messageParts.length === 1 && messageParts[0].inlineData) {
      messageParts.push({ text: "Please review and analyze this attached document/image and explain key details." });
    }

    const geminiInput = file ? messageParts : message;

    for (const gm of gemini_models) {
      try {
        const chat = MediTrackrAssistant.chats.create({
          model: gm,
          history: historyForGemini,
          config: {
            systemInstruction: ASSISTANT_SYSTEM_PROMPT,
          },
        });

        const response = await withTimeout(
          chat.sendMessage({
            message: geminiInput,
          }),
          15000
        );

        if (response?.text) {
          aiReply = response.text;
          break;
        }
      } catch (err) {
        console.warn(`[Health Advisor Gemini] Model "${gm}" failed (${err.message}). Trying next...`);
        lastError = err;
      }
    }

    // ==========================================================
    // STAGE 2: If Gemini Fails -> Automatic Fallback to Haimaker Auto (15s timeout each)
    // ==========================================================
    if (!aiReply) {
      console.warn("[Health Advisor] Gemini failed or timed out. Routing automatically to Haimaker Auto API...");

      const haimakerMessages = [
        { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
        ...chatDoc.messages.map((m) => ({
          role: m.role === "model" ? "assistant" : "user",
          content: m.text,
        })),
      ];

      let haimakerUserContent;
      if (processed?.isImage) {
        haimakerUserContent = [
          {
            type: "text",
            text: message || "Please review and analyze this attached image and explain key details.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${processed.mimeType};base64,${file.base64}`,
            },
          },
        ];
      } else if (processed?.extractedText) {
        haimakerUserContent = `${message ? message + "\n\n" : ""}[Attached Document Content]:\n${processed.extractedText}`;
      } else {
        haimakerUserContent = message || "Please review and analyze this attached document/image.";
      }

      haimakerMessages.push({ role: "user", content: haimakerUserContent });

      for (const hm of haimaker_models) {
        try {
          const completion = await withTimeout(
            haimakerAssistant.chat.completions.create({
              model: hm,
              max_tokens: 4096,
              messages: haimakerMessages,
            }),
            15000
          );

          const replyText = completion.choices?.[0]?.message?.content;
          if (replyText) {
            aiReply = replyText;
            break;
          }
        } catch (err) {
          console.warn(`[Health Advisor Haimaker] Model "${hm}" failed (${err.message}). Trying next...`);
          lastError = err;
        }
      }
    }

    // ==========================================================
    // STAGE 3: If Haimaker Also Fails -> Fallback to OpenRouter (15s timeout each)
    // ==========================================================
    if (!aiReply) {
      console.warn("[Health Advisor] Haimaker failed or unavailable. Routing to OpenRouter fallback models...");

      const openrouterMessages = [
        { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
        ...chatDoc.messages.map((m) => ({
          role: m.role === "model" ? "assistant" : "user",
          content: m.text,
        })),
      ];

      let openrouterUserContent;
      if (processed?.isImage) {
        openrouterUserContent = [
          {
            type: "text",
            text: message || "Please review and analyze this attached image and explain key details.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${processed.mimeType};base64,${file.base64}`,
            },
          },
        ];
      } else if (processed?.extractedText) {
        openrouterUserContent = `${message ? message + "\n\n" : ""}[Attached Document Content]:\n${processed.extractedText}`;
      } else {
        openrouterUserContent = message || "Please review and analyze this attached document/image.";
      }

      openrouterMessages.push({ role: "user", content: openrouterUserContent });

      for (const om of openrouter_models) {
        try {
          const completion = await withTimeout(
            openrouter.chat.completions.create({
              model: om,
              max_tokens: 4096,
              messages: openrouterMessages,
            }),
            15000
          );

          const replyText = completion.choices?.[0]?.message?.content;
          if (replyText) {
            aiReply = replyText;
            break;
          }
        } catch (err) {
          console.warn(`[Health Advisor OpenRouter] Model "${om}" failed (${err.message}). Trying next...`);
          lastError = err;
        }
      }
    }

    if (!aiReply) {
      throw lastError || new Error("All AI models across Gemini, Haimaker, and OpenRouter failed to respond.");
    }

    chatDoc.messages.push({ role: "user", text: message || `[Attached: ${file?.name || "Document/Image"}]` });
    chatDoc.messages.push({ role: "model", text: aiReply });

    await chatDoc.save();

    const userMsg = chatDoc.messages[chatDoc.messages.length - 2];
    const assistantMsg = chatDoc.messages[chatDoc.messages.length - 1];

    res.status(200).json({
      reply: aiReply,
      userTime: userMsg.timeStamp,
      modelTime: assistantMsg.timeStamp,
    });
  } catch (err) {
    console.error("[Health Advisor Error]:", err);
    res.status(500).json({
      error: "something went wrong",
      message: err.message || err,
    });
  }
};

module.exports = geminiAiAssistant;
