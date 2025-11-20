
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
//       filename: "invoice.pdf",
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2 },
//       jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
//     };
//     html2pdf().set(opt).from(element).save();
//   };

//   const userEmail = order?.userEmail || "N/A";
//   const address = order?.address || {};
//   const orderDate = order?.createdAt
//     ? new Date(order.createdAt).toLocaleString()
//     : "N/A";
//   const items = order?.items || [];
//   const total = Number(order?.total || 0);

//   // deliveryFee may be stored on the order; fallback to 0
//   const deliveryFee = Number(order?.deliveryFee ?? order?.meta?.computed?.deliveryFee ?? 0);

//   // Prefer human-readable orderId if present, else fallback to _id/id
//   const displayOrderId = order?.orderId || order?._id || order?.id || "N/A";

//   // Grand total: prefer stored grandTotal, otherwise compute as total + deliveryFee
//   const grandTotal =
//     Number(order?.grandTotal ?? order?.meta?.computed?.grandTotal ?? (total + deliveryFee));

//   const formatPHP = (n) =>
//     `₱${Number(n || 0).toLocaleString("en-PH", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })}`;

//   return (
//     <Modal show={show} onHide={handleClose} size="lg" centered>
//       <Modal.Body>
//         <div
//           ref={invoiceRef}
//           className="p-4 bg-white"
//           style={{ fontFamily: "Arial, sans-serif", fontSize: "14px" }}
//         >
//           {/* Header */}
//           <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
//             <img src={logo} alt="Brand Logo" style={{ height: 50 }} />
//             <h4 className="text-end" style={{ letterSpacing: "2px" }}>
//               INVOICE
//             </h4>
//           </div>

//           {/* Invoice Info */}
//           <div className="d-flex justify-content-between my-4">
//             <div>
//               <p className="mb-1">
//                 <strong>Invoice to:</strong> {userEmail}
//               </p>
//               {address?.houseNo && (
//                 <p className="mb-0">House No: {address.houseNo}</p>
//               )}
//               {address?.street && <p className="mb-0">{address.street}</p>}
//               {address?.barangay && (
//                 <p className="mb-0">Brgy. {address.barangay}</p>
//               )}
//               {address?.city && <p className="mb-0">{address.city}</p>}
//               {address?.province && <p className="mb-0">{address.province}</p>}
//               {address?.zipCode && <p className="mb-0">{address.zipCode}</p>}
//             </div>
//             <div className="text-end">
//               <p className="mb-1">
//                 <strong>Invoice#:</strong> {order?._id || order?.id || "N/A"}
//               </p>
//               {/* Order ID directly below Invoice# */}
//               <p className="mb-1">
//                 <strong>Order ID:</strong> {displayOrderId}
//               </p>
//               <p className="mb-0">
//                 <strong>Date:</strong> {orderDate}
//               </p>
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
//                   <td>{formatPHP(parseFloat(item.price || 0))}</td>
//                   <td>{item.quantity}</td>
//                   <td>
//                     {formatPHP(Number(item.quantity || 0) * Number(parseFloat(item.price || 0)))}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Total */}
//           <div className="d-flex justify-content-end">
//             <table className="table w-auto">
//               <tbody>
//                 <tr>
//                   <td>
//                     <strong>Sub Total:</strong>
//                   </td>
//                   <td>{formatPHP(total)}</td>
//                 </tr>

//                 {/* Replace tax row with delivery fee row */}
//                 <tr>
//                   <td>
//                     <strong>Delivery Fee:</strong>
//                   </td>
//                   <td>{formatPHP(deliveryFee)}</td>
//                 </tr>

//                 <tr className="table-light">
//                   <th>Total:</th>
//                   <th>{formatPHP(grandTotal)}</th>
//                 </tr>
//               </tbody>
//             </table>
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
//         <Button variant="secondary" onClick={handleClose}>
//           Close
//         </Button>
//         <Button variant="primary" onClick={handleDownload}>
//           Print
//         </Button>
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
  const total = Number(order?.total || 0);

  // deliveryFee may be stored on the order; fallback to 0
  const deliveryFee = Number(order?.deliveryFee ?? order?.meta?.computed?.deliveryFee ?? 0);

  // Discount: numeric amount (stored) and optional percent
  // Accept either order.discount (number|null) or meta.computed.discountAmount
  const discountAmount =
    order?.discount != null
      ? Number(order.discount)
      : Number(order?.meta?.computed?.discountAmount ?? 0) || 0;

  // If discountAmount is 0 treat as no discount (keep null for display)
  const discountValue = discountAmount > 0 ? discountAmount : null;

  const discountPercent =
    order?.meta?.computed?.discountPercent ??
    order?.discountPercent ??
    order?.meta?.computed?.percent ??
    null;

  // Prefer stored grandTotal, otherwise compute as total - discount + deliveryFee
  const grandTotal =
    Number(
      order?.grandTotal ??
        order?.meta?.computed?.grandTotal ??
        (total - (discountValue || 0) + deliveryFee)
    ) || 0;

  const formatPHP = (n) =>
    `₱${Number(n || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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
              {address?.houseNo && <p className="mb-0">House No: {address.houseNo}</p>}
              {address?.street && <p className="mb-0">{address.street}</p>}
              {address?.barangay && <p className="mb-0">Brgy. {address.barangay}</p>}
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
                <strong>Order ID:</strong> {order?.orderId || order?._id || order?.id || "N/A"}
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
                  <td>{formatPHP(parseFloat(item.price || 0))}</td>
                  <td>{item.quantity}</td>
                  <td>
                    {formatPHP(
                      Number(item.quantity || 0) * Number(parseFloat(item.price || 0))
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals (Sub Total, Discount, Delivery Fee, Grand Total) */}
          <div className="d-flex justify-content-end">
            <table className="table w-auto">
              <tbody>
                <tr>
                  <td>
                    <strong>Sub Total:</strong>
                  </td>
                  <td>{formatPHP(total)}</td>
                </tr>

                <tr>
                  <td>
                    <strong>Discount:</strong>
                  </td>
                  <td>
                    {discountValue == null ? (
                      <span>-</span>
                    ) : (
                      <span>
                        {discountPercent ? `${discountPercent}% ` : ""}
                        ({formatPHP(discountValue)})
                      </span>
                    )}
                  </td>
                </tr>

                {/* Replace tax row with delivery fee row */}
                <tr>
                  <td>
                    <strong>Delivery Fee:</strong>
                  </td>
                  <td>{formatPHP(deliveryFee)}</td>
                </tr>

                <tr className="table-light">
                  <th>Total:</th>
                  <th>{formatPHP(grandTotal)}</th>
                </tr>
              </tbody>
            </table>
          </div>

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
