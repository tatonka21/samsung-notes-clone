import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import useChat from "store/hooks/useChat";
import useSettings from "store/hooks/useSettings";
import {
  FiSend,
  FiPlus,
  FiTrash2,
  FiMessageSquare,
  FiAlertCircle,
} from "react-icons/fi";
import css from "styles/aiChat.module.scss";

const AiChat: React.FC = () => {
  const { chatState, activeSession, createSession, selectSession, deleteSession, sendMessage } = useChat();
  const { hasGeminiKey } = useSettings();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || chatState.isLoading) return;
    setInput("");
    if (!chatState.activeSessionId) {
      createSession();
    }
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!hasGeminiKey) {
    return (
      <div className={css.noKey}>
        <FiAlertCircle size={48} />
        <h2>Gemini API Key Required</h2>
        <p>
          Go to <strong>Settings</strong> and add your Gemini API key to start
          chatting.
        </p>
        <p className={css.hint}>
          Get a free key at{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
          >
            Google AI Studio
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className={css.container}>
      {/* Session list */}
      <div className={css.sessions}>
        <button className={css.newSession} onClick={() => createSession()}>
          <FiPlus /> New Chat
        </button>
        <div className={css.sessionList}>
          {chatState.sessions.map((s) => (
            <div
              key={s.id}
              className={`${css.sessionItem} ${s.id === chatState.activeSessionId ? css.active : ""}`}
              onClick={() => selectSession(s.id)}
            >
              <FiMessageSquare size={14} />
              <span className={css.sessionTitle}>{s.title}</span>
              <button
                className={css.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(s.id);
                }}
              >
                <FiTrash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className={css.chatArea}>
        {!activeSession ? (
          <div className={css.welcome}>
            <h2>✨ AI Assistant</h2>
            <p>
              Powered by Gemini 2.0 Flash — Ask me anything, request research
              reports, or let me help you build something amazing.
            </p>
            <div className={css.suggestions}>
              {[
                "Explain quantum computing in simple terms",
                "Write a Python script to scrape a website",
                "Research the top 10 AI opportunities in 2025",
                "Help me plan a mobile app project",
              ].map((s) => (
                <button
                  key={s}
                  className={css.suggestion}
                  onClick={() => {
                    setInput(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={css.messages}>
            {activeSession.messages.map((msg) => (
              <div
                key={msg.id}
                className={`${css.message} ${msg.role === "user" ? css.userMsg : css.aiMsg}`}
              >
                <div className={css.avatar}>
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>
                <div className={css.bubble}>
                  {msg.role === "model" ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <span className={css.time}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {chatState.isLoading && (
              <div className={`${css.message} ${css.aiMsg}`}>
                <div className={css.avatar}>🤖</div>
                <div className={css.bubble}>
                  <div className={css.typing}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            {chatState.error && (
              <div className={css.error}>
                <FiAlertCircle /> {chatState.error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className={css.inputRow}>
          <textarea
            className={css.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
            rows={2}
          />
          <button
            className={css.sendBtn}
            onClick={handleSend}
            disabled={!input.trim() || chatState.isLoading}
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
