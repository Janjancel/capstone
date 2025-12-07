// // OrderAnalytics1.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, Row, Col, Table, Form } from "react-bootstrap";

// const API_URL = process.env.REACT_APP_API_URL || "";

// const fmtDateKey = (d) => d.toISOString().slice(0, 10);
// const fmtWeekKey = (d) => {
//   const copy = new Date(d);
//   const day = copy.getDay();
//   copy.setDate(copy.getDate() - day); // week start = Sunday
//   return fmtDateKey(copy);
// };
// const fmtMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

// const groupBy = (items, fn) =>
//   items.reduce((acc, it) => {
//     const k = fn(it);
//     acc[k] = acc[k] || [];
//     acc[k].push(it);
//     return acc;
//   }, {});

// export default function OrderAnalytics1({ defaultGrouping = "day" }) {
//   const [orders, setOrders] = useState([]);
//   const [group, setGroup] = useState(defaultGrouping);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/orders`);
//         if (!mounted) return;
//         setOrders(Array.isArray(res.data) ? res.data : []);
//       } catch (e) {
//         console.error("OrderAnalytics1 fetch error:", e);
//         if (!mounted) return;
//         setOrders([]);
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const series = (() => {
//     const items = orders.filter((o) => o.createdAt);
//     const grouped = groupBy(items, (o) => {
//       const d = new Date(o.createdAt);
//       if (group === "day") return fmtDateKey(d);
//       if (group === "week") return fmtWeekKey(d);
//       return fmtMonthKey(d);
//     });
//     const keys = Object.keys(grouped).sort();
//     return keys.map((k) => ({ key: k, count: grouped[k].length }));
//   })();

//   const max = series.length ? Math.max(...series.map((s) => s.count)) : 0;

//   return (
//     <Card className="mb-3">
//       <Card.Body>
//         <div className="d-flex justify-content-between align-items-center mb-2">
//           <h6 className="mb-0">Orders Over Time</h6>
//           <Form.Select style={{ width: 160 }} value={group} onChange={(e) => setGroup(e.target.value)}>
//             <option value="day">Group by Day</option>
//             <option value="week">Group by Week</option>
//             <option value="month">Group by Month</option>
//           </Form.Select>
//         </div>

//         {loading ? (
//           <div className="text-muted">Loading...</div>
//         ) : (
//           <Row>
//             <Col md={4}>
//               <Table size="sm" bordered>
//                 <thead>
//                   <tr>
//                     <th>Period</th>
//                     <th>Orders</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {series.map((s) => (
//                     <tr key={s.key}>
//                       <td style={{ maxWidth: 160, wordBreak: "break-word" }}>{s.key}</td>
//                       <td>{s.count}</td>
//                     </tr>
//                   ))}
//                   {series.length === 0 && (
//                     <tr>
//                       <td colSpan={2} className="text-center text-muted">
//                         No data
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>
//             </Col>

//             <Col md={8}>
//               <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 8 }}>
//                 {series.length === 0 ? (
//                   <div className="text-muted">No chart data</div>
//                 ) : (
//                   series.map((s) => {
//                     const h = max ? Math.max(8, (s.count / max) * 140) : 8;
//                     return (
//                       <div key={s.key} style={{ flex: 1, textAlign: "center" }}>
//                         <div
//                           title={`${s.key}: ${s.count}`}
//                           style={{
//                             height: `${h}px`,
//                             marginBottom: 6,
//                             background: "#0d6efd",
//                             borderRadius: 4,
//                           }}
//                         />
//                         <small style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
//                           {s.key}
//                         </small>
//                       </div>
//                     );
//                   })
//                 )}
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


// Revenue line/area chart (SVG)
export default function OrderAnalytics1({ aggregated = {}, defaultGrouping = "day" }) {
const periods = aggregated.periods || [];
const values = periods.map((p) => p.revenue || 0);
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
<h6 className="mb-2">Revenue ({defaultGrouping})</h6>
{periods.length === 0 ? (
<div className="text-muted">No revenue data yet.</div>
) : (
<div style={{ overflowX: "auto" }}>
<svg width={width} height={height}>
<defs>
<linearGradient id="g_area" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#4e79a7" stopOpacity="0.28" />
<stop offset="100%" stopColor="#4e79a7" stopOpacity="0.04" />
</linearGradient>
</defs>


<path d={areaPath} fill="url(#g_area)" stroke="none" />
<path d={linePath} fill="none" stroke="#4e79a7" strokeWidth={2} />


{points.map((pt, idx) => {
const [x, y] = pt.split(",");
return <circle key={idx} cx={x} cy={y} r={3} fill="#fff" stroke="#4e79a7" />;
})}


{/* x labels */}
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