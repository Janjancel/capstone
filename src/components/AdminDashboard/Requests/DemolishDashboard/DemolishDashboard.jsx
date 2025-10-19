// src/components/AdminDashboard/Requests/DemolishDashboard/DemolishDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import {
  Box,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Divider, // ← added
} from "@mui/material";
import Loader from "./Loader";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MapIcon from "@mui/icons-material/Map";
import FilterListIcon from "@mui/icons-material/FilterList";
import * as XLSX from "xlsx";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ReqDetailModal from "./ReqDetailModal";
import DemolishDashboardMap from "./DemolishDashboardMap";

const markerIcon2x = require("leaflet/dist/images/marker-icon-2x.png");
const markerIcon = require("leaflet/dist/images/marker-icon.png");
const markerShadow = require("leaflet/dist/images/marker-shadow.png");

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const API_URL = process.env.REACT_APP_API_URL;

const DemolishDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const [filterAnchor, setFilterAnchor] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  // NEW: Date range filter (by createdAt)
  const [dateFrom, setDateFrom] = useState(""); // "YYYY-MM-DD"
  const [dateTo, setDateTo] = useState("");     // "YYYY-MM-DD"

  // ===== Reverse Geocoding State & Helpers =====
  const [addressMap, setAddressMap] = useState({}); // { "lat,lng": "Pretty address" }

  const fmtKey = (lat, lng) => `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;

  const getCachedAddress = (key) => {
    try {
      const raw = localStorage.getItem("geo_address_cache");
      if (!raw) return null;
      const json = JSON.parse(raw);
      return json[key] || null;
    } catch {
      return null;
    }
  };

  const setCachedAddress = (key, val) => {
    try {
      const raw = localStorage.getItem("geo_address_cache");
      const json = raw ? JSON.parse(raw) : {};
      json[key] = val;
      localStorage.setItem("geo_address_cache", JSON.stringify(json));
    } catch {}
  };

  const reverseGeocode = async (lat, lng) => {
    const key = fmtKey(lat, lng);
    const cached = getCachedAddress(key);
    if (cached) return cached;

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fil,en`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("Reverse geocode failed");

    const data = await res.json();
    const a = data.address || {};
    const pretty =
      data.display_name ||
      [a.road, a.suburb || a.village || a.barangay, a.town || a.city || a.municipality, a.state, a.country]
        .filter(Boolean)
        .join(", ");
    const value = pretty || key;

    setCachedAddress(key, value);
    return value;
  };

  const renderLocation = (loc) => {
    if (!(loc?.lat && loc?.lng)) return "N/A";
    const key = fmtKey(loc.lat, loc.lng);
    return addressMap[key] || `${loc.lat}, ${loc.lng} (looking up...)`;
  };
  // =============================================

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/demolish`);
        setRequests(res.data);
        setFilteredRequests(res.data);
      } catch (err) {
        console.error("Error fetching demolish requests:", err);
        setError("Failed to fetch demolish requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Kick off reverse geocoding when requests change
  useEffect(() => {
    const run = async () => {
      const coords = requests
        .filter((r) => r?.location?.lat && r?.location?.lng)
        .map((r) => fmtKey(r.location.lat, r.location.lng));
      const unique = Array.from(new Set(coords));
      if (!unique.length) return;

      // Seed from localStorage
      const seed = {};
      unique.forEach((k) => {
        const cached = getCachedAddress(k);
        if (cached) seed[k] = cached;
      });
      if (Object.keys(seed).length) setAddressMap((prev) => ({ ...seed, ...prev }));

      const missing = unique.filter((k) => !seed[k]);
      if (!missing.length) return;

      const results = {};
      for (const k of missing) {
        const [lat, lng] = k.split(",").map(Number);
        try {
          // be polite to the API
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 150));
          // eslint-disable-next-line no-await-in-loop
          const addr = await reverseGeocode(lat, lng);
          results[k] = addr;
        } catch {
          results[k] = k; // fallback to coords if error
        }
      }
      setAddressMap((prev) => ({ ...prev, ...results }));
    };
    run();
  }, [requests]);

  // Helpers for date inputs / quick ranges
  const toInputDate = (d) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
  };

  const applyQuickRange = (range) => {
    const now = new Date();
    const today = toInputDate(now);

    if (range === "today") {
      setDateFrom(today);
      setDateTo(today);
      return;
    }
    if (range === "last7") {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      setDateFrom(toInputDate(from));
      setDateTo(today);
      return;
    }
    if (range === "last30") {
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      setDateFrom(toInputDate(from));
      setDateTo(today);
      return;
    }
    if (range === "clear") {
      setDateFrom("");
      setDateTo("");
    }
  };

  useEffect(() => {
    let filtered = requests.filter((request) => {
      const q = searchQuery.toLowerCase();
      const idText = (request.demolishId || request._id || "").toString().toLowerCase();

      // Also allow searching by human-readable address
      let addressText = "";
      if (request?.location?.lat && request?.location?.lng) {
        const key = fmtKey(request.location.lat, request.location.lng);
        addressText = (addressMap[key] || "").toLowerCase();
      }

      return (
        idText.includes(q) ||
        (request.name || "").toLowerCase().includes(q) ||
        (request.contact || "").toLowerCase().includes(q) ||
        (request.description || "").toLowerCase().includes(q) ||
        addressText.includes(q)
      );
    });

    if (statusFilter) {
      filtered = filtered.filter((req) => (req.status || "pending") === statusFilter);
    }

    if (priceFilter === "low") {
      filtered = filtered.filter((req) => (req.proposedPrice ?? req.price) < 5000);
    } else if (priceFilter === "mid") {
      filtered = filtered.filter((req) => {
        const p = req.proposedPrice ?? req.price;
        return p >= 5000 && p <= 20000;
      });
    } else if (priceFilter === "high") {
      filtered = filtered.filter((req) => (req.proposedPrice ?? req.price) > 20000);
    }

    // NEW: Date range filter (by createdAt)
    if (dateFrom || dateTo) {
      const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
      const toDate = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;

      filtered = filtered.filter((req) => {
        if (!req?.createdAt) return false; // exclude when filtering if no timestamp
        const created = new Date(req.createdAt);
        if (fromDate && created < fromDate) return false;
        if (toDate && created > toDate) return false;
        return true;
      });
    }

    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, priceFilter, requests, addressMap, dateFrom, dateTo]);

  // ===== Minimal notification helper (FOR: "demolish") =====
  const createDemolishNotification = async ({ userId, requestId, status, message }) => {
    if (!userId || !requestId) return;
    try {
      await axios.post(`${API_URL}/api/notifications`, {
        userId,
        orderId: requestId, // storing the demolish request id here (same pattern as Sell)
        for: "demolish",     // ← important
        role: "client",
        status,
        message,
      });
    } catch (err) {
      console.error("Failed to create demolish notification:", err);
    }
  };
  // ========================================================

  // SCHEDULE DEMOLITION
  const handleScheduleDemolition = async (id) => {
    const { value: date } = await Swal.fire({
      title: "Pick a demolition date",
      input: "date",
      inputAttributes: {
        min: new Date().toISOString().split("T")[0],
      },
      showCancelButton: true,
      confirmButtonText: "Schedule",
    });

    if (!date) return;

    try {
      const res = await axios.patch(`${API_URL}/api/demolish/${id}`, {
        status: "scheduled",
        scheduledDate: date,
      });

      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, ...res.data } : r)));

      // Notify client
      const targetUserId = res?.data?.userId || requests.find((r) => r._id === id)?.userId;
      const niceDate = new Date(date).toLocaleDateString();
      await createDemolishNotification({
        userId: targetUserId,
        requestId: res?.data?._id || id,
        status: "scheduled",
        message: `Your demolition request has been scheduled on ${niceDate}.`,
      });

      toast.success(`Demolition scheduled on ${niceDate}`);
    } catch (error) {
      console.error("Error scheduling:", error);
      toast.error("Failed to schedule demolition");
    }
  };

  // SCHEDULE OCULAR VISIT
  const handleScheduleOcular = async (id) => {
    const { value: date } = await Swal.fire({
      title: "Pick an ocular visit date",
      input: "date",
      inputAttributes: {
        min: new Date().toISOString().split("T")[0],
      },
      showCancelButton: true,
      confirmButtonText: "Schedule",
    });

    if (!date) return;

    try {
      const res = await axios.patch(`${API_URL}/api/demolish/${id}`, {
        status: "ocular_scheduled",
        scheduledDate: date,
      });

      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, ...res.data } : r)));

      // Notify client
      const targetUserId = res?.data?.userId || requests.find((r) => r._id === id)?.userId;
      const niceDate = new Date(date).toLocaleDateString();
      await createDemolishNotification({
        userId: targetUserId,
        requestId: res?.data?._id || id,
        status: "ocular_scheduled",
        message: `Your ocular visit has been scheduled on ${niceDate}.`,
      });

      toast.success(`Ocular visit scheduled on ${niceDate}`);
    } catch (error) {
      console.error("Error scheduling ocular visit:", error);
      toast.error("Failed to schedule ocular visit");
    }
  };

  // NEW: PROPOSE PRICE (after ocular) -> notifies client to accept/decline
  const handleProposePrice = async (req) => {
    const { _id: id } = req || {};
    if (!id) return;

    const { value: raw } = await Swal.fire({
      title: "Propose Price (₱)",
      input: "number",
      inputAttributes: { min: "1", step: "1" },
      inputValue: req.proposedPrice || req.price || "",
      showCancelButton: true,
      confirmButtonText: "Send to Client",
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
    const proposed = Number(raw);

    try {
      // Save proposal on the request and set status awaiting approval.
      const res = await axios.patch(`${API_URL}/api/demolish/${id}`, {
        proposedPrice: proposed,
        status: "awaiting_price_approval",
      });

      // Update local state (fallback if backend only returns partial)
      setRequests((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, ...res.data, proposedPrice: proposed, status: "awaiting_price_approval" } : r
        )
      );

      // Notify client to review price
      const targetUserId = res?.data?.userId || req.userId;
      await createDemolishNotification({
        userId: targetUserId,
        requestId: res?.data?._id || id,
        status: "awaiting_price_approval",
        message: `Proposed demolition price: ₱${proposed.toLocaleString()}. Please accept or decline.`,
      });

      toast.success(`Proposed price sent: ₱${proposed.toLocaleString()}`);
    } catch (error) {
      console.error("Error proposing price:", error);
      toast.error("Failed to propose price");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const confirm = await Swal.fire({
      title: `Update status to "${newStatus}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.patch(`${API_URL}/api/demolish/${id}`, {
        status: newStatus,
      });
      setRequests((prev) => prev.map((req) => (req._id === id ? { ...req, status: res.data.status } : req)));
      toast.success(`Request ${newStatus}`);

      // Notify client on key status changes
      const targetUserId = res?.data?.userId || requests.find((r) => r._id === id)?.userId;
      if (targetUserId) {
        let msg = "Your demolition request has been updated.";
        if (newStatus === "declined") msg = "Your demolition request was declined.";
        if (newStatus === "price_accepted") msg = "Price accepted. We will proceed with next steps.";
        if (newStatus === "price_declined") msg = "Price declined. Please contact support if needed.";
        if (newStatus === "completed") msg = "Your demolition request has been completed.";

        await createDemolishNotification({
          userId: targetUserId,
          requestId: res?.data?._id || id,
          status: newStatus,
          message: msg,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure you want to delete this request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/demolish/${id}`);
      setRequests((prev) => prev.filter((req) => req._id !== id));
      toast.success("Request deleted");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete request");
    }
  };

  const handleDownloadExcel = () => {
    // Export with a human-readable location
    const exportData = filteredRequests.map(({ images, location, ...rest }) => {
      let address = "N/A";
      if (location?.lat && location?.lng) {
        const key = fmtKey(location.lat, location.lng);
        address = addressMap[key] || `${location.lat}, ${location.lng}`;
      }
      return { ...rest, location: address };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Demolish Requests");
    XLSX.writeFile(wb, "Demolish_Requests.xlsx");
  };

  const handleMenuOpen = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setActiveRowId(rowId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveRowId(null);
  };

  const handleFilterOpen = (event) => setFilterAnchor(event.currentTarget);
  const handleFilterClose = () => setFilterAnchor(null);

  const statusColor = (status) => {
    switch (status) {
      case "scheduled":
      case "ocular_scheduled":
        return { border: "success.main", color: "success.main" };
      case "awaiting_price_approval":
        return { border: "info.main", color: "info.main" };
      case "price_accepted":
        return { border: "success.dark", color: "success.dark" };
      case "price_declined":
      case "declined":
        return { border: "error.main", color: "error.main" };
      default:
        return { border: "warning.main", color: "warning.main" };
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h5">Demolish Requests</Typography>
              <Tooltip title={showMap ? "Hide Map" : "Show Map"}>
                <IconButton onClick={() => setShowMap((prev) => !prev)}>
                  <MapIcon color={showMap ? "primary" : "action"} />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <TextField
                size="small"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* NEW: Date range inputs */}
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

              <Tooltip title="Filter">
                <IconButton onClick={handleFilterOpen}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={handleFilterClose}>
                <MenuItem disabled>Filter by Status</MenuItem>
                {[
                  "",
                  "pending",
                  "scheduled",
                  "ocular_scheduled",
                  "awaiting_price_approval",
                  "price_accepted",
                  "price_declined",
                  "declined",
                ].map((status) => (
                  <MenuItem
                    key={status || "all"}
                    onClick={() => {
                      setStatusFilter(status);
                      handleFilterClose();
                    }}
                    selected={statusFilter === status}
                  >
                    {status || "All"}
                  </MenuItem>
                ))}

                <Divider />

                <MenuItem disabled>Filter by Price</MenuItem>
                {[
                  { label: "All", value: "" },
                  { label: "Below ₱5,000", value: "low" },
                  { label: "₱5,000 – ₱20,000", value: "mid" },
                  { label: "Above ₱20,000", value: "high" },
                ].map((price) => (
                  <MenuItem
                    key={price.value}
                    onClick={() => {
                      setPriceFilter(price.value);
                      handleFilterClose();
                    }}
                    selected={priceFilter === price.value}
                  >
                    {price.label}
                  </MenuItem>
                ))}

                <Divider />

                {/* NEW: Quick Date Ranges */}
                <MenuItem disabled>Quick Date Range</MenuItem>
                <MenuItem
                  onClick={() => {
                    applyQuickRange("today");
                    handleFilterClose();
                  }}
                >
                  Today
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    applyQuickRange("last7");
                    handleFilterClose();
                  }}
                >
                  Last 7 days
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    applyQuickRange("last30");
                    handleFilterClose();
                  }}
                >
                  Last 30 days
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    applyQuickRange("clear");
                    handleFilterClose();
                  }}
                >
                  Clear date range
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {showMap && (
            <Box sx={{ mb: 2 }}>
              <DemolishDashboardMap requests={filteredRequests} onClose={() => setShowMap(false)} />
            </Box>
          )}

          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.900" }}>
                    {[
                      "ID",
                      "Name",
                      "Contact",
                      "Location",
                      "Price",
                      "Status",
                      "Scheduled Date",
                      "Actions",
                    ].map((head) => (
                      <TableCell
                        key={head}
                        sx={{
                          color: "#202020ff",
                          fontWeight: "bold",
                          background: "#d3d3d3ff",
                        }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => {
                      const displayId = request.demolishId || request._id;
                      const { border, color } = statusColor(request.status);

                      // Price display:
                      const priceNow = Number(request.price || 0);
                      const hasProposal = typeof request.proposedPrice === "number";
                      const proposed = Number(request.proposedPrice || 0);
                      const waiting = request.status === "awaiting_price_approval";

                      return (
                        <TableRow
                          key={request._id}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => setSelectedRequest(request)}
                        >
                          <TableCell>{displayId}</TableCell>
                          <TableCell>{request.name}</TableCell>
                          <TableCell>{request.contact}</TableCell>
                          <TableCell>{renderLocation(request.location)}</TableCell>
                          <TableCell>
                            <div>
                              <strong>₱{priceNow.toLocaleString()}</strong>
                            </div>
                            {hasProposal && (
                              <div style={{ fontSize: 12, opacity: 0.8 }}>
                                Proposed: ₱{proposed.toLocaleString()} {waiting ? "(pending)" : ""}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                borderColor: border,
                                color,
                                px: 1.5,
                                py: 0.25,
                                borderRadius: 1,
                                display: "inline-block",
                                fontWeight: 500,
                                textTransform: "capitalize",
                                borderStyle: "solid",
                                borderWidth: 1,
                              }}
                            >
                              {request.status || "pending"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {request.scheduledDate ? new Date(request.scheduledDate).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <IconButton onClick={(e) => handleMenuOpen(e, request._id)}>
                              <MoreVertIcon />
                            </IconButton>

                            <Menu
                              anchorEl={anchorEl}
                              open={activeRowId === request._id}
                              onClose={handleMenuClose}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MenuItem
                                onClick={() => {
                                  handleScheduleDemolition(request._id);
                                  handleMenuClose();
                                }}
                                sx={{
                                  color: "success.main",
                                  fontWeight: 500,
                                  "&:hover": { bgcolor: "success.light", color: "white" },
                                }}
                              >
                                Schedule Demolition
                              </MenuItem>

                              <MenuItem
                                onClick={() => {
                                  handleScheduleOcular(request._id);
                                  handleMenuClose();
                                }}
                                sx={{
                                  color: "info.main",
                                  fontWeight: 500,
                                  "&:hover": { bgcolor: "info.light", color: "white" },
                                }}
                              >
                                Schedule Ocular Visit
                              </MenuItem>

                              {/* NEW: Propose Price (after ocular) */}
                              <MenuItem
                                onClick={() => {
                                  handleProposePrice(request);
                                  handleMenuClose();
                                }}
                                disabled={
                                  request.status === "declined" ||
                                  request.status === "awaiting_price_approval" ||
                                  request.status === "price_accepted"
                                }
                                sx={{
                                  color: "primary.main",
                                  fontWeight: 500,
                                  "&.Mui-disabled": { color: "primary.light" },
                                  "&:hover": { bgcolor: "primary.light", color: "white" },
                                }}
                              >
                                Propose Price
                              </MenuItem>

                              <MenuItem
                                onClick={() => {
                                  handleStatusUpdate(request._id, "declined");
                                  handleMenuClose();
                                }}
                                disabled={request.status === "declined"}
                                sx={{
                                  color: "warning.main",
                                  fontWeight: 500,
                                  "&.Mui-disabled": { color: "warning.light" },
                                  "&:hover": { bgcolor: "warning.light", color: "white" },
                                }}
                              >
                                Decline
                              </MenuItem>

                              <MenuItem
                                onClick={() => {
                                  handleDelete(request._id);
                                  handleMenuClose();
                                }}
                                sx={{
                                  color: "error.main",
                                  fontWeight: 500,
                                  "&:hover": { bgcolor: "error.light", color: "white" },
                                }}
                              >
                                Delete
                              </MenuItem>

                              <MenuItem
                                onClick={() => {
                                  // Open the modal; the modal owns the PDF download now
                                  setSelectedRequest(request);
                                  handleMenuClose();
                                }}
                                sx={{
                                  color: "secondary.main",
                                  fontWeight: 500,
                                  "&:hover": { bgcolor: "secondary.light", color: "white" },
                                }}
                              >
                                Download PDF
                              </MenuItem>
                            </Menu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ color: "grey.500" }}>
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button variant="contained" color="success" onClick={handleDownloadExcel}>
              Download Excel
            </Button>
          </Box>

          {selectedRequest && (
            <ReqDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
          )}
        </>
      )}
    </Box>
  );
};

export default DemolishDashboard;
