import React from "react";
import { Card, ListGroup, Badge } from "react-bootstrap";

export default function SellAnalytics8({ sells = [] }) {
  const recent = (sells || []).slice(0, 8);
  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Recent Sell Submissions</h6>
      {recent.length === 0 ? <div className="text-muted">No submissions.</div> : (
        <ListGroup variant="flush">
          {recent.map((s) => (
            <ListGroup.Item key={s._id || s.id}>
              <div className="d-flex justify-content-between">
                <div>
                  <strong>{s.name || "Untitled"}</strong>
                  <div className="small text-muted">{s.description ? s.description.slice(0,60) : "—"}</div>
                </div>
                <div className="text-end">
                  <div>{s.price != null ? `₱${Number(s.price).toLocaleString()}` : "—"}</div>
                  <Badge bg="secondary" className="mt-1">{s.status || "pending"}</Badge>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card>
  );
}
