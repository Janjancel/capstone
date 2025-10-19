// src/components/DashboardNavbar/DashboardNavbarNotifModal.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const DashboardNavbarNotifModal = ({ show, onHide, setUnreadCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const navigate = useNavigate();

  // Keep env usage stable
  const API_URL = useMemo(() => process.env.REACT_APP_API_URL, []);

  // --- Helpers (model-agnostic) ---

  // Map legacy `type` or new `for` to a normalized area
  const getArea = (n) => {
    if (n?.for) return n.for; // "order" | "sell" | "demolish"
    // Legacy fallbacks using `type`
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

  // Decide route, prefer deep link
  const resolveRoute = (n) => {
    if (n?.link) return n.link;

    const area = getArea(n);
    if (area === "order") {
      // If you have a details route, you can swap `/admin/orders` to `/admin/orders/${n.orderId}`
      return "/admin/orders";
    }
    if (area === "sell") {
      // If you have an id route, e.g. `/sellDashboard/:id`, you can use n.sellRequestId
      return "/sellDashboard";
    }
    if (area === "demolish") {
      // If you have an id route, e.g. `/demolishDashboard/:id`, you can use n.demolishRequestId
      return "/demolishDashboard";
    }
    return "/"; // fallback
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

  // --- Data fetching / polling ---

  // Fetch notifications (admin only)
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications`);
      const list = Array.isArray(res.data) ? res.data : [];

      // Admin-only filter still intact
      const adminNotifs = list.filter((n) => n.role === "admin");

      // Sort by newest first if backend doesn't sort
      adminNotifs.sort((a, b) => {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return db - da;
      });

      setNotifications(adminNotifs);

      const unread = adminNotifs.filter((n) => !n.read).length;
      setUnreadCount(unread);
      setPolling(unread > 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when modal opens
  useEffect(() => {
    if (show) {
      setLoading(true);
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Poll if unread exists
  useEffect(() => {
    if (!polling) return undefined;
    const id = setInterval(fetchNotifications, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polling]);

  // --- Actions ---

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );

      setUnreadCount((prev) => {
        const next = Math.max((typeof prev === "number" ? prev : 0) - 1, 0);
        if (next === 0) setPolling(false);
        return next;
      });
    } catch (err) {
      console.error("Error marking as read:", err);
      Swal.fire("Error", "Failed to mark as read", "error");
    }
  };

  const handleClearNotifications = async () => {
    try {
      await axios.delete(`${API_URL}/api/notifications/clear`);
      setNotifications([]);
      setUnreadCount(0);
      setPolling(false);
    } catch (err) {
      console.error("Error clearing notifications:", err);
      Swal.fire("Error", "Failed to clear notifications", "error");
    }
  };

  const handleLearnMore = async (notification) => {
    try {
      // Mark as read optimistically (don't block nav)
      if (!notification.read) {
        handleMarkAsRead(notification._id);
      }

      // Backward-compatibility for legacy type-based routing
      const legacyType = (notification.type || "").toLowerCase();
      if (
        legacyType === "cancel_request" ||
        legacyType === "order_update"
      ) {
        navigate("/admin/orders");
      } else if (
        legacyType === "sell_request" ||
        legacyType === "sell_update"
      ) {
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

  // Price payload: support both legacy `data` and new `payload`
  const getPayload = (n) => n?.data || n?.payload || {};

  return (
    <Modal show={show} onHide={onHide} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="w-100 d-flex justify-content-between align-items-center">
          Admin Notifications
          {notifications.length > 0 && (
            <Button
              variant="link"
              className="text-danger p-0"
              onClick={handleClearNotifications}
            >
              Clear All
            </Button>
          )}
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
