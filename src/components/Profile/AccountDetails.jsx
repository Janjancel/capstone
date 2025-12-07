import React from "react";
import { Box, Paper, Typography, Avatar, Badge } from "@mui/material";
import { Person as PersonIcon, Email as EmailIcon } from "@mui/icons-material";
import { green, grey } from "@mui/material/colors";

const AccountDetails = ({ username, email }) => {
  const isOnline = true; // Since this is the current user's profile

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Typography variant="h6" component="h2">
          Account Details
        </Typography>
        <Badge
          badgeContent={isOnline ? "Online" : "Offline"}
          color={isOnline ? "success" : "secondary"}
          sx={{ ml: 2, marginLeft: 5 }}
        />
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
            {username || "Not set"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Avatar sx={{ bgcolor: grey[100], mr: 2 }}>
          <EmailIcon sx={{ color: green[500] }} />
        </Avatar>
        <Box>
          <Typography variant="caption" color="textSecondary">
            Email Address
          </Typography>
          <Typography variant="body1" fontWeight="500">
            {email || "Not set"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default AccountDetails;
