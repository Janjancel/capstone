// import React, { useState, useEffect, useRef } from "react";
// import { FaBell, FaSignOutAlt } from "react-icons/fa";
// import {
//   Overlay,
//   Popover,
//   Button,
//   Badge,
// } from "react-bootstrap";
// import { useNavigate, useLocation } from "react-router-dom";
// import { signOut } from "firebase/auth";
// import {
//   doc,
//   updateDoc,
//   onSnapshot,
//   collection,
//   query,
//   orderBy,
//   deleteDoc,
// } from "firebase/firestore";
// import Swal from "sweetalert2";
// import toast from "react-hot-toast";
// import { auth, db } from "../../firebase/firebase";
// import "animate.css";

// const DashboardNavbar = ({ onLogout, onToggleSidebar }) => {
//   const [showPopover, setShowPopover] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const bellRef = useRef(null);
//   const popoverRef = useRef(null);

//   useEffect(() => {
//     const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
//     const unsub = onSnapshot(q, (snapshot) => {
//       const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setNotifications(data);
//       setUnreadCount(data.filter(n => !n.read).length);
//     });

//     return () => unsub();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         popoverRef.current &&
//         !popoverRef.current.contains(e.target) &&
//         !bellRef.current.contains(e.target)
//       ) {
//         setShowPopover(false);
//       }
//     };

//     if (showPopover) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.removeEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showPopover]);

//   const handleToggle = () => {
//     setShowPopover((prev) => !prev);
//     if (unreadCount > 0) {
//       notifications.forEach((n) => {
//         if (!n.read) {
//           updateDoc(doc(db, "notifications", n.id), { read: true });
//         }
//       });
//       setUnreadCount(0);
//     }
//   };

//   const handleLogout = async () => {
//     const confirm = await Swal.fire({
//       title: "Are you sure?",
//       text: "You will be logged out.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, logout",
//       cancelButtonText: "Cancel",
//     });

//     if (confirm.isConfirmed) {
//       try {
//         const uid = localStorage.getItem("uid");
//         if (uid) {
//           await updateDoc(doc(db, "users", uid), {
//             status: "offline",
//             lastLogout: new Date(),
//           });
//         }
//         await signOut(auth);
//         localStorage.clear();
//         toast.success("You have been logged out successfully.");
//         navigate("/", { replace: true });
//       } catch (error) {
//         console.error("Logout error:", error);
//         toast.error("Failed to log out. Please try again.");
//       }
//     }
//   };

//   const handleClearNotifications = async () => {
//     try {
//       const notificationRefs = notifications.map((n) => doc(db, "notifications", n.id));
//       await Promise.all(notificationRefs.map((ref) => deleteDoc(ref)));
//       setNotifications([]);
//       setUnreadCount(0);
//     } catch (error) {
//       console.error("Error clearing notifications:", error);
//       Swal.fire("Error", "Failed to clear notifications. Please try again.", "error");
//     }
//   };

//   const handleLearnMore = (notification) => {
//     if (notification.type === "cancel_request") {
//       navigate("/admin/orders");
//     }
//     setShowPopover(false);
//   };

//   const popover = (
//     <Popover id="notifications-popover" ref={popoverRef} style={{ maxWidth: "320px" }}>
//       <Popover.Header as="h5" className="d-flex justify-content-between align-items-center">
//         Notifications
//         {notifications.length > 0 && (
//           <Button
//             variant="link"
//             className="ms-2 p-0 text-muted"
//             onClick={handleClearNotifications}
//           >
//             Clear All
//           </Button>
//         )}
//       </Popover.Header>
//       <Popover.Body>
//         {notifications.length === 0 ? (
//           <div className="text-muted">No notifications</div>
//         ) : (
//           notifications.map((n) => (
//             <div key={n.id} className="border-bottom pb-2 mb-2 small">
//               <div>{n.message}</div>
//               {n.type === "cancel_request" && (
//                 <div className="mt-1">
//                   <Button
//                     size="sm"
//                     variant="link"
//                     className="p-0 text-primary"
//                     onClick={() => handleLearnMore(n)}
//                   >
//                     Learn More
//                   </Button>
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </Popover.Body>
//     </Popover>
//   );

//   const getPageName = () => {
//     const path = location.pathname.split("/").pop();
//     return path.charAt(0).toUpperCase() + path.slice(1);
//   };

//   return (
//     <div className="d-flex justify-content-between align-items-center p-3 bg-white sticky-top z-3">
//       <div className="d-flex align-items-center gap-3">
//         <Button variant="secondary" onClick={onToggleSidebar} title="Toggle Sidebar">
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
//             className="bi bi-window-sidebar" viewBox="0 0 16 16">
//             <path d="M2.5 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m1 .5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
//             <path d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v2H1V3a1 1 0 0 1 1-1zM1 13V6h4v8H2a1 1 0 0 1-1-1m5 1V6h9v7a1 1 0 0 1-1 1z" />
//           </svg>
//         </Button>
//         <h4 className="mb-0 fw-bold text-dark">{getPageName()} Dashboard</h4>
//       </div>

//       <div className="d-flex align-items-center gap-3" style={{ marginRight: "100px" }}>
//         <div ref={bellRef}>
//           <Button
//             variant="light"
//             onClick={handleToggle}
//             className={`position-relative ${unreadCount > 0 ? "animate__animated animate__tada" : ""}`}
//           >
//             <FaBell size={20} />
//             {unreadCount > 0 && (
//               <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
//                 {unreadCount}
//               </Badge>
//             )}
//           </Button>
//           <Overlay target={bellRef.current} show={showPopover} placement="bottom">
//             {popover}
//           </Overlay>
//         </div>

//         <Button variant="outline-danger" onClick={handleLogout}>
//           <FaSignOutAlt className="me-1" />
//           Logout
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default DashboardNavbar;

import React, { useState } from "react";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import { Button, Badge } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import axios from "axios";
import "animate.css";
import DashboardNavbarNotifModal from "./DashboardNavbarNotifModal";
import { useAuth } from "../../context/AuthContext";
// import { useCart } from "../../context/CartContext";

const DashboardNavbar = ({ onLogout, onToggleSidebar }) => {
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const { setUser } = useAuth(); // Auth context
  // const { setCartCount } = useCart(); // Cart context

  const handleLogout = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const userId = localStorage.getItem("userId");
          if (userId) {
            await axios.post("http://localhost:5000/api/auth/logout", { userId });
          }

          localStorage.clear();
          if (setUser) setUser(null);
          // if (setCartCount) setCartCount(0);
          toast.success("You have been successfully logged out.");
          navigate("/", { replace: true });

          if (onLogout) onLogout();
        } catch (error) {
          console.error("Logout error:", error);
          toast.error("Failed to log out. Please try again.");
        }
      }
    });
  };

  const getPageName = () => {
    const path = location.pathname.split("/").pop();
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="d-flex justify-content-between align-items-center p-3 bg-white sticky-top z-3">
      <div className="d-flex align-items-center gap-3">
        <Button variant="secondary" onClick={onToggleSidebar} title="Toggle Sidebar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16" height="16"
            fill="currentColor"
            className="bi bi-window-sidebar"
            viewBox="0 0 16 16"
          >
            <path d="M2.5 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m1 .5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
            <path d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v2H1V3a1 1 0 0 1 1-1zM1 13V6h4v8H2a1 1 0 0 1-1-1m5 1V6h9v7a1 1 0 0 1-1 1z" />
          </svg>
        </Button>
        <h4 className="mb-0 fw-bold text-dark">{getPageName()} Dashboard</h4>
      </div>

      <div className="d-flex align-items-center gap-3" style={{ marginRight: "100px" }}>
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

        <Button variant="outline-danger" onClick={handleLogout}>
          <FaSignOutAlt className="me-1" />
          Logout
        </Button>
      </div>

      <DashboardNavbarNotifModal
        show={showNotifModal}
        onHide={() => setShowNotifModal(false)}
        setUnreadCount={setUnreadCount}
      />
    </div>
  );
};

export default DashboardNavbar;
