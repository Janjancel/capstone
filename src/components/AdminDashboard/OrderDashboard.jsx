
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import toast from "react-hot-toast";
// import InVoice from "./InVoice";

// // Material UI imports
// import {
//   Box,
//   Button,
//   CircularProgress,
//   TextField,
//   Chip,
//   Tabs,
//   Tab,
//   Card,
//   CardContent,
//   Typography,
//   Divider,
// } from "@mui/material";

// // Keep Bootstrap Pagination ONLY
// import { Pagination } from "react-bootstrap";

// const OrderDashboard = () => {
//   const [orders, setOrders] = useState([]); // orders enriched with userEmail
//   const [userData, setUserData] = useState({}); // { [userId]: { email } } cache
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchEmail, setSearchEmail] = useState("");
//   const [statusTab, setStatusTab] = useState("All");
//   const [showInvoice, setShowInvoice] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 5;
//   const intervalRef = useRef(null);
//   const API_URL = process.env.REACT_APP_API_URL;

//   // --- Helpers ---------------------------------------------------------------
//   const STATUS_API_MAP = {
//     pending: "pending",
//     processing: "processing",
//     shipped: "shipped",
//     delivered: "delivered",
//     "cancellation requested": "cancellation_requested",
//     "cancellation request": "cancellation_requested",
//     "cancel requested": "cancellation_requested",
//     "cancel request": "cancellation_requested",
//     cancelled: "cancelled",
//     cancelled_: "cancelled",
//   };
//   const toApiStatus = (label) => {
//     const key = String(label || "").trim().toLowerCase();
//     return STATUS_API_MAP[key] || key.replace(/\s+/g, "_");
//   };

//   // Map API statuses (snake_case) -> friendly UI label
//   const apiToUi = (apiStatus) => {
//     if (!apiStatus) return "Pending";
//     const s = String(apiStatus).toLowerCase();
//     switch (s) {
//       case "pending":
//         return "Pending";
//       case "processing":
//         return "Processing";
//       case "shipped":
//         return "Shipped";
//       case "delivered":
//         return "Delivered";
//       case "cancellation_requested":
//       case "cancel_requested":
//         return "Cancellation Request";
//       case "cancelled":
//         return "Cancelled";
//       default:
//         // fallback: convert snake_case to Title Case
//         return s.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
//     }
//   };

//   const getAuthHeaders = () => {
//     const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   };

//   /**
//    * Enrich orders with userEmail. We prefer:
//    * - order.userEmail (if backend already provided)
//    * - cached userData[userId].email
//    * - fetched via GET /api/users/:id
//    * - fallback: order.email or "Unknown"
//    */
//   const enrichOrdersWithEmails = async (ordersList) => {
//     const list = Array.isArray(ordersList) ? ordersList : [];

//     // Identify which userIds still need fetching
//     const missingIds = Array.from(
//       new Set(
//         list
//           .filter(
//             (o) =>
//               o &&
//               o.userId &&
//               !o.userEmail &&
//               !(userData[o.userId] && userData[o.userId].email)
//           )
//           .map((o) => o.userId)
//       )
//     );

//     let fetched = {};
//     if (missingIds.length > 0) {
//       try {
//         const results = await Promise.all(
//           missingIds.map((id) =>
//             axios
//               .get(`${API_URL}/api/users/${id}`, { headers: getAuthHeaders() })
//               .then((r) => ({ id, email: r?.data?.email || "Unknown" }))
//               .catch(() => ({ id, email: "Unknown" }))
//           )
//         );
//         fetched = results.reduce((acc, { id, email }) => {
//           acc[id] = { email };
//           return acc;
//         }, {});
//         // Merge into cache so subsequent polls don't refetch
//         setUserData((prev) => ({ ...prev, ...fetched }));
//       } catch (e) {
//         // ignore – we still return best-effort emails below
//       }
//     }

//     // Build final list with userEmail attached
//     return list.map((o) => ({
//       ...o,
//       userEmail:
//         o.userEmail ||
//         (o.userId && (userData[o.userId]?.email || fetched[o.userId]?.email)) ||
//         o.email ||
//         "Unknown",
//     }));
//   };

//   // Fetch orders (polls every 3s). Always enrich with userEmail before set.
//   const fetchOrders = async () => {
//     try {
//       const res = await axios.get(`${API_URL}/api/orders`, { headers: getAuthHeaders() });
//       const sorted = (Array.isArray(res.data) ? res.data : []).sort(
//         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//       );
//       const enriched = await enrichOrdersWithEmails(sorted);
//       setOrders(enriched);
//       setLoading(false);
//       setError("");
//     } catch (err) {
//       console.error("Failed to fetch orders:", err);
//       setError("Failed to fetch orders.");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//     intervalRef.current = setInterval(fetchOrders, 3000);
//     return () => clearInterval(intervalRef.current);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleShowInvoice = (order) => {
//     setSelectedOrder({
//       ...order,
//       userEmail: order.userEmail || (order.userId && userData[order.userId]?.email) || "Unknown",
//     });
//     setShowInvoice(true);
//   };

//   const handleCloseInvoice = () => {
//     setShowInvoice(false);
//     setSelectedOrder(null);
//   };

//   const handleStatusChange = async (order, newStatusLabel) => {
//     const uiLabel = String(newStatusLabel || "").trim();
//     const apiStatus = toApiStatus(uiLabel);

//     const confirm = await Swal.fire({
//       title: `Update status to "${uiLabel}"?`,
//       text: "This action cannot be undone.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, update it!",
//     });

//     if (!confirm.isConfirmed) return;

//     try {
//       // 1) Update order status (authoritative)
//       await axios.put(
//         `${API_URL}/api/orders/${order._id}/status`,
//         { status: apiStatus },
//         { headers: getAuthHeaders() }
//       );

//       // 2) Create a notification (with for:"order")
//       await axios.post(
//         `${API_URL}/api/notifications`,
//         {
//           orderId: order._id,
//           userId: order.userId,
//           for: "order", // ★ required
//           status: apiStatus,
//           role: "client",
//           message: `Your order (${order.orderId || order._id}) status is now "${uiLabel}".`,
//         },
//         { headers: getAuthHeaders() }
//       );

//       // 3) Sales record and feedback notification when delivered
//       if (apiStatus === "delivered") {
//         await axios.post(
//           `${API_URL}/api/sales`,
//           {
//             orderId: order._id,
//             userId: order.userId,
//             total: order.total,
//             items: order.items,
//             deliveredAt: new Date(),
//           },
//           { headers: getAuthHeaders() }
//         );

//         // Send feedback notification to client
//         await axios.post(
//           `${API_URL}/api/notifications`,
//           {
//             orderId: order._id,
//             userId: order.userId,
//             for: "order",
//             status: apiStatus,
//             role: "client",
//             message:
//               "We’re grateful you chose us. Your experience matters to us. Please take a moment to leave your feedback so we can serve you better.",
//           },
//           { headers: getAuthHeaders() }
//         );
//       }

//       toast.success(`Order marked as ${uiLabel}.`);
//       fetchOrders();
//     } catch (err) {
//       console.error("Status update failed:", err);
//       toast.error("Failed to update order status.");
//     }
//   };

//   const handleApproveCancellation = async (order) => {
//     handleStatusChange(order, "Cancelled");
//   };

//   const getStatusColor = (apiStatus) => {
//     const s = String(apiStatus || "").toLowerCase();
//     switch (s) {
//       case "pending":
//         return "default";
//       case "processing":
//         return "primary";
//       case "shipped":
//         return "info";
//       case "delivered":
//         return "success";
//       case "cancellation_requested":
//       case "cancel_requested":
//         return "warning";
//       case "cancelled":
//         return "error";
//       default:
//         return "default";
//     }
//   };

//   // compute UI label for filtering and comparison
//   const filteredOrders = orders.filter((o) => {
//     const emailValue = (o.userEmail || "").toLowerCase();
//     const emailMatch = emailValue.includes(searchEmail.toLowerCase());
//     const uiStatus = apiToUi(o.status).toLowerCase();
//     const statusMatch =
//       statusTab === "All" || uiStatus === statusTab.toLowerCase();
//     return emailMatch && statusMatch;
//   });

//   const totalPages = Math.ceil(filteredOrders.length / pageSize);
//   const currentOrders = filteredOrders.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   // compute disabled states for action buttons
//   const computeActionDisabled = (order) => {
//     const apiStatus = String(order.status || "pending").toLowerCase();

//     const isDelivered = apiStatus === "delivered";
//     const isCancelled = apiStatus === "cancelled";
//     const isFinal = isDelivered || isCancelled;

//     const isCancellationRequested =
//       apiStatus === "cancellation_requested" || apiStatus === "cancel_requested";

//     // Mark Shipped:
//     // - disabled if final
//     // - disabled if already shipped or delivered or cancellation requested
//     const shippedDisabled = isFinal || apiStatus === "shipped" || isCancellationRequested;

//     // Mark Delivered:
//     // - disabled if final
//     // - disabled when order is currently Pending (cannot deliver a pending order)
//     // - disabled if already delivered
//     const deliveredDisabled =
//       isFinal || apiStatus === "delivered" || apiStatus === "pending";

//     // Approve Cancellation:
//     // - only enabled when cancellation requested
//     const approveCancellationDisabled = !isCancellationRequested;

//     return {
//       shippedDisabled,
//       deliveredDisabled,
//       approveCancellationDisabled,
//       isFinal,
//       isCancellationRequested,
//     };
//   };

//   return (
//     <Box className="mt-4 container">
//       <Typography variant="h5" gutterBottom>
//         Order Dashboard
//       </Typography>

//       {/* Tabs */}
//       <Tabs
//         value={statusTab}
//         onChange={(e, val) => setStatusTab(val)}
//         textColor="primary"
//         indicatorColor="primary"
//         sx={{ mb: 2 }}
//       >
//         {/* Reordered as requested: Cancellation Request before Cancelled */}
//         {["All", "Pending", "Cancellation Request", "Cancelled", "Shipped", "Delivered"].map(
//           (status) => (
//             <Tab key={status} label={status} value={status} />
//           )
//         )}
//       </Tabs>

//       {/* Search + Export */}
//       <Box display="flex" justifyContent="space-between" mb={2}>
//         <TextField
//           label="Search by email"
//           variant="outlined"
//           size="small"
//           value={searchEmail}
//           onChange={(e) => setSearchEmail(e.target.value)}
//           sx={{ width: 300 }}
//         />
//         <Button
//           variant="contained"
//           color="success"
//           onClick={() => {
//             const headers = ["Order ID", "Email", "Order Date", "Total", "Status"];
//             const rows = filteredOrders.map((o) => [
//               o.orderId || o._id, // show human-readable ID if available
//               o.userEmail || "Unknown",
//               new Date(o.createdAt).toLocaleString(),
//               o.total,
//               apiToUi(o.status),
//             ]);
//             const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
//             const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//             const url = URL.createObjectURL(blob);
//             const link = document.createElement("a");
//             link.href = url;
//             link.download = "orders.csv";
//             link.click();
//           }}
//         >
//           Export to CSV
//         </Button>
//       </Box>

//       {loading ? (
//         <Box display="flex" justifyContent="center">
//           <CircularProgress />
//         </Box>
//       ) : error ? (
//         <Typography color="error" align="center">
//           {error}
//         </Typography>
//       ) : filteredOrders.length === 0 ? (
//         <Typography align="center">No orders found.</Typography>
//       ) : (
//         <>
//           {currentOrders.map((order) => {
//             const apiStatus = String(order.status || "pending").toLowerCase();
//             const uiStatusLabel = apiToUi(apiStatus);
//             const statusColor = getStatusColor(apiStatus);

//             const {
//               shippedDisabled,
//               deliveredDisabled,
//               approveCancellationDisabled,
//               isFinal,
//               isCancellationRequested,
//             } = computeActionDisabled(order);

//             return (
//               <Card key={order._id} variant="outlined" sx={{ mb: 2, p: 2 }}>
//                 <CardContent>
//                   {/* Display orderId (fallback to _id) */}
//                   <Typography variant="h6">
//                     Order ID: {order.orderId || order._id}
//                   </Typography>
//                   <Typography>
//                     <strong>Order Date:</strong>{" "}
//                     {new Date(order.createdAt).toLocaleString()}
//                   </Typography>
//                   <Typography>
//                     <strong>Email:</strong> {order.userEmail || "Unknown"}
//                   </Typography>

//                   <Divider sx={{ my: 1 }} />

//                   <Typography variant="subtitle1">Items:</Typography>
//                   <ul>
//                     {order.items?.map((item, i) => (
//                       <li key={i}>
//                         <strong>{item.name}</strong> (Qty: {item.quantity}) – ₱
//                         {(item.quantity * parseFloat(item.price || 0)).toFixed(2)}
//                       </li>
//                     ))}
//                   </ul>

//                   <Box
//                     display="flex"
//                     justifyContent="space-between"
//                     alignItems="center"
//                     mt={2}
//                   >
//                     <Box>
//                       <Typography>
//                         <strong>Total:</strong> ₱
//                         {parseFloat(order.total || 0).toFixed(2)}
//                       </Typography>
//                       <Box display="flex" alignItems="center" gap={1}>
//                         <Typography>
//                           <strong>Status:</strong>
//                         </Typography>
//                         <Chip
//                           label={uiStatusLabel}
//                           color={statusColor}
//                         />
//                       </Box>

//                       {!isFinal && (
//                         <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
//                           <Button
//                             variant="outlined"
//                             color="info"
//                             size="small"
//                             onClick={() => handleStatusChange(order, "Shipped")}
//                             disabled={shippedDisabled}
//                           >
//                             Mark Shipped
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             color="success"
//                             size="small"
//                             onClick={() => handleStatusChange(order, "Delivered")}
//                             disabled={deliveredDisabled}
//                           >
//                             Mark Delivered
//                           </Button>
//                           <Button
//                             variant="contained"
//                             color="error"
//                             size="small"
//                             onClick={() => handleApproveCancellation(order)}
//                             disabled={approveCancellationDisabled}
//                             sx={{ display: isCancellationRequested ? "inline-flex" : "none" }}
//                           >
//                             Approve Cancellation
//                           </Button>
//                         </Box>
//                       )}
//                     </Box>
//                     <Button
//                       variant="outlined"
//                       color="primary"
//                       onClick={() => handleShowInvoice(order)}
//                     >
//                       View Details
//                     </Button>
//                   </Box>
//                 </CardContent>
//               </Card>
//             );
//           })}

//           {/* Pagination (Bootstrap) */}
//           <Box display="flex" justifyContent="center" mt={3}>
//             <Pagination>
//               {Array.from({ length: totalPages }, (_, i) => (
//                 <Pagination.Item
//                   key={i + 1}
//                   active={i + 1 === currentPage}
//                   onClick={() => setCurrentPage(i + 1)}
//                 >
//                   {i + 1}
//                 </Pagination.Item>
//               ))}
//             </Pagination>
//           </Box>
//         </>
//       )}

//       <InVoice show={showInvoice} handleClose={handleCloseInvoice} order={selectedOrder} />
//     </Box>
//   );
// };

// export default OrderDashboard;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import InVoice from "./InVoice";

// Material UI imports
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Divider,
} from "@mui/material";

// Keep Bootstrap Pagination ONLY
import { Pagination } from "react-bootstrap";

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]); // orders enriched with userEmail
  const [userData, setUserData] = useState({}); // { [userId]: { email } } cache
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [statusTab, setStatusTab] = useState("All");
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const intervalRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;

  // NEW: date range filter for orders
  const [dateFrom, setDateFrom] = useState(""); // "YYYY-MM-DD"
  const [dateTo, setDateTo] = useState(""); // "YYYY-MM-DD"

  // --- Helpers ---------------------------------------------------------------
  const STATUS_API_MAP = {
    pending: "pending",
    processing: "processing",
    shipped: "shipped",
    delivered: "delivered",
    "cancellation requested": "cancellation_requested",
    "cancellation request": "cancellation_requested",
    "cancel requested": "cancellation_requested",
    "cancel request": "cancellation_requested",
    cancelled: "cancelled",
    cancelled_: "cancelled",
  };
  const toApiStatus = (label) => {
    const key = String(label || "").trim().toLowerCase();
    return STATUS_API_MAP[key] || key.replace(/\s+/g, "_");
  };

  // Map API statuses (snake_case) -> friendly UI label
  const apiToUi = (apiStatus) => {
    if (!apiStatus) return "Pending";
    const s = String(apiStatus).toLowerCase();
    switch (s) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancellation_requested":
      case "cancel_requested":
        return "Cancellation Request";
      case "cancelled":
        return "Cancelled";
      default:
        // fallback: convert snake_case to Title Case
        return s.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
    }
  };

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /**
   * Enrich orders with userEmail. We prefer:
   * - order.userEmail (if backend already provided)
   * - cached userData[userId].email
   * - fetched via GET /api/users/:id
   * - fallback: order.email or "Unknown"
   */
  const enrichOrdersWithEmails = async (ordersList) => {
    const list = Array.isArray(ordersList) ? ordersList : [];

    // Identify which userIds still need fetching
    const missingIds = Array.from(
      new Set(
        list
          .filter(
            (o) =>
              o &&
              o.userId &&
              !o.userEmail &&
              !(userData[o.userId] && userData[o.userId].email)
          )
          .map((o) => o.userId)
      )
    );

    let fetched = {};
    if (missingIds.length > 0) {
      try {
        const results = await Promise.all(
          missingIds.map((id) =>
            axios
              .get(`${API_URL}/api/users/${id}`, { headers: getAuthHeaders() })
              .then((r) => ({ id, email: r?.data?.email || "Unknown" }))
              .catch(() => ({ id, email: "Unknown" }))
          )
        );
        fetched = results.reduce((acc, { id, email }) => {
          acc[id] = { email };
          return acc;
        }, {});
        // Merge into cache so subsequent polls don't refetch
        setUserData((prev) => ({ ...prev, ...fetched }));
      } catch (e) {
        // ignore – we still return best-effort emails below
      }
    }

    // Build final list with userEmail attached
    return list.map((o) => ({
      ...o,
      userEmail:
        o.userEmail ||
        (o.userId && (userData[o.userId]?.email || fetched[o.userId]?.email)) ||
        o.email ||
        "Unknown",
    }));
  };

  // Fetch orders (polls every 3s). Always enrich with userEmail before set.
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders`, { headers: getAuthHeaders() });
      const sorted = (Array.isArray(res.data) ? res.data : []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      const enriched = await enrichOrdersWithEmails(sorted);
      setOrders(enriched);
      setLoading(false);
      setError("");
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to fetch orders.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 3000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShowInvoice = (order) => {
    setSelectedOrder({
      ...order,
      userEmail: order.userEmail || (order.userId && userData[order.userId]?.email) || "Unknown",
    });
    setShowInvoice(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (order, newStatusLabel) => {
    const uiLabel = String(newStatusLabel || "").trim();
    const apiStatus = toApiStatus(uiLabel);

    const confirm = await Swal.fire({
      title: `Update status to "${uiLabel}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      // 1) Update order status (authoritative)
      await axios.put(
        `${API_URL}/api/orders/${order._id}/status`,
        { status: apiStatus },
        { headers: getAuthHeaders() }
      );

      // 2) Create a notification (with for:"order")
      await axios.post(
        `${API_URL}/api/notifications`,
        {
          orderId: order._id,
          userId: order.userId,
          for: "order", // ★ required
          status: apiStatus,
          role: "client",
          message: `Your order (${order.orderId || order._id}) status is now "${uiLabel}".`,
        },
        { headers: getAuthHeaders() }
      );

      // 3) Sales record and feedback notification when delivered
      if (apiStatus === "delivered") {
        await axios.post(
          `${API_URL}/api/sales`,
          {
            orderId: order._id,
            userId: order.userId,
            total: order.total,
            items: order.items,
            deliveredAt: new Date(),
          },
          { headers: getAuthHeaders() }
        );

        // Send feedback notification to client
        await axios.post(
          `${API_URL}/api/notifications`,
          {
            orderId: order._id,
            userId: order.userId,
            for: "order",
            status: apiStatus,
            role: "client",
            message:
              "We’re grateful you chose us. Your experience matters to us. Please take a moment to leave your feedback so we can serve you better.",
          },
          { headers: getAuthHeaders() }
        );
      }

      toast.success(`Order marked as ${uiLabel}.`);
      fetchOrders();
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update order status.");
    }
  };

  const handleApproveCancellation = async (order) => {
    handleStatusChange(order, "Cancelled");
  };

  const getStatusColor = (apiStatus) => {
    const s = String(apiStatus || "").toLowerCase();
    switch (s) {
      case "pending":
        return "default";
      case "processing":
        return "primary";
      case "shipped":
        return "info";
      case "delivered":
        return "success";
      case "cancellation_requested":
      case "cancel_requested":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  // compute UI label for filtering and comparison
  const filteredOrders = orders.filter((o) => {
    const emailValue = (o.userEmail || "").toLowerCase();
    const emailMatch = emailValue.includes(searchEmail.toLowerCase());
    const uiStatus = apiToUi(o.status).toLowerCase();
    const statusMatch =
      statusTab === "All" || uiStatus === statusTab.toLowerCase();

    // Date range filter
    let dateMatch = true;
    if (dateFrom || dateTo) {
      if (!o.createdAt) return false;
      const created = new Date(o.createdAt);
      const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
      const toDate = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;
      if (fromDate && created < fromDate) dateMatch = false;
      if (toDate && created > toDate) dateMatch = false;
    }

    return emailMatch && statusMatch && dateMatch;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // compute disabled states for action buttons
  const computeActionDisabled = (order) => {
    const apiStatus = String(order.status || "pending").toLowerCase();

    const isDelivered = apiStatus === "delivered";
    const isCancelled = apiStatus === "cancelled";
    const isFinal = isDelivered || isCancelled;

    const isCancellationRequested =
      apiStatus === "cancellation_requested" || apiStatus === "cancel_requested";

    // Mark Shipped:
    // - disabled if final
    // - disabled if already shipped or delivered or cancellation requested
    const shippedDisabled = isFinal || apiStatus === "shipped" || isCancellationRequested;

    // Mark Delivered:
    // - disabled if final
    // - disabled when order is currently Pending (cannot deliver a pending order)
    // - disabled if already delivered
    const deliveredDisabled =
      isFinal || apiStatus === "delivered" || apiStatus === "pending";

    // Approve Cancellation:
    // - only enabled when cancellation requested
    const approveCancellationDisabled = !isCancellationRequested;

    return {
      shippedDisabled,
      deliveredDisabled,
      approveCancellationDisabled,
      isFinal,
      isCancellationRequested,
    };
  };

  // Helper to reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchEmail, statusTab, dateFrom, dateTo]);

  return (
    <Box className="mt-4 container">
      <Typography variant="h5" gutterBottom>
        Order Dashboard
      </Typography>

      {/* Tabs */}
      <Tabs
        value={statusTab}
        onChange={(e, val) => setStatusTab(val)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        {/* Reordered as requested: Cancellation Request before Cancelled */}
        {["All", "Pending", "Cancellation Request", "Cancelled", "Shipped", "Delivered"].map(
          (status) => (
            <Tab key={status} label={status} value={status} />
          )
        )}
      </Tabs>

      {/* Search + Date Range + Export (inline with header) */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <TextField
            label="Search by email"
            variant="outlined"
            size="small"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            sx={{ width: 300 }}
          />

          {/* Date inputs inline */}
          <TextField
            size="small"
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={dateTo}
            inputProps={{ min: dateFrom || undefined }}
            onChange={(e) => setDateTo(e.target.value)}
          />
          {(dateFrom || dateTo) && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
            >
              Reset Dates
            </Button>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              const headers = ["Order ID", "Email", "Order Date", "Total", "Status"];
              const rows = filteredOrders.map((o) => [
                o.orderId || o._id, // show human-readable ID if available
                o.userEmail || "Unknown",
                new Date(o.createdAt).toLocaleString(),
                o.total,
                apiToUi(o.status),
              ]);
              const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "orders.csv";
              link.click();
            }}
          >
            Export to CSV
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : filteredOrders.length === 0 ? (
        <Typography align="center">No orders found.</Typography>
      ) : (
        <>
          {currentOrders.map((order) => {
            const apiStatus = String(order.status || "pending").toLowerCase();
            const uiStatusLabel = apiToUi(apiStatus);
            const statusColor = getStatusColor(apiStatus);

            const {
              shippedDisabled,
              deliveredDisabled,
              approveCancellationDisabled,
              isFinal,
              isCancellationRequested,
            } = computeActionDisabled(order);

            return (
              <Card key={order._id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                <CardContent>
                  {/* Display orderId (fallback to _id) */}
                  <Typography variant="h6">
                    Order ID: {order.orderId || order._id}
                  </Typography>
                  <Typography>
                    <strong>Order Date:</strong>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {order.userEmail || "Unknown"}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="subtitle1">Items:</Typography>
                  <ul>
                    {order.items?.map((item, i) => (
                      <li key={i}>
                        <strong>{item.name}</strong> (Qty: {item.quantity}) – ₱
                        {(item.quantity * parseFloat(item.price || 0)).toFixed(2)}
                      </li>
                    ))}
                  </ul>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={2}
                  >
                    <Box>
                      <Typography>
                        <strong>Total:</strong> ₱
                        {parseFloat(order.total || 0).toFixed(2)}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography>
                          <strong>Status:</strong>
                        </Typography>
                        <Chip
                          label={uiStatusLabel}
                          color={statusColor}
                        />
                      </Box>

                      {!isFinal && (
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            onClick={() => handleStatusChange(order, "Shipped")}
                            disabled={shippedDisabled}
                          >
                            Mark Shipped
                          </Button>
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => handleStatusChange(order, "Delivered")}
                            disabled={deliveredDisabled}
                          >
                            Mark Delivered
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleApproveCancellation(order)}
                            disabled={approveCancellationDisabled}
                            sx={{ display: isCancellationRequested ? "inline-flex" : "none" }}
                          >
                            Approve Cancellation
                          </Button>
                        </Box>
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleShowInvoice(order)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination (Bootstrap) */}
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination>
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </Box>
        </>
      )}

      <InVoice show={showInvoice} handleClose={handleCloseInvoice} order={selectedOrder} />
    </Box>
  );
};

export default OrderDashboard;
