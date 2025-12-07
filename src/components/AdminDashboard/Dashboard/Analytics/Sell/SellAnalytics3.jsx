// // SellAnalytics3.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, Row, Col, Table } from "react-bootstrap";

// const API_URL = process.env.REACT_APP_API_URL || "";

// const median = (arr) => {
//   if (!arr || arr.length === 0) return 0;
//   const s = arr.slice().sort((a, b) => a - b);
//   const mid = Math.floor(s.length / 2);
//   return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
// };
// const iqr = (arr) => {
//   if (!arr || arr.length < 2) return 0;
//   const s = arr.slice().sort((a, b) => a - b);
//   const q1 = s[Math.floor((s.length - 1) * 0.25)];
//   const q3 = s[Math.floor((s.length - 1) * 0.75)];
//   return q3 - q1;
// };

// export default function SellAnalytics3() {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/sell`);
//         setRequests(Array.isArray(res.data) ? res.data : []);
//       } catch (e) {
//         console.error("SellAnalytics3 fetch error:", e);
//         setRequests([]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const byStatus = requests.reduce((acc, r) => {
//     const s = r.status || "pending";
//     acc[s] = acc[s] || [];
//     acc[s].push(Number(r.price) || 0);
//     return acc;
//   }, {});

//   const statusStats = Object.keys(byStatus).map((k) => ({
//     status: k,
//     count: byStatus[k].length,
//     median: median(byStatus[k]),
//     iqr: iqr(byStatus[k]),
//   }));

//   const byLoc = requests.reduce((acc, r) => {
//     const loc = r.location || {};
//     const key =
//       (loc.address && String(loc.address)) ||
//       (loc.lat && loc.lng ? `${Number(loc.lat).toFixed(2)},${Number(loc.lng).toFixed(2)}` : "Unknown");
//     acc[key] = acc[key] || [];
//     acc[key].push(Number(r.price) || 0);
//     return acc;
//   }, {});

//   const locStats = Object.keys(byLoc)
//     .map((k) => ({ loc: k, count: byLoc[k].length, median: median(byLoc[k]) }))
//     .sort((a, b) => b.count - a.count)
//     .slice(0, 8);

//   return (
//     <Card className="mb-3">
//       <Card.Body>
//         <h6>Price Distribution by Status & Location</h6>
//         {loading ? (
//           <div className="text-muted">Loading...</div>
//         ) : (
//           <Row className="mt-3">
//             <Col md={6}>
//               <Table size="sm" bordered>
//                 <thead>
//                   <tr>
//                     <th>Status</th>
//                     <th>Count</th>
//                     <th>Median</th>
//                     <th>IQR</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {statusStats.map((s) => (
//                     <tr key={s.status}>
//                       <td style={{ textTransform: "capitalize" }}>{s.status}</td>
//                       <td>{s.count}</td>
//                       <td>₱{Number(s.median).toLocaleString()}</td>
//                       <td>₱{Number(s.iqr).toLocaleString()}</td>
//                     </tr>
//                   ))}
//                   {statusStats.length === 0 && (
//                     <tr>
//                       <td colSpan={4} className="text-center text-muted">
//                         No data
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>
//             </Col>

//             <Col md={6}>
//               <Table size="sm" bordered>
//                 <thead>
//                   <tr>
//                     <th>Top Locations</th>
//                     <th>Count</th>
//                     <th>Median Price</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {locStats.map((l) => (
//                     <tr key={l.loc}>
//                       <td style={{ maxWidth: 220, wordBreak: "break-word" }}>{l.loc}</td>
//                       <td>{l.count}</td>
//                       <td>₱{Number(l.median).toLocaleString()}</td>
//                     </tr>
//                   ))}
//                   {locStats.length === 0 && (
//                     <tr>
//                       <td colSpan={3} className="text-center text-muted">
//                         No data
//                       </td>
//                     </tr>
//                   )}
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

function buildBuckets(sells = []) {
  // define php buckets: 0-5k,5-20k,20-50k,50-100k,100k+
  const buckets = [
    { name: "0-5k", min: 0, max: 5000, count: 0 },
    { name: "5-20k", min: 5000, max: 20000, count: 0 },
    { name: "20-50k", min: 20000, max: 50000, count: 0 },
    { name: "50-100k", min: 50000, max: 100000, count: 0 },
    { name: "100k+", min: 100000, max: Infinity, count: 0 },
  ];
  for (const s of sells) {
    const p = Number(s.price || 0);
    for (const b of buckets) {
      if (p >= b.min && p < b.max) {
        b.count++;
        break;
      }
    }
  }
  return buckets.map((b) => ({ bucket: b.name, count: b.count }));
}

export default function SellAnalytics3({ sells = [], aggregated = {} }) {
  const data = buildBuckets(sells);

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Asking Price Distribution</h6>
      {data.length === 0 ? (
        <div className="text-muted">No price data yet.</div>
      ) : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#76b7b2" barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
