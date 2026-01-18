// // SellAnalytics2.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, Row, Col, Table } from "react-bootstrap";

// const API_URL = process.env.REACT_APP_API_URL || "";

// export default function SellAnalytics2() {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/sell`);
//         setRequests(Array.isArray(res.data) ? res.data : []);
//       } catch (e) {
//         console.error("SellAnalytics2 fetch error:", e);
//         setRequests([]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const total = requests.length;
//   const pending = requests.filter((r) => (r.status || "pending") === "pending").length;
//   const ocular = requests.filter((r) => r.status === "ocular_scheduled" || Boolean(r.ocularVisit)).length;
//   const accepted = requests.filter((r) => r.status === "accepted").length;
//   const declined = requests.filter((r) => r.status === "declined").length;

//   const pct = (n) => (total === 0 ? "0%" : `${Math.round((n / total) * 100)}%`);

//   return (
//     <Card className="mb-3">
//       <Card.Body>
//         <h6>Conversion Funnel</h6>
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
//                     <th>% of total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>Requested</td>
//                     <td>{total}</td>
//                     <td>100%</td>
//                   </tr>
//                   <tr>
//                     <td>Pending</td>
//                     <td>{pending}</td>
//                     <td>{pct(pending)}</td>
//                   </tr>
//                   <tr>
//                     <td>Ocular Scheduled</td>
//                     <td>{ocular}</td>
//                     <td>{pct(ocular)}</td>
//                   </tr>
//                   <tr>
//                     <td>Accepted</td>
//                     <td>{accepted}</td>
//                     <td>{pct(accepted)}</td>
//                   </tr>
//                   <tr>
//                     <td>Declined</td>
//                     <td>{declined}</td>
//                     <td>{pct(declined)}</td>
//                   </tr>
//                 </tbody>
//               </Table>
//             </Col>
//             <Col md={6}>
//               <div className="p-2">
//                 <p className="small text-muted">Notes</p>
//                 <ul>
//                   <li>Counts are computed from current sell requests fetched from the API.</li>
//                   <li>For time-based funnel metrics you need server-side timestamps for each status transition.</li>
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
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function SellAnalytics2({ sells = [] }) {
  const total = sells.length || 1;
  const pending = sells.filter((s) => String(s.status || "").toLowerCase() === "pending").length;
  const accepted = sells.filter((s) => String(s.status || "").toLowerCase() !== "pending").length;
  const successRate = ((accepted / total) * 100).toFixed(1);
  const pendingRate = ((pending / total) * 100).toFixed(1);

  const stats = [
    { label: "Total Requests", value: total, color: "#8e44ad" },
    { label: "Pending", value: pending, percentage: pendingRate, color: "#f39c12" },
    { label: "Accepted/Completed", value: accepted, percentage: successRate, color: "#27ae60" },
  ];

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-3">Sell Request Status Summary</h6>
      {total === 0 ? (
        <div className="text-muted">No sell requests yet.</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>{stat.label}</span>
                <span style={{ fontSize: "0.9rem", color: stat.color, fontWeight: "bold" }}>
                  {stat.value} {stat.percentage && `(${stat.percentage}%)`}
                </span>
              </div>
              {stat.percentage && (
                <div style={{ background: "#e8e8e8", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                  <div
                    style={{
                      background: stat.color,
                      height: "100%",
                      width: `${stat.percentage}%`,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
