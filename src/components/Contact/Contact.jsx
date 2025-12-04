// import React from "react";
// import "bootstrap/dist/css/bootstrap.min.css";

// const Contact = () => {
//   return (
//     <div className="container py-5 animate__animated animate__lightSpeedInLeft">
//       <div className="row justify-content-center">
//         <div className="col-md-6">
//           <h2 className="text-center mb-4">Get in Touch</h2>
//           <form>
//             <div className="mb-3">
//               <label className="form-label">Name</label>
//               <input type="text" className="form-control" placeholder="Enter your name" required />
//             </div>

//             <div className="mb-3">
//               <label className="form-label">Email</label>
//               <input type="email" className="form-control" placeholder="Enter your email" required />
//             </div>

//             <div className="mb-3">
//               <label className="form-label">Contact No</label>
//               <input type="text" className="form-control" placeholder="Enter contact number" required />
//             </div>

//             <div className="mb-3">
//               <label className="form-label">Message</label>
//               <textarea className="form-control" rows="4" placeholder="Enter your message" required></textarea>
//             </div>

//             <button type="submit" className="btn btn-dark w-100">Send Message</button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Contact;


import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.loading("Sending message...", { id: "sendMsg" });

    emailjs
      .send(
        "service_ilppnva", // EmailJS service ID
        "template_1f8xfzi", // EmailJS template ID
        {
          name: form.name,
          email: form.email,
          contact: form.contact,
          message: form.message,
          to_email: "jancelperaltaincom@gmail.com",
        },
        "fb6pacZ--5EFNDoIv" // Public key
      )
      .then(
        () => {
          toast.success("Message sent successfully!", { id: "sendMsg" });
          setForm({ name: "", email: "", contact: "", message: "" });
        },
        (error) => {
          toast.error("Failed to send message. Try again.", { id: "sendMsg" });
          console.error(error);
        }
      );
  };

  return (
    <div className="container py-5 animate__animated animate__lightSpeedInLeft">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Get in Touch</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                name="name"
                type="text"
                className="form-control"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Contact No</label>
              <input
                name="contact"
                type="text"
                className="form-control"
                placeholder="Enter contact number"
                value={form.contact}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea
                name="message"
                className="form-control"
                rows="4"
                placeholder="Enter your message"
                value={form.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-dark w-100">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
