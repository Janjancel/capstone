// // src/pages/Dashboard.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { Container, Row, Col, Button, Card, ProgressBar } from "react-bootstrap";
// import { BuildingFillX, HouseFill, CartFill } from "react-bootstrap-icons";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import html2pdf from "html2pdf.js";
// import "bootstrap/dist/css/bootstrap.min.css";

// // Leaflet (Heatmap)
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// // KPI Summary
// import KPISummary from "../Dashboard/Analytics/KPISummary";
// import ReviewsAnalytics1 from "../Dashboard/Analytics/Reviews/ReviewsAnalytics1";
// import ReviewsAnalytics3 from "../Dashboard/Analytics/Reviews/ReviewsAnalytics3";

// const API_URL = process.env.REACT_APP_API_URL || "";

// const CURRENCY = (n) =>
//   `₱${(Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("en-PH", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`;

// // -----------------------------------------------------------------------------
// // Helpers
// function safeNumber(v) {
//   return Number.isFinite(Number(v)) ? Number(v) : 0;
// }

// // Try to pull a reasonable "location" string from different record shapes
// function extractLocation(record) {
//   if (!record || typeof record !== "object") return "";

//   const pick = (v) => {
//     if (!v) return "";
//     if (typeof v === "string") return v.trim();
//     if (typeof v === "object") {
//       const nested =
//         v.fullAddress ||
//         v.address ||
//         v.addressLine ||
//         v.address1 ||
//         v.location ||
//         v.label ||
//         v.formattedAddress;
//       if (typeof nested === "string") return nested.trim();

//       // Some APIs store address fields as pieces
//       const maybeParts = [v.street, v.barangay, v.city, v.province, v.region, v.zip]
//         .filter(Boolean)
//         .map(String);
//       if (maybeParts.length) return maybeParts.join(", ").trim();

//       try {
//         const s = JSON.stringify(v);
//         return s && s !== "{}" ? s : "";
//       } catch {
//         return "";
//       }
//     }
//     return String(v).trim();
//   };

//   // common fields across orders/sell/demolish/sales
//   return (
//     pick(record.address) ||
//     pick(record.location) ||
//     pick(record.deliveryAddress) ||
//     pick(record.shippingAddress) ||
//     pick(record.pickupAddress) ||
//     pick(record.siteAddress) ||
//     pick(record.mapAddress) ||
//     pick(record.fullAddress) ||
//     pick(record.formattedAddress) ||
//     // nested order object (often in sales)
//     (record.order &&
//       (pick(record.order.address) ||
//         pick(record.order.deliveryAddress) ||
//         pick(record.order.shippingAddress))) ||
//     ""
//   );
// }

// function buildLocationFrequency(records = []) {
//   const freq = {};
//   let missing = 0;

//   (records || []).forEach((r) => {
//     const loc = (extractLocation(r) || "").trim();
//     if (!loc) {
//       missing += 1;
//       return;
//     }
//     freq[loc] = (freq[loc] || 0) + 1;
//   });

//   const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
//   const totalWithLocation = entries.reduce((sum, [, c]) => sum + safeNumber(c), 0);
//   const totalRecords = (records || []).length;

//   return {
//     entries, // [ [location, count], ... ] sorted desc
//     totalWithLocation,
//     totalRecords,
//     missing,
//     uniqueLocations: entries.length,
//   };
// }

// function buildInsights(freqObj) {
//   const { entries, totalWithLocation, totalRecords, missing, uniqueLocations } = freqObj || {};
//   const list = [];

//   const top = entries && entries.length ? entries[0] : null;
//   if (top && totalWithLocation > 0) {
//     const pct = (safeNumber(top[1]) / totalWithLocation) * 100;
//     list.push(`Top location: ${top[0]} (${top[1]} record${top[1] > 1 ? "s" : ""}, ${pct.toFixed(1)}%).`);
//   }

//   if (entries && entries.length >= 3 && totalWithLocation > 0) {
//     const top3 = safeNumber(entries[0][1]) + safeNumber(entries[1][1]) + safeNumber(entries[2][1]);
//     const pct3 = (top3 / totalWithLocation) * 100;
//     list.push(`Top 3 locations account for ${pct3.toFixed(1)}% of records with a location.`);
//   } else if (entries && entries.length > 0 && totalWithLocation > 0) {
//     list.push(`This dataset has ${uniqueLocations} unique location${uniqueLocations === 1 ? "" : "s"}.`);
//   } else {
//     list.push("No location information found yet.");
//   }

//   if (typeof missing === "number" && totalRecords > 0) {
//     const missPct = (missing / totalRecords) * 100;
//     if (missing > 0) list.push(`Missing location on ${missing} of ${totalRecords} record(s) (${missPct.toFixed(1)}%).`);
//   }

//   return list;
// }

// // -----------------------------------------------------------------------------
// // Heatmap Helpers (lat/lng extraction + points)
// function pickLatLng(obj) {
//   if (!obj || typeof obj !== "object") return null;

//   // direct lat/lng
//   const lat = obj.lat ?? obj.latitude ?? (obj.coords && obj.coords.lat) ?? (obj.coordinates && obj.coordinates.lat);
//   const lng = obj.lng ?? obj.lon ?? obj.longitude ?? (obj.coords && obj.coords.lng) ?? (obj.coordinates && obj.coordinates.lng);

//   const nLat = Number(lat);
//   const nLng = Number(lng);
//   if (Number.isFinite(nLat) && Number.isFinite(nLng)) return { lat: nLat, lng: nLng };

//   // arrays [lng, lat] (geojson common)
//   if (Array.isArray(obj.coordinates) && obj.coordinates.length >= 2) {
//     const a0 = Number(obj.coordinates[0]);
//     const a1 = Number(obj.coordinates[1]);
//     if (Number.isFinite(a0) && Number.isFinite(a1)) return { lat: a1, lng: a0 };
//   }

//   return null;
// }

// function extractLatLng(record) {
//   if (!record || typeof record !== "object") return null;

//   // Common shapes from your pages:
//   // - sell/demolish: record.location {lat,lng}
//   // - orders: sometimes has deliveryLocation / shippingLocation / address objects
//   // - sales: sometimes nested under record.order
//   const candidates = [
//     record.location,
//     record.deliveryLocation,
//     record.shippingLocation,
//     record.pickupLocation,
//     record.siteLocation,
//     record.mapLocation,
//     record.address,
//     record.deliveryAddress,
//     record.shippingAddress,
//     record.pickupAddress,
//     record.siteAddress,
//     record.order && record.order.location,
//     record.order && record.order.deliveryLocation,
//     record.order && record.order.shippingLocation,
//     record.order && record.order.address,
//     record.order && record.order.deliveryAddress,
//     record.order && record.order.shippingAddress,
//     record,
//   ];

//   for (const c of candidates) {
//     const ll = pickLatLng(c);
//     if (ll) return ll;
//   }
//   return null;
// }

// function buildHeatPoints(records = []) {
//   const points = [];
//   let missing = 0;

//   (records || []).forEach((r) => {
//     const ll = extractLatLng(r);
//     if (!ll) {
//       missing += 1;
//       return;
//     }
//     // Leaflet heat expects [lat, lng, intensity]
//     points.push([ll.lat, ll.lng, 1]);
//   });

//   return { points, missing, total: (records || []).length };
// }

// // -----------------------------------------------------------------------------
// // Top 10 Ordered Items
// function extractItemLabel(it) {
//   if (!it || typeof it !== "object") return "Unknown Item";
//   return it.name || it.title || it.itemName || (it.item && (it.item.name || it.item.title)) || (it.product && (it.product.name || it.product.title)) || "Unknown Item";
// }

// function extractItemKey(it) {
//   if (!it || typeof it !== "object") return extractItemLabel(it);
//   return it.itemId || it.productId || it._id || it.id || (it.item && (it.item._id || it.item.id)) || (it.product && (it.product._id || it.product.id)) || extractItemLabel(it);
// }

// function buildTopOrderedItems(orders = []) {
//   const map = {};
//   let totalQtyAll = 0;

//   (orders || []).forEach((o) => {
//     const items = Array.isArray(o.items) ? o.items : [];
//     items.forEach((it) => {
//       const key = String(extractItemKey(it) || "").trim() || "unknown";
//       const label = extractItemLabel(it);

//       const qty = safeNumber(it.quantity);
//       const price = safeNumber(it.price);

//       totalQtyAll += qty;

//       if (!map[key]) {
//         map[key] = {
//           key,
//           name: label,
//           qty: 0,
//           revenue: 0,
//           ordersCount: 0,
//         };
//       }

//       map[key].qty += qty;
//       map[key].revenue += price * qty;
//       map[key].ordersCount += 1;
//     });
//   });

//   const list = Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 10);
//   const maxQty = list.reduce((m, x) => Math.max(m, safeNumber(x.qty)), 0);

//   return {
//     list,
//     totalQtyAll,
//     maxQty,
//   };
// }

// // -----------------------------------------------------------------------------
// // Heatmap Component (Leaflet + optional leaflet.heat)
// const HeatmapCard = ({ title, points, missing, total }) => {
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const layerRef = useRef(null);
//   const fallbackLayerRef = useRef(null);

//   // init + update
//   useEffect(() => {
//     let disposed = false;

//     const initOrUpdate = async () => {
//       if (!mapRef.current) return;

//       // Init map once
//       if (!mapInstanceRef.current) {
//         const map = L.map(mapRef.current, {
//           center: [12.8797, 121.774], // PH default
//           zoom: 6,
//           zoomControl: true,
//         });

//         L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//           attribution: "&copy; OpenStreetMap contributors",
//         }).addTo(map);

//         mapInstanceRef.current = map;
//       }

//       const map = mapInstanceRef.current;

//       // Remove old layers
//       if (layerRef.current) {
//         try {
//           map.removeLayer(layerRef.current);
//         } catch {}
//         layerRef.current = null;
//       }
//       if (fallbackLayerRef.current) {
//         try {
//           map.removeLayer(fallbackLayerRef.current);
//         } catch {}
//         fallbackLayerRef.current = null;
//       }

//       const safePoints = Array.isArray(points) ? points : [];
//       const hasPoints = safePoints.length > 0;

//       // Fit bounds if we have points
//       if (hasPoints) {
//         const latLngs = safePoints.map((p) => L.latLng(p[0], p[1]));
//         const bounds = L.latLngBounds(latLngs);
//         if (bounds.isValid()) map.fitBounds(bounds.pad(0.2));
//       } else {
//         map.setView([12.8797, 121.774], 6);
//       }

//       // Try leaflet.heat if installed; otherwise fallback to circle markers
//       let heatAvailable = false;
//       try {
//         // If you installed leaflet.heat, this will work:
//         //   npm i leaflet.heat
//         await import("leaflet.heat");
//         heatAvailable = true;
//       } catch {
//         heatAvailable = false;
//       }

//       if (disposed) return;

//       if (heatAvailable && hasPoints && typeof L.heatLayer === "function") {
//         const heat = L.heatLayer(safePoints, {
//           radius: 25,
//           blur: 18,
//           maxZoom: 17,
//         });
//         heat.addTo(map);
//         layerRef.current = heat;
//       } else if (hasPoints) {
//         // Fallback: circle markers (still gives a "heat-ish" density feel)
//         const group = L.layerGroup(
//           safePoints.map((p) =>
//             L.circleMarker([p[0], p[1]], {
//               radius: 6,
//               weight: 1,
//               opacity: 0.7,
//               fillOpacity: 0.35,
//             })
//           )
//         );
//         group.addTo(map);
//         fallbackLayerRef.current = group;
//       }
//     };

//     initOrUpdate();

//     return () => {
//       disposed = true;
//     };
//   }, [points]);

//   // cleanup on unmount
//   useEffect(() => {
//     return () => {
//       const map = mapInstanceRef.current;
//       if (map) {
//         try {
//           map.remove();
//         } catch {}
//         mapInstanceRef.current = null;
//       }
//     };
//   }, []);

//   const usable = safeNumber(total) - safeNumber(missing);

//   return (
//     <Card className="shadow-sm bg-light h-100">
//       <Card.Body>
//         <h6 className="mb-2">{title}</h6>
//         <div className="d-flex flex-wrap gap-2 mb-2" style={{ fontSize: 12 }}>
//           <span className="text-muted">
//             Plotted: <strong>{usable}</strong> / {safeNumber(total)}
//           </span>
//           <span className="text-muted">
//             Missing coords: <strong>{safeNumber(missing)}</strong>
//           </span>
//           <span className="text-muted">
//             Tip: for true heat effect, install <strong>leaflet.heat</strong>.
//           </span>
//         </div>

//         <div
//           ref={mapRef}
//           style={{
//             width: "100%",
//             height: 320,
//             borderRadius: 10,
//             overflow: "hidden",
//             border: "1px solid rgba(0,0,0,0.08)",
//           }}
//         />
//       </Card.Body>
//     </Card>
//   );
// };

// // -----------------------------------------------------------------------------
// // Dashboard Component
// const Dashboard = () => {
//   const navigate = useNavigate();

//   // Top tiles
//   const [demolitionCount, setDemolitionCount] = useState(0);
//   const [sellCount, setSellCount] = useState(0);
//   const [orderCount, setOrderCount] = useState(0);

//   // Raw data
//   const [orders, setOrders] = useState([]);
//   const [sells, setSells] = useState([]);
//   const [demolitions, setDemolitions] = useState([]);
//   const [sales, setSales] = useState([]);
//   const [reviews, setReviews] = useState([]);

//   // Summary metrics
//   const [pendingOrders, setPendingOrders] = useState(0);
//   const [totalRevenue, setTotalRevenue] = useState(0);

//   // Location frequency per dataset (Sales removed)
//   const [freqOrders, setFreqOrders] = useState(buildLocationFrequency([]));
//   const [freqSells, setFreqSells] = useState(buildLocationFrequency([]));
//   const [freqDemolitions, setFreqDemolitions] = useState(buildLocationFrequency([]));

//   // Top 10 ordered items
//   const [topOrderedItems, setTopOrderedItems] = useState({
//     list: [],
//     totalQtyAll: 0,
//     maxQty: 0,
//   });

//   // NEW: Heatmap data (under Top 10 items)
//   const [heatTab, setHeatTab] = useState("all"); // all | orders | sells | demolitions
//   const [heatOrders, setHeatOrders] = useState({ points: [], missing: 0, total: 0 });
//   const [heatSells, setHeatSells] = useState({ points: [], missing: 0, total: 0 });
//   const [heatDemolitions, setHeatDemolitions] = useState({ points: [], missing: 0, total: 0 });

//   // User
//   const [currentUser, setCurrentUser] = useState({ username: "", email: "" });
//   const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

//   // Fetch current user
//   useEffect(() => {
//     if (!userId) return;
//     const token = localStorage.getItem("token");

//     axios
//       .get(`${API_URL}/api/users/${userId}`, {
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//       })
//       .then((res) => {
//         const data = res.data || {};
//         setCurrentUser({
//           username: data.username || "N/A",
//           email: data.email || "N/A",
//         });
//       })
//       .catch(() => {
//         setCurrentUser({ username: "N/A", email: "N/A" });
//       });
//   }, [userId]);

//   // Fetch dashboard data
//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     Promise.all([
//       axios.get(`${API_URL}/api/demolish`, {
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//       }),
//       axios.get(`${API_URL}/api/sell`, {
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//       }),
//       axios.get(`${API_URL}/api/orders`, {
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//       }),
//       // sales might not exist in some setups; keep dashboard resilient
//       axios
//         .get(`${API_URL}/api/sales`, {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         })
//         .catch(() => ({ data: [] })),
//       axios
//         .get(`${API_URL}/api/reviews`, {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         })
//         .catch(() => ({ data: [] })),
//     ])
//       .then(([demolishRes, sellRes, ordersRes, salesRes, reviewsRes]) => {
//         const demolish = demolishRes.data || [];
//         const sell = sellRes.data || [];
//         const fetchedOrders = ordersRes.data || [];
//         const fetchedSales = salesRes.data || [];
//         const fetchedReviews = reviewsRes.data || [];

//         setDemolitionCount(demolish.length);
//         setSellCount(sell.length);
//         setOrderCount(fetchedOrders.length);

//         setOrders(fetchedOrders);
//         setSells(sell);
//         setDemolitions(demolish);
//         setSales(fetchedSales);
//         setReviews(fetchedReviews);

//         let pending = 0;
//         let revenue = 0;

//         fetchedOrders.forEach((o) => {
//           if (String(o.status).toLowerCase().includes("pending")) pending++;
//           if (Array.isArray(o.items)) {
//             o.items.forEach((it) => {
//               revenue += safeNumber(it.price) * safeNumber(it.quantity);
//             });
//           } else {
//             revenue += safeNumber(o.total);
//           }
//         });

//         setPendingOrders(pending);
//         setTotalRevenue(revenue);

//         // Location frequency per dataset (Sales removed)
//         setFreqOrders(buildLocationFrequency(fetchedOrders));
//         setFreqSells(buildLocationFrequency(sell));
//         setFreqDemolitions(buildLocationFrequency(demolish));

//         // Top ordered items
//         setTopOrderedItems(buildTopOrderedItems(fetchedOrders));

//         // Heatmaps (uses actual lat/lng; if your Orders don't store coords, they'll show "missing coords")
//         setHeatOrders(buildHeatPoints(fetchedOrders));
//         setHeatSells(buildHeatPoints(sell));
//         setHeatDemolitions(buildHeatPoints(demolish));
//       })
//       .catch(() => {
//         setDemolitionCount(0);
//         setSellCount(0);
//         setOrderCount(0);
//         setOrders([]);
//         setSells([]);
//         setDemolitions([]);
//         setSales([]);
//         setReviews([]);
//         setPendingOrders(0);
//         setTotalRevenue(0);

//         setFreqOrders(buildLocationFrequency([]));
//         setFreqSells(buildLocationFrequency([]));
//         setFreqDemolitions(buildLocationFrequency([]));

//         setTopOrderedItems({
//           list: [],
//           totalQtyAll: 0,
//           maxQty: 0,
//         });

//         setHeatOrders({ points: [], missing: 0, total: 0 });
//         setHeatSells({ points: [], missing: 0, total: 0 });
//         setHeatDemolitions({ points: [], missing: 0, total: 0 });
//       });
//   }, []);

//   // Export CSV
//   const exportCSV = () => {
//     const headers = "Order ID,User Email,Status,Total Items,Total Amount,Created At\n";
//     const rows = orders
//       .map((o) => {
//         const totalItems = (o.items || []).reduce((s, i) => s + safeNumber(i.quantity), 0);
//         const totalAmount = (o.items || []).reduce((s, i) => s + safeNumber(i.price) * safeNumber(i.quantity), 0);
//         return `${o._id || ""},${o.userEmail || ""},${o.status || ""},${totalItems},${totalAmount},${o.createdAt || ""}`;
//       })
//       .join("\n");

//     const blob = new Blob([headers + rows], { type: "text/csv" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "dashboard-report.csv";
//     link.click();
//   };

//   // Export PDF
//   const exportPDF = () => {
//     const element = document.getElementById("dashboard-report-content");
//     html2pdf().from(element).save("dashboard-report.pdf");
//   };

//   const LocationFrequencyCard = ({ title, freq }) => {
//     const insights = buildInsights(freq);
//     const totalBase = freq?.totalWithLocation || 0;

//     return (
//       <Card className="shadow-sm bg-light h-100">
//         <Card.Body>
//           <h6 className="mb-3">{title}</h6>

//           {freq?.entries && freq.entries.length > 0 ? (
//             <div style={{ maxHeight: 220, overflowY: "auto", paddingRight: 6 }}>
//               {freq.entries.map(([location, count]) => {
//                 const pct = totalBase > 0 ? (safeNumber(count) / totalBase) * 100 : 0;
//                 return (
//                   <div key={location} style={{ marginBottom: 10 }}>
//                     <div className="d-flex justify-content-between" style={{ fontSize: 13 }}>
//                       <strong
//                         title={location}
//                         style={{
//                           maxWidth: "70%",
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         {location}
//                       </strong>
//                       <span className="text-muted">
//                         {count} ({pct.toFixed(1)}%)
//                       </span>
//                     </div>
//                     <ProgressBar now={pct} style={{ height: 10 }} />
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="text-muted" style={{ fontSize: 13 }}>
//               No location data available.
//             </div>
//           )}

//           {/* Insights */}
//           <div className="mt-3 pt-2 border-top">
//             <div className="text-muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
//               Insights
//             </div>
//             <ul className="mb-0" style={{ fontSize: 12, paddingLeft: 18 }}>
//               {insights.map((t, i) => (
//                 <li key={i} style={{ marginBottom: 4 }}>
//                   {t}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </Card.Body>
//       </Card>
//     );
//   };

//   // Top Ordered Items Card (GREEN)
//   const TopOrderedItemsCard = ({ data }) => {
//     const list = data?.list || [];
//     const totalQtyAll = safeNumber(data?.totalQtyAll);
//     const maxQty = safeNumber(data?.maxQty);

//     const insights = [];
//     if (list.length > 0) {
//       const top = list[0];
//       const pctAll = totalQtyAll > 0 ? (safeNumber(top.qty) / totalQtyAll) * 100 : 0;
//       insights.push(`Top item: ${top.name} (${top.qty} qty, ${pctAll.toFixed(1)}% of all ordered qty).`);

//       const top3 = list.slice(0, 3).reduce((s, x) => s + safeNumber(x.qty), 0);
//       const pctTop3 = totalQtyAll > 0 ? (top3 / totalQtyAll) * 100 : 0;
//       insights.push(`Top 3 items account for ${pctTop3.toFixed(1)}% of all ordered qty.`);
//     } else {
//       insights.push("No order item data found yet.");
//     }

//     return (
//       <Card className="shadow-sm bg-light h-100">
//         <Card.Body>
//           <h6 className="mb-3">Top 10 Ordered Items</h6>

//           {list.length > 0 ? (
//             <div style={{ maxHeight: 280, overflowY: "auto", paddingRight: 6 }}>
//               {list.map((it) => {
//                 const qty = safeNumber(it.qty);
//                 const pctAll = totalQtyAll > 0 ? (qty / totalQtyAll) * 100 : 0;

//                 // Use max-based bar for nicer visual comparison
//                 const pctBar = maxQty > 0 ? (qty / maxQty) * 100 : 0;

//                 return (
//                   <div key={it.key} style={{ marginBottom: 12 }}>
//                     <div className="d-flex justify-content-between" style={{ fontSize: 13 }}>
//                       <strong
//                         title={it.name}
//                         style={{
//                           maxWidth: "68%",
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         {it.name}
//                       </strong>
//                       <span className="text-muted" style={{ textAlign: "right" }}>
//                         {qty} qty ({pctAll.toFixed(1)}%)
//                       </span>
//                     </div>

//                     {/* GREEN BAR */}
//                     <ProgressBar variant="success" now={pctBar} style={{ height: 10 }} />

//                     <div className="d-flex justify-content-between mt-1" style={{ fontSize: 12 }}>
//                       <span className="text-muted">Orders: {safeNumber(it.ordersCount)}</span>
//                       <span className="text-muted">Revenue: {CURRENCY(it.revenue)}</span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="text-muted" style={{ fontSize: 13 }}>
//               No ordered items available.
//             </div>
//           )}

//           {/* Insights */}
//           <div className="mt-3 pt-2 border-top">
//             <div className="text-muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
//               Insights
//             </div>
//             <ul className="mb-0" style={{ fontSize: 12, paddingLeft: 18 }}>
//               {insights.map((t, i) => (
//                 <li key={i} style={{ marginBottom: 4 }}>
//                   {t}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </Card.Body>
//       </Card>
//     );
//   };

//   // Heatmap selection
//   const combinedHeat = (() => {
//     const allPoints = []
//       .concat(heatOrders.points || [])
//       .concat(heatSells.points || [])
//       .concat(heatDemolitions.points || []);

//     const total = safeNumber(heatOrders.total) + safeNumber(heatSells.total) + safeNumber(heatDemolitions.total);
//     const missing = safeNumber(heatOrders.missing) + safeNumber(heatSells.missing) + safeNumber(heatDemolitions.missing);

//     return { points: allPoints, total, missing };
//   })();

//   const currentHeat = (() => {
//     if (heatTab === "orders") return { title: "Orders Heatmap", ...heatOrders };
//     if (heatTab === "sells") return { title: "Sell Requests Heatmap", ...heatSells };
//     if (heatTab === "demolitions") return { title: "Demolition Requests Heatmap", ...heatDemolitions };
//     return { title: "All Requests Heatmap", ...combinedHeat };
//   })();

//   return (
//     <Container className="mt-4 p-3 bg-white border-bottom shadow-sm" id="dashboard-report-content">
//       {/* Top Tiles */}
//       <Row className="g-4 row-cols-1 row-cols-md-3 mb-3">
//         <Col>
//           <Button
//             className="w-100 p-4 d-flex flex-column align-items-center border-0"
//             onClick={() => navigate("/admin/demolishDashboard")}
//             style={{ backgroundColor: "#f8f9fa" }}
//           >
//             <BuildingFillX size={40} className="mb-2 text-danger" />
//             <h5 className="text-dark">Demolition Requests</h5>
//             <div className="fs-3 fw-bold text-secondary">{demolitionCount}</div>
//           </Button>
//         </Col>

//         <Col>
//           <Button
//             className="w-100 p-4 d-flex flex-column align-items-center border-0"
//             onClick={() => navigate("/admin/sellDashboard")}
//             style={{ backgroundColor: "#f8f9fa" }}
//           >
//             <HouseFill size={40} className="mb-2 text-primary" />
//             <h5 className="text-dark">Sell Requests</h5>
//             <div className="fs-3 fw-bold text-secondary">{sellCount}</div>
//           </Button>
//         </Col>

//         <Col>
//           <Button
//             className="w-100 p-4 d-flex flex-column align-items-center border-0"
//             onClick={() => navigate("/admin/orders")}
//             style={{ backgroundColor: "#f8f9fa" }}
//           >
//             <CartFill size={40} className="mb-2 text-success" />
//             <h5 className="text-dark">Orders</h5>
//             <div className="fs-3 fw-bold text-secondary">{orderCount}</div>
//           </Button>
//         </Col>
//       </Row>

//       {/* Summary */}
//       <Row className="mb-4">
//         <Col md={4}>
//           <Card className="shadow-sm bg-light h-100">
//             <Card.Body>
//               <h6>Pending Orders</h6>
//               <h3 className="text-success">{pendingOrders}</h3>
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col md={4}>
//           <Card className="shadow-sm bg-light h-100">
//             <Card.Body>
//               <h6>Total Revenue</h6>
//               <h3 className="text-primary">{CURRENCY(totalRevenue)}</h3>
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col md={4}>
//           <Card className="shadow-sm bg-light h-100">
//             <Card.Body>
//               <Button size="sm" onClick={exportCSV}>
//                 Download CSV
//               </Button>{" "}
//               <Button size="sm" onClick={exportPDF}>
//                 Download PDF
//               </Button>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <KPISummary orders={orders} sells={sells} demolitions={demolitions} />

//       <Row className="mt-4 mb-4">
//         <Col md={12}>
//           <h5 style={{ fontWeight: "600", marginBottom: "16px" }}>Reviews Analytics</h5>
//         </Col>
//         <Col md={6}>
//           <ReviewsAnalytics1 reviews={reviews} />
//         </Col>
//         <Col md={6}>
//           <ReviewsAnalytics3 reviews={reviews} />
//         </Col>
//       </Row>

//       {/* Location Frequency (Sales removed) - placed below Reviews Analytics */}
//       <Row className="mb-4">
//         <Col md={12}>
//           <h5 style={{ fontWeight: "600", marginBottom: "16px" }}>Location Frequency</h5>
//         </Col>

//         <Col md={4} className="mb-3">
//           <LocationFrequencyCard title="Orders" freq={freqOrders} />
//         </Col>

//         <Col md={4} className="mb-3">
//           <LocationFrequencyCard title="Sell Requests" freq={freqSells} />
//         </Col>

//         <Col md={4} className="mb-3">
//           <LocationFrequencyCard title="Demolition Requests" freq={freqDemolitions} />
//         </Col>
//       </Row>

//       {/* Top 10 Ordered Items - NOW BELOW Location Frequency */}
//       <Row className="mb-4">
//         <Col md={12}>
//           <TopOrderedItemsCard data={topOrderedItems} />
//         </Col>
//       </Row>

//       {/* NEW: Heatmaps (placed under Top 10 items) */}
//       <Row className="mb-4">
//         <Col md={12} className="mb-2">
//           <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
//             <h5 style={{ fontWeight: "600", marginBottom: 0 }}>Heatmaps</h5>

//             <div className="d-flex gap-2 flex-wrap">
//               <Button
//                 size="sm"
//                 variant={heatTab === "all" ? "dark" : "outline-dark"}
//                 onClick={() => setHeatTab("all")}
//               >
//                 All
//               </Button>
//               <Button
//                 size="sm"
//                 variant={heatTab === "orders" ? "primary" : "outline-primary"}
//                 onClick={() => setHeatTab("orders")}
//               >
//                 Orders
//               </Button>
//               <Button
//                 size="sm"
//                 variant={heatTab === "sells" ? "success" : "outline-success"}
//                 onClick={() => setHeatTab("sells")}
//               >
//                 Sell
//               </Button>
//               <Button
//                 size="sm"
//                 variant={heatTab === "demolitions" ? "danger" : "outline-danger"}
//                 onClick={() => setHeatTab("demolitions")}
//               >
//                 Demolish
//               </Button>
//             </div>
//           </div>
//         </Col>

//         <Col md={12}>
//           <HeatmapCard
//             title={currentHeat.title}
//             points={currentHeat.points}
//             missing={currentHeat.missing}
//             total={currentHeat.total}
//           />
//         </Col>
//       </Row>

//       <small className="text-muted">
//         Signed in as: <strong>{currentUser.email}</strong>
//       </small>
//     </Container>
//   );
// };

// export default Dashboard;

// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Card, ProgressBar } from "react-bootstrap";
import { BuildingFillX, HouseFill, CartFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import "bootstrap/dist/css/bootstrap.min.css";

// NEW: Leaflet for heat map (no extra plugin required)
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// KPI Summary
import KPISummary from "../Dashboard/Analytics/KPISummary";
import ReviewsAnalytics1 from "../Dashboard/Analytics/Reviews/ReviewsAnalytics1";
import ReviewsAnalytics3 from "../Dashboard/Analytics/Reviews/ReviewsAnalytics3";

const API_URL = process.env.REACT_APP_API_URL || "";

const CURRENCY = (n) =>
  `₱${(Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// -----------------------------------------------------------------------------
// Helpers
function safeNumber(v) {
  return Number.isFinite(Number(v)) ? Number(v) : 0;
}

// Try to pull a reasonable "location" string from different record shapes
function extractLocation(record) {
  if (!record || typeof record !== "object") return "";

  const pick = (v) => {
    if (!v) return "";
    if (typeof v === "string") return v.trim();
    if (typeof v === "object") {
      const nested =
        v.fullAddress ||
        v.address ||
        v.addressLine ||
        v.address1 ||
        v.location ||
        v.label ||
        v.formattedAddress;
      if (typeof nested === "string") return nested.trim();

      // Some APIs store address fields as pieces
      const maybeParts = [v.street, v.barangay, v.city, v.province, v.region, v.zip]
        .filter(Boolean)
        .map(String);
      if (maybeParts.length) return maybeParts.join(", ").trim();

      try {
        const s = JSON.stringify(v);
        return s && s !== "{}" ? s : "";
      } catch {
        return "";
      }
    }
    return String(v).trim();
  };

  // common fields across orders/sell/demolish/sales
  return (
    pick(record.address) ||
    pick(record.location) ||
    pick(record.deliveryAddress) ||
    pick(record.shippingAddress) ||
    pick(record.pickupAddress) ||
    pick(record.siteAddress) ||
    pick(record.mapAddress) ||
    pick(record.fullAddress) ||
    pick(record.formattedAddress) ||
    // nested order object (often in sales)
    (record.order &&
      (pick(record.order.address) ||
        pick(record.order.deliveryAddress) ||
        pick(record.order.shippingAddress))) ||
    ""
  );
}

function buildLocationFrequency(records = []) {
  const freq = {};
  let missing = 0;

  (records || []).forEach((r) => {
    const loc = (extractLocation(r) || "").trim();
    if (!loc) {
      missing += 1;
      return;
    }
    freq[loc] = (freq[loc] || 0) + 1;
  });

  const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const totalWithLocation = entries.reduce((sum, [, c]) => sum + safeNumber(c), 0);
  const totalRecords = (records || []).length;

  return {
    entries, // [ [location, count], ... ] sorted desc
    totalWithLocation,
    totalRecords,
    missing,
    uniqueLocations: entries.length,
  };
}

function buildInsights(freqObj) {
  const { entries, totalWithLocation, totalRecords, missing, uniqueLocations } = freqObj || {};
  const list = [];

  const top = entries && entries.length ? entries[0] : null;
  if (top && totalWithLocation > 0) {
    const pct = (safeNumber(top[1]) / totalWithLocation) * 100;
    list.push(
      `Top location: ${top[0]} (${top[1]} record${top[1] > 1 ? "s" : ""}, ${pct.toFixed(1)}%).`
    );
  }

  if (entries && entries.length >= 3 && totalWithLocation > 0) {
    const top3 = safeNumber(entries[0][1]) + safeNumber(entries[1][1]) + safeNumber(entries[2][1]);
    const pct3 = (top3 / totalWithLocation) * 100;
    list.push(`Top 3 locations account for ${pct3.toFixed(1)}% of records with a location.`);
  } else if (entries && entries.length > 0 && totalWithLocation > 0) {
    list.push(`This dataset has ${uniqueLocations} unique location${uniqueLocations === 1 ? "" : "s"}.`);
  } else {
    list.push("No location information found yet.");
  }

  if (typeof missing === "number" && totalRecords > 0) {
    const missPct = (missing / totalRecords) * 100;
    if (missing > 0) list.push(`Missing location on ${missing} of ${totalRecords} record(s) (${missPct.toFixed(1)}%).`);
  }

  return list;
}

// -----------------------------------------------------------------------------
// Top 10 Ordered Items
function extractItemLabel(it) {
  if (!it || typeof it !== "object") return "Unknown Item";
  return (
    it.name ||
    it.title ||
    it.itemName ||
    (it.item && (it.item.name || it.item.title)) ||
    (it.product && (it.product.name || it.product.title)) ||
    "Unknown Item"
  );
}

function extractItemKey(it) {
  if (!it || typeof it !== "object") return extractItemLabel(it);
  return (
    it.itemId ||
    it.productId ||
    it._id ||
    it.id ||
    (it.item && (it.item._id || it.item.id)) ||
    (it.product && (it.product._id || it.product.id)) ||
    extractItemLabel(it)
  );
}

function buildTopOrderedItems(orders = []) {
  const map = {};
  let totalQtyAll = 0;

  (orders || []).forEach((o) => {
    const items = Array.isArray(o.items) ? o.items : [];
    items.forEach((it) => {
      const key = String(extractItemKey(it) || "").trim() || "unknown";
      const label = extractItemLabel(it);

      const qty = safeNumber(it.quantity);
      const price = safeNumber(it.price);

      totalQtyAll += qty;

      if (!map[key]) {
        map[key] = {
          key,
          name: label,
          qty: 0,
          revenue: 0,
          ordersCount: 0,
        };
      }

      map[key].qty += qty;
      map[key].revenue += price * qty;
      map[key].ordersCount += 1;
    });
  });

  const list = Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 10);
  const maxQty = list.reduce((m, x) => Math.max(m, safeNumber(x.qty)), 0);

  return {
    list,
    totalQtyAll,
    maxQty,
  };
}

// -----------------------------------------------------------------------------
// Heatmap helpers (Leaflet circles + 3-color intensity)
function extractLatLng(record) {
  if (!record || typeof record !== "object") return null;

  // Common: { location: { lat, lng } }
  const loc = record.location;
  if (loc && typeof loc === "object" && loc.lat != null && loc.lng != null) {
    const lat = Number(loc.lat);
    const lng = Number(loc.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  // Sometimes nested under address/map objects
  const candidates = [
    record.map,
    record.geo,
    record.coords,
    record.coordinate,
    record.coordinates,
    record.deliveryAddress,
    record.shippingAddress,
    record.address,
    record.siteAddress,
    record.pickupAddress,
  ];

  for (const c of candidates) {
    if (!c || typeof c !== "object") continue;

    // { lat, lng }
    if (c.lat != null && c.lng != null) {
      const lat = Number(c.lat);
      const lng = Number(c.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    // GeoJSON-ish: { coordinates: [lng, lat] }
    if (Array.isArray(c.coordinates) && c.coordinates.length >= 2) {
      const lng = Number(c.coordinates[0]);
      const lat = Number(c.coordinates[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
  }

  return null;
}

function buildHeatBins(records = [], precision = 3) {
  const bins = new Map(); // key -> { lat, lng, count }
  let totalPoints = 0;

  (records || []).forEach((r) => {
    const ll = extractLatLng(r);
    if (!ll) return;

    const lat = Number(ll.lat);
    const lng = Number(ll.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const kLat = Number(lat.toFixed(precision));
    const kLng = Number(lng.toFixed(precision));
    const key = `${kLat},${kLng}`;

    totalPoints += 1;

    if (!bins.has(key)) bins.set(key, { lat: kLat, lng: kLng, count: 0 });
    bins.get(key).count += 1;
  });

  const list = Array.from(bins.values()).sort((a, b) => b.count - a.count);
  const maxCount = list.reduce((m, x) => Math.max(m, safeNumber(x.count)), 0);

  return { list, maxCount, totalPoints, uniqueBins: list.length };
}

function intensityColor(ratio01) {
  // 3-color ramp: yellow (low) -> orange (mid) -> red (high)
  if (ratio01 >= 0.67) return "#ff0000"; // red
  if (ratio01 >= 0.34) return "#ff8c00"; // orange
  return "#ffd700"; // yellow
}

// -----------------------------------------------------------------------------
// Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();

  // Top tiles
  const [demolitionCount, setDemolitionCount] = useState(0);
  const [sellCount, setSellCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  // Raw data
  const [orders, setOrders] = useState([]);
  const [sells, setSells] = useState([]);
  const [demolitions, setDemolitions] = useState([]);
  const [sales, setSales] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Summary metrics
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Location frequency per dataset (Sales removed)
  const [freqOrders, setFreqOrders] = useState(buildLocationFrequency([]));
  const [freqSells, setFreqSells] = useState(buildLocationFrequency([]));
  const [freqDemolitions, setFreqDemolitions] = useState(buildLocationFrequency([]));

  // Top 10 ordered items
  const [topOrderedItems, setTopOrderedItems] = useState({
    list: [],
    totalQtyAll: 0,
    maxQty: 0,
  });

  // Heatmap tab (below Top 10)
  const [heatTab, setHeatTab] = useState("sell"); // "orders" | "sell" | "demolish"

  // User
  const [currentUser, setCurrentUser] = useState({ username: "", email: "" });
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Fetch current user
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");

    axios
      .get(`${API_URL}/api/users/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        const data = res.data || {};
        setCurrentUser({
          username: data.username || "N/A",
          email: data.email || "N/A",
        });
      })
      .catch(() => {
        setCurrentUser({ username: "N/A", email: "N/A" });
      });
  }, [userId]);

  // Fetch dashboard data
  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      axios.get(`${API_URL}/api/demolish`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      axios.get(`${API_URL}/api/sell`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      axios.get(`${API_URL}/api/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      // sales might not exist in some setups; keep dashboard resilient
      axios
        .get(`${API_URL}/api/sales`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        .catch(() => ({ data: [] })),
      axios
        .get(`${API_URL}/api/reviews`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        .catch(() => ({ data: [] })),
    ])
      .then(([demolishRes, sellRes, ordersRes, salesRes, reviewsRes]) => {
        const demolish = demolishRes.data || [];
        const sell = sellRes.data || [];
        const fetchedOrders = ordersRes.data || [];
        const fetchedSales = salesRes.data || [];
        const fetchedReviews = reviewsRes.data || [];

        setDemolitionCount(demolish.length);
        setSellCount(sell.length);
        setOrderCount(fetchedOrders.length);

        setOrders(fetchedOrders);
        setSells(sell);
        setDemolitions(demolish);
        setSales(fetchedSales);
        setReviews(fetchedReviews);

        let pending = 0;
        let revenue = 0;

        fetchedOrders.forEach((o) => {
          if (String(o.status).toLowerCase().includes("pending")) pending++;
          if (Array.isArray(o.items)) {
            o.items.forEach((it) => {
              revenue += safeNumber(it.price) * safeNumber(it.quantity);
            });
          } else {
            revenue += safeNumber(o.total);
          }
        });

        setPendingOrders(pending);
        setTotalRevenue(revenue);

        // Location frequency per dataset (Sales removed)
        setFreqOrders(buildLocationFrequency(fetchedOrders));
        setFreqSells(buildLocationFrequency(sell));
        setFreqDemolitions(buildLocationFrequency(demolish));

        // Top ordered items
        setTopOrderedItems(buildTopOrderedItems(fetchedOrders));
      })
      .catch(() => {
        setDemolitionCount(0);
        setSellCount(0);
        setOrderCount(0);
        setOrders([]);
        setSells([]);
        setDemolitions([]);
        setSales([]);
        setReviews([]);
        setPendingOrders(0);
        setTotalRevenue(0);

        setFreqOrders(buildLocationFrequency([]));
        setFreqSells(buildLocationFrequency([]));
        setFreqDemolitions(buildLocationFrequency([]));

        setTopOrderedItems({
          list: [],
          totalQtyAll: 0,
          maxQty: 0,
        });
      });
  }, []);

  // Export CSV
  const exportCSV = () => {
    const headers = "Order ID,User Email,Status,Total Items,Total Amount,Created At\n";
    const rows = orders
      .map((o) => {
        const totalItems = (o.items || []).reduce((s, i) => s + safeNumber(i.quantity), 0);
        const totalAmount = (o.items || []).reduce(
          (s, i) => s + safeNumber(i.price) * safeNumber(i.quantity),
          0
        );
        return `${o._id || ""},${o.userEmail || ""},${o.status || ""},${totalItems},${totalAmount},${o.createdAt || ""}`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "dashboard-report.csv";
    link.click();
  };

  // Export PDF
  const exportPDF = () => {
    const element = document.getElementById("dashboard-report-content");
    html2pdf().from(element).save("dashboard-report.pdf");
  };

  const LocationFrequencyCard = ({ title, freq }) => {
    const insights = buildInsights(freq);
    const totalBase = freq?.totalWithLocation || 0;

    return (
      <Card className="shadow-sm bg-light h-100">
        <Card.Body>
          <h6 className="mb-3">{title}</h6>

          {freq?.entries && freq.entries.length > 0 ? (
            <div style={{ maxHeight: 220, overflowY: "auto", paddingRight: 6 }}>
              {freq.entries.map(([location, count]) => {
                const pct = totalBase > 0 ? (safeNumber(count) / totalBase) * 100 : 0;
                return (
                  <div key={location} style={{ marginBottom: 10 }}>
                    <div className="d-flex justify-content-between" style={{ fontSize: 13 }}>
                      <strong
                        title={location}
                        style={{
                          maxWidth: "70%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {location}
                      </strong>
                      <span className="text-muted">
                        {count} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <ProgressBar now={pct} style={{ height: 10 }} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted" style={{ fontSize: 13 }}>
              No location data available.
            </div>
          )}

          {/* Insights */}
          <div className="mt-3 pt-2 border-top">
            <div className="text-muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              Insights
            </div>
            <ul className="mb-0" style={{ fontSize: 12, paddingLeft: 18 }}>
              {insights.map((t, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Top Ordered Items Card (GREEN)
  const TopOrderedItemsCard = ({ data }) => {
    const list = data?.list || [];
    const totalQtyAll = safeNumber(data?.totalQtyAll);
    const maxQty = safeNumber(data?.maxQty);

    const insights = [];
    if (list.length > 0) {
      const top = list[0];
      const pctAll = totalQtyAll > 0 ? (safeNumber(top.qty) / totalQtyAll) * 100 : 0;
      insights.push(`Top item: ${top.name} (${top.qty} qty, ${pctAll.toFixed(1)}% of all ordered qty).`);

      const top3 = list.slice(0, 3).reduce((s, x) => s + safeNumber(x.qty), 0);
      const pctTop3 = totalQtyAll > 0 ? (top3 / totalQtyAll) * 100 : 0;
      insights.push(`Top 3 items account for ${pctTop3.toFixed(1)}% of all ordered qty.`);
    } else {
      insights.push("No order item data found yet.");
    }

    return (
      <Card className="shadow-sm bg-light h-100">
        <Card.Body>
          <h6 className="mb-3">Top 10 Ordered Items</h6>

          {list.length > 0 ? (
            <div style={{ maxHeight: 280, overflowY: "auto", paddingRight: 6 }}>
              {list.map((it) => {
                const qty = safeNumber(it.qty);
                const pctAll = totalQtyAll > 0 ? (qty / totalQtyAll) * 100 : 0;
                const pctBar = maxQty > 0 ? (qty / maxQty) * 100 : 0;

                return (
                  <div key={it.key} style={{ marginBottom: 12 }}>
                    <div className="d-flex justify-content-between" style={{ fontSize: 13 }}>
                      <strong
                        title={it.name}
                        style={{
                          maxWidth: "68%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {it.name}
                      </strong>
                      <span className="text-muted" style={{ textAlign: "right" }}>
                        {qty} qty ({pctAll.toFixed(1)}%)
                      </span>
                    </div>

                    {/* GREEN BAR */}
                    <ProgressBar variant="success" now={pctBar} style={{ height: 10 }} />

                    <div className="d-flex justify-content-between mt-1" style={{ fontSize: 12 }}>
                      <span className="text-muted">Orders: {safeNumber(it.ordersCount)}</span>
                      <span className="text-muted">Revenue: {CURRENCY(it.revenue)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted" style={{ fontSize: 13 }}>
              No ordered items available.
            </div>
          )}

          {/* Insights */}
          <div className="mt-3 pt-2 border-top">
            <div className="text-muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              Insights
            </div>
            <ul className="mb-0" style={{ fontSize: 12, paddingLeft: 18 }}>
              {insights.map((t, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // ---------------------------------------------------------------------------
  // Heat Map Card (Region IV-A only, 3 colors: Yellow -> Orange -> Red)
  const HeatMapCard = ({ title, records }) => {
    const mapElRef = useRef(null);
    const mapRef = useRef(null);
    const layerRef = useRef(null);
    const legendRef = useRef(null);

    // Region IV-A (CALABARZON) bounding box (approx) – restrict map within this region
    // You can tighten these later if you want stricter bounds.
    const REGION_IVA_BOUNDS = L.latLngBounds(
      L.latLng(12.70, 120.40), // SW
      L.latLng(15.90, 122.80)  // NE
    );

    const { list: bins, maxCount, totalPoints, uniqueBins } = buildHeatBins(records, 3);

    useEffect(() => {
      if (!mapElRef.current) return;

      // init once
      if (!mapRef.current) {
        const m = L.map(mapElRef.current, {
          center: [14.20, 121.40],
          zoom: 8,
          minZoom: 7,
          maxZoom: 16,
          zoomControl: true,
          scrollWheelZoom: true,
          maxBounds: REGION_IVA_BOUNDS,
          maxBoundsViscosity: 1.0,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(m);

        // layer group for circles
        const g = L.layerGroup().addTo(m);

        // legend
        const Legend = L.Control.extend({
          options: { position: "bottomright" },
          onAdd: function () {
            const div = L.DomUtil.create("div", "heatmap-legend");
            div.style.background = "rgba(255,255,255,0.92)";
            div.style.padding = "10px 10px";
            div.style.borderRadius = "10px";
            div.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
            div.style.fontSize = "12px";
            div.style.lineHeight = "1.2";
            div.innerHTML = `
              <div style="font-weight:700; margin-bottom:6px;">Intensity</div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span style="display:inline-block; width:14px; height:14px; background:#ffd700; border:1px solid rgba(0,0,0,0.2); border-radius:3px;"></span>
                <span>Low</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span style="display:inline-block; width:14px; height:14px; background:#ff8c00; border:1px solid rgba(0,0,0,0.2); border-radius:3px;"></span>
                <span>Medium</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:14px; height:14px; background:#ff0000; border:1px solid rgba(0,0,0,0.2); border-radius:3px;"></span>
                <span>High</span>
              </div>
            `;
            legendRef.current = div;
            return div;
          },
        });

        const legend = new Legend();
        legend.addTo(m);

        mapRef.current = m;
        layerRef.current = g;

        // Ensure proper sizing after mount
        setTimeout(() => {
          try {
            m.invalidateSize();
            m.fitBounds(REGION_IVA_BOUNDS);
          } catch {}
        }, 0);
      }

      return () => {
        // Keep map instance (don’t destroy) to avoid re-init flicker
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // update points whenever records change
    useEffect(() => {
      const m = mapRef.current;
      const g = layerRef.current;
      if (!m || !g) return;

      g.clearLayers();

      // Draw "heat" circles (aggregated bins)
      if (bins.length > 0 && maxCount > 0) {
        bins.forEach((p) => {
          const ratio = safeNumber(p.count) / maxCount; // 0..1
          const color = intensityColor(ratio);

          // radius in meters: bigger for higher intensity
          const radius = 700 + ratio * 1800; // 700m .. 2500m

          const circle = L.circle([p.lat, p.lng], {
            radius,
            color,
            fillColor: color,
            weight: 0,
            fillOpacity: 0.22 + ratio * 0.25, // 0.22 .. 0.47
          });

          circle.bindTooltip(
            `<div style="font-size:12px;"><strong>${p.count}</strong> record${p.count > 1 ? "s" : ""}</div>`,
            { sticky: true }
          );

          circle.addTo(g);
        });

        // Keep map constrained to Region IV-A; also try to zoom to points but clamp inside region
        try {
          const ptsBounds = L.latLngBounds(bins.map((p) => [p.lat, p.lng]));
          const clamped = ptsBounds.isValid() ? ptsBounds.pad(0.15) : REGION_IVA_BOUNDS;
          m.fitBounds(REGION_IVA_BOUNDS); // always keep region framing
          // If you want to zoom closer when points exist, uncomment:
          // m.fitBounds(clamped, { maxZoom: 12 });
        } catch {
          // ignore
        }
      } else {
        // No points: just show the region bounds
        try {
          m.fitBounds(REGION_IVA_BOUNDS);
        } catch {}
      }
    }, [records, bins, maxCount]);

    return (
      <Card className="shadow-sm bg-light h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <h6 className="mb-0">{title}</h6>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Points: <strong>{safeNumber(totalPoints)}</strong> &nbsp;|&nbsp; Clusters:{" "}
              <strong>{safeNumber(uniqueBins)}</strong>
            </div>
          </div>

          <div className="text-muted mt-1" style={{ fontSize: 12 }}>
            Map is restricted to Region IV-A (CALABARZON). Colors: Yellow (low) → Orange → Red (high).
          </div>

          <div
            ref={mapElRef}
            style={{
              marginTop: 10,
              height: 360,
              width: "100%",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          />
        </Card.Body>
      </Card>
    );
  };

  // pick dataset for heat map
  const heatRecords =
    heatTab === "orders" ? orders : heatTab === "demolish" ? demolitions : sells;

  const heatTitle =
    heatTab === "orders"
      ? "Heat Map: Orders (Region IV-A)"
      : heatTab === "demolish"
      ? "Heat Map: Demolition Requests (Region IV-A)"
      : "Heat Map: Sell Requests (Region IV-A)";

  return (
    <Container className="mt-4 p-3 bg-white border-bottom shadow-sm" id="dashboard-report-content">
      {/* Top Tiles */}
      <Row className="g-4 row-cols-1 row-cols-md-3 mb-3">
        <Col>
          <Button
            className="w-100 p-4 d-flex flex-column align-items-center border-0"
            onClick={() => navigate("/admin/demolishDashboard")}
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <BuildingFillX size={40} className="mb-2 text-danger" />
            <h5 className="text-dark">Demolition Requests</h5>
            <div className="fs-3 fw-bold text-secondary">{demolitionCount}</div>
          </Button>
        </Col>

        <Col>
          <Button
            className="w-100 p-4 d-flex flex-column align-items-center border-0"
            onClick={() => navigate("/admin/sellDashboard")}
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <HouseFill size={40} className="mb-2 text-primary" />
            <h5 className="text-dark">Sell Requests</h5>
            <div className="fs-3 fw-bold text-secondary">{sellCount}</div>
          </Button>
        </Col>

        <Col>
          <Button
            className="w-100 p-4 d-flex flex-column align-items-center border-0"
            onClick={() => navigate("/admin/orders")}
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <CartFill size={40} className="mb-2 text-success" />
            <h5 className="text-dark">Orders</h5>
            <div className="fs-3 fw-bold text-secondary">{orderCount}</div>
          </Button>
        </Col>
      </Row>

      {/* Summary */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm bg-light h-100">
            <Card.Body>
              <h6>Pending Orders</h6>
              <h3 className="text-success">{pendingOrders}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm bg-light h-100">
            <Card.Body>
              <h6>Total Revenue</h6>
              <h3 className="text-primary">{CURRENCY(totalRevenue)}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm bg-light h-100">
            <Card.Body>
              <Button size="sm" onClick={exportCSV}>
                Download CSV
              </Button>{" "}
              <Button size="sm" onClick={exportPDF}>
                Download PDF
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <KPISummary orders={orders} sells={sells} demolitions={demolitions} />

      <Row className="mt-4 mb-4">
        <Col md={12}>
          <h5 style={{ fontWeight: "600", marginBottom: "16px" }}>Reviews Analytics</h5>
        </Col>
        <Col md={6}>
          <ReviewsAnalytics1 reviews={reviews} />
        </Col>
        <Col md={6}>
          <ReviewsAnalytics3 reviews={reviews} />
        </Col>
      </Row>

      {/* Location Frequency (Sales removed) - placed below Reviews Analytics */}
      <Row className="mb-4">
        <Col md={12}>
          <h5 style={{ fontWeight: "600", marginBottom: "16px" }}>Location Frequency</h5>
        </Col>

        <Col md={4} className="mb-3">
          <LocationFrequencyCard title="Orders" freq={freqOrders} />
        </Col>

        <Col md={4} className="mb-3">
          <LocationFrequencyCard title="Sell Requests" freq={freqSells} />
        </Col>

        <Col md={4} className="mb-3">
          <LocationFrequencyCard title="Demolition Requests" freq={freqDemolitions} />
        </Col>
      </Row>

      {/* Top 10 Ordered Items - NOW BELOW Location Frequency */}
      <Row className="mb-4">
        <Col md={12}>
          <TopOrderedItemsCard data={topOrderedItems} />
        </Col>
      </Row>

      {/* HEAT MAPS - placed under Top 10 items */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm bg-light">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 style={{ fontWeight: "600", marginBottom: 0 }}>Heat Maps</h5>
                <div className="d-flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={heatTab === "orders" ? "danger" : "outline-danger"}
                    onClick={() => setHeatTab("orders")}
                  >
                    Orders
                  </Button>
                  <Button
                    size="sm"
                    variant={heatTab === "sell" ? "warning" : "outline-warning"}
                    onClick={() => setHeatTab("sell")}
                  >
                    Sell
                  </Button>
                  <Button
                    size="sm"
                    variant={heatTab === "demolish" ? "dark" : "outline-dark"}
                    onClick={() => setHeatTab("demolish")}
                  >
                    Demolish
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <HeatMapCard title={heatTitle} records={heatRecords} />
              </div>

              <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                Tip: If some datasets don’t show points, it usually means those records don’t have <code>lat/lng</code>{" "}
                stored (only text addresses).
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <small className="text-muted">
        Signed in as: <strong>{currentUser.email}</strong>
      </small>
    </Container>
  );
};

export default Dashboard;
