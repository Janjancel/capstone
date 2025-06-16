import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const DashboardNavbarNotifModal = ({ show, onHide, setUnreadCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications`);
      const adminNotifs = res.data.filter(n => n.role === "admin");
      setNotifications(adminNotifs);
      setUnreadCount(adminNotifs.filter(n => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) fetchNotifications();
  }, [show]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Error marking as read:", err);
      Swal.fire("Error", "Failed to mark as read.", "error");
    }
  };

  const handleClearNotifications = async () => {
    try {
      await axios.delete(`${API_URL}/api/notifications/clear`);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error clearing notifications:", err);
      Swal.fire("Error", "Failed to clear notifications.", "error");
    }
  };

  const handleLearnMore = (notification) => {
    if (notification.type === "cancel_request") {
      navigate("/admin/orders");
    }
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="w-100 d-flex justify-content-between align-items-center">
          Admin Notifications
          {notifications.length > 0 && (
            <Button variant="link" className="text-danger p-0" onClick={handleClearNotifications}>
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
              className={`border rounded mb-2 p-2 small ${n.read ? "bg-light" : "bg-secondary text-white"}`}
            >
              <div>{n.message}</div>
              <div className="d-flex justify-content-between mt-1">
                {n.type === "cancel_request" && (
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 text-info text-decoration-underline"
                    onClick={() => handleLearnMore(n)}
                  >
                    Learn More
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
