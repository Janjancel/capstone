import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import AccountDetails from "./AccountDetails";
import AddressForm from "./AddressForm";
import ProfilePicture from "./ProfilePicture";
import toast from "react-hot-toast";

export default function Profile() {
  const API_URL = process.env.REACT_APP_API_URL;

  // removed unused `profilePic`
  const [preview, setPreview] = useState("default-profile.png");
  const [userDetails, setUserDetails] = useState({ username: "", email: "" });

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem("token");
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;

        // Update user details with actual data from response
        setUserDetails({
          username: data.username || "N/A",
          email: data.email || "N/A",
        });
        
        // Update profile picture if available
        if (data.profilePic) {
          setPreview(data.profilePic);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast.error("Failed to load user information");
      }
    };

    // Set up polling to keep user data fresh
    fetchUserData();
    const pollingInterval = setInterval(fetchUserData, 30000); // Update every 30 seconds

    return () => clearInterval(pollingInterval);
  }, [userId, API_URL]);

  const handleUpload = async (imageBase64) => {
    if (!userId || !imageBase64) return;

    try {
      await axios.post(`${API_URL}/api/users/upload-profile-picture`, {
        userId,
        imageBase64,
      });
      // keep preview updated; removed unused setProfilePic
      setPreview(imageBase64);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    }
  };

  return (
    <section className="container-fluid bg-light py-4">
      <div className="container">
        <div className="text-start mb-4">
          <h2 className="d-flex align-items-center gap-2">
            My Profile <FaEdit className="text-primary" />
          </h2>
          <p className="text-muted">Manage and protect your account</p>
          <hr />
        </div>

        <div className="row">
          <div className="col-lg-8">
            <AccountDetails
              username={userDetails.username}
              email={userDetails.email}
            />
            <AddressForm />
          </div>
          <div className="col-lg-4 d-flex flex-column align-items-center border-start">
            <ProfilePicture
              preview={preview}
              setPreview={setPreview}
              setImageBase64={handleUpload}
              userId={userId}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
