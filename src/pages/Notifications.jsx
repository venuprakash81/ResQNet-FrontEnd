import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  AlertTriangle,
  Hospital,
  Ambulance,
  CheckCircle,
  Info,
  Check,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import "./Notifications.css";

const initialNotifications = [
  {
    id: 1,
    title: "Emergency Alert",
    message: "A new emergency has been reported in your area.",
    time: "Just now",
    type: "emergency",
    read: false,
  },
  {
    id: 2,
    title: "Hospital Update",
    message: "A nearby hospital has updated its available bed information.",
    time: "10 minutes ago",
    type: "hospital",
    read: false,
  },
  {
    id: 3,
    title: "Rescue Team Assigned",
    message: "A rescue team has been assigned to an emergency request.",
    time: "30 minutes ago",
    type: "rescue",
    read: false,
  },
  {
    id: 4,
    title: "Request Confirmed",
    message: "Your emergency request has been successfully recorded.",
    time: "1 hour ago",
    type: "success",
    read: true,
  },
  {
    id: 5,
    title: "Welcome to ResQNet",
    message: "Stay connected to receive important emergency updates.",
    time: "Yesterday",
    type: "info",
    read: true,
  },
];

const iconMap = {
  emergency: <AlertTriangle />,
  hospital: <Hospital />,
  rescue: <Ambulance />,
  success: <CheckCircle />,
  info: <Info />,
};

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="notifications-page">
      <div className="notifications-card">
        <div className="notifications-header">
          <button
            className="notifications-back"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="notifications-heading">
            <div className="notifications-title-row">
              <div className="notifications-bell-icon">
                <Bell size={23} />
              </div>
              <h1>Notifications</h1>
              {unreadCount > 0 && (
                <span className="notifications-count">{unreadCount}</span>
              )}
            </div>
            <p>Stay updated with your ResQNet activity</p>
          </div>
        </div>

        <div className="notifications-toolbar">
          <span className="notifications-section-title">
            All notifications
          </span>

          <div className="notifications-toolbar-actions">
            <button
              className="notifications-action"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check size={16} />
              Mark all as read
            </button>

            <button
              className="notifications-action delete-action"
              onClick={clearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 size={16} />
              Clear all
            </button>
          </div>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="notifications-empty-icon">
                <Bell size={32} />
              </div>
              <h3>No notifications</h3>
              <p>You are all caught up. New updates will appear here.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.read ? "read" : "unread"
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div
                  className={`notification-icon ${notification.type}`}
                >
                  {iconMap[notification.type]}
                </div>

                <div className="notification-content">
                  <div className="notification-item-heading">
                    <h3>{notification.title}</h3>
                    {!notification.read && (
                      <span className="notification-unread-dot" />
                    )}
                  </div>

                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {notification.time}
                  </span>
                </div>

                {!notification.read && (
                  <button
                    className="notification-read-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    title="Mark as read"
                    aria-label={`Mark ${notification.title} as read`}
                  >
                    <Check size={17} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="notifications-footer">
          <span>
            {notifications.length}{" "}
            {notifications.length === 1
              ? "notification"
              : "notifications"}
          </span>
          <span>{unreadCount} unread</span>
        </div>
      </div>
    </div>
  );
}

export default Notifications;