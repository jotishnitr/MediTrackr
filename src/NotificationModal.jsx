import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationModal({
  isOpen,
  onClose,
  requireAuth,
  setCurrentPage,
  setIsAuthenticated,
  onNotificationRead,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState({ top: 75, right: 24 });

  const updatePopupPosition = () => {
    const btn = document.querySelector(".notification-btn");
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const rightOffset = Math.max(12, window.innerWidth - rect.right);
      const topOffset = rect.bottom + 8;
      setPosition({ top: topOffset, right: rightOffset });
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/getNotifications`, {
        credentials: "include",
      });

      if (res.status === 401) {
        if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
        if (typeof setCurrentPage === "function") setCurrentPage("Login");
        onClose();
        return;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        if (typeof onNotificationRead === "function") {
          onNotificationRead(data.notifications.length);
        }
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePopupPosition();
      fetchNotifications();

      window.addEventListener("resize", updatePopupPosition);
      window.addEventListener("scroll", updatePopupPosition);
      return () => {
        window.removeEventListener("resize", updatePopupPosition);
        window.removeEventListener("scroll", updatePopupPosition);
      };
    }
  }, [isOpen]);

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingRead(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/markAllAsRead`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
        if (typeof setCurrentPage === "function") setCurrentPage("Login");
        onClose();
        return;
      }

      const data = await res.json();
      if (data.success) {
        setNotifications([]);
        if (typeof onNotificationRead === "function") {
          onNotificationRead(0);
        }
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const formatNotificationTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`;
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const getNotificationIcon = (type, title) => {
    if (title && title.includes("Family")) {
      return (
        <div className="notif-icon-badge family">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
      );
    }
    if (type === "alert") {
      return (
        <div className="notif-icon-badge alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
      );
    }
    if (type === "refill") {
      return (
        <div className="notif-icon-badge refill">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </div>
      );
    }
    return (
      <div className="notif-icon-badge reminder">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="notif-overlay" onClick={onClose}>
        <motion.div
          className="notif-modal notif-popup-anchored"
          style={{ top: position.top, right: position.right }}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -6 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="notif-header">
            <div className="notif-header-left">
              <div className="notif-bell-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4edea3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div className="notif-title-group">
                <h2>Notifications</h2>
                {notifications.length > 0 && (
                  <span className="notif-count-badge">
                    {notifications.length} new
                  </span>
                )}
              </div>
            </div>

            <div className="notif-header-actions">
              {notifications.length > 0 && (
                <button
                  className="notif-mark-read-btn"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingRead}
                  title="Mark all notifications as read"
                >
                  {isMarkingRead ? (
                    <span className="notif-spinner-small"></span>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Mark as read</span>
                    </>
                  )}
                </button>
              )}
              <button
                className="notif-close-btn"
                onClick={onClose}
                aria-label="Close notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="notif-body">
            {loading ? (
              <div className="notif-loading-state">
                <div className="notif-spinner"></div>
                <p>Checking for notifications...</p>
              </div>
            ) : error ? (
              <div className="notif-error-state">
                <p>{error}</p>
                <button className="notif-retry-btn" onClick={fetchNotifications}>
                  Try Again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty-state">
                <div className="notif-empty-icon-wrapper">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4edea3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    <circle cx="12" cy="8" r="1" fill="#4edea3" />
                  </svg>
                </div>
                <h3>All Caught Up!</h3>
                <p>You have no unread reminders or alerts at the moment.</p>
              </div>
            ) : (
              <div className="notif-list">
                {notifications.map((item, idx) => (
                  <motion.div
                    key={item._id || idx}
                    className="notif-card"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                  >
                    <div className="notif-card-icon">
                      {getNotificationIcon(item.type, item.title)}
                    </div>
                    <div className="notif-card-content">
                      <div className="notif-card-top">
                        <span className="notif-card-title">{item.title}</span>
                        <span className="notif-card-time">
                          {formatNotificationTime(item.createdAt)}
                        </span>
                      </div>
                      {item.userName && (
                        <div className="notif-patient-tag">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span>Patient: {item.userName}</span>
                        </div>
                      )}
                      <p className="notif-card-message">{item.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="notif-footer">
              <button
                className="notif-footer-mark-all"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingRead}
              >
                {isMarkingRead ? "Marking all as read..." : "Mark all as read"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
