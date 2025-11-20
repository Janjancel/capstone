// src/utils/reverseGeocode.js
// Plain utility functions — no React hooks here so they can be imported anywhere.

const fmtKey = (lat, lng) => `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;

const getCachedAddress = (key) => {
  try {
    const raw = localStorage.getItem("geo_address_cache");
    if (!raw) return null;
    const json = JSON.parse(raw);
    return json[key] || null;
  } catch {
    return null;
  }
};

const setCachedAddress = (key, val) => {
  try {
    const raw = localStorage.getItem("geo_address_cache");
    const json = raw ? JSON.parse(raw) : {};
    json[key] = val;
    localStorage.setItem("geo_address_cache", JSON.stringify(json));
  } catch {
    // swallow storage errors silently (same behavior as original)
  }
};

/**
 * Reverse geocode using Nominatim (OpenStreetMap).
 * - Returns a pretty address string (display_name or assembled address) or throws on network error.
 * - Saves successful lookups to localStorage via setCachedAddress.
 *
 * @param {number|string} lat
 * @param {number|string} lng
 * @param {object} [opts] optional settings
 * @param {string} [opts.acceptLanguage] language hint, default 'fil,en'
 * @returns {Promise<string>}
 */
const reverseGeocode = async (lat, lng, opts = {}) => {
  const key = fmtKey(lat, lng);
  const cached = getCachedAddress(key);
  if (cached) return cached;

  const acceptLanguage = opts.acceptLanguage || "fil,en";
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${acceptLanguage}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Reverse geocode failed (status ${res.status})`);
  }

  const data = await res.json();
  const a = data.address || {};
  const pretty =
    data.display_name ||
    [a.road, a.suburb || a.village || a.barangay, a.town || a.city || a.municipality, a.state, a.country]
      .filter(Boolean)
      .join(", ");
  const value = pretty || key;

  setCachedAddress(key, value);
  return value;
};

export { fmtKey, getCachedAddress, setCachedAddress, reverseGeocode };
export default reverseGeocode;
