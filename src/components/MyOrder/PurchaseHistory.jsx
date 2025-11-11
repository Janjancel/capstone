import React from "react";
import { Box, Typography, Dialog, DialogTitle, DialogContent, IconButton, Grid, Card, CardContent, Stack, Divider, Chip, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";

// Reuse helpers from MyOrders
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
    <Stack direction="row" alignItems="center" spacing={1}>
      <Chip size="small" color={color} label={label} sx={{ textTransform: "capitalize" }} />
    </Stack>
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
const steps = ["Pending", "Shipped", "Delivered"];
const getCurrentStepIndex = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "delivered" || s === "completed") return 2;
  if (s === "shipped") return 1;
  return 0;
};
const toUrl = (val) => (typeof val === "string" ? val : null);
const getItemImageUrls = (item) => {
  const urls = [];
  [item?.image, item?.imageUrl, item?.thumbnail]?.forEach((v) => {
    const u = toUrl(v);
    if (u) urls.push(u);
  });
  if (item?.images && typeof item.images === "object") {
    ["front", "side", "back", "main"].forEach((k) => {
      const u = toUrl(item.images[k]);
      if (u) urls.push(u);
    });
  }
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
  return Array.from(new Set(all)).filter(Boolean);
};
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

const PurchaseHistory = ({ deliveredOrders, open, onClose }) => {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Purchase History</span>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {deliveredOrders && deliveredOrders.length > 0 ? (
          <Grid container spacing={3} alignItems="stretch" justifyContent="center">
            {deliveredOrders.map((order) => {
              const createdAt = order?.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "—";
              const deliveredAt = order?.deliveredAt
                ? new Date(order.deliveredAt).toLocaleString()
                : null;
              const total = pickTotal(order);
              const address = pickAddress(order);
              const status = order?.status || "Delivered";
              const currentStep = getCurrentStepIndex(status);
              const orderId = pickOrderId(order);
              const itemCount = Array.isArray(order?.items) ? order.items.length : null;
              const imageUrls = getOrderImageUrls(order);
              return (
                <Grid key={order?._id || orderId} item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
                  <Card sx={{
                    cursor: "default",
                    transition: "transform 0.12s ease, box-shadow 0.12s ease",
                    boxShadow: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Order {orderId}
                        </Typography>
                        <StatusChip value={status} />
                      </Stack>
                      {itemCount != null && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {itemCount} item{itemCount === 1 ? "" : "s"}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          {createdAt}
                        </Typography>
                        <Divider orientation="vertical" flexItem />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Total: {currency(total)}
                        </Typography>
                      </Stack>
                      {deliveredAt && (
                        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                          Delivered: {deliveredAt}
                        </Typography>
                      )}
                      {address && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {address}
                        </Typography>
                      )}
                      <OrderImageStrip urls={imageUrls} />
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
                      {/* Add Product Rating buttons for each item */}
                      {Array.isArray(order?.items) && order.items.length > 0 && (
                        <Stack direction="column" spacing={1} sx={{ mt: 2 }}>
                          {order.items.map((item) => (
                            <Button
                              key={item._id}
                              size="small"
                              variant="contained"
                              color="secondary"
                              sx={{ textTransform: 'none', width: '100%' }}
                              onClick={() => navigate(`/rate/${orderId}/${item._id}`)}
                            >
                              Add Product Rating for {item.name}
                            </Button>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Typography>No delivered orders found.</Typography>
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
            background-color: #1976d2;
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
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseHistory;
