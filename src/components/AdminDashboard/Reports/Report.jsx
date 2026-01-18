
// // Report.jsx
// import React, { useRef } from "react";
// import PropTypes from "prop-types";
// import { Modal, Button } from "react-bootstrap";
// import html2pdf from "html2pdf.js";
// import logo from "../../images/logo.png";

// /**
//  * Report modal (PDF export)
//  *
//  * Props:
//  * - show: boolean
//  * - handleClose: fn
//  * - reportType: "orders" | "sales" | "sellRequests" | "demolitions" (defaults to "orders")
//  * - rows: array of normalized rows (use exportRowsAll from ReportDashboard or similar)
//  * - reportTo: string (who the report is for) -- defaults to "—"
//  * - fromDate: "YYYY-MM-DD" (optional)
//  * - toDate: "YYYY-MM-DD" (optional)
//  * - title: optional title to show instead of "Report"
//  */
// const Report = ({
//   show,
//   handleClose,
//   reportType = "orders",
//   rows = [],
//   reportTo = "—",
//   fromDate,
//   toDate,
//   title = "Report",
// }) => {
//   const reportRef = useRef();

//   // Ensure file name safe characters
//   const sanitize = (s = "") => String(s).replace(/[^a-z0-9_\-\.]/gi, "_");

//   const handleDownload = () => {
//     const element = reportRef.current;
//     if (!element) return;

//     const safeFrom = fromDate || "start";
//     const safeTo = toDate || "end";
//     const fileName = `${sanitize(reportType)}_report_${sanitize(safeFrom)}_to_${sanitize(safeTo)}.pdf`;

//     const opt = {
//       margin: 12 / 72, // 12pt ~ 0.1667in but html2pdf expects inches in jsPDF. Using 12/72 gives ~0.1667in (small margin)
//       filename: fileName,
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true },
//       jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
//     };

//     // Trigger download
//     html2pdf().set(opt).from(element).save();
//   };

//   const fmtDate = (isoOrYmd) => {
//     if (!isoOrYmd) return "N/A";
//     try {
//       // Accept YYYY-MM-DD or full ISO
//       const d = new Date(isoOrYmd.length === 10 ? `${isoOrYmd}T00:00:00` : isoOrYmd);
//       if (Number.isNaN(d.getTime())) return isoOrYmd;
//       return d.toLocaleDateString();
//     } catch {
//       return isoOrYmd;
//     }
//   };

//   const formatPHP = (n) =>
//     `₱${Number(n || 0).toLocaleString("en-PH", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })}`;

//   // Head renderer (keeps parity with ReportDashboard columns)
//   const renderTableHead = () => {
//     if (reportType === "orders") {
//       return (
//         <tr>
//           <th>Order ID</th>
//           <th>User Email</th>
//           <th>Status</th>
//           <th>Total Items</th>
//           <th>Total Amount</th>
//           <th>Address</th>
//         </tr>
//       );
//     }
//     if (reportType === "sales") {
//       return (
//         <tr>
//           <th>Sale ID</th>
//           <th>Order ID</th>
//           <th>User ID</th>
//           <th>Total</th>
//           <th>Items Count</th>
//           <th>Delivered At</th>
//         </tr>
//       );
//     }
//     if (reportType === "sellRequests") {
//       return (
//         <tr>
//           <th>Sell ID</th>
//           <th>User ID</th>
//           <th>Name</th>
//           <th>Contact</th>
//           <th>Price</th>
//           <th>Status</th>
//           <th>Created At</th>
//         </tr>
//       );
//     }
//     // demolitions
//     return (
//       <tr>
//         <th>Demolish ID</th>
//         <th>User ID</th>
//         <th>Name</th>
//         <th>Contact</th>
//         <th>Price</th>
//         <th>Status</th>
//         <th>Created At</th>
//       </tr>
//     );
//   };

//   const renderTableRows = () =>
//     (rows || []).map((r, idx) => {
//       if (reportType === "orders") {
//         return (
//           <tr key={idx}>
//             <td>{r.orderId}</td>
//             <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>{r.email}</td>
//             <td>{r.status}</td>
//             <td>{r.items}</td>
//             <td>{Number(r.amount ?? 0).toFixed(2)}</td>
//             <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
//               {r.address || "—"}
//             </td>
//           </tr>
//         );
//       }
//       if (reportType === "sales") {
//         return (
//           <tr key={idx}>
//             <td>{r.saleId}</td>
//             <td>{r.orderId}</td>
//             <td>{r.userId}</td>
//             <td>{Number(r.total ?? 0).toFixed(2)}</td>
//             <td>{r.itemsCount}</td>
//             <td>
//               {r.deliveredAt
//                 ? new Date(r.deliveredAt).toLocaleString()
//                 : r.createdAt
//                 ? new Date(r.createdAt).toLocaleString()
//                 : "—"}
//             </td>
//           </tr>
//         );
//       }
//       if (reportType === "sellRequests") {
//         return (
//           <tr key={idx}>
//             <td>{r.sellId}</td>
//             <td>{r.userId}</td>
//             <td>{r.name}</td>
//             <td>{r.contact}</td>
//             <td>{Number(r.price ?? 0).toFixed(2)}</td>
//             <td>{r.status}</td>
//             <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
//           </tr>
//         );
//       }
//       // demolitions
//       return (
//         <tr key={idx}>
//           <td>{r.demolishId}</td>
//           <td>{r.userId}</td>
//           <td>{r.name}</td>
//           <td>{r.contact}</td>
//           <td>{Number(r.price ?? 0).toFixed(2)}</td>
//           <td>{r.status}</td>
//           <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
//         </tr>
//       );
//     });

//   // compute colspan dynamically (orders -> 6, sales -> 6, others -> 7)
//   const getColSpan = () => {
//     if (reportType === "orders") return 6;
//     if (reportType === "sales") return 6;
//     return 7;
//   };

//   return (
//     <Modal show={show} onHide={handleClose} size="lg" centered>
//       <Modal.Body>
//         <div
//           ref={reportRef}
//           className="p-4 bg-white"
//           style={{ fontFamily: "Arial, sans-serif", fontSize: "13px", color: "#111" }}
//         >
//           {/* Header */}
//           <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
//             <img src={logo} alt="Brand Logo" style={{ height: 50 }} />
//             <h4 className="text-end" style={{ letterSpacing: "2px", margin: 0 }}>
//               {String(title).toUpperCase()}
//             </h4>
//           </div>

//           {/* Report Info */}
//           <div className="d-flex justify-content-between my-4">
//             <div>
//               <p className="mb-1">
//                 <strong>Report to:</strong> {reportTo || "—"}
//               </p>
//             </div>

//             <div className="text-end">
//               <p className="mb-1">
//                 <strong>Report Type:</strong> {reportType}
//               </p>
//               <p className="mb-1">
//                 <strong>Date:</strong>{" "}
//                 {fromDate || toDate ? `${fmtDate(fromDate)} — ${fmtDate(toDate)}` : "N/A"}
//               </p>
//               <p className="mb-0">
//                 <strong>Generated:</strong> {new Date().toLocaleString()}
//               </p>
//             </div>
//           </div>

//           {/* Table */}
//           <h6 className="mb-2">Report Summary</h6>
//           <div style={{ overflowX: "auto" }}>
//             <table className="table table-bordered text-center" role="table" aria-label="Report table">
//               <thead className="table-light">{renderTableHead()}</thead>
//               <tbody>
//                 {rows && rows.length > 0 ? (
//                   renderTableRows()
//                 ) : (
//                   <tr>
//                     <td colSpan={getColSpan()} style={{ color: "#666" }}>
//                       No rows for this range.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Small totals area for certain reports (optional) */}
//           {reportType === "sales" && (
//             <div className="d-flex justify-content-end" style={{ marginTop: 8 }}>
//               <table className="table w-auto">
//                 <tbody>
//                   <tr>
//                     <td>
//                       <strong>Rows:</strong>
//                     </td>
//                     <td>{rows.length}</td>
//                   </tr>
//                   <tr className="table-light">
//                     <th>Total Amount:</th>
//                     <th>{formatPHP(rows.reduce((s, r) => s + Number(r.total || 0), 0))}</th>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {reportType === "orders" && (
//             <div className="d-flex justify-content-end" style={{ marginTop: 8 }}>
//               <table className="table w-auto">
//                 <tbody>
//                   <tr>
//                     <td>
//                       <strong>Rows:</strong>
//                     </td>
//                     <td>{rows.length}</td>
//                   </tr>
//                   <tr className="table-light">
//                     <th>Total Amount:</th>
//                     <th>{formatPHP(rows.reduce((s, r) => s + Number(r.amount || 0), 0))}</th>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           )}

//           <div className="text-end mt-4">
//             <p className="border-top pt-2" style={{ marginBottom: 0 }}>
//               Authorised Sign
//             </p>
//           </div>

//           <div className="text-center mt-3 border-top pt-3">
//             <p className="text-muted mb-0">Generated by your system</p>
//           </div>
//         </div>
//       </Modal.Body>

//       <Modal.Footer>
//         <Button variant="secondary" onClick={handleClose}>
//           Close
//         </Button>
//         <Button variant="primary" onClick={handleDownload} aria-label="Download report as PDF">
//           Download PDF
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// Report.propTypes = {
//   show: PropTypes.bool,
//   handleClose: PropTypes.func,
//   reportType: PropTypes.oneOf(["orders", "sales", "sellRequests", "demolitions"]),
//   rows: PropTypes.array,
//   reportTo: PropTypes.string,
//   fromDate: PropTypes.string,
//   toDate: PropTypes.string,
//   title: PropTypes.string,
// };

// export default Report;


// Report.jsx
import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import html2pdf from "html2pdf.js";
import logo from "../../images/logo.png";

/**
 * Report modal (PDF export)
 *
 * Props:
 * - show: boolean
 * - handleClose: fn
 * - reportType: "orders" | "sales" | "sellRequests" | "demolitions" (defaults to "orders")
 * - rows: array of normalized rows (use exportRowsAll from ReportDashboard or similar)
 * - reportTo: string (who the report is for) -- defaults to "—"
 * - fromDate: "YYYY-MM-DD" (optional)
 * - toDate: "YYYY-MM-DD" (optional)
 * - title: optional title to show instead of "Report"
 * - tableHtml: optional raw HTML (string) captured from the dashboard preview
 * - summaryStats: optional stats object with totalCount, totalAmount, avgAmount, statusBreakdown, locationFrequency
 */
const Report = ({
  show,
  handleClose,
  reportType = "orders",
  rows = [],
  reportTo = "—",
  fromDate,
  toDate,
  title = "Report",
  tableHtml = "",
  summaryStats = {},
}) => {
  const reportRef = useRef();

  // Ensure file name safe characters
  const sanitize = (s = "") => String(s).replace(/[^a-z0-9_\-.]/gi, "_");

  const handleDownload = () => {
    const element = reportRef.current;
    if (!element) return;

    const safeFrom = fromDate || "start";
    const safeTo = toDate || "end";
    const fileName = `${sanitize(reportType)}_report_${sanitize(safeFrom)}_to_${sanitize(safeTo)}.pdf`;

    const opt = {
      margin: 12 / 72,
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const fmtDate = (isoOrYmd) => {
    if (!isoOrYmd) return "N/A";
    try {
      const d = new Date(isoOrYmd.length === 10 ? `${isoOrYmd}T00:00:00` : isoOrYmd);
      if (Number.isNaN(d.getTime())) return isoOrYmd;
      return d.toLocaleDateString();
    } catch {
      return isoOrYmd;
    }
  };

  const formatPHP = (n) =>
    `₱${Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Head renderer (keeps parity with ReportDashboard columns)
  const renderTableHead = () => {
    if (reportType === "orders") {
      return (
        <tr>
          <th>Order ID</th>
          <th>User Email</th>
          <th>Status</th>
          <th>Total Items</th>
          <th>Total Amount</th>
          <th>Address</th>
        </tr>
      );
    }
    if (reportType === "sales") {
      return (
        <tr>
          <th>Sale ID</th>
          <th>Order ID</th>
          <th>User ID</th>
          <th>Total</th>
          <th>Items Count</th>
          <th>Delivered At</th>
        </tr>
      );
    }
    if (reportType === "sellRequests") {
      return (
        <tr>
          <th>Sell ID</th>
          <th>User ID</th>
          <th>Name</th>
          <th>Contact</th>
          <th>Price</th>
          <th>Status</th>
          <th>Created At</th>
        </tr>
      );
    }
    // demolitions
    return (
      <tr>
        <th>Demolish ID</th>
        <th>User ID</th>
        <th>Name</th>
        <th>Contact</th>
        <th>Price</th>
        <th>Status</th>
        <th>Created At</th>
      </tr>
    );
  };

  const renderTableRowsFromRowsProp = () =>
    (rows || []).map((r, idx) => {
      if (reportType === "orders") {
        return (
          <tr key={idx}>
            <td>{r.orderId}</td>
            <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>{r.email}</td>
            <td>{r.status}</td>
            <td>{r.items}</td>
            <td>{Number(r.amount ?? 0).toFixed(2)}</td>
            <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>{r.address || "—"}</td>
          </tr>
        );
      }
      if (reportType === "sales") {
        return (
          <tr key={idx}>
            <td>{r.saleId}</td>
            <td>{r.orderId}</td>
            <td>{r.userId}</td>
            <td>{Number(r.total ?? 0).toFixed(2)}</td>
            <td>{r.itemsCount}</td>
            <td>
              {r.deliveredAt ? new Date(r.deliveredAt).toLocaleString() : r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
            </td>
          </tr>
        );
      }
      if (reportType === "sellRequests") {
        return (
          <tr key={idx}>
            <td>{r.sellId}</td>
            <td>{r.userId}</td>
            <td>{r.name}</td>
            <td>{r.contact}</td>
            <td>{Number(r.price ?? 0).toFixed(2)}</td>
            <td>{r.status}</td>
            <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
          </tr>
        );
      }
      // demolitions
      return (
        <tr key={idx}>
          <td>{r.demolishId}</td>
          <td>{r.userId}</td>
          <td>{r.name}</td>
          <td>{r.contact}</td>
          <td>{Number(r.price ?? 0).toFixed(2)}</td>
          <td>{r.status}</td>
          <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
        </tr>
      );
    });

  // compute colspan dynamically (orders -> 6, sales -> 6, others -> 7)
  const getColSpan = () => {
    if (reportType === "orders") return 6;
    if (reportType === "sales") return 6;
    return 7;
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Body>
        <div
          ref={reportRef}
          className="p-4 bg-white"
          style={{ fontFamily: "Arial, sans-serif", fontSize: "13px", color: "#111" }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
            <img src={logo} alt="Brand Logo" style={{ height: 50 }} />
            <h4 className="text-end" style={{ letterSpacing: "2px", margin: 0 }}>
              {String(title).toUpperCase()}
            </h4>
          </div>

          {/* Report Info */}
          <div className="d-flex justify-content-between my-4">
            <div>
              <p className="mb-1">
                <strong>Report to:</strong> {reportTo || "—"}
              </p>
            </div>

            <div className="text-end">
              <p className="mb-1">
                <strong>Report Type:</strong> {reportType}
              </p>
              <p className="mb-1">
                <strong>Date:</strong> {fromDate || toDate ? `${fmtDate(fromDate)} — ${fmtDate(toDate)}` : "N/A"}
              </p>
              <p className="mb-0">
                <strong>Generated:</strong> {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Summary Statistics Cards */}
          {summaryStats?.totalCount > 0 && (
            <>
              <h6 className="mb-3">Summary Statistics</h6>
              <table style={{ width: "100%", marginBottom: 20, borderCollapse: "collapse" }}>
                <tbody>
                  <tr style={{ display: "flex", gap: 10 }}>
                    <td
                      style={{
                        flex: 1,
                        border: "1px solid #ddd",
                        padding: 12,
                        borderLeft: "4px solid #0066cc",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Total Records</div>
                      <div style={{ fontSize: 18, fontWeight: "bold", color: "#0066cc" }}>
                        {summaryStats.totalCount}
                      </div>
                    </td>
                    <td
                      style={{
                        flex: 1,
                        border: "1px solid #ddd",
                        padding: 12,
                        borderLeft: "4px solid #28a745",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Total Amount</div>
                      <div style={{ fontSize: 18, fontWeight: "bold", color: "#28a745" }}>
                        ₱{Number(summaryStats.totalAmount || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </td>
                    <td
                      style={{
                        flex: 1,
                        border: "1px solid #ddd",
                        padding: 12,
                        borderLeft: "4px solid #ff9800",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Average Value</div>
                      <div style={{ fontSize: 18, fontWeight: "bold", color: "#ff9800" }}>
                        ₱{Number(summaryStats.avgAmount || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* Status Distribution */}
          {summaryStats?.statusBreakdown && Object.keys(summaryStats.statusBreakdown).length > 0 && (
            <>
              <h6 className="mb-3">Status Distribution</h6>
              <table style={{ width: "100%", marginBottom: 20, borderCollapse: "collapse" }}>
                <tbody>
                  {Object.entries(summaryStats.statusBreakdown).map(([status, count]) => {
                    const total = summaryStats.totalCount;
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    const colors = {
                      pending: "#ffc107",
                      accepted: "#28a745",
                      declined: "#dc3545",
                      ocular_scheduled: "#17a2b8",
                      scheduled: "#17a2b8",
                    };
                    const barColor = colors[status] || "#6c757d";

                    return (
                      <tr key={status} style={{ marginBottom: 10, display: "flex", gap: 10 }}>
                        <td
                          style={{
                            flex: 1,
                            paddingBottom: 10,
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 4,
                              fontSize: 12,
                            }}
                          >
                            <strong style={{ textTransform: "capitalize" }}>{status}</strong>
                            <span>
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: 12,
                              backgroundColor: "#e9ecef",
                              borderRadius: 2,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${percentage}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}

          {/* Location Frequency */}
          {summaryStats?.locationFrequency &&
            Object.keys(summaryStats.locationFrequency).length > 0 && (
              <>
                <h6 className="mb-3">Location Frequency (Top 8)</h6>
                <table style={{ width: "100%", marginBottom: 20, borderCollapse: "collapse" }}>
                  <tbody>
                    {Object.entries(summaryStats.locationFrequency)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 8)
                      .map(([location, count]) => {
                        const total = summaryStats.totalCount;
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                        const colors = [
                          "#0066cc",
                          "#0052a3",
                          "#003d7a",
                          "#002951",
                          "#004080",
                          "#0059b3",
                          "#0073e6",
                          "#3385ff",
                        ];
                        const barColor = colors[Object.keys(summaryStats.locationFrequency).indexOf(location)] ||
                          "#6c757d";

                        return (
                          <tr key={location} style={{ marginBottom: 10 }}>
                            <td
                              style={{
                                flex: 1,
                                paddingBottom: 10,
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom: 4,
                                  fontSize: 12,
                                }}
                              >
                                <strong
                                  style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    flex: 1,
                                    marginRight: 8,
                                  }}
                                  title={location}
                                >
                                  {location}
                                </strong>
                                <span style={{ minWidth: 50, textAlign: "right" }}>
                                  {count} ({percentage}%)
                                </span>
                              </div>
                              <div
                                style={{
                                  width: "100%",
                                  height: 12,
                                  backgroundColor: "#e9ecef",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${percentage}%`,
                                    backgroundColor: barColor,
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </>
            )}

          {/* Table */}
          <h6 className="mb-2">Report Details</h6>

          <div style={{ overflowX: "auto" }}>
            {/* If dashboard passed raw HTML, use it to mimic the preview exactly.
                Otherwise fall back to rendering from rows prop (original behavior). */}
            {tableHtml ? (
              // WARNING: we're intentionally rendering captured HTML from same-origin preview.
              // This preserves visual parity between preview and PDF.
              <div
                dangerouslySetInnerHTML={{ __html: tableHtml }}
                style={{ width: "100%" }}
              />
            ) : (
              <table className="table table-bordered text-center" role="table" aria-label="Report table">
                <thead className="table-light">{renderTableHead()}</thead>
                <tbody>
                  {rows && rows.length > 0 ? (
                    renderTableRowsFromRowsProp()
                  ) : (
                    <tr>
                      <td colSpan={getColSpan()} style={{ color: "#666" }}>
                        No rows for this range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Small totals area for certain reports (optional) */}
          {!tableHtml && reportType === "sales" && (
            <div className="d-flex justify-content-end" style={{ marginTop: 8 }}>
              <table className="table w-auto">
                <tbody>
                  <tr>
                    <td>
                      <strong>Rows:</strong>
                    </td>
                    <td>{rows.length}</td>
                  </tr>
                  <tr className="table-light">
                    <th>Total Amount:</th>
                    <th>{formatPHP(rows.reduce((s, r) => s + Number(r.total || 0), 0))}</th>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {!tableHtml && reportType === "orders" && (
            <div className="d-flex justify-content-end" style={{ marginTop: 8 }}>
              <table className="table w-auto">
                <tbody>
                  <tr>
                    <td>
                      <strong>Rows:</strong>
                    </td>
                    <td>{rows.length}</td>
                  </tr>
                  <tr className="table-light">
                    <th>Total Amount:</th>
                    <th>{formatPHP(rows.reduce((s, r) => s + Number(r.amount || 0), 0))}</th>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="text-end mt-4">
            <p className="border-top pt-2" style={{ marginBottom: 0 }}>
              Authorised Sign
            </p>
          </div>

          <div className="text-center mt-3 border-top pt-3">
            <p className="text-muted mb-0">Generated by your system</p>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleDownload} aria-label="Download report as PDF">
          Download PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

Report.propTypes = {
  show: PropTypes.bool,
  handleClose: PropTypes.func,
  reportType: PropTypes.oneOf(["orders", "sales", "sellRequests", "demolitions"]),
  rows: PropTypes.array,
  reportTo: PropTypes.string,
  fromDate: PropTypes.string,
  toDate: PropTypes.string,
  title: PropTypes.string,
  tableHtml: PropTypes.string, // optional raw HTML captured from dashboard preview
  summaryStats: PropTypes.object, // optional stats object with totalCount, totalAmount, avgAmount, statusBreakdown, locationFrequency
};

export default Report;
