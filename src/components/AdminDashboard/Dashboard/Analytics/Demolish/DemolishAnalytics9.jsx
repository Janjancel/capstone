import React from "react";
import { Card, ListGroup, Badge } from "react-bootstrap";

export default function DemolishAnalytics9({ demolitions = [] }) {
  const recent = (demolitions || []).slice(0,8);
  return (
    <Card className="p-3 mb-3 shadow-sm">
      <h6 className="mb-2">Recent Demolition Updates</h6>
      {recent.length === 0 ? <div className="text-muted">No entries.</div> : (
        <ListGroup variant="flush">
          {recent.map(d => (
            <ListGroup.Item key={d._id || d.id}>
              <div className="d-flex justify-content-between">
                <div>
                  <strong>{d.name || "Untitled"}</strong>
                  <div className="small text-muted">{d.description ? d.description.slice(0,60) : "—"}</div>
                </div>
                <div className="text-end">
                  <div className="small">{d.scheduledDate ? new Date(d.scheduledDate).toLocaleDateString() : ""}</div>
                  <Badge bg={d.status === "pending" ? "secondary" : d.status === "scheduled" ? "success" : "warning"}>{d.status}</Badge>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card>
  );
}
