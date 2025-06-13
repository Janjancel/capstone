
// import React, { useState, useEffect } from "react";
// import { FaBell } from "react-icons/fa";
// import { Button, Badge, Modal, Spinner } from "react-bootstrap";
// import {
//   doc,
//   updateDoc,
//   onSnapshot,
//   collection,
//   query,
//   orderBy,
//   deleteDoc,
//   getDoc,
// } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";
// import { db, auth } from "../../firebase/firebase";
// import Swal from "sweetalert2";
// import "animate.css";
// import OrderDetailModal from "../MyOrder/OrderDetailModal";

// export default function NotificationBell() {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [showNotifModal, setShowNotifModal] = useState(false);
//   const [showOrderModal, setShowOrderModal] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [userEmail, setUserEmail] = useState("");
//   const [orderLoading, setOrderLoading] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUserId(user.uid);
//         setUserEmail(user.email || "");
//       } else {
//         setUserId(null);
//         setNotifications([]);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (!userId) return;

//     const q = query(
//       collection(db, "users", userId, "notifications"),
//       orderBy("createdAt", "desc")
//     );

//     const unsub = onSnapshot(q, (snapshot) => {
//       const data = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setNotifications(data);
//       setUnreadCount(data.filter((n) => !n.read).length);
//     });

//     return () => unsub();
//   }, [userId]);

//   const handleMarkAsRead = async (notification) => {
//     try {
//       await updateDoc(
//         doc(db, "users", userId, "notifications", notification.id),
//         { read: true }
//       );
//     } catch (error) {
//       console.error("Error marking as read:", error);
//       Swal.fire("Error", "Failed to mark as read.", "error");
//     }
//   };

//   const handleClearNotifications = async () => {
//     try {
//       const refs = notifications.map((n) =>
//         doc(db, "users", userId, "notifications", n.id)
//       );
//       await Promise.all(refs.map((ref) => deleteDoc(ref)));
//       setNotifications([]);
//       setUnreadCount(0);
//     } catch (error) {
//       console.error("Error clearing notifications:", error);
//       Swal.fire("Error", "Failed to clear notifications.", "error");
//     }
//   };

//   const handleViewOrder = async (orderId, notifId) => {
//     setShowNotifModal(false);
//     setOrderLoading(true);

//     // Mark as read before fetching order
//     try {
//       if (notifId) {
//         await updateDoc(
//           doc(db, "users", userId, "notifications", notifId),
//           { read: true }
//         );
//       }

//       const orderRef = doc(db, "orders", orderId);
//       const orderSnap = await getDoc(orderRef);
//       if (orderSnap.exists()) {
//         setSelectedOrder({ id: orderSnap.id, ...orderSnap.data() });
//         setShowOrderModal(true);
//       } else {
//         Swal.fire("Not Found", "Order not found.", "info");
//       }
//     } catch (error) {
//       console.error("Error fetching order:", error);
//       Swal.fire("Error", "Failed to fetch order details.", "error");
//     } finally {
//       setOrderLoading(false);
//     }
//   };

//   return (
//     <div className="me-3">
//       <Button
//         variant="light"
//         onClick={() => setShowNotifModal(true)}
//         className={`position-relative ${
//           unreadCount > 0 ? "animate__animated animate__tada" : ""
//         }`}
//       >
//         <FaBell size={20} />
//         {unreadCount > 0 && (
//           <Badge
//             bg="danger"
//             pill
//             className="position-absolute top-0 start-100 translate-middle"
//           >
//             {unreadCount}
//           </Badge>
//         )}
//       </Button>

//       <Modal show={showNotifModal} onHide={() => setShowNotifModal(false)} centered scrollable>
//         <Modal.Header closeButton>
//           <Modal.Title className="w-100 d-flex justify-content-between align-items-center">
//             Notifications
//             {notifications.length > 0 && (
//               <Button
//                 variant="link"
//                 className="p-0 text-danger"
//                 onClick={handleClearNotifications}
//               >
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
//                 key={n.id}
//                 className={`border rounded mb-2 p-2 small ${
//                   n.read ? "bg-light" : "bg-secondary text-white"
//                 }`}
//               >
//                 <div>{n.message}</div>

//                 <div className="d-flex justify-content-between mt-1">
//                   {n.orderId && (
//                     <Button
//                       size="sm"
//                       variant="link"
//                       className="p-0 text-info text-decoration-underline"
//                       onClick={() => handleViewOrder(n.orderId, n.id)}
//                     >
//                       View Order
//                     </Button>
//                   )}

//                   {!n.read && (
//                     <Button
//                       size="sm"
//                       variant="link"
//                       className="p-0 text-light text-decoration-underline"
//                       onClick={() => handleMarkAsRead(n)}
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

//       {/* Order Detail Modal */}
//       {selectedOrder && (
//         <OrderDetailModal
//           show={showOrderModal}
//           onClose={() => {
//             setShowOrderModal(false);
//             setSelectedOrder(null);
//           }}
//           order={selectedOrder}
//           userEmail={userEmail}
//           updateParentOrders={(updatedOrder) => {
//             setSelectedOrder(updatedOrder);
//           }}
//         />
//       )}

//       {/* Optional loading overlay */}
//       {orderLoading && (
//         <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center" style={{ zIndex: 1050 }}>
//           <Spinner animation="border" variant="light" />
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { Button, Badge, Modal, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import "animate.css";
import axios from "axios";
import OrderDetailModal from "../MyOrder/OrderDetailModal";

export default function NotificationBell() {
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const API_BASE = "http://localhost:5000";

  // ✅ Load current userId
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
          const res = await axios.get(`${API_BASE}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?._id) {
            localStorage.setItem("userId", res.data._id);
            setUserId(res.data._id);
          }
        } catch (err) {
          console.warn("Auth token invalid");
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        }
      }
    };

    loadUserId();
  }, []);

  // ✅ Poll notifications
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/notifications/users/${userId}/notifications`);
        const notifList = Array.isArray(res.data) ? res.data : [];
        setNotifications(notifList);
        setUnreadCount(notifList.filter(n => !n.read).length);
      } catch (err) {
        console.error("Notification fetch failed:", err);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 3000);
    return () => clearInterval(intervalId);
  }, [userId]);

  const handleMarkAsRead = async (notifId) => {
    try {
      await axios.patch(`${API_BASE}/api/notifications/users/${userId}/notifications/${notifId}`, { read: true });
      setNotifications(prev =>
        prev.map(n => (n._id === notifId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      Swal.fire("Error", "Failed to mark as read", "error");
    }
  };

  const handleClearNotifications = async () => {
    try {
      await axios.delete(`${API_BASE}/api/notifications/users/${userId}/notifications`);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      Swal.fire("Error", "Failed to clear notifications", "error");
    }
  };

  const handleViewOrder = async (orderId, notifId) => {
    setShowNotifModal(false);
    setOrderLoading(true);

    try {
      if (notifId) await handleMarkAsRead(notifId);
      const res = await axios.get(`${API_BASE}/api/orders/${orderId}`);
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
    <div className="me-3">
      <Button
        variant="light"
        onClick={() => setShowNotifModal(true)}
        className={`position-relative ${unreadCount > 0 ? "animate__animated animate__tada" : ""}`}
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
            {unreadCount}
          </Badge>
        )}
      </Button>

      <Modal show={showNotifModal} onHide={() => setShowNotifModal(false)} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="w-100 d-flex justify-content-between align-items-center">
            Notifications
            {notifications.length > 0 && (
              <Button variant="link" className="p-0 text-danger" onClick={handleClearNotifications}>
                Clear All
              </Button>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <div className="text-muted text-center">No notifications</div>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                className={`border rounded mb-2 p-2 small ${n.read ? "bg-light" : "bg-secondary text-white"}`}
              >
                <div>{n.message}</div>
                <div className="d-flex justify-content-between mt-1">
                  {n.orderId && (
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 text-info text-decoration-underline"
                      onClick={() => handleViewOrder(n.orderId, n._id)}
                    >
                      View Order
                    </Button>
                  )}
                  {!n.read && (
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 text-light text-decoration-underline"
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
          <Button variant="secondary" onClick={() => setShowNotifModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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

      {orderLoading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center" style={{ zIndex: 1050 }}>
          <Spinner animation="border" variant="light" />
        </div>
      )}
    </div>
  );
}
