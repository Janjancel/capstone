

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
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const ProfilePicture = ({ preview, setPreview, setImageBase64, userId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setPreview(fileURL);
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject("Error reading the file: " + error);
      reader.readAsDataURL(file);
    });
  };

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

      if (!user) {
        Swal.fire("Authentication Error", "User not authenticated.", "error");
        setLoading(false);
        return;
      }

      const imageBase64 = await convertImageToBase64(imageFile);

      await axios.post(`${API_URL}/api/users/upload-profile-picture`, {
        userId: user._id,
        imageBase64,
      });

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
            src={preview || "default-image-url.png"}
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
