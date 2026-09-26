const User = require("../models/user");
const HealthProfile = require("../models/HealthProfile");
const MediTrackrAssistant = require("../geminiAssistant");
const openrouter = require("../openrouter");
const HealthLog = require("../models/HealthLog");

const gemini_models = [
  "gemini-3.6-flash",    // most stable free model right now
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-2.5-pro",
  "gemini-flash-latest"
];


const openrouter_models = [
  "stealth/space-bunny-alpha",
  "nvidia/nemotron-3-ultra:free",
  "inclusionai/ling-3.0-flash-fin:free",
  "poolside/laguna-s-2.1:free",
  "dots-studio/dots3-note-preview:free",
  "nvidia/nemotron-3.5-lightning:free",
  "thinkingmachines/inkling:free",
  "nvidia/nemotron-3-super:free",
  "inclusionai/ling-3.0-flash-sante:free",
  "cohere/north-mini-code:free",
  "thinkingmachines/inkling-small:free",
  "poolside/laguna-xs-2.1:free",
  "qwen/qwen3.8-27b:free",
  "nvidia/nemotron-3-nano-omni:free",
  "liquid/lfm2.5-2.6b:free",
  "nvidia/nemotron-3.5-content-safety:free",
  "nvidia/llama-nemotron-rerank-vl-1b-v2:free",
  "google/gemma-4-26b-a4b:free",
  "nvidia/llama-nemotron-embed-vl-1b-v2:free",
  "nvidia/nemotron-3-embed-1b:free",
  "google/gemma-4-31b:free",
  "inclusionai/ming-image-0.1-design:free",
  "dots-studio/dots3-note-preview:free",
  "nvidia/nemotron-3-nano-omni:free",
  "liquid/lfm2.5-embedding-350m:free"
]


const withTimeout = (promise, ms = 30000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Request timed out after ${ms / 1000}s`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const SYSTEM_PROMPT = `
You are the MediTrackr AI Health Log Analyst.
Your task is to review the user's daily health logs (vitals, blood pressure, heart rate, sleep hours, blood sugar, water intake, symptoms, and notes) and provide a concise, insightful health summary.

Guidelines:
1. Provide a clear, bulleted summary of their vitals and metrics.
2. Highlight any positive trends (e.g. good hydration, sufficient sleep).
3. Flag any notable readings or potential concerns (e.g. elevated blood pressure, recurring symptoms, low sleep).
4. Give 2-3 practical, healthy lifestyle wellness suggestions.
5. Tone: professional, encouraging, and empathetic.
6. MANDATORY DISCLAIMER: Always conclude with: "⚠️ *This AI summary is for informational tracking and wellness insights only, not a medical diagnosis. Please consult a licensed doctor or healthcare professional for medical concerns.*"
`;

const healthLogAI = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const todayUTC = new Date().toISOString().split("T")[0];

    const targetDate = req.body?.date || todayIST;

    // Fetch user and health profile for personalized context
    const [user, healthProfile] = await Promise.all([
      User.findById(userId).select("name email"),
      HealthProfile.findOne({ user: userId }).select("age bloodType height weight allergies"),
    ]);

    // Fetch ONLY today's health log
    const todayLog = await HealthLog.findOne({
      userId,
      date: req.body?.date ? targetDate : { $in: [todayIST, todayUTC] },
    });

    if (!todayLog) {
      return res.status(404).json({
        success: false,
        message: "No health log found for today. Please record your daily vitals and symptoms first.",
      });
    }

    const logSummaryData = {
      date: todayLog.date,
      bloodPressure: todayLog.bloodPressure || "Not recorded",
      heartRate: todayLog.heartRate ? `${todayLog.heartRate} bpm` : "Not recorded",
      sleepHours: todayLog.sleepHours ? `${todayLog.sleepHours} hrs` : "Not recorded",
      weight: todayLog.weight ? `${todayLog.weight} kg` : "Not recorded",
      waterIntake: todayLog.waterIntake ? `${todayLog.waterIntake} L` : "Not recorded",
      bloodSugar: todayLog.bloodSugar
        ? `${todayLog.bloodSugar} mg/dL (${todayLog.bloodSugarContext || "General"})`
        : "Not recorded",
      bodyTemperature: todayLog.bodyTemperature ? `${todayLog.bodyTemperature} °F` : "Not recorded",
      mood: todayLog.mood || "Not recorded",
      stressLevel: todayLog.stressLevel !== null && todayLog.stressLevel !== undefined ? todayLog.stressLevel : "Not recorded",
      energyLevel: todayLog.energyLevel || "Not recorded",
      painLevel: todayLog.painLevel !== null && todayLog.painLevel !== undefined ? todayLog.painLevel : "Not recorded",
      activityLevel: todayLog.activityLevel || "Not recorded",
      lifestyleTags: todayLog.lifestyleTags?.length ? todayLog.lifestyleTags.join(", ") : "None reported",
      symptoms: todayLog.symptoms?.length ? todayLog.symptoms.join(", ") : "None reported",
      notes: todayLog.notes || "None",
    };

    let userContext = "";
    if (user || healthProfile) {
      const profileDetails = [];
      if (user?.name) profileDetails.push(`Name: ${user.name}`);
      if (healthProfile?.age) profileDetails.push(`Age: ${healthProfile.age}`);
      if (healthProfile?.bloodType) profileDetails.push(`Blood Type: ${healthProfile.bloodType}`);
      if (healthProfile?.allergies) profileDetails.push(`Allergies: ${healthProfile.allergies}`);
      if (profileDetails.length) {
        userContext = `User Profile: ${profileDetails.join(", ")}\n`;
      }
    }

    const userPrompt = `${userContext}Here is today's logged health metrics (${todayLog.date}):\n${JSON.stringify(
      logSummaryData,
      null,
      2
    )}\n\nPlease provide a concise, actionable summary of today's health stats, noting any positive readings, potential flags, and practical wellness advice for today.`;

    let aiSummary = "";
    let providerUsed = "";

    // ==========================================================
    // STAGE 1: Try Gemini API Models
    // ==========================================================
    for (const gm of gemini_models) {
      try {
        const chat = MediTrackrAssistant.chats.create({
          model: gm,
          config: {
            systemInstruction: SYSTEM_PROMPT,
          },
        });

        const response = await withTimeout(
          chat.sendMessage({
            message: userPrompt,
          }),
          30000
        );

        if (response?.text && response.text.trim()) {
          aiSummary = response.text.trim();
          providerUsed = `Gemini (${gm})`;
          console.log(`[HealthLogAI] Responded successfully using Gemini model: ${gm}`);
          break;
        }
      } catch (geminiErr) {
        console.warn(`[HealthLogAI Gemini] Model "${gm}" failed: ${geminiErr.message}. Trying next model...`);
      }
    }

    // ==========================================================
    // STAGE 2: If Gemini Fails -> Fallback to OpenRouter Models
    // ==========================================================
    if (!aiSummary) {
      console.warn("[HealthLogAI] Gemini models failed. Falling back to OpenRouter models...");

      const openrouterMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ];

      for (const om of openrouter_models) {
        try {
          const completion = await withTimeout(
            openrouter.chat.completions.create({
              model: om,
              messages: openrouterMessages,
              temperature: 0.6,
              max_tokens: 1000,
            }),
            30000
          );

          const choiceText = completion.choices?.[0]?.message?.content;
          if (choiceText && choiceText.trim()) {
            aiSummary = choiceText.trim();
            providerUsed = `OpenRouter (${om})`;
            console.log(`[HealthLogAI] Responded successfully using OpenRouter model: ${om}`);
            break;
          }
        } catch (openrouterErr) {
          console.warn(`[HealthLogAI OpenRouter] Model "${om}" failed: ${openrouterErr.message}. Trying next model...`);
        }
      }
    }



    if (!aiSummary) {
      throw new Error("Unable to generate AI health summary at this time. All AI models failed.");
    }

    const updatedLog = await HealthLog.findByIdAndUpdate(
      todayLog._id,
      { $set: { "AIsummarization.summary": aiSummary, "AIsummarization.providerUsed": providerUsed } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      summary: aiSummary,
      provider: providerUsed,
      healthLog: updatedLog || todayLog,
    });
  } catch (err) {
    console.error("[HealthLogAI Error]:", err.message);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to generate AI health log summary.",
    });
  }
};

module.exports = healthLogAI;