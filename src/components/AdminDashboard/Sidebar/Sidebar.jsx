import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  List as ListIcon,
  Person as PersonIcon,
  Inventory2 as InventoryIcon,
  ShoppingCart as CartIcon,
  ExpandLess,
  ExpandMore,
  Assessment as ReportIcon,
  AccountBalance as HeritageIcon,
} from "@mui/icons-material";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
} from "@mui/material";
import logo from "../../images/logo.png";

const Sidebar = () => {
  const location = useLocation();

  const isRequestsActive =
    location.pathname.includes("/admin/sellDashboard") ||
    location.pathname.includes("/admin/demolishDashboard");

  const [isOpen, setIsOpen] = useState(isRequestsActive);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (!isRequestsActive) setIsOpen(false);
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Active NavLink style
  const activeStyle = {
    "&.active": {
      backgroundColor: "#e6e6e6", // highlighted background
      fontWeight: "bold",
      borderRadius: "8px",
      color: "black",
    },
    color: "black",
  };

  return (
    <Box
      sx={{
        height: "100%",
        p: 2,
        bgcolor: "#f8f9fa", // Sidebar background stays off-white
      }}
    >
      {/* Logo + Title */}
      <Box textAlign="center" mb={4} mt={2}>
        <img
          src={logo}
          alt="Unika Antika Logo"
          style={{ width: "50px", height: "50px", objectFit: "contain" }}
        />
        <Typography variant="h6" fontWeight="bold" mt={1}>
          UNIKA ANTIKA
        </Typography>
      </Box>

      {/* Navigation */}
      <List component="navigation">
        {/* Dashboard */}
        <ListItem
          button
          component={NavLink}
          to="/admin/dashboard"
          sx={activeStyle}
        >
          <ListItemIcon>
            <ListIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        {/* Accounts */}
        <ListItem
          button
          component={NavLink}
          to="/admin/accounts"
          sx={activeStyle}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Accounts" />
        </ListItem>

        {/* Items */}
        <ListItem
          button
          component={NavLink}
          to="/admin/items"
          sx={activeStyle}
        >
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Items" />
        </ListItem>

        {/* Orders */}
        <ListItem
          button
          component={NavLink}
          to="/admin/orders"
          sx={activeStyle}
        >
          <ListItemIcon>
            <CartIcon />
          </ListItemIcon>
          <ListItemText primary="Orders" />
        </ListItem>

        {/* Requests Dropdown */}
        <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <ListItem button onClick={toggleDropdown} sx={{ color: "black" }}>
            <ListItemText primary="Requests" />
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse in={isOpen || isHovering} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 4 }}>
              <ListItem
                button
                component={NavLink}
                to="/admin/sellDashboard"
                sx={activeStyle}
              >
                <ListItemText primary="Sell" />
              </ListItem>
              <ListItem
                button
                component={NavLink}
                to="/admin/demolishDashboard"
                sx={activeStyle}
              >
                <ListItemText primary="Demolish" />
              </ListItem>
            </List>
          </Collapse>
        </Box>

        {/* Heritage */}
        <ListItem
          button
          component={NavLink}
          to="/admin/heritage"
          sx={activeStyle}
        >
          <ListItemIcon>
            <HeritageIcon />
          </ListItemIcon>
          <ListItemText primary="Heritage" />
        </ListItem>

        {/* Reports */}
        <ListItem
          button
          component={NavLink}
          to="/admin/report"
          sx={activeStyle}
        >
          <ListItemIcon>
            <ReportIcon />
          </ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItem>
      </List>

      {/* <Divider sx={{ mt: 2 }} /> */}
    </Box>
  );
};

export default Sidebar;
