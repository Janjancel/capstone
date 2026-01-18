// // OrderAnalytics3.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, Row, Col, Table } from "react-bootstrap";

// const API_URL = process.env.REACT_APP_API_URL || "";

// const msToHours = (ms) => ms / 1000 / 60 / 60;
// const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : NaN);
// const median = (arr) => {
//   if (!arr || arr.length === 0) return 0;
//   const s = arr.slice().sort((a, b) => a - b);
//   const mid = Math.floor(s.length / 2);
//   return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
// };
// const pctile = (arr, p) => {
//   if (!arr || arr.length === 0) return 0;
//   const s = arr.slice().sort((a, b) => a - b);
//   const idx = Math.min(s.length - 1, Math.floor(p * s.length));
//   return s[idx];
// };

// export default function OrderAnalytics3() {
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
//         console.error("OrderAnalytics3 fetch error:", e);
//         if (!mounted) return;
//         setOrders([]);
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     })();
//     return () => (mounted = false);
//   }, []);

//   const toShip = [];
//   const toDeliver = [];

//   orders.forEach((o) => {
//     try {
//       // Prefer explicit timestamps if present
//       const created = o.createdAt ? new Date(o.createdAt).getTime() : NaN;
//       const shippedAt = o.shippedAt ? new Date(o.shippedAt).getTime() : NaN;
//       const deliveredAt = o.deliveredAt ? new Date(o.deliveredAt).getTime() : NaN;

//       // fallback heuristics: if no shippedAt/deliveredAt, try using updatedAt with status checks (best-effort)
//       if (!Number.isFinite(shippedAt) && o.status && String(o.status).toLowerCase().includes("shipped") && o.updatedAt) {
//         const upd = new Date(o.updatedAt).getTime();
//         if (Number.isFinite(upd)) {
//           toShip.push(msToHours(upd - created));
//         }
//       } else if (Number.isFinite(created) && Number.isFinite(shippedAt) && shippedAt >= created) {
//         toShip.push(msToHours(shippedAt - created));
//       }

//       if (!Number.isFinite(deliveredAt) && o.status && String(o.status).toLowerCase().includes("delivered") && o.updatedAt) {
//         const upd = new Date(o.updatedAt).getTime();
//         if (Number.isFinite(created) && Number.isFinite(upd) && upd >= created) {
//           toDeliver.push(msToHours(upd - created));
//         }
//       } else if (Number.isFinite(shippedAt) && Number.isFinite(deliveredAt) && deliveredAt >= shippedAt) {
//         toDeliver.push(msToHours(deliveredAt - shippedAt));
//       } else if (Number.isFinite(created) && Number.isFinite(deliveredAt) && deliveredAt >= created) {
//         toDeliver.push(msToHours(deliveredAt - created));
//       }
//     } catch (e) {
//       // ignore
//     }
//   });

//   const shipMedian = median(toShip);
//   const shipP90 = pctile(toShip, 0.9);
//   const deliverMedian = median(toDeliver);
//   const deliverP90 = pctile(toDeliver, 0.9);

//   return (
//     <Card className="mb-3">
//       <Card.Body>
//         <h6>Timing & SLA Metrics</h6>
//         {loading ? (
//           <div className="text-muted">Loading...</div>
//         ) : (
//           <Row>
//             <Col md={6}>
//               <Table size="sm" bordered>
//                 <thead>
//                   <tr>
//                     <th>Metric</th>
//                     <th>Median (hrs)</th>
//                     <th>90th pct (hrs)</th>
//                     <th>Samples</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>Order → Ship</td>
//                     <td>{shipMedian ? shipMedian.toFixed(2) : "—"}</td>
//                     <td>{shipP90 ? shipP90.toFixed(2) : "—"}</td>
//                     <td>{toShip.length}</td>
//                   </tr>
//                   <tr>
//                     <td>Ship → Deliver</td>
//                     <td>{deliverMedian ? deliverMedian.toFixed(2) : "—"}</td>
//                     <td>{deliverP90 ? deliverP90.toFixed(2) : "—"}</td>
//                     <td>{toDeliver.length}</td>
//                   </tr>
//                 </tbody>
//               </Table>
//             </Col>

//             <Col md={6}>
//               <div className="small text-muted">
//                 <p>Notes</p>
//                 <ul>
//                   <li>Units are hours. Convert to days for SLA communications.</li>
//                   <li>Accuracy depends on explicit `shippedAt` / `deliveredAt` fields; otherwise we use heuristics.</li>
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
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
Legend,
} from 'recharts';


// Top items by quantity (horizontal bar chart)
export default function OrderAnalytics3({ aggregated = {}, defaultGrouping = "day" }) {
const periods = aggregated.periods || [];
const values = periods.map((p) => (p.orders > 0 ? p.revenue / p.orders : 0));
const width = Math.max(600, Math.min(1200, 120 + values.length * 60));
const height = 200;
const padding = 36;
const max = Math.max(...values, 1);

const points = values.map((v, i) => {
  const x = padding + (i / Math.max(1, values.length - 1)) * (width - padding * 2);
  const y = height - padding - (v / max) * (height - padding * 2);
  return `${x},${y}`;
});

const areaPath = values.length ? `M ${points[0]} L ${points.slice(1).join(" ")} L ${width - padding},${height - padding} L ${padding},${height - padding} Z` : "";
const linePath = values.length ? `M ${points.join(" L ")}` : "";

return (
  <Card className="p-3 mb-3 shadow-sm">
    <h6 className="mb-2">Average Order Value - AOV ({defaultGrouping})</h6>
    {periods.length === 0 ? (
      <div className="text-muted">No AOV data yet.</div>
    ) : (
      <div style={{ overflowX: "auto" }}>
        <svg width={width} height={height}>
          <defs>
            <linearGradient id="g_aov" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#e15759" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#e15759" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#g_aov)" stroke="none" />
          <path d={linePath} fill="none" stroke="#e15759" strokeWidth={2} />
          {points.map((pt, idx) => {
            const [x, y] = pt.split(",");
            return <circle key={idx} cx={x} cy={y} r={3} fill="#fff" stroke="#e15759" />;
          })}
          {periods.map((p, i) => {
            const x = padding + (i / Math.max(1, periods.length - 1)) * (width - padding * 2);
            return (
              <text key={p.period} x={x} y={height - 8} textAnchor="middle" fontSize={10} fill="#333">
                {p.label}
              </text>
            );
          })}
        </svg>
      </div>
    )}
  </Card>
);
}