import React, { useEffect, useState } from "react";
import { Modal, Button, Badge, Spinner } from "react-bootstrap";
import axios from "axios";
import toast from "react-hot-toast";

const OrderDetailModal = ({ show, onClose, order, userEmail, updateParentOrders }) => {
  const [realTimeOrder, setRealTimeOrder] = useState(order);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!order?.id && !order?._id) return;

    const fetchOrder = async () => {
      try {
        const orderId = order.id || order._id;
        const [orderRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/api/orders/${orderId}`),
          axios.get(`${API_URL}/api/users`)
        ]);

        const userMap = {};
        usersRes.data.forEach((user) => {
          userMap[user._id] = user;
        });

        setRealTimeOrder({ ...orderRes.data, userEmail: userMap[orderRes.data.userId]?.email || "Unknown" });
        setUserData(userMap);
        updateParentOrders(orderRes.data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [order?.id, order?._id, API_URL]);

  const handleCancelRequest = async () => {
    try {
      const orderId = realTimeOrder.id || realTimeOrder._id;
      await axios.patch(`${API_URL}/api/orders/${orderId}/cancel`, {
        email: userEmail,
      });

      // Notify admin
      await axios.post(`${API_URL}/api/notifications`, {
        orderId: orderId,
        userId: realTimeOrder.userId,
        status: "Cancellation Requested",
        role: "admin", // ✅ NEW: admin role
        message: `User ${userEmail} requested cancellation for Order ID: ${orderId}`,
      });

      const updatedOrder = { ...realTimeOrder, status: "Cancellation Requested" };
      setRealTimeOrder(updatedOrder);
      updateParentOrders(updatedOrder);
      toast.success("Cancellation request sent and admin notified.");
      onClose();
    } catch (err) {
      console.error("Error requesting cancellation:", err);
      toast.error("Failed to request cancellation.");
    }
  };

  const getStatusVariant = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending": return "secondary";
      case "processing": return "primary";
      case "shipped": return "info";
      case "delivered": return "success";
      case "cancellation requested":
      case "cancel requested": return "warning";
      case "cancelled": return "danger";
      default: return "dark";
    }
  };

  if (!realTimeOrder) return null;

  const { address = {}, items = [], userEmail: displayEmail } = realTimeOrder;
  const rawStatus = (realTimeOrder.status || "").toLowerCase().trim();
  const showCancelBtn = rawStatus === "pending";

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Order Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <h5>Order ID: {realTimeOrder.id || realTimeOrder._id}</h5>
            <p>
              <strong>Email:</strong> {displayEmail || userEmail || "Unknown"}
            </p>
            <p>
              <strong>Date:</strong> {new Date(realTimeOrder.createdAt).toLocaleString() || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> <Badge bg={getStatusVariant(rawStatus)}>{realTimeOrder.status || "N/A"}</Badge>
            </p>
            <p>
              <strong>Total Price:</strong> ₱{parseFloat(realTimeOrder.total || 0).toFixed(2)}
            </p>

            <h6>Shipping Address</h6>
            <address>
              {address.houseNo && `House No: ${address.houseNo}, `}
              {address.street && `${address.street}, `}
              {address.barangay && `Brgy. ${address.barangay}, `}
              {address.city && `${address.city}, `}
              {address.province && `${address.province}, `}
              {address.region && `${address.region}, `}
              {address.zipCode && `ZIP: ${address.zipCode}`}
            </address>

            <h6 className="mt-3">Order Summary</h6>
            <div className="table-responsive">
              <table className="table table-bordered text-center">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Item Name</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <img
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          width="60"
                          height="50"
                          className="img-thumbnail"
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>₱{parseFloat(item.price).toFixed(2)}</td>
                      <td>₱{(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {showCancelBtn && (
          <Button variant="danger" onClick={handleCancelRequest}>
            Request Order Cancellation
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          Back
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailModal;
