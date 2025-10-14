

// import React, { useEffect, useState } from "react";
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
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   Card,
//   CardMedia,
// } from "@mui/material";
// import Loader from "./Loader";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import MapIcon from "@mui/icons-material/Map";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import SellDashboardMap from "./SellDashboardMap";

// const API_URL = process.env.REACT_APP_API_URL;

// const SellDashboard = () => {
//   const [requests, setRequests] = useState([]);
//   const [filteredRequests, setFilteredRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedRequest, setSelectedRequest] = useState(null);

//   const [anchorEl, setAnchorEl] = useState(null);
//   const [activeRowId, setActiveRowId] = useState(null);
//   const [showMap, setShowMap] = useState(false);

//   // Filter dropdown
//   const [filterAnchor, setFilterAnchor] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [priceFilter, setPriceFilter] = useState("");

//   // --- Fetch Requests ---
//   useEffect(() => {
//     const fetchRequests = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/sell`);
//         setRequests(res.data);
//         setFilteredRequests(res.data);
//       } catch (err) {
//         console.error("Error fetching sell requests:", err);
//         setError("Failed to fetch sell requests.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchRequests();
//   }, []);

//   // --- Filter & Search ---
//   useEffect(() => {
//     let filtered = requests.filter(
//       (request) =>
//         request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (request.contact || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (request.description || "").toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     if (statusFilter) {
//       filtered = filtered.filter(
//         (req) => (req.status || "pending") === statusFilter
//       );
//     }

//     if (priceFilter === "low") {
//       filtered = filtered.filter((req) => req.price < 5000);
//     } else if (priceFilter === "mid") {
//       filtered = filtered.filter(
//         (req) => req.price >= 5000 && req.price <= 20000
//       );
//     } else if (priceFilter === "high") {
//       filtered = filtered.filter((req) => req.price > 20000);
//     }

//     setFilteredRequests(filtered);
//   }, [searchQuery, statusFilter, priceFilter, requests]);

//   // --- Action Handlers ---
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
//       const res = await axios.patch(`${API_URL}/api/sell/${id}/status`, {
//         status: newStatus,
//       });
//       setRequests((prev) =>
//         prev.map((req) =>
//           req._id === id ? { ...req, status: res.data.status } : req
//         )
//       );
//       toast.success(`Request ${newStatus}`);
//     } catch (error) {
//       console.error("Error updating status:", error);
//       toast.error("Failed to update status");
//     }
//   };

//   const handleScheduleOcular = async (id) => {
//     const { value: date } = await Swal.fire({
//       title: "Schedule Ocular Visit",
//       input: "datetime-local",
//       inputLabel: "Select date and time",
//       inputAttributes: {
//         min: new Date().toISOString().slice(0, 16),
//       },
//       showCancelButton: true,
//       confirmButtonText: "Schedule",
//     });

//     if (!date) return;

//     try {
//       const res = await axios.patch(`${API_URL}/api/sell/${id}/schedule-ocular`, {
//         ocularVisit: date,
//       });
//       setRequests((prev) =>
//         prev.map((req) =>
//           req._id === id ? { ...req, ...res.data } : req
//         )
//       );
//       toast.success("Ocular visit scheduled successfully");
//     } catch (error) {
//       console.error("Error scheduling ocular visit:", error);
//       toast.error("Failed to schedule ocular visit");
//     }
//   };

//   const handleDelete = async (id) => {
//     const confirm = await Swal.fire({
//       title: "Are you sure you want to delete this request?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Delete",
//       cancelButtonText: "Cancel",
//     });
//     if (!confirm.isConfirmed) return;

//     try {
//       await axios.delete(`${API_URL}/api/sell/${id}`);
//       setRequests((prev) => prev.filter((req) => req._id !== id));
//       toast.success("Request deleted");
//     } catch (error) {
//       console.error("Error deleting request:", error);
//       toast.error("Failed to delete request");
//     }
//   };

//   // --- Download Handlers ---
//   const handleDownloadPDF = (request) => {
//     const docPDF = new jsPDF();
//     docPDF.setFontSize(16);
//     docPDF.text("Sell Request Details", 10, 20);
//     docPDF.setFontSize(12);
//     docPDF.text(`ID: ${request._id}`, 10, 40);
//     docPDF.text(`Name: ${request.name}`, 10, 50);
//     docPDF.text(`Contact: ${request.contact}`, 10, 60);
//     docPDF.text(
//       `Location: ${
//         request.location?.lat && request.location?.lng
//           ? `${request.location.lat}, ${request.location.lng}`
//           : "N/A"
//       }`,
//       10,
//       70
//     );
//     docPDF.text(`Price: ₱${request.price}`, 10, 80);
//     const description = docPDF.splitTextToSize(
//       `Description: ${request.description}`,
//       180
//     );
//     docPDF.text(description, 10, 90);

//     let y = 110;
//     if (request.images) {
//       if (request.images.front) {
//         docPDF.text("Front View:", 10, y);
//         docPDF.addImage(request.images.front, "JPEG", 50, y - 5, 60, 60);
//         y += 70;
//       }
//       if (request.images.side) {
//         docPDF.text("Side View:", 10, y);
//         docPDF.addImage(request.images.side, "JPEG", 50, y - 5, 60, 60);
//         y += 70;
//       }
//       if (request.images.back) {
//         docPDF.text("Back View:", 10, y);
//         docPDF.addImage(request.images.back, "JPEG", 50, y - 5, 60, 60);
//         y += 70;
//       }
//     }

//     if (request.ocularVisit)
//       docPDF.text(
//         `Ocular Visit: ${new Date(request.ocularVisit).toLocaleString()}`,
//         10,
//         y + 10
//       );

//     docPDF.save(`Sell_Request_${request._id}.pdf`);
//   };

//   const handleDownloadExcel = () => {
//     const exportData = filteredRequests.map(({ images, ...rest }) => rest);
//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Sell Requests");
//     XLSX.writeFile(wb, "Sell_Requests.xlsx");
//   };

//   const handleMenuOpen = (event, rowId) => {
//     setAnchorEl(event.currentTarget);
//     setActiveRowId(rowId);
//   };
//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     setActiveRowId(null);
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Toaster position="top-right" />
//       {loading ? (
//         <Loader />
//       ) : (
//         <>
//           {/* Top Bar */}
//           <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               <Typography variant="h5">Sell Requests</Typography>
//               <Tooltip title={showMap ? "Hide Map" : "Show Map"}>
//                 <IconButton onClick={() => setShowMap((prev) => !prev)}>
//                   <MapIcon color={showMap ? "primary" : "action"} />
//                 </IconButton>
//               </Tooltip>
//             </Box>

//             {/* Search + Filters */}
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               <TextField
//                 size="small"
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//               <Tooltip title="Filter">
//                 <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
//                   <FilterListIcon />
//                 </IconButton>
//               </Tooltip>
//               <Menu
//                 anchorEl={filterAnchor}
//                 open={Boolean(filterAnchor)}
//                 onClose={() => setFilterAnchor(null)}
//               >
//                 <MenuItem disabled>Filter by Status</MenuItem>
//                 {["", "pending", "accepted", "declined", "ocular_scheduled"].map(
//                   (status) => (
//                     <MenuItem
//                       key={status || "all"}
//                       onClick={() => setStatusFilter(status)}
//                       sx={{
//                         fontWeight: statusFilter === status ? "bold" : "normal",
//                         bgcolor: statusFilter === status ? "grey.700" : "inherit",
//                         color:
//                           statusFilter === status
//                             ? "primary.contrastText"
//                             : "inherit",
//                       }}
//                     >
//                       {status || "All"}
//                     </MenuItem>
//                   )
//                 )}
//                 <MenuItem divider />
//                 <MenuItem disabled>Filter by Price</MenuItem>
//                 {[
//                   { label: "All", value: "" },
//                   { label: "Below ₱5,000", value: "low" },
//                   { label: "₱5,000 – ₱20,000", value: "mid" },
//                   { label: "Above ₱20,000", value: "high" },
//                 ].map((price) => (
//                   <MenuItem
//                     key={price.value}
//                     onClick={() => setPriceFilter(price.value)}
//                     sx={{
//                       fontWeight: priceFilter === price.value ? "bold" : "normal",
//                       bgcolor: priceFilter === price.value ? "grey.700" : "inherit",
//                       color:
//                         priceFilter === price.value
//                           ? "primary.contrastText"
//                           : "inherit",
//                     }}
//                   >
//                     {price.label}
//                   </MenuItem>
//                 ))}
//               </Menu>
//             </Box>
//           </Box>

//           {/* Map */}
//           {showMap && (
//             <Box sx={{ mb: 2 }}>
//               <SellDashboardMap
//                 requests={filteredRequests}
//                 onClose={() => setShowMap(false)}
//               />
//             </Box>
//           )}

//           {/* Table */}
//           {error ? (
//             <Typography color="error">{error}</Typography>
//           ) : (
//             <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
//               <Table stickyHeader>
//                 <TableHead>
//                   <TableRow sx={{ bgcolor: "grey.900" }}>
//                     {[
//                       "ID",
//                       "Name",
//                       "Contact",
//                       "Location",
//                       "Price",
//                       "Description",
//                       "Status",
//                       "Ocular Visit",
//                       "Actions",
//                     ].map((head) => (
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
//                     filteredRequests.map((request) => (
//                       <TableRow
//                         key={request._id}
//                         hover
//                         sx={{ cursor: "pointer" }}
//                         onClick={() => setSelectedRequest(request)}
//                       >
//                         <TableCell>{request._id}</TableCell>
//                         <TableCell>{request.name}</TableCell>
//                         <TableCell>{request.contact}</TableCell>
//                         <TableCell>
//                           {request.location?.lat && request.location?.lng
//                             ? `${request.location.lat}, ${request.location.lng}`
//                             : "N/A"}
//                         </TableCell>
//                         <TableCell>₱{request.price}</TableCell>
//                         <TableCell>{request.description}</TableCell>
//                         <TableCell>
//                           <Typography
//                             sx={{
//                               borderColor:
//                                 request.status === "accepted"
//                                   ? "success.main"
//                                   : request.status === "declined"
//                                   ? "error.main"
//                                   : request.status === "ocular_scheduled"
//                                   ? "info.main"
//                                   : "warning.main",
//                               color:
//                                 request.status === "accepted"
//                                   ? "success.main"
//                                   : request.status === "declined"
//                                   ? "error.main"
//                                   : request.status === "ocular_scheduled"
//                                   ? "info.main"
//                                   : "warning.main",
//                               px: 1.5,
//                               py: 0.25,
//                               borderRadius: 1,
//                               display: "inline-block",
//                               fontWeight: 500,
//                               textTransform: "capitalize",
//                             }}
//                           >
//                             {request.status || "pending"}
//                           </Typography>
//                         </TableCell>
//                         <TableCell>
//                           {request.ocularVisit
//                             ? new Date(request.ocularVisit).toLocaleString()
//                             : "Not scheduled"}
//                         </TableCell>
//                         <TableCell onClick={(e) => e.stopPropagation()}>
//                           <IconButton
//                             onClick={(e) => handleMenuOpen(e, request._id)}
//                           >
//                             <MoreVertIcon />
//                           </IconButton>
//                           <Menu
//                             anchorEl={anchorEl}
//                             open={activeRowId === request._id}
//                             onClose={handleMenuClose}
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <MenuItem
//                               onClick={() => {
//                                 handleStatusUpdate(request._id, "accepted");
//                                 handleMenuClose();
//                               }}
//                               disabled={request.status === "accepted"}
//                               sx={{
//                                 color: "success.main",
//                                 fontWeight: 500,
//                                 "&.Mui-disabled": { color: "success.light" },
//                                 "&:hover": {
//                                   bgcolor: "success.light",
//                                   color: "white",
//                                 },
//                               }}
//                             >
//                               Accept
//                             </MenuItem>
//                             <MenuItem
//                               onClick={() => {
//                                 handleStatusUpdate(request._id, "declined");
//                                 handleMenuClose();
//                               }}
//                               disabled={request.status === "declined"}
//                               sx={{
//                                 color: "warning.main",
//                                 fontWeight: 500,
//                                 "&.Mui-disabled": { color: "warning.light" },
//                                 "&:hover": {
//                                   bgcolor: "warning.light",
//                                   color: "white",
//                                 },
//                               }}
//                             >
//                               Decline
//                             </MenuItem>
//                             <MenuItem
//                               onClick={() => {
//                                 handleScheduleOcular(request._id);
//                                 handleMenuClose();
//                               }}
//                               sx={{
//                                 color: "info.main",
//                                 fontWeight: 500,
//                                 "&:hover": {
//                                   bgcolor: "info.light",
//                                   color: "white",
//                                 },
//                               }}
//                             >
//                               Schedule Ocular Visit
//                             </MenuItem>
//                             <MenuItem
//                               onClick={() => {
//                                 handleDelete(request._id);
//                                 handleMenuClose();
//                               }}
//                               sx={{
//                                 color: "error.main",
//                                 fontWeight: 500,
//                                 "&:hover": {
//                                   bgcolor: "error.light",
//                                   color: "white",
//                                 },
//                               }}
//                             >
//                               Delete
//                             </MenuItem>
//                             <MenuItem
//                               onClick={() => {
//                                 handleDownloadPDF(request);
//                                 handleMenuClose();
//                               }}
//                               sx={{
//                                 color: "primary.main",
//                                 fontWeight: 500,
//                                 "&:hover": {
//                                   bgcolor: "primary.light",
//                                   color: "white",
//                                 },
//                               }}
//                             >
//                               Download PDF
//                             </MenuItem>
//                           </Menu>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell
//                         colSpan={9}
//                         align="center"
//                         sx={{ color: "grey.500" }}
//                       >
//                         No results found.
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}

//           {/* Download Excel */}
//           <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
//             <Button
//               variant="contained"
//               color="success"
//               onClick={handleDownloadExcel}
//             >
//               Download Excel
//             </Button>
//           </Box>
//         </>
//       )}

//       {/* --- Request Detail Modal --- */}
//       <Dialog
//         open={Boolean(selectedRequest)}
//         onClose={() => setSelectedRequest(null)}
//         fullWidth
//         maxWidth="sm"
//       >
//         <DialogTitle>Sell Request Details</DialogTitle>
//         <DialogContent dividers>
//           {selectedRequest && (
//             <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
//               <Typography><strong>ID:</strong> {selectedRequest._id}</Typography>
//               <Typography><strong>Name:</strong> {selectedRequest.name}</Typography>
//               <Typography><strong>Contact:</strong> {selectedRequest.contact}</Typography>
//               <Typography>
//                 <strong>Location:</strong>{" "}
//                 {selectedRequest.location?.lat && selectedRequest.location?.lng
//                   ? `${selectedRequest.location.lat}, ${selectedRequest.location.lng}`
//                   : "N/A"}
//               </Typography>
//               <Typography><strong>Price:</strong> ₱{selectedRequest.price}</Typography>
//               <Typography><strong>Description:</strong> {selectedRequest.description}</Typography>
//               <Typography><strong>Status:</strong> {selectedRequest.status || "pending"}</Typography>
//               <Typography>
//                 <strong>Ocular Visit:</strong>{" "}
//                 {selectedRequest.ocularVisit
//                   ? new Date(selectedRequest.ocularVisit).toLocaleString()
//                   : "Not scheduled"}
//               </Typography>

//               {/* Images */}
//               {selectedRequest.images && (
//                 <Grid container spacing={2} sx={{ mt: 2 }}>
//                   {selectedRequest.images.front && (
//                     <Grid item xs={12} sm={4}>
//                       <Card>
//                         <CardMedia
//                           component="img"
//                           image={selectedRequest.images.front}
//                           alt="Front"
//                           sx={{ height: 180, objectFit: "cover" }}
//                         />
//                         <Typography align="center" sx={{ py: 1 }}>
//                           Front
//                         </Typography>
//                       </Card>
//                     </Grid>
//                   )}
//                   {selectedRequest.images.side && (
//                     <Grid item xs={12} sm={4}>
//                       <Card>
//                         <CardMedia
//                           component="img"
//                           image={selectedRequest.images.side}
//                           alt="Side"
//                           sx={{ height: 180, objectFit: "cover" }}
//                         />
//                         <Typography align="center" sx={{ py: 1 }}>
//                           Side
//                         </Typography>
//                       </Card>
//                     </Grid>
//                   )}
//                   {selectedRequest.images.back && (
//                     <Grid item xs={12} sm={4}>
//                       <Card>
//                         <CardMedia
//                           component="img"
//                           image={selectedRequest.images.back}
//                           alt="Back"
//                           sx={{ height: 180, objectFit: "cover" }}
//                         />
//                         <Typography align="center" sx={{ py: 1 }}>
//                           Back
//                         </Typography>
//                       </Card>
//                     </Grid>
//                   )}
//                 </Grid>
//               )}
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setSelectedRequest(null)} color="primary">
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default SellDashboard;

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

  // ===== Reverse Geocoding State & Helpers (for table/export) =====
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

  // --- Filter & Search ---
  useEffect(() => {
    let filtered = requests.filter((request) => {
      const q = searchQuery.toLowerCase();
      // Include selId in search as well (fallback to _id)
      const idText = (request.selId || request._id || "").toString().toLowerCase();

      // Also search by human-readable address when available
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

  // --- Action Handlers ---
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
      const res = await axios.patch(`${API_URL}/api/sell/${id}/status`, {
        status: newStatus,
      });
      setRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status: res.data.status } : req))
      );
      toast.success(`Request ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
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
      setRequests((prev) => prev.map((req) => (req._id === id ? { ...req, ...res.data } : req)));
      toast.success("Ocular visit scheduled successfully");
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
    // Include a human-readable address column in export
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

  // ====== UI ======
  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Top Bar */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h5">Sell Requests</Typography>
              <Tooltip title={showMap ? "Hide Map" : "Show Map"}>
                <IconButton onClick={() => setShowMap((prev) => !prev)}>
                  <MapIcon color={showMap ? "primary" : "action"} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Search + Filters */}
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
                      return (
                        <TableRow
                          key={request._id}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => setSelectedRequest(request)} // open modal on row click
                        >
                          <TableCell>{displayId}</TableCell>
                          <TableCell>{request.name}</TableCell>
                          <TableCell>{request.contact}</TableCell>
                          <TableCell>{renderLocation(request.location)}</TableCell>
                          <TableCell>₱{request.price}</TableCell>
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
                                disabled={request.status === "accepted"}
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
                                  // Open modal where the PDF download lives now
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
      {selectedRequest && (
        <ReqDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </Box>
  );
};

export default SellDashboard;
