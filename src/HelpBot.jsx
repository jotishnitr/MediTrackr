import { useState, useRef, useEffect } from "react";
import "./helpBot.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSpeechToText } from "./utils/useSpeechToText";

export default function HelpBot({ setShowHelpBot, showHelpBot }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

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

  const API_BASE = import.meta.env.VITE_API_URL || "https://meditrackr.onrender.com";

  const defaultWelcomeMessage = {
    sender: "bot",
    text: "Hi! I'm **MediTrackr Bot** 👋\n\nI can help you navigate the app, explain features, and guide you step-by-step through adding medicines, setting reminders, using FDA search, or exploring AI Copilot.\n\nNeed technical support or assistance? Contact our team anytime at **jotish.dev.noreply@gmail.com**.\n\nHow can I help you today?",
  };

  const quickPrompts = [
    "How to add a medicine?",
    "How to enable reminders?",
    "What is AI Copilot?",
    "Contact support details",
  ];

  const handleDeleteHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your chat history?")) return;

    try {
      const url = `${API_BASE}/getChatHistory`;
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setMessages([defaultWelcomeMessage]);
      } else {
        console.error("Failed to delete chat history");
      }
    } catch (err) {
      console.error("Error clearing chat history:", err);
    }
  };

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`${API_BASE}/getChatHistory`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data && Array.isArray(data.messages) && data.messages.length > 0) {
          const formatted = data.messages.map((m) => ({
            sender: m.role === "user" ? "user" : "bot",
            text: m.text,
          }));
          setMessages(formatted);
        } else {
          setMessages([defaultWelcomeMessage]);
        }
      } catch (err) {
        console.error(err);
        setMessages([defaultWelcomeMessage]);
      }
    }

    loadHistory();
  }, [API_BASE]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (textToSend = null) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMsg = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });
      const data = await res.json();
      if (data && data.reply) {
        const botMsg = { sender: "bot", text: data.reply };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "I'm having trouble responding right now. Please try again or visit our AI Advisor & Copilot page.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Network issue or service unavailable. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="chatbot-popup">
      {/* Header */}
      <div className="header-container">
        <div className="bot-header-avatar">
          <span className="material-symbols-outlined bot-avatar-icon">support_agent</span>
          <span className="bot-status-dot"></span>
        </div>
        <div className="header-title-container">
          <div className="header-title">MediTrackr Bot</div>
          <div className="header-tagline">
            Here to Help, Listen, and Resolve.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleDeleteHistory}
            title="Clear Chat History"
            className="bot-clear-btn"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
          </button>
          <button
            className="bot-close-btn"
            onClick={() => setShowHelpBot(false)}
            aria-label="Close Chat"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Chat Messages List (Middle Scrollable) */}
      <div className="chat-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === "user" ? "msg-user" : "msg-bot"}
          >
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
            {msg.sender !== "user" && msg.text && (
              <div className="bot-msg-actions">
                <button
                  type="button"
                  className={`bot-msg-copy-btn ${copiedIndex === index ? "copied" : ""}`}
                  onClick={() => handleCopyMessage(msg.text, index)}
                  title="Copy response to clipboard"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
                    {copiedIndex === index ? "check" : "content_copy"}
                  </span>
                  <span>{copiedIndex === index ? "Copied" : "Copy"}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="bot-quick-prompts">
            <span className="quick-prompts-label">Suggested Questions:</span>
            <div className="quick-prompts-grid">
              {quickPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  className="quick-prompt-chip"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="msg-bot msg-typing-bubble">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      {/* Input Area (Bottom Fixed) */}
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? `🎙️ Listening in ${currentSpeechLang?.nativeName || "English"}... Speak now`
              : "Ask your queries..."
          }
          disabled={loading}
        />
        <button
          className={`bot-mic-btn ${isListening ? "listening" : ""}`}
          onClick={toggleListening}
          type="button"
          title={
            isListening
              ? `Listening in ${currentSpeechLang?.nativeName || "English"}... Click to stop`
              : `Speak to type in ${currentSpeechLang?.nativeName || "English"} (${currentSpeechLang?.name || "English"})`
          }
          disabled={loading}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
            {isListening ? "mic" : "mic_none"}
          </span>
        </button>
        <button
          className="chat-send-btn"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          title="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </section>
  );
}
