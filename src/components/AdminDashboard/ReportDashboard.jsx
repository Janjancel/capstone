import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Table, Button, Form, Badge, ProgressBar } from "react-bootstrap";
import html2pdf from "html2pdf.js";
import axios from "axios";
import InVoice from "./InVoice";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Add custom style for table row hover
const styles = `
  .hover-highlight:hover {
    background-color: #f5f5f5 !important;
    transition: background-color 0.2s ease;
  }
`;

// Inject the styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const API_URL = process.env.REACT_APP_API_URL;

const PERIOD_OPTIONS = [
  { value: "day", label: "By Day" },
  { value: "week", label: "By Week" },
  { value: "month", label: "By Month" },
];

// ---- Helpers
const toBucketKey = (dateObj, mode) => {
  const d = new Date(dateObj);
  if (Number.isNaN(d.getTime())) return "Invalid Date";
  if (mode === "day") return d.toISOString().split("T")[0];
  if (mode === "week") {
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    return start.toISOString().split("T")[0];
  }
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
};

const numberToPHP = (n) =>
  (n ?? 0).toLocaleString("en-PH", { style: "currency", currency: "PHP" });

const ReportDashboard = () => {
  // --- Current signed-in user (display email)
  const [currentUser, setCurrentUser] = useState({ username: "", email: "" });
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // --- Orders for export (no analytics rendering)
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("day");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // --- Recent requests (sell + demolition)
  const [sellRequests, setSellRequests] = useState([]);
  const [demoRequests, setDemoRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Invoice Modal Handlers
  const handleShowInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setSelectedOrder(null);
  };

  // Fetch current user for email display
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = res.data || {};
        setCurrentUser({
          username: data.username || "N/A",
          email: data.email || "N/A",
        });
      } catch (err) {
        console.error("Error fetching current user:", err);
        setCurrentUser((u) => ({ ...u, email: "N/A" }));
      }
    })();
  }, [userId]);

  // Helper to hydrate arrays with emails via userId
  const hydrateEmailsByUserId = async (arr, idField = "userId", emailField = "userEmail") => {
    if (!Array.isArray(arr) || arr.length === 0) return arr;
    const token = localStorage.getItem("token");

    const missingIds = Array.from(
      new Set(arr.filter((x) => !x[emailField] && x[idField]).map((x) => x[idField]))
    );

    if (missingIds.length === 0) return arr;

    const results = await Promise.all(
      missingIds.map((id) =>
        axios
          .get(`${API_URL}/api/users/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          .then((r) => ({ id, email: (r.data && r.data.email) || "—" }))
          .catch(() => ({ id, email: "—" }))
      )
    );

    const map = results.reduce((acc, { id, email }) => {
      acc[id] = email;
      return acc;
    }, {});

    return arr.map((x) => ({
      ...x,
      [emailField]: x[emailField] || map[x[idField]] || x[emailField] || x.email || "—",
    }));
  };

  // Fetch items data for inventory reports
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingItems(true);
      try {
        const res = await axios.get(`${API_URL}/api/items`);
        if (!mounted) return;
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching items:", err);
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoadingItems(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch orders (used only for document generation/export and the table)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingOrders(true);
      try {
        const res = await axios.get(`${API_URL}/api/orders`);
        if (!mounted) return;
        const baseOrders = Array.isArray(res.data) ? res.data : [];
        // hydrate with emails if missing
        const hydrated = await hydrateEmailsByUserId(baseOrders, "userId", "userEmail");
        if (!mounted) return;
        setOrders(hydrated);
      } catch (err) {
        console.error("Error fetching orders for export:", err);
        if (!mounted) return;
        setOrders([]);
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch sell + demolition requests for the “Recent Requests” table (hydrate emails, too)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingRequests(true);
      try {
        const [sellRes, demoRes] = await Promise.all([
          axios.get(`${API_URL}/api/sell`),
          axios.get(`${API_URL}/api/demolish`),
        ]);

        let sells = Array.isArray(sellRes.data) ? sellRes.data : [];
        let demos = Array.isArray(demoRes.data) ? demoRes.data : [];

        // hydrate both arrays with user emails if missing
        sells = await hydrateEmailsByUserId(sells, "userId", "userEmail");
        demos = await hydrateEmailsByUserId(demos, "userId", "userEmail");

        if (!mounted) return;
        setSellRequests(sells);
        setDemoRequests(demos);
      } catch (err) {
        console.error("Error fetching requests:", err);
        if (!mounted) return;
        setSellRequests([]);
        setDemoRequests([]);
      } finally {
        if (mounted) setLoadingRequests(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // --- Derived data for exports (bucketed by filter) — used for CSV/PDF generation only
  const exportRows = useMemo(() => {
    const rows = (orders || []).map((order) => {
      const totalItems =
        order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      const totalAmount =
        order.items?.reduce(
          (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
          0
        ) || 0;
      return {
        bucket: toBucketKey(order.createdAt, filter),
        orderId: order.orderId || order._id || "", // <-- human-readable first
        email: order.userEmail || order.email || "—",
        status: order.status || "Pending",
        items: totalItems,
        amount: totalAmount,
        createdAt: order.createdAt,
      };
    });
    rows.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return rows;
  }, [orders, filter]);

  // ---- Exports (Documents Generation)
  const exportOrdersCSV = () => {
    const headers = [
      "Period Bucket",
      "Order ID",
      "User Email",
      "Status",
      "Total Items",
      "Total Amount",
      "Created At",
    ].join(",");

    const body = exportRows
      .map((r) =>
        [
          r.bucket,
          r.orderId,
          r.email,
          r.status,
          r.items,
          r.amount,
          new Date(r.createdAt).toISOString(),
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([headers + "\n" + body], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `orders_${filter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInventoryPDF = () => {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 16px;">
        <h2 style="margin: 0 0 24px 0;">Inventory Report</h2>
        
        <h3 style="margin: 0 0 12px 0;">Category Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">
          <thead>
            <tr>
              <th style="border:1px solid #ccc; padding:6px; text-align:left;">Category</th>
              <th style="border:1px solid #ccc; padding:6px; text-align:right;">Count</th>
              <th style="border:1px solid #ccc; padding:6px; text-align:right;">Total Value</th>
              <th style="border:1px solid #ccc; padding:6px; text-align:right;">Avg Condition</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(inventoryStats)
              .map(
                ([category, stats]) => `
              <tr>
                <td style="border:1px solid #eee; padding:6px;">${category}</td>
                <td style="border:1px solid #eee; padding:6px; text-align:right;">${stats.count}</td>
                <td style="border:1px solid #eee; padding:6px; text-align:right;">${numberToPHP(stats.totalValue)}</td>
                <td style="border:1px solid #eee; padding:6px; text-align:right;">${(stats.avgCondition / stats.count).toFixed(1)}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <h3 style="margin: 0 0 12px 0;">Condition Analysis</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr>
              <th style="border:1px solid #ccc; padding:6px; text-align:left;">Condition Range</th>
              <th style="border:1px solid #ccc; padding:6px; text-align:right;">Count</th>
              <th style="border:1px solid #ccc; padding:6px; text-align:right;">% of Inventory</th>
            </tr>
          </thead>
          <tbody>
            ${
              [
                { range: 'Poor (1-3)', min: 1, max: 3 },
                { range: 'Fair (4-6)', min: 4, max: 6 },
                { range: 'Good (7-8)', min: 7, max: 8 },
                { range: 'Excellent (9-10)', min: 9, max: 10 }
              ].map(({ range, min, max }) => {
                const count = Object.entries(conditionAnalysis.distribution)
                  .filter(([condition]) => {
                    const c = Number(condition);
                    return c >= min && c <= max;
                  })
                  .reduce((sum, [, c]) => sum + c, 0);
                
                return `
                <tr>
                  <td style="border:1px solid #eee; padding:6px;">${range}</td>
                  <td style="border:1px solid #eee; padding:6px; text-align:right;">${count}</td>
                  <td style="border:1px solid #eee; padding:6px; text-align:right;">${((count / items.length) * 100).toFixed(1)}%</td>
                </tr>`;
              }).join("")
            }
          </tbody>
        </table>
      </div>
    `;

    const container = document.createElement("div");
    container.setAttribute("id", "inventory-pdf");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.innerHTML = html;
    document.body.appendChild(container);

    const options = {
      margin: 0.5,
      filename: 'inventory-report.pdf',
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .set(options)
      .from(container)
      .save()
      .then(() => document.body.removeChild(container))
      .catch(() => document.body.removeChild(container));
  };

  const exportOrdersPDF = () => {
    // Minimal HTML table for PDF (no charts)
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 16px;">
        <h2 style="margin: 0 0 12px 0;">Orders Report (${filter.toUpperCase()})</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr>
              <th style="border:1px solid #ccc; padding:6px; text-align:left;">Period Bucket</th>
              <th style="border:1px solid #ccc; padding:6px; text-align:left;">Order ID</th>
              <th style="border:1px solid #ccc; padding:6px; text-align:left;">User Email</th>
              <th style="border:1px solid #ccc; padding:6px; text-align:left;">Status</th>
              <th style="border:1px solid #ccc; padding:6px; text-align:right;">Total Items</th>
              <th style="border:1px solid #ccc; padding:6px; text-align:right;">Total Amount (PHP)</th>
              <th style="border:1px solid #ccc; padding:6px; text-align:left;">Created At</th>
            </tr>
          </thead>
          <tbody>
            ${exportRows
              .map(
                (r) => `
              <tr>
                <td style="border:1px solid #eee; padding:6px;">${r.bucket}</td>
                <td style="border:1px solid #eee; padding:6px;">${r.orderId}</td>
                <td style="border:1px solid #eee; padding:6px;">${r.email}</td>
                <td style="border:1px solid #eee; padding:6px;">${r.status}</td>
                <td style="border:1px solid #eee; padding:6px; text-align:right;">${r.items}</td>
                <td style="border:1px solid #eee; padding:6px; text-align:right;">${r.amount.toFixed(
                  2
                )}</td>
                <td style="border:1px solid #eee; padding:6px;">${new Date(
                  r.createdAt
                ).toLocaleString()}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    const container = document.createElement("div");
    container.setAttribute("id", "orders-pdf");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.innerHTML = html;
    document.body.appendChild(container);

    const options = {
      margin: 0.5,
      filename: `orders_${filter}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .set(options)
      .from(container)
      .save()
      .then(() => document.body.removeChild(container))
      .catch(() => document.body.removeChild(container));
  };

  // Compute inventory stats by category
  const inventoryStats = useMemo(() => {
    if (!items.length) return {};
    
    return items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          count: 0,
          totalValue: 0,
          avgCondition: 0,
          items: []
        };
      }
      
      acc[item.category].count += 1;
      acc[item.category].totalValue += item.price;
      acc[item.category].avgCondition += item.condition;
      acc[item.category].items.push(item);
      
      return acc;
    }, {});
  }, [items]);

  // Compute revenue by category
  const categoryRevenue = useMemo(() => {
    if (!orders.length) return {};
    
    const revenue = {};
    orders.forEach(order => {
      if (!order.items) return;
      
      order.items.forEach(item => {
        if (!revenue[item.category]) {
          revenue[item.category] = 0;
        }
        revenue[item.category] += (item.price * item.quantity);
      });
    });
    
    return revenue;
  }, [orders]);

  // Compute condition analysis data
  const conditionAnalysis = useMemo(() => {
    if (!items.length) return { average: 0, distribution: {} };
    
    const distribution = {};
    let totalCondition = 0;
    
    items.forEach(item => {
      if (!distribution[item.condition]) {
        distribution[item.condition] = 0;
      }
      distribution[item.condition]++;
      totalCondition += item.condition;
    });
    
    return {
      average: totalCondition / items.length,
      distribution
    };
  }, [items]);

  // Chart data for category inventory
  const categoryChartData = useMemo(() => {
    const categories = Object.keys(inventoryStats);
    const counts = categories.map(cat => inventoryStats[cat]?.count || 0);
    
    return {
      labels: categories,
      datasets: [{
        data: counts,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#4BC0C0', '#FFCE56', '#36A2EB'
        ]
      }]
    };
  }, [inventoryStats]);

  // Chart data for revenue by category
  const revenueChartData = useMemo(() => {
    const categories = Object.keys(categoryRevenue);
    const revenues = categories.map(cat => categoryRevenue[cat] || 0);
    
    return {
      labels: categories,
      datasets: [{
        label: 'Revenue (PHP)',
        data: revenues,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }]
    };
  }, [categoryRevenue]);

  // Merge & sort sell + demo requests for display
  const recentRequests = useMemo(() => {
    const taggedSell =
      (sellRequests || []).map((r) => ({ ...r, __type: "Sell" })) || [];
    const taggedDemo =
      (demoRequests || []).map((r) => ({ ...r, __type: "Demolition" })) || [];

    const all = [...taggedSell, ...taggedDemo];
    all.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return all;
  }, [sellRequests, demoRequests]);

  return (
    <div className="container mt-4">
      {/* ===== Header: Quick Exports (Documents you can generate on the fly) ===== */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="d-flex flex-wrap gap-3 align-items-end">
          <div className="me-auto">
            <h5 className="mb-1">Generate Reports</h5>
            <div className="text-muted" style={{ fontSize: 14 }}>
              Export orders as CSV or PDF. These are downloadable documents (no analytics/charts).
            </div>
            <div className="mt-2">
              <small className="text-muted">
                Signed in as: <strong>{currentUser.email || "—"}</strong>
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Form.Label className="m-0">Period</Form.Label>
            <Form.Select
              style={{ width: 160 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Form.Select>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="outline-dark"
              size="sm"
              onClick={exportOrdersCSV}
              disabled={loadingOrders || exportRows.length === 0}
            >
              Download Orders CSV
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={exportOrdersPDF}
              disabled={loadingOrders || exportRows.length === 0}
            >
              Download Orders PDF
            </Button>
            <Button
              variant="outline-success"
              size="sm"
              onClick={exportInventoryPDF}
              disabled={loadingItems || items.length === 0}
            >
              Download Inventory Report
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ===== Inventory by Category ===== */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3">Inventory by Category</h5>
          <Row>
            <Col md={6}>
              <div style={{ height: '300px' }}>
                {!loadingItems && items.length > 0 && (
                  <Pie data={categoryChartData} options={{ maintainAspectRatio: false }} />
                )}
              </div>
            </Col>
            <Col md={6}>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Total Value</th>
                    <th>Avg Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(inventoryStats).map(([category, stats]) => (
                    <tr key={category}>
                      <td>{category}</td>
                      <td>{stats.count}</td>
                      <td>{numberToPHP(stats.totalValue)}</td>
                      <td>{(stats.avgCondition / stats.count).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ===== Revenue by Category ===== */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3">Revenue by Category</h5>
          <div style={{ height: '300px' }}>
            {!loadingOrders && orders.length > 0 && (
              <Bar 
                data={revenueChartData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            )}
          </div>
        </Card.Body>
      </Card>

      {/* ===== Condition Analysis ===== */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3">Item Condition Analysis</h5>
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <strong>Average Condition Score: </strong> 
                {conditionAnalysis.average.toFixed(1)} / 10
              </div>
              <div>
                {Object.entries(conditionAnalysis.distribution)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([condition, count]) => (
                    <div key={condition} className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Condition {condition}/10</span>
                        <span>{count} items</span>
                      </div>
                      <ProgressBar 
                        now={(count / items.length) * 100} 
                        variant={condition >= 7 ? 'success' : condition >= 4 ? 'warning' : 'danger'}
                      />
                    </div>
                  ))
                }
              </div>
            </Col>
            <Col md={6}>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Condition Range</th>
                    <th>Count</th>
                    <th>% of Inventory</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { range: 'Poor (1-3)', min: 1, max: 3 },
                    { range: 'Fair (4-6)', min: 4, max: 6 },
                    { range: 'Good (7-8)', min: 7, max: 8 },
                    { range: 'Excellent (9-10)', min: 9, max: 10 }
                  ].map(({ range, min, max }) => {
                    const count = Object.entries(conditionAnalysis.distribution)
                      .filter(([condition]) => {
                        const c = Number(condition);
                        return c >= min && c <= max;
                      })
                      .reduce((sum, [, c]) => sum + c, 0);
                    
                    return (
                      <tr key={range}>
                        <td>{range}</td>
                        <td>{count}</td>
                        <td>{((count / items.length) * 100).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ===== Recent Orders (tabular view only) ===== */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <h5 className="m-0">Recent Orders (Preview)</h5>
            {!loadingOrders && (
              <Badge bg="secondary" className="ms-2">
                {orders.length}
              </Badge>
            )}
          </div>

          <Table striped bordered hover responsive className="mt-2">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User Email</th>
                <th>Status</th>
                <th>Total Items</th>
                <th>Total Amount</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    Loading orders…
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 10).map((order) => {
                  const items =
                    order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0;
                  const amount =
                    order.items?.reduce(
                      (sum, i) => sum + (i.quantity || 0) * (i.price || 0),
                      0
                    ) || 0;
                  return (
                    <tr 
                      key={order._id}
                      onClick={() => handleShowInvoice(order)} 
                      style={{ cursor: 'pointer' }}
                      className="hover-highlight"
                    >
                      {/* human-readable orderId first */}
                      <td>{order.orderId || order._id}</td>
                      <td>{order.userEmail || order.email || "—"}</td>
                      <td>{order.status || "Pending"} </td>
                      <td>{items}</td>
                      <td>{numberToPHP(amount)}</td>
                      <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>

          <div className="d-flex gap-2 mt-3">
            <Button
              variant="outline-dark"
              size="sm"
              onClick={exportOrdersCSV}
              disabled={loadingOrders || exportRows.length === 0}
            >
              Download Orders CSV
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={exportOrdersPDF}
              disabled={loadingOrders || exportRows.length === 0}
            >
              Download Orders PDF
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ===== Recent Requests (Sell & Demolition) ===== */}
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <h5 className="m-0">Recent Requests (Sell & Demolition)</h5>
            {!loadingRequests && (
              <Badge bg="secondary" className="ms-2">
                {recentRequests.length}
              </Badge>
            )}
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Type</th>
                <th>Request ID</th>
                <th>Customer (Email/Name)</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {loadingRequests ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    Loading requests…
                  </td>
                </tr>
              ) : recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No requests found.
                  </td>
                </tr>
              ) : (
                recentRequests.slice(0, 10).map((req) => {
                  // Prefer email; fallback to name-like fields
                  const customer =
                    req.userEmail ||
                    req.email ||
                    req.contactEmail ||
                    req.customerEmail ||
                    req.contactName ||
                    req.fullName ||
                    req.name ||
                    "—";

                  // Prefer selId / demolishId, fallback to _id
                  const requestId = req.selId || req.demolishId || req._id;

                  return (
                    <tr key={req._id}>
                      <td>{req.__type}</td>
                      <td>{requestId}</td>
                      <td>{customer}</td>
                      <td>{req.status || "Pending"}</td>
                      <td>{req.createdAt ? new Date(req.createdAt).toLocaleString() : "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Invoice Modal */}
      <InVoice 
        show={showInvoice} 
        handleClose={handleCloseInvoice} 
        order={selectedOrder} 
      />
    </div>
  );
};

export default ReportDashboard;
