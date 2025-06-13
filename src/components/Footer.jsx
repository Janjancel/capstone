import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => {
  return (
    <footer className="bg-light text-dark py-4">
      <div className="container">
        <div className="row">
          {/* Services Section */}
          <div className="col-md-3">
            <h6 className="fw-bold">Services</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-decoration-none text-dark">Branding</a></li>
              <li><a href="/" className="text-decoration-none text-dark">Design</a></li>
              <li><a href="/" className="text-decoration-none text-dark">Marketing</a></li>
              <li><a href="/" className="text-decoration-none text-dark">Advertisement</a></li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="col-md-3">
            <h6 className="fw-bold">Company</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-decoration-none text-dark">About us</a></li>
              <li><a href="/" className="text-decoration-none text-dark">Contact</a></li>
              <li><a href="/" className="text-decoration-none text-dark">Jobs</a></li>
              <li><a href="/" className="text-decoration-none text-dark">Press kit</a></li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="col-md-3">
            <h6 className="fw-bold">Legal</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-decoration-none text-dark">Terms of use</a></li>
              <li><a href="/" className="text-decoration-none text-dark">Privacy policy</a></li>
              <li><a href="/" className="text-decoration-none text-dark">Cookie policy</a></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="col-md-3">
            <h6 className="fw-bold">Newsletter</h6>
            <p className="small">Enter your email address</p>
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                placeholder="username@site.com"
              />
              <button className="btn btn-dark">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
