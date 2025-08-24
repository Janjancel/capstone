import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import NotificationBell from "./NotificationBell";

export default function MobileView({
  user,
  profilePic,
  cartCount,
  handleLogout,
  setShowModal,
  setModalType,
  showPurchaseModal,
  setShowPurchaseModal,
  hideAuthButtons,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const dropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);

  const handleMenuToggle = () => {
    if (menuOpen) {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setMenuOpen(false);
        setIsAnimatingOut(false);
      }, 300); // Match animation duration
    } else {
      setMenuOpen(true);
    }
  };

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg fixed-top nav">
      <div className="container-fluid">
        {/* Logo */}
        <Link className="navbar-brand" to="/">
          <img src="/logo.png" alt="logo" id="logo" />
        </Link>

        {/* Burger Icon */}
        <button className="navbar-toggler border-0 bg-transparent" onClick={handleMenuToggle}>
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Mobile Menu */}
        <div
          className={`navbar-collapse mobile-menu-bg animate__animated ${
            isAnimatingOut ? "animate__fadeOutUp" : menuOpen ? "animate__fadeInDown" : ""
          }`}
          style={{ display: menuOpen || isAnimatingOut ? "block" : "none" }}
          id="navbarNav"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={handleMenuToggle}>
                Home
              </Link>
            </li>

            {/* Services Dropdown */}
            <li className="nav-item dropdown" ref={servicesDropdownRef}>
              <span
                className="nav-link dropdown-toggle"
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                role="button"
              >
                Services
              </span>
              {servicesDropdownOpen && (
                <ul className="dropdown-menu show">
                  {["buy", "sell", "demolish"].map((service) => (
                    <li key={service}>
                      <span
                        className="dropdown-item"
                        onClick={() => {
                          setMenuOpen(false);
                          setServicesDropdownOpen(false);
                          if (user) navigate(`/${service}`);
                          else {
                            setModalType("signin");
                            setShowModal(true);
                          }
                        }}
                      >
                        {service.charAt(0).toUpperCase() + service.slice(1)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/about" onClick={handleMenuToggle}>
                About
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/contact" onClick={handleMenuToggle}>
                Contact
              </Link>
            </li>
          </ul>

          {/* Cart + Profile / Auth */}
          <div className="d-flex align-items-center" style={{ marginRight: "100px" }}>
            {user && (
              <>
                <Link
                  to="/cart"
                  className="cart-icon me-3"
                  style={{ position: "relative" }}
                  onClick={handleMenuToggle}
                >
                  <FaShoppingCart size={24} color="black" />
                  <p
                    className="cart-badge"
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      backgroundColor: cartCount > 0 ? "red" : "gray",
                      color: "white",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {cartCount}
                  </p>
                </Link>
                <NotificationBell navigate={navigate} />
              </>
            )}

            {user ? (
              <div className="profile-container me-5" ref={dropdownRef}>
                <div className="profile-circle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="profile-img" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      fill="currentColor"
                      className="bi bi-person-circle profile-icon"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                      <path
                        fillRule="evenodd"
                        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                      />
                    </svg>
                  )}
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu show">
                    <Link
                      className="nav-dropdown-item"
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                    >
                      Manage Profile
                    </Link>
                    <span
                      className="nav-dropdown-item"
                      onClick={() => {
                        setShowPurchaseModal(true);
                        setMenuOpen(false);
                      }}
                    >
                      My Orders
                    </span>
                    <Link
                      className="nav-dropdown-item"
                      to="/"
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              !hideAuthButtons && (
                <div className="auth-buttons me-5">
                  <button
                    className="btn btn-dark me-2"
                    onClick={() => {
                      setModalType("signin");
                      setShowModal(true);
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    className="btn btn-outline-dark"
                    onClick={() => {
                      setModalType("signup");
                      setShowModal(true);
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
