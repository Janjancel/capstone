// import { useState, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import Swal from "sweetalert2";
// import AuthModal from "../Auth/Auth";
// import NotificationBell from "./NotificationBell";
// import CustomLink from "./CustomLink";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { useAuth } from "../../context/AuthContext";
// import logo from "../images/logo.png";
// import MobileView from "./MobileView";
// import { FaShoppingCart } from "react-icons/fa";

// // ✅ MUI imports
// import {
//   AppBar,
//   Toolbar,
//   Box,
//   Button,
//   Avatar,
//   Menu,
//   MenuItem,
//   Badge,
//   Container,
//   IconButton,
// } from "@mui/material";

// export default function NavbarLayout() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, setUser } = useAuth();

//   const [cartCount, setCartCount] = useState(0);
//   const [servicesAnchor, setServicesAnchor] = useState(null);
//   const [profileAnchor, setProfileAnchor] = useState(null);
//   const [isMobileView, setIsMobileView] = useState(window.innerWidth < 992);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState("signin");
//   const [profilePic, setProfilePic] = useState(null);

//   // NOTE: kept these two to preserve MobileView props shape; they are no longer used for desktop.
//   const [showPurchaseModal, setShowPurchaseModal] = useState(false);

//   const API_URL = process.env.REACT_APP_API_URL;
//   const hideAuthButtons = ["/auth", "/login", "/register"].includes(location.pathname);

//   // 🛒 Fetch cart count
//   useEffect(() => {
//     let pollingInterval = null;

//     const fetchCartCount = async () => {
//       try {
//         if (!user?._id) return;
//         const res = await axios.get(`${API_URL}/api/cart/${user._id}`);
//         const items = res.data?.cartItems || [];
//         const total = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
//         setCartCount(total);
//       } catch {
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
//   }, [user, API_URL]);

//   // 📱 Handle resize
//   useEffect(() => {
//     const handleResize = () => setIsMobileView(window.innerWidth < 992);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

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
//           if (user?._id) {
//             await axios.patch(`${API_URL}/api/users/status/${user._id}`, { status: "offline" });
//           }
//         } catch (err) {
//           console.error("Failed to update status on logout:", err);
//         }
//         localStorage.removeItem("token");
//         localStorage.removeItem("userId");
//         setUser(null);
//         setCartCount(0);
//         navigate("/");
//         toast.success("You have been successfully logged out.");
//       }
//     });
//   };

//   if (location.pathname.startsWith("/admin")) return null;

//   return (
//     <>
//       {isMobileView ? (
//         <MobileView
//           user={user}
//           profilePic={profilePic}
//           cartCount={cartCount}
//           handleLogout={handleLogout}
//           setShowModal={setShowModal}
//           setModalType={setModalType}
//           showPurchaseModal={showPurchaseModal}
//           setShowPurchaseModal={setShowPurchaseModal}
//           hideAuthButtons={hideAuthButtons}
//         />
//       ) : (
//         <AppBar position="fixed" sx={{ bgcolor: "#f0f0f0ff", height: "9vh" }}>
//           <Container maxWidth={false}>
//             <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
//               {/* Logo */}
//               <Link to="/">
//                 <Box component="img" src={logo} alt="logo" sx={{ height: 50 }} />
//               </Link>

//               {/* Desktop Links */}
//               <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
//                 <CustomLink to="/">Home</CustomLink>

//                 {/* Services Dropdown */}
//                 <CustomLink
//                   to={null}
//                   onClick={(e) => setServicesAnchor(e.currentTarget)}
//                   activePaths={["/buy", "/sell", "/demolish"]}
//                 >
//                   Services
//                 </CustomLink>

//                 <Menu
//                   anchorEl={servicesAnchor}
//                   open={Boolean(servicesAnchor)}
//                   onClose={() => setServicesAnchor(null)}
//                 >
//                   {["buy", "sell", "demolish"].map((service) => (
//                     <MenuItem
//                       key={service}
//                       onClick={() => {
//                         setServicesAnchor(null);
//                         if (user) navigate(`/${service}`);
//                         else {
//                           setModalType("signin");
//                           setShowModal(true);
//                         }
//                       }}
//                     >
//                       {service.charAt(0).toUpperCase() + service.slice(1)}
//                     </MenuItem>
//                   ))}
//                 </Menu>

//                 <CustomLink to="/about">About</CustomLink>
//                 <CustomLink to="/contact">Contact</CustomLink>
//                 <CustomLink to="/faqs">FAQs</CustomLink>
//               </Box>

//               {/* Right Side */}
//               <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                 {user && (
//                   <>
//                     <Link to="/cart">
//                       <IconButton>
//                         <Badge badgeContent={cartCount} color="error">
//                           <FaShoppingCart size={22} color="black" />
//                         </Badge>
//                       </IconButton>
//                     </Link>
//                     <NotificationBell navigate={navigate} />
//                   </>
//                 )}

//                 {user ? (
//                   <>
//                     <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)}>
//                       {profilePic ? <Avatar src={profilePic} /> : <Avatar />}
//                     </IconButton>
//                     <Menu
//                       anchorEl={profileAnchor}
//                       open={Boolean(profileAnchor)}
//                       onClose={() => setProfileAnchor(null)}
//                     >
//                       <MenuItem
//                         onClick={() => {
//                           navigate("/profile");
//                           setProfileAnchor(null);
//                         }}
//                       >
//                         Manage Profile
//                       </MenuItem>

//                       <MenuItem
//                         onClick={() => {
//                           navigate("/orders"); // ✅ Route instead of modal
//                           setProfileAnchor(null);
//                         }}
//                       >
//                         My Orders
//                       </MenuItem>

//                       {/* ✅ My Requests (Sell & Demolition) */}
//                       <MenuItem
//                         onClick={() => {
//                           navigate("/requests");
//                           setProfileAnchor(null);
//                         }}
//                       >
//                         My Requests
//                       </MenuItem>

//                       <MenuItem
//                         onClick={() => {
//                           handleLogout();
//                           setProfileAnchor(null);
//                         }}
//                       >
//                         Logout
//                       </MenuItem>
//                     </Menu>
//                   </>
//                 ) : (
//                   !hideAuthButtons && (
//                     <Box sx={{ display: "flex", gap: 1 }}>
//                       <Button
//                         variant="contained"
//                         onClick={() => {
//                           setModalType("signin");
//                           setShowModal(true);
//                         }}
//                       >
//                         Sign In
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={() => {
//                           setModalType("signup");
//                           setShowModal(true);
//                         }}
//                       >
//                         Sign Up
//                       </Button>
//                     </Box>
//                   )
//                 )}
//               </Box>
//             </Toolbar>
//           </Container>
//         </AppBar>
//       )}

//       {/* Auth Modal remains */}
//       <AuthModal show={showModal} onHide={() => setShowModal(false)} modalType={modalType} />
//       {/* ❌ Removed the MyOrders modal mount here */}
//     </>
//   );
// }


// import { useState, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import Swal from "sweetalert2";
// import AuthModal from "../Auth/Auth";
// import NotificationBell from "./NotificationBell";
// import CustomLink from "./CustomLink";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { useAuth } from "../../context/AuthContext";
// import logo from "../images/logo.png";
// import MobileView from "./MobileView";
// import { FaShoppingCart } from "react-icons/fa";

// // ✅ MUI imports
// import {
//   AppBar,
//   Toolbar,
//   Box,
//   Button,
//   Avatar,
//   Menu,
//   MenuItem,
//   Badge,
//   Container,
//   IconButton,
// } from "@mui/material";

// export default function NavbarLayout() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, setUser } = useAuth();

//   const [cartCount, setCartCount] = useState(0);
//   const [servicesAnchor, setServicesAnchor] = useState(null);
//   const [profileAnchor, setProfileAnchor] = useState(null);
//   const [isMobileView, setIsMobileView] = useState(window.innerWidth < 992);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState("signin");
//   const [profilePic, setProfilePic] = useState(null);

//   // NOTE: kept these two to preserve MobileView props shape; they are no longer used for desktop.
//   const [showPurchaseModal, setShowPurchaseModal] = useState(false);

//   const API_URL = process.env.REACT_APP_API_URL;
//   const hideAuthButtons = ["/auth", "/login", "/register"].includes(location.pathname);

//   // 🛒 Fetch cart count
//   useEffect(() => {
//     let pollingInterval = null;

//     const fetchCartCount = async () => {
//       try {
//         if (!user?._id) return;
//         const res = await axios.get(`${API_URL}/api/cart/${user._id}`);
//         const items = res.data?.cartItems || [];
//         const total = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
//         setCartCount(total);
//       } catch {
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
//   }, [user, API_URL]);

//   // 📱 Handle resize
//   useEffect(() => {
//     const handleResize = () => setIsMobileView(window.innerWidth < 992);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

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
//           if (user?._id) {
//             await axios.patch(`${API_URL}/api/users/status/${user._id}`, { status: "offline" });
//           }
//         } catch (err) {
//           console.error("Failed to update status on logout:", err);
//         }
//         localStorage.removeItem("token");
//         localStorage.removeItem("userId");
//         setUser(null);
//         setCartCount(0);
//         navigate("/");
//         toast.success("You have been successfully logged out.");
//       }
//     });
//   };

//   if (location.pathname.startsWith("/admin")) return null;

//   return (
//     <>
//       {isMobileView ? (
//         <MobileView
//           user={user}
//           profilePic={profilePic}
//           cartCount={cartCount}
//           handleLogout={handleLogout}
//           setShowModal={setShowModal}
//           setModalType={setModalType}
//           showPurchaseModal={showPurchaseModal}
//           setShowPurchaseModal={setShowPurchaseModal}
//           hideAuthButtons={hideAuthButtons}
//         />
//       ) : (
//         // Removed fixed height and added symmetric vertical padding on the Toolbar.
//         <AppBar position="fixed" sx={{ bgcolor: "#f0f0f0ff", boxSizing: "border-box" }}>
//           <Container maxWidth={false}>
//             {/* Use paddingY (py) for equal top/bottom spacing and alignItems center to vertically center children */}
//             <Toolbar
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 py: 1.5, // <-- symmetric vertical padding for equal top & bottom spacing
//                 px: { xs: 1, sm: 2 }, // responsive horizontal padding
//               }}
//             >
//               {/* Logo */}
//               <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
//                 <Box
//                   component="img"
//                   src={logo}
//                   alt="logo"
//                   sx={{
//                     height: 50,
//                     width: "auto",
//                     display: "block",
//                   }}
//                 />
//               </Link>

//               {/* Desktop Links */}
//               <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
//                 <CustomLink to="/">Home</CustomLink>

//                 {/* Services Dropdown */}
//                 <CustomLink
//                   to={null}
//                   onClick={(e) => setServicesAnchor(e.currentTarget)}
//                   activePaths={["/buy", "/sell", "/demolish"]}
//                 >
//                   Services
//                 </CustomLink>

//                 <Menu
//                   anchorEl={servicesAnchor}
//                   open={Boolean(servicesAnchor)}
//                   onClose={() => setServicesAnchor(null)}
//                 >
//                   {["buy", "sell", "demolish"].map((service) => (
//                     <MenuItem
//                       key={service}
//                       onClick={() => {
//                         setServicesAnchor(null);
//                         if (user) navigate(`/${service}`);
//                         else {
//                           setModalType("signin");
//                           setShowModal(true);
//                         }
//                       }}
//                     >
//                       {service.charAt(0).toUpperCase() + service.slice(1)}
//                     </MenuItem>
//                   ))}
//                 </Menu>

//                 <CustomLink to="/about">About</CustomLink>
//                 <CustomLink to="/contact">Contact</CustomLink>
//                 <CustomLink to="/faqs">FAQs</CustomLink>
//               </Box>

//               {/* Right Side */}
//               <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                 {user && (
//                   <>
//                     <Link to="/cart" style={{ color: "inherit" }}>
//                       <IconButton aria-label="cart" size="large">
//                         <Badge badgeContent={cartCount} color="error">
//                           <FaShoppingCart size={22} color="black" />
//                         </Badge>
//                       </IconButton>
//                     </Link>
//                     <NotificationBell navigate={navigate} />
//                   </>
//                 )}

//                 {user ? (
//                   <>
//                     <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} size="large">
//                       {profilePic ? <Avatar src={profilePic} /> : <Avatar />}
//                     </IconButton>
//                     <Menu
//                       anchorEl={profileAnchor}
//                       open={Boolean(profileAnchor)}
//                       onClose={() => setProfileAnchor(null)}
//                     >
//                       <MenuItem
//                         onClick={() => {
//                           navigate("/profile");
//                           setProfileAnchor(null);
//                         }}
//                       >
//                         Manage Profile
//                       </MenuItem>

//                       <MenuItem
//                         onClick={() => {
//                           navigate("/orders"); // ✅ Route instead of modal
//                           setProfileAnchor(null);
//                         }}
//                       >
//                         My Orders
//                       </MenuItem>

//                       {/* ✅ My Requests (Sell & Demolition) */}
//                       <MenuItem
//                         onClick={() => {
//                           navigate("/requests");
//                           setProfileAnchor(null);
//                         }}
//                       >
//                         My Requests
//                       </MenuItem>

//                       <MenuItem
//                         onClick={() => {
//                           handleLogout();
//                           setProfileAnchor(null);
//                         }}
//                       >
//                         Logout
//                       </MenuItem>
//                     </Menu>
//                   </>
//                 ) : (
//                   !hideAuthButtons && (
//                     <Box sx={{ display: "flex", gap: 1 }}>
//                       <Button
//                         variant="contained"
//                         onClick={() => {
//                           setModalType("signin");
//                           setShowModal(true);
//                         }}
//                       >
//                         Sign In
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         onClick={() => {
//                           setModalType("signup");
//                           setShowModal(true);
//                         }}
//                       >
//                         Sign Up
//                       </Button>
//                     </Box>
//                   )
//                 )}
//               </Box>
//             </Toolbar>
//           </Container>
//         </AppBar>
//       )}

//       {/* Auth Modal remains */}
//       <AuthModal show={showModal} onHide={() => setShowModal(false)} modalType={modalType} />
//       {/* ❌ Removed the MyOrders modal mount here */}
//     </>
//   );
// }


import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import AuthModal from "../Auth/Auth";
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
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Imported image (place ads.png in src/images/)
import adsImg from "../images/ads.png";

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

  // Purchase confirmation modal state
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  // Keep a ref to timer so we can clear it if user closes early or component unmounts
  const purchaseTimerRef = useRef(null);
  // Prevent double navigation (keeps previous pattern safe)
  const purchaseNavigatedRef = useRef(false);

  // NOTE: kept these two to preserve MobileView props shape; they are no longer used for desktop.
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;
  const hideAuthButtons = ["/auth", "/login", "/register"].includes(location.pathname);

  // 🛒 Fetch cart count
  useEffect(() => {
    let pollingInterval = null;

    const fetchCartCount = async () => {
      try {
        if (!user?._id) return;
        const res = await axios.get(`${API_URL}/api/cart/${user._id}`);
        const items = res.data?.cartItems || [];
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
  }, [user, API_URL]);

  // 📱 Handle resize
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // cleanup purchase timer on unmount
  useEffect(() => {
    return () => {
      if (purchaseTimerRef.current) {
        clearTimeout(purchaseTimerRef.current);
      }
    };
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
          if (user?._id) {
            await axios.patch(`${API_URL}/api/users/status/${user._id}`, { status: "offline" });
          }
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

  // Navigate to /buy first, then show the popup modal on the Buy page.
  const openPurchaseModalAndProceed = () => {
    if (!user) {
      // if not logged in, show signin modal as before
      setModalType("signin");
      setShowModal(true);
      return;
    }

    // Reset nav guard
    purchaseNavigatedRef.current = false;

    // Navigate first
    navigate("/buy");

    // then open the preview modal (so it appears on the /buy page)
    setPurchaseModalOpen(true);

    // clear any previous timer
    if (purchaseTimerRef.current) clearTimeout(purchaseTimerRef.current);

    // set auto-close timer to close after 5 seconds (5000ms)
    purchaseTimerRef.current = setTimeout(() => {
      // just close the modal; no need to navigate because we already navigated
      handleClosePurchaseModal(false);
    }, 5000);
  };

  // close the modal; optionally navigate after close (default: don't navigate)
  const handleClosePurchaseModal = (navigateAfter = false) => {
    // clear timer
    if (purchaseTimerRef.current) {
      clearTimeout(purchaseTimerRef.current);
      purchaseTimerRef.current = null;
    }

    setPurchaseModalOpen(false);

    if (navigateAfter && !purchaseNavigatedRef.current) {
      purchaseNavigatedRef.current = true;
      navigate("/buy");
    }
  };

  // Handler used in services menu - uses buy modal for buy, otherwise navigates or asks sign in
  const handleServiceSelect = (service) => {
    setServicesAnchor(null);
    if (!user) {
      setModalType("signin");
      setShowModal(true);
      return;
    }

    // If buy, navigate first then show popup
    if (service === "buy") {
      openPurchaseModalAndProceed();
    } else {
      navigate(`/${service}`);
    }
  };

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
          // new prop so mobile can trigger the same buy pre-modal behavior
          handleBuyClick={() => {
            if (!user) {
              setModalType("signin");
              setShowModal(true);
            } else {
              openPurchaseModalAndProceed();
            }
          }}
        />
      ) : (
        // Removed fixed height and added symmetric vertical padding on the Toolbar.
        <AppBar position="fixed" sx={{ bgcolor: "#f0f0f0ff", boxSizing: "border-box" }}>
          <Container maxWidth={false}>
            {/* Use paddingY (py) for equal top/bottom spacing and alignItems center to vertically center children */}
            <Toolbar
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.5, // <-- symmetric vertical padding for equal top & bottom spacing
                px: { xs: 1, sm: 2 }, // responsive horizontal padding
              }}
            >
              {/* Logo */}
              <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                <Box
                  component="img"
                  src={logo}
                  alt="logo"
                  sx={{
                    height: 50,
                    width: "auto",
                    display: "block",
                  }}
                />
              </Link>

              {/* Desktop Links */}
              <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                <CustomLink to="/">Home</CustomLink>

                {/* Services Dropdown */}
                <CustomLink to={null} onClick={(e) => setServicesAnchor(e.currentTarget)} activePaths={["/buy", "/sell", "/demolish"]}>
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
                      onClick={() => handleServiceSelect(service)}
                    >
                      {service.charAt(0).toUpperCase() + service.slice(1)}
                    </MenuItem>
                  ))}
                </Menu>

                <CustomLink to="/about">About</CustomLink>
                <CustomLink to="/contact">Contact</CustomLink>
                <CustomLink to="/faqs">FAQs</CustomLink>
              </Box>

              {/* Right Side */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {user && (
                  <>
                    <Link to="/cart" style={{ color: "inherit" }}>
                      <IconButton aria-label="cart" size="large">
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
                    <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} size="large">
                      {profilePic ? <Avatar src={profilePic} /> : <Avatar />}
                    </IconButton>
                    <Menu
                      anchorEl={profileAnchor}
                      open={Boolean(profileAnchor)}
                      onClose={() => setProfileAnchor(null)}
                    >
                      <MenuItem
                        onClick={() => {
                          navigate("/profile");
                          setProfileAnchor(null);
                        }}
                      >
                        Manage Profile
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          navigate("/orders"); // ✅ Route instead of modal
                          setProfileAnchor(null);
                        }}
                      >
                        My Orders
                      </MenuItem>

                      {/* ✅ My Requests (Sell & Demolition) */}
                      <MenuItem
                        onClick={() => {
                          navigate("/requests");
                          setProfileAnchor(null);
                        }}
                      >
                        My Requests
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          handleLogout();
                          setProfileAnchor(null);
                        }}
                      >
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  !hideAuthButtons && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setModalType("signin");
                          setShowModal(true);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setModalType("signup");
                          setShowModal(true);
                        }}
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

      {/* Auth Modal remains */}
      <AuthModal show={showModal} onHide={() => setShowModal(false)} modalType={modalType} />

      {/* Purchase confirmation modal (pre-buy) */}
      <Dialog
        open={purchaseModalOpen}
        onClose={() => handleClosePurchaseModal(false)} // just close; navigation already happened earlier
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            position: "relative",
            overflow: "visible",
            borderRadius: 2,
            p: 0,
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Typography variant="h6">Ready to Buy?</Typography>
          <IconButton
            aria-label="close"
            onClick={() => handleClosePurchaseModal(false)} // close only, no extra navigation
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          {/* Using imported ads image */}
          <Box
            component="img"
            src={adsImg}
            alt="Purchase preview"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 1,
            }}
            onError={(e) => {
              // fallback to public path if import fails at runtime
              try {
                e.target.src = "/images/ads.png";
              } catch {
                // ignore
              }
            }}
          />
          <Typography variant="body2" align="center">
            We'll take you to the Shop shortly.
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}
