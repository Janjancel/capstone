import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Table, Button, Form, Badge } from "react-bootstrap";
import html2pdf from "html2pdf.js";
import axios from "axios";
import InVoice from "./InVoice";


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
  // --- Orders for export (no analytics rendering)
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("day");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Invoice Modal Handlers
  const handleShowInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setSelectedOrder(null);
  };

  // --- Recent requests (sell + demolition)
  const [sellRequests, setSellRequests] = useState([]);
  const [demoRequests, setDemoRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Fetch orders (used only for document generation/export and the table)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingOrders(true);
      try {
        const res = await axios.get(`${API_URL}/api/orders`);
        if (!mounted) return;
        setOrders(Array.isArray(res.data) ? res.data : []);
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

  // Fetch sell + demolition requests for the “Recent Requests” table
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingRequests(true);
      try {
        const [sellRes, demoRes] = await Promise.all([
          axios.get(`${API_URL}/api/sell`),
          axios.get(`${API_URL}/api/demolish`),
        ]);
        if (!mounted) return;
        setSellRequests(Array.isArray(sellRes.data) ? sellRes.data : []);
        setDemoRequests(Array.isArray(demoRes.data) ? demoRes.data : []);
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
        email: order.userEmail || "",
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
          </div>
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
                      <td>{order.userEmail}</td>
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
                <th>Customer</th>
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
                  // Try to surface a reasonable customer label
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
