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
  const avgProposed = aggregated.avgProposedOverall || 0;
  const avgAccepted = aggregated.avgAcceptedOverall || 0;
  const difference = avgAccepted > 0 ? avgProposed - avgAccepted : 0;
  const diffPercent = avgProposed > 0 ? ((difference / avgProposed) * 100).toFixed(1) : 0;

  const formatPrice = (p) => {
    const num = Number.isFinite(Number(p)) ? Number(p) : 0;
    return `₱${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-3">Price Negotiation Summary</h6>
      {avgProposed === 0 ? (
        <div className="text-muted">No price data yet.</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          <div>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>Average Proposed Price</span>
              <span style={{ fontSize: "0.9rem", color: "#f39c12", fontWeight: "bold" }}>
                {formatPrice(avgProposed)}
              </span>
            </div>
            <div style={{ background: "#e8e8e8", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
              <div style={{ background: "#f39c12", height: "100%", width: "100%" }} />
            </div>
          </div>

          <div>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>Average Accepted Price</span>
              <span style={{ fontSize: "0.9rem", color: "#27ae60", fontWeight: "bold" }}>
                {formatPrice(avgAccepted)}
              </span>
            </div>
            <div style={{ background: "#e8e8e8", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
              <div
                style={{
                  background: "#27ae60",
                  height: "100%",
                  width: `${avgProposed > 0 ? (avgAccepted / avgProposed) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="pt-2 border-top">
            <div className="d-flex justify-content-between">
              <span style={{ fontSize: "0.85rem" }}>Price Negotiation Discount</span>
              <span style={{ fontSize: "0.85rem", color: "#e74c3c", fontWeight: "bold" }}>
                {formatPrice(difference)} ({diffPercent}%)
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}


