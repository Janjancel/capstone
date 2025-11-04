// import React from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { IconButton } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

// const markerIcon2x = require("leaflet/dist/images/marker-icon-2x.png");
// const markerIcon = require("leaflet/dist/images/marker-icon.png");
// const markerShadow = require("leaflet/dist/images/marker-shadow.png");

// // Fix leaflet default icon issue
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// // Custom marker icon
// const customIcon = new L.Icon({
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// const SellDashboardMap = ({ requests, onClose }) => {
//   // Filter only valid locations with numeric lat/lng
//   const validLocations = requests.filter(
//     (loc) =>
//       loc.location &&
//       typeof loc.location.lat === "number" &&
//       typeof loc.location.lng === "number"
//   );

//   const defaultPosition = [13.9311, 121.6176]; // Default if no valid locations
//   const mapCenter = validLocations.length
//     ? [validLocations[0].location.lat, validLocations[0].location.lng]
//     : defaultPosition;

//   return (
//     <div style={{ position: "relative", height: 400, marginBottom: "1rem" }}>
//       {/* Close Button */}
//       <IconButton
//         onClick={onClose}
//         sx={{
//           position: "absolute",
//           top: 10,
//           right: 10,
//           zIndex: 1000,
//           backgroundColor: "rgba(0,0,0,0.6)",
//           color: "white",
//           "&:hover": {
//             backgroundColor: "rgba(0,0,0,0.8)",
//           },
//         }}
//       >
//         <CloseIcon />
//       </IconButton>

//       <MapContainer center={mapCenter} zoom={6} style={{ height: "100%", width: "100%" }}>
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//         />

//         {validLocations.map(({ _id, location, name, description, image }) => (
//           <Marker key={_id} position={[location.lat, location.lng]} icon={customIcon}>
//             <Popup>
//               <strong>📍 {name}</strong>
//               <br />
//               {description}
//               {image && (
//                 <img
//                   src={image}
//                   alt={name}
//                   style={{ width: "100%", maxHeight: 200, marginTop: 10 }}
//                 />
//               )}
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// };

// export default SellDashboardMap;


import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const markerIcon2x = require("leaflet/dist/images/marker-icon-2x.png");
const markerIcon = require("leaflet/dist/images/marker-icon.png");
const markerShadow = require("leaflet/dist/images/marker-shadow.png");

// ---------- Fix leaflet default icon issue ----------
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ---------- Custom marker icon ----------
const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ---------- Philippines geofence (approx national bounds with a tiny buffer) ----------
const PH_BOUNDS = L.latLngBounds(
  [4.15, 116.80], // SW (Mindanao/Palawan area)
  [21.40, 127.20] // NE (Batanes & eastern waters)
);
const PH_CENTER = [12.8797, 121.7740]; // Geographic center of the Philippines

const SellDashboardMap = ({ requests, onClose }) => {
  // Only keep requests with numeric lat/lng
  const validLocations = (requests || []).filter(
    (loc) =>
      loc?.location &&
      typeof loc.location.lat === "number" &&
      typeof loc.location.lng === "number"
  );

  // Only render markers that are inside the PH bounds
  const inPhilippines = validLocations.filter((loc) =>
    PH_BOUNDS.contains([loc.location.lat, loc.location.lng])
  );

  // Center on the first in-bounds marker, or fallback to PH center
  const mapCenter = inPhilippines.length
    ? [inPhilippines[0].location.lat, inPhilippines[0].location.lng]
    : PH_CENTER;

  return (
    <div style={{ position: "relative", height: 400, marginBottom: "1rem" }}>
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
          "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
        }}
      >
        <CloseIcon />
      </IconButton>

      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        maxBounds={PH_BOUNDS}            // lock panning to PH
        maxBoundsViscosity={1.0}         // "sticky" boundary
        minZoom={5}
        maxZoom={18}
        worldCopyJump={false}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}                   // avoid world copies outside bounds
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        {inPhilippines.map(({ _id, location, name, description, image }) => (
          <Marker key={_id} position={[location.lat, location.lng]} icon={customIcon}>
            <Popup>
              <strong>📍 {name}</strong>
              <br />
              {description}
              {image && (
                <img
                  src={image}
                  alt={name}
                  style={{ width: "100%", maxHeight: 200, marginTop: 10, objectFit: "cover" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SellDashboardMap;
