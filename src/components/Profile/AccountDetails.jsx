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
//           sx={{ ml: 2 }}
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


import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Badge,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Person as PersonIcon, Email as EmailIcon } from "@mui/icons-material";
import { green, grey } from "@mui/material/colors";
import axios from "axios";
import toast from "react-hot-toast";

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

/**
 * AccountDetails
 *
 * Props:
 * - username (string)
 * - email (string)
 * - personalInfo (optional object) -> { firstName, lastName, middleInitial, phoneNumber }
 *
 * If personalInfo is not provided, the component attempts to fetch /api/users/me
 * (expects the server to return the user object without password).
 */
const AccountDetails = ({ username, email, personalInfo: initialPersonalInfo }) => {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profile, setProfile] = useState(null); // entire user object from /me
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    middleInitial: "",
    phoneNumber: "",
  });
  const [saving, setSaving] = useState(false);

  // If parent passed personalInfo, seed the form immediately
  useEffect(() => {
    if (initialPersonalInfo) {
      setForm({
        lastName: initialPersonalInfo.lastName ?? "",
        firstName: initialPersonalInfo.firstName ?? "",
        middleInitial: initialPersonalInfo.middleInitial ?? "",
        phoneNumber: initialPersonalInfo.phoneNumber ?? "",
      });
      return;
    }

    // otherwise fetch /api/users/me to populate the form
    let mounted = true;
    async function fetchMe() {
      setLoadingProfile(true);
      try {
        // try to include auth token if stored in localStorage
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users/me", token ? { headers: { Authorization: `Bearer ${token}` } } : {});
        if (!mounted) return;
        setProfile(res.data);
        const pi = res.data.personalInfo || {};
        setForm({
          lastName: pi.lastName ?? "",
          firstName: pi.firstName ?? "",
          middleInitial: pi.middleInitial ?? "",
          phoneNumber: pi.phoneNumber ?? "",
        });
      } catch (err) {
        // silent failure but show toast so user knows
        console.error("Failed to fetch profile:", err);
        toast.error("Couldn't load profile. You can still fill the form.");
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }

    fetchMe();
    return () => {
      mounted = false;
    };
  }, [initialPersonalInfo]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function validate() {
    if (!form.lastName || form.lastName.trim() === "") {
      toast.error("Last name is required.");
      return false;
    }
    if (!form.firstName || form.firstName.trim() === "") {
      toast.error("First name is required.");
      return false;
    }
    // phone is required per schema — allow user to provide null? we require non-empty
    if (form.phoneNumber === null || form.phoneNumber === undefined || String(form.phoneNumber).trim() === "") {
      toast.error("Phone number is required.");
      return false;
    }
    if (form.phoneNumber !== null && !PHONE_REGEX.test(String(form.phoneNumber).trim())) {
      toast.error("Invalid phone number format. Use international format like +639XXXXXXXXX or local digits.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        lastName: form.lastName.trim(),
        firstName: form.firstName.trim(),
        middleInitial: form.middleInitial ? form.middleInitial.trim() : null,
        phoneNumber: form.phoneNumber.trim(),
      };
      const res = await axios.post("/api/users/personal-info", payload, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      toast.success("Personal information saved.");
      // update local profile + form (server returns user)
      if (res.data && res.data.user) {
        setProfile(res.data.user);
        const pi = res.data.user.personalInfo || {};
        setForm({
          lastName: pi.lastName ?? "",
          firstName: pi.firstName ?? "",
          middleInitial: pi.middleInitial ?? "",
          phoneNumber: pi.phoneNumber ?? "",
        });
      }
    } catch (err) {
      console.error("Error saving personal info:", err);
      const msg = err?.response?.data?.message || "Failed to save personal information.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={3} justifyContent="space-between" flexWrap="wrap">
        <Box display="flex" alignItems="center">
          <Typography variant="h6" component="h2">
            Account Details
          </Typography>
          <Badge
            badgeContent={"Online"}
            color="success"
            sx={{ ml: 2 }}
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Avatar sx={{ bgcolor: grey[100], mr: 2 }}>
          <PersonIcon sx={{ color: green[500] }} />
        </Avatar>
        <Box>
          <Typography variant="caption" color="textSecondary">
            Username
          </Typography>
          <Typography variant="body1" fontWeight="500">
            {username || profile?.username || "Not set"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Avatar sx={{ bgcolor: grey[100], mr: 2 }}>
          <EmailIcon sx={{ color: green[500] }} />
        </Avatar>
        <Box>
          <Typography variant="caption" color="textSecondary">
            Email Address
          </Typography>
          <Typography variant="body1" fontWeight="500">
            {email || profile?.email || "Not set"}
          </Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="subtitle1" mb={2}>
          Personal Information
        </Typography>

        {loadingProfile ? (
          <Box display="flex" alignItems="center" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="First name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                fullWidth
                inputProps={{ maxLength: 80 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="Last name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                fullWidth
                inputProps={{ maxLength: 80 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Middle initial"
                name="middleInitial"
                value={form.middleInitial}
                onChange={handleChange}
                fullWidth
                inputProps={{ maxLength: 5 }}
                helperText="Optional"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="Phone number"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                fullWidth
                placeholder="+639XXXXXXXXX"
                helperText="Use international format if possible"
              />
            </Grid>

            <Grid item xs={12} display="flex" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Saving…" : "Save Personal Info"}
              </Button>
            </Grid>
          </Grid>
        )}
      </Box>
    </Paper>
  );
};

export default AccountDetails;
