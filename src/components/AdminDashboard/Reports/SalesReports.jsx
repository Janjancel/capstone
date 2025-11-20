// reports/SalesReports.jsx
import React from "react";
import { normalizeTimestamp } from "../../../utils/reportHelpers";

export const getSalesExportRows = (data = []) => {
  if (!Array.isArray(data)) return [];
  return data.map((s) => ({
    saleId: s._id || s.saleId || "",
    orderId: s.orderId || "—",
    userId: s.userId || "—",
    total: Number(s.total || 0),
    itemsCount: Array.isArray(s.items) ? s.items.reduce((a, it) => a + (Number(it.quantity) || 0), 0) : "—",
    deliveredAt: s.deliveredAt || s.createdAt || normalizeTimestamp(s).createdAt,
  }));
};

export const renderSalesTableHeader = () => (
  <>
    <th>Sale ID</th>
    <th>Order ID</th>
    <th>Total</th>
    <th>Delivered At</th>
  </>
);

export const renderSalesTableRow = (r, idx) => (
  <tr key={idx}>
    <td>{r.saleId}</td>
    <td>{r.orderId}</td>
    <td>{Number(r.total).toFixed(2)}</td>
    <td>{r.deliveredAt ? new Date(r.deliveredAt).toLocaleString() : "—"}</td>
  </tr>
);
