import React, { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  ArrowLeft,
  Send,
  Search,
  MessageCircle,
  Users,
  ShieldCheck,
  Ambulance,
  HeartPulse,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HospitalChat.css";

const WS_URL = "https://resqnet-backend-1.onrender.com/api";

const chatCategories = [
  { id: "CITIZEN", label: "Citizen Chats", icon: Users },
  { id: "HOSPITAL", label: "Hospital Chats", icon: Ambulance },
  { id: "ADMIN", label: "Admin Chats", icon: ShieldCheck },
  { id: "VOLUNTEER", label: "Volunteer Chats", icon: HeartPulse },
];

// Demo conversations: replace these with conversation records from your backend.
// The conversationId must be the same for both participants.
const demoConversations = [
  {
    conversationId: "citizen-101",
    participantId: "101",
    participantName: "Citizen 1",
    participantRole: "CITIZEN",
    lastMessage: "I need help with an emergency.",
    time: "10:30 AM",
    unread: 2,
  },
  {
    conversationId: "citizen-102",
    participantId: "102",
    participantName: "Citizen 2",
    participantRole: "CITIZEN",
    lastMessage: "Thank you for the update.",
    time: "Yesterday",
    unread: 0,
  },
  {
    conversationId: "hospital-201",
    participantId: "201",
    participantName: "Hospital 1",
    participantRole: "HOSPITAL",
    lastMessage: "Our hospital is on the way.",
    time: "10:15 AM",
    unread: 1,
  },
  {
    conversationId: "admin-301",
    participantId: "301",
    participantName: "Administrator",
    participantRole: "ADMIN",
    lastMessage: "Please confirm the Rescue team status.",
    time: "Yesterday",
    unread: 0,
  },
  {
    conversationId: "volunteer-401",
    participantId: "401",
    participantName: "Volunteer 1",
    participantRole: "VOLUNTEER",
    lastMessage: "I am available to assist.",
    time: "9:45 AM",
    unread: 0,
  },
];

function RescueTeamMessages() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const senderId = user.id || user.userId;
  const senderName = user.name || user.fullName || "Hospital";
  const senderRole = user.role || "HOSPITAL";

  const [activeCategory, setActiveCategory] = useState("CITIZEN");
  const [conversations, setConversations] = useState(demoConversations);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const clientRef = useRef(null);
  const bottomRef = useRef(null);

  const filteredConversations = conversations.filter((conversation) => {
    const matchesCategory =
      conversation.participantRole === activeCategory;

    const matchesSearch = (
      conversation.participantName +
      " " +
      conversation.lastMessage
    )
      .toLowerCase()
      .includes(searchText.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (!selectedConversation?.conversationId) {
      setMessages([]);
      setConnected(false);
      return;
    }

    setMessages([]);
    setError("");
    setConnected(false);

    const conversationId = selectedConversation.conversationId;

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
                if (
                  incoming.id &&
                  previous.some((message) => message.id === incoming.id)
                ) {
                  return previous;
                }

                return [...previous, incoming];
              });

              setConversations((previous) =>
                previous.map((conversation) =>
                  conversation.conversationId === conversationId
                    ? {
                        ...conversation,
                        lastMessage: incoming.content || "",
                        time: incoming.timestamp
                          ? new Date(incoming.timestamp).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : "Now",
                      }
                    : conversation
                )
              );
            } catch {
              setError("The server returned an invalid message.");
            }
          }
        );
      },

      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),

      onStompError: () => {
        setConnected(false);
        setError("Chat connection failed. Reconnecting...");
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [selectedConversation?.conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectCategory = (category) => {
    setActiveCategory(category);
    setSelectedConversation(null);
    setMessages([]);
    setSearchText("");
    setError("");
  };

  const openConversation = (conversation) => {
    setSelectedConversation(conversation);

    setConversations((previous) =>
      previous.map((item) =>
        item.conversationId === conversation.conversationId
          ? { ...item, unread: 0 }
          : item
      )
    );
  };

  const sendMessage = (event) => {
    event.preventDefault();

    const content = messageText.trim();
    const client = clientRef.current;

    if (!content || !selectedConversation) return;

    if (!senderId) {
      setError("Your hospital user ID is missing. Please sign in again.");
      return;
    }

    if (!client?.connected) {
      setError("Chat is not connected. Please wait and try again.");
      return;
    }

    const payload = {
      conversationId: selectedConversation.conversationId,
      senderId,
      senderName,
      senderRole,
      content,
      timestamp: new Date().toISOString(),
    };

    try {
      client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(payload),
      });

      setMessageText("");
      setError("");
    } catch {
      setError("Unable to send the message. Please try again.");
    }
  };

  const ActiveIcon =
    chatCategories.find((category) => category.id === activeCategory)?.icon ||
    MessageCircle;

  return (
    <div className="hospital-chat-page">
      <div className="hospital-chat-shell">
        <header className="hospital-chat-topbar">
          <button
            className="hospital-chat-back"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="hospital-chat-brand-icon">
            <MessageCircle size={22} />
          </div>

          <div className="hospital-chat-brand">
            <h1>Rescue-Team Messages</h1>
            <p>ResQNet communication center</p>
          </div>

          <div
            className={`hospital-chat-connection ${
              connected ? "is-connected" : ""
            }`}
          >
            {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{connected ? "Connected" : "Offline"}</span>
          </div>
        </header>

        <nav className="hospital-chat-tabs" aria-label="Chat categories">
          {chatCategories.map((category) => {
            const Icon = category.icon;
            const count = conversations.filter(
              (conversation) =>
                conversation.participantRole === category.id
            ).length;

            return (
              <button
                key={category.id}
                className={`hospital-chat-tab ${
                  activeCategory === category.id ? "active" : ""
                }`}
                onClick={() => selectCategory(category.id)}
              >
                <Icon size={18} />
                <span>{category.label}</span>
                <span className="hospital-chat-tab-count">{count}</span>
              </button>
            );
          })}
        </nav>

        <main className="hospital-chat-main">
          <aside className="hospital-chat-sidebar">
            <div className="hospital-chat-list-heading">
              <div>
                <h2>
                  {chatCategories.find(
                    (category) => category.id === activeCategory
                  )?.label}
                </h2>
                <p>{filteredConversations.length} conversations</p>
              </div>
              <ActiveIcon size={21} />
            </div>

            <div className="hospital-chat-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            <div className="hospital-conversation-list">
              {filteredConversations.length === 0 ? (
                <div className="hospital-chat-no-conversations">
                  <MessageCircle size={27} />
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.conversationId}
                    className={`hospital-conversation ${
                      selectedConversation?.conversationId ===
                      conversation.conversationId
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => openConversation(conversation)}
                  >
                    <div className="hospital-conversation-avatar">
                      {conversation.participantName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="hospital-conversation-details">
                      <div className="hospital-conversation-topline">
                        <h3>{conversation.participantName}</h3>
                        <span>{conversation.time}</span>
                      </div>

                      <div className="hospital-conversation-bottomline">
                        <p>{conversation.lastMessage}</p>
                        {conversation.unread > 0 && (
                          <span className="hospital-unread-count">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="hospital-chat-panel">
            {!selectedConversation ? (
              <div className="hospital-chat-welcome">
                <div className="hospital-chat-welcome-icon">
                  <ActiveIcon size={34} />
                </div>
                <h2>Select a conversation</h2>
                <p>
                  Choose a conversation from the list to communicate with{" "}
                  {activeCategory.toLowerCase()} users.
                </p>
              </div>
            ) : (
              <>
                <div className="hospital-chat-conversation-header">
                  <div className="hospital-conversation-avatar large">
                    {selectedConversation.participantName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h2>{selectedConversation.participantName}</h2>
                    <p>
                      {selectedConversation.participantRole.replace(
                        "_",
                        " "
                      )}
                    </p>
                  </div>
                </div>

                <div className="hospital-chat-messages">
                  <div className="hospital-chat-start-label">
                    Conversation
                  </div>

                  {error && (
                    <div className="hospital-chat-error">{error}</div>
                  )}

                  {messages.length === 0 ? (
                    <div className="hospital-chat-no-messages">
                      <MessageCircle size={28} />
                      <p>No messages loaded for this conversation.</p>
                      <span>
                        Send a message to start chatting.
                      </span>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isMine =
                        String(message.senderId) === String(senderId);

                      return (
                        <div
                          key={message.id || `${message.timestamp}-${index}`}
                          className={`hospital-message-row ${
                            isMine ? "mine" : "theirs"
                          }`}
                        >
                          <div className="hospital-message-bubble">
                            {!isMine && (
                              <span className="hospital-message-sender">
                                {message.senderName ||
                                  message.senderRole ||
                                  "User"}
                              </span>
                            )}

                            <p>{message.content}</p>

                            <span className="hospital-message-time">
                              {message.timestamp
                                ? new Date(
                                    message.timestamp
                                  ).toLocaleTimeString([], {
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

                <form
                  className="hospital-chat-compose"
                  onSubmit={sendMessage}
                >
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
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default RescueTeamMessages;
