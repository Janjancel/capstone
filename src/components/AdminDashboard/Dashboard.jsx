

// import React, { useState, useEffect } from "react";
// import DashboardAnalytics from "./DashboardAnalytics";
// import {
//   Container,
//   Row,
//   Col,
//   Button,
//   Form
// } from "react-bootstrap";
// import {
//   BuildingFillX,
//   HouseFill,
//   CartFill
// } from "react-bootstrap-icons";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css";

// const API_URL = process.env.REACT_APP_API_URL; // ✅ Use env variable

// const Dashboard = () => {
//   const navigate = useNavigate();

//   const [demolitionCount, setDemolitionCount] = useState(0);
//   const [sellCount, setSellCount] = useState(0);
//   const [orderCount, setOrderCount] = useState(0);
//   const [analytics, setAnalytics] = useState({
//     total_sell_requests: 0,
//     total_demolish_requests: 0,
//     total_orders: 0,
//   });

//   const [selectedRange, setSelectedRange] = useState("day");
//   const [productSales, setProductSales] = useState([]);
//   const [dailySales, setDailySales] = useState([]);

//   const formatDateKey = (dateObj, range) => {
//     const d = new Date(dateObj);
//     if (range === "day") return d.toISOString().split("T")[0];
//     if (range === "week") {
//       const startOfWeek = new Date(d.setDate(d.getDate() - d.getDay()));
//       return startOfWeek.toISOString().split("T")[0];
//     }
//     if (range === "month") {
//       return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
//     }
//     return "Unknown";
//   };

//   // Fetch demolition and sell counts
//   useEffect(() => {
//     const fetchCounts = async () => {
//       try {
//         const demolishRes = await axios.get(`${API_URL}/api/demolish`);
//         const sellRes = await axios.get(`${API_URL}/api/sell`);

//         setDemolitionCount(demolishRes.data.length || 0);
//         setSellCount(sellRes.data.length || 0);

//         setAnalytics((prev) => ({
//           ...prev,
//           total_demolish_requests: demolishRes.data.length || 0,
//           total_sell_requests: sellRes.data.length || 0,
//         }));
//       } catch (error) {
//         console.error("Error fetching demolish/sell counts:", error);
//       }
//     };

//     fetchCounts();
//   }, []);

//   // Fetch orders and build analytics
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/orders`);
//         const orders = res.data || [];

//         setOrderCount(orders.length);

//         setAnalytics((prev) => ({
//           ...prev,
//           total_orders: orders.length,
//         }));

//         const salesByProduct = {};
//         const salesByDate = {};

//         orders.forEach((order) => {
//           const dateObj = new Date(order.createdAt);
//           const dateKey = dateObj ? formatDateKey(dateObj, selectedRange) : "Invalid Date";

//           (order.items || []).forEach((item) => {
//             const name = item.name || "Unnamed Product";
//             const quantity = item.quantity || 1;
//             const price = parseFloat(item.price) || 0;

//             if (!salesByProduct[name]) {
//               salesByProduct[name] = { units: 0, revenue: 0 };
//             }

//             salesByProduct[name].units += quantity;
//             salesByProduct[name].revenue += quantity * price;
//           });

//           salesByDate[dateKey] = (salesByDate[dateKey] || 0) + 1;
//         });

//         const formattedProducts = Object.entries(salesByProduct).map(
//           ([name, stats]) => ({
//             name,
//             units: stats.units,
//             price: stats.units > 0 ? stats.revenue / stats.units : 0,
//             revenue: stats.revenue,
//           })
//         );

//         const formattedDaily = Object.entries(salesByDate).map(
//           ([date, orders]) => ({
//             date,
//             orders,
//           })
//         );

//         setProductSales(formattedProducts);
//         setDailySales(formattedDaily);
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//       }
//     };

//     fetchOrders();
//   }, [selectedRange]);

//   return (
//     <Container className="mt-4 p-3 bg-white border-bottom shadow-sm">
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

//       <Row className="mb-4">
//         <Col md={4}>
//           <Form.Group>
//             <Form.Label>View Sales By</Form.Label>
//             <Form.Select
//               value={selectedRange}
//               onChange={(e) => setSelectedRange(e.target.value)}
//             >
//               <option value="day">Day</option>
//               <option value="week">Week</option>
//               <option value="month">Month</option>
//             </Form.Select>
//           </Form.Group>
//         </Col>
//       </Row>

//       <Row>
//         <DashboardAnalytics
//           analytics={analytics}
//           productChartData={productSales}
//           dailySalesData={dailySales}
//           selectedRange={selectedRange}
//         />
//       </Row>
//     </Container>
//   );
// };

// export default Dashboard;

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

const Dashboard = () => {
  const navigate = useNavigate();

  // Top tiles (kept intact)
  const [demolitionCount, setDemolitionCount] = useState(0);
  const [sellCount, setSellCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  // Report analytics (transferred from ReportDashboard)
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]); // Sales over time
  const [statusChartData, setStatusChartData] = useState([]); // Order status trend
  const [itemSalesData, setItemSalesData] = useState([]); // Top-selling items
  const [pieData, setPieData] = useState([]); // Delivered vs Cancelled
  const [filter, setFilter] = useState("day"); // day | week | month
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

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

  // ---- Fetch demolish/sell counts (top tiles)
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [demolishRes, sellRes, ordersRes] = await Promise.all([
          axios.get(`${API_URL}/api/demolish`),
          axios.get(`${API_URL}/api/sell`),
          axios.get(`${API_URL}/api/orders`)
        ]);

        const demolishArr = demolishRes.data || [];
        const sellArr = sellRes.data || [];
        const ordersArr = ordersRes.data || [];

        setDemolitionCount(demolishArr.length || 0);
        setSellCount(sellArr.length || 0);
        setOrderCount(ordersArr.length || 0);
      } catch (error) {
        console.error("Error fetching top tile counts:", error);
      }
    };

    fetchCounts();
  }, [API_URL]);

  // ---- Fetch orders + sales for analytics (transferred logic)
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [ordersRes, salesRes] = await Promise.all([
          axios.get(`${API_URL}/api/orders`),
          axios.get(`${API_URL}/api/sales`),
        ]);

        const fetchedOrders = ordersRes.data || [];
        const salesData = salesRes.data || [];

        // Status trend + pie + pending
        const statusCountMap = {};
        let pendingCount = 0;
        let deliveredTotal = 0;
        let cancelledTotal = 0;

        fetchedOrders.forEach((order) => {
          const key = bucketKey(order.createdAt, filter);
          const statusKey = (order.status || "Pending").toLowerCase();

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
        setOrders(fetchedOrders);

        // Sales over time + Top-selling items + Total revenue
        const salesMap = {};
        let total = 0;
        const itemMap = {};

        salesData.forEach((sale) => {
          const key = bucketKey(sale.deliveredAt, filter);
          salesMap[key] = (salesMap[key] || 0) + (sale.total || 0);
          total += sale.total || 0;

          sale.items?.forEach((item) => {
            const name = item.name || "Unnamed Item";
            const amount = (item.price || 0) * (item.quantity || 0);
            itemMap[name] = (itemMap[name] || 0) + amount;
          });
        });

        const chartArray = Object.entries(salesMap).map(([date, total]) => ({ date, total }));
        const itemArray = Object.entries(itemMap).map(([name, total]) => ({ name, total }));

        setChartData(chartArray.sort((a, b) => new Date(a.date) - new Date(b.date)));
        setItemSalesData(itemArray);
        setTotalRevenue(total);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
  }, [API_URL, filter]);

  // ---- Export helpers (CSV/PDF)
  const exportCSV = () => {
    const headers = "Order ID,User Email,Total Items,Total Amount\n";
    const rows = (orders || [])
      .map((order) => {
        const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        const totalAmount = order.items?.reduce(
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

      {/* === Summary Cards + Export (from ReportDashboard) === */}
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
              <h3 className="text-primary">₱{totalRevenue.toFixed(2)}</h3>
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

      {/* === Filter === */}
      <div className="d-flex justify-content-end mb-3">
        <Form.Select
          style={{ width: "150px" }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="day">By Day</option>
          <option value="week">By Week</option>
          <option value="month">By Month</option>
        </Form.Select>
      </div>

      {/* === Report Content (from ReportDashboard) === */}
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
              {/* Using total revenue per item for ranking */}
              <Bar dataKey="total" fill="#0c4a6e" />
            </BarChart>
          </ResponsiveContainer>
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
                    <td>{order.userEmail}</td>
                    <td>{order.items?.reduce((sum, i) => sum + i.quantity, 0)}</td>
                    <td>
                      ₱
                      {order.items
                        ?.reduce((sum, i) => sum + i.quantity * i.price, 0)
                        .toFixed(2)}
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
