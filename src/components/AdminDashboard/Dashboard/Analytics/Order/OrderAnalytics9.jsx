import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export default function OrderAnalytics9({ orders = [], aggregated = {}, defaultGrouping = "day" }) {
  // build counts per period per status
  const periods = (aggregated.periods || []).map(p => ({ period: p.period, label: p.label }));
  const statusSet = new Set((orders||[]).map(o => (o.status||"unknown")));
  const statuses = Array.from(statusSet);
  const map = new Map(); // period -> {status:count}
  for (const p of periods) map.set(p.period, {});
  (orders || []).forEach(o => {
    const date = o.createdAt ? new Date(o.createdAt) : new Date();
    const periodKey = new Date(date); periodKey.setHours(0,0,0,0);
    const iso = periodKey.toISOString();
    const entry = map.get(iso) || {};
    const st = o.status || "unknown";
    entry[st] = (entry[st] || 0) + 1;
    map.set(iso, entry);
  });
  const data = periods.map(p => {
    const row = { label: p.label };
    const entry = map.get(p.period) || {};
    statuses.forEach(s => row[s] = entry[s] || 0);
    return row;
  });

  if (data.length === 0) return <Card className="p-3 mb-3 shadow-sm"><h6 className="mb-2">Order Status Over Time</h6><div className="text-muted">No data.</div></Card>;

  const colors = ["#4e79a7","#f28e2b","#e15759","#76b7b2","#59a14f","#b07aa1"];
  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Order Status Over Time ({defaultGrouping})</h6>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={data} stackOffset="expand" margin={{ top: 8, right: 12, left: 0, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={v => `${Math.round(v*100)}%`} />
            <Tooltip />
            <Legend />
            {statuses.map((s, i) => (
              <Area key={s} type="monotone" dataKey={s} stackId="1" stroke={colors[i % colors.length]} fill={colors[i % colors.length]} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
