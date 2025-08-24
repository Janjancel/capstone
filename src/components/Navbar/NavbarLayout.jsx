

// import './Navbar.css';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import logo from '../images/logo.png';
// import { useState, useEffect, useRef } from 'react';
// import Swal from 'sweetalert2';
// import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
// import AuthModal from '../Auth/Auth';
// import MyOrders from '../MyOrder/MyOrders';
// import NotificationBell from './NotificationBell';
// import CustomLink from './CustomLink';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';

// export default function Navbar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, setUser } = useAuth();

//   const [cartCount, setCartCount] = useState(0);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isAnimatingOut, setIsAnimatingOut] = useState(false);
//   const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [isMobileView, setIsMobileView] = useState(window.innerWidth < 992);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState('signin');
//   const [profilePic, setProfilePic] = useState(null);
//   const [showPurchaseModal, setShowPurchaseModal] = useState(false);
//   const dropdownRef = useRef(null);
//   const servicesDropdownRef = useRef(null);

//   const API_URL = process.env.REACT_APP_API_URL;
//   const hideAuthButtons = ["/auth", "/login", "/register"].includes(location.pathname);

//   useEffect(() => {
//     let pollingInterval = null;

//     const fetchCartCount = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/cart/${user._id}`);
//         const items = res.data.cartItems || [];
//         const total = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
//         setCartCount(total);
//       } catch (err) {
//         setCartCount(0);
//       }
//     };

//     if (user) {
//       setProfilePic(user.profilePic || "default-profile.png");
//       fetchCartCount();
//       pollingInterval = setInterval(fetchCartCount, 3000);
//     }

//     return () => {
//       if (pollingInterval) clearInterval(pollingInterval);
//     };
//   }, [user]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setDropdownOpen(false);
//       }
//       if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target)) {
//         setServicesDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     const handleResize = () => setIsMobileView(window.innerWidth < 992);
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const handleMenuToggle = () => {
//     if (menuOpen) {
//       setIsAnimatingOut(true);
//       setTimeout(() => {
//         setIsAnimatingOut(false);
//         setMenuOpen(false);
//       }, 500);
//     } else {
//       setMenuOpen(true);
//       setIsAnimatingOut(false);
//     }
//   };

//   const handleLogout = async () => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You will be logged out!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, logout!",
//       cancelButtonText: "Cancel",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           // ✅ Set user status to offline before logout
//           await axios.patch(`${API_URL}/api/users/status/${user._id}`, {
//             status: "offline",
//           });
//         } catch (err) {
//           console.error("Failed to update status on logout:", err);
//         }

//         localStorage.removeItem("token");
//         localStorage.removeItem("userId");
//         setUser(null);
//         setCartCount(0);
//         navigate('/');
//         toast.success("You have been successfully logged out.");
//       }
//     });
//   };

//   if (location.pathname.startsWith("/admin")) return null;

//   return (
//     <nav className="navbar navbar-expand-lg fixed-top nav">
//       <div className="container-fluid">
//         <Link className="navbar-brand" to="/">
//           <img src={logo} alt="logo" id="logo" />
//         </Link>

//         <button className="navbar-toggler border-0 bg-transparent" onClick={handleMenuToggle}>
//           {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
//         </button>

//         <div
//           className={`navbar-collapse mobile-menu-bg animate__animated ${
//             isMobileView ? (isAnimatingOut ? "animate__fadeOutUp" : menuOpen ? "animate__fadeInDown" : "") : ""
//           }`}
//           style={{ display: isMobileView ? (menuOpen || isAnimatingOut ? "block" : "none") : "block" }}
//           id="navbarNav"
//         >
//           <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//             <CustomLink to="/" onClick={() => setMenuOpen(false)}>Home</CustomLink>
//             <li className="nav-item dropdown" ref={servicesDropdownRef}>
//               <span className="nav-link dropdown-toggle" onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)} role="button">Services</span>
//               {servicesDropdownOpen && (
//                 <ul className="dropdown-menu show">
//                   {['buy', 'sell', 'demolish'].map(service => (
//                     <li key={service}>
//                       <span className="dropdown-item" onClick={() => {
//                         setMenuOpen(false);
//                         setServicesDropdownOpen(false);
//                         if (user) navigate(`/${service}`);
//                         else {
//                           setModalType('signin');
//                           setShowModal(true);
//                         }
//                       }}>{service.charAt(0).toUpperCase() + service.slice(1)}</span>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </li>
//             <CustomLink to="/about" onClick={() => setMenuOpen(false)}>About</CustomLink>
//             <CustomLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</CustomLink>
//           </ul>

//           <div className="d-flex align-items-center" style={{ marginRight: "100px" }}>
//             {user && (
//               <>
//                 <Link to="/cart" className="cart-icon me-3" style={{ position: "relative" }} onClick={() => setMenuOpen(false)}>
//                   <FaShoppingCart size={24} color="black" />
//                   <p className="cart-badge" style={{
//                     position: "absolute",
//                     top: "-5px",
//                     right: "-5px",
//                     backgroundColor: cartCount > 0 ? "red" : "gray",
//                     color: "white",
//                     borderRadius: "50%",
//                     width: "18px",
//                     height: "18px",
//                     fontSize: "12px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontWeight: "bold"
//                   }}>{cartCount}</p>
//                 </Link>
//                 <NotificationBell navigate={navigate} />
//               </>
//             )}

//             {user ? (
//               <div className="profile-container me-5" ref={dropdownRef}>
//                 <div className="profile-circle" onClick={() => setDropdownOpen(!dropdownOpen)}>
//                   {profilePic ? (
//                     <img src={profilePic} alt="Profile" className="profile-img" />
//                   ) : (
//                     <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-person-circle profile-icon" viewBox="0 0 16 16">
//                       <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
//                       <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
//                     </svg>
//                   )}
//                 </div>
//                 {dropdownOpen && (
//                   <div className="dropdown-menu show">
//                     <Link className="nav-dropdown-item" to="/profile" onClick={() => setMenuOpen(false)}>Manage Profile</Link>
//                     <span className="nav-dropdown-item" onClick={() => { setShowPurchaseModal(true); setMenuOpen(false); }}>My Orders</span>
//                     <Link className="nav-dropdown-item" to="/" onClick={() => { setMenuOpen(false); handleLogout(); }}>Logout</Link>
//                   </div>
//                 )}
//               </div>
//             ) : (!hideAuthButtons && (
//               <div className="auth-buttons me-5">
//                 <button className="btn btn-dark me-2" onClick={() => { setModalType('signin'); setShowModal(true); }}>Sign In</button>
//                 <button className="btn btn-outline-dark" onClick={() => { setModalType('signup'); setShowModal(true); }}>Sign Up</button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//       <AuthModal show={showModal} onHide={() => setShowModal(false)} modalType={modalType} />
//       <MyOrders show={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
//     </nav>
//   );
// }


import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import AuthModal from "../Auth/Auth";
import MyOrders from "../MyOrder/MyOrders";
import NotificationBell from "./NotificationBell";
import CustomLink from "./CustomLink";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import logo from "../images/logo.png";
import MobileView from "./MobileView";
import { FaShoppingCart } from "react-icons/fa";

// ✅ MUI imports
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Container,
  IconButton,
} from "@mui/material";

export default function NavbarLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();

  const [cartCount, setCartCount] = useState(0);
  const [servicesAnchor, setServicesAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 992);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("signin");
  const [profilePic, setProfilePic] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;
  const hideAuthButtons = ["/auth", "/login", "/register"].includes(location.pathname);

  // 🛒 Fetch cart count
  useEffect(() => {
    let pollingInterval = null;

    const fetchCartCount = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/cart/${user._id}`);
        const items = res.data.cartItems || [];
        const total = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    if (user) {
      setProfilePic(user.profilePic || "default-profile.png");
      fetchCartCount();
      pollingInterval = setInterval(fetchCartCount, 3000);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [user]);

  // 📱 Handle resize
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch(`${API_URL}/api/users/status/${user._id}`, { status: "offline" });
        } catch (err) {
          console.error("Failed to update status on logout:", err);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setUser(null);
        setCartCount(0);
        navigate("/");
        toast.success("You have been successfully logged out.");
      }
    });
  };

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <>
      {isMobileView ? (
        <MobileView
          user={user}
          profilePic={profilePic}
          cartCount={cartCount}
          handleLogout={handleLogout}
          setShowModal={setShowModal}
          setModalType={setModalType}
          showPurchaseModal={showPurchaseModal}
          setShowPurchaseModal={setShowPurchaseModal}
          hideAuthButtons={hideAuthButtons}
        />
      ) : (
        <AppBar position="fixed" sx={{ bgcolor: "#f0f0f0ff", height: "9vh" }}>
          <Container maxWidth={false}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
              {/* Logo */}
              <Link to="/">
                <Box component="img" src={logo} alt="logo" sx={{ height: 50 }} />
              </Link>

              {/* Desktop Links */}
              <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                <CustomLink to="/">Home</CustomLink>

                {/* Services Dropdown */}
                <CustomLink
                  to={null}
                  onClick={(e) => setServicesAnchor(e.currentTarget)}
                  activePaths={["/buy", "/sell", "/demolish"]}
                >
                  Services
                </CustomLink>

                <Menu
                  anchorEl={servicesAnchor}
                  open={Boolean(servicesAnchor)}
                  onClose={() => setServicesAnchor(null)}
                >
                  {["buy", "sell", "demolish"].map((service) => (
                    <MenuItem
                      key={service}
                      onClick={() => {
                        setServicesAnchor(null);
                        if (user) navigate(`/${service}`);
                        else {
                          setModalType("signin");
                          setShowModal(true);
                        }
                      }}
                    >
                      {service.charAt(0).toUpperCase() + service.slice(1)}
                    </MenuItem>
                  ))}
                </Menu>

                <CustomLink to="/about">About</CustomLink>
                <CustomLink to="/contact">Contact</CustomLink>
              </Box>

              {/* Right Side */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {user && (
                  <>
                    <Link to="/cart">
                      <IconButton>
                        <Badge badgeContent={cartCount} color="error">
                          <FaShoppingCart size={22} color="black" />
                        </Badge>
                      </IconButton>
                    </Link>
                    <NotificationBell navigate={navigate} />
                  </>
                )}

                {user ? (
                  <>
                    <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)}>
                      {profilePic ? <Avatar src={profilePic} /> : <Avatar />}
                    </IconButton>
                    <Menu
                      anchorEl={profileAnchor}
                      open={Boolean(profileAnchor)}
                      onClose={() => setProfileAnchor(null)}
                    >
                      <MenuItem onClick={() => { navigate("/profile"); setProfileAnchor(null); }}>
                        Manage Profile
                      </MenuItem>
                      <MenuItem onClick={() => { setShowPurchaseModal(true); setProfileAnchor(null); }}>
                        My Orders
                      </MenuItem>
                      <MenuItem onClick={() => { handleLogout(); setProfileAnchor(null); }}>
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  !hideAuthButtons && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => { setModalType("signin"); setShowModal(true); }}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => { setModalType("signup"); setShowModal(true); }}
                      >
                        Sign Up
                      </Button>
                    </Box>
                  )
                )}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      )}

      {/* Modals */}
      <AuthModal show={showModal} onHide={() => setShowModal(false)} modalType={modalType} />
      <MyOrders show={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
    </>
  );
}
