import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Button, Form } from "react-bootstrap";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from "recharts";
import html2pdf from "html2pdf.js";

const ReportDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);
  const [itemSalesData, setItemSalesData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [filter, setFilter] = useState("day");
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const fetchedOrders = [];
      const statusCountMap = {};
      let pendingCount = 0;
      let deliveredTotal = 0;
      let cancelledTotal = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        fetchedOrders.push({ id: doc.id, ...data });

        const dateObj = new Date(data.createdAt?.toDate?.());
        let key;

        if (filter === "day") {
          key = dateObj.toISOString().split("T")[0];
        } else if (filter === "week") {
          const startOfWeek = new Date(dateObj);
          startOfWeek.setDate(dateObj.getDate() - dateObj.getDay());
          key = startOfWeek.toISOString().split("T")[0];
        } else {
          key = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, "0")}`;
        }

        const statusKey = (data.status || "Pending").toLowerCase();
        if (!statusCountMap[key]) {
          statusCountMap[key] = { date: key, pending: 0, cancelled: 0, delivered: 0 };
        }
        if (statusKey.includes("pending")) {
          statusCountMap[key].pending++;
          pendingCount++;
        }
        if (statusKey.includes("cancelled")) statusCountMap[key].cancelled++;
        if (statusKey.includes("delivered")) statusCountMap[key].delivered++;

        if (statusKey.includes("delivered")) deliveredTotal++;
        if (statusKey.includes("cancelled")) cancelledTotal++;
      });

      setPendingOrders(pendingCount);
      setStatusChartData(Object.values(statusCountMap).sort((a, b) => new Date(a.date) - new Date(b.date)));
      setPieData([
        { name: "Delivered", value: deliveredTotal },
        { name: "Cancelled", value: cancelledTotal }
      ]);
      setOrders(fetchedOrders);
    });

    const unsubscribeSales = onSnapshot(collection(db, "Sales"), (snapshot) => {
      const salesMap = {};
      let totalRevenue = 0;
      const itemMap = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const dateObj = new Date(data.deliveredAt?.toDate?.());
        let key;

        if (filter === "day") {
          key = dateObj.toISOString().split("T")[0];
        } else if (filter === "week") {
          const startOfWeek = new Date(dateObj);
          startOfWeek.setDate(dateObj.getDate() - dateObj.getDay());
          key = startOfWeek.toISOString().split("T")[0];
        } else {
          key = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, "0")}`;
        }

        salesMap[key] = (salesMap[key] || 0) + data.total;
        totalRevenue += data.total;

        data.items?.forEach(item => {
          itemMap[item.name] = (itemMap[item.name] || 0) + (item.price * item.quantity);
        });
      });

      const chartArray = Object.entries(salesMap).map(([date, total]) => ({ date, total }));
      const itemArray = Object.entries(itemMap).map(([name, total]) => ({ name, total }));
      setChartData(chartArray.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setItemSalesData(itemArray);
      setTotalRevenue(totalRevenue);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeSales();
    };
  }, [filter]);

  const exportCSV = () => {
    const headers = "Order ID,User Email,Total Items,Total Amount\n";
    const rows = orders.map(order => {
      const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = order.items?.reduce((sum, item) => sum + item.quantity * item.price, 0);
      return `${order.id},${order.userEmail},${totalItems},${totalAmount}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const element = document.getElementById("report-content");
    const options = {
      margin: 0.5,
      filename: "report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    };
    html2pdf().set(options).from(element).save();
  };

  // JSX remains unchanged from your layout

  return (
    <div className="container mt-4">
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
        <h6>Export Report</h6>
        <div className="d-flex gap-2 mt-2">
          <Button variant="outline-dark" size="sm" onClick={exportCSV}>Download CSV</Button>
          <Button variant="outline-primary" size="sm" onClick={exportPDF}>Download PDF</Button>
        </div>
      </Card.Body>
    </Card>
  </Col>
</Row>

      <div className="d-flex justify-content-end mb-3">
        <Form.Select
          style={{ width: "150px" }}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="day">By Day</option>
          <option value="week">By Week</option>
          <option value="month">By Month</option>
        </Form.Select>
      </div>

      <div id="report-content">
        <Card className="p-4 shadow-sm mb-4 bg-light">
          <Row>
            <Col md={6}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Sales Over Time</h5>
              </div>
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

        <Card className="p-4 shadow-sm mb-4 bg-light">
          <h5 className="mb-3">Delivered vs Cancelled</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                <Cell fill="#198754" />
                <Cell fill="#dc3545" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

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
                {orders.slice(0, 10).map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.userEmail}</td>
                    <td>{order.items?.reduce((sum, i) => sum + i.quantity, 0)}</td>
                    <td>₱{order.items?.reduce((sum, i) => sum + i.quantity * i.price, 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ReportDashboard;
