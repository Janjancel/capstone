
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
// } from "@mui/material";
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

//   // Memoize API_URL so linter doesn't complain
//   const API_URL = useMemo(() => process.env.REACT_APP_API_URL, []);

//   // Load userId from localStorage or API
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
//       try {
//         const res = await axios.get(
//           `${API_URL}/api/notifications/users/${userId}/notifications`
//         );
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
//   }, [userId, API_URL]);

//   // Poll for notifications if unread exists
//   useEffect(() => {
//     if (!userId || !startPolling) return;

//     const poll = async () => {
//       try {
//         const res = await axios.get(
//           `${API_URL}/api/notifications/users/${userId}/notifications`
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
//   }, [userId, startPolling, API_URL]);

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
//       await axios.delete(
//         `${API_URL}/api/notifications/users/${userId}/notifications`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
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
//     <Box sx={{ mr: 2 }}>
//       <IconButton
//         onClick={() => setShowNotifModal(true)}
//         className={unreadCount > 0 ? "animate__animated animate__tada" : ""}
//       >
//         <Badge badgeContent={unreadCount} color="error">
//           <FaBell size={20} />
//         </Badge>
//       </IconButton>

//       {/* Notifications Dialog */}
//       <Dialog
//         open={showNotifModal}
//         onClose={() => setShowNotifModal(false)}
//         fullWidth
//         maxWidth="sm"
//       >
//         <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
//           Notifications
//           {notifications.length > 0 && (
//             <Button
//               color="error"
//               variant="text"
//               onClick={handleClearNotifications}
//             >
//               Clear All
//             </Button>
//           )}
//         </DialogTitle>

//         <DialogContent dividers sx={{ maxHeight: "400px" }}>
//           {notifications.length === 0 ? (
//             <Typography
//               variant="body2"
//               color="text.secondary"
//               align="center"
//               sx={{ mt: 2 }}
//             >
//               No notifications
//             </Typography>
//           ) : (
//             notifications.map((n) => (
//               <Paper
//                 key={n._id}
//                 sx={{
//                   p: 1.5,
//                   mb: 1,
//                   bgcolor: n.read ? "grey.100" : "grey.800",
//                   color: n.read ? "text.primary" : "#fff",
//                   fontSize: "0.85rem",
//                 }}
//               >
//                 <div>{n.message}</div>
//                 <Box display="flex" justifyContent="space-between" mt={1}>
//                   {n.orderId && (
//                     <Button
//                       size="small"
//                       variant="text"
//                       color="info"
//                       onClick={() => handleViewOrder(n.orderId, n._id)}
//                     >
//                       View Order
//                     </Button>
//                   )}
//                   {!n.read && (
//                     <Button
//                       size="small"
//                       variant="text"
//                       color="inherit"
//                       onClick={() => handleMarkAsRead(n._id)}
//                     >
//                       Mark as Read
//                     </Button>
//                   )}
//                 </Box>
//               </Paper>
//             ))
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


// src/components/Notifications/NotificationBell.jsx
// src/components/Notifications/NotificationBell.jsx
// src/components/Notifications/NotificationBell.jsx
// src/components/Notifications/NotificationBell.jsx
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
import Swal from "sweetalert2";
import "animate.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OrderDetailModal from "../MyOrder/OrderDetailModal";
// Detail modals used in MyRequest.jsx (adjust paths if your structure differs)
import SellReqDetailModal from "../AdminDashboard/Requests/SellDashboard/ReqDetailModal";
import DemolishReqDetailModal from "../AdminDashboard/Requests/DemolishDashboard/ReqDetailModal";

export default function NotificationBell() {
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [startPolling, setStartPolling] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Order detail modal (kept intact)
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Detail modals for sell/demolish like in MyRequest.jsx
  const [showSellModal, setShowSellModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedSell, setSelectedSell] = useState(null);
  const [selectedDemo, setSelectedDemo] = useState(null);

  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // NEW: filter by `for`
  const [forFilter, setForFilter] = useState(""); // "", "order", "sell", "demolish"

  const navigate = useNavigate();
  const API_URL = useMemo(() => process.env.REACT_APP_API_URL, []);

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
  // -----------------------

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

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return;

    const fetchInitial = async () => {
      setLoadingNotifs(true);
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
      } finally {
        setLoadingNotifs(false);
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
        prev.map((n) => (n._id === notifId ? { ...n, read: true, readAt: new Date().toISOString() } : n))
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

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/notifications/users/${userId}/notifications`,
        { read: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
      setStartPolling(false);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      Swal.fire("Error", "Failed to mark all as read", "error");
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

  // Keep existing order-detail flow, but only for orders
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

  // ===== Helpers to fetch a specific request by ID (sell/demolish) =====
  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  const tryFetch = async (paths) => {
    for (const p of paths) {
      try {
        const { data } = await axios.get(`${API_URL}${p}`, {
          headers: authHeaders(),
        });
        if (data && typeof data === "object") return data;
      } catch {
        // try next path
      }
    }
    throw new Error("No matching endpoint responded.");
  };

  const fetchSellById = async (id) =>
    tryFetch([
      `/api/sell/${id}`,
      `/api/sell-requests/${id}`,
      `/api/sellrequest/${id}`,
      `/api/sell/requests/${id}`,
    ]);

  const fetchDemolishById = async (id) =>
    tryFetch([
      `/api/demolish/${id}`,
      `/api/demolition/${id}`,
      `/api/demolitions/${id}`,
    ]);

  // Open Sell request modal by ID
  const openSellDetail = async (sellId, notifId) => {
    if (!sellId) return;
    setShowNotifModal(false);
    setDetailLoading(true);
    try {
      if (notifId) await handleMarkAsRead(notifId);
      const data = await fetchSellById(sellId);
      setSelectedSell(data);
      setShowSellModal(true);
    } catch (e) {
      console.error("Failed to fetch sell request:", e);
      Swal.fire("Error", "Failed to fetch sell request", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  // Open Demolish request modal by ID
  const openDemolishDetail = async (demoId, notifId) => {
    if (!demoId) return;
    setShowNotifModal(false);
    setDetailLoading(true);
    try {
      if (notifId) await handleMarkAsRead(notifId);
      const data = await fetchDemolishById(demoId);
      setSelectedDemo(data);
      setShowDemoModal(true);
    } catch (e) {
      console.error("Failed to fetch demolish request:", e);
      Swal.fire("Error", "Failed to fetch demolish request", "error");
    } finally {
      setDetailLoading(false);
    }
  };
  // ====================================================================

  // Explicit "View Request" function
  const handleViewRequest = async (n) => {
    if (!n) return;
    const kind = getKind(n);

    if (kind === "sell") {
      const sellId = n.sellRequestId || n.requestId || n.itemId || n.orderId; // legacy fallback
      await openSellDetail(sellId, n._id);
      return;
    }
    if (kind === "demolish") {
      const demoId = n.demolishRequestId || n.requestId || n.itemId || n.orderId; // legacy fallback
      await openDemolishDetail(demoId, n._id);
      return;
    }
    if (kind === "order" && n.orderId) {
      await handleViewOrder(n.orderId, n._id);
    }
  };

  // Unified "Open" action per notification (no SweetAlert notice)
  const handleOpenNotification = async (n) => {
    const kind = getKind(n);
    const markPromise = !n.read ? handleMarkAsRead(n._id) : Promise.resolve();

    if (kind === "sell") {
      const sellId = n.sellRequestId || n.requestId || n.itemId || n.orderId;
      await openSellDetail(sellId, n._id);
      return;
    }

    if (kind === "demolish") {
      const demoId = n.demolishRequestId || n.requestId || n.itemId || n.orderId;
      await openDemolishDetail(demoId, n._id);
      return;
    }

    // Prefer deep link for other kinds
    if (n.link) {
      await markPromise;
      setShowNotifModal(false);
      navigate(n.link);
      return;
    }

    if (kind === "order" && n.orderId) {
      await handleViewOrder(n.orderId, n._id);
      return;
    }

    await markPromise;
    setShowNotifModal(false);
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
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

        {/* NEW: for-filter chips */}
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

        <DialogContent dividers sx={{ maxHeight: "420px", pt: 1 }}>
          {loadingNotifs ? (
            <Box sx={{ py: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={28} />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 2 }}
            >
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
                    bgcolor: n.read ? "grey.100" : "grey.800",
                    color: n.read ? "text.primary" : "#fff",
                    fontSize: "0.9rem",
                  }}
                  elevation={n.read ? 0 : 1}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5, flexWrap: "wrap" }}>
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
                        label={n.status.replace(/_/g, " ")}
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
                      <Button
                        size="small"
                        variant="text"
                        color="info"
                        onClick={() => handleOpenNotification(n)}
                      >
                        Open
                      </Button>

                      {/* "View Request" for Sell/Demolish */}
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

                      {/* "View Order" strictly for orders */}
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
                        color="inherit"
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

      {/* Order Detail Modal (kept intact) */}
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

      {/* Sell / Demolish Detail Modals (from MyRequest.jsx) */}
      {showSellModal && selectedSell && (
        <SellReqDetailModal
          request={selectedSell}
          onClose={() => {
            setShowSellModal(false);
            setSelectedSell(null);
          }}
        />
      )}

      {showDemoModal && selectedDemo && (
        <DemolishReqDetailModal
          request={selectedDemo}
          onClose={() => {
            setShowDemoModal(false);
            setSelectedDemo(null);
          }}
        />
      )}

      {/* Loading Overlays */}
      {(orderLoading || detailLoading) && (
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
