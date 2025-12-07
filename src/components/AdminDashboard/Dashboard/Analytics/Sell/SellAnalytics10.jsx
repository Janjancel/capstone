import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function SellAnalytics10({ sells = [] }) {
  const hours = new Array(24).fill(0);
  (sells || []).forEach(s => {
    const d = s.createdAt ? new Date(s.createdAt) : null;
    const h = d ? d.getHours() : 0;
    hours[h] += 1;
  });
  const data = hours.map((c, i) => ({ hour: `${i}:00`, count: c }));

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Submissions by Hour (local time)</h6>
      {data.reduce((s,v)=>s+v.count,0) === 0 ? <div className="text-muted">No data.</div> : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#76b7b2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
