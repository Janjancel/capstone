// reports/OrderReports.jsx
import React from "react";
import { normalizeTimestamp, extractAddress } from "../../../utils/reportHelpers";

/**
 * Do NOT use props in this module. Exported functions are called by ReportDashboard.
 */

export const getOrderExportRows = (data = []) => {
  if (!Array.isArray(data)) return [];
  return data.map((order) => {
    const totalItems =
      order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;
    const totalAmount =
      order.items?.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
        0
      ) || Number(order.total) || 0;

    return {
      orderId: order.orderId || order._id || "",
      email: order.userEmail || order.email || "—",
      status: order.status || "Pending",
      items: totalItems,
      amount: totalAmount,
      createdAt: order.createdAt || normalizeTimestamp(order).createdAt,
      address: order.address ?? extractAddress(order),
    };
  });
};

export const renderOrderTableHeader = () => (
  <>
    <th>Order ID</th>
    <th>Email</th>
    <th>Status</th>
    <th>Amount</th>
    <th>Address</th>
  </>
);

export const renderOrderTableRow = (r, idx) => (
  <tr key={idx}>
    <td>{r.orderId}</td>
    <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>{r.email}</td>
    <td>{r.status}</td>
    <td>₱{Number(r.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>{r.address || "—"}</td>
  </tr>
);
