
// // Dashboard.jsx
// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
// import { BuildingFillX, HouseFill, CartFill } from "react-bootstrap-icons";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import html2pdf from "html2pdf.js";
// import "bootstrap/dist/css/bootstrap.min.css";

// import SellAnalytics1 from "../Dashboard/Analytics/Sell/SellAnalytics1";
// import SellAnalytics2 from "../Dashboard/Analytics/Sell/SellAnalytics2";
// import SellAnalytics3 from "../Dashboard/Analytics/Sell/SellAnalytics3";
// import SellAnalytics4 from "../Dashboard/Analytics/Sell/SellAnalytics4";
// import SellAnalytics5 from "../Dashboard/Analytics/Sell/SellAnalytics5";

// const API_URL = process.env.REACT_APP_API_URL || "";

// const CURRENCY = (n) =>
//   `₱${(Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("en-PH", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`;

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
//         <Form.Select style={{ width: "180px" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
//           <option value="day">Group by Day</option>
//           <option value="week">Group by Week</option>
//           <option value="month">Group by Month</option>
//         </Form.Select>
//       </div>

//       {/* Dashboard analytics area */}
//       <div id="dashboard-report-content" className="p-3">
//         <Card className="p-3 shadow-sm bg-light mb-3">
//           <h5 className="mb-2">Sell Analytics</h5>
//           <p className="mb-0 text-muted">
//             Below are analytics computed from sell requests. Use the export buttons above to include these in a
//             report.
//           </p>
//         </Card>

//         {/* Analytics widgets */}
//         <SellAnalytics1 defaultGrouping={filter} />
//         <SellAnalytics2 />
//         <SellAnalytics3 />
//         <SellAnalytics4 />
//         <SellAnalytics5 />
//       </div>
//     </Container>
//   );
// };

// export default Dashboard;


// Dashboard.jsx (updated)
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { BuildingFillX, HouseFill, CartFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import "bootstrap/dist/css/bootstrap.min.css";

import SellAnalytics1 from "../Dashboard/Analytics/Sell/SellAnalytics1";
import SellAnalytics2 from "../Dashboard/Analytics/Sell/SellAnalytics2";
import SellAnalytics3 from "../Dashboard/Analytics/Sell/SellAnalytics3";
import SellAnalytics4 from "../Dashboard/Analytics/Sell/SellAnalytics4";
import SellAnalytics5 from "../Dashboard/Analytics/Sell/SellAnalytics5";

import DemolishAnalytics1 from "../Dashboard/Analytics/Demolish/DemolishAnalytics1";
import DemolishAnalytics2 from "../Dashboard/Analytics/Demolish/DemolishAnalytics2";
import DemolishAnalytics3 from "../Dashboard/Analytics/Demolish/DemolishAnalytics3";
import DemolishAnalytics4 from "../Dashboard/Analytics/Demolish/DemolishAnalytics4";
import DemolishAnalytics5 from "../Dashboard/Analytics/Demolish/DemolishAnalytics5";

const API_URL = process.env.REACT_APP_API_URL || "";

const CURRENCY = (n) =>
  `₱${(Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Dashboard = () => {
  const navigate = useNavigate();

  // Top tiles
  const [demolitionCount, setDemolitionCount] = useState(0);
  const [sellCount, setSellCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  // Orders (raw)
  const [orders, setOrders] = useState([]);

  // Summary metrics
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Filter selector
  const [filter, setFilter] = useState("day");

  // Analytics selection (Sell or Demolish)
  const [analyticsView, setAnalyticsView] = useState("sell"); // 'sell' or 'demolish'

  // Current signed-in user (for display)
  const [currentUser, setCurrentUser] = useState({ username: "", email: "" });
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Fetch current user (to display email)
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
      } catch (e) {
        console.error("Failed to load current user:", e);
        setCurrentUser((u) => ({ ...u, email: "N/A" }));
      }
    })();
  }, [userId]);

  // Fetch demolish/sell counts and orders (basic summary)
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const [demolishRes, sellRes, ordersRes] = await Promise.all([
          axios.get(`${API_URL}/api/demolish`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`${API_URL}/api/sell`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`${API_URL}/api/orders`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        const demolish = Array.isArray(demolishRes.data) ? demolishRes.data : [];
        const sell = Array.isArray(sellRes.data) ? sellRes.data : [];
        const fetchedOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

        setDemolitionCount(demolish.length || 0);
        setSellCount(sell.length || 0);
        setOrderCount(fetchedOrders.length || 0);

        // hydrate order email if present on order object, else keep as-is
        const hydrated = fetchedOrders.map((o) => ({
          ...o,
          userEmail: o.userEmail || o.email || "—",
        }));

        setOrders(hydrated);

        // compute pending orders & revenue from orders
        let pending = 0;
        let revenue = 0;
        hydrated.forEach((o) => {
          const status = String(o.status || "").toLowerCase();
          if (status.includes("pending") || status.includes("processing") || status === "") pending++;
          // compute revenue using items if present, otherwise attempt o.total
          if (Array.isArray(o.items) && o.items.length > 0) {
            o.items.forEach((it) => {
              const price = Number(it.price) || 0;
              const qty = Number(it.quantity) || 0;
              revenue += price * qty;
            });
          } else {
            revenue += Number(o.total) || 0;
          }
        });

        setPendingOrders(pending);
        setTotalRevenue(revenue);
      } catch (error) {
        console.error("Error fetching top tile counts or orders:", error);
        setDemolitionCount(0);
        setSellCount(0);
        setOrderCount(0);
        setOrders([]);
        setPendingOrders(0);
        setTotalRevenue(0);
      }
    })();
  }, []);

  // Export CSV
  const exportCSV = () => {
    const headers = "Order ID,User Email,Status,Total Items,Total Amount,Created At\n";
    const rows = (orders || [])
      .map((order) => {
        const totalItems =
          (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;
        const totalAmount =
          (order.items || []).reduce(
            (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
            0
          ) || Number(order.total) || 0;
        const oid = order.orderId || order._id || "";
        const created = order.createdAt ? new Date(order.createdAt).toISOString() : "";
        return `${oid},${(order.userEmail || "").replaceAll(",", " ")},${(order.status || "")
          .toString()
          .replaceAll(",", " ")},${totalItems},${totalAmount},${created}`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "dashboard-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF (exports the container element)
  const exportPDF = () => {
    const element = document.getElementById("dashboard-report-content");
    if (!element) {
      // Fallback: create a simple text element for export
      const fallback = document.createElement("div");
      fallback.innerHTML = `<h3>Dashboard Report</h3><p>Orders exported: ${orders.length}</p>`;
      document.body.appendChild(fallback);
      html2pdf().from(fallback).save().finally(() => document.body.removeChild(fallback));
      return;
    }
    const options = {
      margin: 0.5,
      filename: "dashboard-report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(options).from(element).save();
  };

  return (
    <Container className="mt-4 p-3 bg-white border-bottom shadow-sm">
      {/* === Top Tiles === */}
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

      {/* === Summary Cards + Export === */}
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
            <Card.Body className="d-flex flex-column justify-content-between h-100">
              <h6>Export</h6>
              <div className="d-flex gap-2 mt-2">
                <Button variant="outline-dark" size="sm" onClick={exportCSV}>
                  Download CSV
                </Button>
                <Button variant="outline-primary" size="sm" onClick={exportPDF}>
                  Download PDF
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === Signed in as + Filter (KEEP) === */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted">
          Signed in as: <strong>{currentUser.email || "—"}</strong>
        </small>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Form.Select style={{ width: "180px" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="day">Group by Day</option>
            <option value="week">Group by Week</option>
            <option value="month">Group by Month</option>
          </Form.Select>

          <Form.Select
            style={{ width: "220px" }}
            value={analyticsView}
            onChange={(e) => setAnalyticsView(e.target.value)}
          >
            <option value="sell">Sell Analytics</option>
            <option value="demolish">Demolish Analytics</option>
          </Form.Select>
        </div>
      </div>

      {/* Dashboard analytics area */}
      <div id="dashboard-report-content" className="p-3">
        <Card className="p-3 shadow-sm bg-light mb-3">
          <h5 className="mb-2">{analyticsView === "sell" ? "Sell Analytics" : "Demolish Analytics"}</h5>
          <p className="mb-0 text-muted">
            {analyticsView === "sell"
              ? "Below are analytics computed from sell requests. Use the export buttons above to include these in a report."
              : "Below are analytics computed from demolish requests. Use the export buttons above to include these in a report."}
          </p>
        </Card>

        {/* Analytics widgets */}
        {analyticsView === "sell" ? (
          <>
            <SellAnalytics1 defaultGrouping={filter} />
            <SellAnalytics2 />
            <SellAnalytics3 />
            <SellAnalytics4 />
            <SellAnalytics5 />
          </>
        ) : (
          <>
            <DemolishAnalytics1 defaultGrouping={filter} />
            <DemolishAnalytics2 />
            <DemolishAnalytics3 />
            <DemolishAnalytics4 />
            <DemolishAnalytics5 />
          </>
        )}
      </div>
    </Container>
  );
};

export default Dashboard;
