import React, { useMemo } from "react";
import { Card, Row, Col } from "react-bootstrap";
import {
  GraphUp,
  GraphDown,
  ExclamationCircle,
} from "react-bootstrap-icons";

const formatPHP = (n) => {
  const num = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `₱${num.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatPercent = (n) => {
  const num = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `${num.toFixed(1)}%`;
};

export default function KPISummary({
  orders = [],
  sells = [],
  demolitions = [],
}) {
  const metrics = useMemo(() => {
    const totalOrders = orders.length;

    const totalRevenue = orders.reduce((sum, o) => {
      let amount = 0;

      if (o.grandTotal != null) amount = Number(o.grandTotal) || 0;
      else if (o.total != null) amount = Number(o.total) || 0;
      else if (Array.isArray(o.items)) {
        amount = o.items.reduce(
          (s, it) =>
            s + Number(it.price || 0) * Number(it.quantity || 0),
          0
        );
        amount += Number(o.deliveryFee || 0) - Number(o.discount || 0);
      }

      return sum + amount;
    }, 0);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const pendingOrders = orders.filter((o) => {
      const status = String(o.status || "").toLowerCase();
      return status === "pending" || status === "processing" || !status;
    }).length;

    const deliveredOrders = orders.filter(
      (o) => String(o.status || "").toLowerCase() === "delivered"
    ).length;

    const pendingRate =
      totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0;

    const fulfillmentRate =
      totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

    const totalSellRequests = sells.length;
    const successfulSells = sells.filter(
      (s) => String(s.status || "").toLowerCase() !== "pending"
    ).length;

    const sellSuccessRate =
      totalSellRequests > 0
        ? (successfulSells / totalSellRequests) * 100
        : 0;

    const demRequests = demolitions.length;
    const demoAccepted = demolitions.filter(
      (d) => String(d.status || "").toLowerCase() !== "pending"
    ).length;

    const demoAcceptanceRate =
      demRequests > 0 ? (demoAccepted / demRequests) * 100 : 0;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      pendingRate,
      fulfillmentRate,
      sellSuccessRate,
      demoAcceptanceRate,
      totalSellRequests,
      demRequests,
    };
  }, [orders, sells, demolitions]);

  const KPICard = ({ label, value, trend, icon: Icon, color }) => (
    <Col md={6} lg={4} className="mb-3">
      <Card
        className="p-3 shadow-sm border-0 h-100"
        style={{ background: "#f8f9fa", borderLeft: `4px solid ${color}` }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <small className="text-muted d-block mb-2">{label}</small>
            <h5 className="mb-0" style={{ color, fontWeight: "bold" }}>
              {value}
            </h5>

            {typeof trend === "number" && (
              <small
                className="d-block mt-1"
                style={{ color: trend >= 0 ? "#27ae60" : "#e74c3c" }}
              >
                <span className="me-1">
                  {trend >= 0 ? (
                    <GraphUp size={12} />
                  ) : (
                    <GraphDown size={12} />
                  )}
                </span>
                {Math.abs(trend).toFixed(1)}%
              </small>
            )}
          </div>

          {Icon && <Icon size={24} style={{ color, opacity: 0.5 }} />}
        </div>
      </Card>
    </Col>
  );

  return (
    <Card className="mb-4 p-4 shadow-sm">
      <h5 className="mb-4 fw-bold">Key Performance Indicators</h5>

      <Row>
        <KPICard
          label="Total Revenue"
          value={formatPHP(metrics.totalRevenue)}
          color="#4e79a7"
        />
        <KPICard
          label="Total Orders"
          value={metrics.totalOrders}
          color="#59a14f"
        />
        <KPICard
          label="Average Order Value"
          value={formatPHP(metrics.avgOrderValue)}
          color="#e15759"
        />
        <KPICard
          label="Order Fulfillment Rate"
          value={formatPercent(metrics.fulfillmentRate)}
          icon={ExclamationCircle}
          color="#f28e2b"
        />
        <KPICard
          label="Pending Order Rate"
          value={formatPercent(metrics.pendingRate)}
          icon={ExclamationCircle}
          color="#ff9e64"
        />
        <KPICard
          label="Sell Request Success Rate"
          value={formatPercent(metrics.sellSuccessRate)}
          color="#8e44ad"
        />
        <KPICard
          label="Demolish Acceptance Rate"
          value={formatPercent(metrics.demoAcceptanceRate)}
          color="#e74c3c"
        />
        <KPICard
          label="Total Sell Requests"
          value={metrics.totalSellRequests}
          color="#16a085"
        />
        <KPICard
          label="Total Demolish Requests"
          value={metrics.demRequests}
          color="#c0392b"
        />
      </Row>
    </Card>
  );
}
