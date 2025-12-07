import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function DemolishAnalytics6({ aggregated = {}, defaultGrouping = "day" }) {
  const periods = aggregated.periods || [];
  let run = 0;
  const data = periods.map(p => { run += p.requests || 0; return { label: p.label, cum: run }; });

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Cumulative Demolition Requests ({defaultGrouping})</h6>
      {data.length === 0 ? <div className="text-muted">No data</div> : (
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area dataKey="cum" stroke="#b07aa1" fill="#f3e9f2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
