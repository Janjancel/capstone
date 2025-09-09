import React from "react";
import { Row, Col, ProgressBar, Card } from "react-bootstrap";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6610f2", "#20c997", "#fd7e14"];

const DashboardAnalytics = ({ analytics, productChartData, dailySalesData, selectedRange }) => {
  const xAxisTitle =
    selectedRange === "day" ? "Date" :
    selectedRange === "week" ? "Week Start" :
    "Month";

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, units, price, revenue } = payload[0].payload;
      return (
        <div style={{
          backgroundColor: "#2c2f3e", padding: "10px", borderRadius: "8px", color: "#fff"
        }}>
          <strong>{name}</strong>
          <p className="mb-0">Units Sold: {units}</p>
          <p className="mb-0">Price per Unit: ₱{price.toFixed(2)}</p>
          <p className="mb-0">Revenue: ₱{revenue.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const totalRevenue = productChartData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const averageRevenue = productChartData.length > 0 ? totalRevenue / productChartData.length : 0;

  return (
    <>
      {/* Summary Cards */}
      <Row className="mt-4 mb-2">
        <Col md={6}>
          <Card className="bg-white text-dark shadow-sm">
            <Card.Body>
              <h5 className="text-muted">Total Sales</h5>
              <h3 className="text-success fw-bold">₱{totalRevenue.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="bg-white text-dark shadow-sm">
            <Card.Body>
              <h5 className="text-muted">Average Sales per Product</h5>
              <h3 className="text-info fw-bold">₱{averageRevenue.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Analytics Overview */}
      <Row className="mt-4">
        <Col>
          <div className="bg-white text-dark p-3 rounded shadow-sm">
            <h4 className="mb-3">Analytics Overview</h4>
            <p>Total Sell Requests</p>
            <ProgressBar now={analytics.total_sell_requests} max={100} variant="info" />
            <p className="mt-3">Total Demolish Requests</p>
            <ProgressBar now={analytics.total_demolish_requests} max={100} variant="danger" />
            <p className="mt-3">Total Orders</p>
            <ProgressBar now={analytics.total_orders} max={100} variant="success" />
          </div>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mt-5">
        <Col md={6}>
          <div className="bg-light p-3 rounded shadow-sm text-dark">
            <h5 className="mb-3">Product Sales</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productChartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00c6ff" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#0072ff" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="name" stroke="#ccc" angle={-30} textAnchor="end" />
                <YAxis stroke="#ccc" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="units" fill="url(#barGradient)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>

        <Col md={6}>
          <div className="bg-light p-3 rounded shadow-sm text-dark">
            <h5 className="mb-3">Sales Trend by {xAxisTitle}</h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySalesData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#4facfe" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="date" stroke="#ccc" angle={-30} textAnchor="end" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>

      {/* Donut Chart */}
      <Row className="mt-5">
        <Col>
          <div className="bg-light p-3 rounded shadow-sm text-dark text-center">
            <h5 className="mb-3">Revenue Distribution</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productChartData}
                  dataKey="revenue"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {productChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#2c2f3e", border: "none", color: "#fff" }}
                  formatter={(value) => [`${value.toFixed(2)}`, "Revenue"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default DashboardAnalytics;


