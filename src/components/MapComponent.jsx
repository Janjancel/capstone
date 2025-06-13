import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default Leaflet icon URLs for Webpack/Vite
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

const MapComponent = () => {
  const [heritageLocations, setHeritageLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeritageHouses = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/heritage`);
        setHeritageLocations(res.data);
      } catch (error) {
        console.error("Error fetching heritage houses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeritageHouses();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading map...</div>;
  }

  const validLocations = heritageLocations.filter(
    (loc) => typeof loc.latitude === "number" && typeof loc.longitude === "number"
  );

  const defaultPosition = [13.9311, 121.6176];
  const mapCenter = validLocations.length
    ? [validLocations[0].latitude, validLocations[0].longitude]
    : defaultPosition;

  return (
    <MapContainer center={mapCenter} zoom={10} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />
      {validLocations.map(({ _id, latitude, longitude, name, description, image }) => (
        <Marker key={_id} position={[latitude, longitude]} icon={customIcon}>
          <Popup>
            <strong>📍 {name}</strong>
            <br />
            {description}
            {image && (
              <img
                src={image}
                alt={name}
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "cover",
                  marginTop: "10px",
                }}
              />
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
