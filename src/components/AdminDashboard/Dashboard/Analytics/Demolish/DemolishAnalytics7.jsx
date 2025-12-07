import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function DemolishAnalytics7({ demolitions = [] }) {
  // buckets for proposedPrice similar to sell
  const buckets = [
    { name: "0-5k", min:0, max:5000, count:0 },
    { name: "5-20k", min:5000, max:20000, count:0 },
    { name: "20-50k", min:20000, max:50000, count:0 },
    { name: "50-100k", min:50000, max:100000, count:0 },
    { name: "100k+", min:100000, max:Infinity, count:0 },
  ];
  (demolitions || []).forEach(d => {
    const v = Number(d.proposedPrice || d.price || 0);
    for (const b of buckets) {
      if (v >= b.min && v < b.max) { b.count++; break; }
    }
  });
  const data = buckets.map(b => ({ bucket: b.name, count: b.count }));

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Proposed/Accepted Price Distribution</h6>
      {data.every(d => d.count===0) ? <div className="text-muted">No price data</div> : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4e79a7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
