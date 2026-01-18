
// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   Box,
//   Typography,
//   TextField,
//   TableContainer,
//   Table,
//   TableHead,
//   TableBody,
//   TableRow,
//   TableCell,
//   Paper,
//   Button,
//   Menu,
//   MenuItem,
//   IconButton,
//   Tooltip,
//   Divider,
// } from "@mui/material";
// import Loader from "./Loader";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import MapIcon from "@mui/icons-material/Map";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import * as XLSX from "xlsx";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import ReqDetailModal from "./ReqDetailModal";
// import DemolishDashboardMap from "./DemolishDashboardMap";

// const markerIcon2x = require("leaflet/dist/images/marker-icon-2x.png");
// const markerIcon = require("leaflet/dist/images/marker-icon.png");
// const markerShadow = require("leaflet/dist/images/marker-shadow.png");

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// const API_URL = process.env.REACT_APP_API_URL;

// const DemolishDashboard = () => {
//   const [requests, setRequests] = useState([]);
//   const [filteredRequests, setFilteredRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedRequest, setSelectedRequest] = useState(null);

//   const [anchorEl, setAnchorEl] = useState(null);
//   const [activeRowId, setActiveRowId] = useState(null);
//   const [showMap, setShowMap] = useState(false);

//   const [filterAnchor, setFilterAnchor] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [priceFilter, setPriceFilter] = useState("");

//   // NEW: Date range filter (by createdAt)
//   const [dateFrom, setDateFrom] = useState(""); // "YYYY-MM-DD"
//   const [dateTo, setDateTo] = useState(""); // "YYYY-MM-DD"

//   // ===== Reverse Geocoding State & Helpers =====
//   const [addressMap, setAddressMap] = useState({}); // { "lat,lng": "Pretty address" }

//   const fmtKey = useCallback((lat, lng) => `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`, []);

//   const getCachedAddress = useCallback((key) => {
//     try {
//       const raw = localStorage.getItem("geo_address_cache");
//       if (!raw) return null;
//       const json = JSON.parse(raw);
//       return json[key] || null;
//     } catch {
//       return null;
//     }
//   }, []);

//   const setCachedAddress = useCallback((key, val) => {
//     try {
//       const raw = localStorage.getItem("geo_address_cache");
//       const json = raw ? JSON.parse(raw) : {};
//       json[key] = val;
//       localStorage.setItem("geo_address_cache", JSON.stringify(json));
//     } catch {}
//   }, []);

//   const reverseGeocode = useCallback(
//     async (lat, lng) => {
//       const key = fmtKey(lat, lng);
//       const cached = getCachedAddress(key);
//       if (cached) return cached;

//       const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fil,en`;
//       const res = await fetch(url, { headers: { Accept: "application/json" } });
//       if (!res.ok) throw new Error("Reverse geocode failed");

//       const data = await res.json();
//       const a = data.address || {};
//       const pretty =
//         data.display_name ||
//         [a.road, a.suburb || a.village || a.barangay, a.town || a.city || a.municipality, a.state, a.country]
//           .filter(Boolean)
//           .join(", ");
//       const value = pretty || key;

//       setCachedAddress(key, value);
//       return value;
//     },
//     [fmtKey, getCachedAddress, setCachedAddress]
//   );

//   const renderLocation = (loc) => {
//     if (!(loc?.lat && loc?.lng)) return "N/A";
//     const key = fmtKey(loc.lat, loc.lng);
//     return addressMap[key] || `${loc.lat}, ${loc.lng} (looking up...)`;
//   };
//   // =============================================

//   useEffect(() => {
//     const fetchRequests = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/demolish`);
//         setRequests(res.data);
//         setFilteredRequests(res.data);
//       } catch (err) {
//         console.error("Error fetching demolish requests:", err);
//         setError("Failed to fetch demolish requests.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchRequests();
//   }, []);

//   // Kick off reverse geocoding when requests change
//   useEffect(() => {
//     const run = async () => {
//       const coords = requests
//         .filter((r) => r?.location?.lat && r?.location?.lng)
//         .map((r) => fmtKey(r.location.lat, r.location.lng));
//       const unique = Array.from(new Set(coords));
//       if (!unique.length) return;

//       // Seed from localStorage
//       const seed = {};
//       unique.forEach((k) => {
//         const cached = getCachedAddress(k);
//         if (cached) seed[k] = cached;
//       });
//       if (Object.keys(seed).length) setAddressMap((prev) => ({ ...seed, ...prev }));

//       const missing = unique.filter((k) => !seed[k]);
//       if (!missing.length) return;

//       const results = {};
//       for (const k of missing) {
//         const [lat, lng] = k.split(",").map(Number);
//         try {
//           // be polite to the API
//           // eslint-disable-next-line no-await-in-loop
//           await new Promise((r) => setTimeout(r, 150));
//           // eslint-disable-next-line no-await-in-loop
//           const addr = await reverseGeocode(lat, lng);
//           results[k] = addr;
//         } catch {
//           results[k] = k; // fallback to coords if error
//         }
//       }
//       setAddressMap((prev) => ({ ...prev, ...results }));
//     };
//     run();
//   }, [requests, fmtKey, getCachedAddress, reverseGeocode]);

//   // Helpers for date inputs / quick ranges
//   const toInputDate = (d) => {
//     const tzOffset = d.getTimezoneOffset() * 60000;
//     return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
//   };

//   const applyQuickRange = (range) => {
//     const now = new Date();
//     const today = toInputDate(now);

//     if (range === "today") {
//       setDateFrom(today);
//       setDateTo(today);
//       return;
//     }
//     if (range === "last7") {
//       const from = new Date(now);
//       from.setDate(from.getDate() - 6);
//       setDateFrom(toInputDate(from));
//       setDateTo(today);
//       return;
//     }
//     if (range === "last30") {
//       const from = new Date(now);
//       from.setDate(from.getDate() - 29);
//       setDateFrom(toInputDate(from));
//       setDateTo(today);
//       return;
//     }
//     if (range === "clear") {
//       setDateFrom("");
//       setDateTo("");
//     }
//   };

//   useEffect(() => {
//     let filtered = requests.filter((request) => {
//       const q = searchQuery.toLowerCase();
//       const idText = (request.demolishId || request._id || "").toString().toLowerCase();

//       // Also allow searching by human-readable address
//       let addressText = "";
//       if (request?.location?.lat && request?.location?.lng) {
//         const key = fmtKey(request.location.lat, request.location.lng);
//         addressText = (addressMap[key] || "").toLowerCase();
//       }

//       return (
//         idText.includes(q) ||
//         (request.name || "").toLowerCase().includes(q) ||
//         (request.contact || "").toLowerCase().includes(q) ||
//         (request.description || "").toLowerCase().includes(q) ||
//         addressText.includes(q)
//       );
//     });

//     if (statusFilter) {
//       filtered = filtered.filter((req) => (req.status || "pending") === statusFilter);
//     }

//     if (priceFilter === "low") {
//       filtered = filtered.filter((req) => (req.proposedPrice ?? req.price ?? Infinity) < 5000);
//     } else if (priceFilter === "mid") {
//       filtered = filtered.filter((req) => {
//         const p = req.proposedPrice ?? req.price;
//         return p != null && p >= 5000 && p <= 20000;
//       });
//     } else if (priceFilter === "high") {
//       filtered = filtered.filter((req) => (req.proposedPrice ?? req.price ?? -Infinity) > 20000);
//     }

//     // NEW: Date range filter (by createdAt)
//     if (dateFrom || dateTo) {
//       const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
//       const toDate = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;

//       filtered = filtered.filter((req) => {
//         if (!req?.createdAt) return false; // exclude when filtering if no timestamp
//         const created = new Date(req.createdAt);
//         if (fromDate && created < fromDate) return false;
//         if (toDate && created > toDate) return false;
//         return true;
//       });
//     }

//     setFilteredRequests(filtered);
//   }, [searchQuery, statusFilter, priceFilter, requests, addressMap, dateFrom, dateTo, fmtKey]);

//   // ===== Minimal notification helper (FOR: "demolish") =====
//   const createDemolishNotification = async ({ userId, requestId, status, message }) => {
//     if (!userId || !requestId) return;
//     try {
//       await axios.post(`${API_URL}/api/notifications`, {
//         userId,
//         orderId: requestId, // storing the demolish request id here (same pattern as Sell)
//         for: "demolish", // ← important
//         role: "client",
//         status,
//         message,
//       });
//     } catch (err) {
//       console.error("Failed to create demolish notification:", err);
//     }
//   };
//   // ========================================================

//   // SCHEDULE DEMOLITION (guard: only after price_accepted)
//   const handleScheduleDemolition = async (id) => {
//     const current = requests.find((r) => r._id === id);
//     if (!current || current.status !== "price_accepted" || current.price == null) {
//       Swal.fire(
//         "Price not accepted yet",
//         "You can only schedule demolition after the client accepts the proposed price.",
//         "info"
//       );
//       return;
//     }

//     const { value: date } = await Swal.fire({
//       title: "Pick a demolition date",
//       input: "date",
//       inputAttributes: {
//         min: new Date().toISOString().split("T")[0],
//       },
//       showCancelButton: true,
//       confirmButtonText: "Schedule",
//     });

//     if (!date) return;

//     try {
//       const res = await axios.patch(`${API_URL}/api/demolish/${id}`, {
//         status: "scheduled",
//         scheduledDate: date,
//       });

//       setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, ...res.data } : r)));

//       // Notify client
//       const targetUserId = res?.data?.userId || requests.find((r) => r._id === id)?.userId;
//       const niceDate = new Date(date).toLocaleDateString();
//       await createDemolishNotification({
//         userId: targetUserId,
//         requestId: res?.data?._id || id,
//         status: "scheduled",
//         message: `Your demolition request has been scheduled on ${niceDate}.`,
//       });

//       toast.success(`Demolition scheduled on ${niceDate}`);
//     } catch (error) {
//       console.error("Error scheduling:", error);
//       const msg = error?.response?.data?.error || "Failed to schedule demolition";
//       toast.error(msg);
//     }
//   };

//   // SCHEDULE OCULAR VISIT
//   const handleScheduleOcular = async (id) => {
//     const { value: date } = await Swal.fire({
//       title: "Pick an ocular visit date",
//       input: "date",
//       inputAttributes: {
//         min: new Date().toISOString().split("T")[0],
//       },
//       showCancelButton: true,
//       confirmButtonText: "Schedule",
//     });

//     if (!date) return;

//     try {
//       const res = await axios.patch(`${API_URL}/api/demolish/${id}`, {
//         status: "ocular_scheduled",
//         scheduledDate: date,
//       });

//       setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, ...res.data } : r)));

//       // Notify client
//       const targetUserId = res?.data?.userId || requests.find((r) => r._id === id)?.userId;
//       const niceDate = new Date(date).toLocaleDateString();
//       await createDemolishNotification({
//         userId: targetUserId,
//         requestId: res?.data?._id || id,
//         status: "ocular_scheduled",
//         message: `Your ocular visit has been scheduled on ${niceDate}.`,
//       });

//       toast.success(`Ocular visit scheduled on ${niceDate}`);
//     } catch (error) {
//       console.error("Error scheduling ocular visit:", error);
//       toast.error("Failed to schedule ocular visit");
//     }
//   };

//   // PROPOSE PRICE (after ocular or after a decline)
//   const handleProposePrice = async (req) => {
//     const { _id: id } = req || {};
//     if (!id) return;

//     // Allow proposing only after ocular or after a previous decline
//     const canPropose = req.status === "ocular_scheduled" || req.status === "price_declined";
//     if (!canPropose) {
//       Swal.fire(
//         "Not allowed yet",
//         "You can propose a price after an ocular visit or re-propose after a decline.",
//         "info"
//       );
//       return;
//     }

//     const { value: raw } = await Swal.fire({
//       title: "Propose Price (₱)",
//       input: "number",
//       inputAttributes: { min: "1", step: "1" },
//       inputValue: req.proposedPrice || req.price || "",
//       showCancelButton: true,
//       confirmButtonText: "Send to Client",
//       preConfirm: (v) => {
//         const n = Number(v);
//         if (!n || n <= 0) {
//           Swal.showValidationMessage("Please enter a valid price greater than 0.");
//           return false;
//         }
//         return n;
//       },
//     });

//     if (!raw) return;
//     const proposed = Number(raw);

//     try {
//       const res = await axios.patch(`${API_URL}/api/demolish/${id}`, {
//         proposedPrice: proposed,
//         status: "awaiting_price_approval",
//       });

//       setRequests((prev) =>
//         prev.map((r) =>
//           r._id === id ? { ...r, ...res.data, proposedPrice: proposed, status: "awaiting_price_approval" } : r
//         )
//       );

//       // Notify client to review price
//       const targetUserId = res?.data?.userId || req.userId;
//       await createDemolishNotification({
//         userId: targetUserId,
//         requestId: res?.data?._id || id,
//         status: "awaiting_price_approval",
//         message: `Proposed demolition price: ₱${proposed.toLocaleString()}. Please accept or decline.`,
//       });

//       toast.success(`Proposed price sent: ₱${proposed.toLocaleString()}`);
//     } catch (error) {
//       console.error("Error proposing price:", error);
//       const msg = error?.response?.data?.error || "Failed to propose price";
//       toast.error(msg);
//     }
//   };

//   const handleStatusUpdate = async (id, newStatus) => {
//     const confirm = await Swal.fire({
//       title: `Update status to "${newStatus}"?`,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Yes, update it!",
//       cancelButtonText: "Cancel",
//     });
//     if (!confirm.isConfirmed) return;

//     try {
//       const res = await axios.patch(`${API_URL}/api/demolish/${id}`, {
//         status: newStatus,
//       });
//       setRequests((prev) => prev.map((req) => (req._id === id ? { ...req, status: res.data.status } : req)));
//       toast.success(`Request ${newStatus}`);

//       // Notify client on key status changes
//       const targetUserId = res?.data?.userId || requests.find((r) => r._id === id)?.userId;
//       if (targetUserId) {
//         let msg = "Your demolition request has been updated.";
//         if (newStatus === "declined") msg = "Your demolition request was declined.";
//         if (newStatus === "price_accepted") msg = "Price accepted. We will proceed with next steps.";
//         if (newStatus === "price_declined") msg = "Price declined. Please contact support if needed.";
//         if (newStatus === "completed") msg = "Your demolition request has been completed.";

//         await createDemolishNotification({
//           userId: targetUserId,
//           requestId: res?.data?._id || id,
//           status: newStatus,
//           message: msg,
//         });
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//       const msg = error?.response?.data?.error || "Failed to update status";
//       toast.error(msg);
//     }
//   };

//   const handleDelete = async (id) => {
//     const confirm = await Swal.fire({
//       title: "Are you sure you want to delete this request?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Delete",
//     });
//     if (!confirm.isConfirmed) return;

//     try {
//       await axios.delete(`${API_URL}/api/demolish/${id}`);
//       setRequests((prev) => prev.filter((req) => req._id !== id));
//       toast.success("Request deleted");
//     } catch (error) {
//       console.error("Error deleting:", error);
//       toast.error("Failed to delete request");
//     }
//   };

//   const handleDownloadExcel = () => {
//     // Export with a human-readable location
//     const exportData = filteredRequests.map(({ images, location, ...rest }) => {
//       let address = "N/A";
//       if (location?.lat && location?.lng) {
//         const key = fmtKey(location.lat, location.lng);
//         address = addressMap[key] || `${location.lat}, ${location.lng}`;
//       }
//       return { ...rest, location: address };
//     });
//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Demolish Requests");
//     XLSX.writeFile(wb, "Demolish_Requests.xlsx");
//   };

//   const handleMenuOpen = (event, rowId) => {
//     setAnchorEl(event.currentTarget);
//     setActiveRowId(rowId);
//   };
//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     setActiveRowId(null);
//   };

//   const handleFilterOpen = (event) => setFilterAnchor(event.currentTarget);
//   const handleFilterClose = () => setFilterAnchor(null);

//   const statusColor = (status) => {
//     switch (status) {
//       case "scheduled":
//       case "ocular_scheduled":
//         return { border: "success.main", color: "success.main" };
//       case "awaiting_price_approval":
//         return { border: "info.main", color: "info.main" };
//       case "price_accepted":
//         return { border: "success.dark", color: "success.dark" };
//       case "price_declined":
//       case "declined":
//         return { border: "error.main", color: "error.main" };
//       default:
//         return { border: "warning.main", color: "warning.main" };
//     }
//   };

//   // compute disabled states based on status and fields
//   const computeActionDisabled = (request) => {
//     const status = request?.status || "pending";

//     // scheduleOcular disabled if ocular already scheduled OR has moved past ocular stage
//     const scheduleOcularDisabled = [
//       "ocular_scheduled",
//       "awaiting_price_approval",
//       "price_accepted",
//       "scheduled",
//       "completed",
//       "declined",
//     ].includes(status);

//     // propose price only allowed when ocular scheduled or after price_declined (re-propose)
//     // disabled while waiting for client approval or after schedule/completion/decline
//     const proposeAllowed = status === "ocular_scheduled" || status === "price_declined";
//     const proposeDisabled =
//       !proposeAllowed || ["awaiting_price_approval", "scheduled", "completed", "declined"].includes(status);

//     // schedule demolition (final accept) only allowed after price_accepted
//     const scheduleDemolitionDisabled = status !== "price_accepted";

//     // decline disabled when already declined or when final scheduled/completed/price_accepted
//     const declineDisabled = ["declined", "scheduled", "completed", "price_accepted"].includes(status);

//     return {
//       scheduleOcularDisabled,
//       proposeDisabled,
//       scheduleDemolitionDisabled,
//       declineDisabled,
//     };
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Toaster position="top-right" />
//       {loading ? (
//         <Loader />
//       ) : (
//         <>
//           <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2, flexWrap: "wrap" }}>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               <Typography variant="h5">Demolish Requests</Typography>
//               <Tooltip title={showMap ? "Hide Map" : "Show Map"}>
//                 <IconButton onClick={() => setShowMap((prev) => !prev)}>
//                   <MapIcon color={showMap ? "primary" : "action"} />
//                 </IconButton>
//               </Tooltip>
//             </Box>

//             <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
//               <TextField
//                 size="small"
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />

//               {/* NEW: Date range inputs */}
//               <TextField
//                 size="small"
//                 type="date"
//                 label="From"
//                 InputLabelProps={{ shrink: true }}
//                 value={dateFrom}
//                 onChange={(e) => setDateFrom(e.target.value)}
//               />
//               <TextField
//                 size="small"
//                 type="date"
//                 label="To"
//                 InputLabelProps={{ shrink: true }}
//                 value={dateTo}
//                 inputProps={{ min: dateFrom || undefined }}
//                 onChange={(e) => setDateTo(e.target.value)}
//               />
//               {(dateFrom || dateTo) && (
//                 <Button
//                   size="small"
//                   variant="outlined"
//                   onClick={() => {
//                     setDateFrom("");
//                     setDateTo("");
//                   }}
//                 >
//                   Reset Dates
//                 </Button>
//               )}

//               <Tooltip title="Filter">
//                 <IconButton onClick={handleFilterOpen}>
//                   <FilterListIcon />
//                 </IconButton>
//               </Tooltip>
//               <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={handleFilterClose}>
//                 <MenuItem disabled>Filter by Status</MenuItem>
//                 {[
//                   "",
//                   "pending",
//                   "scheduled",
//                   "ocular_scheduled",
//                   "awaiting_price_approval",
//                   "price_accepted",
//                   "price_declined",
//                   "declined",
//                 ].map((status) => (
//                   <MenuItem
//                     key={status || "all"}
//                     onClick={() => {
//                       setStatusFilter(status);
//                       handleFilterClose();
//                     }}
//                     selected={statusFilter === status}
//                   >
//                     {status || "All"}
//                   </MenuItem>
//                 ))}

//                 <Divider />

//                 <MenuItem disabled>Filter by Price</MenuItem>
//                 {[{ label: "All", value: "" }, { label: "Below ₱5,000", value: "low" }, { label: "₱5,000 – ₱20,000", value: "mid" }, { label: "Above ₱20,000", value: "high" }].map((price) => (
//                   <MenuItem
//                     key={price.value}
//                     onClick={() => {
//                       setPriceFilter(price.value);
//                       handleFilterClose();
//                     }}
//                     selected={priceFilter === price.value}
//                   >
//                     {price.label}
//                   </MenuItem>
//                 ))}

//                 <Divider />

//                 {/* NEW: Quick Date Ranges */}
//                 <MenuItem disabled>Quick Date Range</MenuItem>
//                 <MenuItem
//                   onClick={() => {
//                     applyQuickRange("today");
//                     handleFilterClose();
//                   }}
//                 >
//                   Today
//                 </MenuItem>
//                 <MenuItem
//                   onClick={() => {
//                     applyQuickRange("last7");
//                     handleFilterClose();
//                   }}
//                 >
//                   Last 7 days
//                 </MenuItem>
//                 <MenuItem
//                   onClick={() => {
//                     applyQuickRange("last30");
//                     handleFilterClose();
//                   }}
//                 >
//                   Last 30 days
//                 </MenuItem>
//                 <MenuItem
//                   onClick={() => {
//                     applyQuickRange("clear");
//                     handleFilterClose();
//                   }}
//                 >
//                   Clear date range
//                 </MenuItem>
//               </Menu>
//             </Box>
//           </Box>

//           {showMap && (
//             <Box sx={{ mb: 2 }}>
//               <DemolishDashboardMap requests={filteredRequests} onClose={() => setShowMap(false)} />
//             </Box>
//           )}

//           {error ? (
//             <Typography color="error">{error}</Typography>
//           ) : (
//             <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
//               <Table stickyHeader>
//                 <TableHead>
//                   <TableRow sx={{ bgcolor: "grey.900" }}>
//                     {["ID", "Name", "Contact", "Location", "Price", "Status", "Scheduled Date", "Actions"].map((head) => (
//                       <TableCell
//                         key={head}
//                         sx={{
//                           color: "#202020ff",
//                           fontWeight: "bold",
//                           background: "#d3d3d3ff",
//                         }}
//                       >
//                         {head}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>

//                 <TableBody>
//                   {filteredRequests.length > 0 ? (
//                     filteredRequests.map((request) => {
//                       const displayId = request.demolishId || request._id;
//                       const { border, color } = statusColor(request.status);

//                       const priceNow = request.price == null ? null : Number(request.price);
//                       const hasProposal = typeof request.proposedPrice === "number";
//                       const proposed = Number(request.proposedPrice || 0);
//                       const waiting = request.status === "awaiting_price_approval";

//                       // compute disabled states
//                       const {
//                         scheduleOcularDisabled,
//                         proposeDisabled,
//                         scheduleDemolitionDisabled,
//                         declineDisabled,
//                       } = computeActionDisabled(request);

//                       return (
//                         <TableRow
//                           key={request._id}
//                           hover
//                           sx={{ cursor: "pointer" }}
//                           onClick={() => setSelectedRequest(request)}
//                         >
//                           <TableCell>{displayId}</TableCell>
//                           <TableCell>{request.name}</TableCell>
//                           <TableCell>{request.contact}</TableCell>
//                           <TableCell>{renderLocation(request.location)}</TableCell>
//                           <TableCell>
//                             <div>
//                               <strong>{priceNow == null ? "—" : `₱${priceNow.toLocaleString()}`}</strong>
//                             </div>
//                             {hasProposal && (
//                               <div style={{ fontSize: 12, opacity: 0.8 }}>
//                                 Proposed: ₱{proposed.toLocaleString()} {waiting ? "(pending)" : ""}
//                               </div>
//                             )}
//                           </TableCell>
//                           <TableCell>
//                             <Typography
//                               sx={{
//                                 borderColor: border,
//                                 color,
//                                 px: 1.5,
//                                 py: 0.25,
//                                 borderRadius: 1,
//                                 display: "inline-block",
//                                 fontWeight: 500,
//                                 textTransform: "capitalize",
//                                 borderStyle: "solid",
//                                 borderWidth: 1,
//                               }}
//                             >
//                               {request.status || "pending"}
//                             </Typography>
//                           </TableCell>
//                           <TableCell>
//                             {request.scheduledDate ? new Date(request.scheduledDate).toLocaleDateString() : "N/A"}
//                           </TableCell>
//                           <TableCell onClick={(e) => e.stopPropagation()}>
//                             <IconButton onClick={(e) => handleMenuOpen(e, request._id)}>
//                               <MoreVertIcon />
//                             </IconButton>

//                             <Menu
//                               anchorEl={anchorEl}
//                               open={activeRowId === request._id}
//                               onClose={handleMenuClose}
//                               onClick={(e) => e.stopPropagation()}
//                             >
//                               <MenuItem
//                                 onClick={() => {
//                                   handleScheduleDemolition(request._id);
//                                   handleMenuClose();
//                                 }}
//                                 disabled={scheduleDemolitionDisabled}
//                                 sx={{
//                                   color: "success.main",
//                                   fontWeight: 500,
//                                   "&.Mui-disabled": { color: "success.light" },
//                                   "&:hover": { bgcolor: "success.light", color: "white" },
//                                 }}
//                               >
//                                 Schedule Demolition
//                               </MenuItem>

//                               <MenuItem
//                                 onClick={() => {
//                                   handleScheduleOcular(request._id);
//                                   handleMenuClose();
//                                 }}
//                                 disabled={scheduleOcularDisabled}
//                                 sx={{
//                                   color: "info.main",
//                                   fontWeight: 500,
//                                   "&.Mui-disabled": { color: "info.light" },
//                                   "&:hover": { bgcolor: "info.light", color: "white" },
//                                 }}
//                               >
//                                 Schedule Ocular Visit
//                               </MenuItem>

//                               {/* Propose Price (after ocular or after decline) */}
//                               <MenuItem
//                                 onClick={() => {
//                                   handleProposePrice(request);
//                                   handleMenuClose();
//                                 }}
//                                 disabled={proposeDisabled}
//                                 sx={{
//                                   color: "primary.main",
//                                   fontWeight: 500,
//                                   "&.Mui-disabled": { color: "primary.light" },
//                                   "&:hover": { bgcolor: "primary.light", color: "white" },
//                                 }}
//                               >
//                                 Propose Price
//                               </MenuItem>

//                               <MenuItem
//                                 onClick={() => {
//                                   handleStatusUpdate(request._id, "declined");
//                                   handleMenuClose();
//                                 }}
//                                 disabled={declineDisabled}
//                                 sx={{
//                                   color: "warning.main",
//                                   fontWeight: 500,
//                                   "&.Mui-disabled": { color: "warning.light" },
//                                   "&:hover": { bgcolor: "warning.light", color: "white" },
//                                 }}
//                               >
//                                 Decline
//                               </MenuItem>

//                               <MenuItem
//                                 onClick={() => {
//                                   handleDelete(request._id);
//                                   handleMenuClose();
//                                 }}
//                                 sx={{
//                                   color: "error.main",
//                                   fontWeight: 500,
//                                   "&:hover": { bgcolor: "error.light", color: "white" },
//                                 }}
//                               >
//                                 Delete
//                               </MenuItem>

//                               <MenuItem
//                                 onClick={() => {
//                                   setSelectedRequest(request);
//                                   handleMenuClose();
//                                 }}
//                                 sx={{
//                                   color: "secondary.main",
//                                   fontWeight: 500,
//                                   "&:hover": { bgcolor: "secondary.light", color: "white" },
//                                 }}
//                               >
//                                 Download PDF
//                               </MenuItem>
//                             </Menu>
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={8} align="center" sx={{ color: "grey.500" }}>
//                         No results found.
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}

//           <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
//             <Button variant="contained" color="success" onClick={handleDownloadExcel}>
//               Download Excel
//             </Button>
//           </Box>

//           {selectedRequest && <ReqDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
//         </>
//       )}
//     </Box>
//   );
// };

// export default DemolishDashboard;


import React, { useEffect, useState, useCallback } from "react";
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
  const [dateTo, setDateTo] = useState(""); // "YYYY-MM-DD"

  // ===== Reverse Geocoding State & Helpers =====
  const [addressMap, setAddressMap] = useState({}); // { "lat,lng": "Pretty address" }

  const fmtKey = useCallback((lat, lng) => `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`, []);

  const getCachedAddress = useCallback((key) => {
    try {
      const raw = localStorage.getItem("geo_address_cache");
      if (!raw) return null;
      const json = JSON.parse(raw);
      return json[key] || null;
    } catch {
      return null;
    }
  }, []);

  const setCachedAddress = useCallback((key, val) => {
    try {
      const raw = localStorage.getItem("geo_address_cache");
      const json = raw ? JSON.parse(raw) : {};
      json[key] = val;
      localStorage.setItem("geo_address_cache", JSON.stringify(json));
    } catch {}
  }, []);

  // simple HTML-escape helper used when showing decline reason in a Swal html confirm
  const escapeHtml = useCallback((unsafe) =>
    String(unsafe || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/`/g, "&#96;"),
  []);

  const reverseGeocode = useCallback(
    async (lat, lng) => {
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
    },
    [fmtKey, getCachedAddress, setCachedAddress]
  );

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
  }, [requests, fmtKey, getCachedAddress, reverseGeocode]);

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
      filtered = filtered.filter((req) => (req.proposedPrice ?? req.price ?? Infinity) < 5000);
    } else if (priceFilter === "mid") {
      filtered = filtered.filter((req) => {
        const p = req.proposedPrice ?? req.price;
        return p != null && p >= 5000 && p <= 20000;
      });
    } else if (priceFilter === "high") {
      filtered = filtered.filter((req) => (req.proposedPrice ?? req.price ?? -Infinity) > 20000);
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
  }, [searchQuery, statusFilter, priceFilter, requests, addressMap, dateFrom, dateTo, fmtKey]);

  // ===== Minimal notification helper (FOR: "demolish") =====
  const createDemolishNotification = async ({ userId, requestId, status, message }) => {
    if (!userId || !requestId) return;
    try {
      await axios.post(`${API_URL}/api/notifications`, {
        userId,
        orderId: requestId, // storing the demolish request id here (same pattern as Sell)
        for: "demolish", // ← important
        role: "client",
        status,
        message,
      });
    } catch (err) {
      console.error("Failed to create demolish notification:", err);
    }
  };
  // ========================================================

  // SCHEDULE DEMOLITION (guard: only after price_accepted)
  const handleScheduleDemolition = async (id) => {
    const current = requests.find((r) => r._id === id);
    if (!current || current.status !== "price_accepted" || current.price == null) {
      Swal.fire(
        "Price not accepted yet",
        "You can only schedule demolition after the client accepts the proposed price.",
        "info"
      );
      return;
    }

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
      const msg = error?.response?.data?.error || "Failed to schedule demolition";
      toast.error(msg);
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

  // PROPOSE PRICE (after ocular visit, after client decline, or responding to client counter-offer)
  const handleProposePrice = async (req) => {
    const { _id: id } = req || {};
    if (!id) return;

    // Allow proposing only after ocular or after a client decline/counter-offer
    const canPropose = req.status === "ocular_scheduled" || req.status === "price_declined";
    if (!canPropose) {
      Swal.fire(
        "Not allowed yet",
        "You can propose a price after an ocular visit, after a client decline, or in response to a client counter-offer.",
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
      const res = await axios.patch(`${API_URL}/api/demolish/${id}`, {
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
      await createDemolishNotification({
        userId: targetUserId,
        requestId: res?.data?._id || id,
        status: "awaiting_price_approval",
        message: `Proposed demolition price: ₱${proposed.toLocaleString()}. Please accept or decline.`,
      });

      toast.success(`Proposed price sent: ₱${proposed.toLocaleString()}`);
    } catch (error) {
      console.error("Error proposing price:", error);
      const msg = error?.response?.data?.error || "Failed to propose price";
      toast.error(msg);
    }
  };

  // COUNTER OFFER (Admin responds to client's counter-offer with their own proposed price)
  const handleCounterOffer = async (req) => {
    const { _id: id } = req || {};
    if (!id) return;

    const { value: raw } = await Swal.fire({
      title: "Counter Offer Price (₱)",
      input: "number",
      inputAttributes: { min: "1", step: "1" },
      inputValue: req.proposedPrice || req.price || "",
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
      const res = await axios.patch(`${API_URL}/api/demolish/${id}`, {
        proposedPrice: counterPrice,
        status: "awaiting_price_approval",
      });

      setRequests((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, ...res.data, proposedPrice: counterPrice, status: "awaiting_price_approval" } : r
        )
      );

      // Notify client about counter-offer
      const targetUserId = res?.data?.userId || req.userId;
      await createDemolishNotification({
        userId: targetUserId,
        requestId: res?.data?._id || id,
        status: "awaiting_price_approval",
        message: `Counter offer received: ₱${counterPrice.toLocaleString()}. Please accept or decline.`,
      });

      toast.success(`Counter offer sent: ₱${counterPrice.toLocaleString()}`);
    } catch (error) {
      console.error("Error sending counter offer:", error);
      const msg = error?.response?.data?.error || "Failed to send counter offer";
      toast.error(msg);
    }
  };

  // UPDATED: handleStatusUpdate with decline reason support
  const handleStatusUpdate = async (id, newStatus) => {
    // If declining, prompt for reason first (required)
    let declineReason = null;

    if (newStatus === "declined") {
      const { value: reason } = await Swal.fire({
        title: "Reason for decline",
        input: "textarea",
        inputLabel: "Please provide a reason for declining this demolition request.",
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
        return; // user cancelled or validation failed
      }
      declineReason = reason.trim();

      // final confirmation showing escaped reason
      const confirmDecline = await Swal.fire({
        title: "Confirm decline",
        html: `Are you sure you want to decline this request with the reason:<br/><em>${escapeHtml(declineReason)}</em>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, decline",
        cancelButtonText: "Cancel",
      });

      if (!confirmDecline.isConfirmed) return;
    } else {
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

      const res = await axios.patch(`${API_URL}/api/demolish/${id}`, payload);

      // Update local state: include declineReason if present
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

      toast.success(newStatus === "declined" ? "Request declined" : `Request ${newStatus}`);

      // Notify client when possible (include reason if declined)
      const reqObj = requests.find((r) => r._id === id);
      const targetUserId = res?.data?.userId || reqObj?.userId;

      if (targetUserId) {
        let msg = "Your demolition request has been updated.";
        if (newStatus === "declined") msg = `Your demolition request was declined. Reason: ${declineReason}`;
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
      const msg = error?.response?.data?.error || "Failed to update status";
      toast.error(msg);
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

  // compute disabled states based on status and fields
  const computeActionDisabled = (request) => {
    const status = request?.status || "pending";

    // scheduleOcular disabled if ocular already scheduled OR has moved past ocular stage
    const scheduleOcularDisabled = [
      "ocular_scheduled",
      "awaiting_price_approval",
      "price_accepted",
      "scheduled",
      "completed",
      "declined",
    ].includes(status);

    // propose price only allowed when ocular scheduled or after price_declined (re-propose)
    // disabled while waiting for client approval or after schedule/completion/decline
    const proposeAllowed = status === "ocular_scheduled" || status === "price_declined";
    const proposeDisabled =
      !proposeAllowed || ["awaiting_price_approval", "scheduled", "completed", "declined"].includes(status);

    // counter offer only allowed when client has sent a counter (status === "price_declined")
    const counterOfferDisabled = false;

    // schedule demolition (final accept) only allowed after price_accepted
    const scheduleDemolitionDisabled = status !== "price_accepted";

    // decline disabled when already declined or when final scheduled/completed/price_accepted
    const declineDisabled = ["declined", "scheduled", "completed", "price_accepted"].includes(status);

    return {
      scheduleOcularDisabled,
      proposeDisabled,
      counterOfferDisabled,
      scheduleDemolitionDisabled,
      declineDisabled,
    };
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
                <MenuItem disabled>Filter by Price</MenuItem>
                {[{ label: "All", value: "" }, { label: "Below ₱5,000", value: "low" }, { label: "₱5,000 – ₱20,000", value: "mid" }, { label: "Above ₱20,000", value: "high" }].map((price) => (
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
              <Tab label="Scheduled" value="scheduled" />
              <Tab label="Ocular Scheduled" value="ocular_scheduled" />
              <Tab label="Awaiting Price Approval" value="awaiting_price_approval" />
              <Tab label="Price Accepted" value="price_accepted" />
              <Tab label="Price Declined" value="price_declined" />
              <Tab label="Declined" value="declined" />
            </Tabs>
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

                      const priceNow = request.price == null ? null : Number(request.price);
                      const hasProposal = typeof request.proposedPrice === "number";
                      const proposed = Number(request.proposedPrice || 0);
                      const waiting = request.status === "awaiting_price_approval";

                      // compute disabled states
                      const {
                        scheduleOcularDisabled,
                        proposeDisabled,
                        counterOfferDisabled,
                        scheduleDemolitionDisabled,
                        declineDisabled,
                      } = computeActionDisabled(request);

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
                              <strong>{priceNow == null ? "—" : `₱${priceNow.toLocaleString()}`}</strong>
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
                                disabled={scheduleDemolitionDisabled}
                                sx={{
                                  color: "success.main",
                                  fontWeight: 500,
                                  "&.Mui-disabled": { color: "success.light" },
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
                                disabled={scheduleOcularDisabled}
                                sx={{
                                  color: "info.main",
                                  fontWeight: 500,
                                  "&.Mui-disabled": { color: "info.light" },
                                  "&:hover": { bgcolor: "info.light", color: "white" },
                                }}
                              >
                                Schedule Ocular Visit
                              </MenuItem>

                              {/* Propose Price (after ocular or after decline) */}
                              <MenuItem
                                onClick={() => {
                                  handleProposePrice(request);
                                  handleMenuClose();
                                }}
                                disabled={proposeDisabled}
                                sx={{
                                  color: "primary.main",
                                  fontWeight: 500,
                                  "&.Mui-disabled": { color: "primary.light" },
                                  "&:hover": { bgcolor: "primary.light", color: "white" },
                                }}
                              >
                                Propose Price
                              </MenuItem>

                              {/* Counter Offer (respond to client counter) */}
                              <MenuItem
                                onClick={() => {
                                  handleCounterOffer(request);
                                  handleMenuClose();
                                }}
                                disabled={counterOfferDisabled}
                                sx={{
                                  color: "secondary.main",
                                  fontWeight: 500,
                                  "&.Mui-disabled": { color: "secondary.light" },
                                  "&:hover": { bgcolor: "secondary.light", color: "white" },
                                }}
                              >
                                Counter Offer
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

          {selectedRequest && <ReqDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
        </>
      )}
    </Box>
  );
};

export default DemolishDashboard;
