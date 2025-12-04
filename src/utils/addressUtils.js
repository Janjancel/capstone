// addressUtils.js
// Robust extraction & formatting of an order's address
export function getAddress(order = {}) {
  // Candidate objects that may hold address fields
  const candidates = [
    order.address,
    order.shippingAddress,
    order.deliveryAddress,
    order.meta?.shipping,
    order.meta?.address,
    order.customerAddress,
    order.destination,
    order.location,
  ];

  // Normalize to plain object
  const obj = (candidates.find((c) => c && typeof c === 'object') || {});

  // Some backends use different keys: try a set of likely keys
  const pick = (keys) => {
    for (const k of keys) {
      const v = obj[k] ?? order[k] ?? (order.meta && order.meta[k]);
      if (v) return v;
    }
    return undefined;
  };

  const houseNo = pick(['houseNo', 'house_number', 'houseno', 'unit']) || obj.unit || obj.floor;
  const street =
    pick(['street', 'streetAddress', 'street_address', 'road', 'st']) || obj.addressLine1 || obj.line1;
  const barangay = pick(['barangay', 'brgy']) || obj.suburb || obj.neighborhood;
  const city =
    pick(['city', 'town', 'municipality']) || obj.locality || obj.cityName || order.city;
  const province =
    pick(['province', 'region', 'state']) || obj.state || order.province || order.region;
  const zipCode =
    pick(['zipCode', 'zipcode', 'postalCode', 'postal_code']) || obj.postalCode || order.zip;

  // If nothing meaningful found, fallback to email domain or 'Unknown'
  const fallback =
    (order.userEmail && order.userEmail.includes('@') && order.userEmail.split('@')[1]) || 'Unknown';

  // Build formatted 'full' address string (skip empties)
  const parts = [];
  if (houseNo) parts.push(String(houseNo).trim());
  if (street) parts.push(String(street).trim());
  if (barangay) parts.push(`Brgy. ${String(barangay).trim()}`);
  if (city) parts.push(String(city).trim());
  if (province) parts.push(String(province).trim());
  if (zipCode) parts.push(String(zipCode).trim());

  const full = parts.length ? parts.join(', ') : fallback;

  return {
    full,
    houseNo: houseNo || null,
    street: street || null,
    barangay: barangay || null,
    city: city || null,
    province: province || null,
    zipCode: zipCode || null,
    raw: obj,
  };
}