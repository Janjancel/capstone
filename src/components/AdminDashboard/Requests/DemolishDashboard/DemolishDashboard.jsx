

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
    let filtered = requests.filter(
      (request) =>
        request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.contact || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (statusFilter) {
      filtered = filtered.filter(
        (req) => (req.status || "pending") === statusFilter
      );
    }

    if (priceFilter === "low") {
      filtered = filtered.filter((req) => req.price < 5000);
    } else if (priceFilter === "mid") {
      filtered = filtered.filter(
        (req) => req.price >= 5000 && req.price <= 20000
      );
    } else if (priceFilter === "high") {
      filtered = filtered.filter((req) => req.price > 20000);
    }

    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, priceFilter, requests]);

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

      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, ...res.data } : r))
      );

      // notification
      try {
        await axios.post(`${API_URL}/api/notifications`, {
          userId: res.data.userId,
          orderId: res.data._id,
          message: `Your demolition request has been scheduled on ${new Date(
            date
          ).toLocaleDateString()}`,
        });
      } catch (notifErr) {
        console.error("Failed to create notification:", notifErr);
      }

      toast.success(
        `Demolition scheduled on ${new Date(date).toLocaleDateString()}`
      );
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

      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, ...res.data } : r))
      );

      // notification
      try {
        await axios.post(`${API_URL}/api/notifications`, {
          userId: res.data.userId,
          orderId: res.data._id,
          message: `Your ocular visit has been scheduled on ${new Date(
            date
          ).toLocaleDateString()}`,
        });
      } catch (notifErr) {
        console.error("Failed to create notification:", notifErr);
      }

      toast.success(
        `Ocular visit scheduled on ${new Date(date).toLocaleDateString()}`
      );
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

  const handleDownloadPDF = (request) => {
    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text("Demolish Request Details", 10, 20);
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

    let y = 110;
    if (request.images) {
      if (request.images.front) {
        docPDF.text("Front View:", 10, y);
        docPDF.addImage(request.images.front, "JPEG", 50, y - 5, 60, 60);
        y += 70;
      }
      if (request.images.side) {
        docPDF.text("Side View:", 10, y);
        docPDF.addImage(request.images.side, "JPEG", 50, y - 5, 60, 60);
        y += 70;
      }
      if (request.images.back) {
        docPDF.text("Back View:", 10, y);
        docPDF.addImage(request.images.back, "JPEG", 50, y - 5, 60, 60);
        y += 70;
      }
    }

    if (request.scheduledDate) {
      docPDF.text(
        `Scheduled Date: ${new Date(request.scheduledDate).toLocaleDateString()}`,
        10,
        y + 10
      );
    }
    docPDF.save(`Demolish_Request_${request._id}.pdf`);
  };

  const handleDownloadExcel = () => {
    const exportData = filteredRequests.map(({ images, ...rest }) => rest);
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
              <Menu
                anchorEl={filterAnchor}
                open={Boolean(filterAnchor)}
                onClose={handleFilterClose}
              >
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
              <DemolishDashboardMap
                requests={filteredRequests}
                onClose={() => setShowMap(false)}
              />
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
                      "Description",
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
                                request.status === "scheduled" ||
                                request.status === "ocular_scheduled"
                                  ? "success.main"
                                  : request.status === "declined"
                                  ? "error.main"
                                  : "warning.main",
                              color:
                                request.status === "scheduled" ||
                                request.status === "ocular_scheduled"
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
                          {request.scheduledDate
                            ? new Date(
                                request.scheduledDate
                              ).toLocaleDateString()
                            : "N/A"}
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
                                handleScheduleDemolition(request._id);
                                handleMenuClose();
                              }}
                              sx={{
                                color: "success.main",
                                fontWeight: 500,
                                "&:hover": {
                                  bgcolor: "success.light",
                                  color: "white",
                                },
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
                                "&:hover": {
                                  bgcolor: "info.light",
                                  color: "white",
                                },
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
                      <TableCell
                        colSpan={9}
                        align="center"
                        sx={{ color: "grey.500" }}
                      >
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleDownloadExcel}
            >
              Download Excel
            </Button>
          </Box>

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

export default DemolishDashboard;
