import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  MessageCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import "./ChatPage.css";

const WS_URL = "http://localhost:8081/ws-chat";

function ChatPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();

  // Replace these values with the logged-in user's details from your app.
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const senderId = user.id || user.userId;
  const senderName = user.name || user.fullName || "User";
  const senderRole = user.role || "CITIZEN";

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const clientRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!conversationId) {
      setError("Conversation ID is missing.");
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        setError("");

        client.subscribe(
          `/topic/messages/${conversationId}`,
          (frame) => {
            try {
              const incoming = JSON.parse(frame.body);

              setMessages((previous) => {
                // Avoid displaying a message twice if the server echoes it.
                if (
                  incoming.id &&
                  previous.some((message) => message.id === incoming.id)
                ) {
                  return previous;
                }

                return [...previous, incoming];
              });
            } catch {
              setError("Received an invalid message from the server.");
            }
          }
        );
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      onStompError: () => {
        setConnected(false);
        setError("Chat connection error. Trying to reconnect...");
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();

    const content = messageText.trim();
    if (!content || !clientRef.current?.connected || !senderId) {
      if (!senderId) {
        setError("Your user ID is missing. Please sign in again.");
      }
      return;
    }

    const payload = {
      conversationId,
      senderId,
      senderName,
      senderRole,
      content,
      timestamp: new Date().toISOString(),
    };

    try {
      clientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(payload),
      });
      setMessageText("");
      setError("");
    } catch {
      setError("Message could not be sent. Please try again.");
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-window">
        <header className="chat-header">
          <button
            className="chat-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={21} />
          </button>

          <div className="chat-avatar">
            <MessageCircle size={22} />
          </div>

          <div className="chat-header-info">
            <h2>ResQNet Chat</h2>
            <p>
              {connected ? (
                <>
                  <span className="chat-status-dot online" />
                  Connected
                </>
              ) : (
                <>
                  <span className="chat-status-dot offline" />
                  Connecting...
                </>
              )}
            </p>
          </div>

          <div className="chat-connection-icon" title={connected ? "Connected" : "Disconnected"}>
            {connected ? <Wifi size={19} /> : <WifiOff size={19} />}
          </div>
        </header>

        <div className="chat-conversation">
          <div className="chat-date-label">Conversation</div>

          {error && <div className="chat-error">{error}</div>}

          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">
                <MessageCircle size={30} />
              </div>
              <h3>No messages yet</h3>
              <p>Send a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isMine =
                String(message.senderId) === String(senderId);

              return (
                <div
                  key={message.id || `${message.timestamp}-${index}`}
                  className={`chat-message-row ${isMine ? "mine" : "theirs"}`}
                >
                  <div className="chat-message">
                    {!isMine && (
                      <span className="chat-sender-name">
                        {message.senderName || message.senderRole || "User"}
                      </span>
                    )}

                    <p>{message.content}</p>

                    <span className="chat-message-time">
                      {message.timestamp
                        ? new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        <form className="chat-input-area" onSubmit={sendMessage}>
          <input
            type="text"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Type your message..."
            aria-label="Type your message"
          />

          <button
            type="submit"
            disabled={!messageText.trim() || !connected}
            aria-label="Send message"
          >
            <Send size={19} />
          </button>
        </form>

        <div className="chat-footer">
          Messages are shared with the other participant in this conversation.
        </div>
      </div>
    </div>
  );
}

export default ChatPage;