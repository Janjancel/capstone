import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  List, Person, Box, Cart, ChevronDown, ChevronUp, Justify, ClipboardData
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../../images/logo.png";

const Sidebar = ({ toggleSidebar }) => {
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

  const activeStyle = {
    backgroundColor: "#f8f9fa",
    fontWeight: "bold",
    borderRadius: "5px",
  };

  return (
    <aside className="h-100 position-relative p-3">
      <div className="text-center mb-4 mt-4 pt-2">
        <img
          src={logo}
          alt="Unika Antika Logo"
          style={{ width: "50px", height: "50px", objectFit: "contain" }}
          className="mb-2"
        />
        <h5 className="fw-bold m-0">UNIKA ANTIKA</h5>
      </div>

      <ul className="nav flex-column">
        <li className="nav-item">
          <NavLink to="/admin/dashboard" className="nav-link d-flex align-items-center" style={({ isActive }) => (isActive ? activeStyle : { color: "black" })}>
            <List className="me-2" /> Dashboard
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/admin/accounts" className="nav-link d-flex align-items-center" style={({ isActive }) => (isActive ? activeStyle : { color: "black" })}>
            <Person className="me-2" /> Accounts
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/admin/items" className="nav-link d-flex align-items-center" style={({ isActive }) => (isActive ? activeStyle : { color: "black" })}>
            <Box className="me-2" /> Items
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/admin/orders" className="nav-link d-flex align-items-center" style={({ isActive }) => (isActive ? activeStyle : { color: "black" })}>
            <Cart className="me-2" /> Orders
          </NavLink>
        </li>

        <li className="nav-item" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <span className="nav-link d-flex align-items-center" onClick={toggleDropdown} style={{ cursor: "pointer", color: "black" }}>
            Requests {isOpen ? <ChevronUp className="ms-2" /> : <ChevronDown className="ms-2" />}
          </span>
          {(isOpen || isHovering) && (
            <ul className="list-unstyled ps-3">
              <li>
                <NavLink to="/admin/sellDashboard" className="nav-link" style={({ isActive }) => (isActive ? activeStyle : { color: "black" })}>
                  Sell
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/demolishDashboard" className="nav-link" style={({ isActive }) => (isActive ? activeStyle : { color: "black" })}>
                  Demolish
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        <li className="nav-item">
          <NavLink to="/admin/report" className="nav-link d-flex align-items-center" style={({ isActive }) => (isActive ? activeStyle : { color: "black" })}>
            <ClipboardData className="me-2" /> Reports
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
