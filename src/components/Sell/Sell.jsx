

// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import toast, { Toaster } from "react-hot-toast";
// import axios from "axios";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   useMap,
//   useMapEvents,
// } from "react-leaflet";
// import L from "leaflet";
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";
// import "leaflet/dist/leaflet.css";

// // MUI imports
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Container,
//   Grid,
//   TextField,
//   Typography,
//   CircularProgress,
// } from "@mui/material";

// const API_URL =
//   process.env.REACT_APP_API_URL || "https://capstone-backend-k4uu.onrender.com";

// // Fix Leaflet icon URLs
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// const LocationMarker = ({ formData, setFormData }) => {
//   const map = useMap();

//   useMapEvents({
//     click(e) {
//       setFormData((prev) => ({
//         ...prev,
//         location: {
//           lat: e.latlng.lat,
//           lng: e.latlng.lng,
//         },
//       }));
//       map.flyTo([e.latlng.lat, e.latlng.lng], map.getZoom());
//     },
//   });

//   useEffect(() => {
//     if (formData.location.lat && formData.location.lng) {
//       map.flyTo([formData.location.lat, formData.location.lng], 13);
//     }
//   }, [formData.location, map]);

//   return null;
// };

// const Sell = () => {
//   const [formData, setFormData] = useState({
//     location: { lat: null, lng: null },
//     name: "",
//     contact: "",
//     price: "",
//     description: "",
//     image: null,
//   });

//   const [searchAddress, setSearchAddress] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState(null);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData({ ...formData, image: file });
//       setPreviewUrl(URL.createObjectURL(file));
//     }
//   };

//   const geocodeAddress = async () => {
//     if (!searchAddress.trim()) return;
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//           searchAddress
//         )}`
//       );
//       const data = await res.json();
//       if (data.length > 0) {
//         const { lat, lon } = data[0];
//         setFormData((prev) => ({
//           ...prev,
//           location: { lat: parseFloat(lat), lng: parseFloat(lon) },
//         }));
//         toast.success("Address pinned on map ✅");
//       } else {
//         toast.error("Address not found. Try again.");
//       }
//     } catch (error) {
//       console.error("Geocode Error:", error);
//       toast.error("Error searching address.");
//     }
//   };

//   const getLocation = () => {
//     if (!navigator.geolocation) {
//       Swal.fire(
//         "Location Error",
//         "Geolocation is not supported by your browser.",
//         "error"
//       );
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setFormData((prev) => ({
//           ...prev,
//           location: {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           },
//         }));
//         toast.success("Location detected 📍");
//       },
//       async (error) => {
//         let message = "";
//         switch (error.code) {
//           case error.PERMISSION_DENIED:
//             message = "Permission denied. Trying IP-based location instead.";
//             break;
//           case error.POSITION_UNAVAILABLE:
//             message = "Location unavailable.";
//             break;
//           case error.TIMEOUT:
//             message = "Location request timed out.";
//             break;
//           default:
//             message = "An unknown error occurred.";
//         }

//         Swal.fire("Location Error", message, "warning");

//         try {
//           const res = await fetch("https://ipapi.co/json/");
//           const data = await res.json();
//           if (data.latitude && data.longitude) {
//             setFormData((prev) => ({
//               ...prev,
//               location: { lat: data.latitude, lng: data.longitude },
//             }));
//             toast.success("Location detected via IP 📡");
//           }
//         } catch (err) {
//           Swal.fire(
//             "Backup Location Error",
//             "Could not fetch location via IP either.",
//             "error"
//           );
//         }
//       }
//     );
//   };

//   useEffect(() => {
//     getLocation();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     const userId = localStorage.getItem("userId");
//     if (!userId) {
//       Swal.fire("Login Required", "Please login to submit your request.", "warning");
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const formDataToUpload = new FormData();

//       if (formData.image) {
//         formDataToUpload.append("image", formData.image);
//       }

//       formDataToUpload.append("userId", userId);
//       formDataToUpload.append("name", formData.name);
//       formDataToUpload.append("contact", formData.contact);
//       formDataToUpload.append("price", Number(formData.price));
//       formDataToUpload.append("description", formData.description);
//       formDataToUpload.append("location", JSON.stringify(formData.location));

//       const res = await axios.post(`${API_URL}/api/sell`, formDataToUpload, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (res.data.success) {
//         toast.success("Your selling request has been submitted 🎉");
//         setFormData({
//           location: { lat: null, lng: null },
//           name: "",
//           contact: "",
//           price: "",
//           description: "",
//           image: null,
//         });
//         setPreviewUrl(null);
//       } else {
//         toast.error(res.data.message || "Failed to submit request ❌");
//       }
//     } catch (error) {
//       console.error("Error submitting sell request:", error.response?.data || error.message);
//       toast.error("Server error. Please try again later.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const defaultPosition = [13.5, 122];

//   return (
//     <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
//       <Toaster position="top-right" reverseOrder={false} />

//       <Box textAlign="center" mb={4}>
//         <Typography variant="h4" fontWeight="bold">
//           Sell Request
//         </Typography>
//         <Typography color="text.secondary">
//           Click on the map or search to pin the selling location
//         </Typography>
//       </Box>

//       <Grid container justifyContent="center">
//         <Grid item xs={12} md={8} lg={6}>
//           <Card elevation={4}>
//             <CardContent>
//               <form onSubmit={handleSubmit}>
//                 {/* Search Address */}
//                 <Box display="flex" gap={2} mb={3}>
//                   <TextField
//                     fullWidth
//                     placeholder="Search address to pin"
//                     value={searchAddress}
//                     onChange={(e) => setSearchAddress(e.target.value)}
//                   />
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={geocodeAddress}
//                   >
//                     Search
//                   </Button>
//                 </Box>

//                 <Typography variant="body2" color="text.secondary" mb={2}>
//                   Detected Location:{" "}
//                   {formData.location.lat && formData.location.lng
//                     ? `${formData.location.lat}, ${formData.location.lng}`
//                     : "Locating..."}
//                 </Typography>

//                 {/* Map */}
//                 <Box mb={3}>
//                   <MapContainer
//                     center={
//                       formData.location.lat && formData.location.lng
//                         ? [formData.location.lat, formData.location.lng]
//                         : defaultPosition
//                     }
//                     zoom={13}
//                     style={{ height: "300px", width: "100%" }}
//                   >
//                     <TileLayer
//                       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                       attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//                     />
//                     <LocationMarker
//                       formData={formData}
//                       setFormData={setFormData}
//                     />
//                     {formData.location.lat && formData.location.lng && (
//                       <Marker
//                         position={[
//                           formData.location.lat,
//                           formData.location.lng,
//                         ]}
//                       />
//                     )}
//                   </MapContainer>
//                 </Box>

//                 {/* Retry Button */}
//                 <Button
//                   variant="outlined"
//                   color="secondary"
//                   onClick={getLocation}
//                   fullWidth
//                   sx={{ mb: 3 }}
//                 >
//                   Retry Location Detection
//                 </Button>

//                 {/* Form Fields */}
//                 <TextField
//                   fullWidth
//                   label="Item Name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required
//                   margin="normal"
//                 />
//                 <TextField
//                   fullWidth
//                   label="Contact No"
//                   name="contact"
//                   value={formData.contact}
//                   onChange={handleChange}
//                   required
//                   margin="normal"
//                 />
//                 <TextField
//                   fullWidth
//                   type="number"
//                   label="Price"
//                   name="price"
//                   value={formData.price}
//                   onChange={handleChange}
//                   required
//                   margin="normal"
//                 />
//                 <TextField
//                   fullWidth
//                   multiline
//                   rows={3}
//                   label="Description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   required
//                   margin="normal"
//                 />

//                 {/* Image Upload + Preview */}
//                 <Box mt={2}>
//                   <Button
//                     variant="outlined"
//                     color="success"
//                     component="label"
//                     fullWidth
//                   >
//                     Upload Image
//                     <input
//                       type="file"
//                       accept="image/*"
//                       hidden
//                       onChange={handleImageChange}
//                     />
//                   </Button>

//                   {previewUrl && (
//                     <Box
//                       mt={2}
//                       textAlign="center"
//                       sx={{
//                         border: "1px solid #ccc",
//                         borderRadius: "8px",
//                         p: 1,
//                         bgcolor: "#fafafa",
//                       }}
//                     >
//                       <Typography variant="body2" color="text.secondary">
//                         Preview:
//                       </Typography>
//                       <Box
//                         component="img"
//                         src={previewUrl}
//                         alt="Preview"
//                         sx={{
//                           mt: 1,
//                           maxHeight: 200,
//                           maxWidth: "100%",
//                           borderRadius: "8px",
//                           objectFit: "cover",
//                         }}
//                       />
//                     </Box>
//                   )}
//                 </Box>

//                 {/* Submit */}
//                 <Box mt={3}>
//                   <Button
//                     type="submit"
//                     variant="contained"
//                     color="black"
//                     fullWidth
//                     disabled={isSubmitting}
//                     startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
//                   >
//                     {isSubmitting ? "Submitting..." : "Submit Request"}
//                   </Button>
//                 </Box>
//               </form>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// export default Sell;

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

const API_URL =
  process.env.REACT_APP_API_URL || "https://capstone-backend-k4uu.onrender.com";

// Fix Leaflet icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// LocationMarker Component
const LocationMarker = ({ formData, setFormData }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      setFormData((prev) => ({
        ...prev,
        location: { lat: e.latlng.lat, lng: e.latlng.lng },
      }));
      map.flyTo([e.latlng.lat, e.latlng.lng], map.getZoom());
    },
  });

  useEffect(() => {
    if (formData.location.lat && formData.location.lng) {
      map.flyTo([formData.location.lat, formData.location.lng], 13);
    }
  }, [formData.location, map]);

  return null;
};

const Sell = () => {
  const [formData, setFormData] = useState({
    location: { lat: null, lng: null },
    name: "",
    contact: "",
    price: "",
    description: "",
    image: null,
  });
  const [searchAddress, setSearchAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Input handlers
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Geocode address search
  const geocodeAddress = async () => {
    if (!searchAddress.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchAddress
        )}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setFormData((prev) => ({
          ...prev,
          location: { lat: parseFloat(lat), lng: parseFloat(lon) },
        }));
        toast.success("Address pinned on map ✅");
      } else {
        Swal.fire("Not Found", "Address not found. Try a different one.", "info");
      }
    } catch (error) {
      console.error("Geocode Error:", error);
      toast.error("Error searching address.");
    }
  };

  // Get user's current location
  const getLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire(
        "Location Error",
        "Geolocation is not supported by your browser.",
        "error"
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        }));
        toast.success("Location detected 📍");
      },
      async (error) => {
        let message = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Permission denied. Trying IP-based location instead.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
          default:
            message = "An unknown error occurred.";
        }

        Swal.fire("Location Error", message, "warning");

        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();
          if (data.latitude && data.longitude) {
            setFormData((prev) => ({
              ...prev,
              location: { lat: data.latitude, lng: data.longitude },
            }));
          }
        } catch (err) {
          Swal.fire(
            "Backup Location Error",
            "Could not fetch location via IP either.",
            "error"
          );
        }
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire("Login Required", "Please login to submit your request.", "warning");
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToUpload = new FormData();
      if (formData.image) formDataToUpload.append("image", formData.image);
      formDataToUpload.append("userId", userId);
      formDataToUpload.append("name", formData.name);
      formDataToUpload.append("contact", formData.contact);
      formDataToUpload.append("price", Number(formData.price));
      formDataToUpload.append("description", formData.description);
      formDataToUpload.append("location", JSON.stringify(formData.location));

      const res = await axios.post(`${API_URL}/api/sell`, formDataToUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("Your selling request has been submitted 🎉");
        setFormData({
          location: { lat: null, lng: null },
          name: "",
          contact: "",
          price: "",
          description: "",
          image: null,
        });
        setPreviewUrl(null);
      } else {
        toast.error(res.data.message || "Failed to submit request ❌");
      }
    } catch (error) {
      console.error("Error submitting sell request:", error.response?.data || error.message);
      toast.error("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultPosition = [13.5, 122];

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Toaster position="top-right" />
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Sell Request</Typography>
        <Typography color="text.secondary">
          Click on the map or search to pin the selling location
        </Typography>
      </Box>

      <Grid container justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Card elevation={4}>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {/* Search */}
                <Box display="flex" gap={2} mb={3}>
                  <TextField
                    fullWidth
                    placeholder="Search address to pin"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                  />
                  <Button variant="contained" color="primary" onClick={geocodeAddress}>
                    Search
                  </Button>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  Detected Location:{" "}
                  {formData.location.lat && formData.location.lng
                    ? `${formData.location.lat}, ${formData.location.lng}`
                    : "Locating..."}
                </Typography>

                {/* Map */}
                <Box mb={3}>
                  <MapContainer
                    center={
                      formData.location.lat && formData.location.lng
                        ? [formData.location.lat, formData.location.lng]
                        : defaultPosition
                    }
                    zoom={13}
                    style={{ height: "300px", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    />
                    <LocationMarker formData={formData} setFormData={setFormData} />
                    {formData.location.lat && formData.location.lng && (
                      <Marker position={[formData.location.lat, formData.location.lng]} />
                    )}
                  </MapContainer>
                </Box>

                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={getLocation}
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  Retry Location Detection
                </Button>

                {/* Form Fields */}
                <TextField
                  fullWidth
                  label="Item Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Contact No"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  margin="normal"
                />

                {/* Image Upload */}
                <Box mt={2}>
                  <Button variant="outlined" color="success" component="label" fullWidth>
                    Upload Image
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                  </Button>
                  {previewUrl && (
                    <Box
                      mt={2}
                      textAlign="center"
                      sx={{ border: "1px solid #ccc", borderRadius: "8px", p: 1, bgcolor: "#fafafa" }}
                    >
                      <Typography variant="body2" color="text.secondary">Preview:</Typography>
                      <Box
                        component="img"
                        src={previewUrl}
                        alt="Preview"
                        sx={{ mt: 1, maxHeight: 200, maxWidth: "100%", borderRadius: "8px", objectFit: "cover" }}
                      />
                    </Box>
                  )}
                </Box>

                <Box mt={3}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="black"
                    fullWidth
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Sell;
