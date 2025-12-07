// // DemolishAnalytics1.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, Row, Col, Table, Form } from "react-bootstrap";

// const API_URL = process.env.REACT_APP_API_URL || "";

// const groupBy = (items, keyFn) =>
//   items.reduce((acc, it) => {
//     const k = keyFn(it);
//     acc[k] = acc[k] || [];
//     acc[k].push(it);
//     return acc;
//   }, {});

// const fmtDateKey = (d) => d.toISOString().slice(0, 10);
// const fmtWeekKey = (d) => {
//   const copy = new Date(d);
//   const day = copy.getDay();
//   copy.setDate(copy.getDate() - day);
//   return fmtDateKey(copy);
// };
// const fmtMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

// export default function DemolishAnalytics1({ defaultGrouping = "day" }) {
//   const [requests, setRequests] = useState([]);
//   const [group, setGroup] = useState(defaultGrouping);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/demolish`);
//         setRequests(Array.isArray(res.data) ? res.data : []);
//       } catch (e) {
//         console.error("DemolishAnalytics1 fetch error:", e);
//         setRequests([]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const series = (() => {
//     const items = requests.filter((r) => r.createdAt);
//     const grouped = groupBy(items, (r) => {
//       const d = new Date(r.createdAt);
//       if (group === "day") return fmtDateKey(d);
//       if (group === "week") return fmtWeekKey(d);
//       return fmtMonthKey(d);
//     });
//     const keys = Object.keys(grouped).sort();
//     return keys.map((k) => ({ key: k, count: grouped[k].length }));
//   })();

//   const maxCount = series.length ? Math.max(...series.map((s) => s.count)) : 0;

//   return (
//     <Card className="mb-3">
//       <Card.Body>
//         <div className="d-flex justify-content-between align-items-center mb-2">
//           <h6 className="mb-0">Demolish Requests Over Time</h6>
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
//                     <th>Count</th>
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
//                     const height = maxCount ? Math.max(8, (s.count / maxCount) * 140) : 8;
//                     return (
//                       <div key={s.key} style={{ flex: 1, textAlign: "center" }}>
//                         <div
//                           title={`${s.key}: ${s.count}`}
//                           style={{
//                             height: `${height}px`,
//                             marginBottom: 6,
//                             background: "#198754",
//                             borderRadius: 4,
//                             transition: "height .2s ease",
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
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const CURRENCY = (n) =>
  `₱${(Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function DemolishAnalytics1({ aggregated = {}, defaultGrouping = "day" }) {
  const data = (aggregated.periods || []).map((p) => ({
    label: p.label,
    requests: p.requests || 0,
    avgProposed: p.avgProposed != null ? p.avgProposed : null,
  }));

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Demolition Requests & Avg Proposed ({defaultGrouping})</h6>

      {data.length === 0 ? (
        <div className="text-muted">No demolition requests yet.</div>
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis yAxisId="left" label={{ value: "Requests", angle: -90, position: "insideLeft" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "Avg Proposed (PHP)", angle: -90, position: "insideRight" }}
              />
              <Tooltip formatter={(value, name) => (name === "avgProposed" ? CURRENCY(value) : value)} />
              <Legend />
              <Bar dataKey="requests" yAxisId="left" name="Requests" barSize={24} fill="#4e79a7" />
              <Line
                dataKey="avgProposed"
                yAxisId="right"
                name="Avg Proposed"
                type="monotone"
                stroke="#e15759"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
