
// import React, { useState, useEffect } from "react";
// import { FaBell } from "react-icons/fa";
// import { Button, Badge, Modal, Spinner } from "react-bootstrap";
// import Swal from "sweetalert2";
// import "animate.css";
// import axios from "axios";
// import OrderDetailModal from "../MyOrder/OrderDetailModal";

// export default function NotificationBell() {
//   const [userId, setUserId] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [startPolling, setStartPolling] = useState(false);
//   const [showNotifModal, setShowNotifModal] = useState(false);
//   const [showOrderModal, setShowOrderModal] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [orderLoading, setOrderLoading] = useState(false);
//   const [userEmail, setUserEmail] = useState("");

//   const API_URL = process.env.REACT_APP_API_URL;

//   useEffect(() => {
//     const loadUserId = async () => {
//       const storedId = localStorage.getItem("userId");
//       const token = localStorage.getItem("token");

//       if (storedId) {
//         setUserId(storedId);
//         return;
//       }

//       if (token) {
//         try {
//           const res = await axios.get(`${API_URL}/api/users/me`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           if (res.data?._id) {
//             localStorage.setItem("userId", res.data._id);
//             setUserId(res.data._id);
//           }
//         } catch {
//           console.warn("Auth token invalid");
//           localStorage.removeItem("token");
//           localStorage.removeItem("userId");
//         }
//       }
//     };

//     loadUserId();
//   }, []);

//   useEffect(() => {
//     if (!userId) return;

//     const fetchInitial = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/notifications/users/${userId}/notifications`);
//         const list = Array.isArray(res.data) ? res.data : [];
//         setNotifications(list);
//         const unread = list.filter((n) => !n.read).length;
//         setUnreadCount(unread);
//         if (unread > 0) setStartPolling(true);
//       } catch (err) {
//         console.error("Initial notification fetch failed:", err);
//       }
//     };

//     fetchInitial();
//   }, [userId]);

//   useEffect(() => {
//     if (!userId || !startPolling) return;

//     const poll = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/notifications/users/${userId}/notifications`);
//         const list = Array.isArray(res.data) ? res.data : [];
//         setNotifications(list);
//         const unread = list.filter((n) => !n.read).length;
//         setUnreadCount(unread);
//         if (unread === 0) setStartPolling(false);
//       } catch (err) {
//         console.error("Polling error:", err);
//       }
//     };

//     const intervalId = setInterval(poll, 3000);
//     return () => clearInterval(intervalId);
//   }, [userId, startPolling]);

//   const handleMarkAsRead = async (notifId) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.patch(
//         `${API_URL}/api/notifications/users/${userId}/notifications/${notifId}`,
//         { read: true },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setNotifications((prev) =>
//         prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
//       );

//       setUnreadCount((prev) => {
//         const next = Math.max(prev - 1, 0);
//         if (next === 0) setStartPolling(false);
//         return next;
//       });
//     } catch (err) {
//       console.error("Failed to mark as read:", err);
//       Swal.fire("Error", "Failed to mark as read", "error");
//     }
//   };

//   const handleClearNotifications = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`${API_URL}/api/notifications/users/${userId}/notifications`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setNotifications([]);
//       setUnreadCount(0);
//       setStartPolling(false);
//     } catch (err) {
//       Swal.fire("Error", "Failed to clear notifications", "error");
//     }
//   };

//   const handleViewOrder = async (orderId, notifId) => {
//     setShowNotifModal(false);
//     setOrderLoading(true);

//     try {
//       if (notifId) await handleMarkAsRead(notifId);
//       const res = await axios.get(`${API_URL}/api/orders/${orderId}`);
//       setSelectedOrder(res.data);
//       setUserEmail(res.data?.email || "");
//       setShowOrderModal(true);
//     } catch (err) {
//       Swal.fire("Error", "Failed to fetch order", "error");
//     } finally {
//       setOrderLoading(false);
//     }
//   };

//   if (!userId) return null;

//   return (
//     <div className="me-3">
//       <Button
//         variant="light"
//         onClick={() => setShowNotifModal(true)}
//         className={`position-relative ${unreadCount > 0 ? "animate__animated animate__tada" : ""}`}
//       >
//         <FaBell size={20} />
//         {unreadCount > 0 && (
//           <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
//             {unreadCount}
//           </Badge>
//         )}
//       </Button>

//       <Modal show={showNotifModal} onHide={() => setShowNotifModal(false)} centered scrollable>
//         <Modal.Header closeButton>
//           <Modal.Title className="w-100 d-flex justify-content-between align-items-center">
//             Notifications
//             {notifications.length > 0 && (
//               <Button variant="link" className="p-0 text-danger" onClick={handleClearNotifications}>
//                 Clear All
//               </Button>
//             )}
//           </Modal.Title>
//         </Modal.Header>

//         <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
//           {notifications.length === 0 ? (
//             <div className="text-muted text-center">No notifications</div>
//           ) : (
//             notifications.map((n) => (
//               <div
//                 key={n._id}
//                 className={`border rounded mb-2 p-2 small ${n.read ? "bg-light" : "bg-secondary text-white"}`}
//               >
//                 <div>{n.message}</div>
//                 <div className="d-flex justify-content-between mt-1">
//                   {n.orderId && (
//                     <Button
//                       size="sm"
//                       variant="link"
//                       className="p-0 text-info text-decoration-underline"
//                       onClick={() => handleViewOrder(n.orderId, n._id)}
//                     >
//                       View Order
//                     </Button>
//                   )}
//                   {!n.read && (
//                     <Button
//                       size="sm"
//                       variant="link"
//                       className="p-0 text-light text-decoration-underline"
//                       onClick={() => handleMarkAsRead(n._id)}
//                     >
//                       Mark as Read
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             ))
//           )}
//         </Modal.Body>

//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowNotifModal(false)}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {selectedOrder && (
//         <OrderDetailModal
//           show={showOrderModal}
//           onClose={() => {
//             setShowOrderModal(false);
//             setSelectedOrder(null);
//           }}
//           order={selectedOrder}
//           userEmail={userEmail}
//           updateParentOrders={(updated) => setSelectedOrder(updated)}
//         />
//       )}

//       {orderLoading && (
//         <div
//           className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
//           style={{ zIndex: 1050 }}
//         >
//           <Spinner animation="border" variant="light" />
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect, useMemo } from "react";
import { FaBell } from "react-icons/fa";
import {
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import Swal from "sweetalert2";
import "animate.css";
import axios from "axios";
import OrderDetailModal from "../MyOrder/OrderDetailModal";

export default function NotificationBell() {
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [startPolling, setStartPolling] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Memoize API_URL so linter doesn't complain
  const API_URL = useMemo(() => process.env.REACT_APP_API_URL, []);

  // Load userId from localStorage or API
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

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return;

    const fetchInitial = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/notifications/users/${userId}/notifications`
        );
        const list = Array.isArray(res.data) ? res.data : [];
        setNotifications(list);
        const unread = list.filter((n) => !n.read).length;
        setUnreadCount(unread);
        if (unread > 0) setStartPolling(true);
      } catch (err) {
        console.error("Initial notification fetch failed:", err);
      }
    };

    fetchInitial();
  }, [userId, API_URL]);

  // Poll for notifications if unread exists
  useEffect(() => {
    if (!userId || !startPolling) return;

    const poll = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/notifications/users/${userId}/notifications`
        );
        const list = Array.isArray(res.data) ? res.data : [];
        setNotifications(list);
        const unread = list.filter((n) => !n.read).length;
        setUnreadCount(unread);
        if (unread === 0) setStartPolling(false);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const intervalId = setInterval(poll, 3000);
    return () => clearInterval(intervalId);
  }, [userId, startPolling, API_URL]);

  const handleMarkAsRead = async (notifId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/notifications/users/${userId}/notifications/${notifId}`,
        { read: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );

      setUnreadCount((prev) => {
        const next = Math.max(prev - 1, 0);
        if (next === 0) setStartPolling(false);
        return next;
      });
    } catch (err) {
      console.error("Failed to mark as read:", err);
      Swal.fire("Error", "Failed to mark as read", "error");
    }
  };

  const handleClearNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/api/notifications/users/${userId}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications([]);
      setUnreadCount(0);
      setStartPolling(false);
    } catch (err) {
      Swal.fire("Error", "Failed to clear notifications", "error");
    }
  };

  const handleViewOrder = async (orderId, notifId) => {
    setShowNotifModal(false);
    setOrderLoading(true);

    try {
      if (notifId) await handleMarkAsRead(notifId);
      const res = await axios.get(`${API_URL}/api/orders/${orderId}`);
      setSelectedOrder(res.data);
      setUserEmail(res.data?.email || "");
      setShowOrderModal(true);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch order", "error");
    } finally {
      setOrderLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <Box sx={{ mr: 2 }}>
      <IconButton
        onClick={() => setShowNotifModal(true)}
        className={unreadCount > 0 ? "animate__animated animate__tada" : ""}
      >
        <Badge badgeContent={unreadCount} color="error">
          <FaBell size={20} />
        </Badge>
      </IconButton>

      {/* Notifications Dialog */}
      <Dialog
        open={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          Notifications
          {notifications.length > 0 && (
            <Button
              color="error"
              variant="text"
              onClick={handleClearNotifications}
            >
              Clear All
            </Button>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ maxHeight: "400px" }}>
          {notifications.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 2 }}
            >
              No notifications
            </Typography>
          ) : (
            notifications.map((n) => (
              <Paper
                key={n._id}
                sx={{
                  p: 1.5,
                  mb: 1,
                  bgcolor: n.read ? "grey.100" : "grey.800",
                  color: n.read ? "text.primary" : "#fff",
                  fontSize: "0.85rem",
                }}
              >
                <div>{n.message}</div>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  {n.orderId && (
                    <Button
                      size="small"
                      variant="text"
                      color="info"
                      onClick={() => handleViewOrder(n.orderId, n._id)}
                    >
                      View Order
                    </Button>
                  )}
                  {!n.read && (
                    <Button
                      size="small"
                      variant="text"
                      color="inherit"
                      onClick={() => handleMarkAsRead(n._id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </Box>
              </Paper>
            ))
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={() => setShowNotifModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          show={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          userEmail={userEmail}
          updateParentOrders={(updated) => setSelectedOrder(updated)}
        />
      )}

      {/* Loading Overlay */}
      {orderLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1300,
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
    </Box>
  );
}
