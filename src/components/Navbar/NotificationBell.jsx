
// import React, { useState, useEffect, useMemo } from "react";
// import { FaBell } from "react-icons/fa";
// import {
//   IconButton,
//   Badge,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   CircularProgress,
//   Typography,
//   Box,
//   Paper,
//   Chip,
//   Stack,
//   Tooltip,
// } from "@mui/material";
// import LocalMallIcon from "@mui/icons-material/LocalMall"; // order
// import SellIcon from "@mui/icons-material/Sell"; // sell
// import ConstructionIcon from "@mui/icons-material/Construction"; // demolish
// import Swal from "sweetalert2"; // ✅ confirmations only
// import toast from "react-hot-toast"; // ✅ general notifications
// import "animate.css";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import OrderDetailModal from "../MyOrder/OrderDetailModal";

// export default function NotificationBell() {
//   const [userId, setUserId] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [startPolling, setStartPolling] = useState(false);
//   const [showNotifModal, setShowNotifModal] = useState(false);

//   // Order detail modal
//   const [showOrderModal, setShowOrderModal] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [orderLoading, setOrderLoading] = useState(false);
//   const [userEmail, setUserEmail] = useState("");

//   const [loadingNotifs, setLoadingNotifs] = useState(false);

//   // filter by `for`
//   const [forFilter, setForFilter] = useState(""); // "", "order", "sell", "demolish"

//   const navigate = useNavigate();
//   const API_URL = useMemo(() => process.env.REACT_APP_API_URL, []);
//   const BASE = `${API_URL}/api/notifications`;

//   // ------- Helpers -------
//   const formatWhen = (dt) => {
//     try {
//       const d = new Date(dt);
//       if (Number.isNaN(d.getTime())) return "";
//       return d.toLocaleString();
//     } catch {
//       return "";
//     }
//   };

//   // Determine canonical kind of notification robustly
//   const getKind = (n) => {
//     const f = (n.for || "").toLowerCase();
//     if (f === "order" || f === "sell" || f === "demolish") return f;

//     const t = (n.type || "").toLowerCase();
//     if (t.includes("sell")) return "sell";
//     if (t.includes("demolish")) return "demolish";
//     if (t.includes("order")) return "order";

//     if (n.sellRequestId) return "sell";
//     if (n.demolishRequestId) return "demolish";
//     if (n.orderId) return "order";
//     return "general";
//   };

//   const typeIcon = (kind) => {
//     if (kind === "order") return <LocalMallIcon fontSize="small" sx={{ mr: 0.75 }} />;
//     if (kind === "sell") return <SellIcon fontSize="small" sx={{ mr: 0.75 }} />;
//     if (kind === "demolish") return <ConstructionIcon fontSize="small" sx={{ mr: 0.75 }} />;
//     return null;
//   };

//   const typeLabel = (kind) => {
//     if (kind === "order") return "Order";
//     if (kind === "sell") return "Sell Request";
//     if (kind === "demolish") return "Demolition";
//     return "General";
//   };

//   const authHeaders = () => {
//     const token = localStorage.getItem("token");
//     return token ? { Authorization: `Bearer ${token}` } : undefined;
//   };

//   // Load userId
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
//   }, [API_URL]);

//   // Fetch initial notifications
//   useEffect(() => {
//     if (!userId) return;

//     const fetchInitial = async () => {
//       setLoadingNotifs(true);
//       try {
//         const res = await axios.get(
//           `${BASE}/users/${userId}/notifications`,
//           { headers: authHeaders() }
//         );
//         const list = Array.isArray(res.data) ? res.data : [];
//         setNotifications(list);
//         const unread = list.filter((n) => !n.read).length;
//         setUnreadCount(unread);
//         if (unread > 0) setStartPolling(true);
//       } catch (err) {
//         console.error("Initial notification fetch failed:", err);
//         toast.error("Failed to load notifications.");
//       } finally {
//         setLoadingNotifs(false);
//       }
//     };

//     fetchInitial();
//   }, [userId, BASE]);

//   // Poll for notifications if unread exists
//   useEffect(() => {
//     if (!userId || !startPolling) return;

//     const poll = async () => {
//       try {
//         const res = await axios.get(
//           `${BASE}/users/${userId}/notifications`,
//           { headers: authHeaders() }
//         );
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
//   }, [userId, startPolling, BASE]);

//   const handleMarkAsRead = async (notifId) => {
//     try {
//       await axios.patch(
//         `${BASE}/users/${userId}/notifications/${notifId}`,
//         { read: true },
//         { headers: authHeaders() }
//       );

//       setNotifications((prev) =>
//         prev.map((n) =>
//           n._id === notifId ? { ...n, read: true, readAt: new Date().toISOString() } : n
//         )
//       );

//       setUnreadCount((prev) => {
//         const next = Math.max(prev - 1, 0);
//         if (next === 0) setStartPolling(false);
//         return next;
//       });
//     } catch (err) {
//       console.error("Failed to mark as read:", err);
//       toast.error("Failed to mark as read.");
//     }
//   };

//   // Bulk mark-all with graceful fallback to per-item PATCH if bulk endpoint is missing (404/405)
//   const handleMarkAllAsRead = async () => {
//     const unreadItems = notifications.filter((n) => !n.read);

//     // Try bulk endpoint first
//     try {
//       await axios.patch(
//         `${BASE}/users/${userId}/notifications`,
//         { read: true },
//         { headers: authHeaders() }
//       );
//     } catch (err) {
//       // If backend doesn't support bulk, fall back to per-item calls
//       const status = err?.response?.status;
//       if (status === 404 || status === 405) {
//         try {
//           await Promise.allSettled(
//             unreadItems.map((n) =>
//               axios.patch(
//                 `${BASE}/users/${userId}/notifications/${n._id}`,
//                 { read: true },
//                 { headers: authHeaders() }
//               )
//             )
//           );
//         } catch (innerErr) {
//           console.error("Fallback mark-all failed:", innerErr);
//           toast.error("Failed to mark all as read.");
//           return;
//         }
//       } else {
//         console.error("Failed to mark all as read:", err);
//         toast.error("Failed to mark all as read.");
//         return;
//       }
//     }

//     // Optimistic UI update
//     setNotifications((prev) =>
//       prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
//     );
//     setUnreadCount(0);
//     setStartPolling(false);
//     toast.success("Marked all as read.");
//   };

//   const handleClearNotifications = async () => {
//     // ✅ SweetAlert used ONLY for confirmation
//     const confirm = await Swal.fire({
//       title: "Clear all notifications?",
//       text: "This action cannot be undone.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, clear all",
//       cancelButtonText: "Cancel",
//       reverseButtons: true,
//       focusCancel: true,
//     });
//     if (!confirm.isConfirmed) return;

//     try {
//       await axios.delete(
//         `${BASE}/users/${userId}/notifications`,
//         { headers: authHeaders() }
//       );
//       setNotifications([]);
//       setUnreadCount(0);
//       setStartPolling(false);
//       toast.success("Notifications cleared.");
//     } catch (err) {
//       console.error("Failed to clear notifications:", err);
//       toast.error("Failed to clear notifications.");
//     }
//   };

//   // Keep existing order-detail flow, but only for orders
//   const handleViewOrder = async (orderId, notifId) => {
//     setShowNotifModal(false);
//     setOrderLoading(true);

//     try {
//       if (notifId) await handleMarkAsRead(notifId);
//       const res = await axios.get(`${API_URL}/api/orders/${orderId}`, {
//         headers: authHeaders(),
//       });
//       setSelectedOrder(res.data);
//       setUserEmail(res.data?.email || "");
//       setShowOrderModal(true);
//     } catch (err) {
//       console.error("Failed to fetch order:", err);
//       toast.error("Failed to fetch order.");
//     } finally {
//       setOrderLoading(false);
//     }
//   };

//   // "View Request" redirects to /requests
//   const handleViewRequest = async (n) => {
//     if (!n) return;
//     try {
//       if (!n.read) await handleMarkAsRead(n._id);
//     } finally {
//       setShowNotifModal(false);
//       // Route points to <Route path="/requests" element={<MyRequests />} />
//       navigate("/requests");
//       // If you later want to preselect a tab:
//       // const kind = getKind(n); navigate("/requests", { state: { initialTab: kind } });
//     }
//   };

//   // === Derived counts & filtered list for the "for" filter ===
//   const counts = useMemo(() => {
//     const c = { order: 0, sell: 0, demolish: 0 };
//     for (const n of notifications) {
//       const k = getKind(n);
//       if (k === "order" || k === "sell" || k === "demolish") c[k]++;
//     }
//     return c;
//   }, [notifications]);

//   const filteredNotifications = useMemo(() => {
//     if (!forFilter) return notifications;
//     return notifications.filter((n) => getKind(n) === forFilter);
//   }, [notifications, forFilter]);

//   if (!userId) return null;

//   return (
//     <Box sx={{ mr: 2 }}>
//       <Tooltip title={unreadCount > 0 ? `${unreadCount} unread` : "Notifications"}>
//         <IconButton
//           onClick={() => setShowNotifModal(true)}
//           className={unreadCount > 0 ? "animate__animated animate__tada" : ""}
//         >
//           <Badge badgeContent={unreadCount} color="error">
//             <FaBell size={20} />
//           </Badge>
//         </IconButton>
//       </Tooltip>

//       {/* Notifications Dialog */}
//       <Dialog
//         open={showNotifModal}
//         onClose={() => setShowNotifModal(false)}
//         fullWidth
//         maxWidth="sm"
//       >
//         <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           Notifications
//           <Stack direction="row" spacing={1}>
//             {notifications.some((n) => !n.read) && (
//               <Button size="small" variant="text" onClick={handleMarkAllAsRead}>
//                 Mark all as read
//               </Button>
//             )}
//             {notifications.length > 0 && (
//               <Button size="small" color="error" variant="text" onClick={handleClearNotifications}>
//                 Clear All
//               </Button>
//             )}
//           </Stack>
//         </DialogTitle>

//         {/* for-filter chips */}
//         <Box sx={{ px: 2, pt: 1 }}>
//           <Stack direction="row" spacing={1} flexWrap="wrap">
//             <Chip
//               label="All"
//               size="small"
//               clickable
//               variant={forFilter ? "outlined" : "filled"}
//               onClick={() => setForFilter("")}
//             />
//             <Chip
//               icon={<LocalMallIcon sx={{ fontSize: 16 }} />}
//               label={`Orders (${counts.order})`}
//               size="small"
//               clickable
//               variant={forFilter === "order" ? "filled" : "outlined"}
//               onClick={() => setForFilter("order")}
//             />
//             <Chip
//               icon={<SellIcon sx={{ fontSize: 16 }} />}
//               label={`Sell (${counts.sell})`}
//               size="small"
//               clickable
//               variant={forFilter === "sell" ? "filled" : "outlined"}
//               onClick={() => setForFilter("sell")}
//             />
//             <Chip
//               icon={<ConstructionIcon sx={{ fontSize: 16 }} />}
//               label={`Demolition (${counts.demolish})`}
//               size="small"
//               clickable
//               variant={forFilter === "demolish" ? "filled" : "outlined"}
//               onClick={() => setForFilter("demolish")}
//             />
//           </Stack>
//         </Box>

//         <DialogContent dividers sx={{ maxHeight: "420px", pt: 1 }}>
//           {loadingNotifs ? (
//             <Box sx={{ py: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <CircularProgress size={28} />
//             </Box>
//           ) : filteredNotifications.length === 0 ? (
//             <Typography
//               variant="body2"
//               color="text.secondary"
//               align="center"
//               sx={{ mt: 2 }}
//             >
//               No notifications
//             </Typography>
//           ) : (
//             filteredNotifications.map((n) => {
//               const kind = getKind(n);
//               return (
//                 <Paper
//                   key={n._id}
//                   sx={{
//                     p: 1.5,
//                     mb: 1,
//                     bgcolor: n.read ? "grey.100" : "grey.800",
//                     color: n.read ? "text.primary" : "#fff",
//                     fontSize: "0.9rem",
//                   }}
//                   elevation={n.read ? 0 : 1}
//                 >
//                   <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5, flexWrap: "wrap" }}>
//                     {typeIcon(kind)}
//                     <Chip
//                       size="small"
//                       label={typeLabel(kind)}
//                       variant={n.read ? "outlined" : "filled"}
//                       sx={{ mr: 1 }}
//                     />
//                     {n.status && (
//                       <Chip
//                         size="small"
//                         label={String(n.status).replace(/_/g, " ")}
//                         variant="outlined"
//                       />
//                     )}
//                     <Typography variant="caption" sx={{ ml: "auto", opacity: 0.85 }}>
//                       {formatWhen(n.createdAt)}
//                     </Typography>
//                   </Stack>

//                   <Typography variant="body2" sx={{ mt: 0.5 }}>
//                     {n.message || "You have a new update."}
//                   </Typography>

//                   <Box display="flex" justifyContent="space-between" mt={1}>
//                     <Stack direction="row" spacing={1}>
//                       {(kind === "sell" || kind === "demolish") && (
//                         <Button
//                           size="small"
//                           variant="text"
//                           color="info"
//                           onClick={() => handleViewRequest(n)}
//                         >
//                           View Request
//                         </Button>
//                       )}

//                       {kind === "order" && n.orderId && (
//                         <Button
//                           size="small"
//                           variant="text"
//                           color="info"
//                           onClick={() => handleViewOrder(n.orderId, n._id)}
//                         >
//                           View Order
//                         </Button>
//                       )}
//                     </Stack>

//                     {!n.read && (
//                       <Button
//                         size="small"
//                         variant="text"
//                         color="inherit"
//                         onClick={() => handleMarkAsRead(n._id)}
//                       >
//                         Mark as Read
//                       </Button>
//                     )}
//                   </Box>
//                 </Paper>
//               );
//             })
//           )}
//         </DialogContent>

//         <DialogActions>
//           <Button variant="outlined" onClick={() => setShowNotifModal(false)}>
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>

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
//           updateParentOrders={(updated) => setSelectedOrder(updated)}
//         />
//       )}

//       {/* Loading Overlay */}
//       {orderLoading && (
//         <Box
//           sx={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             bgcolor: "rgba(0,0,0,0.5)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             zIndex: 1300,
//           }}
//         >
//           <CircularProgress color="inherit" />
//         </Box>
//       )}
//     </Box>
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
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import LocalMallIcon from "@mui/icons-material/LocalMall"; // order
import SellIcon from "@mui/icons-material/Sell"; // sell
import ConstructionIcon from "@mui/icons-material/Construction"; // demolish
import toast from "react-hot-toast";
import "animate.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OrderDetailModal from "../MyOrder/OrderDetailModal";

export default function NotificationBell() {
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [startPolling, setStartPolling] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Order detail modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // filter by `for`
  const [forFilter, setForFilter] = useState(""); // "", "order", "sell", "demolish"

  const navigate = useNavigate();
  const API_URL = useMemo(() => process.env.REACT_APP_API_URL, []);
  const BASE = `${API_URL}/api/notifications`;
  const ROLE = "client"; // 🔒 enforce client-only notifications

  // ------- Helpers -------
  const formatWhen = (dt) => {
    try {
      const d = new Date(dt);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleString();
    } catch {
      return "";
    }
  };

  // Determine canonical kind of notification robustly
  const getKind = (n) => {
    const f = (n.for || "").toLowerCase();
    if (f === "order" || f === "sell" || f === "demolish") return f;

    const t = (n.type || "").toLowerCase();
    if (t.includes("sell")) return "sell";
    if (t.includes("demolish")) return "demolish";
    if (t.includes("order")) return "order";

    if (n.sellRequestId) return "sell";
    if (n.demolishRequestId) return "demolish";
    if (n.orderId) return "order";
    return "general";
  };

  const typeIcon = (kind) => {
    if (kind === "order") return <LocalMallIcon fontSize="small" sx={{ mr: 0.75 }} />;
    if (kind === "sell") return <SellIcon fontSize="small" sx={{ mr: 0.75 }} />;
    if (kind === "demolish") return <ConstructionIcon fontSize="small" sx={{ mr: 0.75 }} />;
    return null;
  };

  const typeLabel = (kind) => {
    if (kind === "order") return "Order";
    if (kind === "sell") return "Sell Request";
    if (kind === "demolish") return "Demolition";
    return "General";
  };

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  // Best-effort role check on object (fallback if backend ignores ?role=client)
  const isClientRole = (n) => {
    const roleField =
      (n.role ||
        n.recipientRole ||
        n.targetRole ||
        n.userRole ||
        n.forRole ||
        "").toString().toLowerCase();
    // If a role-like field exists, require it to be "client". If no role field, accept it (per-user feed).
    return roleField ? roleField === ROLE : true;
  };

  // Load userId
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

  // Fetch initial notifications (role=client)
  useEffect(() => {
    if (!userId) return;

    const fetchInitial = async () => {
      setLoadingNotifs(true);
      try {
        const res = await axios.get(`${BASE}/users/${userId}/notifications`, {
          headers: authHeaders(),
          params: { role: ROLE }, // ✅ server-side filter
        });
        const raw = Array.isArray(res.data) ? res.data : [];
        const list = raw.filter(isClientRole); // ✅ client-side safeguard
        setNotifications(list);
        const unread = list.filter((n) => !n.read).length;
        setUnreadCount(unread);
        if (unread > 0) setStartPolling(true);
      } catch (err) {
        console.error("Initial notification fetch failed:", err);
        toast.error("Failed to load notifications.");
      } finally {
        setLoadingNotifs(false);
      }
    };

    fetchInitial();
  }, [userId, BASE]);

  // Poll for notifications if unread exists (role=client)
  useEffect(() => {
    if (!userId || !startPolling) return;

    const poll = async () => {
      try {
        const res = await axios.get(`${BASE}/users/${userId}/notifications`, {
          headers: authHeaders(),
          params: { role: ROLE }, // ✅ keep filtering on poll
        });
        const raw = Array.isArray(res.data) ? res.data : [];
        const list = raw.filter(isClientRole);
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
  }, [userId, startPolling, BASE]);

  const handleMarkAsRead = async (notifId) => {
    try {
      await axios.patch(
        `${BASE}/users/${userId}/notifications/${notifId}`,
        { read: true },
        {
          headers: authHeaders(),
          params: { role: ROLE }, // ✅ scope to client notifications
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notifId ? { ...n, read: true, readAt: new Date().toISOString() } : n
        )
      );

      setUnreadCount((prev) => {
        const next = Math.max(prev - 1, 0);
        if (next === 0) setStartPolling(false);
        return next;
      });
    } catch (err) {
      console.error("Failed to mark as read:", err);
      toast.error("Failed to mark as read.");
    }
  };

  // Bulk mark-all with graceful fallback; include role=client
  const handleMarkAllAsRead = async () => {
    const unreadItems = notifications.filter((n) => !n.read);

    // Try bulk endpoint first
    try {
      await axios.patch(
        `${BASE}/users/${userId}/notifications`,
        { read: true },
        {
          headers: authHeaders(),
          params: { role: ROLE }, // ✅
        }
      );
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 || status === 405) {
        try {
          await Promise.allSettled(
            unreadItems.map((n) =>
              axios.patch(
                `${BASE}/users/${userId}/notifications/${n._id}`,
                { read: true },
                {
                  headers: authHeaders(),
                  params: { role: ROLE }, // ✅
                }
              )
            )
          );
        } catch (innerErr) {
          console.error("Fallback mark-all failed:", innerErr);
          toast.error("Failed to mark all as read.");
          return;
        }
      } else {
        console.error("Failed to mark all as read:", err);
        toast.error("Failed to mark all as read.");
        return;
      }
    }

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);
    setStartPolling(false);
    toast.success("Marked all as read.");
  };

  // Clear all — role=client
  const handleClearNotifications = async () => {
    try {
      await axios.delete(`${BASE}/users/${userId}/notifications`, {
        headers: authHeaders(),
        params: { role: ROLE }, // ✅
      });
      setNotifications([]);
      setUnreadCount(0);
      setStartPolling(false);
      toast.success("Notifications cleared.");
    } catch (err) {
      console.error("Failed to clear notifications:", err);
      toast.error("Failed to clear notifications.");
    }
  };

  // Keep existing order-detail flow, but only for orders
  const handleViewOrder = async (orderId, notifId) => {
    setShowNotifModal(false);
    setOrderLoading(true);

    try {
      if (notifId) await handleMarkAsRead(notifId);
      const res = await axios.get(`${API_URL}/api/orders/${orderId}`, {
        headers: authHeaders(),
      });
      setSelectedOrder(res.data);
      setUserEmail(res.data?.email || "");
      setShowOrderModal(true);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      toast.error("Failed to fetch order.");
    } finally {
      setOrderLoading(false);
    }
  };

  // "View Request" redirects to /requests
  const handleViewRequest = async (n) => {
    if (!n) return;
    try {
      if (!n.read) await handleMarkAsRead(n._id);
    } finally {
      setShowNotifModal(false);
      navigate("/requests");
    }
  };

  // === Derived counts & filtered list for the "for" filter ===
  const counts = useMemo(() => {
    const c = { order: 0, sell: 0, demolish: 0 };
    for (const n of notifications) {
      const k = getKind(n);
      if (k === "order" || k === "sell" || k === "demolish") c[k]++;
    }
    return c;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (!forFilter) return notifications;
    return notifications.filter((n) => getKind(n) === forFilter);
  }, [notifications, forFilter]);

  if (!userId) return null;

  return (
    <Box sx={{ mr: 2 }}>
      <Tooltip title={unreadCount > 0 ? `${unreadCount} unread` : "Notifications"}>
        <IconButton
          onClick={() => setShowNotifModal(true)}
          className={unreadCount > 0 ? "animate__animated animate__tada" : ""}
        >
          <Badge badgeContent={unreadCount} color="error">
            <FaBell size={20} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Notifications Dialog */}
      <Dialog
        open={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { bgcolor: "background.paper", color: "text.primary" } }}
      >
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          Notifications
          <Stack direction="row" spacing={1}>
            {notifications.some((n) => !n.read) && (
              <Button size="small" variant="text" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button size="small" color="error" variant="text" onClick={handleClearNotifications}>
                Clear All
              </Button>
            )}
          </Stack>
        </DialogTitle>

        {/* for-filter chips */}
        <Box sx={{ px: 2, pt: 1 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label="All"
              size="small"
              clickable
              variant={forFilter ? "outlined" : "filled"}
              onClick={() => setForFilter("")}
            />
            <Chip
              icon={<LocalMallIcon sx={{ fontSize: 16 }} />}
              label={`Orders (${counts.order})`}
              size="small"
              clickable
              variant={forFilter === "order" ? "filled" : "outlined"}
              onClick={() => setForFilter("order")}
            />
            <Chip
              icon={<SellIcon sx={{ fontSize: 16 }} />}
              label={`Sell (${counts.sell})`}
              size="small"
              clickable
              variant={forFilter === "sell" ? "filled" : "outlined"}
              onClick={() => setForFilter("sell")}
            />
            <Chip
              icon={<ConstructionIcon sx={{ fontSize: 16 }} />}
              label={`Demolition (${counts.demolish})`}
              size="small"
              clickable
              variant={forFilter === "demolish" ? "filled" : "outlined"}
              onClick={() => setForFilter("demolish")}
            />
          </Stack>
        </Box>

        <DialogContent
          dividers
          sx={{ maxHeight: "420px", pt: 1, bgcolor: "background.default" }}
        >
          {loadingNotifs ? (
            <Box
              sx={{ py: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <CircularProgress size={28} />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              No notifications
            </Typography>
          ) : (
            filteredNotifications.map((n) => {
              const kind = getKind(n);
              return (
                <Paper
                  key={n._id}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    bgcolor: n.read ? "grey.50" : "grey.100",
                    color: "text.primary",
                    fontSize: "0.9rem",
                    border: "1px solid",
                    borderColor: n.read ? "grey.200" : "primary.light",
                    borderLeft: "4px solid",
                    borderLeftColor: n.read ? "grey.300" : "primary.main",
                  }}
                  elevation={n.read ? 0 : 1}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 0.5, flexWrap: "wrap" }}
                  >
                    {typeIcon(kind)}
                    <Chip
                      size="small"
                      label={typeLabel(kind)}
                      variant={n.read ? "outlined" : "filled"}
                      sx={{ mr: 1 }}
                    />
                    {n.status && (
                      <Chip
                        size="small"
                        label={String(n.status).replace(/_/g, " ")}
                        variant="outlined"
                      />
                    )}
                    <Typography variant="caption" sx={{ ml: "auto", opacity: 0.85 }}>
                      {formatWhen(n.createdAt)}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {n.message || "You have a new update."}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Stack direction="row" spacing={1}>
                      {(kind === "sell" || kind === "demolish") && (
                        <Button
                          size="small"
                          variant="text"
                          color="info"
                          onClick={() => handleViewRequest(n)}
                        >
                          View Request
                        </Button>
                      )}

                      {kind === "order" && n.orderId && (
                        <Button
                          size="small"
                          variant="text"
                          color="info"
                          onClick={() => handleViewOrder(n.orderId, n._id)}
                        >
                          View Order
                        </Button>
                      )}
                    </Stack>

                    {!n.read && (
                      <Button
                        size="small"
                        variant="text"
                        color="primary"
                        onClick={() => handleMarkAsRead(n._id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </Box>
                </Paper>
              );
            })
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
