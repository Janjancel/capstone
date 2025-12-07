// // DemolishAnalytics4.jsx
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
// const p90 = (a) => {
//   if (!a.length) return 0;
//   const s = a.slice().sort((x, y) => x - y);
//   const idx = Math.floor(0.9 * (s.length - 1));
//   return s[idx];
// };

// export default function DemolishAnalytics4() {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/demolish`);
//         setRequests(Array.isArray(res.data) ? res.data : []);
//       } catch (e) {
//         console.error("DemolishAnalytics4 fetch error:", e);
//         setRequests([]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const toOcular = [];
//   const toProposal = [];
//   const toAccept = [];
//   const toScheduled = [];

//   requests.forEach((r) => {
//     try {
//       if (r.createdAt && (r.scheduledDate || r.ocularVisit)) {
//         const created = new Date(r.createdAt).getTime();
//         const ocularTime = new Date(r.scheduledDate || r.ocularVisit).getTime();
//         if (!Number.isNaN(created) && !Number.isNaN(ocularTime) && ocularTime >= created) {
//           toOcular.push(msToHours(ocularTime - created));
//         }
//       }

//       // proposal: prefer proposedAt or use updatedAt when proposedPrice changed (fallback to null)
//       if (r.createdAt && r.proposedPrice && r.proposedAt) {
//         const created = new Date(r.createdAt).getTime();
//         const prop = new Date(r.proposedAt).getTime();
//         if (!Number.isNaN(created) && !Number.isNaN(prop) && prop >= created) {
//           toProposal.push(msToHours(prop - created));
//         }
//       }

//       // accept: prefer acceptedAt else updatedAt when status is price_accepted
//       if (r.createdAt) {
//         const created = new Date(r.createdAt).getTime();
//         const accAt = r.acceptedAt || (r.status === "price_accepted" && r.updatedAt) || null;
//         if (accAt) {
//           const acc = new Date(accAt).getTime();
//           if (!Number.isNaN(created) && !Number.isNaN(acc) && acc >= created) {
//             toAccept.push(msToHours(acc - created));
//           }
//         }
//       }

//       // scheduled (final demolition)
//       if (r.createdAt && r.scheduledDate && r.status === "scheduled") {
//         const created = new Date(r.createdAt).getTime();
//         const sched = new Date(r.scheduledDate).getTime();
//         if (!Number.isNaN(created) && !Number.isNaN(sched) && sched >= created) {
//           toScheduled.push(msToHours(sched - created));
//         }
//       }
//     } catch (e) {
//       // ignore parse errors
//     }
//   });

//   const scheduleMedian = median(toOcular);
//   const scheduleP90 = p90(toOcular);
//   const proposalMedian = median(toProposal);
//   const acceptMedian = median(toAccept);
//   const scheduledMedian = median(toScheduled);

//   return (
//     <Card className="mb-3">
//       <Card.Body>
//         <h6>Time-to-Event Metrics</h6>
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
//                     <td>Created → Ocular Scheduled</td>
//                     <td>{scheduleMedian ? scheduleMedian.toFixed(2) : "—"}</td>
//                     <td>{scheduleP90 ? scheduleP90.toFixed(2) : "—"}</td>
//                     <td>{toOcular.length}</td>
//                   </tr>
//                   <tr>
//                     <td>Created → Proposed</td>
//                     <td>{proposalMedian ? proposalMedian.toFixed(2) : "—"}</td>
//                     <td>—</td>
//                     <td>{toProposal.length}</td>
//                   </tr>
//                   <tr>
//                     <td>Created → Accepted</td>
//                     <td>{acceptMedian ? acceptMedian.toFixed(2) : "—"}</td>
//                     <td>—</td>
//                     <td>{toAccept.length}</td>
//                   </tr>
//                   <tr>
//                     <td>Created → Final Scheduled</td>
//                     <td>{scheduledMedian ? scheduledMedian.toFixed(2) : "—"}</td>
//                     <td>—</td>
//                     <td>{toScheduled.length}</td>
//                   </tr>
//                 </tbody>
//               </Table>
//             </Col>

//             <Col md={6}>
//               <div className="small text-muted">
//                 <p>Notes:</p>
//                 <ul>
//                   <li>Uses available timestamps (createdAt, proposedAt, acceptedAt, scheduledDate). Add explicit transition timestamps for higher-fidelity metrics.</li>
//                   <li>Units are hours. Consider converting to days for human-friendly SLAs.</li>
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
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function DemolishAnalytics4({ demolitions = [] }) {
  const points = (demolitions || [])
    .filter((d) => d.location && typeof d.location.lat === "number" && typeof d.location.lng === "number")
    .map((d, idx) => ({ id: idx, x: d.location.lng, y: d.location.lat, status: d.status || "unknown" }));

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Demolition Requests Location Scatter</h6>
      {points.length === 0 ? (
        <div className="text-muted">No location data yet.</div>
      ) : (
        <div style={{ width: "100%", height: 340 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="Longitude" />
              <YAxis type="number" dataKey="y" name="Latitude" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name, payload) => {
                if (name === "x") return [`${value}`, "Longitude"];
                if (name === "y") return [`${value}`, "Latitude"];
                return [value, name];
              }} />
              <Scatter name="Demolitions" data={points} fill="#4e79a7" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
