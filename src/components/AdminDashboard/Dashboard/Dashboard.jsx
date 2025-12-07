
// // src/pages/Dashboard.jsx
// import React, { useState, useEffect, useMemo } from "react";
// import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
// import { BuildingFillX, HouseFill, CartFill } from "react-bootstrap-icons";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import html2pdf from "html2pdf.js";
// import "bootstrap/dist/css/bootstrap.min.css";

// import SellAnalytics1 from "../Dashboard/Analytics/Sell/SellAnalytics1";
// import SellAnalytics2 from "../Dashboard/Analytics/Sell/SellAnalytics2";
// import SellAnalytics3 from "../Dashboard/Analytics/Sell/SellAnalytics3";
// import SellAnalytics4 from "../Dashboard/Analytics/Sell/SellAnalytics4";
// import SellAnalytics5 from "../Dashboard/Analytics/Sell/SellAnalytics5";

// import DemolishAnalytics1 from "../Dashboard/Analytics/Demolish/DemolishAnalytics1";
// import DemolishAnalytics2 from "../Dashboard/Analytics/Demolish/DemolishAnalytics2";
// import DemolishAnalytics3 from "../Dashboard/Analytics/Demolish/DemolishAnalytics3";
// import DemolishAnalytics4 from "../Dashboard/Analytics/Demolish/DemolishAnalytics4";
// import DemolishAnalytics5 from "../Dashboard/Analytics/Demolish/DemolishAnalytics5";

// import OrderAnalytics1 from "../Dashboard/Analytics/Order/OrderAnalytics1";
// import OrderAnalytics2 from "../Dashboard/Analytics/Order/OrderAnalytics2";
// import OrderAnalytics3 from "../Dashboard/Analytics/Order/OrderAnalytics3";
// import OrderAnalytics4 from "../Dashboard/Analytics/Order/OrderAnalytics4";
// import OrderAnalytics5 from "../Dashboard/Analytics/Order/OrderAnalytics5";

// const API_URL = process.env.REACT_APP_API_URL || "";

// const CURRENCY = (n) =>
//   `₱${(Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("en-PH", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`;

// // Helpers ------------------------------------------------------------------
// function startOfPeriod(date, grouping = "day") {
//   const d = new Date(date);
//   if (grouping === "day") {
//     d.setHours(0, 0, 0, 0);
//     return d.toISOString();
//   }
//   if (grouping === "week") {
//     const day = d.getDay();
//     const diff = day === 0 ? -6 : 1 - day;
//     const monday = new Date(d);
//     monday.setDate(d.getDate() + diff);
//     monday.setHours(0, 0, 0, 0);
//     return monday.toISOString();
//   }
//   if (grouping === "month") {
//     const m = new Date(d.getFullYear(), d.getMonth(), 1);
//     m.setHours(0, 0, 0, 0);
//     return m.toISOString();
//   }
//   d.setHours(0, 0, 0, 0);
//   return d.toISOString();
// }

// function formatPeriodLabel(isoString, grouping = "day") {
//   const d = new Date(isoString);
//   if (grouping === "day") return d.toLocaleDateString();
//   if (grouping === "week") {
//     const end = new Date(d);
//     end.setDate(d.getDate() + 6);
//     return `${d.toLocaleDateString()} — ${end.toLocaleDateString()}`;
//   }
//   if (grouping === "month") {
//     return d.toLocaleString(undefined, { month: "short", year: "numeric" });
//   }
//   return d.toLocaleDateString();
// }

// function safeNumber(v) {
//   return Number.isFinite(Number(v)) ? Number(v) : 0;
// }

// // Compute aggregates used by Order analytics components
// function computeOrderAggregates(orders = [], grouping = "day") {
//   const byPeriod = new Map();
//   const topItemsMap = new Map();
//   const deliveryDistances = [];

//   let totalRevenue = 0;
//   let totalOrders = 0;
//   let pending = 0;

//   for (const o of orders) {
//     totalOrders++;

//     const status = String(o.status || "").toLowerCase();
//     if (status.includes("pending") || status.includes("processing") || status === "") pending++;

//     const created = o.createdAt ? new Date(o.createdAt) : new Date();
//     const periodKey = startOfPeriod(created, grouping);

//     let orderAmount = 0;
//     if (o.grandTotal != null) orderAmount = safeNumber(o.grandTotal);
//     else if (o.total != null) orderAmount = safeNumber(o.total) + safeNumber(o.deliveryFee || 0) - safeNumber(o.discount || 0);
//     else if (Array.isArray(o.items) && o.items.length > 0) {
//       orderAmount = o.items.reduce((s, it) => s + (safeNumber(it.price) * safeNumber(it.quantity)), 0);
//       orderAmount += safeNumber(o.deliveryFee || 0) - safeNumber(o.discount || 0);
//     }

//     totalRevenue += orderAmount;

//     const entry = byPeriod.get(periodKey) || { orders: 0, revenue: 0 };
//     entry.orders += 1;
//     entry.revenue += orderAmount;
//     byPeriod.set(periodKey, entry);

//     if (Array.isArray(o.items)) {
//       for (const it of o.items) {
//         const key = it.id || it._id || `${it.name || "item"}`;
//         const qty = safeNumber(it.quantity);
//         const prev = topItemsMap.get(key) || { name: it.name || key, qty: 0, revenue: 0 };
//         prev.qty += qty;
//         prev.revenue += safeNumber(it.price) * qty;
//         topItemsMap.set(key, prev);
//       }
//     }

//     const meta = o.meta || {};
//     const distFromMeta = meta.computed && Number.isFinite(Number(meta.computed.distanceKm)) ? Number(meta.computed.distanceKm) : null;
//     const distField = Number.isFinite(Number(o.distanceKm)) ? Number(o.distanceKm) : null;
//     if (distFromMeta != null) deliveryDistances.push(distFromMeta);
//     else if (distField != null) deliveryDistances.push(distField);
//   }

//   const sortedPeriods = Array.from(byPeriod.entries())
//     .map(([k, v]) => ({ period: k, label: formatPeriodLabel(k, grouping), orders: v.orders, revenue: +(v.revenue || 0).toFixed(2) }))
//     .sort((a, b) => new Date(a.period) - new Date(b.period));

//   const topItems = Array.from(topItemsMap.entries())
//     .map(([k, v]) => ({ id: k, name: v.name, quantity: v.qty, revenue: +(v.revenue || 0).toFixed(2) }))
//     .sort((a, b) => b.quantity - a.quantity)
//     .slice(0, 10);

//   const buckets = { "0-15": 0, "15-18": 0, "18-21": 0, "21+": 0 };
//   for (const d of deliveryDistances) {
//     if (d <= 15) buckets["0-15"] += 1;
//     else if (d <= 18) buckets["15-18"] += 1;
//     else if (d <= 21) buckets["18-21"] += 1;
//     else buckets["21+"] += 1;
//   }

//   return {
//     totalOrders,
//     totalRevenue: +totalRevenue.toFixed(2),
//     pendingOrders: pending,
//     periods: sortedPeriods,
//     topItems,
//     deliveryBuckets: buckets,
//   };
// }

// // Compute aggregates for SellRequest analytics
// function computeSellAggregates(sells = [], grouping = "day") {
//   const byPeriod = new Map();
//   const topNamesMap = new Map();
//   const locations = [];

//   let totalRequests = 0;
//   let totalAsking = 0;
//   let pending = 0;

//   for (const s of sells) {
//     totalRequests++;

//     const status = String(s.status || "").toLowerCase();
//     if (status.includes("pending") || status === "pending") pending++;

//     const created = s.createdAt ? new Date(s.createdAt) : new Date();
//     const periodKey = startOfPeriod(created, grouping);

//     const price = safeNumber(s.price || 0);
//     totalAsking += price;

//     const entry = byPeriod.get(periodKey) || { requests: 0, askingTotal: 0 };
//     entry.requests += 1;
//     entry.askingTotal += price;
//     byPeriod.set(periodKey, entry);

//     const nameKey = (s.name || "Untitled").trim();
//     const prev = topNamesMap.get(nameKey) || { name: nameKey, count: 0, totalAsking: 0 };
//     prev.count += 1;
//     prev.totalAsking += price;
//     topNamesMap.set(nameKey, prev);

//     if (s.location && typeof s.location.lat === "number" && typeof s.location.lng === "number") {
//       locations.push({ lat: s.location.lat, lng: s.location.lng });
//     }
//   }

//   const sortedPeriods = Array.from(byPeriod.entries())
//     .map(([k, v]) => ({ period: k, label: formatPeriodLabel(k, grouping), requests: v.requests, askingTotal: +(v.askingTotal || 0).toFixed(2) }))
//     .sort((a, b) => new Date(a.period) - new Date(b.period));

//   const topNames = Array.from(topNamesMap.entries())
//     .map(([k, v]) => ({ id: k, name: v.name, count: v.count, totalAsking: +(v.totalAsking || 0).toFixed(2) }))
//     .sort((a, b) => b.count - a.count)
//     .slice(0, 10);

//   const geoBuckets = new Map();
//   for (const loc of locations) {
//     const key = `${loc.lat.toFixed(1)},${loc.lng.toFixed(1)}`;
//     geoBuckets.set(key, (geoBuckets.get(key) || 0) + 1);
//   }
//   const geoArray = Array.from(geoBuckets.entries()).map(([k, v]) => ({ bucket: k, count: v }));

//   return {
//     totalRequests,
//     totalAsking: +totalAsking.toFixed(2),
//     pendingRequests: pending,
//     periods: sortedPeriods,
//     topNames,
//     geo: geoArray,
//   };
// }

// // Compute aggregates for Demolition analytics
// function computeDemolishAggregates(dems = [], grouping = "day") {
//   const byPeriod = new Map();
//   const statusCounts = {};
//   const priceProposals = []; // proposedPrice values
//   const acceptedPrices = [];
//   const locations = [];

//   let totalRequests = 0;
//   let pending = 0;

//   for (const d of dems) {
//     totalRequests++;

//     const status = String(d.status || "pending").toLowerCase();
//     statusCounts[status] = (statusCounts[status] || 0) + 1;
//     if (status.includes("pending")) pending++;

//     const created = d.createdAt ? new Date(d.createdAt) : new Date();
//     const periodKey = startOfPeriod(created, grouping);

//     const entry = byPeriod.get(periodKey) || { requests: 0, avgProposed: 0, proposedCount: 0 };
//     entry.requests += 1;
//     // proposedPrice may exist
//     if (d.proposedPrice != null && Number.isFinite(Number(d.proposedPrice))) {
//       entry.avgProposed = (entry.avgProposed * entry.proposedCount + Number(d.proposedPrice)) / (entry.proposedCount + 1 || 1);
//       entry.proposedCount += 1;
//       priceProposals.push(Number(d.proposedPrice));
//     }
//     if (d.price != null && Number.isFinite(Number(d.price))) {
//       acceptedPrices.push(Number(d.price));
//     }
//     byPeriod.set(periodKey, entry);

//     if (d.location && typeof d.location.lat === "number" && typeof d.location.lng === "number") {
//       locations.push({ lat: d.location.lat, lng: d.location.lng });
//     }
//   }

//   const sortedPeriods = Array.from(byPeriod.entries())
//     .map(([k, v]) => ({
//       period: k,
//       label: formatPeriodLabel(k, grouping),
//       requests: v.requests,
//       avgProposed: v.proposedCount > 0 ? +(v.avgProposed || 0).toFixed(2) : null,
//     }))
//     .sort((a, b) => new Date(a.period) - new Date(b.period));

//   const avgProposedOverall = priceProposals.length ? +(priceProposals.reduce((s, x) => s + x, 0) / priceProposals.length).toFixed(2) : null;
//   const avgAcceptedOverall = acceptedPrices.length ? +(acceptedPrices.reduce((s, x) => s + x, 0) / acceptedPrices.length).toFixed(2) : null;

//   // geo buckets
//   const geoBuckets = new Map();
//   for (const loc of locations) {
//     const key = `${loc.lat.toFixed(1)},${loc.lng.toFixed(1)}`;
//     geoBuckets.set(key, (geoBuckets.get(key) || 0) + 1);
//   }
//   const geoArray = Array.from(geoBuckets.entries()).map(([k, v]) => ({ bucket: k, count: v }));

//   return {
//     totalRequests,
//     pendingRequests: pending,
//     statusCounts,
//     periods: sortedPeriods,
//     avgProposedOverall,
//     avgAcceptedOverall,
//     geo: geoArray,
//   };
// }

// // Dashboard component -----------------------------------------------------
// const Dashboard = () => {
//   const navigate = useNavigate();

//   // Top tiles
//   const [demolitionCount, setDemolitionCount] = useState(0);
//   const [sellCount, setSellCount] = useState(0);
//   const [orderCount, setOrderCount] = useState(0);

//   // Orders (raw)
//   const [orders, setOrders] = useState([]);
//   // Sells (raw)
//   const [sells, setSells] = useState([]);
//   // Demolitions (raw)
//   const [demolitions, setDemolitions] = useState([]);

//   // Summary metrics
//   const [pendingOrders, setPendingOrders] = useState(0);
//   const [totalRevenue, setTotalRevenue] = useState(0);

//   // Filter selector
//   const [filter, setFilter] = useState("day");

//   // Analytics selection (sell / demolish / orders)
//   const [analyticsView, setAnalyticsView] = useState("sell");

//   // Current signed-in user
//   const [currentUser, setCurrentUser] = useState({ username: "", email: "" });
//   const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

//   // Aggregated analytics derived from orders, sells, demolitions
//   const aggregated = useMemo(() => computeOrderAggregates(orders, filter), [orders, filter]);
//   const sellAggregated = useMemo(() => computeSellAggregates(sells, filter), [sells, filter]);
//   const demolishAggregated = useMemo(() => computeDemolishAggregates(demolitions, filter), [demolitions, filter]);

//   // Fetch current user
//   useEffect(() => {
//     if (!userId) return;
//     const token = localStorage.getItem("token");
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/users/${userId}`, {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         });
//         const data = res.data || {};
//         setCurrentUser({
//           username: data.username || "N/A",
//           email: data.email || "N/A",
//         });
//       } catch (e) {
//         console.error("Failed to load current user:", e);
//         setCurrentUser((u) => ({ ...u, email: "N/A" }));
//       }
//     })();
//   }, [userId]);

//   // Fetch demolish/sell counts and orders (basic summary)
//   useEffect(() => {
//     (async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const [demolishRes, sellRes, ordersRes] = await Promise.all([
//           axios.get(`${API_URL}/api/demolish`, {
//             headers: token ? { Authorization: `Bearer ${token}` } : {},
//           }),
//           axios.get(`${API_URL}/api/sell`, {
//             headers: token ? { Authorization: `Bearer ${token}` } : {},
//           }),
//           axios.get(`${API_URL}/api/orders`, {
//             headers: token ? { Authorization: `Bearer ${token}` } : {},
//           }),
//         ]);

//         const demolish = Array.isArray(demolishRes.data) ? demolishRes.data : [];
//         const sell = Array.isArray(sellRes.data) ? sellRes.data : [];
//         const fetchedOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

//         setDemolitionCount(demolish.length || 0);
//         setSellCount(sell.length || 0);
//         setOrderCount(fetchedOrders.length || 0);

//         const hydratedOrders = fetchedOrders.map((o) => ({ ...o, userEmail: o.userEmail || o.email || "—" }));
//         setOrders(hydratedOrders);

//         const hydratedSells = sell.map((s) => ({ ...s, sellerEmail: s.email || s.contact || "—" }));
//         setSells(hydratedSells);

//         // set demolitions raw
//         setDemolitions(demolish);

//         // compute pending orders & revenue from orders (simple)
//         let pending = 0;
//         let revenue = 0;
//         hydratedOrders.forEach((o) => {
//           const status = String(o.status || "").toLowerCase();
//           if (status.includes("pending") || status.includes("processing") || status === "") pending++;

//           if (Array.isArray(o.items) && o.items.length > 0) {
//             o.items.forEach((it) => {
//               const price = Number(it.price) || 0;
//               const qty = Number(it.quantity) || 0;
//               revenue += price * qty;
//             });
//           } else {
//             revenue += Number(o.total) || 0;
//           }
//         });

//         setPendingOrders(pending);
//         setTotalRevenue(revenue);
//       } catch (error) {
//         console.error("Error fetching top tile counts or orders:", error);
//         setDemolitionCount(0);
//         setSellCount(0);
//         setOrderCount(0);
//         setOrders([]);
//         setSells([]);
//         setDemolitions([]);
//         setPendingOrders(0);
//         setTotalRevenue(0);
//       }
//     })();
//   }, []);

//   // Export CSV & PDF (orders export)
//   const exportCSV = () => {
//     const headers = "Order ID,User Email,Status,Total Items,Total Amount,Created At\n";
//     const rows = (orders || [])
//       .map((order) => {
//         const totalItems = (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;
//         const totalAmount = (order.items || []).reduce(
//           (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
//           0
//         ) || Number(order.total) || 0;
//         const oid = order.orderId || order._id || "";
//         const created = order.createdAt ? new Date(order.createdAt).toISOString() : "";
//         return `${oid},${(order.userEmail || "").replaceAll(",", " ")},${(order.status || "")
//           .toString()
//           .replaceAll(",", " ")},${totalItems},${totalAmount},${created}`;
//       })
//       .join("\n");

//     const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.setAttribute("download", "dashboard-report.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const exportPDF = () => {
//     const element = document.getElementById("dashboard-report-content");
//     if (!element) {
//       const fallback = document.createElement("div");
//       fallback.innerHTML = `<h3>Dashboard Report</h3><p>Orders exported: ${orders.length}</p>`;
//       document.body.appendChild(fallback);
//       html2pdf().from(fallback).save().finally(() => document.body.removeChild(fallback));
//       return;
//     }
//     const options = {
//       margin: 0.5,
//       filename: "dashboard-report.pdf",
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true },
//       jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
//     };
//     const summary = document.createElement("div");
//     summary.style.padding = "12px";
//     summary.innerHTML = `
//       <h4>Dashboard Summary</h4>
//       <p>Total Orders: ${aggregated.totalOrders}</p>
//       <p>Total Revenue: ${CURRENCY(aggregated.totalRevenue)}</p>
//       <p>Pending Orders: ${aggregated.pendingOrders}</p>
//     `;
//     element.prepend(summary);

//     html2pdf().set(options).from(element).save().finally(() => {
//       try { element.removeChild(summary); } catch (e) {}
//     });
//   };

//   return (
//     <Container className="mt-4 p-3 bg-white border-bottom shadow-sm">
//       {/* Top tiles */}
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

//       {/* Summary + Export */}
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
//             <Card.Body className="d-flex flex-column justify-content-between h-100">
//               <h6>Export</h6>
//               <div className="d-flex gap-2 mt-2">
//                 <Button variant="outline-dark" size="sm" onClick={exportCSV}>
//                   Download CSV
//                 </Button>
//                 <Button variant="outline-primary" size="sm" onClick={exportPDF}>
//                   Download PDF
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Signed in as + Filters */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <small className="text-muted">
//           Signed in as: <strong>{currentUser.email || "—"}</strong>
//         </small>

//         <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//           <Form.Select style={{ width: "180px" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
//             <option value="day">Group by Day</option>
//             <option value="week">Group by Week</option>
//             <option value="month">Group by Month</option>
//           </Form.Select>

//           <Form.Select
//             style={{ width: "260px" }}
//             value={analyticsView}
//             onChange={(e) => setAnalyticsView(e.target.value)}
//           >
//             <option value="sell">Sell Analytics</option>
//             <option value="demolish">Demolish Analytics</option>
//             <option value="orders">Orders Analytics</option>
//           </Form.Select>
//         </div>
//       </div>

//       {/* Analytics area */}
//       <div id="dashboard-report-content" className="p-3">
//         <Card className="p-3 shadow-sm bg-light mb-3">
//           <h5 className="mb-2">
//             {analyticsView === "sell" ? "Sell Analytics" : analyticsView === "demolish" ? "Demolish Analytics" : "Orders Analytics"}
//           </h5>
//           <p className="mb-0 text-muted">
//             {analyticsView === "sell"
//               ? "Below are analytics computed from sell requests. Use the export buttons above to include these in a report."
//               : analyticsView === "demolish"
//               ? "Below are analytics computed from demolition requests. Use the export buttons above to include these in a report."
//               : "Below are analytics computed from orders. Use the export buttons above to include these in a report."}
//           </p>
//         </Card>

//         {analyticsView === "sell" && (
//           <>
//             <SellAnalytics1 sells={sells} aggregated={sellAggregated} defaultGrouping={filter} />
//             <SellAnalytics2 sells={sells} aggregated={sellAggregated} />
//             <SellAnalytics3 sells={sells} aggregated={sellAggregated} />
//             <SellAnalytics4 sells={sells} aggregated={sellAggregated} />
//             <SellAnalytics5 sells={sells} aggregated={sellAggregated} />
//           </>
//         )}

//         {analyticsView === "demolish" && (
//           <>
//             <DemolishAnalytics1 demolitions={demolitions} aggregated={demolishAggregated} defaultGrouping={filter} />
//             <DemolishAnalytics2 demolitions={demolitions} aggregated={demolishAggregated} />
//             <DemolishAnalytics3 demolitions={demolitions} aggregated={demolishAggregated} />
//             <DemolishAnalytics4 demolitions={demolitions} aggregated={demolishAggregated} />
//             <DemolishAnalytics5 demolitions={demolitions} aggregated={demolishAggregated} />
//           </>
//         )}

//         {analyticsView === "orders" && (
//           <>
//             <OrderAnalytics1 orders={orders} aggregated={aggregated} defaultGrouping={filter} />
//             <OrderAnalytics2 orders={orders} aggregated={aggregated} />
//             <OrderAnalytics3 orders={orders} aggregated={aggregated} />
//             <OrderAnalytics4 orders={orders} aggregated={aggregated} />
//             <OrderAnalytics5 orders={orders} aggregated={aggregated} />

//             <Row className="mt-3">
//               <Col md={6}>
//                 <Card className="p-3 mb-3 shadow-sm">
//                   <h6>Orders by {filter}</h6>
//                   <ul className="list-unstyled mb-0">
//                     {aggregated.periods.slice(-10).map((p) => (
//                       <li key={p.period} className="d-flex justify-content-between py-1 border-bottom">
//                         <small>{p.label}</small>
//                         <strong>{p.orders} orders / {CURRENCY(p.revenue)}</strong>
//                       </li>
//                     ))}
//                   </ul>
//                 </Card>
//               </Col>

//               <Col md={6}>
//                 <Card className="p-3 mb-3 shadow-sm">
//                   <h6>Top Items (by quantity)</h6>
//                   <ol className="mb-0">
//                     {aggregated.topItems.map((it) => (
//                       <li key={it.id} className="py-1">
//                         <small>{it.name}</small>
//                         <div className="text-muted small">Qty: {it.quantity} • Revenue: {CURRENCY(it.revenue)}</div>
//                       </li>
//                     ))}
//                     {aggregated.topItems.length === 0 && <li className="text-muted">No items yet</li>}
//                   </ol>
//                 </Card>
//               </Col>
//             </Row>

//             <Row>
//               <Col md={6}>
//                 <Card className="p-3 mb-3 shadow-sm">
//                   <h6>Delivery distance distribution</h6>
//                   <ul className="list-unstyled mb-0">
//                     {Object.entries(aggregated.deliveryBuckets).map(([k, v]) => (
//                       <li key={k} className="d-flex justify-content-between py-1 border-bottom">
//                         <small>{k} km</small>
//                         <strong>{v}</strong>
//                       </li>
//                     ))}
//                   </ul>
//                 </Card>
//               </Col>

//               <Col md={6}>
//                 <Card className="p-3 mb-3 shadow-sm">
//                   <h6>Quick summary</h6>
//                   <div className="d-flex flex-column gap-1">
//                     <div>Total Orders: <strong>{aggregated.totalOrders}</strong></div>
//                     <div>Total Revenue: <strong>{CURRENCY(aggregated.totalRevenue)}</strong></div>
//                     <div>Pending Orders: <strong>{aggregated.pendingOrders}</strong></div>
//                   </div>
//                 </Card>
//               </Col>
//             </Row>
//           </>
//         )}
//       </div>
//     </Container>
//   );
// };

// export default Dashboard;


// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { BuildingFillX, HouseFill, CartFill, Download } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import "bootstrap/dist/css/bootstrap.min.css";

// --- NEW: chart export libraries ---
import { toPng } from "html-to-image";
import download from "downloadjs";

// --- NEW: Leaflet CSS for maps ---
import "leaflet/dist/leaflet.css";

// Existing analytics (1-5)
import SellAnalytics1 from "../Dashboard/Analytics/Sell/SellAnalytics1";
import SellAnalytics2 from "../Dashboard/Analytics/Sell/SellAnalytics2";
import SellAnalytics3 from "../Dashboard/Analytics/Sell/SellAnalytics3";
import SellAnalytics4 from "../Dashboard/Analytics/Sell/SellAnalytics4";
import SellAnalytics5 from "../Dashboard/Analytics/Sell/SellAnalytics5";

// --- NEW Sell analytics 6-10 imports ---
import SellAnalytics6 from "../Dashboard/Analytics/Sell/SellAnalytics6";
import SellAnalytics7 from "../Dashboard/Analytics/Sell/SellAnalytics7";
import SellAnalytics8 from "../Dashboard/Analytics/Sell/SellAnalytics8";
import SellAnalytics9 from "../Dashboard/Analytics/Sell/SellAnalytics9";
import SellAnalytics10 from "../Dashboard/Analytics/Sell/SellAnalytics10";

import DemolishAnalytics1 from "../Dashboard/Analytics/Demolish/DemolishAnalytics1";
import DemolishAnalytics2 from "../Dashboard/Analytics/Demolish/DemolishAnalytics2";
import DemolishAnalytics3 from "../Dashboard/Analytics/Demolish/DemolishAnalytics3";
import DemolishAnalytics4 from "../Dashboard/Analytics/Demolish/DemolishAnalytics4";
import DemolishAnalytics5 from "../Dashboard/Analytics/Demolish/DemolishAnalytics5";

// --- NEW Demolish analytics 6-10 imports ---
import DemolishAnalytics6 from "../Dashboard/Analytics/Demolish/DemolishAnalytics6";
import DemolishAnalytics7 from "../Dashboard/Analytics/Demolish/DemolishAnalytics7";
import DemolishAnalytics8 from "../Dashboard/Analytics/Demolish/DemolishAnalytics8";
import DemolishAnalytics9 from "../Dashboard/Analytics/Demolish/DemolishAnalytics9";
import DemolishAnalytics10 from "../Dashboard/Analytics/Demolish/DemolishAnalytics10";

import OrderAnalytics1 from "../Dashboard/Analytics/Order/OrderAnalytics1";
import OrderAnalytics2 from "../Dashboard/Analytics/Order/OrderAnalytics2";
import OrderAnalytics3 from "../Dashboard/Analytics/Order/OrderAnalytics3";
import OrderAnalytics4 from "../Dashboard/Analytics/Order/OrderAnalytics4";
import OrderAnalytics5 from "../Dashboard/Analytics/Order/OrderAnalytics5";

// --- NEW Orders analytics 6-9 imports (charts) ---
import OrderAnalytics6 from "../Dashboard/Analytics/Order/OrderAnalytics6";
import OrderAnalytics7 from "../Dashboard/Analytics/Order/OrderAnalytics7";
import OrderAnalytics8 from "../Dashboard/Analytics/Order/OrderAnalytics8";
import OrderAnalytics9 from "../Dashboard/Analytics/Order/OrderAnalytics9";

// --- NEW Orders analytics 10 import: converted to a Leaflet map component ---
// Make sure your OrderAnalytics10 file renders a Leaflet map using react-leaflet and reads orders prop
import OrderAnalytics10 from "../Dashboard/Analytics/Order/OrderAnalytics10";

const API_URL = process.env.REACT_APP_API_URL || "";

const CURRENCY = (n) =>
  `₱${(Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// --- Helpers ------------------------------------------------------------------
function startOfPeriod(date, grouping = "day") {
  const d = new Date(date);
  if (grouping === "day") {
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  if (grouping === "week") {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  }
  if (grouping === "month") {
    const m = new Date(d.getFullYear(), d.getMonth(), 1);
    m.setHours(0, 0, 0, 0);
    return m.toISOString();
  }
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatPeriodLabel(isoString, grouping = "day") {
  const d = new Date(isoString);
  if (grouping === "day") return d.toLocaleDateString();
  if (grouping === "week") {
    const end = new Date(d);
    end.setDate(d.getDate() + 6);
    return `${d.toLocaleDateString()} — ${end.toLocaleDateString()}`;
  }
  if (grouping === "month") {
    return d.toLocaleString(undefined, { month: "short", year: "numeric" });
  }
  return d.toLocaleDateString();
}

function safeNumber(v) {
  return Number.isFinite(Number(v)) ? Number(v) : 0;
}

// Compute aggregates used by Order analytics components
function computeOrderAggregates(orders = [], grouping = "day") {
  const byPeriod = new Map();
  const topItemsMap = new Map();
  const deliveryDistances = [];

  let totalRevenue = 0;
  let totalOrders = 0;
  let pending = 0;

  for (const o of orders) {
    totalOrders++;

    const status = String(o.status || "").toLowerCase();
    if (status.includes("pending") || status.includes("processing") || status === "") pending++;

    const created = o.createdAt ? new Date(o.createdAt) : new Date();
    const periodKey = startOfPeriod(created, grouping);

    let orderAmount = 0;
    if (o.grandTotal != null) orderAmount = safeNumber(o.grandTotal);
    else if (o.total != null) orderAmount = safeNumber(o.total) + safeNumber(o.deliveryFee || 0) - safeNumber(o.discount || 0);
    else if (Array.isArray(o.items) && o.items.length > 0) {
      orderAmount = o.items.reduce((s, it) => s + (safeNumber(it.price) * safeNumber(it.quantity)), 0);
      orderAmount += safeNumber(o.deliveryFee || 0) - safeNumber(o.discount || 0);
    }

    totalRevenue += orderAmount;

    const entry = byPeriod.get(periodKey) || { orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += orderAmount;
    byPeriod.set(periodKey, entry);

    if (Array.isArray(o.items)) {
      for (const it of o.items) {
        const key = it.id || it._id || `${it.name || "item"}`;
        const qty = safeNumber(it.quantity);
        const prev = topItemsMap.get(key) || { name: it.name || key, qty: 0, revenue: 0 };
        prev.qty += qty;
        prev.revenue += safeNumber(it.price) * qty;
        topItemsMap.set(key, prev);
      }
    }

    const meta = o.meta || {};
    const distFromMeta = meta.computed && Number.isFinite(Number(meta.computed.distanceKm)) ? Number(meta.computed.distanceKm) : null;
    const distField = Number.isFinite(Number(o.distanceKm)) ? Number(o.distanceKm) : null;
    if (distFromMeta != null) deliveryDistances.push(distFromMeta);
    else if (distField != null) deliveryDistances.push(distField);
  }

  const sortedPeriods = Array.from(byPeriod.entries())
    .map(([k, v]) => ({ period: k, label: formatPeriodLabel(k, grouping), orders: v.orders, revenue: +(v.revenue || 0).toFixed(2) }))
    .sort((a, b) => new Date(a.period) - new Date(b.period));

  const topItems = Array.from(topItemsMap.entries())
    .map(([k, v]) => ({ id: k, name: v.name, quantity: v.qty, revenue: +(v.revenue || 0).toFixed(2) }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const buckets = { "0-15": 0, "15-18": 0, "18-21": 0, "21+": 0 };
  for (const d of deliveryDistances) {
    if (d <= 15) buckets["0-15"] += 1;
    else if (d <= 18) buckets["15-18"] += 1;
    else if (d <= 21) buckets["18-21"] += 1;
    else buckets["21+"] += 1;
  }

  return {
    totalOrders,
    totalRevenue: +totalRevenue.toFixed(2),
    pendingOrders: pending,
    periods: sortedPeriods,
    topItems,
    deliveryBuckets: buckets,
  };
}

// Compute aggregates for SellRequest analytics
function computeSellAggregates(sells = [], grouping = "day") {
  const byPeriod = new Map();
  const topNamesMap = new Map();
  const locations = [];

  let totalRequests = 0;
  let totalAsking = 0;
  let pending = 0;

  for (const s of sells) {
    totalRequests++;

    const status = String(s.status || "").toLowerCase();
    if (status.includes("pending") || status === "pending") pending++;

    const created = s.createdAt ? new Date(s.createdAt) : new Date();
    const periodKey = startOfPeriod(created, grouping);

    const price = safeNumber(s.price || 0);
    totalAsking += price;

    const entry = byPeriod.get(periodKey) || { requests: 0, askingTotal: 0 };
    entry.requests += 1;
    entry.askingTotal += price;
    byPeriod.set(periodKey, entry);

    const nameKey = (s.name || "Untitled").trim();
    const prev = topNamesMap.get(nameKey) || { name: nameKey, count: 0, totalAsking: 0 };
    prev.count += 1;
    prev.totalAsking += price;
    topNamesMap.set(nameKey, prev);

    if (s.location && typeof s.location.lat === "number" && typeof s.location.lng === "number") {
      locations.push({ lat: s.location.lat, lng: s.location.lng });
    }
  }

  const sortedPeriods = Array.from(byPeriod.entries())
    .map(([k, v]) => ({ period: k, label: formatPeriodLabel(k, grouping), requests: v.requests, askingTotal: +(v.askingTotal || 0).toFixed(2) }))
    .sort((a, b) => new Date(a.period) - new Date(b.period));

  const topNames = Array.from(topNamesMap.entries())
    .map(([k, v]) => ({ id: k, name: v.name, count: v.count, totalAsking: +(v.totalAsking || 0).toFixed(2) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const geoBuckets = new Map();
  for (const loc of locations) {
    const key = `${loc.lat.toFixed(1)},${loc.lng.toFixed(1)}`;
    geoBuckets.set(key, (geoBuckets.get(key) || 0) + 1);
  }
  const geoArray = Array.from(geoBuckets.entries()).map(([k, v]) => ({ bucket: k, count: v }));

  return {
    totalRequests,
    totalAsking: +totalAsking.toFixed(2),
    pendingRequests: pending,
    periods: sortedPeriods,
    topNames,
    geo: geoArray,
  };
}

// Compute aggregates for Demolition analytics
function computeDemolishAggregates(dems = [], grouping = "day") {
  const byPeriod = new Map();
  const statusCounts = {};
  const priceProposals = []; // proposedPrice values
  const acceptedPrices = [];
  const locations = [];

  let totalRequests = 0;
  let pending = 0;

  for (const d of dems) {
    totalRequests++;

    const status = String(d.status || "pending").toLowerCase();
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    if (status.includes("pending")) pending++;

    const created = d.createdAt ? new Date(d.createdAt) : new Date();
    const periodKey = startOfPeriod(created, grouping);

    const entry = byPeriod.get(periodKey) || { requests: 0, avgProposed: 0, proposedCount: 0 };
    entry.requests += 1;
    // proposedPrice may exist
    if (d.proposedPrice != null && Number.isFinite(Number(d.proposedPrice))) {
      entry.avgProposed = (entry.avgProposed * entry.proposedCount + Number(d.proposedPrice)) / (entry.proposedCount + 1 || 1);
      entry.proposedCount += 1;
      priceProposals.push(Number(d.proposedPrice));
    }
    if (d.price != null && Number.isFinite(Number(d.price))) {
      acceptedPrices.push(Number(d.price));
    }
    byPeriod.set(periodKey, entry);

    if (d.location && typeof d.location.lat === "number" && typeof d.location.lng === "number") {
      locations.push({ lat: d.location.lat, lng: d.location.lng });
    }
  }

  const sortedPeriods = Array.from(byPeriod.entries())
    .map(([k, v]) => ({
      period: k,
      label: formatPeriodLabel(k, grouping),
      requests: v.requests,
      avgProposed: v.proposedCount > 0 ? +(v.avgProposed || 0).toFixed(2) : null,
    }))
    .sort((a, b) => new Date(a.period) - new Date(b.period));

  const avgProposedOverall = priceProposals.length ? +(priceProposals.reduce((s, x) => s + x, 0) / priceProposals.length).toFixed(2) : null;
  const avgAcceptedOverall = acceptedPrices.length ? +(acceptedPrices.reduce((s, x) => s + x, 0) / acceptedPrices.length).toFixed(2) : null;

  // geo buckets
  const geoBuckets = new Map();
  for (const loc of locations) {
    const key = `${loc.lat.toFixed(1)},${loc.lng.toFixed(1)}`;
    geoBuckets.set(key, (geoBuckets.get(key) || 0) + 1);
  }
  const geoArray = Array.from(geoBuckets.entries()).map(([k, v]) => ({ bucket: k, count: v }));

  return {
    totalRequests,
    pendingRequests: pending,
    statusCounts,
    periods: sortedPeriods,
    avgProposedOverall,
    avgAcceptedOverall,
    geo: geoArray,
  };
}

// --- NEW: ChartWrapper component that adds per-chart PNG export button ---
function ChartWrapper({ title, children, chartId, className }) {
  const ref = useRef(null);

  const handleExportPNG = async () => {
    const node = ref.current;
    if (!node) return;
    try {
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      // download as PNG
      download(dataUrl, `${chartId || "chart"}.png`);
    } catch (err) {
      console.error("Export PNG failed:", err);
      alert("Export failed — see console for details.");
    }
  };

  return (
    <Card className={`p-3 mb-3 shadow-sm ${className || ""}`}>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h6 className="mb-0">{title}</h6>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline-secondary" size="sm" onClick={handleExportPNG} title="Export PNG">
            <Download size={14} className="me-1" /> Export PNG
          </Button>
        </div>
      </div>
      <div ref={ref}>
        {children}
      </div>
    </Card>
  );
}

// Dashboard component -----------------------------------------------------
const Dashboard = () => {
  const navigate = useNavigate();

  // Top tiles
  const [demolitionCount, setDemolitionCount] = useState(0);
  const [sellCount, setSellCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  // Orders (raw)
  const [orders, setOrders] = useState([]);
  // Sells (raw)
  const [sells, setSells] = useState([]);
  // Demolitions (raw)
  const [demolitions, setDemolitions] = useState([]);

  // Summary metrics
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Filter selector
  const [filter, setFilter] = useState("day");

  // Analytics selection (sell / demolish / orders)
  const [analyticsView, setAnalyticsView] = useState("sell");

  // Current signed-in user
  const [currentUser, setCurrentUser] = useState({ username: "", email: "" });
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Aggregated analytics derived from orders, sells, demolitions
  const aggregated = useMemo(() => computeOrderAggregates(orders, filter), [orders, filter]);
  const sellAggregated = useMemo(() => computeSellAggregates(sells, filter), [sells, filter]);
  const demolishAggregated = useMemo(() => computeDemolishAggregates(demolitions, filter), [demolitions, filter]);

  // Fetch current user
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = res.data || {};
        setCurrentUser({
          username: data.username || "N/A",
          email: data.email || "N/A",
        });
      } catch (e) {
        console.error("Failed to load current user:", e);
        setCurrentUser((u) => ({ ...u, email: "N/A" }));
      }
    })();
  }, [userId]);

  // Fetch demolish/sell counts and orders (basic summary)
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const [demolishRes, sellRes, ordersRes] = await Promise.all([
          axios.get(`${API_URL}/api/demolish`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`${API_URL}/api/sell`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`${API_URL}/api/orders`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        const demolish = Array.isArray(demolishRes.data) ? demolishRes.data : [];
        const sell = Array.isArray(sellRes.data) ? sellRes.data : [];
        const fetchedOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

        setDemolitionCount(demolish.length || 0);
        setSellCount(sell.length || 0);
        setOrderCount(fetchedOrders.length || 0);

        const hydratedOrders = fetchedOrders.map((o) => ({ ...o, userEmail: o.userEmail || o.email || "—" }));
        setOrders(hydratedOrders);

        const hydratedSells = sell.map((s) => ({ ...s, sellerEmail: s.email || s.contact || "—" }));
        setSells(hydratedSells);

        // set demolitions raw
        setDemolitions(demolish);

        // compute pending orders & revenue from orders (simple)
        let pending = 0;
        let revenue = 0;
        hydratedOrders.forEach((o) => {
          const status = String(o.status || "").toLowerCase();
          if (status.includes("pending") || status.includes("processing") || status === "") pending++;

          if (Array.isArray(o.items) && o.items.length > 0) {
            o.items.forEach((it) => {
              const price = Number(it.price) || 0;
              const qty = Number(it.quantity) || 0;
              revenue += price * qty;
            });
          } else {
            revenue += Number(o.total) || 0;
          }
        });

        setPendingOrders(pending);
        setTotalRevenue(revenue);
      } catch (error) {
        console.error("Error fetching top tile counts or orders:", error);
        setDemolitionCount(0);
        setSellCount(0);
        setOrderCount(0);
        setOrders([]);
        setSells([]);
        setDemolitions([]);
        setPendingOrders(0);
        setTotalRevenue(0);
      }
    })();
  }, []);

  // Export CSV & PDF (orders export)
  const exportCSV = () => {
    const headers = "Order ID,User Email,Status,Total Items,Total Amount,Created At\n";
    const rows = (orders || [])
      .map((order) => {
        const totalItems = (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;
        const totalAmount = (order.items || []).reduce(
          (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
          0
        ) || Number(order.total) || 0;
        const oid = order.orderId || order._id || "";
        const created = order.createdAt ? new Date(order.createdAt).toISOString() : "";
        return `${oid},${(order.userEmail || "").replaceAll(",", " ")},${(order.status || "")
          .toString()
          .replaceAll(",", " ")},${totalItems},${totalAmount},${created}`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "dashboard-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const element = document.getElementById("dashboard-report-content");
    if (!element) {
      const fallback = document.createElement("div");
      fallback.innerHTML = `<h3>Dashboard Report</h3><p>Orders exported: ${orders.length}</p>`;
      document.body.appendChild(fallback);
      html2pdf().from(fallback).save().finally(() => document.body.removeChild(fallback));
      return;
    }
    const options = {
      margin: 0.5,
      filename: "dashboard-report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    const summary = document.createElement("div");
    summary.style.padding = "12px";
    summary.innerHTML = `
      <h4>Dashboard Summary</h4>
      <p>Total Orders: ${aggregated.totalOrders}</p>
      <p>Total Revenue: ${CURRENCY(aggregated.totalRevenue)}</p>
      <p>Pending Orders: ${aggregated.pendingOrders}</p>
    `;
    element.prepend(summary);

    html2pdf().set(options).from(element).save().finally(() => {
      try { element.removeChild(summary); } catch (e) {}
    });
  };

  return (
    <Container className="mt-4 p-3 bg-white border-bottom shadow-sm">
      {/* Top tiles */}
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

      {/* Summary + Export */}
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
            <Card.Body className="d-flex flex-column justify-content-between h-100">
              <h6>Export</h6>
              <div className="d-flex gap-2 mt-2">
                <Button variant="outline-dark" size="sm" onClick={exportCSV}>
                  Download CSV
                </Button>
                <Button variant="outline-primary" size="sm" onClick={exportPDF}>
                  Download PDF
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Signed in as + Filters */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted">
          Signed in as: <strong>{currentUser.email || "—"}</strong>
        </small>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Form.Select style={{ width: "180px" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="day">Group by Day</option>
            <option value="week">Group by Week</option>
            <option value="month">Group by Month</option>
          </Form.Select>

          <Form.Select
            style={{ width: "260px" }}
            value={analyticsView}
            onChange={(e) => setAnalyticsView(e.target.value)}
          >
            <option value="sell">Sell Analytics</option>
            <option value="demolish">Demolish Analytics</option>
            <option value="orders">Orders Analytics</option>
          </Form.Select>
        </div>
      </div>

      {/* Analytics area */}
      <div id="dashboard-report-content" className="p-3">
        <Card className="p-3 shadow-sm bg-light mb-3">
          <h5 className="mb-2">
            {analyticsView === "sell" ? "Sell Analytics" : analyticsView === "demolish" ? "Demolish Analytics" : "Orders Analytics"}
          </h5>
          <p className="mb-0 text-muted">
            {analyticsView === "sell"
              ? "Below are analytics computed from sell requests. Use the export buttons above to include these in a report."
              : analyticsView === "demolish"
              ? "Below are analytics computed from demolition requests. Use the export buttons above to include these in a report."
              : "Below are analytics computed from orders. Use the export buttons above to include these in a report."}
          </p>
        </Card>

        {analyticsView === "sell" && (
          <>
            <ChartWrapper title="Sell: Requests Over Time" chartId="sell-1">
              <SellAnalytics1 sells={sells} aggregated={sellAggregated} defaultGrouping={filter} />
            </ChartWrapper>

            <ChartWrapper title="Sell: Chart 2" chartId="sell-2">
              <SellAnalytics2 sells={sells} aggregated={sellAggregated} />
            </ChartWrapper>

            <ChartWrapper title="Sell: Chart 3" chartId="sell-3">
              <SellAnalytics3 sells={sells} aggregated={sellAggregated} />
            </ChartWrapper>

            <ChartWrapper title="Sell: Chart 4" chartId="sell-4">
              <SellAnalytics4 sells={sells} aggregated={sellAggregated} />
            </ChartWrapper>

            <ChartWrapper title="Sell: Chart 5" chartId="sell-5">
              <SellAnalytics5 sells={sells} aggregated={sellAggregated} />
            </ChartWrapper>

            {/* NEW extra Sell charts */}
            <ChartWrapper title="Sell: Cumulative Requests" chartId="sell-6">
              <SellAnalytics6 aggregated={sellAggregated} defaultGrouping={filter} />
            </ChartWrapper>

            <ChartWrapper title="Sell: Price Quartiles" chartId="sell-7">
              <SellAnalytics7 sells={sells} />
            </ChartWrapper>

            <ChartWrapper title="Sell: Recent Submissions" chartId="sell-8">
              <SellAnalytics8 sells={sells} />
            </ChartWrapper>

            <ChartWrapper title="Sell: Price vs Age" chartId="sell-9">
              <SellAnalytics9 sells={sells} />
            </ChartWrapper>

            <ChartWrapper title="Sell: Submissions by Hour" chartId="sell-10">
              <SellAnalytics10 sells={sells} />
            </ChartWrapper>
          </>
        )}

        {analyticsView === "demolish" && (
          <>
            <ChartWrapper title="Demolish: Requests Over Time" chartId="dem-1">
              <DemolishAnalytics1 demolitions={demolitions} aggregated={demolishAggregated} defaultGrouping={filter} />
            </ChartWrapper>

            <ChartWrapper title="Demolish: Status Distribution" chartId="dem-2">
              <DemolishAnalytics2 demolitions={demolitions} aggregated={demolishAggregated} />
            </ChartWrapper>

            <ChartWrapper title="Demolish: Avg Proposed vs Accepted" chartId="dem-3">
              <DemolishAnalytics3 demolitions={demolitions} aggregated={demolishAggregated} defaultGrouping={filter} />
            </ChartWrapper>

            <ChartWrapper title="Demolish: Location Scatter" chartId="dem-4">
              <DemolishAnalytics4 demolitions={demolitions} />
            </ChartWrapper>

            <ChartWrapper title="Demolish: Top Location Buckets" chartId="dem-5">
              <DemolishAnalytics5 aggregated={demolishAggregated} />
            </ChartWrapper>

            {/* NEW extra Demolish charts */}
            <ChartWrapper title="Demolish: Cumulative" chartId="dem-6">
              <DemolishAnalytics6 aggregated={demolishAggregated} defaultGrouping={filter} />
            </ChartWrapper>

            <ChartWrapper title="Demolish: Proposed Price Distribution" chartId="dem-7">
              <DemolishAnalytics7 demolitions={demolitions} />
            </ChartWrapper>

            <ChartWrapper title="Demolish: Scheduling Delay" chartId="dem-8">
              <DemolishAnalytics8 demolitions={demolitions} />
            </ChartWrapper>

            <ChartWrapper title="Demolish: Recent Updates" chartId="dem-9">
              <DemolishAnalytics9 demolitions={demolitions} />
            </ChartWrapper>

            <ChartWrapper title="Demolish: Top Areas" chartId="dem-10">
              <DemolishAnalytics10 aggregated={demolishAggregated} />
            </ChartWrapper>
          </>
        )}

        {analyticsView === "orders" && (
          <>
            <ChartWrapper title="Orders: Revenue Over Time" chartId="ord-1">
              <OrderAnalytics1 orders={orders} aggregated={aggregated} defaultGrouping={filter} />
            </ChartWrapper>

            <ChartWrapper title="Orders: Chart 2" chartId="ord-2">
              <OrderAnalytics2 orders={orders} aggregated={aggregated} />
            </ChartWrapper>

            <ChartWrapper title="Orders: Chart 3" chartId="ord-3">
              <OrderAnalytics3 orders={orders} aggregated={aggregated} />
            </ChartWrapper>

            <ChartWrapper title="Orders: Chart 4" chartId="ord-4">
              <OrderAnalytics4 orders={orders} aggregated={aggregated} />
            </ChartWrapper>

            <ChartWrapper title="Orders: Chart 5" chartId="ord-5">
              <OrderAnalytics5 orders={orders} aggregated={aggregated} />
            </ChartWrapper>

            {/* NEW extra Orders charts */}
            <ChartWrapper title="Orders: Top Customers" chartId="ord-6">
              <OrderAnalytics6 orders={orders} aggregated={aggregated} />
            </ChartWrapper>

            <ChartWrapper title="Orders: AOV Distribution" chartId="ord-7">
              <OrderAnalytics7 orders={orders} />
            </ChartWrapper>

            <ChartWrapper title="Orders: Item Mix" chartId="ord-8">
              <OrderAnalytics8 aggregated={aggregated} />
            </ChartWrapper>

            <ChartWrapper title="Orders: Status Over Time" chartId="ord-9">
              <OrderAnalytics9 orders={orders} aggregated={aggregated} defaultGrouping={filter} />
            </ChartWrapper>

            {/* THIS ONE is converted into an advanced map (Leaflet) */}
            <ChartWrapper title="Orders: Locations Map" chartId="ord-10">
              {/* OrderAnalytics10 should render a Leaflet map using react-leaflet and read 'orders' prop */}
              <OrderAnalytics10 orders={orders} />
            </ChartWrapper>

            {/* fallback small info panels */}
            <Row className="mt-3">
              <Col md={6}>
                <Card className="p-3 mb-3 shadow-sm">
                  <h6>Orders by {filter}</h6>
                  <ul className="list-unstyled mb-0">
                    {aggregated.periods.slice(-10).map((p) => (
                      <li key={p.period} className="d-flex justify-content-between py-1 border-bottom">
                        <small>{p.label}</small>
                        <strong>{p.orders} orders / {CURRENCY(p.revenue)}</strong>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="p-3 mb-3 shadow-sm">
                  <h6>Top Items (by quantity)</h6>
                  <ol className="mb-0">
                    {aggregated.topItems.map((it) => (
                      <li key={it.id} className="py-1">
                        <small>{it.name}</small>
                        <div className="text-muted small">Qty: {it.quantity} • Revenue: {CURRENCY(it.revenue)}</div>
                      </li>
                    ))}
                    {aggregated.topItems.length === 0 && <li className="text-muted">No items yet</li>}
                  </ol>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Card className="p-3 mb-3 shadow-sm">
                  <h6>Delivery distance distribution</h6>
                  <ul className="list-unstyled mb-0">
                    {Object.entries(aggregated.deliveryBuckets).map(([k, v]) => (
                      <li key={k} className="d-flex justify-content-between py-1 border-bottom">
                        <small>{k} km</small>
                        <strong>{v}</strong>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="p-3 mb-3 shadow-sm">
                  <h6>Quick summary</h6>
                  <div className="d-flex flex-column gap-1">
                    <div>Total Orders: <strong>{aggregated.totalOrders}</strong></div>
                    <div>Total Revenue: <strong>{CURRENCY(aggregated.totalRevenue)}</strong></div>
                    <div>Pending Orders: <strong>{aggregated.pendingOrders}</strong></div>
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </Container>
  );
};

export default Dashboard;
