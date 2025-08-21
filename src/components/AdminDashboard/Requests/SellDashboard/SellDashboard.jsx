// import React, { useEffect, useState } from "react";
// import { Modal, Button, Image } from "react-bootstrap";
// import jsPDF from "jspdf";
// import * as XLSX from "xlsx";
// import { FaTrashAlt } from "react-icons/fa";
// import "bootstrap/dist/css/bootstrap.min.css";
// import axios from "axios";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup
// } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// // Fix Leaflet marker icon URLs
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// const customIcon = new L.Icon({
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// const API_URL = process.env.REACT_APP_API_URL;

// const SellDashboard = () => {
//   const [requests, setRequests] = useState([]);
//   const [filteredRequests, setFilteredRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedRequest, setSelectedRequest] = useState(null);

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

//   useEffect(() => {
//     const filtered = requests.filter((request) =>
//       request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       request.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       request.description.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//     setFilteredRequests(filtered);
//   }, [searchQuery, requests]);

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this request?")) {
//       try {
//         await axios.delete(`${API_URL}/api/sell/${id}`);
//         setRequests((prev) => prev.filter((req) => req._id !== id));
//       } catch (error) {
//         console.error("Error deleting request:", error);
//       }
//     }
//   };

//   const handleStatusUpdate = async (id, newStatus) => {
//     try {
//       await axios.patch(`${API_URL}/api/sell/${id}`, { status: newStatus });
//       setRequests((prev) =>
//         prev.map((req) => (req._id === id ? { ...req, status: newStatus } : req))
//       );
//     } catch (error) {
//       console.error(`Error updating status to ${newStatus}:`, error);
//     }
//   };

//   const handleDownloadPDF = () => {
//     if (!selectedRequest) return;

//     const docPDF = new jsPDF();
//     docPDF.setFontSize(16);
//     docPDF.text("Sell Request Details", 10, 20);
//     docPDF.setFontSize(12);
//     docPDF.text(`ID: ${selectedRequest._id}`, 10, 40);
//     docPDF.text(`Name: ${selectedRequest.name}`, 10, 50);
//     docPDF.text(`Contact: ${selectedRequest.contact}`, 10, 60);
//     docPDF.text(`Location: ${selectedRequest.location?.lat}, ${selectedRequest.location?.lng}`, 10, 70);
//     docPDF.text(`Price: ₱${selectedRequest.price}`, 10, 80);
//     const description = docPDF.splitTextToSize(`Description: ${selectedRequest.description}`, 180);
//     docPDF.text(description, 10, 90);
//     if (selectedRequest.image) {
//       docPDF.addImage(selectedRequest.image, "JPEG", 120, 40, 70, 70);
//     }
//     docPDF.save(`Sell_Request_${selectedRequest._id}.pdf`);
//   };

//   const handleDownloadExcel = () => {
//     const exportData = filteredRequests.map(({ image, ...rest }) => rest);
//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Sell Requests");
//     XLSX.writeFile(wb, "Sell_Requests.xlsx");
//   };

//   const validLocations = filteredRequests.filter(
//     (loc) =>
//       loc.location &&
//       typeof loc.location.lat === "number" &&
//       typeof loc.location.lng === "number"
//   );

//   const defaultPosition = [13.9311, 121.6176];
//   const mapCenter = validLocations.length
//     ? [validLocations[0].location.lat, validLocations[0].location.lng]
//     : defaultPosition;

//   return (
//     <div className="container mt-4">
//       <h2>Sell Request Map</h2>
//       <div className="mb-3">
//         <MapContainer
//           center={mapCenter}
//           zoom={6}
//           style={{ height: "400px", width: "100%" }}
//         >
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//           />
//           {validLocations.map(({ _id, location, name, description, image }) => (
//             <Marker
//               key={_id}
//               position={[location.lat, location.lng]}
//               icon={customIcon}
//             >
//               <Popup>
//                 <strong>📍 {name}</strong>
//                 <br />
//                 {description}
//                 {image && (
//                   <img
//                     src={image}
//                     alt={name}
//                     style={{
//                       width: "100%",
//                       maxHeight: "200px",
//                       objectFit: "cover",
//                       marginTop: "10px",
//                     }}
//                   />
//                 )}
//               </Popup>
//             </Marker>
//           ))}
//         </MapContainer>
//       </div>

//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h2>Sell Requests</h2>
//         <input
//           type="text"
//           className="form-control"
//           placeholder="Search..."
//           style={{ width: "250px" }}
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p className="text-danger">{error}</p>
//       ) : (
//         <div className="table-responsive" style={{ maxHeight: "60vh", overflowY: "auto" }}>
//           <table className="table table-bordered text-center">
//             <thead className="table-dark">
//               <tr>
//                 <th>ID</th>
//                 <th>Name</th>
//                 <th>Contact</th>
//                 <th>Location</th>
//                 <th>Price</th>
//                 <th>Description</th>
//                 <th>Image</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredRequests.length > 0 ? (
//                 filteredRequests.map((request) => (
//                   <tr key={request._id}>
//                     <td>{request._id}</td>
//                     <td>{request.name}</td>
//                     <td>{request.contact}</td>
//                     <td>
//                       {request.location?.lat && request.location?.lng
//                         ? `${request.location.lat}, ${request.location.lng}`
//                         : "N/A"}
//                     </td>
//                     <td>₱{request.price}</td>
//                     <td>{request.description}</td>
//                     <td>
//                       {request.image && (
//                         <Image
//                           src={request.image}
//                           alt="Uploaded"
//                           width="50"
//                           height="50"
//                           rounded
//                           onClick={() => setSelectedRequest(request)}
//                           style={{ cursor: "pointer" }}
//                         />
//                       )}
//                     </td>
//                     <td>
//                       <span
//                         className={`badge ${
//                           request.status === "accepted"
//                             ? "bg-success"
//                             : request.status === "declined"
//                             ? "bg-danger"
//                             : "bg-warning text-dark"
//                         }`}
//                       >
//                         {request.status || "pending"}
//                       </span>
//                     </td>
//                     <td className="d-flex flex-column gap-1">
//                       <Button
//                         size="sm"
//                         variant="outline-success"
//                         onClick={() => handleStatusUpdate(request._id, "accepted")}
//                         disabled={request.status === "accepted"}
//                       >
//                         Accept
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline-warning"
//                         onClick={() => handleStatusUpdate(request._id, "declined")}
//                         disabled={request.status === "declined"}
//                       >
//                         Decline
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline-danger"
//                         onClick={() => handleDelete(request._id)}
//                       >
//                         <FaTrashAlt />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="9">No results found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       <div className="d-flex justify-content-end mt-3 gap-2">
//         <Button variant="success" onClick={handleDownloadExcel}>
//           Download Excel
//         </Button>
//         {selectedRequest && (
//           <Button variant="danger" onClick={handleDownloadPDF}>
//             Download PDF
//           </Button>
//         )}
//       </div>

//       {selectedRequest && (
//         <Modal show={true} onHide={() => setSelectedRequest(null)} size="lg">
//           <Modal.Header closeButton>
//             <Modal.Title>Request Details</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <div className="row">
//               <div className="col-md-6">
//                 <p><strong>ID:</strong> {selectedRequest._id}</p>
//                 <p><strong>Name:</strong> {selectedRequest.name}</p>
//                 <p><strong>Contact:</strong> {selectedRequest.contact}</p>
//                 <p><strong>Location:</strong> {selectedRequest.location?.lat}, {selectedRequest.location?.lng}</p>
//                 <p><strong>Price:</strong> ₱{selectedRequest.price}</p>
//                 <p><strong>Description:</strong> {selectedRequest.description}</p>
//               </div>
//               <div className="col-md-6 text-center">
//                 {selectedRequest.image && (
//                   <Image src={selectedRequest.image} fluid style={{ maxHeight: "300px" }} />
//                 )}
//               </div>
//             </div>
//           </Modal.Body>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default SellDashboard;

    // <Box sx={{ p: 3 }}>
    //   <Toaster position="top-right" />

    //   {/* Title + Map Toggle + Search */}
    //   <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
    //     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    //       <Typography variant="h5">Sell Requests</Typography>
    //       <Tooltip title={showMap ? "Hide Map" : "Show Map"}>
    //         <IconButton onClick={() => setShowMap((prev) => !prev)}>
    //           <MapIcon color={showMap ? "primary" : "action"} />
    //         </IconButton>
    //       </Tooltip>
    //     </Box>

    //     <TextField
    //       size="small"
    //       placeholder="Search..."
    //       value={searchQuery}
    //       onChange={(e) => setSearchQuery(e.target.value)}
    //     />
    //   </Box>

    //   {/* Map Section */}
    //   {showMap && (
    //     <Box sx={{ height: 400, mb: 4 }}>
    //       <MapContainer
    //         center={mapCenter}
    //         zoom={6}
    //         style={{ height: "100%", width: "100%" }}
    //       >
    //         <TileLayer
    //           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    //           attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    //         />
    //         {validLocations.map(({ _id, location, name, description, image }) => (
    //           <Marker
    //             key={_id}
    //             position={[location.lat, location.lng]}
    //             icon={customIcon}
    //           >
    //             <Popup>
    //               <strong>📍 {name}</strong>
    //               <br />
    //               {description}
    //               {image && (
    //                 <img
    //                   src={image}
    //                   alt={name}
    //                   style={{ width: "100%", maxHeight: 200, marginTop: 10 }}
    //                 />
    //               )}
    //             </Popup>
    //           </Marker>
    //         ))}
    //       </MapContainer>
    //     </Box>
    //   )}

    //   {/* Table */}
    //   {loading ? (
    //     <Loader />
    //   ) : error ? (
    //     <Typography color="error">{error}</Typography>
    //   ) : (
    //     <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
    //       <Table stickyHeader>
    //         <TableHead>
    //           <TableRow>
    //             {[
    //               "ID",
    //               "Name",
    //               "Contact",
    //               "Location",
    //               "Price",
    //               "Description",
    //               "Status",
    //               "Actions",
    //             ].map((head) => (
    //               <TableCell
    //                 key={head}
    //                 sx={{
    //                   bgcolor: "grey.700",
    //                   color: "white",
    //                   fontWeight: "bold",
    //                 }}
    //               >
    //                 {head}
    //               </TableCell>
    //             ))}
    //           </TableRow>
    //         </TableHead>

    //         <TableBody>
    //           {filteredRequests.length > 0 ? (
    //             filteredRequests.map((request) => (
    //               <TableRow
    //                 key={request._id}
    //                 hover
    //                 sx={{ cursor: "pointer" }}
    //                 onClick={() => setSelectedRequest(request)}
    //               >
    //                 <TableCell>{request._id}</TableCell>
    //                 <TableCell>{request.name}</TableCell>
    //                 <TableCell>{request.contact}</TableCell>
    //                 <TableCell>
    //                   {request.location?.lat && request.location?.lng
    //                     ? `${request.location.lat}, ${request.location.lng}`
    //                     : "N/A"}
    //                 </TableCell>
    //                 <TableCell>₱{request.price}</TableCell>
    //                 <TableCell>{request.description}</TableCell>
    //                 <TableCell>
    //                   <Typography
    //                     sx={{
    //                       borderColor:
    //                         request.status === "accepted"
    //                           ? "success.main"
    //                           : request.status === "declined"
    //                           ? "error.main"
    //                           : "warning.main",
    //                       color:
    //                         request.status === "accepted"
    //                           ? "success.main"
    //                           : request.status === "declined"
    //                           ? "error.main"
    //                           : "warning.main",
    //                       px: 1.5,
    //                       py: 0.25,
    //                       borderRadius: 1,
    //                       display: "inline-block",
    //                       fontWeight: 500,
    //                       textTransform: "capitalize",
    //                     }}
    //                   >
    //                     {request.status || "pending"}
    //                   </Typography>
    //                 </TableCell>
    //                 <TableCell onClick={(e) => e.stopPropagation()}>
    //                   <IconButton onClick={(e) => handleMenuOpen(e, request._id)}>
    //                     <MoreVertIcon />
    //                   </IconButton>
    //                   <Menu
    //                     anchorEl={anchorEl}
    //                     open={activeRowId === request._id}
    //                     onClose={handleMenuClose}
    //                     onClick={(e) => e.stopPropagation()}
    //                   >
    //                     <MenuItem
    //                       onClick={() => {
    //                         handleStatusUpdate(request._id, "accepted");
    //                         handleMenuClose();
    //                       }}
    //                       disabled={request.status === "accepted"}
    //                       sx={{
    //                         color: "success.main",
    //                         fontWeight: 500,
    //                         "&.Mui-disabled": { color: "success.light" },
    //                         "&:hover": {
    //                           bgcolor: "success.light",
    //                           color: "white",
    //                         },
    //                       }}
    //                     >
    //                       Accept
    //                     </MenuItem>
    //                     <MenuItem
    //                       onClick={() => {
    //                         handleStatusUpdate(request._id, "declined");
    //                         handleMenuClose();
    //                       }}
    //                       disabled={request.status === "declined"}
    //                       sx={{
    //                         color: "warning.main",
    //                         fontWeight: 500,
    //                         "&.Mui-disabled": { color: "warning.light" },
    //                         "&:hover": {
    //                           bgcolor: "warning.light",
    //                           color: "white",
    //                         },
    //                       }}
    //                     >
    //                       Decline
    //                     </MenuItem>
    //                     <MenuItem
    //                       onClick={() => {
    //                         handleDelete(request._id);
    //                         handleMenuClose();
    //                       }}
    //                       sx={{
    //                         color: "error.main",
    //                         fontWeight: 500,
    //                         "&:hover": {
    //                           bgcolor: "error.light",
    //                           color: "white",
    //                         },
    //                       }}
    //                     >
    //                       Delete
    //                     </MenuItem>
    //                     <MenuItem
    //                       onClick={() => {
    //                         handleDownloadPDF(request);
    //                         handleMenuClose();
    //                       }}
    //                       sx={{
    //                         color: "primary.main",
    //                         fontWeight: 500,
    //                         "&:hover": {
    //                           bgcolor: "primary.light",
    //                           color: "white",
    //                         },
    //                       }}
    //                     >
    //                       Download PDF
    //                     </MenuItem>
    //                   </Menu>
    //                 </TableCell>
    //               </TableRow>
    //             ))
    //           ) : (
    //             <TableRow>
    //               <TableCell colSpan={8} align="center">
    //                 No results found.
    //               </TableCell>
    //             </TableRow>
    //           )}
    //         </TableBody>
    //       </Table>
    //     </TableContainer>
    //   )}

    //   {/* Download Excel */}
    //   <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
    //     <Button variant="contained" color="success" onClick={handleDownloadExcel}>
    //       Download Excel
    //     </Button>
    //   </Box>

    //   {/* Modal */}
    //   {selectedRequest && (
    //     <ReqDetailModal
    //       request={selectedRequest}
    //       onClose={() => setSelectedRequest(null)}
    //     />
    //   )}
    // </Box>


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
import jsPDF from "jspdf";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ReqDetailModal from "./ReqDetailModal";
import SellDashboardMap from "./SellDashboardMap";

const markerIcon2x = require("leaflet/dist/images/marker-icon-2x.png");
const markerIcon = require("leaflet/dist/images/marker-icon.png");
const markerShadow = require("leaflet/dist/images/marker-shadow.png");

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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

  useEffect(() => {
    let filtered = requests.filter(
      (request) =>
        request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(
        (req) => (req.status || "pending") === statusFilter
      );
    }

    // Apply price filter
    if (priceFilter === "low") {
      filtered = filtered.filter((req) => req.price < 5000);
    } else if (priceFilter === "mid") {
      filtered = filtered.filter((req) => req.price >= 5000 && req.price <= 20000);
    } else if (priceFilter === "high") {
      filtered = filtered.filter((req) => req.price > 20000);
    }

    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, priceFilter, requests]);

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
      const res = await axios.patch(`${API_URL}/api/sell/${id}`, {
        status: newStatus,
      });
      setRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status: res.data.status } : req
        )
      );
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

  const handleDownloadPDF = (request) => {
    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text("Sell Request Details", 10, 20);
    docPDF.setFontSize(12);
    docPDF.text(`ID: ${request._id}`, 10, 40);
    docPDF.text(`Name: ${request.name}`, 10, 50);
    docPDF.text(`Contact: ${request.contact}`, 10, 60);
    docPDF.text(
      `Location: ${request.location?.lat}, ${request.location?.lng}`,
      10,
      70
    );
    docPDF.text(`Price: ₱${request.price}`, 10, 80);
    const description = docPDF.splitTextToSize(
      `Description: ${request.description}`,
      180
    );
    docPDF.text(description, 10, 90);
    if (request.image)
      docPDF.addImage(request.image, "JPEG", 120, 40, 70, 70);
    docPDF.save(`Sell_Request_${request._id}.pdf`);
  };

  const handleDownloadExcel = () => {
    const exportData = filteredRequests.map(({ image, ...rest }) => rest);
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

  // Filter menu
  const handleFilterOpen = (event) => {
    setFilterAnchor(event.currentTarget);
  };
  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Title + Map Toggle + Search + Filter */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h5">Sell Requests</Typography>
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
<Menu
  anchorEl={filterAnchor}
  open={Boolean(filterAnchor)}
  onClose={handleFilterClose}
>
  <MenuItem disabled>Filter by Status</MenuItem>
  <MenuItem
    onClick={() => setStatusFilter("")}
    sx={{
      fontWeight: statusFilter === "" ? "bold" : "normal",
      bgcolor: statusFilter === "" ? "grey.700" : "inherit",
      color: statusFilter === "" ? "primary.contrastText" : "inherit",
    }}
  >
    All
  </MenuItem>
  <MenuItem
    onClick={() => setStatusFilter("pending")}
    sx={{
      fontWeight: statusFilter === "pending" ? "bold" : "normal",
      bgcolor: statusFilter === "pending" ? "grey.700" : "inherit",
      color: statusFilter === "pending" ? "primary.contrastText" : "inherit",
    }}
  >
    Pending
  </MenuItem>
  <MenuItem
    onClick={() => setStatusFilter("accepted")}
    sx={{
      fontWeight: statusFilter === "accepted" ? "bold" : "normal",
      bgcolor: statusFilter === "accepted" ? "grey.700" : "inherit",
      color: statusFilter === "accepted" ? "primary.contrastText" : "inherit",
    }}
  >
    Accepted
  </MenuItem>
  <MenuItem
    onClick={() => setStatusFilter("declined")}
    sx={{
      fontWeight: statusFilter === "declined" ? "bold" : "normal",
      bgcolor: statusFilter === "declined" ? "grey.700" : "inherit",
      color: statusFilter === "declined" ? "primary.contrastText" : "inherit",
    }}
  >
    Declined
  </MenuItem>

  <MenuItem divider />
  <MenuItem disabled>Filter by Price</MenuItem>
  <MenuItem
    onClick={() => setPriceFilter("")}
    sx={{
      fontWeight: priceFilter === "" ? "bold" : "normal",
      bgcolor: priceFilter === "" ? "grey.700" : "inherit",
      color: priceFilter === "" ? "primary.contrastText" : "inherit",
    }}
  >
    All
  </MenuItem>
  <MenuItem
    onClick={() => setPriceFilter("low")}
    sx={{
      fontWeight: priceFilter === "low" ? "bold" : "normal",
      bgcolor: priceFilter === "low" ? "grey.700" : "inherit",
      color: priceFilter === "low" ? "primary.contrastText" : "inherit",
    }}
  >
    Below ₱5,000
  </MenuItem>
  <MenuItem
    onClick={() => setPriceFilter("mid")}
    sx={{
      fontWeight: priceFilter === "mid" ? "bold" : "normal",
      bgcolor: priceFilter === "mid" ? "grey.700" : "inherit",
      color: priceFilter === "mid" ? "primary.contrastText" : "inherit",
    }}
  >
    ₱5,000 – ₱20,000
  </MenuItem>
  <MenuItem
    onClick={() => setPriceFilter("high")}
    sx={{
      fontWeight: priceFilter === "high" ? "bold" : "normal",
      bgcolor: priceFilter === "high" ? "grey.700" : "inherit",
      color: priceFilter === "high" ? "primary.contrastText" : "inherit",
    }}
  >
    Above ₱20,000
  </MenuItem>
</Menu>

            </Box>
          </Box>

          {/* Map Section */}
          {showMap && (
            <Box sx={{ mb: 2 }}>
              <SellDashboardMap
                requests={filteredRequests}
                onClose={() => setShowMap(false)}
              />
            </Box>
          )}

          {/* Table */}
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {[
                      "ID",
                      "Name",
                      "Contact",
                      "Location",
                      "Price",
                      "Description",
                      "Status",
                      "Actions",
                    ].map((head) => (
                      <TableCell
                        key={head}
                        sx={{
                          bgcolor: "grey.700",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <TableRow
                        key={request._id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => setSelectedRequest(request)}
                      >
                        <TableCell>{request._id}</TableCell>
                        <TableCell>{request.name}</TableCell>
                        <TableCell>{request.contact}</TableCell>
                        <TableCell>
                          {request.location?.lat && request.location?.lng
                            ? `${request.location.lat}, ${request.location.lng}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>₱{request.price}</TableCell>
                        <TableCell>{request.description}</TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              borderColor:
                                request.status === "accepted"
                                  ? "success.main"
                                  : request.status === "declined"
                                  ? "error.main"
                                  : "warning.main",
                              color:
                                request.status === "accepted"
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
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, request._id)}
                          >
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
                                "&:hover": {
                                  bgcolor: "success.light",
                                  color: "white",
                                },
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
                                "&:hover": {
                                  bgcolor: "warning.light",
                                  color: "white",
                                },
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
                                "&:hover": {
                                  bgcolor: "error.light",
                                  color: "white",
                                },
                              }}
                            >
                              Delete
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                handleDownloadPDF(request);
                                handleMenuClose();
                              }}
                              sx={{
                                color: "primary.main",
                                fontWeight: 500,
                                "&:hover": {
                                  bgcolor: "primary.light",
                                  color: "white",
                                },
                              }}
                            >
                              Download PDF
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
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
            <Button
              variant="contained"
              color="success"
              onClick={handleDownloadExcel}
            >
              Download Excel
            </Button>
          </Box>

          {/* Modal */}
          {selectedRequest && (
            <ReqDetailModal
              request={selectedRequest}
              onClose={() => setSelectedRequest(null)}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default SellDashboard;
