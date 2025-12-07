// // DemolishAnalytics5.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, Row, Col, Table } from "react-bootstrap";

// const API_URL = process.env.REACT_APP_API_URL || "";

// const msToHours = (ms) => ms / 1000 / 60 / 60;
// const median = (a) => {
//   if (!a.length) return 0;
//   const s = a.slice().sort((x, y) => x - y);
//   const mid = Math.floor(s.length / 2);
//   return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
// };

// export default function DemolishAnalytics5() {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/demolish`);
//         setRequests(Array.isArray(res.data) ? res.data : []);
//       } catch (e) {
//         console.error("DemolishAnalytics5 fetch error:", e);
//         setRequests([]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const buckets = {
//     low: { label: "Below ₱5,000", rows: [] },
//     mid: { label: "₱5,000 – ₱20,000", rows: [] },
//     high: { label: "Above ₱20,000", rows: [] },
//   };

//   requests.forEach((r) => {
//     const price = Number(r.proposedPrice ?? r.price) || 0;
//     const bucket = price < 5000 ? "low" : price <= 20000 ? "mid" : "high";
//     buckets[bucket].rows.push(r);
//   });

//   const results = Object.keys(buckets).map((k) => {
//     const rows = buckets[k].rows;
//     const total = rows.length;
//     const accepted = rows.filter((r) => r.status === "price_accepted").length;
//     const scheduled = rows.filter((r) => r.status === "scheduled" || r.status === "price_accepted").length;

//     const scheduleHours = rows
//       .map((r) => {
//         if (!r.createdAt || !r.scheduledDate) return null;
//         const c = new Date(r.createdAt).getTime();
//         const o = new Date(r.scheduledDate).getTime();
//         if (Number.isNaN(c) || Number.isNaN(o) || o < c) return null;
//         return msToHours(o - c);
//       })
//       .filter((x) => x !== null);

//     return {
//       key: k,
//       label: buckets[k].label,
//       total,
//       accepted,
//       scheduled,
//       acceptRate: total ? (accepted / total) * 100 : 0,
//       scheduleRate: total ? (scheduled / total) * 100 : 0,
//       medianScheduleHours: scheduleHours.length ? median(scheduleHours) : 0,
//       sampleScheduleCount: scheduleHours.length,
//     };
//   });

//   return (
//     <Card className="mb-3">
//       <Card.Body>
//         <h6>Price Bucket Performance</h6>
//         {loading ? (
//           <div className="text-muted">Loading...</div>
//         ) : (
//           <Row className="mt-3">
//             <Col md={12}>
//               <Table size="sm" bordered>
//                 <thead>
//                   <tr>
//                     <th>Bucket</th>
//                     <th>Total</th>
//                     <th>Accepted</th>
//                     <th>Accept %</th>
//                     <th>Scheduled</th>
//                     <th>Schedule %</th>
//                     <th>Median Time-to-Schedule (hrs)</th>
//                     <th>Samples</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {results.map((r) => (
//                     <tr key={r.key}>
//                       <td>{r.label}</td>
//                       <td>{r.total}</td>
//                       <td>{r.accepted}</td>
//                       <td>{r.acceptRate ? `${r.acceptRate.toFixed(1)}%` : "—"}</td>
//                       <td>{r.scheduled}</td>
//                       <td>{r.scheduleRate ? `${r.scheduleRate.toFixed(1)}%` : "—"}</td>
//                       <td>{r.medianScheduleHours ? r.medianScheduleHours.toFixed(2) : "—"}</td>
//                       <td>{r.sampleScheduleCount}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </Col>
//           </Row>
//         )}
//       </Card.Body>
//     </Card>
//   );
// }


import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function DemolishAnalytics5({ aggregated = {} }) {
  // aggregated.geo expected to be [{bucket: "lat,lng", count: n}, ...]
  const data = (aggregated.geo || []).map((g) => ({ bucket: g.bucket, count: g.count }));

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Top Location Buckets</h6>
      {data.length === 0 ? (
        <div className="text-muted">No location data yet.</div>
      ) : (
        <div style={{ width: "100%", height: Math.min(60 + data.length * 36, 320) }}>
          <ResponsiveContainer>
            <BarChart layout="vertical" data={data} margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="bucket" type="category" width={140} />
              <Tooltip />
              <Bar dataKey="count" fill="#f28e2b" barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
