import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Button,
  Spinner,
  Pagination,
  Form,
  InputGroup,
  Badge,
  Nav,
} from "react-bootstrap";
import InVoice from "./InVoice";

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [statusTab, setStatusTab] = useState("All");
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const intervalRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchOrders = async () => {
    try {
      const [ordersRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/orders`),
        axios.get(`${API_URL}/api/users`),
      ]);

      const userMap = {};
      usersRes.data.forEach((user) => {
        userMap[user._id] = user;
      });

      const sortedOrders = ordersRes.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sortedOrders);
      setUserData(userMap);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to fetch orders.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(() => {
      fetchOrders();
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleShowInvoice = (order) => {
    setSelectedOrder({
      ...order,
      userEmail: userData[order.userId]?.email || "Unknown",
    });
    setShowInvoice(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (order, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/orders/${order._id}/status`, {
        status: newStatus,
      });

      await axios.post(`${API_URL}/api/notifications`, {
        orderId: order._id,
        userId: order.userId,
        status: newStatus,
        role: "client",
        message: `Your order (${order._id}) status is now "${newStatus}".`,
      });
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleApproveCancellation = async (order) => {
    try {
      await axios.put(`${API_URL}/api/orders/${order._id}/cancel`);

      await axios.post(`${API_URL}/api/notifications`, {
        orderId: order._id,
        userId: order.userId,
        status: "Cancelled",
        role: "client",
        message: `Your order (${order._id}) has been cancelled.`,
      });
    } catch (err) {
      console.error("Approve cancellation failed:", err);
    }
  };

  const getStatusVariant = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "secondary";
      case "processing":
        return "primary";
      case "shipped":
        return "info";
      case "delivered":
        return "success";
      case "cancel requested":
      case "cancellation requested":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "dark";
    }
  };

  const filteredOrders = orders.filter((o) => {
    const emailMatch = (userData[o.userId]?.email || "")
      .toLowerCase()
      .includes(searchEmail.toLowerCase());
    const statusMatch =
      statusTab === "All" || (o.status || "Pending") === statusTab;
    return emailMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="mt-4 order-dashboard container">
      <h4 className="mb-3">Order Dashboard</h4>

      <Nav variant="tabs" defaultActiveKey="All" className="mb-3">
        {["All", "Pending", "Cancelled", "Cancellation Requested", "Shipped", "Delivered"].map(
          (status) => (
            <Nav.Item key={status}>
              <Nav.Link
                eventKey={status}
                active={statusTab === status}
                onClick={() => setStatusTab(status)}
                className={statusTab === status ? "text-dark" : "text-secondary"}
              >
                {status}
              </Nav.Link>
            </Nav.Item>
          )
        )}
      </Nav>

      <div className="d-flex justify-content-between mb-3">
        <InputGroup style={{ width: "300px" }}>
          <Form.Control
            placeholder="Search by email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
        </InputGroup>
        <Button
          variant="success"
          onClick={() => {
            const headers = ["Order ID", "Email", "Order Date", "Total", "Status"];
            const rows = filteredOrders.map((o) => [
              o._id,
              userData[o.userId]?.email || "Unknown",
              new Date(o.createdAt).toLocaleString(),
              o.total,
              o.status || "Pending",
            ]);
            const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "orders.csv";
            link.click();
          }}
        >
          Export to CSV
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center">No orders found.</p>
      ) : (
        <>
          {currentOrders.map((order) => {
            const email = userData[order.userId]?.email || "Unknown";
            const status = (order.status || "Pending").toLowerCase();
            const isFinal = ["delivered", "cancelled"].includes(status);
            const isCancelable = ["cancellation requested", "cancel requested"].includes(status);

            return (
              <div key={order._id} className="order-card p-3 mb-3 shadow-sm border rounded">
                <h5>Order ID: {order._id}</h5>
                <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Email:</strong> {email}</p>

                <h6>Items:</h6>
                <ul className="list-unstyled">
                  {order.items?.map((item, i) => (
                    <li key={i}>
                      <strong>{item.name}</strong> (Qty: {item.quantity}) – ₱
                      {(item.quantity * parseFloat(item.price || 0)).toFixed(2)}
                    </li>
                  ))}
                </ul>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <p className="mb-1"><strong>Total:</strong> ₱{parseFloat(order.total || 0).toFixed(2)}</p>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span><strong>Status:</strong></span>
                      <Badge bg={getStatusVariant(order.status)}>{order.status || "Pending"}</Badge>
                    </div>

                    {!isFinal && (
                      <div className="d-flex flex-wrap gap-2">
                        <Button variant="outline-info" size="sm" onClick={() => handleStatusChange(order, "Shipped")}>
                          Mark Shipped
                        </Button>
                        <Button variant="outline-success" size="sm" onClick={() => handleStatusChange(order, "Delivered")}>
                          Mark Delivered
                        </Button>
                        {isCancelable && (
                          <Button variant="danger" size="sm" onClick={() => handleApproveCancellation(order)}>
                            Approve Cancellation
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <Button variant="outline-primary" onClick={() => handleShowInvoice(order)}>
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        </>
      )}

      <InVoice show={showInvoice} handleClose={handleCloseInvoice} order={selectedOrder} />
    </div>
  );
};

export default OrderDashboard;
