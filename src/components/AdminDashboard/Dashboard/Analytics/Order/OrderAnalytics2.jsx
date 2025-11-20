// OrderAnalytics2.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Row, Col, Table } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "";

const normalize = (s) =>
  String(s || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

export default function OrderAnalytics2() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders`);
        if (!mounted) return;
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("OrderAnalytics2 fetch error:", e);
        if (!mounted) return;
        setOrders([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const total = orders.length;
  const shipped = orders.filter((o) => normalize(o.status) === "shipped").length;
  const delivered = orders.filter((o) => normalize(o.status) === "delivered").length;
  const cancellationRequested = orders.filter((o) => ["cancellation_requested", "cancel_request", "cancel_requested"].includes(normalize(o.status))).length;
  const cancelled = orders.filter((o) => normalize(o.status) === "cancelled").length;
  const pending = orders.filter((o) => normalize(o.status) === "pending" || !o.status).length;
  const processing = orders.filter((o) => normalize(o.status) === "processing").length;

  const pct = (n) => (total === 0 ? "0%" : `${Math.round((n / total) * 100)}%`);

  return (
    <Card className="mb-3">
      <Card.Body>
        <h6>Fulfillment Funnel</h6>
        {loading ? (
          <div className="text-muted">Loading...</div>
        ) : (
          <Row className="mt-3">
            <Col md={6}>
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>Count</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Placed (Total)</td>
                    <td>{total}</td>
                    <td>100%</td>
                  </tr>
                  <tr>
                    <td>Pending</td>
                    <td>{pending}</td>
                    <td>{pct(pending)}</td>
                  </tr>
                  <tr>
                    <td>Processing</td>
                    <td>{processing}</td>
                    <td>{pct(processing)}</td>
                  </tr>
                  <tr>
                    <td>Shipped</td>
                    <td>{shipped}</td>
                    <td>{pct(shipped)}</td>
                  </tr>
                  <tr>
                    <td>Delivered</td>
                    <td>{delivered}</td>
                    <td>{pct(delivered)}</td>
                  </tr>
                  <tr>
                    <td>Cancellation Requested</td>
                    <td>{cancellationRequested}</td>
                    <td>{pct(cancellationRequested)}</td>
                  </tr>
                  <tr>
                    <td>Cancelled</td>
                    <td>{cancelled}</td>
                    <td>{pct(cancelled)}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            <Col md={6}>
              <div className="small text-muted">
                <p>Notes</p>
                <ul>
                  <li>Conversion rates show where orders drop off.</li>
                  <li>If you have timestamps for transitions we can compute time-in-stage metrics here too.</li>
                </ul>
              </div>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}
