// // DemolishAnalytics3.jsx
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

// export default function DemolishAnalytics3() {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/demolish`);
//         setRequests(Array.isArray(res.data) ? res.data : []);
//       } catch (e) {
//         console.error("DemolishAnalytics3 fetch error:", e);
//         setRequests([]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const byStatus = requests.reduce((acc, r) => {
//     const s = r.status || "pending";
//     acc[s] = acc[s] || [];
//     acc[s].push(Number(r.proposedPrice ?? r.price) || 0);
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
//     acc[key].push(Number(r.proposedPrice ?? r.price) || 0);
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
import {
  ResponsiveContainer,
  LineChart,
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

export default function DemolishAnalytics3({ demolitions = [], aggregated = {}, defaultGrouping = "day" }) {
  // Build per-period values: avgProposed already in aggregated.periods,
  // we will also compute avgAccepted per period from raw demolitions
  const acceptedByPeriod = {};
  (demolitions || []).forEach((d) => {
    const date = d.createdAt ? new Date(d.createdAt) : new Date();
    // key matching format used in aggregated.periods (aggregator uses startOfPeriod ISO)
    // best-effort: use same label string if aggregated.periods contains same period value
    // fallback: group by day label
    const key = (aggregated.periods || []).find((p) => {
      // match by label (cheap heuristic)
      return new Date(p.period).toDateString() === new Date(date).setHours(0,0,0,0) ||
             p.label === new Date(date).toLocaleDateString();
    });
    // Simpler safe approach: group by day ISO
    const dayKey = new Date(date);
    dayKey.setHours(0, 0, 0, 0);
    const iso = dayKey.toISOString();

    acceptedByPeriod[iso] = acceptedByPeriod[iso] || { sum: 0, count: 0 };
    if (d.price != null && Number.isFinite(Number(d.price))) {
      acceptedByPeriod[iso].sum += Number(d.price);
      acceptedByPeriod[iso].count += 1;
    }
  });

  const data = (aggregated.periods || []).map((p) => {
    // preference: aggregated.avgProposed from p.avgProposed
    const avgProposed = p.avgProposed != null ? p.avgProposed : null;
    // accepted: try to find matching ISO in acceptedByPeriod; fallback to aggregated.avgAcceptedOverall
    const acceptedEntry = acceptedByPeriod[p.period];
    const avgAccepted = acceptedEntry && acceptedEntry.count ? +(acceptedEntry.sum / acceptedEntry.count).toFixed(2) : null;
    return {
      label: p.label,
      avgProposed,
      avgAccepted,
    };
  });

  // If no period-level accepted data, use aggregated.avgAcceptedOverall as single flat line
  const fallbackAccepted = aggregated.avgAcceptedOverall || null;

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Avg Proposed vs Avg Accepted Prices ({defaultGrouping})</h6>

      {data.length === 0 ? (
        <div className="text-muted">No price data available yet.</div>
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(v) => (v == null ? "—" : CURRENCY(v))} />
              <Legend />
              <Line type="monotone" dataKey="avgProposed" stroke="#e15759" name="Avg Proposed" dot />
              <Line
                type="monotone"
                dataKey="avgAccepted"
                stroke="#59a14f"
                name="Avg Accepted"
                dot
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {(fallbackAccepted && !data.some((d) => d.avgAccepted != null)) && (
        <div className="mt-2 text-muted small">
          Note: no period-level accepted prices found — overall avg accepted = {CURRENCY(fallbackAccepted)}
        </div>
      )}
    </Card>
  );
}
