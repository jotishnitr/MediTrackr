const copilotPrompt = `=== MODE C: Functional Utility & Copilot Actions ===
You act as the MediTrackr Copilot with direct understanding of the MediTrackr database models, workflows, and health tracking capabilities.

When the user asks you to extract, log, add, or organize health data (from uploaded documents, images, prescriptions, vitals slips, or text requests), identify the intent and respond using the exact structured formats specified below.

--------------------------------------------------
1. FUNCTION: SCAN & ADD MEDICINES (Prescription / Image / Doc / Text)
--------------------------------------------------
Trigger: User uploads prescription/medicine strip/box, or asks to add/schedule medicines.
Instruction: Extract all medicines found and provide the response in clean, valid JSON format.

JSON Schema:
\`\`\`json
{
  "action": "ADD_MEDICINES",
  "medicines": [
    {
      "name": "string (required, e.g., 'Amoxicillin')",
      "dosage": "number (required, e.g., 500)",
      "unit": "string (enum: ['mg', 'ml', 'g', 'mcg', 'tablet', 'pill', 'capsule', 'drop', 'puff', 'spray', 'patch', 'spoon', 'unit', 'IU'])",
      "type": "string (enum: ['Oral Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler', 'Drops', 'Cream / Ointment', 'Spray', 'Liquid (Oral)', 'Suspension', 'Powder', 'Patch', 'Suppository', 'Lotion', 'Gel'])",
      "time": "string (required, format 'HH:MM AM/PM' or 'HH:MM', e.g., '08:00 AM')",
      "instructions": "string (optional, e.g., 'Take after food with plenty of water')",
      "reminder": true
    }
  ]
}
\`\`\`

--------------------------------------------------
2. FUNCTION: LOG DAILY HEALTH VITALS & SYMPTOMS (Health Log)
--------------------------------------------------
Trigger: User provides vitals (BP reading, sleep hours, weight, symptoms, vitals report).
Instruction: Extract health log data matching the HealthLog model.

JSON Schema:
\`\`\`json
{
  "action": "LOG_HEALTH_VITALS",
  "data": {
    "date": "string (YYYY-MM-DD format, defaults to today)",
    "bloodPressure": "string (e.g., '120/80' or '0/0')",
    "sleepHours": "number (e.g., 7.5)",
    "weight": "number (in kg, e.g., 68.5)",
    "symptoms": ["string (e.g., 'Headache', 'Fever', 'Fatigue')"],
    "notes": "string (observations or notes)"
  }
}
\`\`\`

--------------------------------------------------
3. FUNCTION: SCHEDULE & REMINDER OPTIMIZER
--------------------------------------------------
Trigger: User asks to organize, rearrange, or optimize their daily medication timetable.
Instruction: Generate a structured schedule avoiding overlapping conflicting doses.

JSON Schema:
\`\`\`json
{
  "action": "OPTIMIZE_SCHEDULE",
  "schedule": {
    "morning": [
      { "name": "string", "dosage": "number", "unit": "string", "time": "08:00 AM", "withFood": true }
    ],
    "afternoon": [
      { "name": "string", "dosage": "number", "unit": "string", "time": "01:00 PM", "withFood": true }
    ],
    "evening": [
      { "name": "string", "dosage": "number", "unit": "string", "time": "07:00 PM", "withFood": false }
    ],
    "bedtime": [
      { "name": "string", "dosage": "number", "unit": "string", "time": "10:00 PM", "withFood": false }
    ]
  }
}
\`\`\`

=== GENERAL RULES ===
1. When generating JSON output for functional actions, ensure valid JSON syntax without extra conversational filler around the JSON block.
2. Always validate that units and types conform to the enums specified in the MediTrackr schemas.
3. Include clear instructions and dosage timing where applicable.
`;

const gemini = require('../geminiAssistant');
const openrouter = require('../openrouter');

const gemini_models = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash"
];

const openrouter_models = [
  // === TIER 1: MAX TOKENS (1,000,000 Context Window) & ADVANCED REASONING ===
  "google/gemini-2.5-flash",
  "google/gemini-flash-1.5",
  "nvidia/nemotron-3-ultra:free",             // 1,000,000 context, ultra-scale reasoning
  "nvidia/nemotron-3.5-lightning:free",       // 1,000,000 context, fast but high quality 3.5 gen
  "minimax/minimax-m3:free",                  // 1,048,576 context, highly-capable flagship MoE
  "thinking-machines/inkling:free",           // 1,048,576 context, advanced coding & logic
  "thinking-machines/inkling-small:free",     // 1,048,576 context, optimized fast variation

  // === TIER 2: HIGH TOKENS (512,000 Context Window) & LARGE MOE ===
  "dots-studio/dots3-note-preview:free",       // 512,000 context, 280B massive MoE architecture

  // === TIER 3: STANDARD TOKENS (196,000 - 262,144 Context Window) & PREMIUM MID-SIZE ===
  "google/gemma-4-31b:free",                  // 262,144 context, top-tier dense 31B reasoning model
  "google/gemma-4-26b-a4b:free",              // 262,144 context, native multimodal agentic model
  "inclusionai/ling-3.0-flash-fin:free",      // 262,144 context, 124B parameter expert financial model
  "inclusionai/ling-3.0-flash-sante:free",    // 262,144 context, multi-step healthcare reasoning MoE
  "cohere/north-mini-code:free",              // 256,000 context, dedicated software engineering engine
  "z-ai/glm5.2:free",                         // 256,000 context, elite conversational agent model
  "nvidia/nemotron-3-super:free",             // 262,144 context, versatile standard generation baseline
  "poolside/laguna-s2.1:free",                // 262,144 context, medium-tier web coding specialist
  "minimax/minimax-m2.7:free",                // 196,608 context, fast structured output variant

  // === TIER 4: LOW TOKENS & ULTRA-LIGHTWEIGHT MODELS ===
  "nvidia/nemotron-3-nano-omni:free",         // 256,000 context, but tiny low-complexity nano model
  "nvidia/nemotron-3.5-content-safety:free",  // 128,000 context, filtered guardrail model
  "poolside/laguna-xs2.1:free",               // 262,144 context, but extra-small lightweight logic
  "liquidai/lfm2.5-2.6b:free"                 // 65,536 context, smallest baseline parameter footprint
];

// Helper function to enforce a 15-second timeout per model request
const withTimeout = (promise, ms = 15000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Request timed out after ${ms / 1000}s`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const copilot = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { text, model } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Please provide text' });
    }

    let aiResponse = "";
    let rawResponse = null;
    let usedModel = "";
    let providerUsed = "";
    let lastError = null;

    // ==========================================================
    // STAGE 1: Try Native Google Gemini Models First (15s Timeout)
    // ==========================================================
    const candidateGeminiModels = model && gemini_models.includes(model)
      ? [model, ...gemini_models.filter(m => m !== model)]
      : gemini_models;

    for (const gm of candidateGeminiModels) {
      try {
        console.log(`[Copilot] Attempting Gemini model: ${gm}`);
        const chat = gemini.chats.create({
          model: gm,
          config: {
            systemInstruction: copilotPrompt
          }
        });

        const geminiRes = await withTimeout(
          chat.sendMessage({ message: text }),
          15000
        );

        if (geminiRes?.text) {
          aiResponse = geminiRes.text;
          rawResponse = geminiRes;
          usedModel = gm;
          providerUsed = "gemini";
          break; // Success with Gemini, exit loop
        }
      } catch (err) {
        console.warn(`[Copilot Gemini] Model "${gm}" failed (${err.message}). Trying next...`);
        lastError = err;
      }
    }

    // ==========================================================
    // STAGE 2: If Gemini Models Failed -> Fallback to OpenRouter (15s Timeout)
    // ==========================================================
    if (!aiResponse) {
      console.warn("[Copilot] All Gemini models failed or timed out. Routing to OpenRouter fallback models...");

      const candidateOpenRouterModels = model && openrouter_models.includes(model)
        ? [model, ...openrouter_models.filter(m => m !== model)]
        : openrouter_models;

      for (const om of candidateOpenRouterModels) {
        try {
          console.log(`[Copilot] Attempting OpenRouter model: ${om}`);
          const response = await withTimeout(
            openrouter.chat.completions.create({
              model: om,
              messages: [
                { role: "system", content: copilotPrompt },
                { role: "user", content: text }
              ]
            }),
            15000
          );

          const content = response.choices?.[0]?.message?.content;
          if (content) {
            aiResponse = content;
            rawResponse = response;
            usedModel = om;
            providerUsed = "openrouter";
            break; // Success with OpenRouter, exit loop
          }
        } catch (err) {
          console.warn(`[Copilot OpenRouter] Model "${om}" failed (${err.message}). Trying next...`);
          lastError = err;
        }
      }
    }

    // If both Gemini and OpenRouter models failed
    if (!aiResponse) {
      throw lastError || new Error("All AI models across Gemini and OpenRouter failed to respond within timeout.");
    }

    // Attempt to parse structured JSON if returned (Scenario B)
    let parsedData = null;
    try {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const rawJson = jsonMatch ? jsonMatch[1] : aiResponse;
      parsedData = JSON.parse(rawJson.trim());
    } catch {
      parsedData = null;
    }

    // Format response for Option 2 (Frontend Preview & Confirmation Flow)
    const action = parsedData?.action || null;
    const hasAction = Boolean(action);

    res.status(200).json({
      success: true,
      requiresConfirmation: hasAction,
      action,
      actionData: parsedData,
      reply: aiResponse,
      usedModel,
      providerUsed
    });
  } catch (error) {
    console.error("Copilot Fatal Error:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = copilot;





