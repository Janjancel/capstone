// import React from "react";
// import { Box, Paper, Typography, Avatar, Badge } from "@mui/material";
// import { Person as PersonIcon, Email as EmailIcon } from "@mui/icons-material";
// import { green, grey } from "@mui/material/colors";

// const AccountDetails = ({ username, email }) => {
//   const isOnline = true; // Since this is the current user's profile

//   return (
//     <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
//       <Box display="flex" alignItems="center" mb={3}>
//         <Typography variant="h6" component="h2">
//           Account Details
//         </Typography>
//         <Badge
//           badgeContent={isOnline ? "Online" : "Offline"}
//           color={isOnline ? "success" : "secondary"}
//           sx={{ ml: 2, marginLeft: 5 }}
//         />
//       </Box>

//       <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
//         <Avatar sx={{ bgcolor: grey[100], mr: 2 }}>
//           <PersonIcon sx={{ color: green[500] }} />
//         </Avatar>
//         <Box>
//           <Typography variant="caption" color="textSecondary">
//             Username
//           </Typography>
//           <Typography variant="body1" fontWeight="500">
//             {username || "Not set"}
//           </Typography>
//         </Box>
//       </Box>

//       <Box sx={{ display: "flex", alignItems: "center" }}>
//         <Avatar sx={{ bgcolor: grey[100], mr: 2 }}>
//           <EmailIcon sx={{ color: green[500] }} />
//         </Avatar>
//         <Box>
//           <Typography variant="caption" color="textSecondary">
//             Email Address
//           </Typography>
//           <Typography variant="body1" fontWeight="500">
//             {email || "Not set"}
//           </Typography>
//         </Box>
//       </Box>
//     </Paper>
//   );
// };

// export default AccountDetails;


import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountCircle as AccountCircleIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { green, grey } from "@mui/material/colors";
import toast from "react-hot-toast";
import axios from "axios";

/**
 * AccountDetails Component
 *
 * Props:
 * - username
 * - email
 * - personalInfo: { lastName, firstName, middleInitial, phoneNumber }
 * - onSave(personalInfo) optional callback invoked after successful save
 * - onDelete() optional callback invoked after successful delete
 */
const AccountDetails = ({
  username,
  email,
  personalInfo: initialPersonalInfo,
  onSave: onSaveCallback,
  onDelete: onDeleteCallback,
}) => {
  const isOnline = true;

  // Dialogs
  const [open, setOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Loading states
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Local personalInfo state so UI updates immediately after save/delete
  const [personalInfo, setPersonalInfo] = useState(initialPersonalInfo ?? null);

  // Form fields
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    middleInitial: "",
    phoneNumber: "",
  });

  // Keep local personalInfo in sync when prop changes
  useEffect(() => {
    setPersonalInfo(initialPersonalInfo ?? null);
  }, [initialPersonalInfo]);

  // Prefill form on open
  useEffect(() => {
    if (open) {
      setForm({
        lastName: personalInfo?.lastName || "",
        firstName: personalInfo?.firstName || "",
        middleInitial: personalInfo?.middleInitial || "",
        phoneNumber: personalInfo?.phoneNumber || "",
      });
    }
  }, [open, personalInfo]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (!saving && !deleting) setOpen(false);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return "First name and last name are required.";
    }
    if (form.middleInitial && form.middleInitial.length > 1) {
      return "Middle initial must be a single character.";
    }
    if (form.phoneNumber && !/^\+?[0-9]{7,15}$/.test(form.phoneNumber.trim())) {
      return "Phone number must be digits (optional +), length 7–15.";
    }
    return null;
  };

  // Helper to attach auth header (adjust if you use cookies or other auth)
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Internal API calls
  const apiSavePersonalInfo = async (payload) => {
    // If there's already personalInfo, call PUT, otherwise POST
    const method = personalInfo ? "put" : "post";
    const url = personalInfo ? "/api/users/personal-info" : "/api/users/personal-info";

    const res = await axios[method](url, payload, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });
    // server returns { personalInfo: {...} }
    return res.data.personalInfo ?? res.data;
  };

  const apiDeletePersonalInfo = async () => {
    const res = await axios.delete("/api/users/personal-info", {
      headers: { ...getAuthHeaders() },
    });
    return res.data;
  };

  // Handler wired to Save button (uses API, updates UI)
  const handleSave = async () => {
    const error = validate();
    if (error) return toast.error(error);

    setSaving(true);
    try {
      const payload = {
        lastName: form.lastName.trim(),
        firstName: form.firstName.trim(),
        middleInitial: form.middleInitial ? form.middleInitial.trim().charAt(0) : null,
        phoneNumber: form.phoneNumber ? form.phoneNumber.trim() : null,
      };

      const updated = await apiSavePersonalInfo(payload);

      setPersonalInfo(updated ?? payload);
      setOpen(false);
      toast.success("Personal information saved.");

      if (typeof onSaveCallback === "function") {
        try {
          onSaveCallback(updated ?? payload);
        } catch (err) {
          console.warn("onSave callback error:", err);
        }
      }
    } catch (err) {
      const serverMessage = err?.response?.data?.message || err?.message || "Failed to save personal information.";
      console.error("Failed to save personal info:", err);
      toast.error(serverMessage);
    } finally {
      setSaving(false);
    }
  };

  // Handler wired to Delete confirmation (uses API, updates UI)
  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      await apiDeletePersonalInfo();

      setPersonalInfo(null);
      setConfirmDeleteOpen(false);
      setOpen(false);
      toast.success("Personal information deleted.");

      if (typeof onDeleteCallback === "function") {
        try {
          onDeleteCallback();
        } catch (err) {
          console.warn("onDelete callback error:", err);
        }
      }
    } catch (err) {
      const serverMessage = err?.response?.data?.message || err?.message || "Failed to delete personal information.";
      console.error("Failed to delete personal info:", err);
      toast.error(serverMessage);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* ===========================
          MAIN CARD
      ============================ */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Typography variant="h6">Account Details</Typography>
          <Badge
            badgeContent={isOnline ? "Online" : "Offline"}
            color={isOnline ? "success" : "secondary"}
            sx={{ ml: 2, marginLeft: 5 }}
          />
        </Box>

        {/* Username */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ bgcolor: grey[100], mr: 2 }}>
            <PersonIcon sx={{ color: green[500] }} />
          </Avatar>
          <Box>
            <Typography variant="caption">Username</Typography>
            <Typography variant="body1" fontWeight="500">
              {username || "Not set"}
            </Typography>
          </Box>
        </Box>

        {/* Email */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ bgcolor: grey[100], mr: 2 }}>
            <EmailIcon sx={{ color: green[500] }} />
          </Avatar>
          <Box>
            <Typography variant="caption">Email Address</Typography>
            <Typography variant="body1" fontWeight="500">
              {email || "Not set"}
            </Typography>
          </Box>
        </Box>

        {/* ===========================
            PERSONAL INFORMATION
        ============================ */}
        <Box mt={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight="600">
              Personal Information
            </Typography>

            {/* Add / Edit button */}
            {personalInfo ? (
              <Button
                size="small"
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={handleOpen}
              >
                Edit
              </Button>
            ) : (
              <Button
                size="small"
                startIcon={<AddIcon />}
                variant="contained"
                onClick={handleOpen}
              >
                Add
              </Button>
            )}
          </Stack>

          {/* Full Name */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar sx={{ bgcolor: grey[100], mr: 2 }}>
              <AccountCircleIcon sx={{ color: green[500] }} />
            </Avatar>
            <Box>
              <Typography variant="caption">Full Name</Typography>
              <Typography variant="body1" fontWeight="500">
                {personalInfo
                  ? `${personalInfo.firstName || ""} ${
                      personalInfo.middleInitial ? personalInfo.middleInitial + " " : ""
                    }${personalInfo.lastName || ""}`
                  : "Not set"}
              </Typography>
            </Box>
          </Box>

          {/* Phone Number */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: grey[100], mr: 2 }}>
              <PhoneIcon sx={{ color: green[500] }} />
            </Avatar>
            <Box>
              <Typography variant="caption">Phone Number</Typography>
              <Typography variant="body1" fontWeight="500">
                {personalInfo?.phoneNumber || "Not set"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ===========================
          ADD / EDIT DIALOG
      ============================ */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          {personalInfo ? "Edit Personal Information" : "Add Personal Information"}

          <IconButton onClick={handleClose} disabled={saving || deleting}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Middle Initial"
              name="middleInitial"
              value={form.middleInitial}
              onChange={handleChange}
              inputProps={{ maxLength: 1 }}
              helperText="Optional (1 character)"
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              fullWidth
              helperText="Digits only, optional + (7–15 chars)"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          {personalInfo && (
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={saving || deleting}
            >
              Delete
            </Button>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Button onClick={handleClose} disabled={saving || deleting}>
            Cancel
          </Button>

          <Button variant="contained" startIcon={<EditIcon />} onClick={handleSave} disabled={saving || deleting}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===========================
          DELETE CONFIRMATION DIALOG
      ============================ */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Personal Information</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete your personal information? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} disabled={deleting}>
            Cancel
          </Button>

          <Button variant="contained" color="error" onClick={handleDeleteConfirmed} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountDetails;
