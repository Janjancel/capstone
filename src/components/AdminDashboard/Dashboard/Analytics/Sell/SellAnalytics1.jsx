


// import React from "react";
// import { Card } from "react-bootstrap";
// import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

// export default function SellAnalytics1({ aggregated = {}, sells = [], defaultGrouping = "day" }) {
//   const data = (aggregated.periods || []).map((p) => ({
//     label: p.label,
//     requests: p.requests,
//     avgAsking: p.requests > 0 ? +(p.askingTotal / p.requests).toFixed(2) : 0,
//   }));

//   return (
//     <Card className="p-3 mb-3 shadow-sm">
//       <h6 className="mb-2">Sell Requests & Average Asking ({defaultGrouping})</h6>
//       {data.length === 0 ? (
//         <div className="text-muted">No sell requests yet.</div>
//       ) : (
//         <div style={{ width: "100%", height: 280 }}>
//           <ResponsiveContainer>
//             <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="label" />
//               <YAxis yAxisId="left" />
//               <YAxis yAxisId="right" orientation="right" />
//               <Tooltip formatter={(v, key) => (key === "avgAsking" ? `₱${Number(v).toLocaleString("en-PH", { minimumFractionDigits: 2 })}` : v)} />
//               <Legend />
//               <Bar dataKey="requests" fill="#4e79a7" barSize={24} name="Requests" />
//               <Line yAxisId="right" type="monotone" dataKey="avgAsking" stroke="#e15759" strokeWidth={2} name="Avg Asking" />
//             </ComposedChart>
//           </ResponsiveContainer>
//         </div>
//       )}
//     </Card>
//   );
// }


// import React from "react";
// import { Card } from "react-bootstrap";
// import {
//   ResponsiveContainer,
//   ComposedChart,
//   Bar,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Legend
// } from "recharts";

// export default function SellAnalytics1({
//   aggregated = {},
//   defaultGrouping = "day"
// }) {
//   const data = (aggregated.periods || []).map((p) => ({
//     label: p.label,
//     requests: p.requests,
//     avgAsking:
//       p.requests > 0
//         ? +(p.askingTotal / p.requests).toFixed(2)
//         : 0
//   }));

//   return (
//     <Card className="p-3 mb-3 shadow-sm">
//       <h6 className="mb-2">
//         Sell Requests & Average Asking ({defaultGrouping})
//       </h6>

//       {data.length === 0 ? (
//         <div className="text-muted">No sell requests yet.</div>
//       ) : (
//         <div style={{ width: "100%", height: 280 }}>
//           <ResponsiveContainer>
//             <ComposedChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="label" />
//               <YAxis />
//               <YAxis yAxisId="right" orientation="right" />
//               <Tooltip
//                 formatter={(v, key) =>
//                   key === "avgAsking"
//                     ? `₱${Number(v).toLocaleString("en-PH", {
//                         minimumFractionDigits: 2
//                       })}`
//                     : v
//                 }
//               />
//               <Legend />
//               <Bar
//                 dataKey="requests"
//                 fill="#4e79a7"
//                 barSize={24}
//                 name="Requests"
//               />
//               <Line
//                 yAxisId="right"
//                 type="monotone"
//                 dataKey="avgAsking"
//                 stroke="#e15759"
//                 strokeWidth={2}
//                 name="Avg Asking"
//               />
//             </ComposedChart>
//           </ResponsiveContainer>
//         </div>
//       )}
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

export default function SellAnalytics1({
  aggregated = {},
  defaultGrouping = "day",
}) {
  const periods = aggregated.periods || [];
  const values = periods.map((p) => p.requests || 0);
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
      <h6 className="mb-2">Sell Requests Trend ({defaultGrouping})</h6>
      {periods.length === 0 ? (
        <div className="text-muted">No sell requests yet.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <svg width={width} height={height}>
            <defs>
              <linearGradient id="g_sell" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8e44ad" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#8e44ad" stopOpacity="0.04" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#g_sell)" stroke="none" />
            <path d={linePath} fill="none" stroke="#8e44ad" strokeWidth={2} />
            {points.map((pt, idx) => {
              const [x, y] = pt.split(",");
              return <circle key={idx} cx={x} cy={y} r={3} fill="#fff" stroke="#8e44ad" />;
            })}
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
