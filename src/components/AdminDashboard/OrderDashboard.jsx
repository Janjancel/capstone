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
  const [orders, setOrders] = useState([]);
  const [userData, setUserData] = useState({}); // { [userId]: { email } }
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

  // --- Helpers: status normalization ---
  const STATUS_API_MAP = {
    pending: "pending",
    processing: "processing",
    shipped: "shipped",
    delivered: "delivered",
    "cancellation requested": "cancellation_requested",
    "cancel requested": "cancellation_requested",
    cancelled: "cancelled",
  };
  const toApiStatus = (label) => {
    const key = String(label || "").trim().toLowerCase();
    return STATUS_API_MAP[key] || key;
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const ordersRes = await axios.get(`${API_URL}/api/orders`);
      const sorted = ordersRes.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sorted);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to fetch orders.");
      setLoading(false);
    }
  };

  // Fetch a user's email if we don't have it yet
  const fetchUserIfNeeded = async (userId) => {
    if (!userId || userData[userId]) return;
    try {
      // Assumes an endpoint like /api/users/:id returns { email, ... }
      const res = await axios.get(`${API_URL}/api/users/${userId}`);
      const email = res?.data?.email || "Unknown";
      setUserData((prev) => ({ ...prev, [userId]: { email } }));
    } catch (e) {
      // Silently ignore; will show "Unknown"
      setUserData((prev) => ({ ...prev, [userId]: { email: "Unknown" } }));
    }
  };

  // Fetch all missing users for the current orders
  const hydrateUsersForOrders = async (ordersList) => {
    const missing = Array.from(
      new Set(
        (ordersList || [])
          .map((o) => o.userId)
          .filter((id) => id && !userData[id])
      )
    );
    if (missing.length === 0) return;
    await Promise.all(missing.map((id) => fetchUserIfNeeded(id)));
  };

  useEffect(() => {
    fetchOrders();
    // Poll for updates
    intervalRef.current = setInterval(fetchOrders, 3000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever orders change, fetch missing user emails (once per user)
  useEffect(() => {
    hydrateUsersForOrders(orders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const handleShowInvoice = (order) => {
    setSelectedOrder({
      ...order,
      userEmail: userData[order.userId]?.email || "Unknown",
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
      await axios.put(`${API_URL}/api/orders/${order._id}/status`, {
        status: apiStatus,
      });

      // 2) Create a notification (with for:"order")
      await axios.post(`${API_URL}/api/notifications`, {
        orderId: order._id,
        userId: order.userId,
        for: "order", // ★ required
        status: apiStatus,
        role: "client",
        message: `Your order (${order.orderId || order._id}) status is now "${uiLabel}".`,
      });

      // 3) Sales record when delivered
      if (apiStatus === "delivered") {
        await axios.post(`${API_URL}/api/sales`, {
          orderId: order._id,
          userId: order.userId,
          total: order.total,
          items: order.items,
          deliveredAt: new Date(),
        });
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
      case "cancel requested":
      case "cancellation requested":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const filteredOrders = orders.filter((o) => {
    const emailMatch = (userData[o.userId]?.email || "")
      .toLowerCase()
      .includes(searchEmail.toLowerCase());
    const statusMatch =
      statusTab === "All" ||
      String(o.status || "Pending").toLowerCase() === statusTab.toLowerCase();
    return emailMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
        {["All", "Pending", "Cancelled", "Cancellation Requested", "Shipped", "Delivered"].map(
          (status) => (
            <Tab key={status} label={status} value={status} />
          )
        )}
      </Tabs>

      {/* Search + Export */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          label="Search by email"
          variant="outlined"
          size="small"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            const headers = ["Order ID", "Email", "Order Date", "Total", "Status"];
            const rows = filteredOrders.map((o) => [
              o.orderId || o._id, // show human-readable ID if available
              userData[o.userId]?.email || "Unknown",
              new Date(o.createdAt).toLocaleString(),
              o.total,
              o.status || "Pending",
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
            const email = userData[order.userId]?.email || "Unknown";
            const status = (order.status || "Pending").toLowerCase();
            const isFinal = ["delivered", "cancelled"].includes(status);
            const isCancelable = ["cancellation requested", "cancel requested"].includes(status);

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
                    <strong>Email:</strong> {email}
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
                          label={order.status || "Pending"}
                          color={getStatusColor(order.status)}
                        />
                      </Box>

                      {!isFinal && (
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            onClick={() => handleStatusChange(order, "Shipped")}
                          >
                            Mark Shipped
                          </Button>
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => handleStatusChange(order, "Delivered")}
                          >
                            Mark Delivered
                          </Button>
                          {isCancelable && (
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleApproveCancellation(order)}
                            >
                              Approve Cancellation
                            </Button>
                          )}
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
