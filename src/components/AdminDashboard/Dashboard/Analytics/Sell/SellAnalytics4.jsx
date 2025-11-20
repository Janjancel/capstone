// SellAnalytics4.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Row, Col, Table } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "";

const msToHours = (ms) => ms / 1000 / 60 / 60;
const median = (a) => {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
};
const p90 = (a) => {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  const idx = Math.floor(0.9 * (s.length - 1));
  return s[idx];
};

export default function SellAnalytics4() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/sell`);
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("SellAnalytics4 fetch error:", e);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // compute arrays of hours
  const toScheduleHours = [];
  const toAcceptHours = [];

  requests.forEach((r) => {
    try {
      if (r.createdAt && r.ocularVisit) {
        const created = new Date(r.createdAt).getTime();
        const ocular = new Date(r.ocularVisit).getTime();
        if (!Number.isNaN(created) && !Number.isNaN(ocular) && ocular >= created) {
          toScheduleHours.push(msToHours(ocular - created));
        }
      }
      // For accept: prefer explicit acceptedAt, else if status === accepted and updatedAt exists
      if (r.createdAt) {
        let acceptedAt = r.acceptedAt || (r.status === "accepted" && r.updatedAt ? r.updatedAt : null);
        if (acceptedAt) {
          const created = new Date(r.createdAt).getTime();
          const acc = new Date(acceptedAt).getTime();
          if (!Number.isNaN(created) && !Number.isNaN(acc) && acc >= created) {
            toAcceptHours.push(msToHours(acc - created));
          }
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  });

  const scheduleMedian = median(toScheduleHours);
  const scheduleP90 = p90(toScheduleHours);
  const acceptMedian = median(toAcceptHours);
  const acceptP90 = p90(toAcceptHours);

  return (
    <Card className="mb-3">
      <Card.Body>
        <h6>Time to Events (from creation)</h6>
        {loading ? (
          <div className="text-muted">Loading...</div>
        ) : (
          <Row>
            <Col md={6}>
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Median (hrs)</th>
                    <th>90th pct (hrs)</th>
                    <th>Samples</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>To Ocular Scheduled</td>
                    <td>{scheduleMedian ? scheduleMedian.toFixed(2) : "—"}</td>
                    <td>{scheduleP90 ? scheduleP90.toFixed(2) : "—"}</td>
                    <td>{toScheduleHours.length}</td>
                  </tr>
                  <tr>
                    <td>To Accepted</td>
                    <td>{acceptMedian ? acceptMedian.toFixed(2) : "—"}</td>
                    <td>{acceptP90 ? acceptP90.toFixed(2) : "—"}</td>
                    <td>{toAcceptHours.length}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            <Col md={6}>
              <div className="small text-muted">
                <p>Notes:</p>
                <ul>
                  <li>
                    Uses <code>createdAt</code> → <code>ocularVisit</code> for scheduling times.
                  </li>
                  <li>
                    For accepted times prefers <code>acceptedAt</code>, otherwise uses <code>updatedAt</code> when
                    status is <code>accepted</code>.
                  </li>
                  <li>Results are hours. Provide server-side transition timestamps for more accurate metrics.</li>
                </ul>
              </div>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}
