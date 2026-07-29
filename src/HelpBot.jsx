import { useState, useRef, useEffect } from "react";
import "./helpBot.css";
import ReactMarkdown from "react-markdown";

export default function HelpBot({ setShowHelpBot, showHelpBot }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(
          "https://meditrackr.onrender.com/getChatHistory",
          {
            credentials: "include",
          },
        );
        const data = await res.json();

        const formatted = data.messages.map((m) => ({
          sender: m.role === "user" ? "user" : "bot",
          text: m.text,
        }));

        setMessages(formatted);
      } catch (err) {
        console.error(err);
      }
    }

    loadHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) {
      return;
    }
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://meditrackr.onrender.com/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      const botMsg = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <section className="chatbot-popup">
      <div className="header-container">
        <div>
          <img src="./helpBot.png" alt="Help Bot Logo"></img>
        </div>
        <div className="header-title-container">
          <div className="header-title">MediTrackr Bot</div>
          <div className="header-tagline">
            Here to Help, Listen, and Resolve.
          </div>
        </div>
        <div className="bot-close-btn" onClick={() => setShowHelpBot(false)}>
          ✕
        </div>
      </div>

      <div className="chat-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === "user" ? "msg-user" : "msg-bot"}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}

        {loading && <div className="msg-typing">Typing...</div>}

        <div ref={chatEndRef}></div>

        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your queries ..."
          />
        </div>
      </div>
    </section>
  );
}
