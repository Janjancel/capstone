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
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2"; // ✅ confirmations only

// ---------- Shared image-display logic (same approach as CartModal) ----------
const PLACEHOLDER_IMG = "/placeholder.jpg";

function getFirstUrl(candidate) {
  // returns the first usable string URL from various shapes
  if (!candidate) return null;

  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();

  if (Array.isArray(candidate)) {
    // find the first non-empty string
    const found = candidate.find(
      (c) => typeof c === "string" && c.trim().length > 0
    );
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

function getItemImage(item) {
  // Try the flexible shapes used across the app
  return (
    getFirstUrl(item?.images) ||
    getFirstUrl(item?.image) ||
    PLACEHOLDER_IMG
  );
}
// ---------------------------------------------------------------------------

const OrderDetailModal = ({ show, onClose, order, userEmail, updateParentOrders }) => {
  const [realTimeOrder, setRealTimeOrder] = useState(order);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [cancelling, setCancelling] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  useEffect(() => {
    if (!order?.id && !order?._id) return;

    const fetchOrder = async () => {
      try {
        const orderId = order.id || order._id;
        const [orderRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/api/orders/${orderId}`, { headers: authHeaders() }),
          axios.get(`${API_URL}/api/users`, { headers: authHeaders() }),
        ]);

        const userMap = {};
        (usersRes.data || []).forEach((u) => {
          if (u?._id) userMap[u._id] = u;
        });

        setUserData(userMap);
        setRealTimeOrder({
          ...orderRes.data,
          userEmail: userMap[orderRes.data?.userId]?.email || "Unknown",
        });
        updateParentOrders?.(orderRes.data);
      } catch (err) {
        console.error("Error fetching order:", err);
        toast.error("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, order?._id, API_URL]);

  const handleCancelRequest = async () => {
    // ✅ SweetAlert used ONLY for confirmation
    const confirm = await Swal.fire({
      title: "Request order cancellation?",
      text: "We will notify the admin to review your request.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, request cancellation",
      cancelButtonText: "No, keep order",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!confirm.isConfirmed) return;

    if (cancelling) return;
    setCancelling(true);

    const orderId = realTimeOrder.id || realTimeOrder._id;

    // Step 1: make the cancellation request
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

    // Update UI immediately after a successful cancel
    const updatedOrder = { ...realTimeOrder, status: "Cancellation Requested" };
    setRealTimeOrder(updatedOrder);
    updateParentOrders?.(updatedOrder);
    toast.success("Cancellation request sent. Admin will review it.");

    // Step 2 (non-blocking): try to notify admin. If it fails, warn but don’t error the whole flow.
    try {
      const payload = {
        orderId,
        userId: realTimeOrder.userId,
        status: "Cancellation Requested",
        role: "admin",
        for: "order",
        message: `User ${userEmail} requested cancellation for Order ID: ${orderId}`,
      };

      // Primary notifications route
      await axios.post(`${API_URL}/api/notifications`, payload, {
        headers: authHeaders(),
      });
    } catch (err1) {
      // Fallback to per-user route if primary doesn't exist
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

  const { address = {}, items = [], userEmail: displayEmail } = realTimeOrder;
  const rawStatus = (realTimeOrder.status || "").toLowerCase().trim();
  const showCancelBtn = rawStatus === "pending";

  return (
    <Dialog open={show} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Order Details</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h6">
              Order ID: {realTimeOrder.id || realTimeOrder._id}
            </Typography>
            <Typography>
              <strong>Email:</strong> {displayEmail || userEmail || "Unknown"}
            </Typography>
            <Typography>
              <strong>Date:</strong>{" "}
              {realTimeOrder.createdAt
                ? new Date(realTimeOrder.createdAt).toLocaleString()
                : "N/A"}
            </Typography>
            <Typography>
              <strong>Status:</strong>{" "}
              <Chip
                label={realTimeOrder.status || "N/A"}
                color={getStatusColor(rawStatus)}
                size="small"
              />
            </Typography>
            <Typography>
              <strong>Total Price:</strong> ₱
              {parseFloat(realTimeOrder.total || 0).toFixed(2)}
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
                    return (
                      <TableRow key={i}>
                        <TableCell>
                          <Box
                            sx={{
                              width: 60,
                              height: 50,
                              position: "relative",
                              overflow: "hidden",
                              borderRadius: 1,
                              bgcolor: "background.paper",
                              boxShadow: 1,
                            }}
                          >
                            <img
                              src={imgSrc}
                              alt={item.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                              onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER_IMG;
                                e.currentTarget.onerror = null;
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₱{parseFloat(item.price || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          ₱{((item.quantity || 0) * parseFloat(item.price || 0)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {showCancelBtn && (
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelRequest}
            disabled={cancelling}
          >
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
