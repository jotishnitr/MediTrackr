import { useState, useRef, useEffect } from "react";
import "./helpBot.css";
import ReactMarkdown from "react-markdown";

export default function HelpBot({ setShowHelpBot, showHelpBot }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || "https://meditrackr.onrender.com";

  const defaultWelcomeMessage = {
    sender: "bot",
    text: "Hi! I'm **MediTrackr Bot** 👋\n\nI can help you navigate the app, explain features, and guide you through adding medicines, setting reminders, using FDA search, or explaining AI Copilot.\n\nHow can I help you today?",
  };

  const quickPrompts = [
    "How to add a medicine?",
    "How to enable reminders?",
    "What is AI Copilot?",
    "How does FDA search work?",
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
            <ReactMarkdown>{msg.text}</ReactMarkdown>
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
          placeholder="Ask your queries..."
          disabled={loading}
        />
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
