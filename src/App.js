
// // src/App.js
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
// import BuyPage from "./pages/BuyPage";
// import Profile from "./components/Profile/Profile";
// import Sell from "./components/Sell/Sell";
// import Demolish from "./components/Demolish/Demolish";

// // NEW: user “My Requests” page (already created)
// import MyRequests from "./components/Requests/MyRequest";

// // NEW: My Orders as a PAGE route
// import MyOrders from "./components/MyOrder/MyOrders";
// import ProductRatingPage from "./pages/ProductRatingPage";

// import { Toaster } from "react-hot-toast";
// import { useAuth } from "./context/AuthContext";
// import ProtectedAdminRoute from "./ProtectedAdminRoute";

// import { GoogleOAuthProvider } from "@react-oauth/google";

// function App() {
//   const location = useLocation();
//   const { user } = useAuth();

//   // Keep your admin-page padding logic intact
//   useEffect(() => {
//     document.body.style.paddingTop = location.pathname.startsWith("/admin") ? "0" : "10vh";
//   }, [location.pathname]);

//   return (
//     <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
//       {!location.pathname.startsWith("/admin") && <Navbar />}

//       <div className="content-wrapper">
//         <Routes>
//           {/* Public */}
//           <Route path="/" element={<Home />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/contact" element={<Contact />} />

//           {/* Authenticated (Client/User) */}
//           <Route element={<PrivateRoute />}>
//             <Route path="/buy" element={<Buy />} />
//             <Route path="/buy/:id" element={<BuyPage />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/profile" element={<Profile />} />
//             <Route path="/sell" element={<Sell />} />
//             <Route path="/demolish" element={<Demolish />} />
//             {/* NEW: “My Requests” combines Sell & Demolition created by the signed-in user */}
//             <Route path="/requests" element={<MyRequests />} />
//             {/* NEW: My Orders as dedicated page */}
//             <Route path="/orders" element={<MyOrders />} />
//             {/* Product Rating Page */}
//             <Route path="/rate/:orderId/:productId" element={<ProductRatingPage />} />
//           </Route>

//           {/* Admin */}
//           <Route element={<ProtectedAdminRoute />}>
//             <Route path="/admin/*" element={<Admin />} />
//           </Route>

//           {/* Fallback */}
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
import FAQs from "./components/FAQs";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home/Home";
import Admin from "./components/AdminDashboard/Admin/Admin";
import Cart from "./components/Cart/Cart";
import Buy from "./components/Buy/Buy";
import BuyPage from "./components/Buy/BuyPage";
import Profile from "./components/Profile/Profile";
import Sell from "./components/Sell/Sell";
import Demolish from "./components/Demolish/Demolish";

// NEW: user “My Requests” page (already created)
import MyRequests from "./components/Requests/MyRequest";

// NEW: My Orders as a PAGE route
import MyOrders from "./components/MyOrder/MyOrders";

import { Toaster } from "react-hot-toast";
import ProtectedAdminRoute from "./ProtectedAdminRoute";

import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const location = useLocation();

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
          <Route path="/faqs" element={<FAQs />} />

          {/* Authenticated (Client/User) */}
          <Route element={<PrivateRoute />}>
            <Route path="/buy" element={<Buy />} />
            <Route path="/buy/:id" element={<BuyPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/demolish" element={<Demolish />} />
            {/* NEW: “My Requests” combines Sell & Demolition created by the signed-in user */}
            <Route path="/requests" element={<MyRequests />} />
            {/* NEW: My Orders as dedicated page */}
            <Route path="/orders" element={<MyOrders />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin/*" element={<Admin />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Toaster position="top-right" reverseOrder={false} containerStyle={{ marginTop: "80px" }} />
      {!location.pathname.startsWith("/admin") && <Footer />}
    </GoogleOAuthProvider>
  );
}

export default App;
