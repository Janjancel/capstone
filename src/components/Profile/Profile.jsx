// import React, { useState, useEffect } from "react";
// import { FaEdit } from "react-icons/fa";
// import { auth, db } from "../../firebase/firebase";
// import { doc, onSnapshot, setDoc } from "firebase/firestore";
// import "bootstrap/dist/css/bootstrap.min.css";
// import AccountDetails from "./AccountDetails";
// import AddressForm from "./AddressForm";
// import ProfilePicture from "./ProfilePicture";

// export default function Profile() {
//   const [profilePic, setProfilePic] = useState(null);
//   const [preview, setPreview] = useState("default-profile.png");
//   const [userDetails, setUserDetails] = useState({ username: "", email: "" });

//   useEffect(() => {
//     const user = auth.currentUser;
//     if (!user) return;

//     const userRef = doc(db, "users", user.uid);

//     // ✅ Set up real-time listener
//     const unsubscribe = onSnapshot(userRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const data = snapshot.data();
//         setUserDetails({
//           username: data.username || "N/A",
//           email: user.email || "N/A",
//         });
//         setPreview(data.profilePic || "default-profile.png");
//       }
//     });

//     return () => unsubscribe(); // ✅ Clean up listener on unmount
//   }, []);

//   const handleUpload = async (imageBase64) => {
//     const user = auth.currentUser;
//     if (!user || !imageBase64) return;

//     const userRef = doc(db, "users", user.uid);
//     try {
//       await setDoc(userRef, { profilePic: imageBase64 }, { merge: true });
//       // No need to manually update preview — real-time listener handles it
//       setProfilePic(imageBase64);
//     } catch (error) {
//       console.error("Error uploading profile picture: ", error);
//     }
//   };

//   return (
//     <section className="container-fluid bg-light py-4">
//       <div className="container">
//         <div className="text-start mb-4">
//           <h2 className="d-flex align-items-center gap-2">
//             My Profile <FaEdit className="text-primary" />
//           </h2>
//           <p className="text-muted">Manage and protect your account</p>
//           <hr />
//         </div>

//         <div className="row">
//           <div className="col-lg-8">
//             <AccountDetails
//               username={userDetails.username}
//               email={userDetails.email}
//             />
//             <AddressForm />
//           </div>
//           <div className="col-lg-4 d-flex flex-column align-items-center border-start">
//             <ProfilePicture
//               preview={preview}
//               setPreview={setPreview}
//               setImageBase64={handleUpload}
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import AccountDetails from "./AccountDetails";
import AddressForm from "./AddressForm";
import ProfilePicture from "./ProfilePicture";

export default function Profile() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("default-profile.png");
  const [userDetails, setUserDetails] = useState({ username: "", email: "" });

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/${userId}`);
        const data = res.data;

        setUserDetails({
          username: data.username || "N/A",
          email: data.email || "N/A",
        });
        setPreview(data.profilePic || "default-profile.png");
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [userId, API_URL]);

  const handleUpload = async (imageBase64) => {
    if (!userId || !imageBase64) return;

    try {
      await axios.post(`${API_URL}/api/users/upload-profile-picture`, {
        userId,
        imageBase64,
      });
      setProfilePic(imageBase64);
      setPreview(imageBase64);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
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
