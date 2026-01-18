// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { BuildingFillX, HouseFill, CartFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import "bootstrap/dist/css/bootstrap.min.css";

// KPI Summary
import KPISummary from "../Dashboard/Analytics/KPISummary";
import ReviewsAnalytics1 from "../Dashboard/Analytics/Reviews/ReviewsAnalytics1";
import ReviewsAnalytics3 from "../Dashboard/Analytics/Reviews/ReviewsAnalytics3";

const API_URL = process.env.REACT_APP_API_URL || "";

const CURRENCY = (n) =>
  `₱${(Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// -----------------------------------------------------------------------------
// Helpers
function startOfPeriod(date, grouping = "day") {
  const d = new Date(date);
  if (grouping === "day") {
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  if (grouping === "week") {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  }
  if (grouping === "month") {
    const m = new Date(d.getFullYear(), d.getMonth(), 1);
    m.setHours(0, 0, 0, 0);
    return m.toISOString();
  }
  return d.toISOString();
}

function safeNumber(v) {
  return Number.isFinite(Number(v)) ? Number(v) : 0;
}

// -----------------------------------------------------------------------------
// Orders aggregation (USED by PDF summary)
function computeOrderAggregates(orders = [], grouping = "day") {
  let totalRevenue = 0;
  let totalOrders = 0;
  let pending = 0;

  for (const o of orders) {
    totalOrders++;

    const status = String(o.status || "").toLowerCase();
    if (status.includes("pending") || status.includes("processing") || status === "") {
      pending++;
    }

    const created = o.createdAt ? new Date(o.createdAt) : new Date();
    startOfPeriod(created, grouping);

    if (Array.isArray(o.items)) {
      o.items.forEach((it) => {
        totalRevenue += safeNumber(it.price) * safeNumber(it.quantity);
      });
    } else {
      totalRevenue += safeNumber(o.total);
    }
  }

  return {
    totalOrders,
    totalRevenue: +totalRevenue.toFixed(2),
    pendingOrders: pending,
  };
}

// -----------------------------------------------------------------------------
// Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();

  // Top tiles
  const [demolitionCount, setDemolitionCount] = useState(0);
  const [sellCount, setSellCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  // Raw data
  const [orders, setOrders] = useState([]);
  const [sells, setSells] = useState([]);
  const [demolitions, setDemolitions] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Summary metrics
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Filters
  const [filter, setFilter] = useState("day");
  const [analyticsView, setAnalyticsView] = useState("sell");

  // User
  const [currentUser, setCurrentUser] = useState({ username: "", email: "" });
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const aggregated = useMemo(
    () => computeOrderAggregates(orders, filter),
    [orders, filter]
  );

  // Fetch current user
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");

    axios
      .get(`${API_URL}/api/users/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        const data = res.data || {};
        setCurrentUser({
          username: data.username || "N/A",
          email: data.email || "N/A",
        });
      })
      .catch(() => {
        setCurrentUser({ username: "N/A", email: "N/A" });
      });
  }, [userId]);

  // Fetch dashboard data
  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      axios.get(`${API_URL}/api/demolish`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
      axios.get(`${API_URL}/api/sell`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
      axios.get(`${API_URL}/api/orders`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
      axios.get(`${API_URL}/api/reviews`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).catch(() => ({ data: [] })),
    ])
      .then(([demolishRes, sellRes, ordersRes, reviewsRes]) => {
        const demolish = demolishRes.data || [];
        const sell = sellRes.data || [];
        const fetchedOrders = ordersRes.data || [];
        const fetchedReviews = reviewsRes.data || [];

        setDemolitionCount(demolish.length);
        setSellCount(sell.length);
        setOrderCount(fetchedOrders.length);

        setOrders(fetchedOrders);
        setSells(sell);
        setDemolitions(demolish);
        setReviews(fetchedReviews);

        let pending = 0;
        let revenue = 0;

        fetchedOrders.forEach((o) => {
          if (String(o.status).toLowerCase().includes("pending")) pending++;
          if (Array.isArray(o.items)) {
            o.items.forEach((it) => {
              revenue += safeNumber(it.price) * safeNumber(it.quantity);
            });
          } else {
            revenue += safeNumber(o.total);
          }
        });

        setPendingOrders(pending);
        setTotalRevenue(revenue);
      })
      .catch(() => {
        setDemolitionCount(0);
        setSellCount(0);
        setOrderCount(0);
        setOrders([]);
        setSells([]);
        setDemolitions([]);
        setReviews([]);
        setPendingOrders(0);
        setTotalRevenue(0);
      });
  }, []);

  // Export CSV
  const exportCSV = () => {
    const headers = "Order ID,User Email,Status,Total Items,Total Amount,Created At\n";
    const rows = orders
      .map((o) => {
        const totalItems = (o.items || []).reduce((s, i) => s + safeNumber(i.quantity), 0);
        const totalAmount = (o.items || []).reduce(
          (s, i) => s + safeNumber(i.price) * safeNumber(i.quantity),
          0
        );
        return `${o._id || ""},${o.userEmail || ""},${o.status || ""},${totalItems},${totalAmount},${o.createdAt || ""}`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "dashboard-report.csv";
    link.click();
  };

  // Export PDF
  const exportPDF = () => {
    const element = document.getElementById("dashboard-report-content");
    html2pdf().from(element).save("dashboard-report.pdf");
  };

  return (
    <Container className="mt-4 p-3 bg-white border-bottom shadow-sm">
      {/* Top Tiles */}
      <Row className="g-4 row-cols-1 row-cols-md-3 mb-3">
        <Col>
          <Button
            className="w-100 p-4 d-flex flex-column align-items-center border-0"
            onClick={() => navigate("/admin/demolishDashboard")}
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <BuildingFillX size={40} className="mb-2 text-danger" />
            <h5 className="text-dark">Demolition Requests</h5>
            <div className="fs-3 fw-bold text-secondary">{demolitionCount}</div>
          </Button>
        </Col>

        <Col>
          <Button
            className="w-100 p-4 d-flex flex-column align-items-center border-0"
            onClick={() => navigate("/admin/sellDashboard")}
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <HouseFill size={40} className="mb-2 text-primary" />
            <h5 className="text-dark">Sell Requests</h5>
            <div className="fs-3 fw-bold text-secondary">{sellCount}</div>
          </Button>
        </Col>

        <Col>
          <Button
            className="w-100 p-4 d-flex flex-column align-items-center border-0"
            onClick={() => navigate("/admin/orders")}
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <CartFill size={40} className="mb-2 text-success" />
            <h5 className="text-dark">Orders</h5>
            <div className="fs-3 fw-bold text-secondary">{orderCount}</div>
          </Button>
        </Col>
      </Row>

      {/* Summary */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm bg-light h-100">
            <Card.Body>
              <h6>Pending Orders</h6>
              <h3 className="text-success">{pendingOrders}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm bg-light h-100">
            <Card.Body>
              <h6>Total Revenue</h6>
              <h3 className="text-primary">{CURRENCY(totalRevenue)}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm bg-light h-100">
            <Card.Body>
              <Button size="sm" onClick={exportCSV}>Download CSV</Button>{" "}
              <Button size="sm" onClick={exportPDF}>Download PDF</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <KPISummary orders={orders} sells={sells} demolitions={demolitions} />

      <Row className="mt-4 mb-4">
        <Col md={12}>
          <h5 style={{ fontWeight: "600", marginBottom: "16px" }}>Reviews Analytics</h5>
        </Col>
        <Col md={6}>
          <ReviewsAnalytics1 reviews={reviews} />
        </Col>
        <Col md={6}>
          <ReviewsAnalytics3 reviews={reviews} />
        </Col>
      </Row>

      <small className="text-muted">
        Signed in as: <strong>{currentUser.email}</strong>
      </small>
    </Container>
  );
};

export default Dashboard;
