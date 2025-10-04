
// import React, { useState } from "react";
// import { FaBell, FaSignOutAlt } from "react-icons/fa";
// import { Button, Badge } from "react-bootstrap";
// import { useNavigate, useLocation } from "react-router-dom";
// import Swal from "sweetalert2";
// import toast from "react-hot-toast";
// import axios from "axios";
// import "animate.css";
// import DashboardNavbarNotifModal from "./DashboardNavbarNotifModal";
// import { useAuth } from "../../context/AuthContext";
// // import { useCart } from "../../context/CartContext";

// const DashboardNavbar = ({ onLogout, onToggleSidebar }) => {
//   const [showNotifModal, setShowNotifModal] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const { setUser } = useAuth(); // Auth context
//   // const { setCartCount } = useCart(); // Cart context

//   const handleLogout = async () => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You will be logged out!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, logout!",
//       cancelButtonText: "Cancel",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           const userId = localStorage.getItem("userId");
//           if (userId) {
//             await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, { userId });
//           }

//           localStorage.clear();
//           if (setUser) setUser(null);
//           // if (setCartCount) setCartCount(0);
//           toast.success("You have been successfully logged out.");
//           navigate("/", { replace: true });

//           if (onLogout) onLogout();
//         } catch (error) {
//           console.error("Logout error:", error);
//           toast.error("Failed to log out. Please try again.");
//         }
//       }
//     });
//   };

//   const getPageName = () => {
//     const path = location.pathname.split("/").pop();
//     return path.charAt(0).toUpperCase() + path.slice(1);
//   };

//   return (
//     <div className="d-flex justify-content-between align-items-center p-3 bg-white sticky-top z-3">
//       <div className="d-flex align-items-center gap-3">
//         <Button variant="secondary" onClick={onToggleSidebar} title="Toggle Sidebar">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="16" height="16"
//             fill="currentColor"
//             className="bi bi-window-sidebar"
//             viewBox="0 0 16 16"
//           >
//             <path d="M2.5 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m1 .5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
//             <path d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v2H1V3a1 1 0 0 1 1-1zM1 13V6h4v8H2a1 1 0 0 1-1-1m5 1V6h9v7a1 1 0 0 1-1 1z" />
//           </svg>
//         </Button>
//         {/* <h4 className="mb-0 fw-bold text-dark">{getPageName()} Dashboard</h4> */}
//       </div>

//       <div className="d-flex align-items-center gap-3" style={{ marginRight: "100px" }}>
//         <Button
//           variant="light"
//           onClick={() => setShowNotifModal(true)}
//           className={`position-relative ${unreadCount > 0 ? "animate__animated animate__tada" : ""}`}
//         >
//           <FaBell size={20} />
//           {unreadCount > 0 && (
//             <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
//               {unreadCount}
//             </Badge>
//           )}
//         </Button>

//         <Button variant="outline-danger" onClick={handleLogout}>
//           <FaSignOutAlt className="me-1" />
//           Logout
//         </Button>
//       </div>

//       <DashboardNavbarNotifModal
//         show={showNotifModal}
//         onHide={() => setShowNotifModal(false)}
//         setUnreadCount={setUnreadCount}
//       />
//     </div>
//   );
// };

// export default DashboardNavbar;

import React, { useState, useEffect } from "react";
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
  const API_URL = process.env.REACT_APP_API_URL;

  const { setUser } = useAuth(); // Auth context
  // const { setCartCount } = useCart(); // Cart context

  // 🔁 Polling in background every 5s to keep unread count fresh
  useEffect(() => {
    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/notifications`);
        if (!Array.isArray(res.data)) return;

        const adminNotifs = res.data.filter((n) => n.role === "admin");
        const unread = adminNotifs.filter((n) => !n.read).length;

        if (isMounted) {
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Error polling notifications:", err);
      }
    };

    // initial fetch
    fetchUnreadCount();

    // poll every 5 seconds
    const intervalId = setInterval(fetchUnreadCount, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [API_URL]);

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
            await axios.post(`${API_URL}/api/auth/logout`, { userId });
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
        <Button
          variant="secondary"
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-window-sidebar"
            viewBox="0 0 16 16"
          >
            <path d="M2.5 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m1 .5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
            <path d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v2H1V3a1 1 0 0 1 1-1zM1 13V6h4v8H2a1 1 0 0 1-1-1m5 1V6h9v7a1 1 0 0 1-1 1z" />
          </svg>
        </Button>
        {/* <h4 className="mb-0 fw-bold text-dark">{getPageName()} Dashboard</h4> */}
      </div>

      <div
        className="d-flex align-items-center gap-3"
        style={{ marginRight: "100px" }}
      >
        <Button
          variant="light"
          onClick={() => setShowNotifModal(true)}
          className={`position-relative ${
            unreadCount > 0 ? "animate__animated animate__tada" : ""
          }`}
        >
          <FaBell size={20} />
          {unreadCount > 0 && (
            <Badge
              bg="danger"
              pill
              className="position-absolute top-0 start-100 translate-middle"
            >
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
