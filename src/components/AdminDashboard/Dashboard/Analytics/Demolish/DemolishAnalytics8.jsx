import React from "react";
import { Card } from "react-bootstrap";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function daysBetween(a,b){ if(!a||!b) return null; return Math.round((new Date(b)-new Date(a))/(1000*60*60*24)); }

export default function DemolishAnalytics8({ demolitions = [] }) {
  const diffs = (demolitions || []).map(d => {
    const days = daysBetween(d.createdAt, d.scheduledDate);
    return days == null ? null : days;
  }).filter(x => x!=null);
  if (diffs.length === 0) return (
    <Card className="p-3 mb-3 shadow-sm"><h6 className="mb-2">Scheduling Delay (days)</h6><div className="text-muted">No scheduled data</div></Card>
  );
  // bucket counts
  const buckets = { "0-3":0, "4-7":0, "8-14":0, "15+":0 };
  diffs.forEach(d => {
    if (d <= 3) buckets["0-3"]++;
    else if (d <=7) buckets["4-7"]++;
    else if (d <=14) buckets["8-14"]++;
    else buckets["15+"]++;
  });
  const data = Object.entries(buckets).map(([k,v]) => ({ bucket: k, count: v }));

  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Scheduling Delay (days)</h6>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#f28e2b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
