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
      filtered = filtered.filter((req) => req.price < 5000);
    } else if (priceFilter === "mid") {
      filtered = filtered.filter((req) => req.price >= 5000 && req.price <= 20000);
    } else if (priceFilter === "high") {
      filtered = filtered.filter((req) => req.price > 20000);
    }

    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, priceFilter, requests, addressMap]);

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

      try {
        await axios.post(`${API_URL}/api/notifications`, {
          userId: res.data.userId,
          orderId: res.data._id,
          message: `Your demolition request has been scheduled on ${new Date(date).toLocaleDateString()}`,
        });
      } catch (notifErr) {
        console.error("Failed to create notification:", notifErr);
      }

      toast.success(`Demolition scheduled on ${new Date(date).toLocaleDateString()}`);
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

      try {
        await axios.post(`${API_URL}/api/notifications`, {
          userId: res.data.userId,
          orderId: res.data._id,
          message: `Your ocular visit has been scheduled on ${new Date(date).toLocaleDateString()}`,
        });
      } catch (notifErr) {
        console.error("Failed to create notification:", notifErr);
      }

      toast.success(`Ocular visit scheduled on ${new Date(date).toLocaleDateString()}`);
    } catch (error) {
      console.error("Error scheduling ocular visit:", error);
      toast.error("Failed to schedule ocular visit");
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

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h5">Demolish Requests</Typography>
              <Tooltip title={showMap ? "Hide Map" : "Show Map"}>
                <IconButton onClick={() => setShowMap((prev) => !prev)}>
                  <MapIcon color={showMap ? "primary" : "action"} />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Tooltip title="Filter">
                <IconButton onClick={handleFilterOpen}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={handleFilterClose}>
                <MenuItem disabled>Filter by Status</MenuItem>
                {["", "pending", "scheduled", "ocular_scheduled", "declined"].map((status) => (
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
                <MenuItem divider />
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
                      // "Description", // REMOVED from table as requested
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
                          <TableCell>₱{request.price}</TableCell>
                          {/* Description column removed */}
                          <TableCell>
                            <Typography
                              sx={{
                                borderColor:
                                  request.status === "scheduled" || request.status === "ocular_scheduled"
                                    ? "success.main"
                                    : request.status === "declined"
                                    ? "error.main"
                                    : "warning.main",
                                color:
                                  request.status === "scheduled" || request.status === "ocular_scheduled"
                                    ? "success.main"
                                    : request.status === "declined"
                                    ? "error.main"
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
                      {/* One less column now (removed Description) => total columns = 8 */}
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
