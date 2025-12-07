import React from "react";
import { Card } from "react-bootstrap";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function SellAnalytics6({ aggregated = {}, defaultGrouping = "day" }) {
  // Build cumulative counts
  const periods = aggregated.periods || [];
  let running = 0;
  const data = periods.map((p) => {
    running += p.requests || 0;
    return { label: p.label, cumulative: running };
  });

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Cumulative Sell Requests ({defaultGrouping})</h6>
      {data.length === 0 ? (
        <div className="text-muted">No data.</div>
      ) : (
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="cumulative" stroke="#4e79a7" fill="#dbe9f8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
