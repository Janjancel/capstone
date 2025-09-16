// import React, { useState, useEffect } from "react";
// import { Modal, Button, Spinner } from "react-bootstrap";
// import axios from "axios";
// import OrderDetailModal from "./OrderDetailModal";
// import { useAuth } from "../../context/AuthContext"; // ✅

// const MyOrders = ({ show, onClose }) => {
//   const { user } = useAuth(); // ✅ context-based user
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [userEmail, setUserEmail] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const ORDERS_PER_PAGE = 3;
//   const API_URL = process.env.REACT_APP_API_URL;

// useEffect(() => {
//   if (!show) return;

//   // Only proceed once user is loaded
//   if (user === null) {
//     // still loading user
//     return;
//   }

//   if (!user._id) {
//     setError("You must be logged in to view your orders.");
//     setLoading(false);
//     return;
//   }

//   setUserEmail(user.email || "");

//   const fetchOrders = async () => {
//     try {
//       const res = await axios.get(`${API_URL}/api/orders/user/${user._id}`);
//       const filtered = res.data.filter(
//         (order) =>
//           order.status.toLowerCase() !== "delivered" &&
//           order.status.toLowerCase() !== "cancelled"
//       );
//       filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       setOrders(filtered);
//       setError(""); // clear any previous error
//     } catch (err) {
//       console.error("Error fetching orders:", err);
//       setError("Failed to fetch orders. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchOrders();
// }, [show, user, API_URL]);


//   const handleClose = () => {
//     setSelectedOrder(null);
//     onClose();
//   };

//   const handleSelectOrder = (order) => {
//     setSelectedOrder(order);
//   };

//   const handleOrderDetailClose = () => {
//     setSelectedOrder(null);
//   };

//   const startIdx = (currentPage - 1) * ORDERS_PER_PAGE;
//   const paginatedOrders = orders.slice(startIdx, startIdx + ORDERS_PER_PAGE);

//   return (
//     <>
//       {/* My Orders Modal */}
//       <Modal
//         show={show && !selectedOrder}
//         onHide={handleClose}
//         centered
//         size="lg"
//         backdrop="static"
//         className="my-orders-modal"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>My Orders</Modal.Title>
//         </Modal.Header>

//         <Modal.Body>
//           {loading ? (
//             <div className="text-center">
//               <Spinner animation="border" variant="primary" />
//             </div>
//           ) : error ? (
//             <div className="text-center text-danger">
//               <p>{error}</p>
//             </div>
//           ) : orders.length === 0 ? (
//             <div className="text-center">
//               <p>You have no active orders.</p>
//             </div>
//           ) : (
//             <>
//               {paginatedOrders.map((order) => (
//                 <div key={order._id} className="order-card p-3 mb-3 shadow-sm border rounded">
//                   <h5>Order ID: {order._id}</h5>
//                   <p>
//                     <strong>Order Date:</strong>{" "}
//                     {new Date(order.createdAt).toLocaleString()}
//                   </p>
//                   <Button
//                     variant="outline-primary"
//                     onClick={() => handleSelectOrder(order)}
//                     className="mt-2"
//                   >
//                     View Order Details
//                   </Button>
//                 </div>
//               ))}

//               <div className="d-flex justify-content-between mt-3">
//                 <Button
//                   variant="secondary"
//                   onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                   disabled={currentPage === 1}
//                 >
//                   Previous
//                 </Button>
//                 <div>
//                   Page {currentPage} of {Math.ceil(orders.length / ORDERS_PER_PAGE)}
//                 </div>
//                 <Button
//                   variant="secondary"
//                   onClick={() =>
//                     setCurrentPage((prev) =>
//                       prev < Math.ceil(orders.length / ORDERS_PER_PAGE) ? prev + 1 : prev
//                     )
//                   }
//                   disabled={currentPage === Math.ceil(orders.length / ORDERS_PER_PAGE)}
//                 >
//                   Next
//                 </Button>
//               </div>
//             </>
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* Order Detail Modal */}
//       {selectedOrder && (
//         <OrderDetailModal
//           show={!!selectedOrder}
//           onClose={handleOrderDetailClose}
//           order={selectedOrder}
//           userEmail={userEmail}
//           updateParentOrders={(updatedOrder) =>
//             setOrders((prev) =>
//               prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
//             )
//           }
//         />
//       )}
//     </>
//   );
// };

// export default MyOrders;


// import React, { useState, useEffect } from "react";
// import { Modal, Button, Spinner } from "react-bootstrap";
// import axios from "axios";
// import OrderDetailModal from "./OrderDetailModal";
// import { useAuth } from "../../context/AuthContext"; // ✅

// const MyOrders = ({ show, onClose }) => {
//   const { user } = useAuth(); // ✅ context-based user
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [userEmail, setUserEmail] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const ORDERS_PER_PAGE = 3;
//   const API_URL = process.env.REACT_APP_API_URL;

//   useEffect(() => {
//     if (!show) return;

//     if (user === null) {
//       return; // still loading user
//     }

//     if (!user._id) {
//       setError("You must be logged in to view your orders.");
//       setLoading(false);
//       return;
//     }

//     setUserEmail(user.email || "");

//     const fetchOrders = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/orders/user/${user._id}`);
//         const filtered = res.data.filter(
//           (order) =>
//             order.status.toLowerCase() !== "delivered" &&
//             order.status.toLowerCase() !== "cancelled"
//         );
//         filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//         setOrders(filtered);
//         setError("");
//       } catch (err) {
//         console.error("Error fetching orders:", err);
//         setError("Failed to fetch orders. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [show, user, API_URL]);

//   const handleClose = () => {
//     setSelectedOrder(null);
//     onClose();
//   };

//   const handleSelectOrder = (order) => {
//     setSelectedOrder(order);
//   };

//   const handleOrderDetailClose = () => {
//     setSelectedOrder(null);
//   };

//   // ✅ Stepper logic
//   const steps = ["Pending", "Processing", "Shipped", "Delivered"];

//   const getCurrentStepIndex = (status) => {
//     const index = steps.findIndex(
//       (s) => s.toLowerCase() === status.toLowerCase()
//     );
//     return index !== -1 ? index : 0;
//   };

//   const startIdx = (currentPage - 1) * ORDERS_PER_PAGE;
//   const paginatedOrders = orders.slice(startIdx, startIdx + ORDERS_PER_PAGE);

//   return (
//     <>
//       {/* My Orders Modal */}
//       <Modal
//         show={show && !selectedOrder}
//         onHide={handleClose}
//         centered
//         size="lg"
//         backdrop="static"
//         className="my-orders-modal"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>My Orders</Modal.Title>
//         </Modal.Header>

//         <Modal.Body>
//           {loading ? (
//             <div className="text-center">
//               <Spinner animation="border" variant="primary" />
//             </div>
//           ) : error ? (
//             <div className="text-center text-danger">
//               <p>{error}</p>
//             </div>
//           ) : orders.length === 0 ? (
//             <div className="text-center">
//               <p>You have no active orders.</p>
//             </div>
//           ) : (
//             <>
//               {paginatedOrders.map((order) => {
//                 const currentStep = getCurrentStepIndex(order.status);

//                 return (
//                   <div
//                     key={order._id}
//                     className="order-card p-3 mb-3 shadow-sm border rounded"
//                   >
//                     <h5>Order ID: {order._id}</h5>
//                     <p>
//                       <strong>Order Date:</strong>{" "}
//                       {new Date(order.createdAt).toLocaleString()}
//                     </p>

//                     {/* ✅ Stepper Status Bar */}
//                     <div className="stepper-container mb-3">
//                       {steps.map((step, index) => (
//                         <div
//                           key={step}
//                           className={`stepper-step ${
//                             index <= currentStep ? "active" : ""
//                           }`}
//                         >
//                           <div className="circle">{index + 1}</div>
//                           <span className="step-label">{step}</span>
//                           {index < steps.length - 1 && (
//                             <div
//                               className={`line ${
//                                 index < currentStep ? "active" : ""
//                               }`}
//                             />
//                           )}
//                         </div>
//                       ))}
//                     </div>

//                     <Button
//                       variant="outline-primary"
//                       onClick={() => handleSelectOrder(order)}
//                       className="mt-2"
//                     >
//                       View Order Details
//                     </Button>
//                   </div>
//                 );
//               })}

//               {/* Pagination */}
//               <div className="d-flex justify-content-between mt-3">
//                 <Button
//                   variant="secondary"
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.max(prev - 1, 1))
//                   }
//                   disabled={currentPage === 1}
//                 >
//                   Previous
//                 </Button>
//                 <div>
//                   Page {currentPage} of{" "}
//                   {Math.ceil(orders.length / ORDERS_PER_PAGE)}
//                 </div>
//                 <Button
//                   variant="secondary"
//                   onClick={() =>
//                     setCurrentPage((prev) =>
//                       prev < Math.ceil(orders.length / ORDERS_PER_PAGE)
//                         ? prev + 1
//                         : prev
//                     )
//                   }
//                   disabled={
//                     currentPage === Math.ceil(orders.length / ORDERS_PER_PAGE)
//                   }
//                 >
//                   Next
//                 </Button>
//               </div>
//             </>
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* Order Detail Modal */}
//       {selectedOrder && (
//         <OrderDetailModal
//           show={!!selectedOrder}
//           onClose={handleOrderDetailClose}
//           order={selectedOrder}
//           userEmail={userEmail}
//           updateParentOrders={(updatedOrder) =>
//             setOrders((prev) =>
//               prev.map((o) =>
//                 o._id === updatedOrder._id ? updatedOrder : o
//               )
//             )
//           }
//         />
//       )}

//       {/* ✅ CSS for Stepper */}
//       <style jsx>{`
//         .stepper-container {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin: 20px 0;
//           position: relative;
//         }

//         .stepper-step {
//           text-align: center;
//           flex: 1;
//           position: relative;
//         }

//         .circle {
//           width: 24px;
//           height: 24px;
//           border-radius: 50%;
//           background-color: #ccc;
//           color: white;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           margin: 0 auto 6px;
//           z-index: 2;
//           position: relative;
//         }

//         .stepper-step.active .circle {
//           background-color: #007bff;
//         }

//         .step-label {
//           font-size: 0.85rem;
//           display: block;
//         }

//         .line {
//           position: absolute;
//           top: 12px;
//           left: 50%;
//           width: 100%;
//           height: 2px;
//           background-color: #ccc;
//           z-index: 1;
//         }

//         .line.active {
//           background-color: #007bff;
//         }

//         .stepper-step:last-child .line {
//           display: none;
//         }
//       `}</style>
//     </>
//   );
// };

// export default MyOrders;

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
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

    if (user === null) {
      return; // still loading user
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
        setError("");
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

  // ✅ Stepper logic
  const steps = ["Pending", "Processing", "Shipped", "Delivered"];

  const getCurrentStepIndex = (status) => {
    const index = steps.findIndex(
      (s) => s.toLowerCase() === status.toLowerCase()
    );
    return index !== -1 ? index : 0;
  };

  const startIdx = (currentPage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = orders.slice(startIdx, startIdx + ORDERS_PER_PAGE);

  return (
    <>
      {/* My Orders Dialog */}
      <Dialog
        open={show && !selectedOrder}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>My Orders</DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box textAlign="center" color="error.main" py={2}>
              <Typography>{error}</Typography>
            </Box>
          ) : orders.length === 0 ? (
            <Box textAlign="center" py={2}>
              <Typography>You have no active orders.</Typography>
            </Box>
          ) : (
            <>
              {paginatedOrders.map((order) => {
                const currentStep = getCurrentStepIndex(order.status);

                return (
                  <Box
                    key={order._id}
                    className="order-card"
                    sx={{
                      p: 2,
                      mb: 2,
                      border: "1px solid #ddd",
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="h6">
                      Order ID: {order._id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Order Date:</strong>{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </Typography>

                    {/* ✅ Custom Stepper Status Bar */}
                    <div className="stepper-container">
                      {steps.map((step, index) => (
                        <div
                          key={step}
                          className={`stepper-step ${
                            index <= currentStep ? "active" : ""
                          }`}
                        >
                          <div className="circle">{index + 1}</div>
                          <span className="step-label">{step}</span>
                          {index < steps.length - 1 && (
                            <div
                              className={`line ${
                                index < currentStep ? "active" : ""
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleSelectOrder(order)}
                      sx={{ mt: 2 }}
                    >
                      View Order Details
                    </Button>
                  </Box>
                );
              })}

              {/* Pagination */}
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Typography>
                  Page {currentPage} of{" "}
                  {Math.ceil(orders.length / ORDERS_PER_PAGE)}
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      prev < Math.ceil(orders.length / ORDERS_PER_PAGE)
                        ? prev + 1
                        : prev
                    )
                  }
                  disabled={
                    currentPage === Math.ceil(orders.length / ORDERS_PER_PAGE)
                  }
                >
                  Next
                </Button>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Detail Dialog */}
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

      {/* ✅ Keep your custom Stepper CSS */}
      <style jsx>{`
        .stepper-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px 0;
          position: relative;
        }

        .stepper-step {
          text-align: center;
          flex: 1;
          position: relative;
        }

        .circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #ccc;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 6px;
          z-index: 2;
          position: relative;
        }

        .stepper-step.active .circle {
          background-color: #1976d2; /* MUI primary blue */
        }

        .step-label {
          font-size: 0.85rem;
          display: block;
        }

        .line {
          position: absolute;
          top: 12px;
          left: 50%;
          width: 100%;
          height: 2px;
          background-color: #ccc;
          z-index: 1;
        }

        .line.active {
          background-color: #1976d2;
        }

        .stepper-step:last-child .line {
          display: none;
        }
      `}</style>
    </>
  );
};

export default MyOrders;
