// // OrderAnalytics2.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, Row, Col, Table } from "react-bootstrap";

// const API_URL = process.env.REACT_APP_API_URL || "";

// const normalize = (s) =>
//   String(s || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

// export default function OrderAnalytics2() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/orders`);
//         if (!mounted) return;
//         setOrders(Array.isArray(res.data) ? res.data : []);
//       } catch (e) {
//         console.error("OrderAnalytics2 fetch error:", e);
//         if (!mounted) return;
//         setOrders([]);
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     })();
//     return () => (mounted = false);
//   }, []);

//   const total = orders.length;
//   const shipped = orders.filter((o) => normalize(o.status) === "shipped").length;
//   const delivered = orders.filter((o) => normalize(o.status) === "delivered").length;
//   const cancellationRequested = orders.filter((o) => ["cancellation_requested", "cancel_request", "cancel_requested"].includes(normalize(o.status))).length;
//   const cancelled = orders.filter((o) => normalize(o.status) === "cancelled").length;
//   const pending = orders.filter((o) => normalize(o.status) === "pending" || !o.status).length;
//   const processing = orders.filter((o) => normalize(o.status) === "processing").length;

//   const pct = (n) => (total === 0 ? "0%" : `${Math.round((n / total) * 100)}%`);

//   return (
//     <Card className="mb-3">
//       <Card.Body>
//         <h6>Fulfillment Funnel</h6>
//         {loading ? (
//           <div className="text-muted">Loading...</div>
//         ) : (
//           <Row className="mt-3">
//             <Col md={6}>
//               <Table size="sm" bordered>
//                 <thead>
//                   <tr>
//                     <th>Stage</th>
//                     <th>Count</th>
//                     <th>%</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>Placed (Total)</td>
//                     <td>{total}</td>
//                     <td>100%</td>
//                   </tr>
//                   <tr>
//                     <td>Pending</td>
//                     <td>{pending}</td>
//                     <td>{pct(pending)}</td>
//                   </tr>
//                   <tr>
//                     <td>Processing</td>
//                     <td>{processing}</td>
//                     <td>{pct(processing)}</td>
//                   </tr>
//                   <tr>
//                     <td>Shipped</td>
//                     <td>{shipped}</td>
//                     <td>{pct(shipped)}</td>
//                   </tr>
//                   <tr>
//                     <td>Delivered</td>
//                     <td>{delivered}</td>
//                     <td>{pct(delivered)}</td>
//                   </tr>
//                   <tr>
//                     <td>Cancellation Requested</td>
//                     <td>{cancellationRequested}</td>
//                     <td>{pct(cancellationRequested)}</td>
//                   </tr>
//                   <tr>
//                     <td>Cancelled</td>
//                     <td>{cancelled}</td>
//                     <td>{pct(cancelled)}</td>
//                   </tr>
//                 </tbody>
//               </Table>
//             </Col>

//             <Col md={6}>
//               <div className="small text-muted">
//                 <p>Notes</p>
//                 <ul>
//                   <li>Conversion rates show where orders drop off.</li>
//                   <li>If you have timestamps for transitions we can compute time-in-stage metrics here too.</li>
//                 </ul>
//               </div>
//             </Col>
//           </Row>
//         )}
//       </Card.Body>
//     </Card>
//   );
// }

import React from "react";
import { Card } from "react-bootstrap";


// Orders count bar chart (simple SVG)
export default function OrderAnalytics2({ aggregated = {}, defaultGrouping = "day" }) {
const periods = aggregated.periods || [];
const values = periods.map((p) => p.orders || 0);
const width = Math.max(360, Math.min(1000, 120 + values.length * 60));
const height = 180;
const padding = 28;
const max = Math.max(...values, 1);


return (
<Card className="p-3 mb-3 shadow-sm">
<h6 className="mb-2">Orders ({defaultGrouping})</h6>
{periods.length === 0 ? (
<div className="text-muted">No orders yet.</div>
) : (
<div style={{ overflowX: "auto" }}>
<svg width={width} height={height}>
{periods.map((p, i) => {
const barW = Math.min(48, (width - padding * 2) / periods.length - 6);
const x = padding + i * (barW + 6);
const barH = ((p.orders || 0) / max) * (height - padding * 2);
const y = height - padding - barH;
return (
<g key={p.period}>
<rect x={x} y={y} width={barW} height={barH} rx={3} fill="#59a14f" />
<text x={x + barW / 2} y={height - 8} fontSize={10} textAnchor="middle">
{p.label}
</text>
</g>
);
})}
</svg>
</div>
)}
</Card>
);
}