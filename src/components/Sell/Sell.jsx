import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
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

const API_URL = process.env.REACT_APP_API_URL;

// Fix Leaflet icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ formData, setFormData }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      setFormData((prev) => ({
        ...prev,
        location: {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        },
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const geocodeAddress = async () => {
    if (!searchAddress.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`);
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setFormData((prev) => ({
          ...prev,
          location: {
            lat: parseFloat(lat),
            lng: parseFloat(lon),
          },
        }));
      } else {
        Swal.fire("Not Found", "Address not found. Try a different one.", "info");
      }
    } catch (error) {
      console.error("Geocode Error:", error);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire("Location Error", "Geolocation is not supported by your browser.", "error");
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
              location: {
                lat: data.latitude,
                lng: data.longitude,
              },
            }));
          }
        } catch (err) {
          Swal.fire("Backup Location Error", "Could not fetch location via IP either.", "error");
        }
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire("Login Required", "Please login to submit your item.", "warning");
      setIsSubmitting(false);
      return;
    }

    try {
      let imageBase64 = null;
      if (formData.image) {
        imageBase64 = await convertImageToBase64(formData.image);
      }

      const payload = {
        userId,
        name: formData.name,
        contact: formData.contact,
        price: Number(formData.price),
        description: formData.description,
        image: imageBase64,
        location: formData.location,
      };

      await axios.post(`${API_URL}/api/sell`, payload);

      Swal.fire("Success!", "Your item has been listed successfully!", "success");

      setFormData({
        location: { lat: null, lng: null },
        name: "",
        contact: "",
        price: "",
        description: "",
        image: null,
      });
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire("Error!", "Failed to submit. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultPosition = [13.5, 122];

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold">Sell Your Antiques & Old House</h1>
        <p className="text-muted">Click on the map or search to pin your exact location</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <form onSubmit={handleSubmit} className="card p-4 shadow">
            <div className="mb-3 d-flex">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Search address to pin"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
              />
              <button type="button" className="btn btn-primary" onClick={geocodeAddress}>
                Search
              </button>
            </div>

            <p className="mb-2 text-muted">
              Detected Location: {formData.location.lat && formData.location.lng ? `${formData.location.lat}, ${formData.location.lng}` : "Locating..."}
            </p>

            <div className="mb-3">
              <MapContainer
                center={formData.location.lat && formData.location.lng ? [formData.location.lat, formData.location.lng] : defaultPosition}
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
            </div>

            <button type="button" className="btn btn-outline-secondary mb-3" onClick={getLocation}>
              Retry Location Detection
            </button>

            <div className="mb-3">
              <label className="form-label">Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Contact No</label>
              <input type="text" name="contact" className="form-control" value={formData.contact} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Price</label>
              <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Upload Image</label>
              <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} required />
            </div>

            <button type="submit" className="btn btn-success w-100" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "List Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Sell;
