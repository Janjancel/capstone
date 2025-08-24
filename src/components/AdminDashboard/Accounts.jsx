import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Badge,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Menu,
} from "@mui/material";
import { green, grey } from "@mui/material/colors";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";

const AccountsDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token"); // JWT token
  const pollingRef = useRef(null);

  // Fetch all accounts
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(res.data);
      setFilteredAccounts(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err);
      setError("Failed to load account data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    pollingRef.current = setInterval(fetchAccounts, 3000);
    return () => clearInterval(pollingRef.current);
  }, [API_URL]);

  // Filter accounts based on search, role, status
  useEffect(() => {
    let filtered = accounts.filter(
      (account) =>
        account.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (roleFilter !== "All") {
      filtered = filtered.filter(
        (account) => account.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (account) => account.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredAccounts(filtered);
  }, [searchQuery, roleFilter, statusFilter, accounts]);

  // Toggle user status
  const toggleStatus = async (account) => {
    if (!account?._id) return;
    const newStatus = account.status === "online" ? "offline" : "online";
    try {
      await axios.patch(
        `${API_URL}/api/users/status/${account._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`User marked as ${newStatus}`);
      fetchAccounts();
    } catch (err) {
      console.error("Failed to update status:", err.response?.data || err);
      toast.error("Failed to update user status.");
    }
  };

  // Menu handlers
  const handleMenuOpen = (event, account) => {
    setAnchorEl(event.currentTarget);
    setSelectedAccount(account);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAccount(null);
  };

  // Add admin
  const handleAddAdmin = async () => {
    if (!selectedAccount?._id) return;
    try {
      await axios.patch(
        `${API_URL}/api/users/role/${selectedAccount._id}`,
        { role: "admin" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${selectedAccount.username} is now an Admin`);
      fetchAccounts();
    } catch (err) {
      console.error("Add Admin Error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      handleMenuClose();
    }
  };

  // Remove admin
  const handleRemoveAdmin = async () => {
    if (!selectedAccount?._id) return;
    try {
      await axios.patch(
        `${API_URL}/api/users/role/${selectedAccount._id}`,
        { role: "client" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${selectedAccount.username} removed as Admin`);
      fetchAccounts();
    } catch (err) {
      console.error("Remove Admin Error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      handleMenuClose();
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedAccount?._id) return;
    Swal.fire({
      title: `Delete ${selectedAccount.username}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/api/users/${selectedAccount._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success(`${selectedAccount.username} deleted`);
          fetchAccounts();
        } catch (err) {
          console.error("Delete User Error:", err.response?.data || err);
          toast.error(err.response?.data?.message || "Failed to delete user");
        } finally {
          handleMenuClose();
        }
      }
    });
  };

  return (
    <Box display="flex" justifyContent="center" mt={4} px={2} overflow="auto">
      <Paper
        elevation={3}
        sx={{
          width: "90vw",
          maxHeight: "90vh",
          p: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Accounts Management</Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 250 }}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center">
            {error}
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: "60vh", overflowY: "auto" }}>
            <Table stickyHeader>
              <TableHead sx={{ backgroundColor: grey[900] }}>
                <TableRow>
                  <TableCell sx={{ color: "#202020ff" }}>Profile</TableCell>
                  <TableCell sx={{ color: "#202020ff" }}>Username</TableCell>
                  <TableCell sx={{ color: "#202020ff" }}>Email</TableCell>
                  <TableCell sx={{ color: "#202020ff" }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        sx={{ color: "#202020ff", fontWeight: 600, backgroundColor: grey[100] }}
                      >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="client">Client</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell sx={{ color: "#202020ff" }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ color: "#202020ff", fontWeight: 600, backgroundColor: grey[100] }}
                      >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="online">Online</MenuItem>
                        <MenuItem value="offline">Offline</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell sx={{ color: "#202020ff" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => {
                    const isOnline = account.status === "online";
                    const imageSrc = account.profilePic || "default-profile.png";
                    return (
                      <TableRow
                        key={account._id}
                        sx={{
                          border: `2px solid ${isOnline ? green[500] : grey[300]}`,
                          color: isOnline ? green[500] : grey[600],
                          fontWeight: 500,
                        }}
                      >
                        <TableCell>
                          <Avatar
                            src={imageSrc}
                            alt="profile"
                            sx={{ width: 45, height: 45, mx: "auto", border: "1px solid #ccc", bgcolor: grey[200] }}
                          />
                        </TableCell>
                        <TableCell>{account.username || "N/A"}</TableCell>
                        <TableCell>{account.email || "N/A"}</TableCell>
                        <TableCell>{account.role || "client"}</TableCell>
                        <TableCell>
                          <Badge
                            badgeContent={isOnline ? "Online" : "Offline"}
                            color={isOnline ? "success" : "secondary"}
                            sx={{ cursor: "pointer" }}
                            onClick={() => toggleStatus(account)}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={(e) => handleMenuOpen(e, account)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl && selectedAccount?._id === account._id)}
                            onClose={handleMenuClose}
                          >
                            {account.role !== "admin" && (
                              <MenuItem onClick={handleAddAdmin}>Add as Admin</MenuItem>
                            )}
                            {account.role === "admin" && (
                              <MenuItem onClick={handleRemoveAdmin}>Remove Admin</MenuItem>
                            )}
                            <MenuItem onClick={handleDeleteUser}>Delete User</MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: grey[500] }}>
                      No matching accounts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default AccountsDashboard;
