
// import './Navbar.css';
// import { Link, useMatch, useResolvedPath, useNavigate, useLocation } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import logo from '../images/logo.png';
// import { useState, useEffect, useRef } from 'react';
// import Swal from 'sweetalert2';
// import { FaShoppingCart } from 'react-icons/fa';
// import AuthModal from '../Home/Auth';
// import { auth, db } from '../../firebase/firebase';
// import { onAuthStateChanged, signOut } from 'firebase/auth';
// import { doc, onSnapshot, getFirestore, setDoc } from 'firebase/firestore';
// import MyOrders from '../MyOrders';
// import NotificationBell from './NotificationBell';

// export default function Navbar() {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [showOrders, setShowOrders] = useState(false);
//     const [user, setUser] = useState(null);
//     const [cartCount, setCartCount] = useState(0);
//     const [menuOpen, setMenuOpen] = useState(false);
//     const [isAnimatingOut, setIsAnimatingOut] = useState(false);
//     const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
//     const [dropdownOpen, setDropdownOpen] = useState(false);
//     const [isMobileView, setIsMobileView] = useState(window.innerWidth < 992);
//     const [showModal, setShowModal] = useState(false);
//     const [modalType, setModalType] = useState('signin');
//     const [profilePic, setProfilePic] = useState(null);
//     const [showPurchaseModal, setShowPurchaseModal] = useState(false);
//     const dropdownRef = useRef(null);
//     const servicesDropdownRef = useRef(null);

//     const hideAuthButtons = ["/auth", "/login", "/register"].includes(location.pathname);

//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, (user) => {
//             setUser(user);
//             if (user) {
//                 const userRef = doc(db, "users", user.uid);
//                 onSnapshot(userRef, (docSnap) => {
//                     if (docSnap.exists()) {
//                         const userData = docSnap.data();
//                         setProfilePic(userData.profilePic || "default-profile.png");
//                     }
//                 });
//             }
//         });
//         return () => unsubscribe();
//     }, []);

//     const handleLogout = () => {
//         Swal.fire({
//             title: "Are you sure?",
//             text: "You will be logged out!",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonText: "Yes, logout!",
//             cancelButtonText: "Cancel",
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 try {
//                     const user = auth.currentUser;
//                     if (user) {
//                         const db = getFirestore();
//                         const userRef = doc(db, "users", user.uid);
//                         await setDoc(userRef, {
//                             status: "offline",
//                             lastLogout: new Date()
//                         }, { merge: true });
//                         await signOut(auth);
//                         localStorage.clear();
//                         navigate('/');
//                         Swal.fire("Logged Out!", "You have been successfully logged out.", "success");
//                     }
//                 } catch (error) {
//                     console.error("Logout error:", error);
//                     Swal.fire("Error", "Failed to log out. Please try again.", "error");
//                 }
//             }
//         });
//     };

//     useEffect(() => {
//         if (!user) return;
//         const cartDocRef = doc(db, "carts", user.uid);
//         const unsubscribe = onSnapshot(cartDocRef, (docSnap) => {
//             if (docSnap.exists()) {
//                 const cartData = docSnap.data();
//                 const items = cartData.cartItems || [];
//                 const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
//                 setCartCount(totalQuantity);
//             } else {
//                 setCartCount(0);
//             }
//         });
//         return () => unsubscribe();
//     }, [user]);

//     useEffect(() => {
//         function handleClickOutside(event) {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setDropdownOpen(false);
//             }
//             if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target)) {
//                 setServicesDropdownOpen(false);
//             }
//         }
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     useEffect(() => {
//         const handleResize = () => setIsMobileView(window.innerWidth < 992);
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     const handleMenuToggle = () => {
//         if (menuOpen) {
//             setIsAnimatingOut(true);
//             setTimeout(() => {
//                 setIsAnimatingOut(false);
//                 setMenuOpen(false);
//             }, 750);
//         } else {
//             setMenuOpen(true);
//             setIsAnimatingOut(false);
//         }
//     };

//     if (location.pathname.startsWith("/admin")) return null;

//     return (
//         <nav className="navbar navbar-expand-lg fixed-top nav">
//             <div className="container-fluid">
//                 <Link className="navbar-brand" to="/">
//                     <img src={logo} alt="logo" id="logo" />
//                 </Link>
//                 <button className="navbar-toggler" type="button" onClick={handleMenuToggle} aria-label="Toggle navigation">
//                     {menuOpen && !isAnimatingOut ? (
//                         <svg key="close-icon" className="navbar-collapse animate__animated animate__fadeIn" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="black" viewBox="0 0 24 24">
//                             <path d="M18 6L6 18M6 6l12 12" stroke="black" strokeWidth="2" strokeLinecap="round" />
//                         </svg>
//                     ) : (
//                         <svg key="hamburger-icon" className="animate__animated animate__fadeIn" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="black" viewBox="0 0 24 24">
//                             <path d="M4 6h16M4 12h16M4 18h16" stroke="black" strokeWidth="2" strokeLinecap="round" />
//                         </svg>
//                     )}
//                 </button>
//                 <div className={`navbar-collapse mobile-menu-bg animate__animated ${isMobileView ? isAnimatingOut ? "animate__bounceOutUp" : menuOpen ? "animate__zoomInDown" : "" : ""}`} style={{ display: isMobileView ? (menuOpen || isAnimatingOut ? "block" : "none") : "block" }} id="navbarNav">
//                     <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//                         <CustomLink to="/" onClick={() => setMenuOpen(false)}>Home</CustomLink>
//                         <li className="nav-item dropdown" ref={servicesDropdownRef}>
//                             <span className="nav-link dropdown-toggle" onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)} role="button">Services</span>
//                             {servicesDropdownOpen && (
//                                 <ul className="dropdown-menu show">
//                                     {['buy', 'sell', 'demolish'].map(service => (
//                                         <li key={service}>
//                                             <span className="dropdown-item" onClick={() => {
//                                                 setMenuOpen(false);
//                                                 setServicesDropdownOpen(false);
//                                                 if (user) navigate(`/${service}`);
//                                                 else {
//                                                     setModalType('signin');
//                                                     setShowModal(true);
//                                                 }
//                                             }}>{service.charAt(0).toUpperCase() + service.slice(1)}</span>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             )}
//                         </li>
//                         <CustomLink to="/about" onClick={() => setMenuOpen(false)}>About</CustomLink>
//                         {/* <CustomLink to="/faqs" onClick={() => setMenuOpen(false)}>FAQs</CustomLink> */}
//                         <CustomLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</CustomLink>
//                     </ul>
// {/* Inside your return(...) in Navbar component */}
// <div className="d-flex align-items-center" style={{ marginRight: "100px" }}>
//   {user && (
//     <>
//       <Link to="/cart" className="cart-icon me-3" style={{ position: "relative" }} onClick={() => setMenuOpen(false)}>
//         <FaShoppingCart size={24} color="black" />
//         <p className="cart-badge" style={{
//           position: "absolute",
//           top: "-5px",
//           right: "-5px",
//           backgroundColor: cartCount > 0 ? "red" : "gray",
//           color: "white",
//           borderRadius: "50%",
//           width: "18px",
//           height: "18px",
//           fontSize: "12px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontWeight: "bold"
//         }}>{cartCount}</p>
//       </Link>

//       {/* ✅ Only show NotificationBell if user is signed in */}
//       <NotificationBell navigate={navigate} />
//     </>
//   )}

//   {user ? (
//     <div className="profile-container me-5" ref={dropdownRef}>
//       <div className="profile-circle" onClick={() => setDropdownOpen(!dropdownOpen)}>
//         {profilePic ? (
//           <img src={profilePic} alt="Profile" className="profile-img" />
//         ) : (
//           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor"
//             className="bi bi-person-circle profile-icon" viewBox="0 0 16 16">
//             <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
//             <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
//           </svg>
//         )}
//       </div>
//       {dropdownOpen && (
//         <div className="dropdown-menu show">
//           <Link className="nav-dropdown-item" to="/profile" onClick={() => setMenuOpen(false)}>Manage Profile</Link>
//           <span className="nav-dropdown-item" onClick={() => { setShowPurchaseModal(true); setMenuOpen(false); }}>My Orders</span>
//           <Link className="nav-dropdown-item" to="/" onClick={() => { setMenuOpen(false); handleLogout(); }}>Logout</Link>
//         </div>
//       )}
//     </div>
//   ) : (!hideAuthButtons && (
//     <div className="auth-buttons me-5">
//       <button className="btn btn-dark me-2" onClick={() => { setModalType('signin'); setShowModal(true); }}>Sign In</button>
//       <button className="btn btn-outline-dark" onClick={() => { setModalType('signup'); setShowModal(true); }}>Sign Up</button>
//     </div>
//   ))}
// </div>

//                 </div>
//             </div>
//             <AuthModal show={showModal} onHide={() => setShowModal(false)} modalType={modalType} />
//             <MyOrders show={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
//         </nav>
//     );
// }

// function CustomLink({ to, children, onClick, ...props }) {
//     const resolvedPath = useResolvedPath(to);
//     const isActive = useMatch({ path: resolvedPath.pathname, end: true });
//     return (
//         <li className={`nav-item ${isActive ? "active" : ""}`}>
//             <Link to={to} className="nav-link" onClick={onClick} {...props}>
//                 {children}
//             </Link>
//         </li>
//     );
// }

// ✅ Navbar.jsx (Parent)
// import './Navbar.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import NavbarLayout from './NavbarLayout';


// export default function Navbar() {
//     return <NavbarLayout />;
// }


import './Navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarLayout from './NavbarLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Navbar() {
  const [userStatus, setUserStatus] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) {
      setUserStatus(null);
      setCartCount(0);
      return;
    }

    const userId = user._id;

    const fetchStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/status/${userId}`);
        setUserStatus(res.data.status || 'offline');
      } catch (err) {
        console.error('Failed to fetch user status:', err);
        setUserStatus('offline');
      }
    };

    const fetchCart = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/carts/${userId}`);
        const cartItems = res.data.cartItems || [];
        const total = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      } catch (err) {
        console.error('Failed to fetch cart items:', err);
        setCartCount(0);
      }
    };

    fetchStatus();
    fetchCart();
  }, []);

  return <NavbarLayout userStatus={userStatus} cartCount={cartCount} />;
}

