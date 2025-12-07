import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function DemolishAnalytics10({ aggregated = {} }) {
  const data = (aggregated.geo || []).slice(0,10).map(g => ({ bucket: g.bucket, count: g.count }));
  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Top Demolition Areas</h6>
      {data.length === 0 ? <div className="text-muted">No geo data.</div> : (
        <div style={{ width: "100%", height: Math.min(60 + data.length*34, 320) }}>
          <ResponsiveContainer>
            <BarChart layout="vertical" data={data} margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="bucket" type="category" width={140} />
              <Tooltip />
              <Bar dataKey="count" fill="#59a14f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
