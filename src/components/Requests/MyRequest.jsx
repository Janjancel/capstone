// src/components/Requests/MyRequest.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";

// Admin detail modals
import SellReqDetailModal from "../AdminDashboard/Requests/SellDashboard/ReqDetailModal";
import DemolishReqDetailModal from "../AdminDashboard/Requests/DemolishDashboard/ReqDetailModal";

function StatusChip({ value }) {
  const color =
    value === "accepted"
      ? "success"
      : value === "declined"
      ? "error"
      : value === "ocular_scheduled" || value === "scheduled"
      ? "primary"
      : value === "completed"
      ? "secondary"
      : value === "awaiting_price_approval"
      ? "info"
      : value === "price_accepted"
      ? "success"
      : value === "price_declined"
      ? "warning"
      : "default";
  const label = (value || "pending").replaceAll("_", " ");
  return <Chip size="small" color={color} label={label} sx={{ textTransform: "capitalize" }} />;
}

function ImageStrip({ images, onCardClickStop }) {
  const urls = [images?.front, images?.side, images?.back].filter(Boolean);
  if (!urls.length) return null;
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
      {urls.map((src, idx) => (
        <Box
          key={idx}
          component="img"
          src={src}
          alt={`preview-${idx}`}
          sx={{
            width: 84,
            height: 84,
            objectFit: "cover",
            borderRadius: 1.5,
            border: "1px solid #eee",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onCardClickStop) onCardClickStop(e);
            window.open(src, "_blank");
          }}
        />
      ))}
    </Stack>
  );
}

function EmptyState({ onSell, onDemolish }) {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h6" gutterBottom>No requests yet</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Start a new request to see it here.
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Button variant="contained" onClick={onSell}>Create Sell Request</Button>
        <Button variant="outlined" onClick={onDemolish}>Create Demolition Request</Button>
      </Stack>
    </Box>
  );
}

export default function MyRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const [tab, setTab] = useState("sell");
  const [loading, setLoading] = useState(true);
  const [sellRequests, setSellRequests] = useState([]);
  const [demoRequests, setDemoRequests] = useState([]);
  const [error, setError] = useState("");

  // Modal state
  const [openSellModal, setOpenSellModal] = useState(false);
  const [openDemoModal, setOpenDemoModal] = useState(false);
  const [selectedSell, setSelectedSell] = useState(null);
  const [selectedDemo, setSelectedDemo] = useState(null);

  // Per-item action loading (for accept/decline price)
  const [actingId, setActingId] = useState(null);

  const userId = user?._id;

  const load = useCallback(async () => {
    if (!userId) return;

    const tryEndpoints = async (endpoints) => {
      for (const path of endpoints) {
        try {
          const { data } = await axios.get(`${API_URL}${path}`);
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.data)) return data.data;
          if (Array.isArray(data?.requests)) return data.requests;
          if (Array.isArray(data?.sellRequest)) return data.sellRequest;
        } catch {
          // try next
        }
      }
      throw new Error("No matching endpoint responded.");
    };

    setLoading(true);
    setError("");
    try {
      const [sell, demo] = await Promise.all([
        tryEndpoints([
          "/api/sell-requests",
          "/api/sell",
          "/api/sellrequest",
          "/api/sell/requests",
        ]),
        tryEndpoints([
          "/api/demolition",
          "/api/demolitions",
          "/api/demolish",
        ]),
      ]);

      const byMe = (arr) =>
        (arr || []).filter((r) => {
          const rid = r.userId?._id || r.userId || r.user || r.ownerId;
          return String(rid) === String(userId);
        });

      setSellRequests(
        byMe(sell).sort(
          (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
        )
      );
      setDemoRequests(
        byMe(demo).sort(
          (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
        )
      );
    } catch (e) {
      setError(e?.message || "Failed to load requests.");
      toast.error(e?.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }, [API_URL, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const tabCounts = useMemo(
    () => ({
      sell: sellRequests.length,
      demolish: demoRequests.length,
    }),
    [sellRequests, demoRequests]
  );

  const handleCloseSell = () => {
    setOpenSellModal(false);
    setSelectedSell(null);
  };

  const handleCloseDemo = () => {
    setOpenDemoModal(false);
    setSelectedDemo(null);
  };

  // Merge helper to ensure price is set to the accepted price
  const mergeServerUpdateIntoItem = (oldItem, patchFromServer, accept, proposed) => {
    // Prefer server-confirmed price fields if present
    const serverPrice =
      patchFromServer?.price ??
      patchFromServer?.agreementPrice ??
      (accept ? proposed : undefined);

    const next = {
      ...oldItem,
      ...patchFromServer,
    };

    if (accept) {
      // Guarantee UI shows accepted price even if server didn't echo it back explicitly
      if (typeof serverPrice === "number") {
        next.price = serverPrice;
      }
      // Clear proposal once accepted (for UI clarity)
      next.proposedPrice = null;
      // Ensure status reflects acceptance
      next.status = patchFromServer?.status || "price_accepted";
      // Keep an explicit agreementPrice for clarity if server didn't provide it
      if (next.agreementPrice == null && typeof serverPrice === "number") {
        next.agreementPrice = serverPrice;
      }
    } else {
      // If declined, keep old price, keep server's proposedPrice if it returns (or leave as-is)
      next.status = patchFromServer?.status || "price_declined";
    }

    return next;
  };

  // ---- Send Counter Offer (Client proposes their own price) ----
  const handleCounterOffer = async (req) => {
    const id = req?._id || req?.id;
    if (!id) return;

    const { value: raw } = await Swal.fire({
      title: "Counter Offer Price (₱)",
      input: "number",
      inputAttributes: { min: "1", step: "1" },
      inputValue: req.price || "",
      showCancelButton: true,
      confirmButtonText: "Send Counter Offer",
      preConfirm: (v) => {
        const n = Number(v);
        if (!n || n <= 0) {
          Swal.showValidationMessage("Please enter a valid price greater than 0.");
          return false;
        }
        return n;
      },
    });

    if (!raw) return;
    const counterPrice = Number(raw);

    try {
      setActingId(id);

      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${API_URL}/api/demolish/${id}`,
        {
          proposedPrice: counterPrice,
          status: "awaiting_price_approval",
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      // Notify admin about counter offer
      try {
        await axios.post(`${API_URL}/api/notifications`, {
          role: "admin",
          for: "demolish",
          type: "client_counter_offer",
          status: "awaiting_price_approval",
          userId,
          orderId: id,
          read: false,
          message: `Client sent a counter offer: ₱${counterPrice.toLocaleString(
            "en-US",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}`,
          data: { counterPrice },
        });
      } catch (e) {
        console.error("Failed to notify admin of counter offer:", e);
      }

      const patchFromServer =
        res && res.data && typeof res.data === "object" ? res.data : null;

      // Update list
      setDemoRequests((prev) =>
        prev.map((item) => {
          if ((item._id || item.id) !== id) return item;
          return {
            ...item,
            ...patchFromServer,
            proposedPrice: counterPrice,
            status: "awaiting_price_approval",
          };
        })
      );

      // Update modal if open
      if (openDemoModal && selectedDemo && (selectedDemo._id || selectedDemo.id) === id) {
        setSelectedDemo((cur) => {
          if (!cur) return cur;
          return {
            ...cur,
            ...patchFromServer,
            proposedPrice: counterPrice,
            status: "awaiting_price_approval",
          };
        });
      }

      toast.success(
        `Counter offer sent: ₱${counterPrice.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      );
    } catch (err) {
      console.error("Error sending counter offer:", err);
      toast.error("Failed to send counter offer.");
    } finally {
      setActingId(null);
    }
  };

  // ---- Accept or Decline proposed demolition price ----
  const handleRespondToPrice = async (req, accept) => {
    const id = req?._id || req?.id;
    const proposed = Number(req?.proposedPrice || 0);
    if (!id || !proposed) return;

    // SweetAlert ONLY for confirmation
    const confirm = await Swal.fire({
      title: accept
        ? `Accept proposed price ₱${proposed.toLocaleString()}?`
        : `Decline proposed price ₱${proposed.toLocaleString()}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: accept ? "Accept" : "Decline",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      setActingId(id);

      // Backend only requires status; it will lock price from proposedPrice when accepted
      const payload = accept
        ? { status: "price_accepted" }
        : { status: "price_declined" };

      const token = localStorage.getItem("token");
      const res = await axios.patch(`${API_URL}/api/demolish/${id}`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      // Notify admin about client response (react-hot-toast is for user-facing notice)
      try {
        await axios.post(`${API_URL}/api/notifications`, {
          role: "admin",
          for: "demolish",
          type: "client_price_response",
          status: accept ? "price_accepted" : "price_declined",
          userId,                  // who responded
          orderId: id,             // demolish request id
          read: false,
          message: accept
            ? `Client accepted demolition price: ₱${proposed.toLocaleString()}`
            : `Client declined the proposed demolition price: ₱${proposed.toLocaleString()}`,
          data: accept
            ? { agreementPrice: proposed }
            : { proposedPrice: proposed },
        });
      } catch (e) {
        // Non-blocking; still show result toast to user
        console.error("Failed to notify admin of client price response:", e);
      }

      const patchFromServer =
        res && res.data && typeof res.data === "object" ? res.data : null;

      // Update list
      setDemoRequests((prev) =>
        prev.map((item) => {
          if ((item._id || item.id) !== id) return item;
          return mergeServerUpdateIntoItem(item, patchFromServer, accept, proposed);
        })
      );

      // Update open modal (if any)
      if (openDemoModal && selectedDemo && (selectedDemo._id || selectedDemo.id) === id) {
        setSelectedDemo((cur) => {
          if (!cur) return cur;
          return mergeServerUpdateIntoItem(cur, patchFromServer, accept, proposed);
        });
      }

      // react-hot-toast for general notifications
      toast.success(
        accept ? "You accepted the proposed price." : "You declined the proposed price."
      );
    } catch (err) {
      console.error("Error responding to price:", err);
      // react-hot-toast for errors
      toast.error("Failed to submit your response.");
    } finally {
      setActingId(null);
    }
  };

  if (!userId) {
    return (
      <Container sx={{ pt: 14, pb: 6 }}>
        <Toaster position="top-right" />
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" gutterBottom>Please sign in to view your requests.</Typography>
          <Button variant="contained" onClick={() => navigate("/")}>Go Home</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ pt: 14, pb: 6, maxWidth: "lg" }}>
      <Toaster position="top-right" />
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>My Requests</Typography>
        <Typography variant="body2" color="text.secondary">
          View your Sell and Demolition requests and their statuses.
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3 }}
        aria-label="request tabs"
      >
        <Tab value="sell" label={`Sell (${tabCounts.sell})`} />
        <Tab value="demolish" label={`Demolition (${tabCounts.demolish})`} />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="error" gutterBottom>{error}</Typography>
          <Button variant="outlined" onClick={() => window.location.reload()}>Retry</Button>
        </Box>
      ) : tab === "sell" ? (
        sellRequests.length === 0 ? (
          <EmptyState onSell={() => navigate("/sell")} onDemolish={() => setTab("demolish")} />
        ) : (
          <Grid container spacing={2}>
            {sellRequests.map((r) => {
              const created = r.createdAt || r.date;
              const loc = r.location || {};
              const address = r.display_name || r.displayName || r.address?.display_name;
              const lat = loc.lat ?? loc.latitude;
              const lng = loc.lng ?? loc.longitude;

              return (
                <Grid key={r._id || r.id} item xs={12} md={6}>
                  <Card
                    role="button"
                    onClick={() => {
                      setSelectedSell(r);
                      setOpenSellModal(true);
                    }}
                    sx={{
                      cursor: "pointer",
                      transition: "transform 0.12s ease, box-shadow 0.12s ease",
                      "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {r.name || "Sell Request"}
                        </Typography>
                        <StatusChip value={r.status} />
                      </Stack>

                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {r.description || "No description provided."}
                      </Typography>

                      <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          {created ? new Date(created).toLocaleString() : "—"}
                        </Typography>
                        <Divider orientation="vertical" flexItem />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ₱{Number(r.price || 0).toLocaleString()}
                        </Typography>
                      </Stack>

                      {address && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {address}
                        </Typography>
                      )}

                      <ImageStrip images={r.images} />

                      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                        {lat != null && lng != null && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
                            }}
                          >
                            Open Map
                          </Button>
                        )}
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/sell", {
                              state: {
                                sellRequest: {
                                  _id: r._id,
                                  name: r.name,
                                  description: r.description,
                                  price: r.price,
                                  location: r.location,
                                  images: r.images,
                                  contact: r.contact,
                                },
                              },
                            });
                          }}
                        >
                          Resubmit
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )
      ) : demoRequests.length === 0 ? (
        <EmptyState onSell={() => setTab("sell")} onDemolish={() => navigate("/demolish")} />
      ) : (
        <Grid container spacing={2}>
          {demoRequests.map((r) => {
            const created = r.createdAt || r.date;
            const loc = r.location || {};
            const address = r.display_name || r.displayName || r.address?.display_name;
            const lat = loc.lat ?? loc.latitude;
            const lng = loc.lng ?? loc.longitude;

            const hasProposal = typeof r?.proposedPrice === "number" && !Number.isNaN(r.proposedPrice);
            const waitingForApproval = r?.status === "awaiting_price_approval";
            const priceAccepted = r?.status === "price_accepted";
            const idKey = r._id || r.id;

            const effectiveAgreed =
              typeof r?.agreementPrice === "number"
                ? r.agreementPrice
                : typeof r?.price === "number"
                ? r.price
                : undefined;

            const priceDisplay =
              r.price == null ? "—" : `₱${Number(r.price).toLocaleString()}`;

            return (
              <Grid key={idKey} item xs={12} md={6}>
                <Card
                  role="button"
                  onClick={() => {
                    setSelectedDemo(r);
                    setOpenDemoModal(true);
                  }}
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.12s ease, box-shadow 0.12s ease",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {r.name || "Demolition Request"}
                      </Typography>
                      <StatusChip value={r.status} />
                    </Stack>

                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {r.description || "No description provided."}
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {created ? new Date(created).toLocaleString() : "—"}
                      </Typography>
                      <Divider orientation="vertical" flexItem />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {priceDisplay}
                      </Typography>
                    </Stack>

                    {/* Proposed price + actions (only while awaiting approval) */}
                    {hasProposal && waitingForApproval && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Proposed Price: <strong>₱{Number(r.proposedPrice).toLocaleString()}</strong>{" "}
                        (pending your approval)
                      </Typography>
                    )}

                    {priceAccepted && typeof effectiveAgreed === "number" && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Agreed Price: <strong>₱{Number(effectiveAgreed).toLocaleString()}</strong>
                      </Typography>
                    )}

                    {waitingForApproval && (
                      <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={1.5}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={actingId === idKey}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRespondToPrice(r, true);
                            }}
                            sx={{ flex: 1 }}
                          >
                            {actingId === idKey ? "Working..." : "Accept"}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            disabled={actingId === idKey}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCounterOffer(r);
                            }}
                            sx={{ flex: 1 }}
                          >
                            {actingId === idKey ? "Sending..." : "Counter Offer"}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            disabled={actingId === idKey}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRespondToPrice(r, false);
                            }}
                            sx={{ flex: 1 }}
                          >
                            Decline
                          </Button>
                        </Stack>
                      </Stack>
                    )}

                    {address && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {address}
                      </Typography>
                    )}

                    <ImageStrip images={r.images} />

                    <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                      {lat != null && lng != null && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
                          }}
                        >
                          Open Map
                        </Button>
                      )}
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/demolish", {
                            state: {
                              demolishRequest: {
                                _id: r._id,
                                name: r.name,
                                description: r.description,
                                price: r.price,
                                location: r.location,
                                images: r.images,
                                contact: r.contact,
                              },
                            },
                          });
                        }}
                      >
                        Resubmit
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Detail Modals — render ONLY when a record is selected */}
      {openSellModal && selectedSell && (
        <SellReqDetailModal
          request={selectedSell}
          onClose={handleCloseSell}
        />
      )}

      {openDemoModal && selectedDemo && (
        <DemolishReqDetailModal
          request={selectedDemo}
          onClose={handleCloseDemo}
        />
      )}
    </Container>
  );
}
