import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function OrderAnalytics6({ orders = [], aggregated = {} }) {
  const map = new Map();
  (orders || []).forEach(o => {
    const email = o.userEmail || o.email || "anonymous";
    const amt = o.grandTotal != null ? Number(o.grandTotal) : (Number(o.total) || 0);
    map.set(email, (map.get(email) || 0) + amt);
  });
  const data = Array.from(map.entries()).map(([k,v]) => ({ customer: k, revenue: +v.toFixed(2) }))
    .sort((a,b)=>b.revenue - a.revenue).slice(0,10);

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Top Customers by Revenue</h6>
      {data.length === 0 ? <div className="text-muted">No orders yet.</div> : (
        <div style={{ width: "100%", height: Math.min(60 + data.length*38, 320) }}>
          <ResponsiveContainer>
            <BarChart layout="vertical" data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="customer" type="category" width={180} />
              <Tooltip formatter={(v)=>`₱${Number(v).toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#4e79a7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
