
// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { useAuth } from "../../context/AuthContext";

// const ProfilePicture = ({ preview, setPreview, setImageBase64, userId }) => {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const API_URL = process.env.REACT_APP_API_URL;

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

//       if (!user) {
//         Swal.fire("Authentication Error", "User not authenticated.", "error");
//         setLoading(false);
//         return;
//       }

//       const imageBase64 = await convertImageToBase64(imageFile);

//       await axios.post(`${API_URL}/api/users/upload-profile-picture`, {
//         userId: user._id,
//         imageBase64,
//       });

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

//   useEffect(() => {
//     if (user) {
//       setPreview(user.profilePic || "default-image-url.png");
//     }
//   }, [user, setPreview]);

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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const DEFAULT_AVATAR = "/images/default-image-url.png"; // adjust to your actual default image path

const ProfilePicture = ({ preview, setPreview }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "";

  // Clean up blob URL when preview changes/unmount
  useEffect(() => {
    return () => {
      try {
        if (preview && typeof preview === "string" && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      } catch (e) {
        /* ignore */
      }
    };
  }, [preview]);

  // Initialize preview from user.profilePic only if it's a string URL
  useEffect(() => {
    if (user) {
      if (typeof user.profilePic === "string" && user.profilePic.trim() !== "") {
        setPreview(user.profilePic);
      } else {
        // avoid writing non-string values into preview
        if (!preview || typeof preview !== "string") {
          setPreview(DEFAULT_AVATAR);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Defensive helper: pick an image src string from preview prop (never return an object)
  const getImageSrc = (p) => {
    if (!p) return DEFAULT_AVATAR;

    // If it's already a string (URL or data URI)
    if (typeof p === "string") return p;

    // If someone accidentally passed coordinates or other object, detect common shapes:
    if (typeof p === "object") {
      // Common coordinate check: { lat, lng } or {lat:..., lng:...}
      if ("lat" in p && "lng" in p) {
        console.warn("ProfilePicture: received coordinates as preview — using default avatar. Fix parent to pass image URL instead of coordinates.", p);
        return DEFAULT_AVATAR;
      }

      // If object has likely URL fields, try them
      if (typeof p.url === "string" && p.url.trim() !== "") return p.url;
      if (typeof p.profilePic === "string" && p.profilePic.trim() !== "") return p.profilePic;
      if (typeof p.src === "string" && p.src.trim() !== "") return p.src;

      // Fallback
      console.warn("ProfilePicture: received unexpected preview object; using default avatar.", p);
      return DEFAULT_AVATAR;
    }

    // Everything else: fallback to default
    return DEFAULT_AVATAR;
  };

  const handleFileChange = (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    if (!file.type.startsWith("image/")) {
      setError("Selected file is not an image.");
      Swal.fire("Invalid file", "Please select an image file.", "warning");
      e.target.value = null;
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 5 MB.");
      Swal.fire("File too large", "Please choose an image smaller than 5 MB.", "warning");
      e.target.value = null;
      return;
    }

    // Safe preview creation
    const fileURL = URL.createObjectURL(file);
    setPreview(fileURL);
  };

  const handleUpload = async () => {
    setError("");
    if (loading) return;

    const fileInput = document.getElementById("file-input");
    const file = fileInput?.files?.[0];

    if (!file) {
      Swal.fire("Missing Image", "Please select an image file first.", "warning");
      return;
    }

    if (!user) {
      Swal.fire("Authentication Error", "User not authenticated.", "error");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      const token = user?.token || localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/api/users/upload-profile-picture`,
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            // Don't set Content-Type manually when using FormData
          },
          // withCredentials: true, // uncomment if your server uses cookie auth
        }
      );

      const newUrl = res?.data?.profilePic || (res?.data?.user && res.data.user.profilePic);

      if (newUrl && typeof newUrl === "string") {
        setPreview(newUrl);
        toast.success("Profile picture uploaded successfully!");
      } else {
        // Upload succeeded but server didn't return URL — still show success
        toast.success("Profile picture uploaded successfully!");
        // Optionally, re-fetch user's profile to get latest profilePic
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      const status = err?.response?.status;
      const serverData = err?.response?.data;

      if (status === 401) {
        setError("Unauthorized. Please sign in again.");
        Swal.fire("Unauthorized", "Please sign in and try again.", "error");
      } else if (serverData && typeof serverData === "string") {
        setError(serverData);
        Swal.fire("Upload failed", serverData, "error");
      } else if (serverData && serverData.message) {
        setError(serverData.message);
        Swal.fire("Upload failed", serverData.message, "error");
      } else {
        setError("Failed to upload profile picture.");
        Swal.fire("Upload failed", "Failed to upload profile picture.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const imageSrc = getImageSrc(preview);

  return (
    <div className="position-relative mb-3 d-flex flex-column align-items-center">
      {error && <p className="text-danger">{error}</p>}

      <label htmlFor="file-input" style={{ cursor: "pointer" }}>
        <div
          className="rounded-circle border border-primary overflow-hidden d-flex align-items-center justify-content-center"
          style={{ width: "120px", height: "120px", backgroundColor: "#f0f0f0" }}
          title="Click to select a new profile picture"
        >
          {/* img src is guaranteed to be a string */}
          <img
            src={imageSrc}
            alt="Profile"
            className="w-100 h-100"
            style={{ objectFit: "cover", borderRadius: "50%" }}
            onError={() => {
              // If the URL is invalid, fall back to default and log
              console.warn("ProfilePicture: failed to load image, falling back to default:", imageSrc);
              if (imageSrc !== DEFAULT_AVATAR) setPreview(DEFAULT_AVATAR);
            }}
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

      <div className="d-flex gap-2 mt-2">
        <button onClick={handleUpload} className="btn btn-primary" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => {
            if (user && typeof user.profilePic === "string" && user.profilePic.trim() !== "") {
              setPreview(user.profilePic);
            } else {
              setPreview(DEFAULT_AVATAR);
            }
            const fi = document.getElementById("file-input");
            if (fi) fi.value = null;
            setError("");
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ProfilePicture;
