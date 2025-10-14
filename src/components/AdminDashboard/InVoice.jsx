// import React, { useRef } from "react";
// import { Modal, Button } from "react-bootstrap";
// import html2pdf from "html2pdf.js";
// import logo from "../images/logo.png";

// const InVoice = ({ show, handleClose, order }) => {
//   const invoiceRef = useRef();

//   const handleDownload = () => {
//     const element = invoiceRef.current;
//     const opt = {
//       margin: 0.5,
//       filename: 'invoice.pdf',
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: { scale: 2 },
//       jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
//     };
//     html2pdf().set(opt).from(element).save();
//   };

//   const userEmail = order?.userEmail || "N/A";
//   const address = order?.address || {};
//   const orderDate = order?.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A";
//   const items = order?.items || [];
//   const total = order?.total || 0;

//   return (
//     <Modal show={show} onHide={handleClose} size="lg" centered>
//       <Modal.Body>
//         <div ref={invoiceRef} className="p-4 bg-white" style={{ fontFamily: "Arial, sans-serif", fontSize: "14px" }}>
//           {/* Header */}
//           <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
//             <img src={logo} alt="Brand Logo" style={{ height: 50 }} />
//             <h4 className="text-end" style={{ letterSpacing: "2px" }}>INVOICE</h4>
//           </div>

//           {/* Invoice Info */}
//           <div className="d-flex justify-content-between my-4">
//             <div>
//               <p className="mb-1"><strong>Invoice to:</strong> {userEmail}</p>
//               {address?.houseNo && <p className="mb-0">House No: {address.houseNo}</p>}
//               {address?.street && <p className="mb-0">{address.street}</p>}
//               {address?.barangay && <p className="mb-0">Brgy. {address.barangay}</p>}
//               {address?.city && <p className="mb-0">{address.city}</p>}
//               {address?.province && <p className="mb-0">{address.province}</p>}
//               {address?.zipCode && <p className="mb-0">{address.zipCode}</p>}
//             </div>
//             <div className="text-end">
//               <p><strong>Invoice#:</strong> {order?.id || "N/A"}</p>
//               <p><strong>Date:</strong> {orderDate}</p>
//             </div>
//           </div>

//           {/* Order Summary */}
//           <h6 className="mb-2">Order Summary</h6>
//           <table className="table table-bordered text-center">
//             <thead className="table-light">
//               <tr>
//                 <th>SL.</th>
//                 <th>Item Name</th>
//                 <th>Price</th>
//                 <th>Qty.</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((item, index) => (
//                 <tr key={item.id || index}>
//                   <td>{index + 1}</td>
//                   <td>{item.name}</td>
//                   <td>₱{parseFloat(item.price).toFixed(2)}</td>
//                   <td>{item.quantity}</td>
//                   <td>₱{(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Total */}
//           <div className="d-flex justify-content-end">
//             <table className="table w-auto">
//               <tbody>
//                 <tr>
//                   <td><strong>Sub Total:</strong></td>
//                   <td>₱{parseFloat(total).toFixed(2)}</td>
//                 </tr>
//                 <tr>
//                   <td><strong>Tax:</strong></td>
//                   <td>₱0.00</td>
//                 </tr>
//                 <tr className="table-light">
//                   <th>Total:</th>
//                   <th>₱{parseFloat(total).toFixed(2)}</th>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           {/* Payment Info */}
//           <div className="mt-4">
//             <h6>Payment Method:</h6>
//             <p>Cash on Delivery (COD)</p>
//           </div>

//           <div className="text-end mt-4">
//             <p className="border-top pt-2">Authorised Sign</p>
//           </div>

//           <div className="text-center mt-3 border-top pt-3">
//             <p className="text-muted mb-0">Thank you for your business</p>
//           </div>
//         </div>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={handleClose}>Close</Button>
//         <Button variant="primary" onClick={handleDownload}>Print</Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default InVoice;


import React, { useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import html2pdf from "html2pdf.js";
import logo from "../images/logo.png";

const InVoice = ({ show, handleClose, order }) => {
  const invoiceRef = useRef();

  const handleDownload = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 0.5,
      filename: "invoice.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const userEmail = order?.userEmail || "N/A";
  const address = order?.address || {};
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "N/A";
  const items = order?.items || [];
  const total = order?.total || 0;

  // Prefer human-readable orderId if present, else fallback to _id/id
  const displayOrderId = order?.orderId || order?._id || order?.id || "N/A";

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Body>
        <div
          ref={invoiceRef}
          className="p-4 bg-white"
          style={{ fontFamily: "Arial, sans-serif", fontSize: "14px" }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
            <img src={logo} alt="Brand Logo" style={{ height: 50 }} />
            <h4 className="text-end" style={{ letterSpacing: "2px" }}>
              INVOICE
            </h4>
          </div>

          {/* Invoice Info */}
          <div className="d-flex justify-content-between my-4">
            <div>
              <p className="mb-1">
                <strong>Invoice to:</strong> {userEmail}
              </p>
              {address?.houseNo && (
                <p className="mb-0">House No: {address.houseNo}</p>
              )}
              {address?.street && <p className="mb-0">{address.street}</p>}
              {address?.barangay && (
                <p className="mb-0">Brgy. {address.barangay}</p>
              )}
              {address?.city && <p className="mb-0">{address.city}</p>}
              {address?.province && <p className="mb-0">{address.province}</p>}
              {address?.zipCode && <p className="mb-0">{address.zipCode}</p>}
            </div>
            <div className="text-end">
              <p className="mb-1">
                <strong>Invoice#:</strong> {order?._id || order?.id || "N/A"}
              </p>
              {/* Order ID directly below Invoice# */}
              <p className="mb-1">
                <strong>Order ID:</strong> {displayOrderId}
              </p>
              <p className="mb-0">
                <strong>Date:</strong> {orderDate}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <h6 className="mb-2">Order Summary</h6>
          <table className="table table-bordered text-center">
            <thead className="table-light">
              <tr>
                <th>SL.</th>
                <th>Item Name</th>
                <th>Price</th>
                <th>Qty.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>₱{parseFloat(item.price).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>
                    ₱{(item.quantity * parseFloat(item.price)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="d-flex justify-content-end">
            <table className="table w-auto">
              <tbody>
                <tr>
                  <td>
                    <strong>Sub Total:</strong>
                  </td>
                  <td>₱{parseFloat(total).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tax:</strong>
                  </td>
                  <td>₱0.00</td>
                </tr>
                <tr className="table-light">
                  <th>Total:</th>
                  <th>₱{parseFloat(total).toFixed(2)}</th>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Removed Payment Method section as requested */}

          <div className="text-end mt-4">
            <p className="border-top pt-2">Authorised Sign</p>
          </div>

          <div className="text-center mt-3 border-top pt-3">
            <p className="text-muted mb-0">Thank you for your business</p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleDownload}>
          Print
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InVoice;
