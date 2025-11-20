// utils/reportHelpers.js
import axios from "axios";

export const API_URL = process.env.REACT_APP_API_URL || "";

export const REPORT_TYPES = [
  { value: "orders", label: "Orders" },
  { value: "sales", label: "Sales" },
  { value: "sellRequests", label: "Sell Requests" },
  { value: "demolitions", label: "Demolitions" },
];

// Helper: try multiple endpoints for sell requests (some projects mount routers under different paths)
export const probeSellRequestEndpoints = async (candidates) => {
  for (const ep of candidates) {
    try {
      const res = await axios.get(`${API_URL}${ep}`);
      // success: return response object and the endpoint used
      return { res, endpoint: ep };
    } catch (err) {
      // continue trying other endpoints on error
    }
  }
  throw new Error("All sell request endpoints failed");
};

// Normalize timestamp field names into a canonical createdAt (ISO string or null)
export const normalizeTimestamp = (obj) => {
  if (!obj || typeof obj !== "object") return { ...obj, createdAt: null };

  const possible = [
    "createdAt",
    "created_at",
    "created",
    "createdOn",
    "created_on",
    "deliveredAt",
    "delivered_at",
    "delivered",
    "timestamp",
    "time",
  ];

  for (const key of possible) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      try {
        const d = new Date(obj[key]);
        if (!Number.isNaN(d.getTime())) return { ...obj, createdAt: d.toISOString() };
      } catch {
        return { ...obj, createdAt: String(obj[key]) };
      }
    }
  }
  return { ...obj, createdAt: null };
};

// Try to extract a human-friendly address from an order object or location object
export const extractAddress = (orderOrLocation) => {
  if (!orderOrLocation || typeof orderOrLocation !== "object") return "—";

  const maybe =
    orderOrLocation.address ||
    orderOrLocation.shippingAddress ||
    orderOrLocation.addressLine ||
    orderOrLocation.location ||
    orderOrLocation.deliveryAddress ||
    orderOrLocation.address_info ||
    orderOrLocation.shipTo;

  if (typeof maybe === "string" && maybe.trim() !== "") return maybe;

  const src = typeof maybe === "object" && maybe ? maybe : orderOrLocation;

  if (src && typeof src === "object") {
    const parts = [];
    if (src.fullAddress) parts.push(src.fullAddress);
    if (src.address) parts.push(src.address);
    if (src.address1) parts.push(src.address1);
    if (src.line1) parts.push(src.line1);
    if (src.city) parts.push(src.city);
    if (src.province) parts.push(src.province);
    if (src.state) parts.push(src.state);
    if (src.zip || src.postalCode) parts.push(src.zip || src.postalCode);
    if (src.country) parts.push(src.country);
    if (src.barangay) parts.push(src.barangay);
    if (src.town) parts.push(src.town);
    if (src.municipality) parts.push(src.municipality);

    const joined = parts.filter(Boolean).join(", ");
    if (joined) return joined;
  }

  if (orderOrLocation.lat && orderOrLocation.lng) {
    return `${orderOrLocation.lat}, ${orderOrLocation.lng}`;
  }

  return "—";
};
