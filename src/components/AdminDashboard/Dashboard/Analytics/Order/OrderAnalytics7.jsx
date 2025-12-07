import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function OrderAnalytics7({ orders = [] }) {
  const buckets = [
    { name: "0-500", min:0, max:500, count:0 },
    { name: "500-2k", min:500, max:2000, count:0 },
    { name: "2k-5k", min:2000, max:5000, count:0 },
    { name: "5k-20k", min:5000, max:20000, count:0 },
    { name: "20k+", min:20000, max:Infinity, count:0 },
  ];
  (orders || []).forEach(o => {
    const amt = o.grandTotal != null ? Number(o.grandTotal) : (Number(o.total) || 0);
    for (const b of buckets) if (amt >= b.min && amt < b.max) { b.count++; break; }
  });
  const data = buckets.map(b => ({ bucket: b.name, count: b.count }));

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Average Order Value Distribution</h6>
      {data.every(d=>d.count===0) ? <div className="text-muted">No data.</div> : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#e15759" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
