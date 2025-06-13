import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Contact = () => {
  return (
    <div className="container py-5 animate__animated animate__lightSpeedInLeft">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Get in Touch</h2>
          <form>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input type="text" className="form-control" placeholder="Enter your name" required />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="Enter your email" required />
            </div>

            <div className="mb-3">
              <label className="form-label">Contact No</label>
              <input type="text" className="form-control" placeholder="Enter contact number" required />
            </div>

            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea className="form-control" rows="4" placeholder="Enter your message" required></textarea>
            </div>

            <button type="submit" className="btn btn-dark w-100">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
