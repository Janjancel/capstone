
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
// import { collection, onSnapshot } from "firebase/firestore";
// import { db } from "../../firebase/firebase";
// import "bootstrap/dist/css/bootstrap.min.css";

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

//   useEffect(() => {
//     const unsubDemolish = onSnapshot(collection(db, "demolishRequest"), (snapshot) => {
//       setDemolitionCount(snapshot.size);
//       setAnalytics(prev => ({ ...prev, total_demolish_requests: snapshot.size }));
//     });

//     const unsubSell = onSnapshot(collection(db, "sellRequest"), (snapshot) => {
//       setSellCount(snapshot.size);
//       setAnalytics(prev => ({ ...prev, total_sell_requests: snapshot.size }));
//     });

//     return () => {
//       unsubDemolish();
//       unsubSell();
//     };
//   }, []);

//   useEffect(() => {
//     const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
//       setOrderCount(snapshot.size);
//       setAnalytics(prev => ({ ...prev, total_orders: snapshot.size }));

//       const salesByProduct = {};
//       const salesByDate = {};

//       snapshot.docs.forEach(doc => {
//         const order = doc.data();
//         const dateObj = order.createdAt?.toDate?.();
//         const dateKey = dateObj ? formatDateKey(dateObj, selectedRange) : "Invalid Date";

//         (order.items || []).forEach(item => {
//           const name = item.name || "Unnamed Product";
//           const quantity = item.quantity || 1;
//           const price = parseFloat(item.price) || 0;

//           if (!salesByProduct[name]) {
//             salesByProduct[name] = { units: 0, revenue: 0 };
//           }

//           salesByProduct[name].units += quantity;
//           salesByProduct[name].revenue += quantity * price;
//         });

//         salesByDate[dateKey] = (salesByDate[dateKey] || 0) + 1;
//       });

//       const formattedProducts = Object.entries(salesByProduct).map(([name, stats]) => ({
//         name,
//         units: stats.units,
//         price: stats.units > 0 ? stats.revenue / stats.units : 0,
//         revenue: stats.revenue,
//       }));

//       const formattedDaily = Object.entries(salesByDate).map(([date, orders]) => ({
//         date,
//         orders,
//       }));

//       setProductSales(formattedProducts);
//       setDailySales(formattedDaily);
//     });

//     return () => unsubOrders();
//   }, [selectedRange]);

//   return (
//     <Container className="mt-4 p-3 bg-white border-bottom shadow-sm">
//       <Row className="g-4 row-cols-1 row-cols-md-3 mb-3">
//         <Col>
//           <Button className="w-100 p-4 d-flex flex-column align-items-center border-0" onClick={() => navigate("/admin/demolishDashboard")} style={{ backgroundColor: "#f8f9fa" }}>
//             <BuildingFillX size={40} className="mb-2 text-danger" />
//             <h5 className="text-dark">Demolition Requests</h5>
//             <div className="fs-3 fw-bold text-secondary">{demolitionCount}</div>
//           </Button>
//         </Col>
//         <Col>
//           <Button className="w-100 p-4 d-flex flex-column align-items-center border-0" onClick={() => navigate("/admin/sellDashboard")} style={{ backgroundColor: "#f8f9fa" }}>
//             <HouseFill size={40} className="mb-2 text-primary" />
//             <h5 className="text-dark">Sell Requests</h5>
//             <div className="fs-3 fw-bold text-secondary">{sellCount}</div>
//           </Button>
//         </Col>
//         <Col>
//           <Button className="w-100 p-4 d-flex flex-column align-items-center border-0" onClick={() => navigate("/admin/orders")} style={{ backgroundColor: "#f8f9fa" }}>
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
//             <Form.Select value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)}>
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
import DashboardAnalytics from "./DashboardAnalytics";
import {
  Container,
  Row,
  Col,
  Button,
  Form
} from "react-bootstrap";
import {
  BuildingFillX,
  HouseFill,
  CartFill
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = process.env.REACT_APP_API_URL; // ✅ Use env variable

const Dashboard = () => {
  const navigate = useNavigate();

  const [demolitionCount, setDemolitionCount] = useState(0);
  const [sellCount, setSellCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [analytics, setAnalytics] = useState({
    total_sell_requests: 0,
    total_demolish_requests: 0,
    total_orders: 0,
  });

  const [selectedRange, setSelectedRange] = useState("day");
  const [productSales, setProductSales] = useState([]);
  const [dailySales, setDailySales] = useState([]);

  const formatDateKey = (dateObj, range) => {
    const d = new Date(dateObj);
    if (range === "day") return d.toISOString().split("T")[0];
    if (range === "week") {
      const startOfWeek = new Date(d.setDate(d.getDate() - d.getDay()));
      return startOfWeek.toISOString().split("T")[0];
    }
    if (range === "month") {
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    }
    return "Unknown";
  };

  // Fetch demolition and sell counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const demolishRes = await axios.get(`${API_URL}/api/demolish`);
        const sellRes = await axios.get(`${API_URL}/api/sell`);

        setDemolitionCount(demolishRes.data.length || 0);
        setSellCount(sellRes.data.length || 0);

        setAnalytics((prev) => ({
          ...prev,
          total_demolish_requests: demolishRes.data.length || 0,
          total_sell_requests: sellRes.data.length || 0,
        }));
      } catch (error) {
        console.error("Error fetching demolish/sell counts:", error);
      }
    };

    fetchCounts();
  }, []);

  // Fetch orders and build analytics
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders`);
        const orders = res.data || [];

        setOrderCount(orders.length);

        setAnalytics((prev) => ({
          ...prev,
          total_orders: orders.length,
        }));

        const salesByProduct = {};
        const salesByDate = {};

        orders.forEach((order) => {
          const dateObj = new Date(order.createdAt);
          const dateKey = dateObj ? formatDateKey(dateObj, selectedRange) : "Invalid Date";

          (order.items || []).forEach((item) => {
            const name = item.name || "Unnamed Product";
            const quantity = item.quantity || 1;
            const price = parseFloat(item.price) || 0;

            if (!salesByProduct[name]) {
              salesByProduct[name] = { units: 0, revenue: 0 };
            }

            salesByProduct[name].units += quantity;
            salesByProduct[name].revenue += quantity * price;
          });

          salesByDate[dateKey] = (salesByDate[dateKey] || 0) + 1;
        });

        const formattedProducts = Object.entries(salesByProduct).map(
          ([name, stats]) => ({
            name,
            units: stats.units,
            price: stats.units > 0 ? stats.revenue / stats.units : 0,
            revenue: stats.revenue,
          })
        );

        const formattedDaily = Object.entries(salesByDate).map(
          ([date, orders]) => ({
            date,
            orders,
          })
        );

        setProductSales(formattedProducts);
        setDailySales(formattedDaily);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [selectedRange]);

  return (
    <Container className="mt-4 p-3 bg-white border-bottom shadow-sm">
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

      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>View Sales By</Form.Label>
            <Form.Select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <DashboardAnalytics
          analytics={analytics}
          productChartData={productSales}
          dailySalesData={dailySales}
          selectedRange={selectedRange}
        />
      </Row>
    </Container>
  );
};

export default Dashboard;
