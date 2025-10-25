import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2"; // ✅ Only for confirmations
import toast, { Toaster } from "react-hot-toast"; // ✅ General notifications
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
    frontImage: null,
    sideImage: null,
    backImage: null,
  });

  const [previewUrls, setPreviewUrls] = useState({
    frontImage: null,
    sideImage: null,
    backImage: null,
  });

  const [searchAddress, setSearchAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- file inputs (hidden) per slot ----
  const fileInputRefs = {
    frontImage: useRef(null),
    sideImage: useRef(null),
    backImage: useRef(null),
  };

  const openPicker = (type) => fileInputRefs[type]?.current?.click();
  const resetPicker = (type) => {
    const ref = fileInputRefs[type]?.current;
    if (ref) ref.value = "";
  };

  // Handle text inputs
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle image change (single file per slot)
  const handleImageChange = (file, type) => {
    if (!file) return;

    // Revoke old objectURL to avoid memory leaks
    if (previewUrls[type]?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls[type]);
    }

    setFormData((prev) => ({ ...prev, [type]: file }));
    setPreviewUrls((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
  };

  // Drag & drop handlers per slot
  const onDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageChange(file, type);
    } else {
      toast.error("Please drop an image file.");
    }
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Geocode
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
        toast.error("Address not found. Try a different one.");
      }
    } catch (error) {
      console.error("Geocode Error:", error);
      toast.error("Error searching address.");
    }
  };

  // Location detection
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
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
      async () => {
        toast("Using IP-based location instead.");
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();
          if (data.latitude && data.longitude) {
            setFormData((prev) => ({
              ...prev,
              location: { lat: data.latitude, lng: data.longitude },
            }));
            toast.success("Approximate location detected via IP.");
          } else {
            toast.error("Could not detect location from IP.");
          }
        } catch (err) {
          toast.error("Could not fetch backup location.");
        }
      }
    );
  };

  useEffect(() => {
    getLocation();
    return () => {
      // cleanup object URLs on unmount
      Object.values(previewUrls).forEach((u) => {
        if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ SweetAlert used ONLY for confirmation
    const confirm = await Swal.fire({
      title: "Submit this sell request?",
      text: "Please review your details before sending.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, submit",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirm.isConfirmed) return;

    setIsSubmitting(true);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Please login to submit your request.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToUpload = new FormData();
      if (formData.frontImage)
        formDataToUpload.append("frontImage", formData.frontImage);
      if (formData.sideImage)
        formDataToUpload.append("sideImage", formData.sideImage);
      if (formData.backImage)
        formDataToUpload.append("backImage", formData.backImage);

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

        // Reset state
        setFormData({
          location: { lat: null, lng: null },
          name: "",
          contact: "",
          price: "",
          description: "",
          frontImage: null,
          sideImage: null,
          backImage: null,
        });

        // Revoke and reset previews
        Object.values(previewUrls).forEach((u) => {
          if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
        });
        setPreviewUrls({ frontImage: null, sideImage: null, backImage: null });

        // Clear the file inputs
        resetPicker("frontImage");
        resetPicker("sideImage");
        resetPicker("backImage");
      } else {
        toast.error(res.data.message || "Failed to submit request ❌");
      }
    } catch (error) {
      console.error(
        "Error submitting sell request:",
        error.response?.data || error.message
      );
      toast.error("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultPosition = [13.5, 122];

  // Reusable dropzone renderer for each angle
  const renderDropzone = (type, label) => (
    <Box mt={2}>
      {/* Hidden native input to keep upload behavior intact */}
      <input
        ref={fileInputRefs[type]}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          handleImageChange(file, type);
        }}
      />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>

      <Box
        role="button"
        tabIndex={0}
        onClick={() => openPicker(type)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openPicker(type);
        }}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, type)}
        sx={{
          border: "2px dashed #6c757d",
          borderRadius: "8px",
          minHeight: 160,
          p: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          flexWrap: "wrap",
          cursor: "pointer",
          bgcolor: "#fafafa",
          textAlign: "center",
        }}
        aria-label={`${label} upload area`}
        title="Click to select an image or drag & drop here"
      >
        {previewUrls[type] ? (
          <Box
            sx={{
              width: 180,
              height: 130,
              borderRadius: 1,
              overflow: "hidden",
              border: "1px solid #dee2e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#fff",
              mx: "auto",
            }}
          >
            <Box
              component="img"
              src={previewUrls[type]}
              alt={`${type} preview`}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        ) : (
          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ fontWeight: 600, mb: 0.5 }}>
              Click to upload or drag & drop
            </Box>
            <Typography variant="caption" color="text.secondary">
              JPG/PNG • Clear, well-lit photo recommended
            </Typography>
          </Box>
        )}
      </Box>

      <Typography
        variant="caption"
        display="block"
        color="text.secondary"
        sx={{ mt: 0.5 }}
      >
        {`Please upload a clear ${label.toLowerCase()} of your item.`}
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Toaster position="top-right" />
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Sell Request
        </Typography>
        <Typography color="text.secondary">
          Click on the map or search to pin the selling location
        </Typography>
      </Box>

      <Grid container justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Card elevation={4}>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {/* Address Search */}
                <Box display="flex" gap={2} mb={3}>
                  <TextField
                    fullWidth
                    placeholder="Search address to pin"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={geocodeAddress}
                  >
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
                    <LocationMarker
                      formData={formData}
                      setFormData={setFormData}
                    />
                    {formData.location.lat && formData.location.lng && (
                      <Marker
                        position={[
                          formData.location.lat,
                          formData.location.lng,
                        ]}
                      />
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
                  inputProps={{ min: 0, step: "0.01" }}
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

                {/* Image Dropzones (front/side/back) */}
                {renderDropzone("frontImage", "Front view image")}
                {renderDropzone("sideImage", "Side view image")}
                {renderDropzone("backImage", "Back view image")}

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
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    Tip: Clear, well-lit photos help our team assess your item faster.
                  </Typography>
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
