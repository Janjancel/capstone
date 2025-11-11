// import React from "react";
// import "bootstrap/dist/css/bootstrap.min.css";

// const Footer = () => {
//   return (
//     <footer className="bg-light text-dark py-4">
//       <div className="container">
//         <div className="row">
//           {/* Services Section */}
//           <div className="col-md-3">
//             <h6 className="fw-bold">Services</h6>
//             <ul className="list-unstyled">
//               <li><a href="/" className="text-decoration-none text-dark">Branding</a></li>
//               <li><a href="/" className="text-decoration-none text-dark">Design</a></li>
//               <li><a href="/" className="text-decoration-none text-dark">Marketing</a></li>
//               <li><a href="/" className="text-decoration-none text-dark">Advertisement</a></li>
//             </ul>
//           </div>

//           {/* Company Section */}
//           <div className="col-md-3">
//             <h6 className="fw-bold">Company</h6>
//             <ul className="list-unstyled">
//               <li><a href="/" className="text-decoration-none text-dark">About us</a></li>
//               <li><a href="/" className="text-decoration-none text-dark">Contact</a></li>
//               <li><a href="/" className="text-decoration-none text-dark">Jobs</a></li>
//               <li><a href="/" className="text-decoration-none text-dark">Press kit</a></li>
//             </ul>
//           </div>

//           {/* Legal Section */}
//           <div className="col-md-3">
//             <h6 className="fw-bold">Legal</h6>
//             <ul className="list-unstyled">
//               <li><a href="/" className="text-decoration-none text-dark">Terms of use</a></li>
//               <li><a href="/" className="text-decoration-none text-dark">Privacy policy</a></li>
//               <li><a href="/" className="text-decoration-none text-dark">Cookie policy</a></li>
//             </ul>
//           </div>

//           {/* Newsletter Section */}
//           <div className="col-md-3">
//             <h6 className="fw-bold">Newsletter</h6>
//             <p className="small">Enter your email address</p>
//             <div className="input-group">
//               <input
//                 type="email"
//                 className="form-control"
//                 placeholder="username@site.com"
//               />
//               <button className="btn btn-dark">Subscribe</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;


import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => {
  return (
    <footer className="bg-light text-dark py-4">
      <div className="container">
        <div className="row">
          {/* Services Section */}
          <div className="col-md-6 mb-3">
            <h6 className="fw-bold">Services</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/buy" className="text-decoration-none text-dark" aria-label="Buy service">
                  Buy
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-decoration-none text-dark" aria-label="Sell service">
                  Sell
                </Link>
              </li>
              <li>
                <Link to="/demolish" className="text-decoration-none text-dark" aria-label="Demolition service">
                  Demolish
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-decoration-none text-dark" aria-label="All services">
                  All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Section (replaces Company) */}
          <div className="col-md-6 mb-3">
            <h6 className="fw-bold">Quick Links</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-decoration-none text-dark" aria-label="Home">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-decoration-none text-dark" aria-label="About us">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-decoration-none text-dark" aria-label="Contact">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-decoration-none text-dark" aria-label="Frequently asked questions">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Optional bottom row: copyright or small links */}
        <div className="row">
          <div className="col-12 text-center mt-3">
            <small className="text-muted">© {new Date().getFullYear()} Unika Antika. All rights reserved.</small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
