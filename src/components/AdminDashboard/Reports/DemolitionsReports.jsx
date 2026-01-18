// reports/DemolitionsReports.jsx
import React from "react";
import { normalizeTimestamp, extractAddress } from "../../../utils/reportHelpers";

export const getDemolitionsExportRows = (data = [], addressMap = {}, fmtKey = () => "") => {
  if (!Array.isArray(data)) return [];
  return data.map((r) => {
    const createdAt = normalizeTimestamp(r).createdAt;
    const demolishId = r.demolishId || r._id || r.demolish_id || "";

    let locationPretty = "N/A";
    const locObj = r.location && typeof r.location === "object" ? r.location : null;
    if (locObj && locObj.lat && locObj.lng) {
      const key = fmtKey(locObj.lat, locObj.lng);
      locationPretty = addressMap[key] || `${locObj.lat}, ${locObj.lng}`;
    } else {
      const ex = extractAddress(r);
      locationPretty = ex && ex !== "—" ? ex : "N/A";
    }

    return {
      demolishId,
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

export const renderDemolitionsTableHeader = () => (
  <>
    <th>Demolish ID</th>
    <th>Name</th>
    <th>Contact</th>
    <th>Location</th>
    <th>Price</th>
    <th>Status</th>
  </>
);

export const renderDemolitionsTableRow = (r, idx) => (
  <tr key={idx}>
    <td>{r.demolishId}</td>
    <td>{r.name}</td>
    <td>{r.contact}</td>
    <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>{r.location || "N/A"}</td>
    <td>₱{Number(r.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    <td>{r.status}</td>
  </tr>
);
