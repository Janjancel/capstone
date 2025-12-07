import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#4e79a7","#f28e2b","#e15759","#76b7b2","#59a14f","#b07aa1"];

export default function OrderAnalytics8({ aggregated = {} }) {
  const top = (aggregated.topItems || []).slice(0,6).map((it, idx) => ({ name: it.name, value: it.quantity }));
  if (!top.length) return <Card className="p-3 mb-3 shadow-sm"><h6 className="mb-2">Item Mix</h6><div className="text-muted">No item sales yet.</div></Card>;
  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Top Items Mix</h6>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={top} dataKey="value" nameKey="name" outerRadius={90} label>
              {top.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
