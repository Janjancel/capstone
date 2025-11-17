// utils/reverseGeocode.js
export const fmtKey = (lat, lng) => `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;

export const getCachedAddress = (key) => {
  try {
    const raw = localStorage.getItem("geo_address_cache");
    if (!raw) return null;
    const json = JSON.parse(raw);
    return json[key] || null;
  } catch {
    return null;
  }
};

export const setCachedAddress = (key, val) => {
  try {
    const raw = localStorage.getItem("geo_address_cache");
    const json = raw ? JSON.parse(raw) : {};
    json[key] = val;
    localStorage.setItem("geo_address_cache", JSON.stringify(json));
  } catch {}
};

// Main reverse geocode function
export const reverseGeocodeInline = async (lat, lng) => {
  const key = fmtKey(lat, lng);
  const cached = getCachedAddress(key);
  if (cached) return cached;

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fil,en`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("Reverse geocode failed");

    const data = await res.json();
    const a = data.address || {};
    const pretty =
      data.display_name ||
      [
        a.road,
        a.suburb || a.village || a.barangay,
        a.town || a.city || a.municipality,
        a.state,
        a.country,
      ]
        .filter(Boolean)
        .join(", ");

    const value = pretty || key;
    setCachedAddress(key, value);
    return value;
  } catch (e) {
    return key;
  }
};

// Bulk geocode helper
export const bulkReverseGeocode = async (coordsArray) => {
  const results = {};
  for (const k of coordsArray) {
    const [lat, lng] = k.split(",").map(Number);
    await new Promise((r) => setTimeout(r, 150));
    results[k] = await reverseGeocodeInline(lat, lng);
  }
  return results;
};
