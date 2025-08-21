// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Modal, Button, Image } from "react-bootstrap";
// import jsPDF from "jspdf";
// import * as XLSX from "xlsx";
// import { FaTrashAlt } from "react-icons/fa";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
// } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "bootstrap/dist/css/bootstrap.min.css";
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// const API_URL = process.env.REACT_APP_API_URL;

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

// const DemolishDashboard = () => {
//   const [requests, setRequests] = useState([]);
//   const [filteredRequests, setFilteredRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedRequest, setSelectedRequest] = useState(null);

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

//   useEffect(() => {
//     const filtered = requests.filter((request) =>
//       request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       request.description.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//     setFilteredRequests(filtered);
//   }, [searchQuery, requests]);

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this request?")) {
//       try {
//         await axios.delete(`${API_URL}/api/demolish/${id}`);
//         setRequests((prev) => prev.filter((req) => req._id !== id));
//       } catch (error) {
//         console.error("Error deleting request:", error);
//       }
//     }
//   };

//   const handleStatusUpdate = async (id, newStatus) => {
//     try {
//       await axios.patch(`${API_URL}/api/demolish/${id}`, { status: newStatus });
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
//     docPDF.text("Demolish Request Details", 10, 20);
//     docPDF.setFontSize(12);
//     docPDF.text(`ID: ${selectedRequest._id}`, 10, 40);
//     docPDF.text(`Name: ${selectedRequest.name}`, 10, 50);
//     docPDF.text(`Contact: ${selectedRequest.contact}`, 10, 60);
//     docPDF.text(`Location: ${selectedRequest.location?.lat}, ${selectedRequest.location?.lng}`, 10, 70);
//     const description = docPDF.splitTextToSize(`Description: ${selectedRequest.description}`, 180);
//     docPDF.text(description, 10, 80);
//     if (selectedRequest.image) {
//       docPDF.addImage(selectedRequest.image, "JPEG", 120, 40, 70, 70);
//     }
//     docPDF.save(`Demolish_Request_${selectedRequest._id}.pdf`);
//   };

//   const handleDownloadExcel = () => {
//     const exportData = filteredRequests.map(({ image, ...rest }) => rest);
//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Demolish Requests");
//     XLSX.writeFile(wb, "Demolish_Requests.xlsx");
//   };

//   const validLocations = filteredRequests.filter(
//     (r) => r.location?.lat && r.location?.lng
//   );

//   const defaultPosition = [13.9311, 121.6176];
//   const mapCenter = validLocations.length
//     ? [validLocations[0].location.lat, validLocations[0].location.lng]
//     : defaultPosition;

//   return (
//     <div className="container mt-4">
//       <h2>Demolish Request Map</h2>
//       <MapContainer center={mapCenter} zoom={6} style={{ height: "400px", width: "100%" }}>
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//         />
//         {validLocations.map((req) => (
//           <Marker key={req._id} position={[req.location.lat, req.location.lng]} icon={customIcon}>
//             <Popup>
//               <strong>📍 {req.name}</strong><br />
//               {req.description}<br />
//               {req.image && (
//                 <img
//                   src={req.image}
//                   alt={req.name}
//                   style={{ width: "100%", maxHeight: "200px", marginTop: 10 }}
//                 />
//               )}
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//       <div className="mt-2">
//         <strong>Legend:</strong>{" "}
//         <span style={{ color: "green" }}>● Accepted</span>{" | "}
//         <span style={{ color: "orange" }}>● Pending</span>{" | "}
//         <span style={{ color: "red" }}>● Declined</span>
//       </div>

//       <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
//         <h2>Demolish Requests</h2>
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
//         <div className="table-responsive" style={{ height: "50vh", overflowY: "auto" }}>
//           <table className="table table-bordered text-center">
//             <thead className="table-dark">
//               <tr>
//                 <th>ID</th>
//                 <th>Name</th>
//                 <th>Contact</th>
//                 <th>Location</th>
//                 <th>Description</th>
//                 <th>Image</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredRequests.length > 0 ? (
//                 filteredRequests.map((req) => (
//                   <tr key={req._id}>
//                     <td>{req._id}</td>
//                     <td>{req.name}</td>
//                     <td>{req.contact}</td>
//                     <td>{req.location?.lat}, {req.location?.lng}</td>
//                     <td>{req.description}</td>
//                     <td>
//                       {req.image && (
//                         <Image
//                           src={req.image}
//                           alt="Uploaded"
//                           width="50"
//                           height="50"
//                           rounded
//                           onClick={() => setSelectedRequest(req)}
//                           style={{ cursor: "pointer" }}
//                         />
//                       )}
//                     </td>
//                     <td>
//                       <span className={`badge ${
//                         req.status === "accepted"
//                           ? "bg-success"
//                           : req.status === "declined"
//                           ? "bg-danger"
//                           : "bg-warning text-dark"
//                       }`}>
//                         {req.status || "pending"}
//                       </span>
//                     </td>
//                     <td className="d-flex flex-column gap-1">
//                       <Button
//                         size="sm"
//                         variant="outline-success"
//                         onClick={() => handleStatusUpdate(req._id, "accepted")}
//                         disabled={req.status === "accepted"}
//                       >
//                         Accept
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline-warning"
//                         onClick={() => handleStatusUpdate(req._id, "declined")}
//                         disabled={req.status === "declined"}
//                       >
//                         Decline
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline-danger"
//                         onClick={() => handleDelete(req._id)}
//                       >
//                         <FaTrashAlt />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="8">No results found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       <div className="d-flex justify-content-end mt-3 gap-2">
//         <Button variant="success" onClick={handleDownloadExcel}>Download Excel</Button>
//         {selectedRequest && (
//           <Button variant="danger" onClick={handleDownloadPDF}>Download PDF</Button>
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

// export default DemolishDashboard;

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
//   CircularProgress,
//   Menu,
//   MenuItem,
//   IconButton,
// } from "@mui/material";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import * as XLSX from "xlsx";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import ReqDetailModal from "./ReqDetailModal";

// const markerIcon2x = require("leaflet/dist/images/marker-icon-2x.png");
// const markerIcon = require("leaflet/dist/images/marker-icon.png");
// const markerShadow = require("leaflet/dist/images/marker-shadow.png");

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

// const DemolishDashboard = () => {
//   const [requests, setRequests] = useState([]);
//   const [filteredRequests, setFilteredRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedRequest, setSelectedRequest] = useState(null);

//   const [anchorEl, setAnchorEl] = useState(null);
//   const [activeRowId, setActiveRowId] = useState(null);

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

//   useEffect(() => {
//     const filtered = requests.filter(
//       (req) =>
//         req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         req.contact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         req.description.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//     setFilteredRequests(filtered);
//   }, [searchQuery, requests]);

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
//       const res = await axios.patch(`${API_URL}/api/demolish/${id}`, { status: newStatus });
//       setRequests((prev) =>
//         prev.map((req) => (req._id === id ? { ...req, status: res.data.status } : req))
//       );
//       setFilteredRequests((prev) =>
//         prev.map((req) => (req._id === id ? { ...req, status: res.data.status } : req))
//       );
//       toast.success(`Request ${newStatus}`);
//     } catch (error) {
//       console.error("Error updating status:", error);
//       toast.error("Failed to update status");
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
//       await axios.delete(`${API_URL}/api/demolish/${id}`);
//       setRequests((prev) => prev.filter((req) => req._id !== id));
//       setFilteredRequests((prev) => prev.filter((req) => req._id !== id));
//       toast.success("Request deleted");
//     } catch (error) {
//       console.error("Error deleting request:", error);
//       toast.error("Failed to delete request");
//     }
//   };

//   const handleDownloadExcel = () => {
//     const exportData = filteredRequests.map(({ image, ...rest }) => rest); // no image column
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
//     <Box sx={{ p: 3 }}>
//       <Toaster position="top-right" />
//       <Typography variant="h4" mb={2}>
//         Demolish Request Map
//       </Typography>

//       <Box sx={{ height: 400, mb: 4 }}>
//         <MapContainer center={mapCenter} zoom={6} style={{ height: "100%", width: "100%" }}>
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//           />
//           {validLocations.map(({ _id, location, name, description, image }) => (
//             <Marker key={_id} position={[location.lat, location.lng]} icon={customIcon}>
//               <Popup>
//                 <strong>📍 {name}</strong>
//                 <br />
//                 {description}
//                 {image && (
//                   <img
//                     src={image}
//                     alt={name}
//                     style={{ width: "100%", maxHeight: 200, marginTop: 10 }}
//                   />
//                 )}
//               </Popup>
//             </Marker>
//           ))}
//         </MapContainer>
//       </Box>

//       <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
//         <Typography variant="h4">Demolish Requests</Typography>
//         <TextField
//           size="small"
//           placeholder="Search..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </Box>

//       {loading ? (
//         <CircularProgress />
//       ) : error ? (
//         <Typography color="error">{error}</Typography>
//       ) : (
//         <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
//           <Table stickyHeader>
//             <TableHead>
//               <TableRow>
//                 {["ID", "Name", "Contact", "Location", "Description", "Status", "Actions"].map(
//                   (head) => (
//                     <TableCell
//                       key={head}
//                       sx={{ bgcolor: "grey.700", color: "white", fontWeight: "bold" }}
//                     >
//                       {head}
//                     </TableCell>
//                   )
//                 )}
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {filteredRequests.length > 0 ? (
//                 filteredRequests.map((req) => {
//                   const isFinal = ["accepted", "declined"].includes(req.status);
//                   return (
//                     <TableRow
//                       key={req._id}
//                       hover
//                       sx={{ cursor: "pointer" }}
//                       onClick={() => setSelectedRequest(req)}
//                     >
//                       <TableCell>{req._id}</TableCell>
//                       <TableCell>{req.name}</TableCell>
//                       <TableCell>{req.contact}</TableCell>
//                       <TableCell>
//                         {req.location?.lat && req.location?.lng
//                           ? `${req.location.lat}, ${req.location.lng}`
//                           : "N/A"}
//                       </TableCell>
//                       <TableCell>{req.description}</TableCell>
//                       <TableCell>
//                         <Typography
//                           sx={{
//                             borderColor:
//                               req.status === "accepted"
//                                 ? "success.main"
//                                 : req.status === "declined"
//                                 ? "error.main"
//                                 : "warning.main",
//                             color:
//                               req.status === "accepted"
//                                 ? "success.main"
//                                 : req.status === "declined"
//                                 ? "error.main"
//                                 : "warning.main",
//                             px: 1.5,
//                             py: 0.25,
//                             borderRadius: 1,
//                             display: "inline-block",
//                             fontWeight: 500,
//                             textTransform: "capitalize",
//                           }}
//                         >
//                           {req.status || "pending"}
//                         </Typography>
//                       </TableCell>
//                       <TableCell onClick={(e) => e.stopPropagation()}>
//                         <IconButton onClick={(e) => handleMenuOpen(e, req._id)}>
//                           <MoreVertIcon />
//                         </IconButton>
//                         <Menu
//                           anchorEl={anchorEl}
//                           open={activeRowId === req._id}
//                           onClose={handleMenuClose}
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           <MenuItem
//                             onClick={() => {
//                               handleStatusUpdate(req._id, "accepted");
//                               handleMenuClose();
//                             }}
//                             disabled={req.status === "accepted"}
//                             sx={{
//                               color: "success.main",
//                               fontWeight: 500,
//                               "&.Mui-disabled": { color: "success.light" },
//                               "&:hover": { bgcolor: "success.light", color: "white" },
//                             }}
//                           >
//                             Accept
//                           </MenuItem>
//                           <MenuItem
//                             onClick={() => {
//                               handleStatusUpdate(req._id, "declined");
//                               handleMenuClose();
//                             }}
//                             disabled={req.status === "declined"}
//                             sx={{
//                               color: "warning.main",
//                               fontWeight: 500,
//                               "&.Mui-disabled": { color: "warning.light" },
//                               "&:hover": { bgcolor: "warning.light", color: "white" },
//                             }}
//                           >
//                             Decline
//                           </MenuItem>
//                           <MenuItem
//                             onClick={() => {
//                               handleDelete(req._id);
//                               handleMenuClose();
//                             }}
//                             sx={{
//                               color: "error.main",
//                               fontWeight: 500,
//                               "&:hover": { bgcolor: "error.light", color: "white" },
//                             }}
//                           >
//                             Delete
//                           </MenuItem>
//                         </Menu>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={7} align="center">
//                     No results found.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       )}

//       <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
//         <Button variant="contained" color="success" onClick={handleDownloadExcel}>
//           Download Excel
//         </Button>
//       </Box>

//       {selectedRequest && (
//         <ReqDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
//       )}
//     </Box>
//   );
// };

// export default DemolishDashboard;
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
  // CircularProgress,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import Loader from "./Loader";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MapIcon from "@mui/icons-material/Map";
import * as XLSX from "xlsx";
import ReqDetailModal from "./ReqDetailModal";
import DemolishDashboardMap from "./DemolishDashboardMap";

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

  useEffect(() => {
    const filtered = requests.filter(
      (req) =>
        req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.contact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchQuery, requests]);

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
      const res = await axios.patch(`${API_URL}/api/demolish/${id}`, {
        status: newStatus,
      });
      setRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status: res.data.status } : req
        )
      );
      setFilteredRequests((prev) =>
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
      await axios.delete(`${API_URL}/api/demolish/${id}`);
      setRequests((prev) => prev.filter((req) => req._id !== id));
      setFilteredRequests((prev) => prev.filter((req) => req._id !== id));
      toast.success("Request deleted");
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("Failed to delete request");
    }
  };

  const handleDownloadExcel = () => {
    const exportData = filteredRequests.map(({ image, ...rest }) => rest); // no image column
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

  return (
    <Box sx={{ p: 3 }}>
  <Toaster position="top-right" />

  {loading ? (
    // Loader skeleton
    <Loader />
  ) : (
    <>
      {/* Title + Map Toggle + Search */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h5">Demolish Requests</Typography>
          <Tooltip title={showMap ? "Hide Map" : "Show Map"}>
            <IconButton onClick={() => setShowMap((prev) => !prev)}>
              <MapIcon color={showMap ? "primary" : "action"} />
            </IconButton>
          </Tooltip>
        </Box>

        <TextField
          size="small"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* Map Section */}
      {showMap && (
        <Box sx={{ mb: 2 }}>
          <DemolishDashboardMap
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
                filteredRequests.map((req) => (
                  <TableRow
                    key={req._id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => setSelectedRequest(req)}
                  >
                    <TableCell>{req._id}</TableCell>
                    <TableCell>{req.name}</TableCell>
                    <TableCell>{req.contact}</TableCell>
                    <TableCell>
                      {req.location?.lat && req.location?.lng
                        ? `${req.location.lat}, ${req.location.lng}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{req.description}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          borderColor:
                            req.status === "accepted"
                              ? "success.main"
                              : req.status === "declined"
                              ? "error.main"
                              : "warning.main",
                          color:
                            req.status === "accepted"
                              ? "success.main"
                              : req.status === "declined"
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
                        {req.status || "pending"}
                      </Typography>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton onClick={(e) => handleMenuOpen(e, req._id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={activeRowId === req._id}
                        onClose={handleMenuClose}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MenuItem
                          onClick={() => {
                            handleStatusUpdate(req._id, "accepted");
                            handleMenuClose();
                          }}
                          disabled={req.status === "accepted"}
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
                            handleStatusUpdate(req._id, "declined");
                            handleMenuClose();
                          }}
                          disabled={req.status === "declined"}
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
                            handleDelete(req._id);
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
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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

    // <Box sx={{ p: 3 }}>
    //   <Toaster position="top-right" />

    //   {/* Title + Map Icon + Search */}
    //   <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
    //     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    //       <Typography variant="h5">Demolish Requests</Typography>
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
    //     <Box sx={{ mb: 2 }}>
    //       <DemolishDashboardMap
    //         requests={filteredRequests}
    //         onClose={() => setShowMap(false)}
    //       />
    //     </Box>
    //   )}

    //   {/* Table */}
    //   {loading ? (
    //     // <CircularProgress />
    //     <Loader />
    //   ) : error ? (
    //     <Typography color="error">{error}</Typography>
    //   ) : (
    //     <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
    //       <Table stickyHeader>
    //         <TableHead>
    //           <TableRow>
    //             {["ID", "Name", "Contact", "Location", "Description", "Status", "Actions"].map(
    //               (head) => (
    //                 <TableCell
    //                   key={head}
    //                   sx={{ bgcolor: "grey.700", color: "white", fontWeight: "bold" }}
    //                 >
    //                   {head}
    //                 </TableCell>
    //               )
    //             )}
    //           </TableRow>
    //         </TableHead>

    //         <TableBody>
    //           {filteredRequests.length > 0 ? (
    //             filteredRequests.map((req) => {
    //               return (
    //                 <TableRow
    //                   key={req._id}
    //                   hover
    //                   sx={{ cursor: "pointer" }}
    //                   onClick={() => setSelectedRequest(req)}
    //                 >
    //                   <TableCell>{req._id}</TableCell>
    //                   <TableCell>{req.name}</TableCell>
    //                   <TableCell>{req.contact}</TableCell>
    //                   <TableCell>
    //                     {req.location?.lat && req.location?.lng
    //                       ? `${req.location.lat}, ${req.location.lng}`
    //                       : "N/A"}
    //                   </TableCell>
    //                   <TableCell>{req.description}</TableCell>
    //                   <TableCell>
    //                     <Typography
    //                       sx={{
    //                         borderColor:
    //                           req.status === "accepted"
    //                             ? "success.main"
    //                             : req.status === "declined"
    //                             ? "error.main"
    //                             : "warning.main",
    //                         color:
    //                           req.status === "accepted"
    //                             ? "success.main"
    //                             : req.status === "declined"
    //                             ? "error.main"
    //                             : "warning.main",
    //                         px: 1.5,
    //                         py: 0.25,
    //                         borderRadius: 1,
    //                         display: "inline-block",
    //                         fontWeight: 500,
    //                         textTransform: "capitalize",
    //                       }}
    //                     >
    //                       {req.status || "pending"}
    //                     </Typography>
    //                   </TableCell>
    //                   <TableCell onClick={(e) => e.stopPropagation()}>
    //                     <IconButton onClick={(e) => handleMenuOpen(e, req._id)}>
    //                       <MoreVertIcon />
    //                     </IconButton>
    //                     <Menu
    //                       anchorEl={anchorEl}
    //                       open={activeRowId === req._id}
    //                       onClose={handleMenuClose}
    //                       onClick={(e) => e.stopPropagation()}
    //                     >
    //                       <MenuItem
    //                         onClick={() => {
    //                           handleStatusUpdate(req._id, "accepted");
    //                           handleMenuClose();
    //                         }}
    //                         disabled={req.status === "accepted"}
    //                         sx={{
    //                           color: "success.main",
    //                           fontWeight: 500,
    //                           "&.Mui-disabled": { color: "success.light" },
    //                           "&:hover": { bgcolor: "success.light", color: "white" },
    //                         }}
    //                       >
    //                         Accept
    //                       </MenuItem>
    //                       <MenuItem
    //                         onClick={() => {
    //                           handleStatusUpdate(req._id, "declined");
    //                           handleMenuClose();
    //                         }}
    //                         disabled={req.status === "declined"}
    //                         sx={{
    //                           color: "warning.main",
    //                           fontWeight: 500,
    //                           "&.Mui-disabled": { color: "warning.light" },
    //                           "&:hover": { bgcolor: "warning.light", color: "white" },
    //                         }}
    //                       >
    //                         Decline
    //                       </MenuItem>
    //                       <MenuItem
    //                         onClick={() => {
    //                           handleDelete(req._id);
    //                           handleMenuClose();
    //                         }}
    //                         sx={{
    //                           color: "error.main",
    //                           fontWeight: 500,
    //                           "&:hover": { bgcolor: "error.light", color: "white" },
    //                         }}
    //                       >
    //                         Delete
    //                       </MenuItem>
    //                     </Menu>
    //                   </TableCell>
    //                 </TableRow>
    //               );
    //             })
    //           ) : (
    //             <TableRow>
    //               <TableCell colSpan={7} align="center">
    //                 No results found.
    //               </TableCell>
    //             </TableRow>
    //           )}
    //         </TableBody>
    //       </Table>
    //     </TableContainer>
    //   )}

    //   {/* Download Button */}
    //   <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
    //     <Button variant="contained" color="success" onClick={handleDownloadExcel}>
    //       Download Excel
    //     </Button>
    //   </Box>

    //   {selectedRequest && (
    //     <ReqDetailModal
    //       request={selectedRequest}
    //       onClose={() => setSelectedRequest(null)}
    //     />
    //   )}
    // </Box>
  );
};

export default DemolishDashboard;
