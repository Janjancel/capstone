import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  Table
} from "react-bootstrap";
import {
  BuildingFillX,
  HouseFill,
  CartFill
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from "recharts";
import html2pdf from "html2pdf.js";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = process.env.REACT_APP_API_URL; // ✅ Use env variable

const CURRENCY = (n) =>
  `₱${(Number.isFinite(n) ? n : 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Colors for charts
const COLORS = ["#198754", "#dc3545", "#0d6efd", "#6f42c1", "#fd7e14", "#20c997", "#6c757d"];

const Dashboard = () => {
  const navigate = useNavigate();

  // Top tiles (kept intact)
  const [demolitionCount, setDemolitionCount] = useState(0);
  const [sellCount, setSellCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  // Keep raw arrays so we can compute extra analytics
  const [demolishArr, setDemolishArr] = useState([]);
  const [sellArr, setSellArr] = useState([]);
  const [orders, setOrders] = useState([]);

  // Report analytics (existing + new)
  const [chartData, setChartData] = useState([]); // Sales over time
  const [statusChartData, setStatusChartData] = useState([]); // Order status trend
  const [itemSalesData, setItemSalesData] = useState([]); // Top-selling items
  const [pieData, setPieData] = useState([]); // Delivered vs Cancelled
  const [filter, setFilter] = useState("day"); // day | week | month
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // New metrics
  const [aov, setAov] = useState(0); // Average order value (delivered)
  const [deliveryRate, setDeliveryRate] = useState(0);
  const [cancelRate, setCancelRate] = useState(0);
  const [uniqueBuyers, setUniqueBuyers] = useState(0);
  const [repeatBuyers, setRepeatBuyers] = useState(0);
  const [weekdayRevenueData, setWeekdayRevenueData] = useState([]); // Revenue by weekday
  const [paymentMixData, setPaymentMixData] = useState([]); // Payment method distribution
  const [requestTrendData, setRequestTrendData] = useState([]); // Sell vs Demolish trend
  const [topCustomers, setTopCustomers] = useState([]); // Top customers by spend

  // Current signed-in user (email display)
  const [currentUser, setCurrentUser] = useState({ username: "", email: "" });
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // ---- Helper to format date bucket
  const bucketKey = (dateObj, mode) => {
    const d = new Date(dateObj);
    if (Number.isNaN(d.getTime())) return "Invalid Date";
    if (mode === "day") return d.toISOString().split("T")[0];
    if (mode === "week") {
      const start = new Date(d);
      // set to Sunday start-of-week (0)
      start.setDate(d.getDate() - d.getDay());
      return start.toISOString().split("T")[0];
    }
    // month
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  };

  // ---- Fetch current user (to display email)
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    const fetchMe = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
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
    };
    fetchMe();
  }, [userId, API_URL]);

  // ---- Fetch demolish/sell counts (top tiles)
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [demolishRes, sellRes, ordersRes] = await Promise.all([
          axios.get(`${API_URL}/api/demolish`),
          axios.get(`${API_URL}/api/sell`),
          axios.get(`${API_URL}/api/orders`)
        ]);

        const demolish = demolishRes.data || [];
        const sell = sellRes.data || [];
        const ordersArr = ordersRes.data || [];

        setDemolitionCount(demolish.length || 0);
        setSellCount(sell.length || 0);
        setOrderCount(ordersArr.length || 0);

        // store raw
        setDemolishArr(demolish);
        setSellArr(sell);
      } catch (error) {
        console.error("Error fetching top tile counts:", error);
      }
    };

    fetchCounts();
  }, [API_URL]);

  // ---- Fetch orders + sales for analytics (plus: hydrate missing order emails)
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const [ordersRes, salesRes] = await Promise.all([
          axios.get(`${API_URL}/api/orders`),
          axios.get(`${API_URL}/api/sales`),
        ]);

        // ----------------- HYDRATE ORDER EMAILS -----------------
        const fetchedOrders = ordersRes.data || [];

        // Collect userIds that don't have an email on the order object
        const missingIds = Array.from(
          new Set(
            fetchedOrders
              .filter((o) => !o.userEmail && o.userId)
              .map((o) => o.userId)
          )
        );

        let idToEmail = {};
        if (missingIds.length > 0) {
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
          idToEmail = results.reduce((acc, { id, email }) => {
            acc[id] = email;
            return acc;
          }, {});
        }

        const hydratedOrders = fetchedOrders.map((o) => ({
          ...o,
          userEmail: o.userEmail || idToEmail[o.userId] || "—",
        }));
        setOrders(hydratedOrders);

        // ----------------- ANALYTICS -----------------
        const salesData = salesRes.data || [];

        // ===== Order Status Trend + Pie + Pending
        const statusCountMap = {};
        let pendingCount = 0;
        let deliveredTotal = 0;
        let cancelledTotal = 0;

        hydratedOrders.forEach((order) => {
          const key = bucketKey(order.createdAt, filter);
          const statusKey = String(order.status || "Pending").toLowerCase();

          if (!statusCountMap[key]) {
            statusCountMap[key] = { date: key, pending: 0, cancelled: 0, delivered: 0 };
          }
          if (statusKey.includes("pending")) {
            statusCountMap[key].pending++;
            pendingCount++;
          }
          if (statusKey.includes("cancelled")) {
            statusCountMap[key].cancelled++;
            cancelledTotal++;
          }
          if (statusKey.includes("delivered")) {
            statusCountMap[key].delivered++;
            deliveredTotal++;
          }
        });

        setPendingOrders(pendingCount);
        setStatusChartData(
          Object.values(statusCountMap).sort((a, b) => new Date(a.date) - new Date(b.date))
        );
        setPieData([
          { name: "Delivered", value: deliveredTotal },
          { name: "Cancelled", value: cancelledTotal },
        ]);

        // ===== Sales over time + Top-selling items + Total revenue
        const salesMap = {};
        let total = 0;
        const itemMap = {};
        const buyerSpend = {};
        const weekdayMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

        salesData.forEach((sale) => {
          const key = bucketKey(sale.deliveredAt || sale.createdAt, filter);
          const saleTotal = sale.total || 0;

          salesMap[key] = (salesMap[key] || 0) + saleTotal;
          total += saleTotal;

          // top items
          sale.items?.forEach((item) => {
            const name = item.name || "Unnamed Item";
            const amount = (item.price || 0) * (item.quantity || 0);
            itemMap[name] = (itemMap[name] || 0) + amount;
          });

          // top customers
          const email = sale.userEmail || sale.customerEmail || sale.email || "Unknown";
          buyerSpend[email] = (buyerSpend[email] || 0) + saleTotal;

          // weekday revenue
          const d = new Date(sale.deliveredAt || sale.createdAt);
          if (!Number.isNaN(d.getTime())) {
            weekdayMap[d.getDay()] = (weekdayMap[d.getDay()] || 0) + saleTotal;
          }
        });

        const chartArray = Object.entries(salesMap).map(([date, total]) => ({ date, total }));
        const itemArray = Object.entries(itemMap).map(([name, total]) => ({ name, total }));
        const weekdayArray = Object.keys(weekdayMap).map((k) => ({
          weekday: WEEKDAY[Number(k)],
          revenue: weekdayMap[k] || 0,
        }));
        const topCustomerArray = Object.entries(buyerSpend)
          .map(([email, total]) => ({ email, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

        setChartData(chartArray.sort((a, b) => new Date(a.date) - new Date(b.date)));
        setItemSalesData(itemArray);
        setTotalRevenue(total);
        setWeekdayRevenueData(weekdayArray);
        setTopCustomers(topCustomerArray);

        // ===== High-level KPIs
        const deliveredCount = salesData.length; // assuming 1 sale == 1 delivered order
        setAov(deliveredCount > 0 ? total / deliveredCount : 0);

        const totalResolved = deliveredTotal + cancelledTotal;
        setDeliveryRate(totalResolved > 0 ? (deliveredTotal / totalResolved) * 100 : 0);
        setCancelRate(totalResolved > 0 ? (cancelledTotal / totalResolved) * 100 : 0);

        // Unique & repeat buyers (based on sales)
        const countsByBuyer = {};
        salesData.forEach((s) => {
          const email = s.userEmail || s.customerEmail || s.email || "Unknown";
          countsByBuyer[email] = (countsByBuyer[email] || 0) + 1;
        });
        const buyers = Object.keys(countsByBuyer);
        setUniqueBuyers(buyers.length);
        setRepeatBuyers(buyers.filter((e) => countsByBuyer[e] >= 2).length);

        // ===== Payment method mix (from orders)
        const paymentMap = {};
        hydratedOrders.forEach((o) => {
          // Try several conventions: o.paymentMethod or o.cod boolean
          let method =
            o.paymentMethod ||
            (o.cod === true ? "Cash on Delivery" : o.cod === false ? "Cash" : undefined) ||
            o.method ||
            "Unknown";
          // Normalize a bit
          method = String(method).toLowerCase().includes("cod")
            ? "Cash on Delivery"
            : String(method).toLowerCase().includes("cash")
            ? "Cash"
            : method;
          paymentMap[method] = (paymentMap[method] || 0) + 1;
        });
        const paymentArray = Object.entries(paymentMap).map(([name, value]) => ({ name, value }));
        setPaymentMixData(paymentArray);

        // ===== Sell vs Demolish trend (createdAt buckets)
        const trendMap = {}; // { bucket: { date, sell: n, demolish: n } }
        (sellArr || []).forEach((s) => {
          const k = bucketKey(s.createdAt, filter);
          if (!trendMap[k]) trendMap[k] = { date: k, sell: 0, demolish: 0 };
          trendMap[k].sell += 1;
        });
        (demolishArr || []).forEach((d) => {
          const k = bucketKey(d.createdAt, filter);
          if (!trendMap[k]) trendMap[k] = { date: k, sell: 0, demolish: 0 };
          trendMap[k].demolish += 1;
        });
        const trendArray = Object.values(trendMap).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setRequestTrendData(trendArray);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, filter, demolishArr.length, sellArr.length]); // re-run when filter or source arrays change

  // ---- Export helpers (CSV/PDF)
  const exportCSV = () => {
    const headers = "Order ID,User Email,Total Items,Total Amount\n";
    const rows = (orders || [])
      .map((order) => {
        const totalItems =
          order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        const totalAmount =
          order.items?.reduce(
            (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
            0
          ) || 0;
        return `${order._id},${order.userEmail || ""},${totalItems},${totalAmount}`;
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

  const exportPDF = () => {
    const element = document.getElementById("dashboard-report-content");
    if (!element) return;
    const options = {
      margin: 0.5,
      filename: "dashboard-report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(options).from(element).save();
  };

  return (
    <Container className="mt-4 p-3 bg-white border-bottom shadow-sm">

      {/* === Top Tiles (kept) === */}
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

      {/* === Summary Cards + Export (existing) === */}
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

      {/* === NEW: Signed-in email + Filter === */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted">
          Signed in as: <strong>{currentUser.email || "—"}</strong>
        </small>
        <Form.Select
          style={{ width: "180px" }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="day">Group by Day</option>
          <option value="week">Group by Week</option>
          <option value="month">Group by Month</option>
        </Form.Select>
      </div>

      {/* === NEW: KPI Row === */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="shadow-sm bg-light h-100">
            <Card.Body>
              <h6>Average Order Value</h6>
              <h4 className="mb-0">{CURRENCY(aov)}</h4>
              <small className="text-muted">Delivered orders</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm bg-light h-100">
            <Card.Body>
              <h6>Delivery Rate</h6>
              <h4 className="mb-0">{deliveryRate.toFixed(1)}%</h4>
              <small className="text-muted">Delivered / (Delivered + Cancelled)</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm bg-light h-100">
            <Card.Body>
              <h6>Cancel Rate</h6>
              <h4 className="mb-0">{cancelRate.toFixed(1)}%</h4>
              <small className="text-muted">Cancelled share</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm bg-light h-100">
            <Card.Body>
              <h6>Buyers</h6>
              <h4 className="mb-0">{uniqueBuyers}</h4>
              <small className="text-muted">{repeatBuyers} repeat</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === Report Content (existing + new) === */}
      <div id="dashboard-report-content">
        {/* Sales Over Time & Order Status Trend */}
        <Card className="p-4 shadow-sm mb-4 bg-light">
          <Row>
            <Col md={6}>
              <h5 className="mb-3">Sales Over Time</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#312e81" />
                </BarChart>
              </ResponsiveContainer>
            </Col>
            <Col md={6}>
              <h5 className="mb-3">Order Status Trend</h5>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="pending" stroke="#ffc107" name="Pending" />
                  <Line type="monotone" dataKey="cancelled" stroke="#dc3545" name="Cancelled" />
                  <Line type="monotone" dataKey="delivered" stroke="#198754" name="Delivered" />
                </LineChart>
              </ResponsiveContainer>
            </Col>
          </Row>
        </Card>

        {/* Top-Selling Items */}
        <Card className="p-4 shadow-sm mb-4 bg-light">
          <h5 className="mb-3">Top-Selling Items</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={itemSalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#0c4a6e" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue by Weekday & Payment Mix */}
        <Card className="p-4 shadow-sm mb-4 bg-light">
          <Row>
            <Col md={6}>
              <h5 className="mb-3">Revenue by Weekday</h5>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weekdayRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekday" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#0d6efd" />
                </BarChart>
              </ResponsiveContainer>
            </Col>
            <Col md={6}>
              <h5 className="mb-3">Payment Method Mix</h5>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={paymentMixData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {paymentMixData.map((_, idx) => (
                      <Cell key={`pm-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Col>
          </Row>
        </Card>

        {/* Delivered vs Cancelled */}
        <Card className="p-4 shadow-sm mb-4 bg-light">
          <h5 className="mb-3">Delivered vs Cancelled</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                <Cell fill="#198754" />
                <Cell fill="#dc3545" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Sell vs Demolish Requests Trend */}
        <Card className="p-4 shadow-sm mb-4 bg-light">
          <h5 className="mb-3">Sell vs Demolish Requests</h5>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={requestTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sell" stroke="#0d6efd" name="Sell Requests" />
              <Line type="monotone" dataKey="demolish" stroke="#6f42c1" name="Demolish Requests" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Customers */}
        <Card className="p-4 shadow-sm mb-4 bg-light">
          <h5 className="mb-3">Top Customers</h5>
          <Table striped bordered hover responsive className="mt-2">
            <thead>
              <tr>
                <th>#</th>
                <th>User Email</th>
                <th>Total Spend</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-muted">No data</td>
                </tr>
              ) : (
                topCustomers.map((c, idx) => (
                  <tr key={c.email + idx}>
                    <td>{idx + 1}</td>
                    <td>{c.email}</td>
                    <td>{CURRENCY(c.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>

        {/* Recent Orders Table */}
        <Card className="shadow-sm">
          <Card.Body>
            <h5>Recent Orders</h5>
            <Table striped bordered hover responsive className="mt-3">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User Email</th>
                  <th>Total Items</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.userEmail || "—"}</td>
                    <td>{order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0}</td>
                    <td>
                      {CURRENCY(
                        (order.items || []).reduce(
                          (sum, i) => sum + (i.quantity || 0) * (i.price || 0),
                          0
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Dashboard;
