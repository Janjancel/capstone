
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
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import Loader from "./Loader";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MapIcon from "@mui/icons-material/Map";
import FilterListIcon from "@mui/icons-material/FilterList";
import * as XLSX from "xlsx";
import SellDashboardMap from "./SellDashboardMap";
import ReqDetailModal from "./ReqDetailModal"; // <— external modal handles PDF + details

const API_URL = process.env.REACT_APP_API_URL;

const SellDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Filter dropdown
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  // NEW: Date range filter (by createdAt)
  const [dateFrom, setDateFrom] = useState(""); // "YYYY-MM-DD"
  const [dateTo, setDateTo] = useState(""); // "YYYY-MM-DD"

  // ===== Reverse Geocoding State & Helpers (for table/export) =====
  const [addressMap, setAddressMap] = useState({}); // { "lat,lng": "Pretty address" }

  const fmtKey = (lat, lng) => `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;

  // Format price to Philippine Peso with comma separators
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0.00";
    const num = parseFloat(price);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // simple HTML-escape helper to avoid using non-public Swal helpers
  const escapeHtml = (unsafe) =>
    String(unsafe || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/`/g, "&#96;");

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

  const renderLocation = (loc) => {
    if (!(loc?.lat && loc?.lng)) return "N/A";
    const key = fmtKey(loc.lat, loc.lng);
    return addressMap[key] || `${loc.lat}, ${loc.lng} (looking up...)`;
  };
  // ===============================================================

  // --- Fetch Requests ---
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/sell`);
        setRequests(res.data);
        setFilteredRequests(res.data);
      } catch (err) {
        console.error("Error fetching sell requests:", err);
        setError("Failed to fetch sell requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // --- Kick off reverse-geocoding when requests change ---
  useEffect(() => {
    const run = async () => {
      const coords = requests
        .filter((r) => r?.location?.lat && r?.location?.lng)
        .map((r) => fmtKey(r.location.lat, r.location.lng));
      const unique = Array.from(new Set(coords));
      if (!unique.length) return;

      const seed = {};
      unique.forEach((k) => {
        const cached = getCachedAddress(k);
        if (cached) seed[k] = cached;
      });
      if (Object.keys(seed).length) setAddressMap((prev) => ({ ...seed, ...prev }));

      const missing = unique.filter((k) => !seed[k]);
      if (!missing.length) return;

      const results = {};

      const reverseGeocodeInline = async (lat, lng) => {
        const key = fmtKey(lat, lng);
        const cached = getCachedAddress(key);
        if (cached) return cached;

        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fil,en`;
        try {
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
        } catch (e) {
          return key;
        }
      };

      for (const k of missing) {
        const [lat, lng] = k.split(",").map(Number);
        try {
          // polite delay
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 150));
          // eslint-disable-next-line no-await-in-loop
          const addr = await reverseGeocodeInline(lat, lng);
          results[k] = addr;
        } catch {
          results[k] = k;
        }
      }
      setAddressMap((prev) => ({ ...prev, ...results }));
    };
    run();
  }, [requests]);

  // --- Helpers for date inputs / quick ranges ---
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

  // --- Filter & Search ---
  useEffect(() => {
    let filtered = requests.filter((request) => {
      const q = searchQuery.toLowerCase();
      const idText = (request.selId || request._id || "").toString().toLowerCase();

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
      filtered = filtered.filter((req) => req.price < 5000);
    } else if (priceFilter === "mid") {
      filtered = filtered.filter((req) => req.price >= 5000 && req.price <= 20000);
    } else if (priceFilter === "high") {
      filtered = filtered.filter((req) => req.price > 20000);
    }

    if (dateFrom || dateTo) {
      const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
      const toDate = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;

      filtered = filtered.filter((req) => {
        if (!req?.createdAt) return false;
        const created = new Date(req.createdAt);
        if (fromDate && created < fromDate) return false;
        if (toDate && created > toDate) return false;
        return true;
      });
    }

    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, priceFilter, requests, addressMap, dateFrom, dateTo]);

  // --- Action Handlers ---
  const handleStatusUpdate = async (id, newStatus) => {
    // If declining, ask for reason first
    let declineReason = null;

    if (newStatus === "declined") {
      const { value: reason } = await Swal.fire({
        title: "Reason for decline",
        input: "textarea",
        inputLabel: "Please provide a reason for declining this sell request.",
        inputPlaceholder: "Type the reason here...",
        inputAttributes: {
          "aria-label": "Reason for decline",
        },
        showCancelButton: true,
        confirmButtonText: "Decline request",
        cancelButtonText: "Cancel",
        preConfirm: (val) => {
          if (!val || !val.trim()) {
            Swal.showValidationMessage("Reason is required to decline the request.");
            return false;
          }
          return val.trim();
        },
      });

      if (!reason) {
        // user cancelled or validation failed -> don't proceed
        return;
      }
      declineReason = reason.trim();

      // Optional: confirm final
      const confirmDecline = await Swal.fire({
        title: "Confirm decline",
        html: `Are you sure you want to decline this request with the reason:<br/><em>${escapeHtml(
          declineReason
        )}</em>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, decline",
        cancelButtonText: "Cancel",
      });

      if (!confirmDecline.isConfirmed) return;
    } else {
      // For non-decline transitions, ask confirmation (existing behavior)
      const confirm = await Swal.fire({
        title: `Update status to "${newStatus}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, update it!",
        cancelButtonText: "Cancel",
      });
      if (!confirm.isConfirmed) return;
    }

    try {
      const payload = { status: newStatus };
      if (declineReason) payload.declineReason = declineReason;

      const res = await axios.patch(`${API_URL}/api/sell/${id}/status`, payload);

      // Update local state: include declineReason if present, or clear it otherwise
      setRequests((prev) =>
        prev.map((req) =>
          req._id === id
            ? {
                ...req,
                status: res.data.status || newStatus,
                declineReason: res.data.declineReason !== undefined ? res.data.declineReason : declineReason || null,
              }
            : req
        )
      );

      toast.success(
        newStatus === "declined"
          ? "Request declined"
          : `Request status updated to ${newStatus}`
      );

      // Notification handling (best-effort)
      const reqObj = requests.find((r) => r._id === id);
      const targetUserId = res?.data?.userId || reqObj?.userId;
      if (targetUserId) {
        try {
          // Build message including reason if declined
          const message =
            newStatus === "accepted"
              ? "Your sell request has been accepted."
              : newStatus === "declined"
              ? `Your sell request has been declined. Reason: ${declineReason}`
              : `Your sell request status was updated to "${newStatus.replace(/_/g, " ")}".`;

          await axios.post(`${API_URL}/api/notifications`, {
            userId: targetUserId,
            orderId: id,
            for: "sell",
            role: "client",
            status: newStatus,
            message,
          });
        } catch (e) {
          console.error("Failed to create sell notification:", e);
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleProposePrice = async (req) => {
    const { _id: id } = req || {};
    if (!id) return;

    // Allow proposing only after ocular or after a client decline
    const canPropose = req.status === "ocular_scheduled" || req.status === "price_declined";
    if (!canPropose) {
      Swal.fire(
        "Not allowed yet",
        "You can propose a price after an ocular visit or after a client decline.",
        "info"
      );
      return;
    }

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
      const res = await axios.patch(`${API_URL}/api/sell/${id}`, {
        proposedPrice: proposed,
        status: "awaiting_price_approval",
      });

      setRequests((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, ...res.data, proposedPrice: proposed, status: "awaiting_price_approval" } : r
        )
      );

      // Notify client to review price
      const targetUserId = res?.data?.userId || req.userId;
      await axios.post(`${API_URL}/api/notifications`, {
        userId: targetUserId,
        orderId: res?.data?._id || id,
        for: "sell",
        role: "client",
        status: "awaiting_price_approval",
        message: `Proposed sell price: ₱${proposed.toLocaleString()}. Please accept or decline.`,
      });

      toast.success(`Proposed price sent: ₱${proposed.toLocaleString()}`);
    } catch (error) {
      console.error("Error proposing price:", error);
      const msg = error?.response?.data?.message || "Failed to propose price";
      toast.error(msg);
    }
  };

  const handleScheduleOcular = async (id) => {
    const { value: date } = await Swal.fire({
      title: "Schedule Ocular Visit",
      input: "datetime-local",
      inputLabel: "Select date and time",
      inputAttributes: {
        min: new Date().toISOString().slice(0, 16),
      },
      showCancelButton: true,
      confirmButtonText: "Schedule",
    });

    if (!date) return;

    try {
      const res = await axios.patch(`${API_URL}/api/sell/${id}/schedule-ocular`, {
        ocularVisit: date,
      });

      // Update UI: ensure status becomes ocular_scheduled if API doesn't return it
      setRequests((prev) =>
        prev.map((req) =>
          req._id === id
            ? {
                ...req,
                ...res.data,
                status: res.data.status || "ocular_scheduled",
                ocularVisit: res.data.ocularVisit || date,
              }
            : req
        )
      );
      toast.success("Ocular visit scheduled successfully");

      // Notification
      const reqObj = requests.find((r) => r._id === id);
      const targetUserId = res?.data?.userId || reqObj?.userId;
      if (targetUserId) {
        try {
          await axios.post(`${API_URL}/api/notifications`, {
            userId: targetUserId,
            orderId: id,
            for: "sell",
            role: "client",
            status: "ocular_scheduled",
            message: `Your ocular visit has been scheduled on ${new Date(date).toLocaleString()}.`,
          });
        } catch (e) {
          console.error("Failed to create sell notification:", e);
        }
      }
    } catch (error) {
      console.error("Error scheduling ocular visit:", error);
      toast.error("Failed to schedule ocular visit");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure you want to delete this request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/sell/${id}`);
      setRequests((prev) => prev.filter((req) => req._id !== id));
      toast.success("Request deleted");
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("Failed to delete request");
    }
  };

  // --- Download Excel (kept) ---
  const handleDownloadExcel = () => {
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
    XLSX.utils.book_append_sheet(wb, ws, "Sell Requests");
    XLSX.writeFile(wb, "Sell_Requests.xlsx");
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

  // Helper: compute UI-disabled states for a request
  const computeActionDisabled = (request) => {
    const status = request?.status || "pending";
    const ocularScheduled = Boolean(request?.ocularVisit) || status === "ocular_scheduled";

    const acceptDisabled =
      status === "accepted" || // already accepted
      status === "declined" || // declined already
      (!ocularScheduled && status === "pending"); // pending without ocular -> must schedule first

    const declineDisabled = status === "declined" || status === "accepted"; // cannot decline if already decided
    // scheduleDisabled now also true when ocular is already scheduled
    const scheduleDisabled = status === "accepted" || status === "declined" || ocularScheduled; // cannot schedule after accept/decline or if already scheduled

    return { acceptDisabled, declineDisabled, scheduleDisabled };
  };

  // ====== UI ======
  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Top Bar */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h5">Sell Requests</Typography>
              <Tooltip title={showMap ? "Hide Map" : "Show Map"}>
                <IconButton onClick={() => setShowMap((prev) => !prev)}>
                  <MapIcon color={showMap ? "primary" : "action"} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Search + Filters */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <TextField size="small" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

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
                {["", "pending", "accepted", "declined", "ocular_scheduled"].map((status) => (
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

          {/* Status Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={statusFilter || ""}
              onChange={(e, newValue) => setStatusFilter(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All" value="" />
              <Tab label="Pending" value="pending" />
              <Tab label="Accepted" value="accepted" />
              <Tab label="Declined" value="declined" />
              <Tab label="Ocular Scheduled" value="ocular_scheduled" />
            </Tabs>
          </Box>

          {/* Map */}
          {showMap && (
            <Box sx={{ mb: 2 }}>
              <SellDashboardMap requests={filteredRequests} onClose={() => setShowMap(false)} />
            </Box>
          )}

          {/* Table */}
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.900" }}>
                    {["ID", "Name", "Contact", "Location", "Price", "Status", "Ocular Visit", "Actions"].map(
                      (head) => (
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
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => {
                      const displayId = request.selId || request._id;
                      const { acceptDisabled, declineDisabled, scheduleDisabled } = computeActionDisabled(request);
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
                          <TableCell>₱{formatPrice(request.price)}</TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                borderColor:
                                  request.status === "accepted"
                                    ? "success.main"
                                    : request.status === "declined"
                                    ? "error.main"
                                    : request.status === "ocular_scheduled"
                                    ? "info.main"
                                    : "warning.main",
                                color:
                                  request.status === "accepted"
                                    ? "success.main"
                                    : request.status === "declined"
                                    ? "error.main"
                                    : request.status === "ocular_scheduled"
                                    ? "info.main"
                                    : "warning.main",
                                px: 1.5,
                                py: 0.25,
                                borderRadius: 1,
                                display: "inline-block",
                                fontWeight: 500,
                                textTransform: "capitalize",
                              }}
                            >
                              {request.status || "pending"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {request.ocularVisit ? new Date(request.ocularVisit).toLocaleString() : "Not scheduled"}
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
                                  handleStatusUpdate(request._id, "accepted");
                                  handleMenuClose();
                                }}
                                disabled={acceptDisabled}
                                sx={{
                                  color: "success.main",
                                  fontWeight: 500,
                                  "&.Mui-disabled": { color: "success.light" },
                                  "&:hover": { bgcolor: "success.light", color: "white" },
                                }}
                              >
                                Accept
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  handleStatusUpdate(request._id, "declined");
                                  handleMenuClose();
                                }}
                                disabled={declineDisabled}
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
                                  handleScheduleOcular(request._id);
                                  handleMenuClose();
                                }}
                                disabled={scheduleDisabled}
                                sx={{
                                  color: "info.main",
                                  fontWeight: 500,
                                  "&.Mui-disabled": { color: "info.light" },
                                  "&:hover": { bgcolor: "info.light", color: "white" },
                                }}
                              >
                                Schedule Ocular Visit
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  handleProposePrice(request);
                                  handleMenuClose();
                                }}
                                sx={{
                                  color: "primary.main",
                                  fontWeight: 500,
                                  "&:hover": { bgcolor: "primary.light", color: "white" },
                                }}
                              >
                                Propose Price
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
                                  setSelectedRequest(request);
                                  handleMenuClose();
                                }}
                                sx={{
                                  color: "primary.main",
                                  fontWeight: 500,
                                  "&:hover": { bgcolor: "primary.light", color: "white" },
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

          {/* Download Excel */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button variant="contained" color="success" onClick={handleDownloadExcel}>
              Download Excel
            </Button>
          </Box>
        </>
      )}

      {/* --- Request Detail Modal (external component now owns the PDF button) --- */}
      {selectedRequest && <ReqDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
    </Box>
  );
};

export default SellDashboard;
