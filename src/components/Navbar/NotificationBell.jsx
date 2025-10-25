
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
// import Swal from "sweetalert2";
// import "animate.css";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import OrderDetailModal from "../MyOrder/OrderDetailModal";

// // Detail modals used in MyRequest.jsx
// import SellReqDetailModal from "../AdminDashboard/Requests/SellDashboard/ReqDetailModal";
// import DemolishReqDetailModal from "../AdminDashboard/Requests/DemolishDashboard/ReqDetailModal";

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

//   // Sell/Demolish detail modals (same components as MyRequest.jsx)
//   const [showSellModal, setShowSellModal] = useState(false);
//   const [showDemoModal, setShowDemoModal] = useState(false);
//   const [selectedSell, setSelectedSell] = useState(null);
//   const [selectedDemo, setSelectedDemo] = useState(null);

//   const [loadingNotifs, setLoadingNotifs] = useState(false);
//   const [detailLoading, setDetailLoading] = useState(false);

//   // filter by `for`
//   const [forFilter, setForFilter] = useState(""); // "", "order", "sell", "demolish"

//   const navigate = useNavigate();
//   const API_URL = useMemo(() => process.env.REACT_APP_API_URL, []);

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

//   // Prefer potential IDs in a stable order
//   const candidateIds = (n) => {
//     const bag = [
//       n.sellRequestId,
//       n.demolishRequestId,
//       n.requestId,
//       n.itemId,
//       n.orderId,
//       n?.data?.requestId,
//       n?.data?.id,
//       n?.data?.sellRequestId,
//       n?.data?.demolishRequestId,
//       n?._id, // last resort
//     ].filter(Boolean);
//     return [...new Set(bag.map(String))];
//   };

//   const authHeaders = () => {
//     const token = localStorage.getItem("token");
//     return token ? { Authorization: `Bearer ${token}` } : undefined;
//   };

//   // Normalize any array-like API response shape used in your app
//   const normalizeToArray = (raw) => {
//     if (Array.isArray(raw)) return raw;
//     if (Array.isArray(raw?.data)) return raw.data;
//     if (Array.isArray(raw?.requests)) return raw.requests;
//     if (Array.isArray(raw?.sellRequest)) return raw.sellRequest;
//     if (Array.isArray(raw?.items)) return raw.items;
//     return [];
//   };

//   // Match by any common id fields
//   const isMatchByAnyId = (rec, id) => {
//     const target = String(id);
//     const keys = [
//       rec?._id,
//       rec?.id,
//       rec?.requestId,
//       rec?.sellRequestId,
//       rec?.demolishRequestId,
//       rec?.itemId,
//     ]
//       .filter(Boolean)
//       .map(String);
//     return keys.includes(target);
//   };

//   // Try first endpoint that returns a usable object (detail)
//   const tryFirstOkObject = async (paths) => {
//     for (const p of paths) {
//       try {
//         const { data } = await axios.get(`${API_URL}${p}`, { headers: authHeaders() });
//         if (data && typeof data === "object" && !Array.isArray(data)) {
//           // unwrap common shapes if needed
//           if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
//             return data.data;
//           }
//           return data;
//         }
//       } catch {
//         // try next
//       }
//     }
//     return null;
//   };

//   // Try list endpoints then find record by id
//   const tryListsAndFind = async (listPaths, id) => {
//     for (const p of listPaths) {
//       try {
//         const { data } = await axios.get(`${API_URL}${p}`, { headers: authHeaders() });
//         const arr = normalizeToArray(data);
//         if (arr?.length) {
//           const found = arr.find((r) => isMatchByAnyId(r, id));
//           if (found) return found;
//         }
//       } catch {
//         // continue
//       }
//     }
//     return null;
//   };

//   // SELL fetch with fallback to list endpoints
//   const fetchSellById = async (id) => {
//     const detail = await tryFirstOkObject([
//       `/api/sell/${id}`,
//       `/api/sell-requests/${id}`,
//       `/api/sellrequest/${id}`,
//       `/api/sell/requests/${id}`,
//     ]);
//     if (detail) return detail;

//     const fromList = await tryListsAndFind(
//       [
//         "/api/sell-requests",
//         "/api/sell",
//         "/api/sellrequest",
//         "/api/sell/requests",
//       ],
//       id
//     );
//     if (fromList) return fromList;

//     // last-ditch query param attempts (harmless if unsupported)
//     const queryHit = await tryFirstOkObject([
//       `/api/sell?id=${encodeURIComponent(id)}`,
//       `/api/sell-requests?id=${encodeURIComponent(id)}`,
//       `/api/sellrequest?id=${encodeURIComponent(id)}`,
//       `/api/sell/requests?id=${encodeURIComponent(id)}`,
//       `/api/sell?requestId=${encodeURIComponent(id)}`,
//     ]);
//     if (queryHit) return queryHit;

//     throw new Error("Sell request not found.");
//   };

//   // DEMOLISH fetch with fallback to list endpoints
//   const fetchDemolishById = async (id) => {
//     const detail = await tryFirstOkObject([
//       `/api/demolish/${id}`,
//       `/api/demolition/${id}`,
//       `/api/demolitions/${id}`,
//     ]);
//     if (detail) return detail;

//     const fromList = await tryListsAndFind(
//       ["/api/demolition", "/api/demolitions", "/api/demolish"],
//       id
//     );
//     if (fromList) return fromList;

//     const queryHit = await tryFirstOkObject([
//       `/api/demolish?id=${encodeURIComponent(id)}`,
//       `/api/demolition?id=${encodeURIComponent(id)}`,
//       `/api/demolitions?id=${encodeURIComponent(id)}`,
//       `/api/demolish?requestId=${encodeURIComponent(id)}`,
//     ]);
//     if (queryHit) return queryHit;

//     throw new Error("Demolition request not found.");
//   };
//   // -----------------------

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
//           `${API_URL}/api/notifications/users/${userId}/notifications`
//         );
//         const list = Array.isArray(res.data) ? res.data : [];
//         setNotifications(list);
//         const unread = list.filter((n) => !n.read).length;
//         setUnreadCount(unread);
//         if (unread > 0) setStartPolling(true);
//       } catch (err) {
//         console.error("Initial notification fetch failed:", err);
//       } finally {
//         setLoadingNotifs(false);
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
//       Swal.fire("Error", "Failed to mark as read", "error");
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.patch(
//         `${API_URL}/api/notifications/users/${userId}/notifications`,
//         { read: true },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setNotifications((prev) =>
//         prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
//       );
//       setUnreadCount(0);
//       setStartPolling(false);
//     } catch (err) {
//       console.error("Failed to mark all as read:", err);
//       Swal.fire("Error", "Failed to mark all as read", "error");
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

//   // Keep existing order-detail flow, but only for orders
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

//   // Open Sell request modal by ID (same modal used in MyRequest.jsx)
//   const openSellDetail = async (sellId, notifId) => {
//     if (!sellId) return;
//     setShowNotifModal(false);
//     setDetailLoading(true);
//     try {
//       if (notifId) await handleMarkAsRead(notifId);
//       const data = await fetchSellById(sellId);
//       setSelectedSell(data);
//       setShowSellModal(true);
//     } catch (e) {
//       console.error("Failed to fetch sell request:", e);
//       Swal.fire("Error", "Failed to fetch sell request", "error");
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   // Open Demolish request modal by ID (same modal used in MyRequest.jsx)
//   const openDemolishDetail = async (demoId, notifId) => {
//     if (!demoId) return;
//     setShowNotifModal(false);
//     setDetailLoading(true);
//     try {
//       if (notifId) await handleMarkAsRead(notifId);
//       const data = await fetchDemolishById(demoId);
//       setSelectedDemo(data);
//       setShowDemoModal(true);
//     } catch (e) {
//       console.error("Failed to fetch demolish request:", e);
//       Swal.fire("Error", "Failed to fetch demolish request", "error");
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   // "View Request" and "Open" both route to the same modal logic
//   const handleViewRequest = async (n) => {
//     if (!n) return;
//     const kind = getKind(n);
//     const ids = candidateIds(n);

//     if (kind === "sell" && ids.length) {
//       await openSellDetail(ids[0], n._id);
//       return;
//     }
//     if (kind === "demolish" && ids.length) {
//       await openDemolishDetail(ids[0], n._id);
//       return;
//     }
//   };

//   // Unified "Open" action per notification
//   const handleOpenNotification = async (n) => {
//     const kind = getKind(n);
//     const ids = candidateIds(n);
//     const markPromise = !n.read ? handleMarkAsRead(n._id) : Promise.resolve();

//     if (kind === "sell" && ids.length) {
//       await openSellDetail(ids[0], n._id);
//       return;
//     }

//     if (kind === "demolish" && ids.length) {
//       await openDemolishDetail(ids[0], n._id);
//       return;
//     }

//     // Prefer deep link for other kinds
//     if (n.link) {
//       await markPromise;
//       setShowNotifModal(false);
//       navigate(n.link);
//       return;
//     }

//     if (kind === "order" && n.orderId) {
//       await handleViewOrder(n.orderId, n._id);
//       return;
//     }

//     await markPromise;
//     setShowNotifModal(false);
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
//                       <Button
//                         size="small"
//                         variant="text"
//                         color="info"
//                         onClick={() => handleOpenNotification(n)}
//                       >
//                         Open
//                       </Button>

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

//       {/* Sell / Demolish Detail Modals (exactly like MyRequest.jsx) */}
//       {showSellModal && selectedSell && (
//         <SellReqDetailModal
//           request={selectedSell}
//           onClose={() => {
//             setShowSellModal(false);
//             setSelectedSell(null);
//           }}
//         />
//       )}

//       {showDemoModal && selectedDemo && (
//         <DemolishReqDetailModal
//           request={selectedDemo}
//           onClose={() => {
//             setShowDemoModal(false);
//             setSelectedDemo(null);
//           }}
//         />
//       )}

//       {/* Loading Overlays */}
//       {(orderLoading || detailLoading) && (
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
import Swal from "sweetalert2"; // ✅ confirmations only
import toast from "react-hot-toast"; // ✅ general notifications
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
        toast.error("Failed to load notifications.");
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

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/notifications/users/${userId}/notifications`,
        { read: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      toast.error("Failed to mark all as read.");
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);
    setStartPolling(false);
    toast.success("Marked all as read.");
  };

  const handleClearNotifications = async () => {
    // ✅ SweetAlert used ONLY for confirmation
    const confirm = await Swal.fire({
      title: "Clear all notifications?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, clear all",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!confirm.isConfirmed) return;

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
      const res = await axios.get(`${API_URL}/api/orders/${orderId}`);
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

  // "View Request" now redirects to /requests
  const handleViewRequest = async (n) => {
    if (!n) return;
    try {
      if (!n.read) await handleMarkAsRead(n._id);
    } finally {
      setShowNotifModal(false);
      // Route points to <Route path="/requests" element={<MyRequests />} />
      navigate("/requests");
      // If you later want to preselect a tab:
      // const kind = getKind(n); navigate("/requests", { state: { initialTab: kind } });
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
