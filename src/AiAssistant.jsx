import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import FeedbackForm from "./feedbackform";
import "./aiAssistant.css";

export default function AiAssistance({ profileDetails }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Helper to get message timestamp
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

  // Load chat history from backend
  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getChatHistory`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          const formatted = data.messages.map((m) => ({
            sender: m.role === "user" ? "user" : "assistant",
            text: m.text,
            time: getCurrentTime(m.timeStamp), // use stored timestamp from MongoDB
          }));
          setMessages(formatted);
        } else {
          // Default greeting if no history
          setMessages([
            {
              sender: "assistant",
              text: `Hello ${profileDetails?.name || "there"}! I noticed your morning dose of Lisinopril hasn't been logged yet. Would you like to mark it as taken now, or should I snooze the reminder?`,
              time: getCurrentTime(),
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Send message action
  const sendMessage = async (textToSend = input) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText && !selectedImage) return;

    const currentMsgText = trimmedText;
    const time = getCurrentTime();

    // Create user message object
    const userMsg = {
      sender: "user",
      text: currentMsgText,
      time: time,
      image: imagePreview, // Include local preview if exists
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedImage(null);
    setImagePreview("");
    setLoading(true);

    try {
      // API request to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentMsgText }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => {
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
              text: data.reply,
              time: getCurrentTime(data.modelTime),
            },
          ];
        });
      } else {
        throw new Error("Chat request failed");
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "I encountered an issue processing your request. Please try again.",
          time: getCurrentTime(),
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

  // Quick Action suggestion chips
  const suggestionChips = [
    { text: "Log Symptoms", action: "I'd like to log my symptoms for today." },
    { text: "Check next dose", action: "What is my next scheduled medicine dose?" },
    { text: "Health trends", action: "Show me my recent health log trends." },
    { text: "Pharmacy refill", action: "How do I request a refill for my prescriptions?" },
  ];

  // Render assistant message bubbles with custom support for "Recommended Action" cards
  const renderMessageContent = (msg) => {
    const isRecAction = msg.text.includes("Recommended Action") || msg.text.includes("recommended action");

    if (isRecAction) {
      // Split the message if it has a Recommended Action section to format it beautifully as a sub-card
      const parts = msg.text.split(/(Recommended Action|recommended action):?/i);
      const mainText = parts[0];
      const recContent = parts.slice(2).join("");

      return (
        <>
          <ReactMarkdown>{mainText}</ReactMarkdown>
          <div className="recommendation-box">
            <div className="recommendation-title">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>info</span>
              Recommended Action
            </div>
            <div className="recommendation-content">
              <ReactMarkdown>{recContent.trim()}</ReactMarkdown>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <ReactMarkdown>{msg.text}</ReactMarkdown>
        {msg.image && (
          <img src={msg.image} alt="User upload" className="message-bubble-attachment" />
        )}
      </>
    );
  };

  return (
    <section className="ai-assistant">
      {/* Header bar */}
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-avatar-container">
            <div className="ai-avatar">
              <img src="icon.png" alt="MediTrackr Icon" />
            </div>
            <div className="ai-status-indicator"></div>
          </div>
          <div className="ai-header-info">
            <div className="ai-header-title">MediTrackr Assistant</div>
            <div className="ai-header-status">Online | Always active</div>
          </div>
        </div>

        <div className="ai-header-right">
          <button className="feedback-btn" onClick={() => setShowFeedback(true)}>
            Give feedback
          </button>
        </div>
      </div>

      {/* Main chat window */}
      <div className="ai-chat-area">
        <div className="ai-messages-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.sender}`}>
              <div className="message-header">
                <span className={msg.sender === "user" ? "sender-label-user" : "sender-label-assistant"}>
                  {msg.sender === "user" ? "YOU" : "ASSISTANT"}
                </span>
                <span className="time-stamp">{msg.time}</span>
              </div>
              <div className="message-bubble">
                {renderMessageContent(msg)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-wrapper assistant">
              <div className="message-header">
                <span className="sender-label-assistant">ASSISTANT</span>
                <span className="time-stamp">{getCurrentTime()}</span>
              </div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input panel */}
        <div className="ai-input-wrapper">
          {/* Quick suggestions */}
          <div className="chips-container">
            {suggestionChips.map((chip, index) => (
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
                {selectedImage.name.endsWith(".pdf") ? (
                  <div className="preview-thumb">
                    <span className="material-symbols-outlined">picture_as_pdf</span>
                  </div>
                ) : selectedImage.name.endsWith(".doc") || selectedImage.name.endsWith(".docx") ? (
                  <div className="preview-thumb">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                ) : selectedImage.name.endsWith(".txt") ? (
                  <div className="preview-thumb">
                    <span className="material-symbols-outlined">text_snippet</span>
                  </div>
                ) : (
                  <img src={imagePreview} className="preview-thumb" alt="Preview" />
                )}
                <div className="preview-info">
                  <div className="preview-name">{selectedImage?.name}</div>
                  <div className="preview-size">
                    {(selectedImage?.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button className="remove-preview-btn" onClick={removeImagePreview}>
                  ✕
                </button>
              </div>
            )}

            <div className="ai-input-inner">
              {/* Image upload paperclip icon */}
              <button
                className="ai-attachment-btn"
                onClick={() => fileInputRef.current?.click()}
                type="button"
                title="Attach medical report or image"
              >
                <span className="material-symbols-outlined">attach_file</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleImageChange}
              />

              <input
                className="ai-text-input"
                type="text"
                placeholder="Message MediTrackr Bot..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />

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
            MEDITRACKR AI ASSISTANT • CLINICAL OS V2.4
          </div>
        </div>
      </div>
      <FeedbackForm isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </section>
  );
}
