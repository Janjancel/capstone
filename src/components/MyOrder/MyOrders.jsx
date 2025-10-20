// src/components/MyOrder/MyOrders.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import OrderDetailModal from "./OrderDetailModal";
import { useAuth } from "../../context/AuthContext";

// ---- Helpers ----
function StatusChip({ value }) {
  const v = (value || "pending").toLowerCase();
  const color =
    v === "delivered" || v === "completed"
      ? "success"
      : v === "shipped"
      ? "primary"
      : v === "processing"
      ? "info"
      : v === "cancelled" || v === "canceled" || v === "declined"
      ? "error"
      : "default";
  const label = (value || "pending").replaceAll("_", " ");
  return (
    <Chip
      size="small"
      color={color}
      label={label}
      sx={{ textTransform: "capitalize" }}
    />
  );
}

const currency = (n) => `₱${Number(n || 0).toLocaleString()}`;

const pickTotal = (order) =>
  order?.total ??
  order?.totalAmount ??
  order?.totalPrice ??
  (Array.isArray(order?.items)
    ? order.items.reduce(
        (sum, it) =>
          sum + Number(it?.price || it?.amount || 0) * Number(it?.quantity || 1),
        0
      )
    : 0);

const pickOrderId = (order) => order?.orderId || order?._id || "—";

const pickAddress = (order) => {
  const s = order?.shippingAddress || order?.address || {};
  const parts = [
    s.line1 || s.addressLine || s.address1,
    s.barangay || s.suburb || s.village,
    s.city || s.municipality || s.town,
    s.province || s.state,
    s.postalCode || s.zip,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
};

// Timeline (Processing removed)
const steps = ["Pending", "Shipped", "Delivered"];
const getCurrentStepIndex = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "delivered" || s === "completed") return 2;
  if (s === "shipped") return 1;
  return 0; // treat anything else (incl. 'processing') as pending
};

// ✅ Show 6 cards per page (3 per row x 2 rows)
const ORDERS_PER_PAGE = 6;

// ---- Image helpers ----
const toUrl = (val) => (typeof val === "string" ? val : null);

const getItemImageUrls = (item) => {
  const urls = [];

  // Common single-image fields
  [item?.image, item?.imageUrl, item?.thumbnail]?.forEach((v) => {
    const u = toUrl(v);
    if (u) urls.push(u);
  });

  // images.front/side/back/main
  if (item?.images && typeof item.images === "object") {
    ["front", "side", "back", "main"].forEach((k) => {
      const u = toUrl(item.images[k]);
      if (u) urls.push(u);
    });
  }

  // photos array
  if (Array.isArray(item?.photos)) {
    item.photos.forEach((p) => {
      const u =
        toUrl(p) ||
        toUrl(p?.url) ||
        toUrl(p?.secure_url) ||
        (Array.isArray(p) ? toUrl(p[0]) : null);
      if (u) urls.push(u);
    });
  }

  // media array
  if (Array.isArray(item?.media)) {
    item.media.forEach((m) => {
      const u = toUrl(m) || toUrl(m?.url) || toUrl(m?.secure_url);
      if (u) urls.push(u);
    });
  }

  return urls.filter(Boolean);
};

const getOrderImageUrls = (order) => {
  const items = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.cartItems)
    ? order.cartItems
    : [];
  const all = items.flatMap(getItemImageUrls);
  // De-dup
  return Array.from(new Set(all)).filter(Boolean);
};

// ---- UI: image strip ----
function OrderImageStrip({ urls = [] }) {
  if (!urls.length) return null;
  const firstFour = urls.slice(0, 4);
  const more = urls.length - firstFour.length;

  return (
    <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
      {firstFour.map((src, idx) => {
        const isLastWithMore = idx === firstFour.length - 1 && more > 0;
        return (
          <Box
            key={`${src}-${idx}`}
            sx={{
              position: "relative",
              width: 84,
              height: 84,
              borderRadius: 1.5,
              border: "1px solid #eee",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              window.open(src, "_blank");
            }}
            aria-label="Order item image"
            role="img"
          >
            <Box
              component="img"
              src={src}
              alt={`item-${idx}`}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {isLastWithMore && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                +{more}
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user === null) return; // still resolving
    if (!user?._id) {
      setError("You must be logged in to view your orders.");
      setLoading(false);
      return;
    }

    setUserEmail(user.email || "");

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/orders/user/${user._id}`);
        const filtered = (res.data || []).filter((order) => {
          const s = String(order?.status || "").toLowerCase();
          return s !== "delivered" && s !== "cancelled" && s !== "canceled";
        });
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(filtered);
        setError("");
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, API_URL]);

  const handleSelectOrder = (order) => setSelectedOrder(order);
  const handleOrderDetailClose = () => setSelectedOrder(null);

  // Pagination (6 per page)
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE)),
    [orders.length]
  );
  const startIdx = (currentPage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = orders.slice(startIdx, startIdx + ORDERS_PER_PAGE);

  return (
    <>
      <Container sx={{ pt: 14, pb: 6 }} maxWidth="lg">
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            My Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your purchases and view order details.
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box textAlign="center" py={4}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : orders.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography>You have no active orders.</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {paginatedOrders.map((order) => {
                const createdAt = order?.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "—";
                const total = pickTotal(order);
                const address = pickAddress(order);
                const status = order?.status || "Pending";
                const currentStep = getCurrentStepIndex(status);
                const orderId = pickOrderId(order);
                const itemCount = Array.isArray(order?.items) ? order.items.length : null;
                const imageUrls = getOrderImageUrls(order);

                return (
                  <Grid key={order?._id || orderId} item xs={12} sm={6} md={4}>
                    <Card
                      role="button"
                      onClick={() => handleSelectOrder(order)}
                      sx={{
                        cursor: "pointer",
                        transition: "transform 0.12s ease, box-shadow 0.12s ease",
                        "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                      }}
                    >
                      <CardContent>
                        {/* Header row: Title + Status */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Order {orderId}
                          </Typography>
                          <StatusChip value={status} />
                        </Stack>

                        {/* Subheader: Items summary */}
                        {itemCount != null && (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {itemCount} item{itemCount === 1 ? "" : "s"}
                          </Typography>
                        )}

                        {/* Meta row: Date + Total */}
                        <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            {createdAt}
                          </Typography>
                          <Divider orientation="vertical" flexItem />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Total: {currency(total)}
                          </Typography>
                        </Stack>

                        {/* Address (if any) */}
                        {address && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {address}
                          </Typography>
                        )}

                        {/* Item images */}
                        <OrderImageStrip urls={imageUrls} />

                        {/* Custom Stepper (Pending → Shipped → Delivered) */}
                        <div className="stepper-container">
                          {steps.map((step, index) => (
                            <div
                              key={step}
                              className={`stepper-step ${index <= currentStep ? "active" : ""}`}
                            >
                              <div className="circle">{index + 1}</div>
                              <span className="step-label">{step}</span>
                              {index < steps.length - 1 && (
                                <div className={`line ${index < currentStep ? "active" : ""}`} />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOrder(order);
                            }}
                          >
                            View Order Details
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Pagination */}
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Typography>
                Page {currentPage} of {pageCount}
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setCurrentPage((p) => (p < pageCount ? p + 1 : p))}
                disabled={currentPage === pageCount}
              >
                Next
              </Button>
            </Box>
          </>
        )}
      </Container>

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <OrderDetailModal
          show={!!selectedOrder}
          onClose={handleOrderDetailClose}
          order={selectedOrder}
          userEmail={userEmail}
          updateParentOrders={(updatedOrder) =>
            setOrders((prev) =>
              prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
            )
          }
        />
      )}

      {/* Stepper CSS */}
      <style jsx>{`
        .stepper-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px 0 10px;
          position: relative;
        }

        .stepper-step {
          text-align: center;
          flex: 1;
          position: relative;
        }

        .circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #ccc;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 6px;
          z-index: 2;
          position: relative;
          font-size: 0.85rem;
        }

        .stepper-step.active .circle {
          background-color: #1976d2; /* MUI primary */
        }

        .step-label {
          font-size: 0.85rem;
          display: block;
        }

        .line {
          position: absolute;
          top: 12px;
          left: 50%;
          width: 100%;
          height: 2px;
          background-color: #ccc;
          z-index: 1;
        }

        .line.active {
          background-color: #1976d2;
        }

        .stepper-step:last-child .line {
          display: none;
        }
      `}</style>
    </>
  );
};

export default MyOrders;
