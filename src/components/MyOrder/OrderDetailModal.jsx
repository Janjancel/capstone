

// import React, { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Chip,
//   CircularProgress,
//   Typography,
//   Table,
//   TableHead,
//   TableBody,
//   TableRow,
//   TableCell,
//   TableContainer,
//   Paper,
//   Box,
// } from "@mui/material";
// import axios from "axios";
// import toast from "react-hot-toast";
// import Swal from "sweetalert2"; // ✅ confirmations only

// // ---------- Shared image-display logic (same as CartModal) ----------
// const PLACEHOLDER_IMG = "/placeholder.jpg";

// function getFirstUrl(candidate) {
//   // returns the first usable string URL from various shapes
//   if (!candidate) return null;

//   if (typeof candidate === "string" && candidate.trim()) return candidate.trim();

//   if (Array.isArray(candidate)) {
//     // find the first non-empty string
//     const found = candidate.find((c) => typeof c === "string" && c.trim().length > 0);
//     if (found) return found.trim();
//     // allow array of objects like [{url:'...'}]
//     for (const c of candidate) {
//       const nested = getFirstUrl(c);
//       if (nested) return nested;
//     }
//     return null;
//   }

//   if (typeof candidate === "object") {
//     // common keys first
//     const priorityKeys = ["front", "main", "cover", "primary", "side", "back", "url"];
//     for (const k of priorityKeys) {
//       if (k in candidate) {
//         const nested = getFirstUrl(candidate[k]);
//         if (nested) return nested;
//       }
//     }
//     // then scan all props
//     for (const k in candidate) {
//       const nested = getFirstUrl(candidate[k]);
//       if (nested) return nested;
//     }
//   }

//   return null;
// }

// // ----- Shared image-display logic used in Cart + CartModal -----
// function getItemImage(item) {
//   // Try the flexible shapes you use across the app
//   return getFirstUrl(item?.images) || getFirstUrl(item?.image) || PLACEHOLDER_IMG;
// }
// // ---------------------------------------------------------------------------

// const OrderDetailModal = ({ show, onClose, order, userEmail, updateParentOrders }) => {
//   const [realTimeOrder, setRealTimeOrder] = useState(order);
//   const [loading, setLoading] = useState(true);
//   const [cancelling, setCancelling] = useState(false);
//   const API_URL = process.env.REACT_APP_API_URL;

//   const authHeaders = () => {
//     const token = localStorage.getItem("token");
//     return token ? { Authorization: `Bearer ${token}` } : undefined;
//   };

//   useEffect(() => {
//     if (!order?.id && !order?._id) return;

//     let mounted = true;

//     const fetchOrder = async () => {
//       try {
//         const orderId = order.id || order._id;
//         // fetch order + all users so we can map email -> userId
//         const [orderRes, usersRes] = await Promise.all([
//           axios.get(`${API_URL}/api/orders/${orderId}`, { headers: authHeaders() }),
//           axios.get(`${API_URL}/api/users`, { headers: authHeaders() }),
//         ]);

//         const userMap = {};
//         (usersRes.data || []).forEach((u) => {
//           if (u?._id) userMap[u._id] = u;
//         });

//         if (!mounted) return;

//         setRealTimeOrder({
//           ...orderRes.data,
//           userEmail: userMap[orderRes.data?.userId]?.email || "Unknown",
//         });

//         updateParentOrders?.(orderRes.data);
//       } catch (err) {
//         console.error("Error fetching order:", err);
//         toast.error("Failed to load order details.");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     fetchOrder();
//     const interval = setInterval(fetchOrder, 5000);
//     return () => {
//       mounted = false;
//       clearInterval(interval);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [order?.id, order?._id, API_URL]);

//   const handleCancelRequest = async () => {
//     // Show Swal with extra z-index handling inside didOpen so it visually sits above MUI Dialog
//     const confirm = await Swal.fire({
//       title: "Request order cancellation?",
//       text: "We will notify the admin to review your request.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, request cancellation",
//       cancelButtonText: "No, keep order",
//       reverseButtons: true,
//       focusCancel: true,
//       // ensure visually on top of MUI Dialog
//       didOpen: () => {
//         // SweetAlert renders .swal2-container; raise z-index so it stacks above MUI Dialog
//         const el = document.querySelector(".swal2-container");
//         if (el) {
//           // Very large number to be safe; inline style
//           el.style.zIndex = "20000";
//         }
//       },
//       // optional: restore z-index on close (clean up)
//       willClose: () => {
//         const el = document.querySelector(".swal2-container");
//         if (el) el.style.zIndex = "";
//       },
//     });

//     if (!confirm.isConfirmed) return;

//     if (cancelling) return;
//     setCancelling(true);

//     const orderId = realTimeOrder.id || realTimeOrder._id;

//     try {
//       await axios.patch(
//         `${API_URL}/api/orders/${orderId}/cancel`,
//         { email: userEmail },
//         { headers: authHeaders() }
//       );
//     } catch (err) {
//       console.error("Error requesting cancellation (PATCH):", err);
//       toast.error("Failed to request cancellation.");
//       setCancelling(false);
//       return;
//     }

//     const updatedOrder = { ...realTimeOrder, status: "Cancellation Requested" };
//     setRealTimeOrder(updatedOrder);
//     updateParentOrders?.(updatedOrder);
//     toast.success("Cancellation request sent. Admin will review it.");

//     try {
//       const payload = {
//         orderId,
//         userId: realTimeOrder.userId,
//         status: "Cancellation Requested",
//         role: "admin",
//         for: "order",
//         message: `User ${userEmail} requested cancellation for Order ID: ${orderId}`,
//       };
//       await axios.post(`${API_URL}/api/notifications`, payload, {
//         headers: authHeaders(),
//       });
//     } catch (err1) {
//       try {
//         await axios.post(
//           `${API_URL}/api/notifications/users/${realTimeOrder.userId}/notifications`,
//           {
//             orderId,
//             status: "Cancellation Requested",
//             role: "admin",
//             for: "order",
//             message: `User ${userEmail} requested cancellation for Order ID: ${orderId}`,
//           },
//           { headers: authHeaders() }
//         );
//       } catch (err2) {
//         console.warn("Notification send failed:", err1, err2);
//         toast("Cancellation submitted, but admin notification could not be sent automatically.", {
//           icon: "⚠️",
//         });
//       }
//     } finally {
//       setCancelling(false);
//       onClose();
//     }
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "pending":
//         return "default";
//       case "processing":
//         return "primary";
//       case "shipped":
//         return "info";
//       case "delivered":
//         return "success";
//       case "cancellation requested":
//       case "cancel requested":
//         return "warning";
//       case "cancelled":
//         return "error";
//       default:
//         return "default";
//     }
//   };

//   if (!realTimeOrder) return null;

//   const { address = {}, userEmail: displayEmail } = realTimeOrder;
//   // Accept either `items` or `orderItems` to be safe
//   const items = realTimeOrder.items || realTimeOrder.orderItems || [];
//   const rawStatus = (realTimeOrder.status || "").toLowerCase().trim();
//   const showCancelBtn = rawStatus === "pending";

//   return (
//     // disableEnforceFocus and disableAutoFocus allow Swal to take focus and overlay the dialog
//     <Dialog
//       open={show}
//       onClose={onClose}
//       fullWidth
//       maxWidth="md"
//       disableEnforceFocus
//       disableAutoFocus
//       scroll="paper"
//     >
//       <DialogTitle>Order Details</DialogTitle>
//       <DialogContent dividers>
//         {loading ? (
//           <Box display="flex" justifyContent="center" alignItems="center" p={3}>
//             <CircularProgress />
//           </Box>
//         ) : (
//           <>
//             <Typography variant="h6">Order ID: {realTimeOrder.id || realTimeOrder._id}</Typography>
//             <Typography>
//               <strong>Email:</strong> {displayEmail || userEmail || "Unknown"}
//             </Typography>
//             <Typography>
//               <strong>Date:</strong>{" "}
//               {realTimeOrder.createdAt ? new Date(realTimeOrder.createdAt).toLocaleString() : "N/A"}
//             </Typography>
//             <Typography>
//               <strong>Status:</strong>{" "}
//               <Chip label={realTimeOrder.status || "N/A"} color={getStatusColor(rawStatus)} size="small" />
//             </Typography>
//             <Typography>
//               <strong>Total Price:</strong> ₱{parseFloat(realTimeOrder.total || 0).toFixed(2)}
//             </Typography>

//             <Typography variant="subtitle1" sx={{ mt: 2 }}>
//               Shipping Address
//             </Typography>
//             <Typography variant="body2" component="address" sx={{ whiteSpace: "pre-line" }}>
//               {address.houseNo && `House No: ${address.houseNo}, `}
//               {address.street && `${address.street}, `}
//               {address.barangay && `Brgy. ${address.barangay}, `}
//               {address.city && `${address.city}, `}
//               {address.province && `${address.province}, `}
//               {address.region && `${address.region}, `}
//               {address.zipCode && `ZIP: ${address.zipCode}`}
//             </Typography>

//             <Typography variant="subtitle1" sx={{ mt: 3 }}>
//               Order Summary
//             </Typography>
//             <TableContainer component={Paper} sx={{ mt: 1 }}>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Image</TableCell>
//                     <TableCell>Item Name</TableCell>
//                     <TableCell>Qty</TableCell>
//                     <TableCell>Price</TableCell>
//                     <TableCell>Subtotal</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {(items || []).map((item, i) => {
//                     const imgSrc = getItemImage(item);
//                     const subtotal = ((item.quantity || 0) * parseFloat(item.price || 0)).toFixed(2);
//                     return (
//                       <TableRow key={i}>
//                         <TableCell>
//                           <Box
//                             sx={{
//                               width: 64,
//                               height: 54,
//                               position: "relative",
//                               overflow: "hidden",
//                               borderRadius: 1,
//                               bgcolor: "background.paper",
//                               boxShadow: 1,
//                             }}
//                           >
//                             <img
//                               src={imgSrc}
//                               alt={item.name || "item"}
//                               style={{
//                                 width: "100%",
//                                 height: "100%",
//                                 objectFit: "cover",
//                                 display: "block",
//                               }}
//                               className="img-thumbnail"
//                               onError={(e) => {
//                                 e.currentTarget.src = PLACEHOLDER_IMG;
//                                 e.currentTarget.onerror = null;
//                               }}
//                             />
//                           </Box>
//                         </TableCell>
//                         <TableCell>{item.name || "Unnamed item"}</TableCell>
//                         <TableCell>{item.quantity}</TableCell>
//                         <TableCell>₱{parseFloat(item.price || 0).toFixed(2)}</TableCell>
//                         <TableCell>₱{subtotal}</TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </>
//         )}
//       </DialogContent>
//       <DialogActions>
//         {showCancelBtn && (
//           <Button variant="contained" color="error" onClick={handleCancelRequest} disabled={cancelling}>
//             {cancelling ? "Requesting..." : "Request Order Cancellation"}
//           </Button>
//         )}
//         <Button variant="outlined" onClick={onClose} disabled={cancelling}>
//           Back
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default OrderDetailModal;


import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  CircularProgress,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Box,
  Grid,
  Divider,
  Stack,
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2"; // ✅ confirmations only

// ---------- Shared image-display logic (same as CartModal) ----------
const PLACEHOLDER_IMG = "/placeholder.jpg";

function getFirstUrl(candidate) {
  // returns the first usable string URL from various shapes
  if (!candidate) return null;

  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();

  if (Array.isArray(candidate)) {
    // find the first non-empty string
    const found = candidate.find((c) => typeof c === "string" && c.trim().length > 0);
    if (found) return found.trim();
    // allow array of objects like [{url:'...'}]
    for (const c of candidate) {
      const nested = getFirstUrl(c);
      if (nested) return nested;
    }
    return null;
  }

  if (typeof candidate === "object") {
    // common keys first
    const priorityKeys = ["front", "main", "cover", "primary", "side", "back", "url"];
    for (const k of priorityKeys) {
      if (k in candidate) {
        const nested = getFirstUrl(candidate[k]);
        if (nested) return nested;
      }
    }
    // then scan all props
    for (const k in candidate) {
      const nested = getFirstUrl(candidate[k]);
      if (nested) return nested;
    }
  }

  return null;
}

// ----- Shared image-display logic used in Cart + CartModal -----
function getItemImage(item) {
  // Try the flexible shapes you use across the app
  return getFirstUrl(item?.images) || getFirstUrl(item?.image) || PLACEHOLDER_IMG;
}
// ---------------------------------------------------------------------------

const OrderDetailModal = ({ show, onClose, order, userEmail, updateParentOrders }) => {
  const [realTimeOrder, setRealTimeOrder] = useState(order);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  useEffect(() => {
    if (!order?.id && !order?._id) return;

    let mounted = true;

    const fetchOrder = async () => {
      try {
        const orderId = order.id || order._id;
        // fetch order + all users so we can map email -> userId
        const [orderRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/api/orders/${orderId}`, { headers: authHeaders() }),
          axios.get(`${API_URL}/api/users`, { headers: authHeaders() }),
        ]);

        const userMap = {};
        (usersRes.data || []).forEach((u) => {
          if (u?._id) userMap[u._id] = u;
        });

        if (!mounted) return;

        setRealTimeOrder({
          ...orderRes.data,
          userEmail: userMap[orderRes.data?.userId]?.email || "Unknown",
        });

        updateParentOrders?.(orderRes.data);
      } catch (err) {
        console.error("Error fetching order:", err);
        toast.error("Failed to load order details.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, order?._id, API_URL]);

  const handleCancelRequest = async () => {
    // Show Swal with extra z-index handling inside didOpen so it visually sits above MUI Dialog
    const confirm = await Swal.fire({
      title: "Request order cancellation?",
      text: "We will notify the admin to review your request.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, request cancellation",
      cancelButtonText: "No, keep order",
      reverseButtons: true,
      focusCancel: true,
      // ensure visually on top of MUI Dialog
      didOpen: () => {
        // SweetAlert renders .swal2-container; raise z-index so it stacks above MUI Dialog
        const el = document.querySelector(".swal2-container");
        if (el) {
          // Very large number to be safe; inline style
          el.style.zIndex = "20000";
        }
      },
      // optional: restore z-index on close (clean up)
      willClose: () => {
        const el = document.querySelector(".swal2-container");
        if (el) el.style.zIndex = "";
      },
    });

    if (!confirm.isConfirmed) return;

    if (cancelling) return;
    setCancelling(true);

    const orderId = realTimeOrder.id || realTimeOrder._id;

    try {
      await axios.patch(
        `${API_URL}/api/orders/${orderId}/cancel`,
        { email: userEmail },
        { headers: authHeaders() }
      );
    } catch (err) {
      console.error("Error requesting cancellation (PATCH):", err);
      toast.error("Failed to request cancellation.");
      setCancelling(false);
      return;
    }

    const updatedOrder = { ...realTimeOrder, status: "Cancellation Requested" };
    setRealTimeOrder(updatedOrder);
    updateParentOrders?.(updatedOrder);
    toast.success("Cancellation request sent. Admin will review it.");

    try {
      const payload = {
        orderId,
        userId: realTimeOrder.userId,
        status: "Cancellation Requested",
        role: "admin",
        for: "order",
        message: `User ${userEmail} requested cancellation for Order ID: ${orderId}`,
      };
      await axios.post(`${API_URL}/api/notifications`, payload, {
        headers: authHeaders(),
      });
    } catch (err1) {
      try {
        await axios.post(
          `${API_URL}/api/notifications/users/${realTimeOrder.userId}/notifications`,
          {
            orderId,
            status: "Cancellation Requested",
            role: "admin",
            for: "order",
            message: `User ${userEmail} requested cancellation for Order ID: ${orderId}`,
          },
          { headers: authHeaders() }
        );
      } catch (err2) {
        console.warn("Notification send failed:", err1, err2);
        toast("Cancellation submitted, but admin notification could not be sent automatically.", {
          icon: "⚠️",
        });
      }
    } finally {
      setCancelling(false);
      onClose();
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "default";
      case "processing":
        return "primary";
      case "shipped":
        return "info";
      case "delivered":
        return "success";
      case "cancellation requested":
      case "cancel requested":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  if (!realTimeOrder) return null;

  const { address = {}, userEmail: displayEmail } = realTimeOrder;
  // Accept either `items` or `orderItems` to be safe
  const items = realTimeOrder.items || realTimeOrder.orderItems || [];
  const rawStatus = (realTimeOrder.status || "").toLowerCase().trim();
  const showCancelBtn = rawStatus === "pending";

  // Format helper
  const formatPHP = (v) =>
    `₱${(Number(v) || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Fees extraction (defensive)
  const totalFromOrder = Number(realTimeOrder.total ?? realTimeOrder.totalPrice ?? 0);
  const deliveryFeeFromOrder = Number(realTimeOrder.deliveryFee ?? realTimeOrder.fee ?? 0);
  const discountFromOrder = realTimeOrder.discount == null ? null : Number(realTimeOrder.discount);
  const discountPercentFromOrder =
    (realTimeOrder?.meta?.computed?.discountPercent ?? realTimeOrder.discountPercent) ?? null;
  const grandTotalFromOrder =
    Number(realTimeOrder.grandTotal ?? realTimeOrder.totalAfterDiscount ?? realTimeOrder.finalTotal ?? 0);

  return (
    <Dialog
      open={show}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      disableEnforceFocus
      disableAutoFocus
      scroll="paper"
    >
      <DialogTitle>Order Details</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {/* Left column: existing layout wrapped in a container */}
            <Grid item xs={12} md={8}>
              <Box>
                <Typography variant="h6">Order ID: {realTimeOrder.id || realTimeOrder._id}</Typography>
                <Typography>
                  <strong>Email:</strong> {displayEmail || userEmail || "Unknown"}
                </Typography>
                <Typography>
                  <strong>Date:</strong>{" "}
                  {realTimeOrder.createdAt ? new Date(realTimeOrder.createdAt).toLocaleString() : "N/A"}
                </Typography>
                <Typography>
                  <strong>Status:</strong>{" "}
                  <Chip label={realTimeOrder.status || "N/A"} color={getStatusColor(rawStatus)} size="small" />
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Total Price:</strong> ₱{parseFloat(realTimeOrder.total || 0).toFixed(2)}
                </Typography>

                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Shipping Address
                </Typography>
                <Typography variant="body2" component="address" sx={{ whiteSpace: "pre-line" }}>
                  {address.houseNo && `House No: ${address.houseNo}, `}
                  {address.street && `${address.street}, `}
                  {address.barangay && `Brgy. ${address.barangay}, `}
                  {address.city && `${address.city}, `}
                  {address.province && `${address.province}, `}
                  {address.region && `${address.region}, `}
                  {address.zipCode && `ZIP: ${address.zipCode}`}
                </Typography>

                <Typography variant="subtitle1" sx={{ mt: 3 }}>
                  Order Summary
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Item Name</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(items || []).map((item, i) => {
                        const imgSrc = getItemImage(item);
                        const subtotal = ((item.quantity || 0) * parseFloat(item.price || 0)).toFixed(2);
                        return (
                          <TableRow key={i}>
                            <TableCell>
                              <Box
                                sx={{
                                  width: 64,
                                  height: 54,
                                  position: "relative",
                                  overflow: "hidden",
                                  borderRadius: 1,
                                  bgcolor: "background.paper",
                                  boxShadow: 1,
                                }}
                              >
                                <img
                                  src={imgSrc}
                                  alt={item.name || "item"}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                  }}
                                  className="img-thumbnail"
                                  onError={(e) => {
                                    e.currentTarget.src = PLACEHOLDER_IMG;
                                    e.currentTarget.onerror = null;
                                  }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>{item.name || "Unnamed item"}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₱{parseFloat(item.price || 0).toFixed(2)}</TableCell>
                            <TableCell>₱{subtotal}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Grid>

            {/* Right column: new fees container showing exactly the requested lines */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                  height: "100%",
                  bgcolor: "background.paper",
                  position: { md: "sticky", xs: "static" },
                  top: { md: 24, xs: 0 },
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Payment summary
                </Typography>

                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Total:</Typography>
                    <Typography fontWeight={700}>{formatPHP(totalFromOrder)}</Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography>Discount:</Typography>
                    {discountFromOrder == null ? (
                      <Typography color="text.secondary">No discount</Typography>
                    ) : (
                      <Typography fontWeight={700}>
                        {discountPercentFromOrder ? `${discountPercentFromOrder}% ` : ""}
                        ({formatPHP(discountFromOrder)})
                      </Typography>
                    )}
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography>Delivery Fee:</Typography>
                    <Typography fontWeight={700}>{formatPHP(deliveryFeeFromOrder)}</Typography>
                  </Box>

                  <Divider />

                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight={600}>Grand Total:</Typography>
                    <Typography variant="h6" fontWeight={800}>
                      {formatPHP(grandTotalFromOrder)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        {showCancelBtn && (
          <Button variant="contained" color="error" onClick={handleCancelRequest} disabled={cancelling}>
            {cancelling ? "Requesting..." : "Request Order Cancellation"}
          </Button>
        )}
        <Button variant="outlined" onClick={onClose} disabled={cancelling}>
          Back
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailModal;
