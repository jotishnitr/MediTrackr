const copilotPrompt = `=== ROLE & STRICT ASSISTANT BOUNDARIES ===
You are the MediTrackr Copilot — a functional utility, app operations assistant, and health report generator strictly designed for the MediTrackr platform.

YOUR SCOPE IS STRICTLY LIMITED TO MEDITRACKR APP OPERATIONS, USER/FAMILY RECORD QUERIES, AND MEDITRACKR REPORTS.

==================================================
ℹ️ ABOUT MEDITRACKR & FOUNDER INFO
==================================================
- **Founder & Creator**: MediTrackr was founded and created by **Jotish Kumar** from India.
- **Official Contact & Support Email**: **jotish.dev.noreply@gmail.com**
- If the user asks who made/created/founded MediTrackr, developer info, origin, contact details, or support: state that MediTrackr was founded by **Jotish Kumar** from India, and provide the official contact email **jotish.dev.noreply@gmail.com**.

==================================================
⛔ MANDATORY BOUNDARIES & REDIRECTIONS (CRITICAL)
==================================================

1. GENERAL TOPICS (Non-App / Off-Topic):
- IF the user asks ANYTHING unrelated to MediTrackr operations/reports (e.g. coding, software engineering, full stack development tips, math, trivia, general science, essays, history, weather, jokes, other applications, or general chit-chat):
- YOU MUST REFUSE to answer the off-topic query.
- YOU MUST RESPOND with a polite boundary message directing the user to Arixel AI:
  "I am the **MediTrackr Copilot**, dedicated exclusively to MediTrackr app operations (adding medicines, logging vitals, optimizing schedules) and generating health reports.

  For general knowledge, programming & development advice, and all-purpose AI assistance, please visit **[Arixel AI](https://jotishnitr.github.io/arixelAI/)**."

2. GENERAL HEALTH, MEDICINE, HEALTH SECTOR, OR MEDICAL ADVICE:
- IF the user asks general health questions, medical condition details, disease symptoms, drug pharmacology/mechanisms, health sector trends, medical advice, or clinical consultations (which are NOT an operational instruction to add/schedule medicines or generate a MediTrackr report from their saved database):
- YOU MUST NOT provide medical consultations or diagnosis in Copilot mode.
- YOU MUST RESPOND with a polite message directing the user to Arixel AI and the Health Advisor mode:
  "I am the **MediTrackr Copilot**, specialized only in automated app operations (adding/scheduling medicines, logging daily vitals, organizing timetables) and generating your MediTrackr database summary reports.

  For in-depth health inquiries, medicine information, and healthcare sector discussions, please explore **[Arixel AI](https://jotishnitr.github.io/arixelAI/)**. You can also switch to the **Health Advisor** tab above for health discussions within MediTrackr. *(Please always consult a qualified doctor or healthcare professional for medical diagnoses and treatment).* "

==================================================
✅ ALLOWED COPILOT CAPABILITIES & TOOLS
==================================================

You have direct access to database tools for querying saved records for the user and their connected family members:
- Personal Tools: getMedicines, getHealthLog, getHealthProfile, getUserProfile
- Family Tools: getFamilyMembers, getFamilyMemberMedicines, getFamilyMemberHealthLog, getFamilyMemberHealthProfile, getFamilyMemberUserProfile

1. DATA QUERIES:
- When the user asks about their own scheduled medicines, vitals, health logs, allergies, or profile: Call the relevant personal tool (getMedicines, getHealthLog, getHealthProfile, getUserProfile) and answer clearly in conversational text.
- When the user asks about family members (e.g., "Who are my family members?", "What medicines is my dad / Sarah taking?", "Show my family's health profile, allergies, or BP / vitals logs"):
  - Call getFamilyMembers (and/or getFamilyMemberMedicines, getFamilyMemberHealthLog, getFamilyMemberHealthProfile, getFamilyMemberUserProfile) to retrieve connected family records.
  - Present the information with clear attribution to each family member (name and email), listing their current medicines, vital logs, or health profile details in a well-structured, friendly format.
  - If no family members are connected, politely inform the user and suggest linking them via the Profile section.

2. FUNCTIONAL COPILOT ACTIONS:
When the user asks you to extract, log, add, or organize health data (from uploaded documents, images, prescriptions, vitals slips, or text requests), identify the intent and respond using the exact structured formats specified below.

--------------------------------------------------
1. FUNCTION: SCAN & ADD MEDICINES (Self or Family Member)
--------------------------------------------------
Trigger: User uploads prescription/medicine strip/box, or asks to add/schedule medicines (for themselves OR for a connected family member).
Instruction:
- Extract all medicines found and provide the response in clean, valid JSON format.
- IF ADDING FOR A FAMILY MEMBER (e.g., "Add 500mg Amoxicillin for my dad / for sarah@gmail.com at 08:00"):
  - First, call getFamilyMembers (or getFamilyMemberUserProfile) to look up the family member's user ID (_id), name, and email.
  - Include "targetUserId", "targetEmail", and "targetMemberName" in the JSON action payload so the medicine is saved directly to that family member's account.
- TIME RULE: Always format the "time" field in strict 24-hour 'HH:MM' format (e.g., '08:00', '13:30', '20:00', '22:00'). NEVER include 'AM' or 'PM'.

JSON Schema (for Self):
\`\`\`json
{
  "action": "ADD_MEDICINES",
  "medicines": [
    {
      "name": "string (required, e.g., 'Amoxicillin')",
      "dosage": "number (required, e.g., 500)",
      "unit": "string (enum: ['mg', 'ml', 'g', 'mcg', 'tablet', 'pill', 'capsule', 'drop', 'puff', 'spray', 'patch', 'spoon', 'unit', 'IU'])",
      "type": "string (enum: ['Oral Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler', 'Drops', 'Cream / Ointment', 'Spray', 'Liquid (Oral)', 'Suspension', 'Powder', 'Patch', 'Suppository', 'Lotion', 'Gel'])",
      "time": "string (required, strict 24-hour format 'HH:MM', e.g., '08:00', '14:00', '20:00')",
      "instructions": "string (optional, e.g., 'Take after food with plenty of water')",
      "reminder": true
    }
  ]
}
\`\`\`

JSON Schema (for Family Member):
\`\`\`json
{
  "action": "ADD_MEDICINES",
  "targetUserId": "string (ObjectId of the family member)",
  "targetEmail": "string (email of the family member)",
  "targetMemberName": "string (name of the family member)",
  "medicines": [
    {
      "name": "string (required, e.g., 'Metformin')",
      "dosage": "number (required, e.g., 500)",
      "unit": "string (enum: ['mg', 'ml', 'g', 'mcg', 'tablet', 'pill', 'capsule', 'drop', 'puff', 'spray', 'patch', 'spoon', 'unit', 'IU'])",
      "type": "string (enum: ['Oral Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler', 'Drops', 'Cream / Ointment', 'Spray', 'Liquid (Oral)', 'Suspension', 'Powder', 'Patch', 'Suppository', 'Lotion', 'Gel'])",
      "time": "string (required, strict 24-hour format 'HH:MM', e.g., '08:00')",
      "instructions": "string (optional)",
      "reminder": true,
      "targetUserId": "string (ObjectId of the family member)"
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
Instruction: Generate a structured schedule avoiding overlapping conflicting doses with times in 24-hour 'HH:MM' format.

JSON Schema:
\`\`\`json
{
  "action": "OPTIMIZE_SCHEDULE",
  "schedule": {
    "morning": [
      { "name": "string", "dosage": "number", "unit": "string", "time": "08:00", "withFood": true }
    ],
    "afternoon": [
      { "name": "string", "dosage": "number", "unit": "string", "time": "13:00", "withFood": true }
    ],
    "evening": [
      { "name": "string", "dosage": "number", "unit": "string", "time": "19:00", "withFood": false }
    ],
    "bedtime": [
      { "name": "string", "dosage": "number", "unit": "string", "time": "22:00", "withFood": false }
    ]
  }
}
\`\`\`

--------------------------------------------------
4. FUNCTION: COMPREHENSIVE HEALTH & MEDICATION ANALYSIS REPORT (Self or Family)
--------------------------------------------------
Trigger: User asks to analyze health/medicines, review records, check vital trends, or generate a summary/detailed report.
Instruction:
- Call the relevant personal or family tools to retrieve all records from the database.
- Synthesize all retrieved records into a detailed, structured, professional Markdown report with clear headers, tables/bullet points, and actionable insights.
- Report Structure:
  # 📋 MediTrackr Health & Medication Summary Report
  - **Patient / Family Profile**: Full Name, Age, Blood Group, Height, Weight, Known Allergies, and Chronic Conditions.
  - **Active Medication Regimen**: All scheduled medicines, dosages, form/type, timing (24-hour format), and special instructions.
  - **Recent Vitals & Symptom Logs**: Summary of recorded Blood Pressure readings, Sleep Hours, Weight changes, and logged symptoms.
  - **Health Insights & Routine Analysis**: Observations on dosage schedules, blood pressure trends, sleep health, and lifestyle tips.
  - **Physician Discussion Points**: Key questions or notes to share with their healthcare provider during their next consultation.
  - End with the standard medical advisory disclaimer.

=== GENERAL RULES ===
1. When generating JSON output for functional actions (ADD_MEDICINES, LOG_HEALTH_VITALS, OPTIMIZE_SCHEDULE), ensure valid JSON syntax without extra conversational filler around the JSON block.
2. For informational queries about saved records, family members, or report generation, use tools to fetch real data and respond in structured, professional Markdown.
3. CRITICAL FOR MEDICINE TIME: All medication times MUST be in strict 24-hour 'HH:MM' format (e.g., '08:00', '13:30', '21:00'). NEVER output 'AM' or 'PM' in time fields.
`;

const gemini = require('../geminiAssistant');
const openrouter = require('../openrouter');
const tools = require('../toolsCalling');
const CopilotHistory = require('../models/CopilotHistory');
const { processUploadedFile } = require('../utils/fileProcessor');

// Helper to guarantee 24-hour format HH:MM
const normalizeTo24Hour = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return "08:00";
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) return timeStr.trim();
  let [_, hours, minutes, modifier] = match;
  let h = parseInt(hours, 10);
  if (modifier) {
    if (modifier.toUpperCase() === "PM" && h < 12) h += 12;
    if (modifier.toUpperCase() === "AM" && h === 12) h = 0;
  }
  return `${String(h).padStart(2, "0")}:${minutes}`;
};

// Tool definitions for Gemini
const geminiTools = [
  {
    functionDeclarations: [
      { name: "getMedicines", description: "Fetch all medicines and schedule for the current user", parameters: { type: "OBJECT", properties: {} } },
      { name: "getHealthLog", description: "Fetch latest health logs and vitals for the current user", parameters: { type: "OBJECT", properties: {} } },
      { name: "getHealthProfile", description: "Fetch current user health profile (allergies, blood group, medical conditions)", parameters: { type: "OBJECT", properties: {} } },
      { name: "getUserProfile", description: "Fetch basic user profile information for the current user", parameters: { type: "OBJECT", properties: {} } },
      { name: "getFamilyMembers", description: "Fetch all connected family members with their names, emails, and user IDs", parameters: { type: "OBJECT", properties: {} } },
      { name: "getFamilyMemberMedicines", description: "Fetch active medicines and schedules for all connected family members", parameters: { type: "OBJECT", properties: {} } },
      { name: "getFamilyMemberHealthLog", description: "Fetch recent health logs, blood pressure, sleep, and symptoms for connected family members", parameters: { type: "OBJECT", properties: {} } },
      { name: "getFamilyMemberHealthProfile", description: "Fetch health profiles, blood groups, allergies, and conditions for connected family members", parameters: { type: "OBJECT", properties: {} } },
      { name: "getFamilyMemberUserProfile", description: "Fetch user profiles and contact info for connected family members", parameters: { type: "OBJECT", properties: {} } }
    ]
  }
];

// Tool definitions for OpenRouter
const openrouterTools = [
  { type: "function", function: { name: "getMedicines", description: "Fetch all medicines and schedule for the current user", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "getHealthLog", description: "Fetch latest health logs and vitals for the current user", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "getHealthProfile", description: "Fetch current user health profile (allergies, blood group, medical conditions)", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "getUserProfile", description: "Fetch basic user profile information for the current user", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "getFamilyMembers", description: "Fetch all connected family members with their names, emails, and user IDs", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "getFamilyMemberMedicines", description: "Fetch active medicines and schedules for all connected family members", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "getFamilyMemberHealthLog", description: "Fetch recent health logs, blood pressure, sleep, and symptoms for connected family members", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "getFamilyMemberHealthProfile", description: "Fetch health profiles, blood groups, allergies, and conditions for connected family members", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "getFamilyMemberUserProfile", description: "Fetch user profiles and contact info for connected family members", parameters: { type: "object", properties: {} } } }
];

const executeTool = async (name, userId) => {
  if (typeof tools[name] === "function") {
    try {
      return await tools[name]({ userId });
    } catch (err) {
      console.error(`[Tool Execution Error] ${name}:`, err);
      return { error: err.message };
    }
  }
  return { error: `Tool ${name} not found` };
};


const gemini_models = [
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-8b",

];

const openrouter_models = [
  "nvidia/nemotron-3.5-lightning:free",
  "minimax/minimax-m3:free",
  "thinking-machines/inkling:free",
  "thinking-machines/inkling-small:free",
  "dots-studio/dots3-note-preview:free",
  "google/gemma-4-31b:free",
  "google/gemma-4-26b-a4b:free",
  "inclusionai/ling-3.0-flash-fin:free",
  "inclusionai/ling-3.0-flash-sante:free",
  "cohere/north-mini-code:free",
  "z-ai/glm5.2:free",
  "nvidia/nemotron-3-super:free",
  "poolside/laguna-s2.1:free",
  "minimax/minimax-m2.7:free",
  "nvidia/nemotron-3-nano-omni:free",
  "nvidia/nemotron-3.5-content-safety:free",
  "poolside/laguna-xs2.1:free",
  "liquidai/lfm2.5-2.6b:free"
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
    const { text, file, model } = req.body;

    if (!text && !file) {
      return res.status(400).json({ message: 'Please provide text or attach an image/document' });
    }

    let aiResponse = "";
    let usedModel = "";
    let providerUsed = "";
    let lastError = null;

    // Process file if present
    let processedFile = null;
    if (file) {
      processedFile = await processUploadedFile(file);
    }

    // Build message parts for Gemini
    const geminiMessageParts = [];
    if (processedFile?.geminiPart) {
      geminiMessageParts.push(processedFile.geminiPart);
    }
    if (text) {
      geminiMessageParts.push({ text: text });
    } else if (file) {
      geminiMessageParts.push({ text: "Please analyze this attached document/image and extract any relevant medicines, health vitals, or schedule details according to your functions." });
    }
    const geminiInput = file ? geminiMessageParts : text;

    // Build user content for OpenRouter
    let openrouterUserContent;
    if (processedFile?.isImage) {
      openrouterUserContent = [
        {
          type: "text",
          text: text || "Please analyze this image and extract any relevant medicines, health vitals, or schedule details according to your functions.",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${processedFile.mimeType};base64,${file.base64}`,
          },
        },
      ];
    } else if (processedFile?.extractedText) {
      openrouterUserContent = `${text ? text + "\n\n" : ""}[Attached Document Content]:\n${processedFile.extractedText}`;
    } else {
      openrouterUserContent = text || "Please analyze the uploaded document and extract any relevant medicines, health vitals, or schedule details.";
    }

    // ==========================================================
    // STAGE 1: Try Native Google Gemini Models First (with Tools)
    // ==========================================================
    const candidateGeminiModels = model && gemini_models.includes(model)
      ? [model, ...gemini_models.filter(m => m !== model)]
      : gemini_models;

    for (const gm of candidateGeminiModels) {
      try {
        const chat = gemini.chats.create({
          model: gm,
          config: {
            systemInstruction: copilotPrompt,
            tools: geminiTools
          }
        });

        const geminiRes = await withTimeout(chat.sendMessage({ message: geminiInput }), 15000);

        if (geminiRes?.functionCalls?.length > 0) {
          // Resolve ALL parallel tool calls
          const functionResponses = await Promise.all(
            geminiRes.functionCalls.map(async (call) => {
              const toolResult = await executeTool(call.name, userId);
              return {
                functionResponse: {
                  name: call.name,
                  response: { output: toolResult }
                }
              };
            })
          );

          let currentRes = await withTimeout(
            chat.sendMessage({
              message: functionResponses
            }),
            15000
          );

          // Handle multi-turn follow-up tool calls if model requests additional data
          while (currentRes?.functionCalls?.length > 0) {
            const nextResponses = await Promise.all(
              currentRes.functionCalls.map(async (call) => {
                const toolResult = await executeTool(call.name, userId);
                return {
                  functionResponse: {
                    name: call.name,
                    response: { output: toolResult }
                  }
                };
              })
            );
            currentRes = await withTimeout(
              chat.sendMessage({
                message: nextResponses
              }),
              15000
            );
          }

          if (currentRes?.text) {
            aiResponse = currentRes.text;
            usedModel = gm;
            providerUsed = "gemini";
            break;
          }
        } else if (geminiRes?.text) {
          aiResponse = geminiRes.text;
          usedModel = gm;
          providerUsed = "gemini";
          break;
        }
      } catch (err) {
        console.warn(`[Copilot Gemini] Model "${gm}" failed (${err.message}). Trying next...`);
        lastError = err;
      }
    }

    // ==========================================================
    // STAGE 2: If Gemini Models Failed -> Fallback to OpenRouter
    // ==========================================================
    if (!aiResponse) {
      console.warn("[Copilot] All Gemini models failed or timed out. Routing to OpenRouter fallback models...");

      const candidateOpenRouterModels = model && openrouter_models.includes(model)
        ? [model, ...openrouter_models.filter(m => m !== model)]
        : openrouter_models;

      for (const om of candidateOpenRouterModels) {
        try {
          const response = await withTimeout(
            openrouter.chat.completions.create({
              model: om,
              max_tokens: 4096,
              messages: [
                { role: "system", content: copilotPrompt },
                { role: "user", content: openrouterUserContent }
              ],
              tools: openrouterTools
            }),
            15000
          );

          const msg = response.choices?.[0]?.message;
          if (msg?.tool_calls?.length > 0) {
            const toolMessages = await Promise.all(
              msg.tool_calls.map(async (toolCall) => {
                const toolResult = await executeTool(toolCall.function.name, userId);
                return {
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(toolResult)
                };
              })
            );

            const followUpRes = await withTimeout(
              openrouter.chat.completions.create({
                model: om,
                max_tokens: 4096,
                messages: [
                  { role: "system", content: copilotPrompt },
                  { role: "user", content: openrouterUserContent },
                  msg,
                  ...toolMessages
                ]
              }),
              15000
            );
            const followUpText = followUpRes.choices?.[0]?.message?.content;
            if (followUpText) {
              aiResponse = followUpText;
              usedModel = om;
              providerUsed = "openrouter";
              break;
            }
          } else if (msg?.content) {
            let rawContent = msg.content;
            // Check if model printed raw tool calls instead of native tool_calls
            if (rawContent.includes("<tool_call>") || rawContent.includes("<function=")) {
              const funcMatches = [...rawContent.matchAll(/<function=([a-zA-Z0-9_]+)>/g)].map(m => m[1]);
              if (funcMatches.length > 0) {
                const toolOutputs = {};
                for (const fn of funcMatches) {
                  toolOutputs[fn] = await executeTool(fn, userId);
                }
                const followUpRes = await withTimeout(
                  openrouter.chat.completions.create({
                    model: om,
                    max_tokens: 4096,
                    messages: [
                      { role: "system", content: copilotPrompt },
                      { role: "user", content: openrouterUserContent },
                      msg,
                      {
                        role: "user",
                        content: `Here are the results of the requested tool calls:\n${JSON.stringify(toolOutputs, null, 2)}\nPlease now provide the complete, detailed final response based on this data.`
                      }
                    ]
                  }),
                  15000
                );
                const followUpText = followUpRes.choices?.[0]?.message?.content;
                if (followUpText && !followUpText.includes("<tool_call>")) {
                  aiResponse = followUpText;
                  usedModel = om;
                  providerUsed = "openrouter";
                  break;
                }
              }
            }
            aiResponse = rawContent;
            usedModel = om;
            providerUsed = "openrouter";
            break;
          }
        } catch (err) {
          console.warn(`[Copilot OpenRouter] Model "${om}" failed (${err.message}). Trying next...`);
          lastError = err;
        }
      }
    }

    if (!aiResponse) {
      throw lastError || new Error("All AI models across Gemini and OpenRouter failed to respond within timeout.");
    }

    // Attempt to parse structured JSON if returned
    let parsedData = null;
    try {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const rawJson = jsonMatch ? jsonMatch[1] : aiResponse;
      parsedData = JSON.parse(rawJson.trim());
    } catch {
      parsedData = null;
    }

    // Normalize medicine times to 24-hour format
    if (parsedData?.action === "ADD_MEDICINES" && Array.isArray(parsedData.medicines)) {
      parsedData.medicines = parsedData.medicines.map((med) => ({
        ...med,
        time: normalizeTo24Hour(med.time),
      }));
    } else if (parsedData?.action === "OPTIMIZE_SCHEDULE" && parsedData?.schedule) {
      for (const slot of Object.keys(parsedData.schedule)) {
        if (Array.isArray(parsedData.schedule[slot])) {
          parsedData.schedule[slot] = parsedData.schedule[slot].map((med) => ({
            ...med,
            time: normalizeTo24Hour(med.time),
          }));
        }
      }
    }

    const action = parsedData?.action || null;
    const hasAction = Boolean(action);

    // Save interaction to CopilotHistory
    if (userId) {
      try {
        let copilotDoc = await CopilotHistory.findOne({ userId });
        if (!copilotDoc) {
          copilotDoc = new CopilotHistory({ userId, messages: [] });
        }
        copilotDoc.messages.push({
          role: "user",
          text: text || (file ? "[Uploaded Image / Document]" : ""),
          timeStamp: new Date(),
        });
        copilotDoc.messages.push({
          role: "model",
          text: aiResponse,
          action,
          actionData: parsedData,
          timeStamp: new Date(),
        });
        await copilotDoc.save();
      } catch (historyErr) {
        console.warn("[CopilotHistory] Failed to save history:", historyErr.message);
      }
    }

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





