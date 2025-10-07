
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

const OrderDetailModal = ({ show, onClose, order, userEmail, updateParentOrders }) => {
  const [realTimeOrder, setRealTimeOrder] = useState(order);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!order?.id && !order?._id) return;

    const fetchOrder = async () => {
      try {
        const orderId = order.id || order._id;
        const [orderRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/api/orders/${orderId}`),
          axios.get(`${API_URL}/api/users`),
        ]);

        const userMap = {};
        usersRes.data.forEach((user) => {
          userMap[user._id] = user;
        });

        setRealTimeOrder({
          ...orderRes.data,
          userEmail: userMap[orderRes.data.userId]?.email || "Unknown",
        });
        setUserData(userMap);
        updateParentOrders(orderRes.data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [order?.id, order?._id, API_URL]);

  const handleCancelRequest = async () => {
    try {
      const orderId = realTimeOrder.id || realTimeOrder._id;
      await axios.patch(`${API_URL}/api/orders/${orderId}/cancel`, {
        email: userEmail,
      });

      // Notify admin
      await axios.post(`${API_URL}/api/notifications`, {
        orderId: orderId,
        userId: realTimeOrder.userId,
        status: "Cancellation Requested",
        role: "admin",
        message: `User ${userEmail} requested cancellation for Order ID: ${orderId}`,
      });

      const updatedOrder = { ...realTimeOrder, status: "Cancellation Requested" };
      setRealTimeOrder(updatedOrder);
      updateParentOrders(updatedOrder);
      toast.success("Cancellation request sent and admin notified.");
      onClose();
    } catch (err) {
      console.error("Error requesting cancellation:", err);
      toast.error("Failed to request cancellation.");
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
              {new Date(realTimeOrder.createdAt).toLocaleString() || "N/A"}
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
                  {items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Box
                          sx={{
                            width: "60px",
                            height: "50px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            borderRadius: 1,
                          }}
                        >
                          <img
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₱{parseFloat(item.price).toFixed(2)}</TableCell>
                      <TableCell>
                        ₱{(item.quantity * parseFloat(item.price)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {showCancelBtn && (
          <Button variant="contained" color="error" onClick={handleCancelRequest}>
            Request Order Cancellation
          </Button>
        )}
        <Button variant="outlined" onClick={onClose}>
          Back
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailModal;
