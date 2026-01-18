// reports/SellRequestsReports.jsx
import React from "react";
import { normalizeTimestamp, extractAddress } from "../../../utils/reportHelpers";

export const getSellRequestsExportRows = (data = [], addressMap = {}, fmtKey = () => "") => {
  if (!Array.isArray(data)) return [];
  return data.map((r) => {
    const n = normalizeTimestamp(r);
    const createdAt = n.createdAt || (r.createdAt ? normalizeTimestamp({ createdAt: r.createdAt }).createdAt : null);
    const sellId = r.sellId || r.selId || r._id || r.sell_id || "";

    // determine pretty location:
    let locationPretty = "N/A";
    const locObj = r.location && typeof r.location === "object" ? r.location : null;
    if (locObj && locObj.lat && locObj.lng) {
      const key = fmtKey(locObj.lat, locObj.lng);
      locationPretty = addressMap[key] || `${locObj.lat}, ${locObj.lng}`;
    } else if (r.location && typeof r.location === "string" && r.location.trim() !== "") {
      locationPretty = r.location;
    } else {
      const ex = extractAddress(r);
      locationPretty = ex && ex !== "—" ? ex : "N/A";
    }

    return {
      sellId,
      userId: r.userId || "—",
      name: r.name || "—",
      contact: r.contact || "—",
      location: locationPretty,
      price: Number(r.price ?? 0),
      status: r.status || "pending",
      createdAt,
    };
  });
};

export const renderSellRequestsTableHeader = () => (
  <>
    <th>Sell ID</th>
    <th>Name</th>
    <th>Contact</th>
    <th>Location</th>
    <th>Price</th>
    <th>Status</th>
  </>
);

export const renderSellRequestsTableRow = (r, idx) => (
  <tr key={idx}>
    <td>{r.sellId}</td>
    <td>{r.name}</td>
    <td>{r.contact}</td>
    <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>{r.location || "N/A"}</td>
    <td>₱{Number(r.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    <td>{r.status}</td>
  </tr>
);
