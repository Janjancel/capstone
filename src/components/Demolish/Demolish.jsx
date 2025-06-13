import React, { useState } from "react";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import { db } from "../../firebase/firebase"; // adjust import path
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../../firebase/firebase";

const Demolition = () => {
  const [formData, setFormData] = useState({
    where: "",
    name: "",
    contact: "",
    price: "",
    description: "",
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  // Convert image to base64 string
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const uid = localStorage.getItem("uid") || auth.currentUser?.uid;

    if (!uid) {
      Swal.fire("Login Required", "Please login to submit your request.", "warning");
      setIsSubmitting(false);
      return;
    }

    try {
      let imageBase64 = null;
      if (formData.image) {
        imageBase64 = await convertImageToBase64(formData.image);
      }

      // Save demolition request to Firestore
      await addDoc(collection(db, "demolishRequest"), {
        where: formData.where,
        name: formData.name,
        contact: formData.contact,
        price: Number(formData.price),
        description: formData.description,
        image: imageBase64, // Optional image
        createdAt: serverTimestamp(), // Timestamp for when the request was created
        uid: uid, // Link request to user
        status: "pending", // Optional for tracking status
      });

      Swal.fire("Success!", "Your demolition request has been submitted.", "success");

      // Reset form fields
      setFormData({
        where: "",
        name: "",
        contact: "",
        price: "",
        description: "",
        image: null,
      });
    } catch (error) {
      console.error("Error submitting demolition request:", error);
      Swal.fire("Error!", "Failed to submit the request. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold">Demolition Request</h1>
        <p className="text-muted">Fill out the form below to submit your demolition request</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <form onSubmit={handleSubmit} className="card p-4 shadow">
            <div className="mb-3">
              <label className="form-label">Where</label>
              <input
                type="text"
                name="where"
                className="form-control"
                value={formData.where}
                onChange={handleChange}
                placeholder="Enter location"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Contact No</label>
              <input
                type="text"
                name="contact"
                className="form-control"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Enter contact number"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Price</label>
              <input
                type="number"
                name="price"
                className="form-control"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows="3"
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleImageChange}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Demolition;
