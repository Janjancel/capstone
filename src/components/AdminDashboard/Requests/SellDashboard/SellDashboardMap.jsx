import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import CloseIcon from "@mui/icons-material/Close";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon2x = require("leaflet/dist/images/marker-icon-2x.png");
const markerIcon = require("leaflet/dist/images/marker-icon.png");
const markerShadow = require("leaflet/dist/images/marker-shadow.png");

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const SellDashboardMap = ({ requests, onClose }) => {
  const validLocations = requests.filter(
    (loc) =>
      loc.location &&
      typeof loc.location.lat === "number" &&
      typeof loc.location.lng === "number"
  );

  const defaultPosition = [13.9311, 121.6176];
  const mapCenter = validLocations.length
    ? [validLocations[0].location.lat, validLocations[0].location.lng]
    : defaultPosition;

  return (
    <div style={{ position: "relative", height: 400, marginBottom: "1rem" }}>
      {/* <Typography variant="h4" mb={2}>
        Sell Request Map
      </Typography> */}

      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.8)",
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ height: 400 }}>
        <MapContainer center={mapCenter} zoom={6} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          {validLocations.map(({ _id, location, name, description, image }) => (
            <Marker key={_id} position={[location.lat, location.lng]} icon={customIcon}>
              <Popup>
                <strong>📍 {name}</strong>
                <br />
                {description}
                {image && (
                  <img
                    src={image}
                    alt={name}
                    style={{ width: "100%", maxHeight: 200, marginTop: 10 }}
                  />
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </div>
  );
};

export default SellDashboardMap;
