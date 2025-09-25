import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const DashboardNavbarNotifModal = ({ show, onHide, setUnreadCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch notifications (admin only)
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications`);
      const adminNotifs = Array.isArray(res.data)
        ? res.data.filter((n) => n.role === "admin")
        : [];

      setNotifications(adminNotifs);

      const unread = adminNotifs.filter((n) => !n.read).length;
      setUnreadCount(unread);
      if (unread > 0) setPolling(true);
      else setPolling(false);
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
  }, [show]);

  // Poll if unread exists
  useEffect(() => {
    if (!polling) return;
    const intervalId = setInterval(fetchNotifications, 3000);
    return () => clearInterval(intervalId);
  }, [polling]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => {
        const next = Math.max(prev - 1, 0);
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

  const handleLearnMore = (notification) => {
    if (notification.type === "cancel_request") {
      navigate("/admin/orders");
    } else if (notification.type === "sell_request") {
      navigate("/sellDashboard");
    } else if (notification.type === "demolish_request") {
      navigate("/demolishDashboard");
    }
    onHide();
  };

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
          notifications.map((n) => (
            <div
              key={n._id}
              className={`border rounded mb-2 p-2 small ${
                n.read ? "bg-light text-dark" : "bg-secondary text-white"
              }`}
            >
              <div>{n.message}</div>
              <div className="d-flex justify-content-between mt-1">
                {n.orderId && (
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 text-info text-decoration-underline"
                    onClick={() => handleLearnMore(n)}
                  >
                    {n.type === "sell_request"
                      ? "View Request"
                      : n.type === "demolish_request"
                      ? "View Demolition"
                      : "View Order"}
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
          ))
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
