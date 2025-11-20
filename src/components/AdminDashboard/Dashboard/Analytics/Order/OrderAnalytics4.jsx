// OrderAnalytics4.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Row, Col, Table } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "";

const pickGrand = (o) => {
  const explicit =
    o?.grandTotal ?? o?.finalTotal ?? o?.total ?? o?.totalAmount ?? 0;
  if (explicit != null) return Number(explicit) || 0;
  if (Array.isArray(o.items)) {
    return o.items.reduce((sum, it) => sum + (Number(it.price || it.amount) || 0) * (Number(it.quantity) || 1), 0);
  }
  return 0;
};

export default function OrderAnalytics4() {
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
        console.error("OrderAnalytics4 fetch error:", e);
        if (!mounted) return;
        setOrders([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const totals = orders.map((o) => pickGrand(o));
  const mean = totals.length ? totals.reduce((s, x) => s + x, 0) / totals.length : 0;
  const median = (() => {
    if (!totals.length) return 0;
    const s = totals.slice().sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
  })();

  // Email domain aggregation
  const domains = {};
  orders.forEach((o) => {
    const email = (o.userEmail || o.email || "unknown").toLowerCase();
    const domain = email.includes("@") ? email.split("@")[1] : "unknown";
    domains[domain] = domains[domain] || { count: 0, revenue: 0 };
    domains[domain].count += 1;
    domains[domain].revenue += pickGrand(o);
  });
  const domainList = Object.keys(domains)
    .map((d) => ({ domain: d, ...domains[d], avg: domains[d].revenue / domains[d].count }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Repeat vs new
  const byUser = {};
  orders.forEach((o) => {
    const uid = o.userId || (o.userEmail || o.email || "unknown");
    byUser[uid] = byUser[uid] || { orders: 0, revenue: 0 };
    byUser[uid].orders += 1;
    byUser[uid].revenue += pickGrand(o);
  });
  const repeat = Object.values(byUser).filter((u) => u.orders > 1);
  const newCount = Object.values(byUser).filter((u) => u.orders === 1).length;
  const repeatCount = repeat.length;
  const repeatAOV = repeat.length ? repeat.reduce((s, r) => s + r.revenue / r.orders, 0) / repeat.length : 0;

  return (
    <Card className="mb-3">
      <Card.Body>
        <h6>Revenue & Customer Profile</h6>
        {loading ? (
          <div className="text-muted">Loading...</div>
        ) : (
          <>
            <Row>
              <Col md={6}>
                <Table size="sm" bordered>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>AOV (mean)</td>
                      <td>₱{mean.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Median Order Value</td>
                      <td>₱{median.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Repeat customers</td>
                      <td>{repeatCount} (avg AOV: ₱{repeatAOV ? repeatAOV.toFixed(2) : "0.00"})</td>
                    </tr>
                    <tr>
                      <td>New customers</td>
                      <td>{newCount}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>

              <Col md={6}>
                <Table size="sm" bordered>
                  <thead>
                    <tr>
                      <th>Top Email Domains</th>
                      <th>Orders</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainList.map((d) => (
                      <tr key={d.domain}>
                        <td style={{ maxWidth: 200, wordBreak: "break-word" }}>{d.domain}</td>
                        <td>{d.count}</td>
                        <td>₱{d.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                    {domainList.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted">
                          No data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
