
// import React, { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import axios from "axios";
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// // ---------- Leaflet default icon fix (Webpack/Vite) ----------
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// const customIcon = new L.Icon({
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// // ---------- Region IV-A (CALABARZON) geofence ----------
// // Approximate bounding box that covers Cavite, Laguna, Batangas, Rizal, and Quezon (incl. Polillo Islands).
// // Tweak these if you need tighter bounds.
// const CALABARZON_BOUNDS = L.latLngBounds(
//   [13.0, 120.2], // Southwest (lat, lng)
//   [14.9, 122.5]  // Northeast (lat, lng)
// );

// const MapComponent = () => {
//   const [heritageLocations, setHeritageLocations] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchHeritageHouses = async () => {
//       try {
//         const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/heritage`);
//         setHeritageLocations(res.data || []);
//       } catch (error) {
//         console.error("Error fetching heritage houses:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHeritageHouses();
//   }, []);

//   if (loading) {
//     return <div style={{ textAlign: "center", padding: "2rem" }}>Loading map...</div>;
//   }

//   // Keep only items with numeric coords
//   const withCoords = heritageLocations.filter(
//     (loc) => typeof loc.latitude === "number" && typeof loc.longitude === "number"
//   );

//   // Enforce Region IV-A coverage: only show markers inside the bounds
//   const inRegion = withCoords.filter((loc) =>
//     CALABARZON_BOUNDS.contains([loc.latitude, loc.longitude])
//   );

//   // If nothing is in-region, the map will still be locked to CALABARZON_BOUNDS
//   // and centered within it.
//   return (
//     <MapContainer
//       bounds={CALABARZON_BOUNDS}           // fit to Region IV-A on load
//       maxBounds={CALABARZON_BOUNDS}        // prevent panning out
//       maxBoundsViscosity={1.0}             // "sticky" boundary
//       minZoom={8}
//       maxZoom={18}
//       worldCopyJump={false}
//       style={{ height: "500px", width: "100%" }}
//       scrollWheelZoom
//     >
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         noWrap={true}
//         attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//       />

//       {inRegion.map(({ _id, latitude, longitude, name, description, image }) => (
//         <Marker key={_id} position={[latitude, longitude]} icon={customIcon}>
//           <Popup>
//             <strong>📍 {name}</strong>
//             <br />
//             {description}
//             {image && (
//               <img
//                 src={image}
//                 alt={name}
//                 style={{
//                   width: "100%",
//                   maxHeight: "200px",
//                   objectFit: "cover",
//                   marginTop: "10px",
//                 }}
//                 onError={(e) => {
//                   e.currentTarget.style.display = "none";
//                 }}
//               />
//             )}
//           </Popup>
//         </Marker>
//       ))}
//     </MapContainer>
//   );
// };

// export default MapComponent;

import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// ---------- Leaflet default icon fix (Webpack/Vite) ----------
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

// ---------- Region IV-A (CALABARZON) geofence ----------
const CALABARZON_BOUNDS = L.latLngBounds(
  [13.0, 120.2], // Southwest (lat, lng)
  [14.9, 122.5] // Northeast (lat, lng)
);

/**
 * MapComponent
 *
 * - Fetches /api/heritage
 * - Fetches /api/items (used to resolve attached item IDs when heritage.items are IDs)
 * - Shows markers only for numeric coords inside CALABARZON_BOUNDS
 * - Marker popup shows: name, description, main image, and a small list of attached items (thumbnail + name)
 *
 * Notes:
 * - Handles heritage.items when items are objects (populated) or when they are just IDs.
 * - Thumbnail sizes are conservative to fit the popup nicely.
 * - Table image sizing (if you want parity with your HeritageDashboard table) is: maxWidth: 120, maxHeight: 80.
 */
const MapComponent = () => {
  const [heritageLocations, setHeritageLocations] = useState([]);
  const [itemsList, setItemsList] = useState([]); // used to resolve ids -> item objects
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || "";

  // optional auth header (uses token if present)
  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // fetch heritage and items in parallel; items endpoint is optional (fallback to empty)
        const [heritageRes, itemsRes] = await Promise.all([
          axios.get(`${API_URL}/api/heritage`, { headers: authHeaders() }),
          axios
            .get(`${API_URL}/api/items`, { headers: authHeaders() })
            .catch(() => ({ data: [] })), // if items endpoint missing, keep [] to avoid breaking
        ]);

        if (!mounted) return;

        setHeritageLocations(Array.isArray(heritageRes.data) ? heritageRes.data : []);
        setItemsList(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      } catch (err) {
        console.error("Error fetching map data:", err);
        // still attempt to show whatever we have
        try {
          const fallback = await axios.get(`${API_URL}/api/heritage`);
          if (mounted) setHeritageLocations(Array.isArray(fallback.data) ? fallback.data : []);
        } catch (e) {
          console.error("Fallback heritage fetch failed:", e);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [API_URL, authHeaders]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading map...</div>;
  }

  // Keep only items with numeric coords
  const withCoords = heritageLocations.filter(
    (loc) =>
      loc &&
      (typeof loc.latitude === "number" || (!isNaN(Number(loc.latitude)) && loc.latitude !== "")) &&
      (typeof loc.longitude === "number" || (!isNaN(Number(loc.longitude)) && loc.longitude !== ""))
  ).map((loc) => ({
    ...loc,
    // normalize numeric coords (in case backend returns strings)
    latitude: Number(loc.latitude),
    longitude: Number(loc.longitude),
  }));

  // Enforce Region IV-A coverage: only show markers inside the bounds
  const inRegion = withCoords.filter((loc) =>
    CALABARZON_BOUNDS.contains([loc.latitude, loc.longitude])
  );

  /**
   * resolveAttachedItems - given heritage.items (may be array of objects or ids),
   * return an array of item objects with at least {_id, name, images[]}
   */
  const resolveAttachedItems = (heritageItems) => {
    if (!Array.isArray(heritageItems) || heritageItems.length === 0) return [];

    // quick lookup for itemsList by id
    const lookup = {};
    for (const it of itemsList) {
      if (it && it._id) lookup[String(it._id)] = it;
    }

    return heritageItems
      .map((it) => {
        if (!it) return null;
        // already populated object?
        if (typeof it === "object" && it._id) return it;
        // it might be an id (string or number) — look up
        const id = String(it);
        if (lookup[id]) return lookup[id];
        // nothing found — return a minimal object so UI can still render
        return { _id: id, name: "Item", images: [] };
      })
      .filter(Boolean);
  };

  return (
    <MapContainer
      bounds={CALABARZON_BOUNDS} // fit to Region IV-A on load
      maxBounds={CALABARZON_BOUNDS} // prevent panning out
      maxBoundsViscosity={1.0} // "sticky" boundary
      minZoom={8}
      maxZoom={18}
      worldCopyJump={false}
      style={{ height: "500px", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />

      {inRegion.map(({ _id, latitude, longitude, name, description, image, items }) => {
        const attached = resolveAttachedItems(items);

        return (
          <Marker key={_id} position={[latitude, longitude]} icon={customIcon}>
            <Popup>
              <div style={{ maxWidth: 300 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>📍 {name}</div>
                <div style={{ fontSize: 13, marginBottom: 8 }}>{description || "—"}</div>

                {image ? (
                  <img
                    src={image}
                    alt={name}
                    style={{
                      width: "100%",
                      maxHeight: 200,
                      objectFit: "cover",
                      borderRadius: 6,
                      marginBottom: 8,
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}

                {/* Attached items list (small thumbnails + name) */}
                {attached.length > 0 ? (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      🔗 Attached items
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      {attached.map((it) => {
                        const thumbnail = it && it.images && it.images[0] ? it.images[0] : null;
                        return (
                          <div
                            key={it._id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "4px 6px",
                              borderRadius: 6,
                              border: "1px solid rgba(0,0,0,0.06)",
                              background: "#fff",
                              boxShadow: "0 0 0 1px rgba(0,0,0,0.01) inset",
                            }}
                          >
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={it.name}
                                style={{
                                  width: 40,
                                  height: 30,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                  flex: "0 0 auto",
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 40,
                                  height: 30,
                                  borderRadius: 4,
                                  background: "#f1f3f5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 11,
                                  color: "#6c757d",
                                }}
                              >
                                N/A
                              </div>
                            )}

                            <div style={{ fontSize: 12, maxWidth: 140, wordBreak: "break-word" }}>
                              {it.name || "Item"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#6c757d" }}>
                    No attached items
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;
