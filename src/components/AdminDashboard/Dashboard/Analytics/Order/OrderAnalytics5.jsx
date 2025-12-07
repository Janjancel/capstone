// // OrderAnalytics5.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, Row, Col, Table } from "react-bootstrap";

// const API_URL = process.env.REACT_APP_API_URL || "";

// const normalize = (s) => String(s || "").toLowerCase().replace(/\s+/g, "_");

// const pickGrand = (o) => {
//   const explicit =
//     o?.grandTotal ?? o?.finalTotal ?? o?.total ?? o?.totalAmount ?? 0;
//   if (explicit != null) return Number(explicit) || 0;
//   if (Array.isArray(o.items)) {
//     return o.items.reduce((sum, it) => sum + (Number(it.price || it.amount) || 0) * (Number(it.quantity) || 1), 0);
//   }
//   return 0;
// };

// export default function OrderAnalytics5() {
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
//         console.error("OrderAnalytics5 fetch error:", e);
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
//   const cancelled = orders.filter((o) => normalize(o.status) === "cancelled");
//   const cancellationRequests = orders.filter((o) => ["cancellation_requested", "cancel_requested"].includes(normalize(o.status)));
//   const cancelRate = total ? (cancelled.length / total) * 100 : 0;
//   const cancelValue = cancelled.reduce((s, o) => s + pickGrand(o), 0);
//   const avgCancelValue = cancelled.length ? cancelValue / cancelled.length : 0;

//   // time-to-cancel (createdAt -> updatedAt when cancellation requested or cancelled)
//   const times = [];
//   orders.forEach((o) => {
//     try {
//       const created = o.createdAt ? new Date(o.createdAt).getTime() : NaN;
//       const upd = (o.updatedAt ? new Date(o.updatedAt).getTime() : NaN) || NaN;
//       const s = normalize(o.status);
//       if (!isNaN(created) && !isNaN(upd) && (s === "cancelled" || s === "cancellation_requested")) {
//         times.push((upd - created) / (1000 * 60 * 60)); // hours
//       }
//     } catch (e) {
//       // ignore
//     }
//   });

//   const median = (arr) => {
//     if (!arr.length) return 0;
//     const s = arr.slice().sort((a, b) => a - b);
//     const mid = Math.floor(s.length / 2);
//     return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
//   };

//   const medianTimeToCancel = median(times);

//   return (
//     <Card className="mb-3">
//       <Card.Body>
//         <h6>Cancellation Analysis</h6>
//         {loading ? (
//           <div className="text-muted">Loading...</div>
//         ) : (
//           <Row>
//             <Col md={6}>
//               <Table size="sm" bordered>
//                 <thead>
//                   <tr>
//                     <th>Metric</th>
//                     <th>Value</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>Cancellation Rate</td>
//                     <td>{cancelRate.toFixed(2)}%</td>
//                   </tr>
//                   <tr>
//                     <td>Cancellation Requests</td>
//                     <td>{cancellationRequests.length}</td>
//                   </tr>
//                   <tr>
//                     <td>Cancelled Orders</td>
//                     <td>{cancelled.length}</td>
//                   </tr>
//                   <tr>
//                     <td>Avg Cancelled Order Value</td>
//                     <td>₱{avgCancelValue.toFixed(2)}</td>
//                   </tr>
//                   <tr>
//                     <td>Median Time-to-Cancel (hrs)</td>
//                     <td>{medianTimeToCancel ? medianTimeToCancel.toFixed(2) : "—"}</td>
//                   </tr>
//                 </tbody>
//               </Table>
//             </Col>

//             <Col md={6}>
//               <div className="small text-muted">
//                 <p>Actions</p>
//                 <ul>
//                   <li>Investigate reasons for cancellations to reduce preventable loss.</li>
//                   <li>Focus on high-value cancelled orders for recovery or feedback loops.</li>
//                 </ul>
//               </div>
//             </Col>
//           </Row>
//         )}
//       </Card.Body>
//     </Card>
//   );
// }

import React from 'react';
import { Card } from 'react-bootstrap';
import {
ResponsiveContainer,
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
Brush,
} from 'recharts';


// Recent orders timeline (line chart of count or amount depending on data)
export default function OrderAnalytics5({ aggregated = {}, orders = [], defaultGrouping = 'day' }) {
// We'll reuse aggregated.periods for timeline; if empty, fall back to recent orders per date
let data = (aggregated.periods || []).map((p) => ({ label: p.label, orders: p.orders, revenue: p.revenue }));


if (data.length === 0 && Array.isArray(orders) && orders.length > 0) {
// build simple date->count map for last 14 days
const map = new Map();
for (const o of orders.slice().reverse()) {
const d = new Date(o.createdAt || o.createdAt == 0 ? o.createdAt : Date.now());
const label = d.toLocaleDateString();
map.set(label, (map.get(label) || 0) + 1);
}
data = Array.from(map.entries()).slice(-14).map(([label, count]) => ({ label, orders: count }));
}


return (
<Card className="p-3 mb-3 shadow-sm">
<h6 className="mb-2">Orders Timeline</h6>
{data.length === 0 ? (
<div className="text-muted">No timeline data yet.</div>
) : (
<div style={{ width: '100%', height: 260 }}>
<ResponsiveContainer>
<LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="label" minTickGap={12} />
<YAxis />
<Tooltip formatter={(v, k) => (k === 'revenue' ? `₱${Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : v)} />
<Line type="monotone" dataKey="orders" stroke="#ff9da7" strokeWidth={2} dot={{ r: 3 }} />
<Line type="monotone" dataKey="revenue" stroke="#4e79a7" strokeWidth={2} dot={false} yAxisId={1} />
<Brush />
</LineChart>
</ResponsiveContainer>
</div>
)}
</Card>
);
}