

// import React, { useState } from "react";
// import Swal from "sweetalert2";
// import toast from "react-hot-toast"; // General notification
// import { getFirestore, doc, setDoc } from "firebase/firestore";
// import { auth } from "../../firebase/firebase";

// const ProfilePicture = ({ preview, setPreview, setImageBase64 }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const fileURL = URL.createObjectURL(file);
//       setPreview(fileURL);
//     }
//   };

//   const convertImageToBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.onerror = (error) => reject("Error reading the file: " + error);
//       reader.readAsDataURL(file);
//     });
//   };

//   const handleUpload = async () => {
//     if (!preview || loading) return;
//     setLoading(true);
//     setError("");

//     try {
//       const imageFile = document.getElementById("file-input").files[0];
//       if (!imageFile) {
//         Swal.fire("Missing Image", "Please select an image file first.", "warning");
//         setLoading(false);
//         return;
//       }

//       const imageBase64 = await convertImageToBase64(imageFile);

//       const user = auth.currentUser;
//       if (!user) {
//         Swal.fire("Authentication Error", "User not authenticated.", "error");
//         setLoading(false);
//         return;
//       }

//       const db = getFirestore();
//       await setDoc(
//         doc(db, "users", user.uid),
//         { profilePic: imageBase64 },
//         { merge: true }
//       );

//       if (setImageBase64) {
//         setImageBase64(imageBase64);
//       }

//       toast.success("Profile picture uploaded successfully!");
//     } catch (error) {
//       console.error("Error uploading profile picture:", error);
//       toast.error("Failed to upload profile picture.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="position-relative mb-3 d-flex flex-column align-items-center">
//       {error && <p className="text-danger">{error}</p>}
//       <label htmlFor="file-input">
//         <div
//           className="rounded-circle border border-primary overflow-hidden d-flex align-items-center justify-content-center"
//           style={{ width: "120px", height: "120px", backgroundColor: "#f0f0f0" }}
//         >
//           <img
//             src={preview || "default-image-url.png"}
//             alt="Profile"
//             className="w-100 h-100"
//             style={{ objectFit: "cover", borderRadius: "50%" }}
//           />
//         </div>
//       </label>
//       <input
//         id="file-input"
//         type="file"
//         accept="image/*"
//         onChange={handleFileChange}
//         hidden
//       />
//       <button
//         onClick={handleUpload}
//         className="btn btn-primary mt-2"
//         disabled={loading}
//       >
//         {loading ? "Uploading..." : "Upload"}
//       </button>
//     </div>
//   );
// };

// export default ProfilePicture;
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import axios from "axios"; // Added for Express requests
import { useAuth } from "../../context/AuthContext"; // Auth context

const ProfilePicture = ({ preview, setPreview, setImageBase64, userId }) => {
  const { user } = useAuth(); // Use Auth context to pull user data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setPreview(fileURL); // Update preview with the selected file
    }
  };

  // Convert the image file to Base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject("Error reading the file: " + error);
      reader.readAsDataURL(file);
    });
  };

  // Handle the image upload logic
  const handleUpload = async () => {
    if (!preview || loading) return;
    setLoading(true);
    setError("");

    try {
      const imageFile = document.getElementById("file-input").files[0];
      if (!imageFile) {
        Swal.fire("Missing Image", "Please select an image file first.", "warning");
        setLoading(false);
        return;
      }

      // Check if the user is authenticated (using the user context)
      if (!user) {
        Swal.fire("Authentication Error", "User not authenticated.", "error");
        setLoading(false);
        return;
      }

      // If the user is authenticated, upload the image
      const imageBase64 = await convertImageToBase64(imageFile);

      // Send the image to the server
      await axios.post("/api/users/upload-profile-picture", {
        userId: user._id, // Send the user ID from context
        imageBase64,
      });

      // Update the preview and profile picture base64 state
      if (setImageBase64) {
        setImageBase64(imageBase64);
      }

      toast.success("Profile picture uploaded successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // If the user is logged in, set the profile picture preview from the context
      setPreview(user.profilePic || "default-image-url.png");
    }
  }, [user, setPreview]);

  return (
    <div className="position-relative mb-3 d-flex flex-column align-items-center">
      {error && <p className="text-danger">{error}</p>}
      <label htmlFor="file-input">
        <div
          className="rounded-circle border border-primary overflow-hidden d-flex align-items-center justify-content-center"
          style={{ width: "120px", height: "120px", backgroundColor: "#f0f0f0" }}
        >
          <img
            src={preview || "default-image-url.png"} // Fallback to default image if not set
            alt="Profile"
            className="w-100 h-100"
            style={{ objectFit: "cover", borderRadius: "50%" }}
          />
        </div>
      </label>
      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        hidden
      />
      <button
        onClick={handleUpload}
        className="btn btn-primary mt-2"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default ProfilePicture;
