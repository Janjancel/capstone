// // DemolishAnalytics2.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, Row, Col, Table } from "react-bootstrap";

// const API_URL = process.env.REACT_APP_API_URL || "";

// export default function DemolishAnalytics2() {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/demolish`);
//         setRequests(Array.isArray(res.data) ? res.data : []);
//       } catch (e) {
//         console.error("DemolishAnalytics2 fetch error:", e);
//         setRequests([]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const total = requests.length;
//   const ocular = requests.filter((r) => r.status === "ocular_scheduled" || r.scheduledDate).length;
//   const proposed = requests.filter((r) => typeof r.proposedPrice === "number").length;
//   const awaiting = requests.filter((r) => r.status === "awaiting_price_approval").length;
//   const accepted = requests.filter((r) => r.status === "price_accepted").length;
//   const declined = requests.filter((r) => r.status === "price_declined" || r.status === "declined").length;

//   const pct = (n) => (total === 0 ? "0%" : `${Math.round((n / total) * 100)}%`);
//   const acceptanceRate = awaiting ? `${Math.round((accepted / (accepted + declined || 1)) * 100)}%` : "—";

//   return (
//     <Card className="mb-3">
//       <Card.Body>
//         <h6>Price Negotiation Funnel</h6>
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
//                     <td>Ocular Scheduled</td>
//                     <td>{ocular}</td>
//                     <td>{pct(ocular)}</td>
//                   </tr>
//                   <tr>
//                     <td>Proposed Price</td>
//                     <td>{proposed}</td>
//                     <td>{pct(proposed)}</td>
//                   </tr>
//                   <tr>
//                     <td>Awaiting Approval</td>
//                     <td>{awaiting}</td>
//                     <td>{pct(awaiting)}</td>
//                   </tr>
//                   <tr>
//                     <td>Price Accepted</td>
//                     <td>{accepted}</td>
//                     <td>{pct(accepted)}</td>
//                   </tr>
//                   <tr>
//                     <td>Price Declined / Declined</td>
//                     <td>{declined}</td>
//                     <td>{pct(declined)}</td>
//                   </tr>
//                 </tbody>
//               </Table>
//             </Col>

//             <Col md={6}>
//               <div className="p-2">
//                 <p className="small text-muted">Conversion</p>
//                 <ul>
//                   <li>Acceptance rate (accepted vs accepted+declined): {acceptanceRate}</li>
//                   <li>If you have timestamps for proposals/acceptance we can compute median time-in-stage.</li>
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
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Legend } from "recharts";

const COLORS = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#b07aa1"];

export default function DemolishAnalytics2({ aggregated = {} }) {
  const statusCounts = aggregated.statusCounts || {};
  const data = Object.entries(statusCounts).map(([k, v]) => ({ name: k, value: v }));

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Demolition Status Distribution</h6>

      {data.length === 0 ? (
        <div className="text-muted">No demolition requests yet.</div>
      ) : (
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88} label>
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}


