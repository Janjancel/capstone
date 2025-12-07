import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function quartiles(values = []) {
  if (!values.length) return null;
  values = values.slice().sort((a,b) => a-b);
  const q = (arr, p) => {
    const idx = (arr.length - 1) * p;
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return arr[lo];
    return arr[lo] * (hi - idx) + arr[hi] * (idx - lo);
  };
  return { q1: q(values, 0.25), q2: q(values, 0.5), q3: q(values, 0.75), min: values[0], max: values[values.length-1] };
}

export default function SellAnalytics7({ sells = [] }) {
  const buckets = {}; // key by day string
  for (const s of sells || []) {
    const d = s.createdAt ? new Date(s.createdAt).toISOString().slice(0,10) : "unknown";
    buckets[d] = buckets[d] || [];
    buckets[d].push(Number(s.price || 0));
  }
  const data = Object.entries(buckets).slice(-30).map(([k, v]) => {
    const qq = quartiles(v);
    return { label: k, q1: qq.q1, q2: qq.q2, q3: qq.q3, min: qq.min, max: qq.max };
  });

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Price Quartiles (recent days)</h6>
      {data.length === 0 ? <div className="text-muted">No price data.</div> : (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" minTickGap={10} />
              <YAxis />
              <Tooltip />
              {/* Represent median as bar height (q2) for quick glance */}
              <Bar dataKey="q2" fill="#59a14f" barSize={12} name="Median" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
