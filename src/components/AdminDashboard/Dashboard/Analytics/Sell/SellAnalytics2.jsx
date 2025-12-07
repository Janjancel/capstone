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

export default function SellAnalytics2({ aggregated = {} }) {
  const data = (aggregated.topNames || []).map((t) => ({ name: t.name, count: t.count }));

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Top Listed Names (by count)</h6>
      {data.length === 0 ? (
        <div className="text-muted">No sell requests yet.</div>
      ) : (
        <div style={{ width: "100%", height: Math.min(60 + data.length * 36, 320) }}>
          <ResponsiveContainer>
            <BarChart layout="vertical" data={data} margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={160} />
              <Tooltip />
              <Bar dataKey="count" fill="#59a14f" barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
