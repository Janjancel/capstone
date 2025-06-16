import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import OrderDetailModal from "./OrderDetailModal";
import { useAuth } from "../../context/AuthContext"; // ✅

const MyOrders = ({ show, onClose }) => {
  const { user } = useAuth(); // ✅ context-based user
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 3;
  const API_URL = process.env.REACT_APP_API_URL;

useEffect(() => {
  if (!show) return;

  // Only proceed once user is loaded
  if (user === null) {
    // still loading user
    return;
  }

  if (!user._id) {
    setError("You must be logged in to view your orders.");
    setLoading(false);
    return;
  }

  setUserEmail(user.email || "");

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders/user/${user._id}`);
      const filtered = res.data.filter(
        (order) =>
          order.status.toLowerCase() !== "delivered" &&
          order.status.toLowerCase() !== "cancelled"
      );
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(filtered);
      setError(""); // clear any previous error
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, [show, user, API_URL]);


  const handleClose = () => {
    setSelectedOrder(null);
    onClose();
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleOrderDetailClose = () => {
    setSelectedOrder(null);
  };

  const startIdx = (currentPage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = orders.slice(startIdx, startIdx + ORDERS_PER_PAGE);

  return (
    <>
      {/* My Orders Modal */}
      <Modal
        show={show && !selectedOrder}
        onHide={handleClose}
        centered
        size="lg"
        backdrop="static"
        className="my-orders-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>My Orders</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <div className="text-center text-danger">
              <p>{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center">
              <p>You have no active orders.</p>
            </div>
          ) : (
            <>
              {paginatedOrders.map((order) => (
                <div key={order._id} className="order-card p-3 mb-3 shadow-sm border rounded">
                  <h5>Order ID: {order._id}</h5>
                  <p>
                    <strong>Order Date:</strong>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <Button
                    variant="outline-primary"
                    onClick={() => handleSelectOrder(order)}
                    className="mt-2"
                  >
                    View Order Details
                  </Button>
                </div>
              ))}

              <div className="d-flex justify-content-between mt-3">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div>
                  Page {currentPage} of {Math.ceil(orders.length / ORDERS_PER_PAGE)}
                </div>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      prev < Math.ceil(orders.length / ORDERS_PER_PAGE) ? prev + 1 : prev
                    )
                  }
                  disabled={currentPage === Math.ceil(orders.length / ORDERS_PER_PAGE)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          show={!!selectedOrder}
          onClose={handleOrderDetailClose}
          order={selectedOrder}
          userEmail={userEmail}
          updateParentOrders={(updatedOrder) =>
            setOrders((prev) =>
              prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
            )
          }
        />
      )}
    </>
  );
};

export default MyOrders;
