// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
// import { BuildingFillX, HouseFill, CartFill } from "react-bootstrap-icons";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import html2pdf from "html2pdf.js";
// import "bootstrap/dist/css/bootstrap.min.css";

// const API_URL = process.env.REACT_APP_API_URL;

// const CURRENCY = (n) =>
//   `₱${(Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("en-PH", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`;

// const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// const Dashboard = () => {
//   const navigate = useNavigate();

//   // Top tiles
//   const [demolitionCount, setDemolitionCount] = useState(0);
//   const [sellCount, setSellCount] = useState(0);
//   const [orderCount, setOrderCount] = useState(0);

//   // Orders (raw)
//   const [orders, setOrders] = useState([]);

//   // Summary metrics
//   const [pendingOrders, setPendingOrders] = useState(0);
//   const [totalRevenue, setTotalRevenue] = useState(0);

//   // Filter selector
//   const [filter, setFilter] = useState("day");

//   // Current signed-in user (for display)
//   const [currentUser, setCurrentUser] = useState({ username: "", email: "" });
//   const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

//   // Fetch current user (to display email)
//   useEffect(() => {
//     if (!userId) return;
//     const token = localStorage.getItem("token");
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/users/${userId}`, {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         });
//         const data = res.data || {};
//         setCurrentUser({
//           username: data.username || "N/A",
//           email: data.email || "N/A",
//         });
//       } catch (e) {
//         console.error("Failed to load current user:", e);
//         setCurrentUser((u) => ({ ...u, email: "N/A" }));
//       }
//     })();
//   }, [userId]);

//   // Fetch demolish/sell counts and orders (basic summary)
//   useEffect(() => {
//     (async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const [demolishRes, sellRes, ordersRes] = await Promise.all([
//           axios.get(`${API_URL}/api/demolish`, {
//             headers: token ? { Authorization: `Bearer ${token}` } : {},
//           }),
//           axios.get(`${API_URL}/api/sell`, {
//             headers: token ? { Authorization: `Bearer ${token}` } : {},
//           }),
//           axios.get(`${API_URL}/api/orders`, {
//             headers: token ? { Authorization: `Bearer ${token}` } : {},
//           }),
//         ]);

//         const demolish = Array.isArray(demolishRes.data) ? demolishRes.data : [];
//         const sell = Array.isArray(sellRes.data) ? sellRes.data : [];
//         const fetchedOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

//         setDemolitionCount(demolish.length || 0);
//         setSellCount(sell.length || 0);
//         setOrderCount(fetchedOrders.length || 0);

//         // hydrate order email if present on order object, else keep as-is
//         const hydrated = fetchedOrders.map((o) => ({
//           ...o,
//           userEmail: o.userEmail || o.email || "—",
//         }));

//         setOrders(hydrated);

//         // compute pending orders & revenue from orders
//         let pending = 0;
//         let revenue = 0;
//         hydrated.forEach((o) => {
//           const status = String(o.status || "").toLowerCase();
//           if (status.includes("pending") || status.includes("processing") || status === "") pending++;
//           // compute revenue using items if present, otherwise attempt o.total
//           if (Array.isArray(o.items) && o.items.length > 0) {
//             o.items.forEach((it) => {
//               const price = Number(it.price) || 0;
//               const qty = Number(it.quantity) || 0;
//               revenue += price * qty;
//             });
//           } else {
//             revenue += Number(o.total) || 0;
//           }
//         });

//         setPendingOrders(pending);
//         setTotalRevenue(revenue);
//       } catch (error) {
//         console.error("Error fetching top tile counts or orders:", error);
//         setDemolitionCount(0);
//         setSellCount(0);
//         setOrderCount(0);
//         setOrders([]);
//         setPendingOrders(0);
//         setTotalRevenue(0);
//       }
//     })();
//   }, []);

//   // Export CSV
//   const exportCSV = () => {
//     const headers = "Order ID,User Email,Status,Total Items,Total Amount,Created At\n";
//     const rows = (orders || [])
//       .map((order) => {
//         const totalItems =
//           (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;
//         const totalAmount =
//           (order.items || []).reduce(
//             (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
//             0
//           ) || Number(order.total) || 0;
//         const oid = order.orderId || order._id || "";
//         const created = order.createdAt ? new Date(order.createdAt).toISOString() : "";
//         return `${oid},${(order.userEmail || "").replaceAll(",", " ")},${(order.status || "")
//           .toString()
//           .replaceAll(",", " ")},${totalItems},${totalAmount},${created}`;
//       })
//       .join("\n");

//     const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.setAttribute("download", "dashboard-report.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // Export PDF (exports the container element)
//   const exportPDF = () => {
//     const element = document.getElementById("dashboard-report-content");
//     if (!element) {
//       // Fallback: create a simple text element for export
//       const fallback = document.createElement("div");
//       fallback.innerHTML = `<h3>Dashboard Report</h3><p>Orders exported: ${orders.length}</p>`;
//       document.body.appendChild(fallback);
//       html2pdf().from(fallback).save().finally(() => document.body.removeChild(fallback));
//       return;
//     }
//     const options = {
//       margin: 0.5,
//       filename: "dashboard-report.pdf",
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true },
//       jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
//     };
//     html2pdf().set(options).from(element).save();
//   };

//   return (
//     <Container className="mt-4 p-3 bg-white border-bottom shadow-sm">
//       {/* === Top Tiles === */}
//       <Row className="g-4 row-cols-1 row-cols-md-3 mb-3">
//         <Col>
//           <Button
//             className="w-100 p-4 d-flex flex-column align-items-center border-0"
//             onClick={() => navigate("/admin/demolishDashboard")}
//             style={{ backgroundColor: "#f8f9fa" }}
//           >
//             <BuildingFillX size={40} className="mb-2 text-danger" />
//             <h5 className="text-dark">Demolition Requests</h5>
//             <div className="fs-3 fw-bold text-secondary">{demolitionCount}</div>
//           </Button>
//         </Col>
//         <Col>
//           <Button
//             className="w-100 p-4 d-flex flex-column align-items-center border-0"
//             onClick={() => navigate("/admin/sellDashboard")}
//             style={{ backgroundColor: "#f8f9fa" }}
//           >
//             <HouseFill size={40} className="mb-2 text-primary" />
//             <h5 className="text-dark">Sell Requests</h5>
//             <div className="fs-3 fw-bold text-secondary">{sellCount}</div>
//           </Button>
//         </Col>
//         <Col>
//           <Button
//             className="w-100 p-4 d-flex flex-column align-items-center border-0"
//             onClick={() => navigate("/admin/orders")}
//             style={{ backgroundColor: "#f8f9fa" }}
//           >
//             <CartFill size={40} className="mb-2 text-success" />
//             <h5 className="text-dark">Orders</h5>
//             <div className="fs-3 fw-bold text-secondary">{orderCount}</div>
//           </Button>
//         </Col>
//       </Row>

//       {/* === Summary Cards + Export === */}
//       <Row className="mb-4">
//         <Col md={4}>
//           <Card className="shadow-sm bg-light h-100">
//             <Card.Body>
//               <h6>Pending Orders</h6>
//               <h3 className="text-success">{pendingOrders}</h3>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="shadow-sm bg-light h-100">
//             <Card.Body>
//               <h6>Total Revenue</h6>
//               <h3 className="text-primary">{CURRENCY(totalRevenue)}</h3>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="shadow-sm bg-light h-100">
//             <Card.Body className="d-flex flex-column justify-content-between h-100">
//               <h6>Export</h6>
//               <div className="d-flex gap-2 mt-2">
//                 <Button variant="outline-dark" size="sm" onClick={exportCSV}>
//                   Download CSV
//                 </Button>
//                 <Button variant="outline-primary" size="sm" onClick={exportPDF}>
//                   Download PDF
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* === Signed in as + Filter (KEEP) === */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <small className="text-muted">
//           Signed in as: <strong>{currentUser.email || "—"}</strong>
//         </small>
//         <Form.Select
//           style={{ width: "180px" }}
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//         >
//           <option value="day">Group by Day</option>
//           <option value="week">Group by Week</option>
//           <option value="month">Group by Month</option>
//         </Form.Select>
//       </div>

//       {/* Placeholder content area (removed all charts / tables as requested) */}
//       <div id="dashboard-report-content" className="p-3">
//         {/* Everything below 'Signed in as' was intentionally removed per request. */}
//         <Card className="p-4 shadow-sm bg-light">
//           <p className="mb-0 text-muted">
//             Report content removed. Use the filter above to select grouping. Exports will include the
//             currently loaded orders.
//           </p>
//         </Card>
//       </div>
//     </Container>
//   );
// };

// export default Dashboard;


// Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Form,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import html2pdf from "html2pdf.js";
import axios from "axios";
import InVoice from "./InVoice";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

// Add custom style for table row hover
const styles = `
  .hover-highlight:hover {
    background-color: #f5f5f5 !important;
    transition: background-color 0.2s ease;
  }
`;

// Inject the styles (safe to run once)
if (typeof document !== "undefined" && !document.getElementById("rd-hover-styles")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "rd-hover-styles";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

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
    // Start of week (Sunday)
    start.setDate(d.getDate() - d.getDay());
    return start.toISOString().split("T")[0];
  }
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
};

const numberToPHP = (n) =>
  (Number(n) ?? 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });

// Normalize categories: supports `item.category` (string) or `item.categories` (string[])
const getCategories = (item) => {
  if (Array.isArray(item?.categories) && item.categories.length > 0) {
    return item.categories.filter(Boolean);
  }
  if (item?.category) return [item.category];
  return ["Uncategorized"];
};

// Lowercased status helper
const normStatus = (s) => String(s || "pending").toLowerCase();

const Dashboard = () => {
  // --- Current signed-in user (display email)
  const [currentUser, setCurrentUser] = useState({ username: "", email: "" });
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // --- Orders for export / display
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("day");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Items (inventory)
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Recent requests (sell + demolition)
  const [sellRequests, setSellRequests] = useState([]);
  const [demoRequests, setDemoRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Date range for CSV exports (default: start of month -> today)
  const todayISO = new Date().toISOString().split("T")[0];
  const firstOfMonthISO = (() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  })();

  const [fromDate, setFromDate] = useState(firstOfMonthISO);
  const [toDate, setToDate] = useState(todayISO);

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
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch orders (used for document generation/export and the table)
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
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch sell + demolition requests for the “Recent Requests” table (hydrate emails, too)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingRequests(true);
      try {
        const [sellRes, demoRes] = await Promise.all([axios.get(`${API_URL}/api/sell`), axios.get(`${API_URL}/api/demolish`)]);
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
    return () => {
      mounted = false;
    };
  }, []);

  // --- Derived data for exports (bucketed by filter) — used for CSV/PDF generation only
  const exportRowsAll = useMemo(() => {
    const rows = (orders || []).map((order) => {
      const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      const totalAmount = order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0) || 0;
      return {
        bucket: toBucketKey(order.createdAt, filter),
        orderId: order.orderId || order._id || "",
        email: order.userEmail || order.email || "—",
        status: order.status || "Pending",
        items: totalItems,
        amount: totalAmount,
        createdAt: order.createdAt,
        createdAtISO: order.createdAt ? new Date(order.createdAt).toISOString() : "",
      };
    });
    rows.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return rows;
  }, [orders, filter]);

  // Filter rows by fromDate/toDate for CSV exports
  const exportRowsInRange = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return exportRowsAll;
    // include entire "to" day (set time to 23:59:59)
    const toInclusive = new Date(to);
    toInclusive.setHours(23, 59, 59, 999);

    return exportRowsAll.filter((r) => {
      if (!r.createdAt) return false;
      const created = new Date(r.createdAt);
      return created >= from && created <= toInclusive;
    });
  }, [exportRowsAll, fromDate, toDate]);

  // ---- Exports (Documents Generation)
  const exportOrdersCSV = () => {
    // Validate date range
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      alert("Please provide valid From and To dates.");
      return;
    }
    if (to < from) {
      alert("'To' date must be the same or after the 'From' date.");
      return;
    }

    const rows = exportRowsInRange;

    const headers = ["Period Bucket", "Order ID", "User Email", "Status", "Total Items", "Total Amount", "Created At"].join(",");

    const body = rows
      .map((r) =>
        [
          r.bucket,
          `"${String(r.orderId).replace(/"/g, '""')}"`,
          `"${String(r.email).replace(/"/g, '""')}"`,
          r.status,
          r.items,
          Number(r.amount).toFixed(2),
          new Date(r.createdAt).toISOString(),
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([headers + "\n" + body], { type: "text/csv;charset=utf-8;" });

    const fileName = `orders_${filter}_${fromDate}_to_${toDate}.csv`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInventoryPDF = () => {
    // compute inventoryStats (we have a memo below, but reuse quickly)
    const invStats = inventoryStats;
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
            ${Object.entries(invStats)
              .map(
                ([category, stats]) => `
              <tr>
                <td style="border:1px solid #eee; padding:6px;">${category}</td>
                <td style="border:1px solid #eee; padding:6px; text-align:right;">${stats.count}</td>
                <td style="border:1px solid #eee; padding:6px; text-align:right;">${numberToPHP(stats.totalValue)}</td>
                <td style="border:1px solid #eee; padding:6px; text-align:right;">${(stats.avgCondition / Math.max(stats.count, 1)).toFixed(1)}</td>
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
                { range: "Poor (1-3)", min: 1, max: 3 },
                { range: "Fair (4-6)", min: 4, max: 6 },
                { range: "Good (7-8)", min: 7, max: 8 },
                { range: "Excellent (9-10)", min: 9, max: 10 },
              ]
                .map(({ range, min, max }) => {
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
                  <td style="border:1px solid #eee; padding:6px; text-align:right;">${((count / Math.max(items.length, 1)) * 100).toFixed(1)}%</td>
                </tr>`;
                })
                .join("")
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
      filename: "inventory-report.pdf",
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
            ${exportRowsAll
              .map(
                (r) => `
              <tr>
                <td style="border:1px solid #eee; padding:6px;">${r.bucket}</td>
                <td style="border:1px solid #eee; padding:6px;">${r.orderId}</td>
                <td style="border:1px solid #eee; padding:6px;">${r.email}</td>
                <td style="border:1px solid #eee; padding:6px;">${r.status}</td>
                <td style="border:1px solid #eee; padding:6px; text-align:right;">${r.items}</td>
                <td style="border:1px solid #eee; padding:6px; text-align:right;">${Number(r.amount).toFixed(2)}</td>
                <td style="border:1px solid #eee; padding:6px;">${new Date(r.createdAt).toLocaleString()}</td>
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

  // --- NEW CSV Exports (Top customers, Top items, Requests summary)
  const exportTopCustomersCSV = () => {
    const headers = ["Customer Email", "Orders", "Items", "Total Spend"].join(",");
    const body = topCustomers.map((c) => [c.email, c.orders, c.items, Number(c.spend).toFixed(2)].join(",")).join("\n");
    const blob = new Blob([headers + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "top_customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTopItemsCSV = () => {
    const headers = ["Item", "Item ID", "Qty Sold", "Revenue"].join(",");
    const body = topItems.map((it) => [it.name, it.itemId || "", it.quantity, Number(it.revenue).toFixed(2)].join(",")).join("\n");
    const blob = new Blob([headers + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "top_items.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportRequestsCSV = () => {
    const headers = ["Type", "Request ID", "Customer", "Status", "Created At"].join(",");
    const body = recentRequests
      .map((req) => {
        const customer = req.userEmail || req.email || req.contactEmail || req.customerEmail || req.contactName || req.fullName || req.name || "—";
        const requestId = req.selId || req.demolishId || req._id;
        return [req.__type, requestId, `"${String(customer).replace(/"/g, '""')}"`, req.status || "Pending", req.createdAt ? new Date(req.createdAt).toISOString() : ""].join(",");
      })
      .join("\n");

    const blob = new Blob([headers + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "requests_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ====== COMPUTATIONS ======

  // Compute inventory stats by category (supports multi-category)
  const inventoryStats = useMemo(() => {
    if (!items.length) return {};

    return items.reduce((acc, item) => {
      const cats = getCategories(item);
      const price = Number(item.price) || 0;
      const condition = Number(item.condition) || 0;
      const share = Math.max(cats.length, 1);

      cats.forEach((cat) => {
        if (!acc[cat]) {
          acc[cat] = {
            count: 0,
            totalValue: 0,
            avgCondition: 0, // sum; divide by count later
            items: [],
          };
        }
        acc[cat].count += 1;
        // apportion value to avoid inflating totals when multi-category
        acc[cat].totalValue += price / share;
        acc[cat].avgCondition += condition;
        acc[cat].items.push(item);
      });

      return acc;
    }, {});
  }, [items]);

  // Compute revenue by category (supports multi-category on order items)
  const categoryRevenue = useMemo(() => {
    if (!orders.length) return {};

    const revenue = {};
    orders.forEach((order) => {
      if (!order.items) return;
      order.items.forEach((item) => {
        const cats = getCategories(item);
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const value = qty * price;
        const share = Math.max(cats.length, 1);

        cats.forEach((cat) => {
          if (!revenue[cat]) revenue[cat] = 0;
          revenue[cat] += value / share;
        });
      });
    });

    return revenue;
  }, [orders]);

  // Compute condition analysis data
  const conditionAnalysis = useMemo(() => {
    if (!items.length) return { average: 0, distribution: {} };

    const distribution = {};
    let totalCondition = 0;

    items.forEach((item) => {
      const c = Number(item.condition) || 0;
      if (!distribution[c]) distribution[c] = 0;
      distribution[c]++;
      totalCondition += c;
    });

    return {
      average: items.length ? totalCondition / items.length : 0,
      distribution,
    };
  }, [items]);

  // NEW: Sales over time (bucketed by filter)
  const salesBuckets = useMemo(() => {
    const map = new Map(); // bucket -> { revenue, orders }
    orders.forEach((o) => {
      const bucket = toBucketKey(o.createdAt, filter);
      const revenue = o.items?.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0) || 0;
      if (!map.has(bucket)) map.set(bucket, { revenue: 0, orders: 0 });
      const entry = map.get(bucket);
      entry.revenue += revenue;
      entry.orders += 1;
    });

    // sort by date (ignore "Invalid Date")
    const valid = Array.from(map.entries()).filter(([k]) => k && k !== "Invalid Date");
    valid.sort((a, b) => new Date(a[0]) - new Date(b[0]));
    return valid;
  }, [orders, filter]);

  const revenueOverTimeData = useMemo(() => {
    const labels = salesBuckets.map(([bucket]) => bucket);
    const data = salesBuckets.map(([, v]) => v.revenue);
    return {
      labels,
      datasets: [
        {
          label: "Revenue (PHP)",
          data,
          tension: 0.25,
          borderWidth: 2,
          pointRadius: 3,
        },
      ],
    };
  }, [salesBuckets]);

  const ordersOverTimeData = useMemo(() => {
    const labels = salesBuckets.map(([bucket]) => bucket);
    const data = salesBuckets.map(([, v]) => v.orders);
    return {
      labels,
      datasets: [
        {
          label: "Orders",
          data,
          backgroundColor: "rgba(99, 132, 255, 0.5)",
          borderColor: "rgb(99,132,255)",
          borderWidth: 1,
        },
      ],
    };
  }, [salesBuckets]);

  // NEW: Order status distribution
  const orderStatusCounts = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const s = normStatus(o.status);
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [orders]);

  const orderStatusPieData = useMemo(() => {
    const labels = Object.keys(orderStatusCounts);
    const values = labels.map((k) => orderStatusCounts[k]);
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ["#36A2EB", "#4BC0C0", "#FFCE56", "#FF6384", "#9966FF", "#FF9F40"],
        },
      ],
    };
  }, [orderStatusCounts]);

  // NEW: Top customers
  const topCustomers = useMemo(() => {
    const byCustomer = {};
    orders.forEach((o) => {
      const email = o.userEmail || o.email || "—";
      if (!byCustomer[email]) byCustomer[email] = { orders: 0, items: 0, spend: 0 };
      const items = o.items?.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0) || 0;
      const spend = o.items?.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0) || 0;
      byCustomer[email].orders += 1;
      byCustomer[email].items += items;
      byCustomer[email].spend += spend;
    });
    return Object.entries(byCustomer).map(([email, v]) => ({ email, ...v })).sort((a, b) => b.spend - a.spend).slice(0, 10);
  }, [orders]);

  // NEW: Top items (by quantity sold)
  const topItems = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.itemId || it._id || it.name || "Unknown Item";
        if (!map[key]) {
          map[key] = {
            key,
            itemId: it.itemId || it._id || "",
            name: it.name || "Unnamed",
            quantity: 0,
            revenue: 0,
          };
        }
        map[key].quantity += Number(it.quantity) || 0;
        map[key].revenue += (Number(it.quantity) || 0) * (Number(it.price) || 0);
      });
    });
    return Object.values(map).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
  }, [orders]);

  // NEW: Request status breakdowns (sell & demolish)
  const sellStatusCounts = useMemo(() => {
    const map = {};
    sellRequests.forEach((r) => {
      const s = normStatus(r.status);
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [sellRequests]);

  const demoStatusCounts = useMemo(() => {
    const map = {};
    demoRequests.forEach((r) => {
      const s = normStatus(r.status);
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [demoRequests]);

  const sellStatusPieData = useMemo(() => {
    const labels = Object.keys(sellStatusCounts);
    const values = labels.map((k) => sellStatusCounts[k]);
    return {
      labels,
      datasets: [{ data: values, backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"] }],
    };
  }, [sellStatusCounts]);

  const demoStatusPieData = useMemo(() => {
    const labels = Object.keys(demoStatusCounts);
    const values = labels.map((k) => demoStatusCounts[k]);
    return {
      labels,
      datasets: [{ data: values, backgroundColor: ["#FF9F40", "#36A2EB", "#FF6384", "#4BC0C0", "#9966FF"] }],
    };
  }, [demoStatusCounts]);

  // NEW: High-level KPIs
  const kpis = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => {
      const v = o.items?.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0) || 0;
      return sum + v;
    }, 0);
    const completedOrders = orders.filter((o) => ["delivered", "completed"].includes(normStatus(o.status))).length;
    const fulfillmentRate = totalOrders ? (completedOrders / totalOrders) * 100 : 0;
    const aov = totalOrders ? totalRevenue / totalOrders : 0;

    return { totalOrders, totalRevenue, fulfillmentRate, aov };
  }, [orders]);

  // ======= CHART DATA =======

  const categoryChartData = useMemo(() => {
    const categories = Object.keys(inventoryStats);
    const counts = categories.map((cat) => inventoryStats[cat]?.count || 0);
    return { labels: categories, datasets: [{ data: counts, backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#FF6384", "#4BC0C0", "#FFCE56", "#36A2EB"] }] };
  }, [inventoryStats]);

  const revenueChartData = useMemo(() => {
    const categories = Object.keys(categoryRevenue);
    const revenues = categories.map((cat) => categoryRevenue[cat] || 0);
    return { labels: categories, datasets: [{ label: "Revenue (PHP)", data: revenues, backgroundColor: "rgba(54, 162, 235, 0.5)", borderColor: "rgb(54, 162, 235)", borderWidth: 1 }] };
  }, [categoryRevenue]);

  // Merge & sort sell + demo requests for display
  const recentRequests = useMemo(() => {
    const taggedSell = (sellRequests || []).map((r) => ({ ...r, __type: "Sell" })) || [];
    const taggedDemo = (demoRequests || []).map((r) => ({ ...r, __type: "Demolition" })) || [];
    const all = [...taggedSell, ...taggedDemo];
    all.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return all;
  }, [sellRequests, demoRequests]);

  return (
    <div className="container mt-4">
      {/* ===== Header: Quick Exports (CSV only with date range) ===== */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="d-flex flex-wrap gap-3 align-items-end">
          <div className="me-auto">
            <h5 className="mb-1">Generate Reports</h5>
            <div className="text-muted" style={{ fontSize: 14 }}>
              Export orders as CSV — choose a date range and period bucket.
            </div>
            <div className="mt-2">
              <small className="text-muted">
                Signed in as: <strong>{currentUser.email || "—"}</strong>
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Form.Label className="m-0">From</Form.Label>
            <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ width: 160 }} />
          </div>

          <div className="d-flex align-items-center gap-2">
            <Form.Label className="m-0">To</Form.Label>
            <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ width: 160 }} />
          </div>

          <div className="d-flex align-items-center gap-2">
            <Form.Label className="m-0">Period</Form.Label>
            <Form.Select style={{ width: 160 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Form.Select>
          </div>

          <div className="d-flex gap-2">
            <Button variant="outline-dark" size="sm" onClick={exportOrdersCSV} disabled={loadingOrders || exportRowsInRange.length === 0}>
              Download Orders CSV
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ===== KPIs ===== */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted small">Total Revenue</div>
              <h4 className="mb-0">{numberToPHP(kpis.totalRevenue)}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted small">Total Orders</div>
              <h4 className="mb-0">{kpis.totalOrders}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted small">Fulfillment Rate</div>
              <h4 className="mb-0">{kpis.fulfillmentRate.toFixed(1)}%</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted small">Avg Order Value (AOV)</div>
              <h4 className="mb-0">{numberToPHP(kpis.aov)}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===== Sales Over Time ===== */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3">Sales Over Time ({PERIOD_OPTIONS.find((p) => p.value === filter)?.label})</h5>
          <Row>
            <Col md={8}>
              <div style={{ height: "300px" }}>
                {!loadingOrders && orders.length > 0 && <Line data={revenueOverTimeData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />}
              </div>
            </Col>
            <Col md={4}>
              <div style={{ height: "300px" }}>
                {!loadingOrders && orders.length > 0 && <Bar data={ordersOverTimeData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ===== Inventory by Category ===== */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3">Inventory by Category</h5>
          <Row>
            <Col md={6}>
              <div style={{ height: "300px" }}>{!loadingItems && items.length > 0 && <Pie data={categoryChartData} options={{ maintainAspectRatio: false }} />}</div>
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
                      <td>{(stats.avgCondition / Math.max(stats.count, 1)).toFixed(1)}</td>
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
          <div style={{ height: "300px" }}>{!loadingOrders && orders.length > 0 && <Bar data={revenueChartData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />}</div>
        </Card.Body>
      </Card>

      {/* ===== Order Status Distribution ===== */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3">Order Status Distribution</h5>
          <Row>
            <Col md={6}>
              <div style={{ height: "300px" }}>{!loadingOrders && orders.length > 0 && <Pie data={orderStatusPieData} options={{ maintainAspectRatio: false }} />}</div>
            </Col>
            <Col md={6}>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(orderStatusCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([s, c]) => (
                      <tr key={s}>
                        <td>{s.replaceAll("_", " ")}</td>
                        <td>{c}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ===== Top Customers & Top Items ===== */}
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="m-0">Top Customers (by Spend)</h5>
                <Button variant="outline-dark" size="sm" onClick={exportTopCustomersCSV} disabled={topCustomers.length === 0}>
                  Download CSV
                </Button>
              </div>
              <Table striped bordered hover size="sm" responsive>
                <thead>
                  <tr>
                    <th>Customer Email</th>
                    <th>Orders</th>
                    <th>Items</th>
                    <th>Total Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">
                        No data.
                      </td>
                    </tr>
                  ) : (
                    topCustomers.map((c) => (
                      <tr key={c.email}>
                        <td>{c.email}</td>
                        <td>{c.orders}</td>
                        <td>{c.items}</td>
                        <td>{numberToPHP(c.spend)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="m-0">Top Items (by Qty)</h5>
                <Button variant="outline-dark" size="sm" onClick={exportTopItemsCSV} disabled={topItems.length === 0}>
                  Download CSV
                </Button>
              </div>
              <Table striped bordered hover size="sm" responsive>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Item ID</th>
                    <th>Qty Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">
                        No data.
                      </td>
                    </tr>
                  ) : (
                    topItems.map((it) => (
                      <tr key={it.key}>
                        <td>{it.name}</td>
                        <td>{it.itemId || "—"}</td>
                        <td>{it.quantity}</td>
                        <td>{numberToPHP(it.revenue)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===== Item Condition Analysis ===== */}
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
                      <ProgressBar now={items.length ? (count / Math.max(items.length, 1)) * 100 : 0} variant={Number(condition) >= 7 ? "success" : Number(condition) >= 4 ? "warning" : "danger"} />
                    </div>
                  ))}
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
                    { range: "Poor (1-3)", min: 1, max: 3 },
                    { range: "Fair (4-6)", min: 4, max: 6 },
                    { range: "Good (7-8)", min: 7, max: 8 },
                    { range: "Excellent (9-10)", min: 9, max: 10 },
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
                        <td>{((count / Math.max(items.length, 1)) * 100).toFixed(1)}%</td>
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
                  const itemsCount = order.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) || 0;
                  const amount = order.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0) || 0;
                  return (
                    <tr key={order._id} onClick={() => handleShowInvoice(order)} style={{ cursor: "pointer" }} className="hover-highlight">
                      <td>{order.orderId || order._id}</td>
                      <td>{order.userEmail || order.email || "—"}</td>
                      <td>{order.status || "Pending"}</td>
                      <td>{itemsCount}</td>
                      <td>{numberToPHP(amount)}</td>
                      <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>

          <div className="d-flex gap-2 mt-3">
            <Button variant="outline-dark" size="sm" onClick={exportOrdersCSV} disabled={loadingOrders || exportRowsInRange.length === 0}>
              Download Orders CSV
            </Button>
            <Button variant="outline-primary" size="sm" onClick={exportOrdersPDF} disabled={loadingOrders || exportRowsAll.length === 0}>
              Download Orders PDF
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ===== Requests (Sell & Demolition) - Breakdown + Table ===== */}
      <Card className="shadow-sm mb-3">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <h5 className="m-0">Request Status Breakdown</h5>
          </div>
          <Row>
            <Col md={6}>
              <h6>Sell Requests</h6>
              <div style={{ height: "260px" }}>{!loadingRequests && sellRequests.length > 0 && <Pie data={sellStatusPieData} options={{ maintainAspectRatio: false }} />}</div>
            </Col>
            <Col md={6}>
              <h6>Demolition Requests</h6>
              <div style={{ height: "260px" }}>{!loadingRequests && demoRequests.length > 0 && <Pie data={demoStatusPieData} options={{ maintainAspectRatio: false }} />}</div>
            </Col>
          </Row>
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
            <div className="ms-auto">
              <Button variant="outline-dark" size="sm" onClick={exportRequestsCSV} disabled={loadingRequests || recentRequests.length === 0}>
                Download CSV
              </Button>
            </div>
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
                  const customer = req.userEmail || req.email || req.contactEmail || req.customerEmail || req.contactName || req.fullName || req.name || "—";
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
      <InVoice show={showInvoice} handleClose={handleCloseInvoice} order={selectedOrder} />
    </div>
  );
};

export default Dashboard;
