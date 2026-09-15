import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FeedbackForm from "./feedbackform";
import { downloadReportAsPDF } from "./utils/pdfGenerator";
import { useSpeechToText } from "./utils/useSpeechToText";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import { translateToEnglish, translateFromEnglish } from "./utils/translator";
import "./aiAssistant.css";

export default function AiAssistance({
  profileDetails,
  requireAuth,
  setCurrentPage,
  setIsAuthenticated,
}) {
  const { t, i18n } = useTranslation();
  // Mode toggle: "advisor" (Health Advisor - text Q&A only) or "copilot" (MediTrackr Copilot - functional actions)
  const [activeMode, setActiveMode] = useState("advisor");

  // Health Advisor messages
  const [advisorMessages, setAdvisorMessages] = useState([]);
  // Copilot messages
  const [copilotMessages, setCopilotMessages] = useState([
    {
      sender: "assistant",
      text: `👋 Hi ${profileDetails?.name || "there"}! I am your **MediTrackr Copilot**.\n\nI can directly extract, structure, and schedule your health actions. Try saying:\n- *"Add 500mg Amoxicillin capsule at 08:00 after food"*\n- *"Log my vitals: BP 120/80, 7.5 hours sleep, and mild headache"*\n- *"Optimize my medication timetable for morning and evening"*`,
      time: getCurrentTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Track action execution states by message index: { [index]: { status: 'executed' | 'discarded', loading: boolean } }
  const [actionStates, setActionStates] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyMessage = (text, index) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex((prev) => (prev === index ? null : prev));
    }, 2000);
  };

  const {
    isListening,
    toggleListening,
    currentSpeechLang,
  } = useSpeechToText({
    onTranscript: (transcript) => {
      setInput((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
    },
  });

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Helper to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });
  };

  // Helper to format message timestamp
  function getCurrentTime(dateInput) {
    const now = dateInput ? new Date(dateInput) : new Date();

    const dateOptions = { month: "short", day: "numeric", year: "numeric" };
    const dateStr = now.toLocaleDateString("en-US", dateOptions);

    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // convert 0 to 12
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;

    return `${dateStr}, ${hours}:${minutesStr} ${ampm}`;
  }

  // Helper to ensure 24-hour HH:MM format
  function normalizeTo24Hour(timeStr) {
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
  }

  // Load chat history for Health Advisor from backend
  const loadAdvisorHistory = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/getAssistantHistory`,
        {
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          const formatted = data.messages.map((m) => ({
            sender: m.role === "user" ? "user" : "assistant",
            text: m.text,
            time: getCurrentTime(m.timeStamp),
          }));
          setAdvisorMessages(formatted);
        } else {
          setAdvisorMessages([
            {
              sender: "assistant",
              text: `Hello ${
                profileDetails?.name || "there"
              }! I am your **Health Advisor**. How can I assist with your health questions or document reviews today?`,
              time: getCurrentTime(),
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  // Load chat history for Copilot from backend
  const loadCopilotHistory = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/getCopilotHistory`,
        {
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          const formatted = data.messages.map((m) => ({
            sender: m.role === "user" ? "user" : "assistant",
            text: m.text,
            action: m.action || null,
            actionData: m.actionData || null,
            requiresConfirmation: Boolean(m.action),
            time: getCurrentTime(m.timeStamp),
          }));
          setCopilotMessages(formatted);
        } else {
          setCopilotMessages([
            {
              sender: "assistant",
              text: `👋 Hi ${
                profileDetails?.name || "there"
              }! I am your **MediTrackr Copilot**.\n\nI can directly extract, structure, and schedule your health actions. Try saying:\n- *"Add 500mg Amoxicillin capsule at 08:00 after food"*\n- *"Log my vitals: BP 120/80, 7.5 hours sleep, and mild headache"*\n- *"Optimize my medication timetable for morning and evening"*`,
              time: getCurrentTime(),
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to load Copilot history:", err);
    }
  };

  const handleDeleteHistory = async () => {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    if (activeMode === "advisor") {
      if (!window.confirm("Are you sure you want to clear Health Advisor chat history?")) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/getAssistantHistory`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
        if (response.ok) {
          setAdvisorMessages([
            {
              sender: "assistant",
              text: `Hello ${
                profileDetails?.name || "there"
              }! How can I help you today?`,
              time: getCurrentTime(),
            },
          ]);
        }
      } catch (err) {
        console.error("Error clearing chat history:", err);
      }
    } else {
      // Clear Copilot session
      if (!window.confirm("Are you sure you want to clear Copilot chat history?")) return;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/getCopilotHistory`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
        if (response.ok) {
          setCopilotMessages([
            {
              sender: "assistant",
              text: `👋 Copilot chat cleared! Tell me what medicine to add or health data to log.`,
              time: getCurrentTime(),
            },
          ]);
          setActionStates({});
        }
      } catch (err) {
        console.error("Error clearing Copilot chat history:", err);
      }
    }
  };

  useEffect(() => {
    loadAdvisorHistory();
    loadCopilotHistory();
  }, []);

  // Scroll to bottom on new messages
  const activeMessages = activeMode === "advisor" ? advisorMessages : copilotMessages;
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, loading]);

  // Send message handler
  const sendMessage = async (textToSend = input) => {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    const trimmedText = textToSend.trim();
    if (!trimmedText && !selectedImage) return;

    const currentMsgText = trimmedText;
    const time = getCurrentTime();
    const isImg = selectedImage?.type?.startsWith("image/") || (selectedImage?.name && /\.(png|jpe?g|webp|gif|bmp|heic|svg)$/i.test(selectedImage.name));

    const userMsg = {
      sender: "user",
      text: currentMsgText,
      time: time,
      image: isImg ? imagePreview : null,
      fileInfo: selectedImage
        ? {
            name: selectedImage.name,
            size: selectedImage.size,
            type: selectedImage.type,
            isImage: isImg,
          }
        : null,
    };

    if (activeMode === "advisor") {
      setAdvisorMessages((prev) => [...prev, userMsg]);
    } else {
      setCopilotMessages((prev) => [...prev, userMsg]);
    }

    setInput("");

    let fileData = null;
    if (selectedImage) {
      const base64 = await fileToBase64(selectedImage);
      fileData = {
        base64,
        mimeType: selectedImage.type || (selectedImage.name.endsWith(".pdf") ? "application/pdf" : selectedImage.name.endsWith(".docx") ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/octet-stream"),
        name: selectedImage.name,
      };
    }
    setSelectedImage(null);
    setImagePreview("");
    setLoading(true);

    const currentLangKey = (i18n?.language || "en").toLowerCase().slice(0, 2);

    try {
      // Step 1: Translate user prompt to English if not already in English
      let textForLlm = currentMsgText;
      if (currentLangKey !== "en" && currentMsgText) {
        try {
          const translatedPrompt = await translateToEnglish(currentMsgText, currentLangKey);
          if (translatedPrompt) {
            textForLlm = translatedPrompt;
          }
        } catch (tErr) {
          console.warn("Failed to translate user input to English:", tErr);
        }
      }

      if (activeMode === "advisor") {
        // Mode 1: Health Advisor (Text / Medical Q&A)
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/assistant`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: textForLlm, file: fileData }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          let finalReply = data.reply;

          // Step 2: Translate English response back into user's language if needed
          if (currentLangKey !== "en" && data.reply) {
            try {
              const translatedReply = await translateFromEnglish(data.reply, currentLangKey);
              if (translatedReply) {
                finalReply = translatedReply;
              }
            } catch (tErr) {
              console.warn("Failed to translate assistant reply to target language:", tErr);
            }
          }

          setAdvisorMessages((prev) => {
            const updated = [...prev];
            if (updated.length > 0 && data.userTime) {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                time: getCurrentTime(data.userTime),
              };
            }
            return [
              ...updated,
              {
                sender: "assistant",
                text: finalReply,
                time: getCurrentTime(data.modelTime),
              },
            ];
          });
        } else {
          throw new Error("Advisor request failed");
        }
      } else {
        // Mode 2: MediTrackr Copilot (Functional Utility & Actions)
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/copilot`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: textForLlm,
              file: fileData,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          let finalReply = data.reply;

          // Step 2: Translate English response back into user's language if needed
          if (currentLangKey !== "en" && data.reply) {
            try {
              const translatedReply = await translateFromEnglish(data.reply, currentLangKey);
              if (translatedReply) {
                finalReply = translatedReply;
              }
            } catch (tErr) {
              console.warn("Failed to translate copilot reply to target language:", tErr);
            }
          }

          setCopilotMessages((prev) => [
            ...prev,
            {
              sender: "assistant",
              text: finalReply,
              action: data.action,
              actionData: data.actionData,
              requiresConfirmation: data.requiresConfirmation,
              usedModel: data.usedModel,
              time: getCurrentTime(),
            },
          ]);
        } else {
          throw new Error("Copilot request failed");
        }
      }
    } catch (err) {
      console.error(err);
      const errorMsg = {
        sender: "assistant",
        text: "I encountered an issue processing your request. Please try again.",
        time: getCurrentTime(),
      };
      if (activeMode === "advisor") {
        setAdvisorMessages((prev) => [...prev, errorMsg]);
      } else {
        setCopilotMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Confirm Action Handler (Option 2 flow: User clicks Confirm on Preview Card)
  const handleConfirmAction = async (msgIndex, action, actionData) => {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    setActionStates((prev) => ({
      ...prev,
      [msgIndex]: { loading: true },
    }));

    try {
      if (action === "ADD_MEDICINES" && actionData?.medicines) {
        for (const med of actionData.medicines) {
          const targetUserId = med.targetUserId || actionData?.targetUserId || actionData?.familyMemberId;
          const targetEmail = med.targetEmail || actionData?.targetEmail;
          await fetch(`${import.meta.env.VITE_API_URL}/addMedicine`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: med.name,
              dosage: med.dosage,
              unit: med.unit,
              count: med.count !== undefined ? Number(med.count) || 0 : 0,
              type: med.type,
              time: normalizeTo24Hour(med.time),
              instructions: med.instructions || "",
              reminder: med.reminder ?? true,
              ...(targetUserId ? { targetUserId } : {}),
              ...(targetEmail ? { targetEmail } : {}),
            }),
          });
        }
      } else if (action === "LOG_HEALTH_VITALS" && actionData?.data) {
        // Save health log via healthLog controller
        const v = actionData.data;
        await fetch(`${import.meta.env.VITE_API_URL}/healthLog`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: v.date || new Date().toISOString().split("T")[0],
            bloodPressure: v.bloodPressure || "0/0",
            sleepHours: v.sleepHours || 0,
            weight: v.weight || 0,
            symptoms: v.symptoms || [],
            notes: v.notes || "",
          }),
        });
      }

      setActionStates((prev) => ({
        ...prev,
        [msgIndex]: { status: "executed", loading: false },
      }));
    } catch (err) {
      console.error("Action execution failed:", err);
      alert("Failed to complete action. Please check your network and try again.");
      setActionStates((prev) => ({
        ...prev,
        [msgIndex]: { status: "error", loading: false },
      }));
    }
  };

  const handleDiscardAction = (msgIndex) => {
    setActionStates((prev) => ({
      ...prev,
      [msgIndex]: { status: "discarded", loading: false },
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Image Upload Selection Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImagePreview = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Quick Suggestion Chips based on mode
  const advisorChips = [
    { text: "Drug side effects", action: "What are the common side effects of Lisinopril?" },
    { text: "Symptom advice", action: "What should I do if I have a mild headache and fatigue?" },
    { text: "Blood pressure range", action: "What is a healthy blood pressure range for an adult?" },
    { text: "Missed dose guide", action: "What should I do if I missed my morning medication?" },
  ];

  const copilotChips = [
    { text: "📊 Generate Health Report", action: "Analyze my health logs, active medicines, and profile, and generate a comprehensive health report for me." },
    { text: "Add 500mg Amoxicillin", action: "Add 500mg Amoxicillin Oral Tablet at 08:00 with food" },
    { text: "Log BP & Vitals", action: "Log my vitals: Blood Pressure 120/80, 7.5 hours sleep, and weight 70kg" },
    { text: "Optimize Schedule", action: "Optimize my daily medication schedule for morning, afternoon, and bedtime" },
  ];

  const currentChips = activeMode === "advisor" ? advisorChips : copilotChips;

  // Helper to download report as a professional PDF document
  const handleDownloadReport = async (reportText) => {
    try {
      await downloadReportAsPDF(reportText, profileDetails?.name || "Patient");
    } catch (err) {
      console.error("PDF Report download failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // Render Confirmation Preview Card for Copilot Actions (Option 2 Flow)
  const renderActionPreviewCard = (msg, msgIndex) => {
    if (!msg.actionData || !msg.action) return null;

    const actionState = actionStates[msgIndex];
    if (actionState?.status === "discarded") {
      return (
        <div className="action-discarded-msg">
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
          Action discarded
        </div>
      );
    }

    if (actionState?.status === "executed") {
      return (
        <div className="action-executed-msg">
          <span className="material-symbols-outlined">check_circle</span>
          {msg.action === "ADD_MEDICINES" ? "Medicines added to your schedule!" : "Health Log saved successfully!"}
        </div>
      );
    }

    return (
      <div className="action-confirmation-card">
        <div className="action-card-header">
          <div className="action-card-title">
            <span className="material-symbols-outlined">
              {msg.action === "ADD_MEDICINES" ? "medication" : "monitor_heart"}
            </span>
            {msg.action === "ADD_MEDICINES" ? "Preview Medicines" : "Preview Health Log"}
            {msg.action === "ADD_MEDICINES" && (msg.actionData?.targetMemberName || msg.actionData?.targetEmail) && (
              <span style={{ fontSize: "0.8rem", color: "#67e8f9", marginLeft: "8px", fontWeight: "normal" }}>
                (For: {msg.actionData.targetMemberName || msg.actionData.targetEmail})
              </span>
            )}
          </div>
          <span className="action-card-badge">Requires Confirmation</span>
        </div>

        <div className="action-card-body">
          {/* Case 1: ADD_MEDICINES */}
          {msg.action === "ADD_MEDICINES" && msg.actionData?.medicines && (
            msg.actionData.medicines.map((med, idx) => (
              <div key={idx} className="action-item-card">
                <div className="action-item-main">
                  <span>{med.name}</span>
                  <span style={{ color: "#4edea3" }}>{med.time}</span>
                </div>
                <div className="action-item-tags">
                  <span className="action-tag">{med.dosage} {med.unit}</span>
                  <span className="action-tag">{med.type}</span>
                  {med.reminder && <span className="action-tag">🔔 Reminder ON</span>}
                  {(med.targetMemberName || msg.actionData?.targetMemberName) && (
                    <span className="action-tag" style={{ background: "rgba(103, 232, 249, 0.15)", color: "#67e8f9" }}>
                      👤 {med.targetMemberName || msg.actionData.targetMemberName}
                    </span>
                  )}
                </div>
                {med.instructions && (
                  <div className="action-item-notes">{med.instructions}</div>
                )}
              </div>
            ))
          )}

          {/* Case 2: LOG_HEALTH_VITALS */}
          {msg.action === "LOG_HEALTH_VITALS" && msg.actionData?.data && (
            <div className="action-item-card">
              <div className="action-item-main">
                <span>Date: {msg.actionData.data.date || "Today"}</span>
                <span style={{ color: "#4edea3" }}>BP: {msg.actionData.data.bloodPressure || "N/A"}</span>
              </div>
              <div className="action-item-tags">
                {msg.actionData.data.sleepHours && (
                  <span className="action-tag">💤 {msg.actionData.data.sleepHours} hrs sleep</span>
                )}
                {msg.actionData.data.weight && (
                  <span className="action-tag">⚖️ {msg.actionData.data.weight} kg</span>
                )}
                {msg.actionData.data.symptoms?.map((s, i) => (
                  <span key={i} className="action-tag">⚠️ {s}</span>
                ))}
              </div>
              {msg.actionData.data.notes && (
                <div className="action-item-notes">{msg.actionData.data.notes}</div>
              )}
            </div>
          )}
        </div>

        <div className="action-card-buttons">
          <button
            className="action-btn-discard"
            onClick={() => handleDiscardAction(msgIndex)}
            disabled={actionState?.loading}
          >
            Discard
          </button>
          <button
            className="action-btn-confirm"
            onClick={() => handleConfirmAction(msgIndex, msg.action, msg.actionData)}
            disabled={actionState?.loading}
          >
            {actionState?.loading ? (
              <span>Saving...</span>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span>
                Confirm & Add
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Render message content
  const renderMessageContent = (msg, index) => {
    // If it's a raw JSON reply from copilot, display clean text or action preview
    const isJsonBlock = msg.text.trim().startsWith("```json") || msg.text.trim().startsWith("{");
    const isReportMessage =
      msg.sender === "assistant" &&
      !msg.requiresConfirmation &&
      (msg.text.includes("Report") ||
        msg.text.includes("Patient Profile") ||
        msg.text.includes("Medication Regimen") ||
        msg.text.includes("Health & Medication") ||
        msg.text.includes("## Patient"));

    return (
      <>
        {!isJsonBlock && (
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-markdown-link"
                  />
                ),
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
        )}
        {msg.image && (
          <img
            src={msg.image}
            alt="User upload"
            className="message-bubble-attachment"
          />
        )}
        {msg.fileInfo && !msg.fileInfo.isImage && (
          <div className="message-doc-attachment">
            <span className="material-symbols-outlined message-doc-icon">
              {msg.fileInfo.name.endsWith(".pdf")
                ? "picture_as_pdf"
                : msg.fileInfo.name.endsWith(".doc") || msg.fileInfo.name.endsWith(".docx")
                ? "description"
                : msg.fileInfo.name.endsWith(".csv")
                ? "table_view"
                : "text_snippet"}
            </span>
            <div className="message-doc-meta">
              <span className="message-doc-name">{msg.fileInfo.name}</span>
              <span className="message-doc-size">{(msg.fileInfo.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        )}

        {/* Download Action Bar for Health & Medication Reports */}
        {isReportMessage && (
          <div className="report-action-bar">
            <button
              className="download-report-btn"
              onClick={() => handleDownloadReport(msg.text)}
              title="Download this report as a PDF document"
            >
              <span className="material-symbols-outlined">picture_as_pdf</span>
              <span>Download PDF Report</span>
            </button>
            <button
              className="copy-report-btn"
              onClick={() => {
                navigator.clipboard.writeText(msg.text);
                alert("Report copied to clipboard!");
              }}
              title="Copy report text to clipboard"
            >
              <span className="material-symbols-outlined">content_copy</span>
              <span>Copy</span>
            </button>
          </div>
        )}

        {/* Render Option 2 Confirmation Card for Copilot */}
        {msg.requiresConfirmation && renderActionPreviewCard(msg, index)}
      </>
    );
  };

  return (
    <section className="ai-assistant">
      {/* Header bar */}
      <div className="ai-header">
        {/* Left: Avatar and Title */}
        <div className="ai-header-left">
          <div className="ai-avatar-container">
            <div className="ai-avatar">
              <img src="icon.png" alt="MediTrackr Icon" />
            </div>
            <div className="ai-status-indicator"></div>
          </div>
          <div className="ai-header-info">
            <div className="ai-header-title">
              {activeMode === "advisor" ? "Health Advisor" : "MediTrackr Copilot"}
            </div>
            <div className="ai-header-status">
              {activeMode === "advisor"
                ? "Medical Q&A & Document Analysis"
                : "Functional Utility & Smart Actions"}
            </div>
          </div>
        </div>

        {/* Center: Mode Toggle Switch */}
        <div className="ai-mode-toggle">
          <button
            className={`ai-mode-tab ${activeMode === "advisor" ? "active" : ""}`}
            onClick={() => setActiveMode("advisor")}
            type="button"
          >
            <span className="material-symbols-outlined">health_and_safety</span>
            <span>Health Advisor</span>
          </button>
          <button
            className={`ai-mode-tab ${activeMode === "copilot" ? "active" : ""}`}
            onClick={() => setActiveMode("copilot")}
            type="button"
          >
            <span className="material-symbols-outlined">smart_toy</span>
            <span>MediTrackr Copilot</span>
          </button>
        </div>

        {/* Top-Right: Language Selector, Clear Chat, and Feedback */}
        <div className="ai-header-right">
          <LanguageSelector variant="header" />
          <button
            className="delete-history-btn"
            onClick={handleDeleteHistory}
            title="Clear chat history"
          >
            <span className="material-symbols-outlined">delete</span>
            <span className="btn-text">Clear</span>
          </button>
          <button
            className="feedback-btn"
            onClick={() => setShowFeedback(true)}
            title="Give feedback"
          >
            <span className="material-symbols-outlined">rate_review</span>
            <span className="btn-text">Feedback</span>
          </button>
        </div>
      </div>

      {/* Main chat window */}
      <div className="ai-chat-area">
        <div className="ai-messages-list">
          {activeMessages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.sender}`}>
              <div className="message-header">
                <div className="message-header-left">
                  <span
                    className={
                      msg.sender === "user"
                        ? "sender-label-user"
                        : "sender-label-assistant"
                    }
                  >
                    {msg.sender === "user"
                      ? "YOU"
                      : activeMode === "advisor"
                      ? "HEALTH ADVISOR"
                      : "COPILOT"}
                  </span>
                  <span className="time-stamp">{msg.time}</span>
                </div>
                {msg.sender === "assistant" && msg.text && (
                  <button
                    type="button"
                    className={`msg-copy-btn ${copiedIndex === index ? "copied" : ""}`}
                    onClick={() => handleCopyMessage(msg.text, index)}
                    title="Copy response to clipboard"
                  >
                    <span className="material-symbols-outlined msg-copy-icon">
                      {copiedIndex === index ? "check" : "content_copy"}
                    </span>
                    <span className="msg-copy-text">
                      {copiedIndex === index ? "Copied" : "Copy"}
                    </span>
                  </button>
                )}
              </div>
              <div className="message-bubble">{renderMessageContent(msg, index)}</div>
            </div>
          ))}

          {loading && (
            <div className="message-wrapper assistant">
              <div className="message-header">
                <span className="sender-label-assistant">
                  {activeMode === "advisor" ? "HEALTH ADVISOR" : "COPILOT"}
                </span>
                <span className="time-stamp">{getCurrentTime()}</span>
              </div>
              <div className="typing-indicator-wrapper">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <div className="ai-free-tier-notice">
                  <span className="material-symbols-outlined notice-icon">hourglass_top</span>
                  <span>Please wait for response... Responses may take longer on the free version of <strong>MediTrackr</strong>. Paid version with instant high-speed infrastructure will be available soon!</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input panel */}
        <div className="ai-input-wrapper">
          {/* Quick suggestions */}
          <div className="chips-container">
            {currentChips.map((chip, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => sendMessage(chip.action)}
              >
                <span>{chip.text}</span>
              </button>
            ))}
          </div>

          {/* Form and file inputs */}
          <div className="ai-input-row-container">
            {imagePreview && (
              <div className="selected-image-preview-bar">
                {selectedImage?.name.endsWith(".pdf") ? (
                  <div className="preview-thumb">
                    <span className="material-symbols-outlined">
                      picture_as_pdf
                    </span>
                  </div>
                ) : selectedImage?.name.endsWith(".doc") ||
                  selectedImage?.name.endsWith(".docx") ? (
                  <div className="preview-thumb">
                    <span className="material-symbols-outlined">
                      description
                    </span>
                  </div>
                ) : selectedImage?.name.endsWith(".txt") ? (
                  <div className="preview-thumb">
                    <span className="material-symbols-outlined">
                      text_snippet
                    </span>
                  </div>
                ) : (
                  <img
                    src={imagePreview}
                    className="preview-thumb"
                    alt="Preview"
                  />
                )}
                <div className="preview-info">
                  <div className="preview-name">{selectedImage?.name}</div>
                  <div className="preview-size">
                    {(selectedImage?.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  className="remove-preview-btn"
                  onClick={removeImagePreview}
                >
                  ✕
                </button>
              </div>
            )}

            <div className="ai-input-inner">
              {/* Attachment button for both Health Advisor and Copilot modes */}
              <button
                className="ai-attachment-btn"
                onClick={() => fileInputRef.current?.click()}
                type="button"
                title={
                  activeMode === "advisor"
                    ? "Attach medical report, prescription, PDF, Word doc, or image"
                    : "Attach prescription, vitals slip, PDF, Word doc, or image"
                }
              >
                <span className="material-symbols-outlined">attach_file</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*,.pdf,.doc,.docx,.txt,.csv,.md,.rtf"
                onChange={handleImageChange}
              />

              <input
                className="ai-text-input"
                type="text"
                placeholder={
                  isListening
                    ? `🎙️ Listening in ${currentSpeechLang?.nativeName || "English"}... Speak now`
                    : activeMode === "advisor"
                    ? "Ask Health Advisor about symptoms, medicines, lab reports..."
                    : "Tell Copilot to add medicines, log vitals, optimize schedule..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                className={`ai-mic-btn ${isListening ? "listening" : ""}`}
                onClick={toggleListening}
                type="button"
                title={
                  isListening
                    ? `Listening in ${currentSpeechLang?.nativeName || "English"}... Click to stop`
                    : `Voice input in ${currentSpeechLang?.nativeName || "English"} (${currentSpeechLang?.name || "English"})`
                }
              >
                <span className="material-symbols-outlined">
                  {isListening ? "mic" : "mic_none"}
                </span>
              </button>

              <button
                className="ai-send-btn"
                onClick={() => sendMessage()}
                disabled={loading || (!input.trim() && !selectedImage)}
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
          <div className="ai-footer-text">
            {activeMode === "advisor"
              ? "MEDITRACKR HEALTH ADVISOR • MEDICAL GUIDANCE & ANALYSIS"
              : "MEDITRACKR COPILOT • FUNCTIONAL ACTIONS & SMART SCHEDULING"}
          </div>
        </div>
      </div>
      <FeedbackForm
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </section>
  );
}
