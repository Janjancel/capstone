import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const DashboardNavbarNotifModal = ({ show, onHide, setUnreadCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // follow NotificationBell semantics (startPolling toggles interval)
  const [startPolling, setStartPolling] = useState(false);

  // mirror NotificationBell: load userId and use per-user endpoints
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();
  const API_URL = useMemo(() => process.env.REACT_APP_API_URL, []);
  const BASE = `${API_URL}/api/notifications`;

  // ---------- Helpers (kept intact) ----------

  // Normalize area: new `for` or legacy `type`
  const getArea = (n) => {
    if (n?.for) return n.for; // "order" | "sell" | "demolish"
    const t = (n?.type || "").toLowerCase();
    if (t.includes("order") || t === "cancel_request") return "order";
    if (t.startsWith("sell")) return "sell";
    if (
      t.startsWith("demolish") ||
      t === "price_proposal" ||
      t === "client_price_response"
    )
      return "demolish";
    return "general";
  };

  // Prefer deep link, else area route (kept)
  const resolveRoute = (n) => {
    if (n?.link) return n.link;

    const area = getArea(n);
    if (area === "order") {
      return "/admin/orders";
    }
    if (area === "sell") {
      return "/sellDashboard";
    }
    if (area === "demolish") {
      return "/demolishDashboard";
    }
    return "/";
  };

  const ctaLabel = (n) => {
    const area = getArea(n);
    if (area === "order") return "View Order(s)";
    if (area === "sell") return "View Request";
    if (area === "demolish") return "View Demolition";
    return "Open";
  };

  const peso = (num) => {
    try {
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
      }).format(Number(num || 0));
    } catch {
      return `₱${Number(num || 0).toLocaleString()}`;
    }
  };

  const whenText = (d) => {
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "";
      return dt.toLocaleString();
    } catch {
      return "";
    }
  };

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  // ---------- Load userId (same pattern as NotificationBell) ----------
  useEffect(() => {
    const loadUserId = async () => {
      const storedId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (storedId) {
        setUserId(storedId);
        return;
      }

      if (token) {
        try {
          const res = await axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?._id) {
            localStorage.setItem("userId", res.data._id);
            setUserId(res.data._id);
          }
        } catch {
          console.warn("Auth token invalid");
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        }
      }
    };

    loadUserId();
  }, [API_URL]);

  // ---------- Fetch admin notifications (per-user) ----------
  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      // Use the same per-user dataset as NotificationBell
      const res = await axios.get(
        `${BASE}/users/${userId}/notifications`,
        { headers: authHeaders() }
      );
      const all = Array.isArray(res.data) ? res.data : [];

      // Fetch ONLY admin notifications
      const adminNotifs = all.filter((n) => n.role === "admin");

      // Sort newest first (kept)
      adminNotifs.sort((a, b) => {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return db - da;
      });

      setNotifications(adminNotifs);

      // Unread + polling behavior identical to NotificationBell
      const unread = adminNotifs.filter((n) => !n.read).length;
      setUnreadCount(unread);
      setStartPolling(unread > 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when modal opens (and when userId becomes available)
  useEffect(() => {
    if (show && userId) {
      setLoading(true);
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, userId]);

  // Poll for notifications if unread exists (same cadence/stop rule)
  useEffect(() => {
    if (!userId || !startPolling) return;

    const poll = async () => {
      try {
        const res = await axios.get(
          `${BASE}/users/${userId}/notifications`,
          { headers: authHeaders() }
        );
        const all = Array.isArray(res.data) ? res.data : [];
        const adminNotifs = all.filter((n) => n.role === "admin");

        adminNotifs.sort((a, b) => {
          const da = new Date(a.createdAt || 0).getTime();
          const db = new Date(b.createdAt || 0).getTime();
          return db - da;
        });

        setNotifications(adminNotifs);

        const unread = adminNotifs.filter((n) => !n.read).length;
        setUnreadCount(unread);
        if (unread === 0) setStartPolling(false);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [userId, startPolling, BASE, setUnreadCount]);

  // ---------- Actions (ported 1:1 from NotificationBell style) ----------

  const handleMarkAsRead = async (notifId) => {
    try {
      await axios.patch(
        `${BASE}/users/${userId}/notifications/${notifId}`,
        { read: true },
        { headers: { ...authHeaders() } }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notifId ? { ...n, read: true, readAt: new Date().toISOString() } : n
        )
      );

      setUnreadCount((prev) => {
        const current = typeof prev === "number" ? prev : 0;
        const next = Math.max(current - 1, 0);
        if (next === 0) setStartPolling(false);
        return next;
      });
    } catch (err) {
      console.error("Error marking as read:", err);
      Swal.fire("Error", "Failed to mark as read", "error");
    }
  };

  // Bulk mark-all with graceful fallback to per-item PATCH if bulk endpoint is missing (404/405)
  const handleMarkAllAsRead = async () => {
    const unreadAdmin = notifications.filter((n) => n.role === "admin" && !n.read);

    try {
      await axios.patch(
        `${BASE}/users/${userId}/notifications`,
        { read: true },
        { headers: { ...authHeaders() } }
      );
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 || status === 405) {
        // Fallback: mark each unread admin notification individually
        try {
          await Promise.allSettled(
            unreadAdmin.map((n) =>
              axios.patch(
                `${BASE}/users/${userId}/notifications/${n._id}`,
                { read: true },
                { headers: { ...authHeaders() } }
              )
            )
          );
        } catch (innerErr) {
          console.error("Error marking all as read (fallback):", innerErr);
          Swal.fire("Error", "Failed to mark all as read", "error");
          return;
        }
      } else {
        console.error("Error marking all as read:", err);
        Swal.fire("Error", "Failed to mark all as read", "error");
        return;
      }
    }

    // Local state update mirrors what we display (admin-only list)
    setNotifications((prev) =>
      prev.map((n) =>
        n.role === "admin" ? { ...n, read: true, readAt: new Date().toISOString() } : n
      )
    );
    setUnreadCount(0);
    setStartPolling(false);
  };

  const handleClearNotifications = async () => {
    try {
      // Clear the entire per-user list, then we show only admin (which will be empty)
      await axios.delete(
        `${BASE}/users/${userId}/notifications`,
        { headers: { ...authHeaders() } }
      );

      setNotifications([]);
      setUnreadCount(0);
      setStartPolling(false);
    } catch (err) {
      console.error("Error clearing notifications:", err);
      Swal.fire("Error", "Failed to clear notifications", "error");
    }
  };

  const handleLearnMore = async (notification) => {
    try {
      // Mark as read optimistically (don't block nav) — like NotificationBell
      if (!notification.read) {
        handleMarkAsRead(notification._id);
      }

      // Legacy routing kept intact
      const legacyType = (notification.type || "").toLowerCase();
      if (legacyType === "cancel_request" || legacyType === "order_update") {
        navigate("/admin/orders");
      } else if (legacyType === "sell_request" || legacyType === "sell_update") {
        navigate("/sellDashboard");
      } else if (
        legacyType === "demolish_request" ||
        legacyType === "demolish_scheduled" ||
        legacyType === "demolish_ocular_scheduled" ||
        legacyType === "client_price_response" ||
        legacyType === "price_proposal"
      ) {
        navigate("/demolishDashboard");
      } else {
        // Prefer deep link or area-based route for the new model
        navigate(resolveRoute(notification));
      }
    } catch (err) {
      console.error("Navigation error:", err);
    } finally {
      onHide();
    }
  };

  const getPayload = (n) => n?.data || n?.payload || {};

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <Modal show={show} onHide={onHide} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="w-100 d-flex justify-content-between align-items-center">
          Admin Notifications
          <div className="d-flex align-items-center gap-3">
            {hasUnread && (
              <Button
                variant="link"
                className="p-0"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="link"
                className="text-danger p-0"
                onClick={handleClearNotifications}
              >
                Clear All
              </Button>
            )}
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-muted text-center">No notifications</div>
        ) : (
          notifications.map((n) => {
            const payload = getPayload(n);
            const area = getArea(n);
            const statusText = (n.status || "").replace(/_/g, " ");
            const showCTA = true; // Always show CTA; we'll route using area/link/id

            return (
              <div
                key={n._id}
                className={`border rounded mb-2 p-2 small ${
                  n.read ? "bg-light text-dark" : "bg-secondary text-white"
                }`}
              >
                {/* Header: area chip + status + timestamp */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    {/* area label */}
                    <span
                      className={`badge ${
                        n.read ? "text-bg-light" : "text-bg-dark"
                      }`}
                    >
                      {area === "order"
                        ? "Order"
                        : area === "sell"
                        ? "Sell Request"
                        : area === "demolish"
                        ? "Demolition"
                        : "General"}
                    </span>
                    {statusText && (
                      <span className={`badge text-bg-${n.read ? "secondary" : "info"}`}>
                        {statusText}
                      </span>
                    )}
                  </div>
                  <small style={{ opacity: 0.9 }}>{whenText(n.createdAt)}</small>
                </div>

                {/* Main message */}
                <div className="mt-1">{n.message}</div>

                {/* Optional price signals (legacy/new) */}
                {payload?.proposedPrice != null && (
                  <div className="mt-1" style={{ fontSize: 12, opacity: 0.9 }}>
                    Proposed Price: {peso(payload.proposedPrice)}
                  </div>
                )}
                {payload?.agreementPrice != null && (
                  <div className="mt-1" style={{ fontSize: 12, opacity: 0.9 }}>
                    Agreement Price: {peso(payload.agreementPrice)}
                  </div>
                )}

                {/* Footer actions */}
                <div className="d-flex justify-content-between mt-1">
                  {showCTA && (
                    <Button
                      size="sm"
                      variant="link"
                      className={
                        n.read
                          ? "p-0 text-info text-decoration-underline"
                          : "p-0 text-white text-decoration-underline"
                      }
                      onClick={() => handleLearnMore(n)}
                    >
                      {ctaLabel(n)}
                    </Button>
                  )}

                  {!n.read && (
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 text-white text-decoration-underline"
                      onClick={() => handleMarkAsRead(n._id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DashboardNavbarNotifModal;
