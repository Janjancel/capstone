import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function daysSince(date) {
  if (!date) return 0;
  const d = new Date(date);
  return Math.floor((Date.now() - d.getTime()) / (1000*60*60*24));
}

export default function SellAnalytics9({ sells = [] }) {
  const points = (sells || []).map((s, i) => ({
    x: Number(s.price || 0),
    y: daysSince(s.createdAt),
    name: s.name || `#${i}`,
  })).filter(p => isFinite(p.x) && isFinite(p.y));

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Price vs Age (days)</h6>
      {points.length === 0 ? <div className="text-muted">No data.</div> : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid />
              <XAxis dataKey="x" name="Price (PHP)" />
              <YAxis dataKey="y" name="Age (days)" />
              <Tooltip formatter={(val, name, payload) => {
                if (name === "x") return [`₱${Number(val).toLocaleString()}`, "Price"];
                if (name === "y") return [val, "Days"];
                return [val, name];
              }} />
              <Scatter data={points} fill="#e15759" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
