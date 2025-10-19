

// import { useEffect } from "react";
// import { Route, Routes, useLocation, Navigate } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "animate.css";
// import "./App.css";

// import About from "./components/About/About";
// import Contact from "./components/Contact/Contact";
// import PrivateRoute from "./components/PrivateRoute";
// import Navbar from "./components/Navbar/Navbar";
// import Footer from "./components/Footer";
// import Home from "./components/Home/Home";
// import Admin from "./components/AdminDashboard/Admin/Admin";
// import Cart from "./components/Cart/Cart";
// import Buy from "./components/Buy";
// import Profile from "./components/Profile/Profile";
// import Sell from "./components/Sell/Sell";
// import Demolish from "./components/Demolish/Demolish";

// import { Toaster } from "react-hot-toast";
// import { useAuth } from "./context/AuthContext";
// import ProtectedAdminRoute from "./ProtectedAdminRoute";

// import { GoogleOAuthProvider } from "@react-oauth/google";

// function App() {
//   const location = useLocation();
//   const { user } = useAuth();

//   // Adjust padding for admin layout
//   useEffect(() => {
//     document.body.style.paddingTop = location.pathname.startsWith("/admin") ? "0" : "10vh";
//   }, [location.pathname]);

//   return (
//     <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
//       {!location.pathname.startsWith("/admin") && <Navbar />}

//       <div className="content-wrapper">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/contact" element={<Contact />} />

//           <Route element={<PrivateRoute />}>
//             <Route path="/buy" element={<Buy />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/profile" element={<Profile />} />
//             <Route path="/sell" element={<Sell />} />
//             <Route path="/demolish" element={<Demolish />} />
//           </Route>

//           <Route element={<ProtectedAdminRoute />}>
//             <Route path="/admin/*" element={<Admin />} />
//           </Route>

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </div>

//       <Toaster position="top-right" reverseOrder={false} />
//       {!location.pathname.startsWith("/admin") && <Footer />}
//     </GoogleOAuthProvider>
//   );
// }

// export default App;


// src/App.js
import { useEffect } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import "./App.css";

import About from "./components/About/About";
import Contact from "./components/Contact/Contact";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home/Home";
import Admin from "./components/AdminDashboard/Admin/Admin";
import Cart from "./components/Cart/Cart";
import Buy from "./components/Buy";
import Profile from "./components/Profile/Profile";
import Sell from "./components/Sell/Sell";
import Demolish from "./components/Demolish/Demolish";

// NEW: user “My Requests” page (create this component)
import MyRequests from "./components/Requests/MyRequest";

import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import ProtectedAdminRoute from "./ProtectedAdminRoute";

import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const location = useLocation();
  const { user } = useAuth();

  // Keep your admin-page padding logic intact
  useEffect(() => {
    document.body.style.paddingTop = location.pathname.startsWith("/admin") ? "0" : "10vh";
  }, [location.pathname]);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      {!location.pathname.startsWith("/admin") && <Navbar />}

      <div className="content-wrapper">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Authenticated (Client/User) */}
          <Route element={<PrivateRoute />}>
            <Route path="/buy" element={<Buy />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/demolish" element={<Demolish />} />
            {/* NEW: “My Requests” combines Sell & Demolition created by the signed-in user */}
            <Route path="/requests" element={<MyRequests />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin/*" element={<Admin />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Toaster position="top-right" reverseOrder={false} />
      {!location.pathname.startsWith("/admin") && <Footer />}
    </GoogleOAuthProvider>
  );
}

export default App;
