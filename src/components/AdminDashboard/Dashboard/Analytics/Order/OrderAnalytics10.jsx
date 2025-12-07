import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function OrderAnalytics10({ orders = [] }) {
  const points = (orders || []).map((o, idx) => {
    // try meta.computed.distanceKm? not a coord. prefer coordinates in meta or coordinates field
    const coords = (o.meta && o.meta.coordinates) || o.coordinates || o.coodrinates || null;
    const lat = coords && coords.lat != null ? Number(coords.lat) : null;
    const lng = coords && coords.lng != null ? Number(coords.lng) : null;
    if (lat == null || lng == null) return null;
    return { x: lng, y: lat, id: o._id || idx, total: o.grandTotal || o.total || 0 };
  }).filter(p => p);

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Orders Location Scatter</h6>
      {points.length === 0 ? <div className="text-muted">No coordinate data available on orders.</div> : (
        <div style={{ width: "100%", height: 340 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 8, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="Longitude" />
              <YAxis type="number" dataKey="y" name="Latitude" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(val, name) => [val, name]} />
              <Scatter name="Orders" data={points} fill="#76b7b2" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
