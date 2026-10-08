import React, { useEffect, useRef, useState } from "react";
import "./AIChat.css";

const API_URL = "http://localhost:8000/ask";

const AIChat = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm ResQNet AI Assistant. Ask me about ResQNet, its features, APIs, emergency support, hospitals, rescue teams, volunteers, or citizens.",
    },
  ]);

  const messagesRef = useRef(null);

  /* =====================================================
     AUTO SCROLL TO BOTTOM
     ===================================================== */
  useEffect(() => {
    const container = messagesRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [messages, loading]);

  /* =====================================================
     SEND MESSAGE
     ===================================================== */
  const sendMessage = async (e) => {
    e.preventDefault();

    const question = message.trim();

    if (!question || loading) {
      return;
    }

    // Add user message immediately
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        text: question,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch (jsonError) {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            `Server error: ${response.status}`
        );
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          text:
            data.answer ||
            data.response ||
            "No answer was received from ResQNet AI.",
        },
      ]);
    } catch (error) {
      console.error("ResQNet AI Error:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "error",
          text:
            error.message ||
            "Unable to connect to ResQNet AI. Please check whether the AI server is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     CLEAR CHAT
     ===================================================== */
  const clearChat = () => {
    if (loading) return;

    setMessages([
      {
        role: "ai",
        text: "Chat cleared. What would you like to know about ResQNet?",
      },
    ]);
  };

  return (
    <div className="ai-chat-page">

      {/* =================================================
          CHAT CONTAINER
          ================================================= */}
      <div className="ai-chat">

        {/* =================================================
            HEADER
            ================================================= */}
        <header className="ai-chat-header">

          <div className="ai-header-left">

            <div className="ai-logo">
              🤖
            </div>

            <div className="ai-header-text">
              <h1>ResQNet AI</h1>
              <p>Emergency Network Assistant</p>
            </div>

          </div>

          <button
            type="button"
            className="clear-chat-button"
            onClick={clearChat}
            disabled={loading}
          >
            Clear
          </button>

        </header>


        {/* =================================================
            MESSAGE AREA
            THIS IS THE ONLY SCROLLABLE AREA
            ================================================= */}
        <main
          className="ai-chat-messages"
          ref={messagesRef}
        >

          <div className="messages-inner">

            {messages.map((msg, index) => (

              <div
                key={`${msg.role}-${index}`}
                className={`message-row ${msg.role}`}
              >

                <div
                  className={`chat-message ${msg.role}`}
                >

                  <div className="message-name">

                    {msg.role === "user"
                      ? "You"
                      : msg.role === "error"
                      ? "Error"
                      : "ResQNet AI"}

                  </div>

                  <div className="message-text">
                    {msg.text}
                  </div>

                </div>

              </div>

            ))}


            {/* =================================================
                THINKING MESSAGE
                ================================================= */}
            {loading && (

              <div className="message-row ai">

                <div className="chat-message ai">

                  <div className="message-name">
                    ResQNet AI
                  </div>

                  <div className="thinking-container">

                    <span className="thinking-dot"></span>
                    <span className="thinking-dot"></span>
                    <span className="thinking-dot"></span>

                  </div>

                </div>

              </div>

            )}

          </div>

        </main>


        {/* =================================================
            BOTTOM AREA
            ================================================= */}
        <footer className="ai-chat-bottom">

          {/* Blinking Robot */}
          <div className="ai-blinking-emoji">
            🤖
          </div>


          {/* Input Form */}
          <form
            className="ai-chat-form"
            onSubmit={sendMessage}
          >

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask ResQNet AI anything..."
              disabled={loading}
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="send-button"
            >

              {loading ? (
                <span className="send-loading">
                  ...
                </span>
              ) : (
                <>
                  <span>Send</span>
                  <span className="send-icon">➤</span>
                </>
              )}

            </button>

          </form>

        </footer>

      </div>

    </div>
  );
};

export default AIChat;