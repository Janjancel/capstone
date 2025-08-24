
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import {
//   Button,
//   Spinner,
//   Pagination,
//   Form,
//   InputGroup,
//   Badge,
//   Nav,
// } from "react-bootstrap";
// import toast from "react-hot-toast";
// import InVoice from "./InVoice";

// const OrderDashboard = () => {
//   const [orders, setOrders] = useState([]);
//   const [userData, setUserData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchEmail, setSearchEmail] = useState("");
//   const [statusTab, setStatusTab] = useState("All");
//   const [showInvoice, setShowInvoice] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 5;
//   const intervalRef = useRef(null);
//   const API_URL = process.env.REACT_APP_API_URL;

//   const fetchOrders = async () => {
//     try {
//       const [ordersRes, usersRes] = await Promise.all([
//         axios.get(`${API_URL}/api/orders`),
//         axios.get(`${API_URL}/api/users`),
//       ]);
//       const userMap = {};
//       usersRes.data.forEach((user) => {
//         userMap[user._id] = user;
//       });
//       setOrders(
//         ordersRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//       );
//       setUserData(userMap);
//       setLoading(false);
//     } catch (err) {
//       console.error("Failed to fetch orders:", err);
//       setError("Failed to fetch orders.");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//     intervalRef.current = setInterval(fetchOrders, 3000);
//     return () => clearInterval(intervalRef.current);
//   }, []);

//   const handleShowInvoice = (order) => {
//     setSelectedOrder({
//       ...order,
//       userEmail: userData[order.userId]?.email || "Unknown",
//     });
//     setShowInvoice(true);
//   };

//   const handleCloseInvoice = () => {
//     setShowInvoice(false);
//     setSelectedOrder(null);
//   };

//   const handleStatusChange = async (order, newStatus) => {
//     const confirm = await Swal.fire({
//       title: `Update status to "${newStatus}"?`,
//       text: "This action cannot be undone.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, update it!",
//     });

//     if (!confirm.isConfirmed) return;

//     try {
//       await axios.put(`${API_URL}/api/orders/${order._id}/status`, {
//         status: newStatus,
//       });

//       await axios.post(`${API_URL}/api/notifications`, {
//         orderId: order._id,
//         userId: order.userId,
//         status: newStatus,
//         role: "client",
//         message: `Your order (${order._id}) status is now "${newStatus}".`,
//       });

//       if (newStatus === "Delivered") {
//         await axios.post(`${API_URL}/api/sales`, {
//           orderId: order._id,
//           userId: order.userId,
//           total: order.total,
//           items: order.items,
//           deliveredAt: new Date(),
//         });
//       }

//       toast.success(`Order marked as ${newStatus}.`);
//       fetchOrders();
//     } catch (err) {
//       console.error("Status update failed:", err);
//       toast.error("Failed to update order status.");
//     }
//   };

//   const handleApproveCancellation = async (order) => {
//     handleStatusChange(order, "Cancelled");
//   };

//   const getStatusVariant = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "pending": return "secondary";
//       case "processing": return "primary";
//       case "shipped": return "info";
//       case "delivered": return "success";
//       case "cancel requested":
//       case "cancellation requested": return "warning";
//       case "cancelled": return "danger";
//       default: return "dark";
//     }
//   };

//   const filteredOrders = orders.filter((o) => {
//     const emailMatch = (userData[o.userId]?.email || "")
//       .toLowerCase()
//       .includes(searchEmail.toLowerCase());
//     const statusMatch =
//       statusTab === "All" || (o.status || "Pending") === statusTab;
//     return emailMatch && statusMatch;
//   });

//   const totalPages = Math.ceil(filteredOrders.length / pageSize);
//   const currentOrders = filteredOrders.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   return (
//     <div className="mt-4 order-dashboard container">
//       <h4 className="mb-3">Order Dashboard</h4>

//       <Nav variant="tabs" defaultActiveKey="All" className="mb-3">
//         {["All", "Pending", "Cancelled", "Cancellation Requested", "Shipped", "Delivered"].map(
//           (status) => (
//             <Nav.Item key={status}>
//               <Nav.Link
//                 eventKey={status}
//                 active={statusTab === status}
//                 onClick={() => setStatusTab(status)}
//                 className={statusTab === status ? "text-dark" : "text-secondary"}
//               >
//                 {status}
//               </Nav.Link>
//             </Nav.Item>
//           )
//         )}
//       </Nav>

//       <div className="d-flex justify-content-between mb-3">
//         <InputGroup style={{ width: "300px" }}>
//           <Form.Control
//             placeholder="Search by email"
//             value={searchEmail}
//             onChange={(e) => setSearchEmail(e.target.value)}
//           />
//         </InputGroup>
//         <Button
//           variant="success"
//           onClick={() => {
//             const headers = ["Order ID", "Email", "Order Date", "Total", "Status"];
//             const rows = filteredOrders.map((o) => [
//               o._id,
//               userData[o.userId]?.email || "Unknown",
//               new Date(o.createdAt).toLocaleString(),
//               o.total,
//               o.status || "Pending",
//             ]);
//             const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
//             const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//             const url = URL.createObjectURL(blob);
//             const link = document.createElement("a");
//             link.href = url;
//             link.download = "orders.csv";
//             link.click();
//           }}
//         >
//           Export to CSV
//         </Button>
//       </div>

//       {loading ? (
//         <div className="text-center"><Spinner animation="border" /></div>
//       ) : error ? (
//         <p className="text-danger text-center">{error}</p>
//       ) : filteredOrders.length === 0 ? (
//         <p className="text-center">No orders found.</p>
//       ) : (
//         <>
//           {currentOrders.map((order) => {
//             const email = userData[order.userId]?.email || "Unknown";
//             const status = (order.status || "Pending").toLowerCase();
//             const isFinal = ["delivered", "cancelled"].includes(status);
//             const isCancelable = ["cancellation requested", "cancel requested"].includes(status);

//             return (
//               <div key={order._id} className="order-card p-3 mb-3 shadow-sm border rounded">
//                 <h5>Order ID: {order._id}</h5>
//                 <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
//                 <p><strong>Email:</strong> {email}</p>

//                 <h6>Items:</h6>
//                 <ul className="list-unstyled">
//                   {order.items?.map((item, i) => (
//                     <li key={i}>
//                       <strong>{item.name}</strong> (Qty: {item.quantity}) – ₱
//                       {(item.quantity * parseFloat(item.price || 0)).toFixed(2)}
//                     </li>
//                   ))}
//                 </ul>

//                 <div className="d-flex justify-content-between align-items-center mt-3">
//                   <div>
//                     <p className="mb-1"><strong>Total:</strong> ₱{parseFloat(order.total || 0).toFixed(2)}</p>
//                     <div className="d-flex align-items-center gap-2 mb-2">
//                       <span><strong>Status:</strong></span>
//                       <Badge bg={getStatusVariant(order.status)}>{order.status || "Pending"}</Badge>
//                     </div>

//                     {!isFinal && (
//                       <div className="d-flex flex-wrap gap-2">
//                         <Button variant="outline-info" size="sm" onClick={() => handleStatusChange(order, "Shipped")}>
//                           Mark Shipped
//                         </Button>
//                         <Button variant="outline-success" size="sm" onClick={() => handleStatusChange(order, "Delivered")}>
//                           Mark Delivered
//                         </Button>
//                         {isCancelable && (
//                           <Button variant="danger" size="sm" onClick={() => handleApproveCancellation(order)}>
//                             Approve Cancellation
//                           </Button>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   <Button variant="outline-primary" onClick={() => handleShowInvoice(order)}>
//                     View Details
//                   </Button>
//                 </div>
//               </div>
//             );
//           })}

//           <div className="d-flex justify-content-center mt-4">
//             <Pagination>
//               {Array.from({ length: totalPages }, (_, i) => (
//                 <Pagination.Item
//                   key={i + 1}
//                   active={i + 1 === currentPage}
//                   onClick={() => setCurrentPage(i + 1)}
//                 >
//                   {i + 1}
//                 </Pagination.Item>
//               ))}
//             </Pagination>
//           </div>
//         </>
//       )}

//       <InVoice show={showInvoice} handleClose={handleCloseInvoice} order={selectedOrder} />
//     </div>
//   );
// };

// export default OrderDashboard;


import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import InVoice from "./InVoice";

// Material UI imports
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Divider,
} from "@mui/material";

// Keep Bootstrap Pagination ONLY
import { Pagination } from "react-bootstrap";

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
    const ordersRes = await axios.get(`${API_URL}/api/orders`);
    setOrders(
      ordersRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
    setLoading(false);
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    setError("Failed to fetch orders.");
    setLoading(false);
  }
};
  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 3000);
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
    const confirm = await Swal.fire({
      title: `Update status to "${newStatus}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
    });

    if (!confirm.isConfirmed) return;

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

      if (newStatus === "Delivered") {
        await axios.post(`${API_URL}/api/sales`, {
          orderId: order._id,
          userId: order.userId,
          total: order.total,
          items: order.items,
          deliveredAt: new Date(),
        });
      }

      toast.success(`Order marked as ${newStatus}.`);
      fetchOrders();
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update order status.");
    }
  };

  const handleApproveCancellation = async (order) => {
    handleStatusChange(order, "Cancelled");
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending": return "default";
      case "processing": return "primary";
      case "shipped": return "info";
      case "delivered": return "success";
      case "cancel requested":
      case "cancellation requested": return "warning";
      case "cancelled": return "error";
      default: return "default";
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
    <Box className="mt-4 container">
      <Typography variant="h5" gutterBottom>
        Order Dashboard
      </Typography>

      {/* Tabs */}
      <Tabs
        value={statusTab}
        onChange={(e, val) => setStatusTab(val)}
        textColor="primary"
        indicatorColor="primary"
        className="mb-3"
      >
        {["All", "Pending", "Cancelled", "Cancellation Requested", "Shipped", "Delivered"].map(
          (status) => (
            <Tab key={status} label={status} value={status} />
          )
        )}
      </Tabs>

      {/* Search + Export */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          label="Search by email"
          variant="outlined"
          size="small"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          style={{ width: 300 }}
        />
        <Button
          variant="contained"
          color="success"
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
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : filteredOrders.length === 0 ? (
        <Typography align="center">No orders found.</Typography>
      ) : (
        <>
          {currentOrders.map((order) => {
            const email = userData[order.userId]?.email || "Unknown";
            const status = (order.status || "Pending").toLowerCase();
            const isFinal = ["delivered", "cancelled"].includes(status);
            const isCancelable = ["cancellation requested", "cancel requested"].includes(status);

            return (
              <Card key={order._id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                <CardContent>
                  <Typography variant="h6">Order ID: {order._id}</Typography>
                  <Typography><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</Typography>
                  <Typography><strong>Email:</strong> {email}</Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="subtitle1">Items:</Typography>
                  <ul>
                    {order.items?.map((item, i) => (
                      <li key={i}>
                        <strong>{item.name}</strong> (Qty: {item.quantity}) – ₱
                        {(item.quantity * parseFloat(item.price || 0)).toFixed(2)}
                      </li>
                    ))}
                  </ul>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Box>
                      <Typography><strong>Total:</strong> ₱{parseFloat(order.total || 0).toFixed(2)}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography><strong>Status:</strong></Typography>
                        <Chip label={order.status || "Pending"} color={getStatusColor(order.status)} />
                      </Box>

                      {!isFinal && (
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                          <Button variant="outlined" color="info" size="small" onClick={() => handleStatusChange(order, "Shipped")}>
                            Mark Shipped
                          </Button>
                          <Button variant="outlined" color="success" size="small" onClick={() => handleStatusChange(order, "Delivered")}>
                            Mark Delivered
                          </Button>
                          {isCancelable && (
                            <Button variant="contained" color="error" size="small" onClick={() => handleApproveCancellation(order)}>
                              Approve Cancellation
                            </Button>
                          )}
                        </Box>
                      )}
                    </Box>
                    <Button variant="outlined" color="primary" onClick={() => handleShowInvoice(order)}>
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination (Bootstrap) */}
          <Box display="flex" justifyContent="center" mt={3}>
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
          </Box>
        </>
      )}

      <InVoice show={showInvoice} handleClose={handleCloseInvoice} order={selectedOrder} />
    </Box>
  );
};

export default OrderDashboard;
