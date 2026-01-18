// ReportDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import Report from "./Report"; // original Report.jsx (unchanged)
import {
  API_URL,
  REPORT_TYPES,
  normalizeTimestamp,
  extractAddress,
  probeSellRequestEndpoints,
} from "../../../utils/reportHelpers";

// per-report modules (do NOT use props — they export functions)
import {
  getOrderExportRows,
  renderOrderTableHeader,
  renderOrderTableRow,
} from "./OrderReports";
import {
  getSalesExportRows,
  renderSalesTableHeader,
  renderSalesTableRow,
} from "./SalesReports";
import {
  getSellRequestsExportRows,
  renderSellRequestsTableHeader,
  renderSellRequestsTableRow,
} from "./SellRequestsReports";
import {
  getDemolitionsExportRows,
  renderDemolitionsTableHeader,
  renderDemolitionsTableRow,
} from "./DemolitionsReports";

// reverse geocode helpers (moved to separate file)
import {
  fmtKey,
  getCachedAddress,
  setCachedAddress,
  reverseGeocode,
} from "../../../utils/reverseGeocode";

const ReportDashboard = () => {
  // User info
  const [currentUser, setCurrentUser] = useState({ username: "", email: "" });
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Report state
  const [reportType, setReportType] = useState("orders");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // raw, normalized items for the selected report
  const [salesTotal, setSalesTotal] = useState(null); // used when reportType === 'sales'
  const [lastUsedSellEndpoint, setLastUsedSellEndpoint] = useState(null); // debug aid

  // Show/Hide Report modal
  const [showReportModal, setShowReportModal] = useState(false);

  // Table preview ref & raw HTML to pass into Report so PDF is identical to preview
  const tablePreviewRef = useRef(null);
  const [tableHtmlForPdf, setTableHtmlForPdf] = useState("");

  // Reverse geocode cache / map (key -> pretty address)
  const [addressMap, setAddressMap] = useState({});

  // Date range (default: first of month -> today)
  const todayISO = new Date().toISOString().split("T")[0];
  const firstOfMonthISO = (() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  })();
  const [fromDate, setFromDate] = useState(firstOfMonthISO);
  const [toDate, setToDate] = useState(todayISO);

  // Fetch current user email
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const d = res.data || {};
        setCurrentUser({ username: d.username || "N/A", email: d.email || "N/A" });
      } catch (err) {
        console.error("Error fetching current user:", err);
        setCurrentUser((u) => ({ ...u, email: "N/A" }));
      }
    })();
  }, [userId]);

  // Helper: inclusive toDate conversion
  const parseRange = (fromISO, toISO) => {
    const from = fromISO ? new Date(`${fromISO}T00:00:00`) : null;
    const to = toISO ? new Date(`${toISO}T23:59:59.999`) : null;
    return { from, to };
  };

  // Fetching logic per report type (unchanged logic, uses imported helpers)
  useEffect(() => {
    let mounted = true;
    const { from, to } = parseRange(fromDate, toDate);

    const fetchData = async () => {
      setLoading(true);
      setData([]);
      setSalesTotal(null);
      setLastUsedSellEndpoint(null);

      try {
        if (reportType === "orders") {
          const res = await axios.get(`${API_URL}/api/orders`);
          if (!mounted) return;

          const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
          const hydrated = arr.map((o) => ({
            ...o,
            userEmail: o.userEmail || o.email || "—",
            createdAt: normalizeTimestamp(o).createdAt,
            address: extractAddress(o),
          }));

          const filtered = hydrated.filter((o) => {
            if (!o.createdAt) return false;
            const c = new Date(o.createdAt);
            if (from && c < from) return false;
            if (to && c > to) return false;
            return true;
          });
          if (mounted) setData(filtered);
        } else if (reportType === "sales") {
          if (from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
            try {
              const startISO = from.toISOString();
              const endISO = to.toISOString();
              const res = await axios.get(
                `${API_URL}/api/sales/range?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`
              );
              if (!mounted) return;
              const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
              const normalized = arr.map((s) => ({
                ...s,
                createdAt:
                  normalizeTimestamp(s).createdAt ||
                  normalizeTimestamp({ deliveredAt: s.deliveredAt }).createdAt,
              }));
              if (mounted) setData(normalized);
            } catch (err) {
              console.warn("Sales range fetch failed, falling back to all sales filter:", err);
              const resAll = await axios.get(`${API_URL}/api/sales`);
              if (!mounted) return;
              const arrAll = Array.isArray(resAll.data) ? resAll.data : resAll.data?.data || [];
              const normalized = arrAll.map((s) => ({
                ...s,
                createdAt:
                  normalizeTimestamp(s).createdAt ||
                  normalizeTimestamp({ deliveredAt: s.deliveredAt }).createdAt,
              }));
              const filtered = normalized.filter((s) => {
                if (!s.createdAt) return false;
                const c = new Date(s.createdAt);
                if (from && c < from) return false;
                if (to && c > to) return false;
                return true;
              });
              if (mounted) setData(filtered);
            }
          } else {
            const resAll = await axios.get(`${API_URL}/api/sales`);
            if (!mounted) return;
            const arrAll = Array.isArray(resAll.data) ? resAll.data : resAll.data?.data || [];
            const normalized = arrAll.map((s) => ({
              ...s,
              createdAt:
                normalizeTimestamp(s).createdAt ||
                normalizeTimestamp({ deliveredAt: s.deliveredAt }).createdAt,
            }));
            if (mounted) setData(normalized);
          }

          try {
            const tRes = await axios.get(`${API_URL}/api/sales/total`);
            if (mounted) setSalesTotal(tRes.data?.totalIncome ?? 0);
          } catch (err) {
            console.warn("Failed to fetch sales total:", err);
          }
        } else if (reportType === "sellRequests") {
          const candidates = ["/api/sellrequests", "/api/sell-requests", "/api/sellRequests", "/api/sell"];
          try {
            const { res, endpoint } = await probeSellRequestEndpoints(candidates);
            setLastUsedSellEndpoint(endpoint);

            let arr = [];
            if (Array.isArray(res.data)) arr = res.data;
            else if (Array.isArray(res.data.requests)) arr = res.data.requests;
            else if (Array.isArray(res.data.sellRequests)) arr = res.data.sellRequests;
            else if (Array.isArray(res.data.sellRequest)) arr = res.data.sellRequest;
            else if (Array.isArray(res.data.data)) arr = res.data.data;
            else {
              const maybe = Object.values(res.data || {}).find((v) => Array.isArray(v));
              arr = Array.isArray(maybe) ? maybe : [];
            }

            const normalized = arr.map((r) => {
              const n = normalizeTimestamp(r);
              const createdAt =
                n.createdAt || (r.createdAt ? normalizeTimestamp({ createdAt: r.createdAt }).createdAt : null);
              const sellId = r.sellId || r.selId || r._id || r.sell_id || "";

              let locationDisplay = "N/A";
              if (typeof r.location === "string" && r.location.trim() !== "") {
                locationDisplay = r.location;
              } else if (r.location && typeof r.location === "object") {
                locationDisplay = extractAddress(r.location);
                if ((locationDisplay === "—" || !locationDisplay) && r.location.lat && r.location.lng) {
                  locationDisplay = `${r.location.lat}, ${r.location.lng}`;
                }
              } else {
                const extracted = extractAddress(r);
                if (extracted && extracted !== "—") locationDisplay = extracted;
              }

              return { ...r, createdAt, sellId, locationDisplay };
            });

            const filtered = normalized.filter((r) => {
              if (!r.createdAt) return true;
              const c = new Date(r.createdAt);
              if (from && c < from) return false;
              if (to && c > to) return false;
              return true;
            });

            if (mounted) setData(filtered);
          } catch (err) {
            console.error("All sell request endpoints failed:", err);
            if (mounted) setData([]);
          }
        } else if (reportType === "demolitions") {
          try {
            const res = await axios.get(`${API_URL}/api/demolish`);
            if (!mounted) return;
            const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
            const normalized = arr.map((r) => {
              const createdAt = normalizeTimestamp(r).createdAt;
              const demolishId = r.demolishId || r._id || r.demolish_id || "";
              return { ...r, createdAt, demolishId };
            });

            const filtered = normalized.filter((r) => {
              if (!r.createdAt) return false;
              const c = new Date(r.createdAt);
              if (from && c < from) return false;
              if (to && c > to) return false;
              return true;
            });
            if (mounted) setData(filtered);
          } catch (err) {
            console.error("Failed to fetch demolitions:", err);
            if (mounted) setData([]);
          }
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
        if (mounted) setData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [reportType, fromDate, toDate]); // reverseGeocode and fmtKey are imported utilities (stable) so omitted for clarity

  // Kick off reverse geocoding for items that have lat/lng and no cached address.
  useEffect(() => {
    const run = async () => {
      if (!Array.isArray(data) || data.length === 0) return;

      // collect coords from items
      const coords = [];
      data.forEach((item) => {
        const loc = item.location || item.locationDisplay || item.locationData || null;
        if (loc && typeof loc === "object" && loc.lat && loc.lng) {
          coords.push(fmtKey(loc.lat, loc.lng));
        } else if (item.location && item.location.lat && item.location.lng) {
          coords.push(fmtKey(item.location.lat, item.location.lng));
        } else if (item.locationDisplay && typeof item.locationDisplay === "string" && item.locationDisplay.includes(",")) {
          // skip — it's a string fallback
        }
      });

      const unique = Array.from(new Set(coords));
      if (!unique.length) return;

      // seed from localStorage
      const seed = {};
      unique.forEach((k) => {
        const c = getCachedAddress(k);
        if (c) seed[k] = c;
      });

      if (Object.keys(seed).length) {
        setAddressMap((prev) => ({ ...seed, ...prev }));
      }

      const missing = unique.filter((k) => !seed[k]);
      if (!missing.length) return;

      const results = {};
      for (const k of missing) {
        const [lat, lng] = k.split(",").map(Number);
        try {
          // be polite to the API: small delay
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 150));
          // eslint-disable-next-line no-await-in-loop
          const addr = await reverseGeocode(lat, lng);
          results[k] = addr;
        } catch {
          results[k] = k; // fallback to coords
        }
      }
      setAddressMap((prev) => ({ ...prev, ...results }));
    };

    run();
  }, [data]); // imported helpers used inside are stable

  // Derived CSV rows per report type (use per-report exported functions)
  const exportRowsAll = useMemo(() => {
    if (!Array.isArray(data)) return [];

    if (reportType === "orders") {
      return getOrderExportRows(data);
    }

    if (reportType === "sales") {
      return getSalesExportRows(data);
    }

    if (reportType === "sellRequests") {
      return getSellRequestsExportRows(data, addressMap, fmtKey);
    }

    if (reportType === "demolitions") {
      return getDemolitionsExportRows(data, addressMap, fmtKey);
    }

    return [];
  }, [data, reportType, addressMap]);

  // CSV export implementation (unchanged, using exportRowsAll)
  const exportCSV = () => {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
    if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      alert("Please provide valid From and To dates.");
      return;
    }
    if (to < from) {
      alert("'To' date must be the same or after the 'From' date.");
      return;
    }

    const rows = exportRowsAll;
    if (!rows || rows.length === 0) {
      alert("No data found for the selected report and date range.");
      return;
    }

    // Build headers and body per report type
    let headers = [];
    let bodyLines = [];

    if (reportType === "orders") {
      headers = ["Order ID", "User Email", "Status", "Total Items", "Total Amount", "Address"];
      bodyLines = rows.map((r) =>
        [
          `"${String(r.orderId).replace(/"/g, '""')}"`,
          `"${String(r.email).replace(/"/g, '""')}"`,
          r.status,
          r.items,
          Number(r.amount).toFixed(2),
          `"${String(r.address || "—").replace(/"/g, '""')}"`,
        ].join(",")
      );
    } else if (reportType === "sales") {
      headers = ["Sale ID", "Order ID", "User ID", "Total", "Items Count", "Delivered At"];
      bodyLines = rows.map((r) =>
        [
          `"${String(r.saleId).replace(/"/g, '""')}"`,
          `"${String(r.orderId).replace(/"/g, '""')}"`,
          `"${String(r.userId).replace(/"/g, '""')}"`,
          Number(r.total).toFixed(2),
          r.itemsCount,
          r.deliveredAt ? new Date(r.deliveredAt).toISOString() : "",
        ].join(",")
      );
    } else if (reportType === "sellRequests") {
      headers = ["Sell ID", "User ID", "Name", "Contact", "Location", "Price", "Status"];
      bodyLines = rows.map((r) =>
        [
          `"${String(r.sellId).replace(/"/g, '""')}"`,
          `"${String(r.userId).replace(/"/g, '""')}"`,
          `"${String(r.name).replace(/"/g, '""')}"`,
          `"${String(r.contact).replace(/"/g, '""')}"`,
          `"${String(r.location || "N/A").replace(/"/g, '""')}"`,
          Number(r.price).toFixed(2),
          r.status,
        ].join(",")
      );
    } else if (reportType === "demolitions") {
      headers = ["Demolish ID", "User ID", "Name", "Contact", "Location", "Price", "Status"];
      bodyLines = rows.map((r) =>
        [
          `"${String(r.demolishId).replace(/"/g, '""')}"`,
          `"${String(r.userId).replace(/"/g, '""')}"`,
          `"${String(r.name).replace(/"/g, '""')}"`,
          `"${String(r.contact).replace(/"/g, '""')}"`,
          `"${String(r.location || "N/A").replace(/"/g, '""')}"`,
          Number(r.price).toFixed(2),
          r.status,
        ].join(",")
      );
    }

    const blob = new Blob([headers.join(",") + "\n" + bodyLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const fileName = `${reportType}_from_${fromDate}_to_${toDate}.csv`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render helpers mapping
  const renderHeader = () => {
    if (reportType === "orders") return renderOrderTableHeader();
    if (reportType === "sales") return renderSalesTableHeader();
    if (reportType === "sellRequests") return renderSellRequestsTableHeader();
    if (reportType === "demolitions") return renderDemolitionsTableHeader();
    return null;
  };

  const renderRow = (r, idx) => {
    if (reportType === "orders") return renderOrderTableRow(r, idx);
    if (reportType === "sales") return renderSalesTableRow(r, idx);
    if (reportType === "sellRequests") return renderSellRequestsTableRow(r, idx);
    if (reportType === "demolitions") return renderDemolitionsTableRow(r, idx);
    return null;
  };

  // Calculate summary statistics for visual display
  const summaryStats = useMemo(() => {
    const stats = {
      totalCount: exportRowsAll.length,
      totalAmount: 0,
      avgAmount: 0,
      statusBreakdown: {},
      locationFrequency: {},
    };

    if (reportType === "orders") {
      stats.totalAmount = exportRowsAll.reduce((sum, r) => sum + Number(r.amount || 0), 0);
      stats.avgAmount = stats.totalCount > 0 ? stats.totalAmount / stats.totalCount : 0;
      exportRowsAll.forEach((r) => {
        const status = r.status || "Unknown";
        stats.statusBreakdown[status] = (stats.statusBreakdown[status] || 0) + 1;
        // Location frequency for orders
        if (r.address && r.address !== "—") {
          const addr = r.address.split(",")[0].trim(); // Get first part of address
          stats.locationFrequency[addr] = (stats.locationFrequency[addr] || 0) + 1;
        }
      });
    } else if (reportType === "sales") {
      stats.totalAmount = exportRowsAll.reduce((sum, r) => sum + Number(r.total || 0), 0);
      stats.avgAmount = stats.totalCount > 0 ? stats.totalAmount / stats.totalCount : 0;
    } else if (reportType === "sellRequests") {
      stats.totalAmount = exportRowsAll.reduce((sum, r) => sum + Number(r.price || 0), 0);
      stats.avgAmount = stats.totalCount > 0 ? stats.totalAmount / stats.totalCount : 0;
      exportRowsAll.forEach((r) => {
        const status = r.status || "Unknown";
        stats.statusBreakdown[status] = (stats.statusBreakdown[status] || 0) + 1;
        // Location frequency for sell requests
        if (r.location && r.location !== "N/A") {
          const loc = r.location.split(",")[0].trim();
          stats.locationFrequency[loc] = (stats.locationFrequency[loc] || 0) + 1;
        }
      });
    } else if (reportType === "demolitions") {
      stats.totalAmount = exportRowsAll.reduce((sum, r) => sum + Number(r.price || 0), 0);
      stats.avgAmount = stats.totalCount > 0 ? stats.totalAmount / stats.totalCount : 0;
      exportRowsAll.forEach((r) => {
        const status = r.status || "Unknown";
        stats.statusBreakdown[status] = (stats.statusBreakdown[status] || 0) + 1;
        // Location frequency for demolitions
        if (r.location && r.location !== "N/A") {
          const loc = r.location.split(",")[0].trim();
          stats.locationFrequency[loc] = (stats.locationFrequency[loc] || 0) + 1;
        }
      });
    }

    return stats;
  }, [exportRowsAll, reportType]);

  return (
    <div className="container-fluid mt-4">
      {/* Top control card: Generate Reports */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="d-flex flex-wrap gap-3 align-items-end">
          <div className="me-auto">
            <h5 className="mb-1">Generate Reports</h5>
            <div className="text-muted" style={{ fontSize: 14 }}>
              Choose a report type and date range, then export as CSV or PDF.
            </div>
            <div className="mt-2">
              <small className="text-muted">
                Signed in as: <strong>{currentUser.email || "—"}</strong>
              </small>
            </div>

            {reportType === "sales" && (
              <div style={{ marginTop: 8, fontSize: 13 }}>
                <strong>Total sales (all time):</strong>{" "}
                {salesTotal == null ? "—" : `₱${Number(salesTotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                <div style={{ fontSize: 12, color: "#666" }}>
                  Note: server `/api/sales/total` returns overall total. Server-side range-total not implemented.
                </div>
              </div>
            )}

            {reportType === "sellRequests" && lastUsedSellEndpoint && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                Fetched from: <code>{lastUsedSellEndpoint}</code>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="d-flex align-items-center gap-2">
            <Form.Label className="m-0">Report</Form.Label>
            <Form.Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ width: 220 }}
            >
              {REPORT_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Form.Select>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Form.Label className="m-0">From</Form.Label>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ width: 160 }}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <Form.Label className="m-0">To</Form.Label>
            <Form.Control
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ width: 160 }}
            />
          </div>

          <div className="d-flex gap-2">
            <Button variant="outline-dark" size="sm" onClick={exportCSV} disabled={loading || exportRowsAll.length === 0}>
              Download CSV
            </Button>

            {/* PDF button now captures the preview HTML to ensure PDF = table */}
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                try {
                  const html = tablePreviewRef.current ? tablePreviewRef.current.innerHTML : "";
                  setTableHtmlForPdf(html);
                } catch (err) {
                  setTableHtmlForPdf("");
                }
                setShowReportModal(true);
              }}
              disabled={loading || exportRowsAll.length === 0}
            >
              Download PDF
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Visual Summary Stats Section */}
      {data.length > 0 && (
        <Row className="mb-4">
          <Col md={3} sm={6} xs={12} className="mb-3">
            <Card className="shadow-sm h-100" style={{ borderLeft: "4px solid #0066cc" }}>
              <Card.Body>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>Total Records</div>
                <div style={{ fontSize: 32, fontWeight: "bold", color: "#0066cc" }}>
                  {summaryStats.totalCount}
                </div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>items found in range</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6} xs={12} className="mb-3">
            <Card className="shadow-sm h-100" style={{ borderLeft: "4px solid #28a745" }}>
              <Card.Body>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
                  {reportType === "orders" || reportType === "sales" ? "Total Amount" : "Total Value"}
                </div>
                <div style={{ fontSize: 32, fontWeight: "bold", color: "#28a745" }}>
                  ₱{Number(summaryStats.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>aggregate</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6} xs={12} className="mb-3">
            <Card className="shadow-sm h-100" style={{ borderLeft: "4px solid #ff9800" }}>
              <Card.Body>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>Average Value</div>
                <div style={{ fontSize: 32, fontWeight: "bold", color: "#ff9800" }}>
                  ₱{Number(summaryStats.avgAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>per item</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6} xs={12} className="mb-3">
            <Card className="shadow-sm h-100" style={{ borderLeft: "4px solid #6c757d" }}>
              <Card.Body>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>Status Types</div>
                <div style={{ fontSize: 32, fontWeight: "bold", color: "#6c757d" }}>
                  {Object.keys(summaryStats.statusBreakdown).length}
                </div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>different statuses</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Status Breakdown Chart (if applicable) */}
      {data.length > 0 && Object.keys(summaryStats.statusBreakdown).length > 0 && (
        <Card className="shadow-sm mb-4">
          <Card.Header style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
            <strong>Status Distribution</strong>
          </Card.Header>
          <Card.Body>
            <Row>
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
                  <Col md={6} key={status} className="mb-3">
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 500, textTransform: "capitalize" }}>{status}</span>
                        <span style={{ color: "#666" }}>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: 24,
                          backgroundColor: "#e9ecef",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${percentage}%`,
                            backgroundColor: barColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          {percentage > 10 && `${percentage}%`}
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Location Frequency Chart */}
      {data.length > 0 && Object.keys(summaryStats.locationFrequency).length > 0 && (
        <Card className="shadow-sm mb-4">
          <Card.Header style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
            <strong>Location Frequency</strong>
          </Card.Header>
          <Card.Body>
            {(() => {
              const sortedLocations = Object.entries(summaryStats.locationFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10); // Show top 10 locations

              const maxCount = Math.max(...sortedLocations.map((loc) => loc[1]));

              return (
                <div>
                  {sortedLocations.map(([location, count], idx) => {
                    const percentage = (count / maxCount) * 100;
                    const colors = [
                      "#0066cc",
                      "#0052a3",
                      "#003d7a",
                      "#002951",
                      "#001a33",
                      "#004080",
                      "#0059b3",
                      "#0073e6",
                      "#3385ff",
                      "#6699ff",
                    ];
                    const barColor = colors[idx] || "#6c757d";

                    return (
                      <div key={location} style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 500,
                              fontSize: 14,
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              marginRight: 12,
                            }}
                            title={location}
                          >
                            {location}
                          </span>
                          <span
                            style={{
                              color: "#666",
                              fontWeight: 500,
                              minWidth: 50,
                              textAlign: "right",
                            }}
                          >
                            {count}
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: 28,
                            backgroundColor: "#e9ecef",
                            borderRadius: 6,
                            overflow: "hidden",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${percentage}%`,
                              backgroundColor: barColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              paddingRight: 8,
                              color: "white",
                              fontSize: 12,
                              fontWeight: 600,
                              transition: "width 0.3s ease",
                            }}
                          >
                            {percentage > 15 && `${((count / summaryStats.totalCount) * 100).toFixed(1)}%`}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {Object.keys(summaryStats.locationFrequency).length > 10 && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: 12,
                        backgroundColor: "#f0f3f7",
                        borderRadius: 6,
                        fontSize: 13,
                        color: "#666",
                        textAlign: "center",
                      }}
                    >
                      +{Object.keys(summaryStats.locationFrequency).length - 10} more locations
                    </div>
                  )}
                </div>
              );
            })()}
          </Card.Body>
        </Card>
      )}

      {/* Preview / table card */}
      <Card className="shadow-sm">
        <Card.Body>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{REPORT_TYPES.find((t) => t.value === reportType)?.label}</strong>
              <div style={{ fontSize: 13, color: "#666" }}>
                {loading ? "Loading..." : `${data.length} rows found for selected range`}
              </div>
            </div>

            <div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setFromDate(firstOfMonthISO);
                  setToDate(todayISO);
                }}
              >
                Reset Dates
              </Button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            {data.length === 0 ? (
              <div style={{ color: "#888" }}>No data to preview.</div>
            ) : (
              <div ref={tablePreviewRef} style={{ maxHeight: 700, overflow: "auto" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>{renderHeader()}</tr>
                  </thead>
                  <tbody>{exportRowsAll.map((r, idx) => renderRow(r, idx))}</tbody>
                </table>

                {/* Summary footer: show total rows */}
                <div style={{ fontSize: 13, color: "#666" }}>
                  Showing {exportRowsAll.length} row{exportRowsAll.length !== 1 ? "s" : ""}.
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Report modal: opens Report.jsx and passes the rows, type, dates and recipient */}
      <Report
        show={showReportModal}
        handleClose={() => setShowReportModal(false)}
        reportType={reportType}
        rows={exportRowsAll}
        reportTo={currentUser.email}
        fromDate={fromDate}
        toDate={toDate}
        title="Report"
        tableHtml={tableHtmlForPdf}
        summaryStats={summaryStats}
      />
    </div>
  );
};

export default ReportDashboard;



// import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
// import { Card, Button, Form } from "react-bootstrap";
// import axios from "axios";
// import Report from "./Report"; // <-- make sure Report.jsx is in the same folder

// const API_URL = process.env.REACT_APP_API_URL || "";

// const REPORT_TYPES = [
//   { value: "orders", label: "Orders" },
//   { value: "sales", label: "Sales" },
//   { value: "sellRequests", label: "Sell Requests" },
//   { value: "demolitions", label: "Demolitions" },
// ];

// // Helper: try multiple endpoints for sell requests (some projects mount routers under different paths)
// const probeSellRequestEndpoints = async (candidates) => {
//   for (const ep of candidates) {
//     try {
//       const res = await axios.get(`${API_URL}${ep}`);
//       // success: return response object and the endpoint used
//       return { res, endpoint: ep };
//     } catch (err) {
//       // continue trying other endpoints on error (404/500/CORS/401 will be visible in devtools)
//     }
//   }
//   throw new Error("All sell request endpoints failed");
// };

// // Normalize timestamp field names into a canonical createdAt (ISO string or null)
// const normalizeTimestamp = (obj) => {
//   if (!obj || typeof obj !== "object") return { ...obj, createdAt: null };

//   const possible = [
//     "createdAt",
//     "created_at",
//     "created",
//     "createdOn",
//     "created_on",
//     "deliveredAt", // for sales / deliveries
//     "delivered_at",
//     "delivered",
//     "timestamp",
//     "time",
//   ];

//   for (const key of possible) {
//     if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
//       // try to convert to Date; if it fails, still include original value as string
//       try {
//         const d = new Date(obj[key]);
//         if (!Number.isNaN(d.getTime())) return { ...obj, createdAt: d.toISOString() };
//       } catch {
//         return { ...obj, createdAt: String(obj[key]) };
//       }
//     }
//   }
//   return { ...obj, createdAt: null };
// };

// // Try to extract a human-friendly address from an order object or location object
// const extractAddress = (orderOrLocation) => {
//   if (!orderOrLocation || typeof orderOrLocation !== "object") return "—";

//   // If object has top-level address-ish fields, build from those
//   const maybe =
//     orderOrLocation.address ||
//     orderOrLocation.shippingAddress ||
//     orderOrLocation.addressLine ||
//     orderOrLocation.location ||
//     orderOrLocation.deliveryAddress ||
//     orderOrLocation.address_info ||
//     orderOrLocation.shipTo;

//   // If maybe is a string, return it
//   if (typeof maybe === "string" && maybe.trim() !== "") return maybe;

//   // If it's an object, try to construct from typical subfields
//   const src = typeof maybe === "object" && maybe ? maybe : orderOrLocation;

//   if (src && typeof src === "object") {
//     const parts = [];
//     if (src.fullAddress) parts.push(src.fullAddress);
//     if (src.address) parts.push(src.address);
//     if (src.address1) parts.push(src.address1);
//     if (src.line1) parts.push(src.line1);
//     if (src.city) parts.push(src.city);
//     if (src.province) parts.push(src.province);
//     if (src.state) parts.push(src.state);
//     if (src.zip || src.postalCode) parts.push(src.zip || src.postalCode);
//     if (src.country) parts.push(src.country);
//     // also common local fields
//     if (src.barangay) parts.push(src.barangay);
//     if (src.town) parts.push(src.town);
//     if (src.municipality) parts.push(src.municipality);

//     const joined = parts.filter(Boolean).join(", ");
//     if (joined) return joined;
//   }

//   // Fallback: if it looks like coords
//   if (orderOrLocation.lat && orderOrLocation.lng) {
//     return `${orderOrLocation.lat}, ${orderOrLocation.lng}`;
//   }

//   return "—";
// };

// const ReportDashboard = () => {
//   // User info
//   const [currentUser, setCurrentUser] = useState({ username: "", email: "" });
//   const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

//   // Report state
//   const [reportType, setReportType] = useState("orders");
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState([]); // raw, normalized items for the selected report
//   const [salesTotal, setSalesTotal] = useState(null); // used when reportType === 'sales'
//   const [lastUsedSellEndpoint, setLastUsedSellEndpoint] = useState(null); // debug aid

//   // Show/Hide Report modal
//   const [showReportModal, setShowReportModal] = useState(false);

//   // Table preview ref & raw HTML to pass into Report so PDF is identical to preview
//   const tablePreviewRef = useRef(null);
//   const [tableHtmlForPdf, setTableHtmlForPdf] = useState("");

//   // Reverse geocode cache / map
//   const [addressMap, setAddressMap] = useState({}); // key -> pretty address
//   const fmtKey = useCallback((lat, lng) => `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`, []);

//   const getCachedAddress = useCallback((key) => {
//     try {
//       const raw = localStorage.getItem("geo_address_cache");
//       if (!raw) return null;
//       const json = JSON.parse(raw);
//       return json[key] || null;
//     } catch {
//       return null;
//     }
//   }, []);

//   const setCachedAddress = useCallback((key, val) => {
//     try {
//       const raw = localStorage.getItem("geo_address_cache");
//       const json = raw ? JSON.parse(raw) : {};
//       json[key] = val;
//       localStorage.setItem("geo_address_cache", JSON.stringify(json));
//     } catch {}
//   }, []);

//   const reverseGeocode = useCallback(
//     async (lat, lng) => {
//       const key = fmtKey(lat, lng);
//       const cached = getCachedAddress(key);
//       if (cached) return cached;

//       const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fil,en`;
//       const res = await fetch(url, { headers: { Accept: "application/json" } });
//       if (!res.ok) throw new Error("Reverse geocode failed");

//       const data = await res.json();
//       const a = data.address || {};
//       const pretty =
//         data.display_name ||
//         [a.road, a.suburb || a.village || a.barangay, a.town || a.city || a.municipality, a.state, a.country]
//           .filter(Boolean)
//           .join(", ");
//       const value = pretty || key;

//       setCachedAddress(key, value);
//       return value;
//     },
//     [fmtKey, getCachedAddress, setCachedAddress]
//   );

//   // Date range (default: first of month -> today)
//   const todayISO = new Date().toISOString().split("T")[0];
//   const firstOfMonthISO = (() => {
//     const d = new Date();
//     d.setDate(1);
//     return d.toISOString().split("T")[0];
//   })();
//   const [fromDate, setFromDate] = useState(firstOfMonthISO);
//   const [toDate, setToDate] = useState(todayISO);

//   // Fetch current user email
//   useEffect(() => {
//     if (!userId) return;
//     const token = localStorage.getItem("token");
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/users/${userId}`, {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         });
//         const d = res.data || {};
//         setCurrentUser({ username: d.username || "N/A", email: d.email || "N/A" });
//       } catch (err) {
//         console.error("Error fetching current user:", err);
//         setCurrentUser((u) => ({ ...u, email: "N/A" }));
//       }
//     })();
//   }, [userId]);

//   // Helper: inclusive toDate conversion
//   const parseRange = (fromISO, toISO) => {
//     const from = fromISO ? new Date(`${fromISO}T00:00:00`) : null;
//     const to = toISO ? new Date(`${toISO}T23:59:59.999`) : null;
//     return { from, to };
//   };

//   // Fetching logic per report type
//   useEffect(() => {
//     let mounted = true;
//     const { from, to } = parseRange(fromDate, toDate);

//     const fetchData = async () => {
//       setLoading(true);
//       setData([]);
//       setSalesTotal(null);
//       setLastUsedSellEndpoint(null);

//       try {
//         if (reportType === "orders") {
//           const res = await axios.get(`${API_URL}/api/orders`);
//           if (!mounted) return;

//           const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
//           const hydrated = arr.map((o) => ({
//             ...o,
//             userEmail: o.userEmail || o.email || "—",
//             createdAt: normalizeTimestamp(o).createdAt,
//             address: extractAddress(o),
//           }));

//           const filtered = hydrated.filter((o) => {
//             if (!o.createdAt) return false;
//             const c = new Date(o.createdAt);
//             if (from && c < from) return false;
//             if (to && c > to) return false;
//             return true;
//           });
//           if (mounted) setData(filtered);
//         } else if (reportType === "sales") {
//           if (from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
//             try {
//               const startISO = from.toISOString();
//               const endISO = to.toISOString();
//               const res = await axios.get(
//                 `${API_URL}/api/sales/range?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`
//               );
//               if (!mounted) return;
//               const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
//               const normalized = arr.map((s) => ({ ...s, createdAt: normalizeTimestamp(s).createdAt || normalizeTimestamp({ deliveredAt: s.deliveredAt }).createdAt }));
//               if (mounted) setData(normalized);
//             } catch (err) {
//               console.warn("Sales range fetch failed, falling back to all sales filter:", err);
//               const resAll = await axios.get(`${API_URL}/api/sales`);
//               if (!mounted) return;
//               const arrAll = Array.isArray(resAll.data) ? resAll.data : (resAll.data?.data || []);
//               const normalized = arrAll.map((s) => ({ ...s, createdAt: normalizeTimestamp(s).createdAt || normalizeTimestamp({ deliveredAt: s.deliveredAt }).createdAt }));
//               const filtered = normalized.filter((s) => {
//                 if (!s.createdAt) return false;
//                 const c = new Date(s.createdAt);
//                 if (from && c < from) return false;
//                 if (to && c > to) return false;
//                 return true;
//               });
//               if (mounted) setData(filtered);
//             }
//           } else {
//             const resAll = await axios.get(`${API_URL}/api/sales`);
//             if (!mounted) return;
//             const arrAll = Array.isArray(resAll.data) ? resAll.data : (resAll.data?.data || []);
//             const normalized = arrAll.map((s) => ({ ...s, createdAt: normalizeTimestamp(s).createdAt || normalizeTimestamp({ deliveredAt: s.deliveredAt }).createdAt }));
//             if (mounted) setData(normalized);
//           }

//           try {
//             const tRes = await axios.get(`${API_URL}/api/sales/total`);
//             if (mounted) setSalesTotal(tRes.data?.totalIncome ?? 0);
//           } catch (err) {
//             console.warn("Failed to fetch sales total:", err);
//           }
//         } else if (reportType === "sellRequests") {
//           const candidates = ["/api/sellrequests", "/api/sell-requests", "/api/sellRequests", "/api/sell"];
//           try {
//             const { res, endpoint } = await probeSellRequestEndpoints(candidates);
//             setLastUsedSellEndpoint(endpoint);

//             let arr = [];
//             if (Array.isArray(res.data)) arr = res.data;
//             else if (Array.isArray(res.data.requests)) arr = res.data.requests;
//             else if (Array.isArray(res.data.sellRequests)) arr = res.data.sellRequests;
//             else if (Array.isArray(res.data.sellRequest)) arr = res.data.sellRequest;
//             else if (Array.isArray(res.data.data)) arr = res.data.data;
//             else {
//               const maybe = Object.values(res.data || {}).find((v) => Array.isArray(v));
//               arr = Array.isArray(maybe) ? maybe : [];
//             }

//             const normalized = arr.map((r) => {
//               const n = normalizeTimestamp(r);
//               const createdAt = n.createdAt || (r.createdAt ? normalizeTimestamp({ createdAt: r.createdAt }).createdAt : null);
//               const sellId = r.sellId || r.selId || r._id || r.sell_id || "";

//               // keep original location object if present; locationDisplay may be fallback
//               let locationDisplay = "N/A";
//               if (typeof r.location === "string" && r.location.trim() !== "") {
//                 locationDisplay = r.location;
//               } else if (r.location && typeof r.location === "object") {
//                 locationDisplay = extractAddress(r.location);
//                 if ((locationDisplay === "—" || !locationDisplay) && r.location.lat && r.location.lng) {
//                   locationDisplay = `${r.location.lat}, ${r.location.lng}`;
//                 }
//               } else {
//                 const extracted = extractAddress(r);
//                 if (extracted && extracted !== "—") locationDisplay = extracted;
//               }

//               return { ...r, createdAt, sellId, locationDisplay };
//             });

//             const filtered = normalized.filter((r) => {
//               if (!r.createdAt) return true;
//               const c = new Date(r.createdAt);
//               if (from && c < from) return false;
//               if (to && c > to) return false;
//               return true;
//             });

//             if (mounted) setData(filtered);
//           } catch (err) {
//             console.error("All sell request endpoints failed:", err);
//             if (mounted) setData([]);
//           }
//         } else if (reportType === "demolitions") {
//           try {
//             const res = await axios.get(`${API_URL}/api/demolish`);
//             if (!mounted) return;
//             const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
//             const normalized = arr.map((r) => {
//               const createdAt = normalizeTimestamp(r).createdAt;
//               const demolishId = r.demolishId || r._id || r.demolish_id || "";

//               // keep location object to resolve later
//               return { ...r, createdAt, demolishId };
//             });

//             const filtered = normalized.filter((r) => {
//               if (!r.createdAt) return false;
//               const c = new Date(r.createdAt);
//               if (from && c < from) return false;
//               if (to && c > to) return false;
//               return true;
//             });
//             if (mounted) setData(filtered);
//           } catch (err) {
//             console.error("Failed to fetch demolitions:", err);
//             if (mounted) setData([]);
//           }
//         }
//       } catch (err) {
//         console.error("Error fetching report data:", err);
//         if (mounted) setData([]);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     fetchData();

//     return () => {
//       mounted = false;
//     };
//   }, [reportType, fromDate, toDate, reverseGeocode, fmtKey]);

//   // Kick off reverse geocoding for any items that have lat/lng and no cached address.
//   useEffect(() => {
//     const run = async () => {
//       if (!Array.isArray(data) || data.length === 0) return;

//       // collect coords from sellRequests and demolitions only (we use locationDisplay fallback for others)
//       const coords = [];
//       data.forEach((item) => {
//         const loc = item.location || item.locationDisplay || item.locationData || null;
//         // try multiple possible shapes:
//         if (loc && typeof loc === "object" && loc.lat && loc.lng) {
//           coords.push(fmtKey(loc.lat, loc.lng));
//         } else if (item.location && item.location.lat && item.location.lng) {
//           coords.push(fmtKey(item.location.lat, item.location.lng));
//         } else if (item.locationDisplay && typeof item.locationDisplay === "string" && item.locationDisplay.includes(",")) {
//           // skip — it's a string fallback
//         }
//       });

//       const unique = Array.from(new Set(coords));
//       if (!unique.length) return;

//       // seed from localStorage
//       const seed = {};
//       unique.forEach((k) => {
//         const c = getCachedAddress(k);
//         if (c) seed[k] = c;
//       });

//       if (Object.keys(seed).length) {
//         setAddressMap((prev) => ({ ...seed, ...prev }));
//       }

//       const missing = unique.filter((k) => !seed[k]);
//       if (!missing.length) return;

//       const results = {};
//       for (const k of missing) {
//         const [lat, lng] = k.split(",").map(Number);
//         try {
//           // be polite to the API: small delay
//           // eslint-disable-next-line no-await-in-loop
//           await new Promise((r) => setTimeout(r, 150));
//           // eslint-disable-next-line no-await-in-loop
//           const addr = await reverseGeocode(lat, lng);
//           results[k] = addr;
//         } catch {
//           results[k] = k; // fallback to coords
//         }
//       }
//       setAddressMap((prev) => ({ ...prev, ...results }));
//     };

//     run();
//   }, [data, reverseGeocode, fmtKey, getCachedAddress]);

//   // Derived CSV rows per report type (from normalized data)
//   const exportRowsAll = useMemo(() => {
//     if (!Array.isArray(data)) return [];

//     if (reportType === "orders") {
//       return data.map((order) => {
//         const totalItems =
//           order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;
//         const totalAmount =
//           order.items?.reduce(
//             (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
//             0
//           ) || Number(order.total) || 0;
//         return {
//           orderId: order.orderId || order._id || "",
//           email: order.userEmail || order.email || "—",
//           status: order.status || "Pending",
//           items: totalItems,
//           amount: totalAmount,
//           createdAt: order.createdAt,
//           address: order.address ?? extractAddress(order),
//         };
//       });
//     }

//     if (reportType === "sales") {
//       return data.map((s) => ({
//         saleId: s._id || s.saleId || "",
//         orderId: s.orderId || "—",
//         userId: s.userId || "—",
//         total: Number(s.total || 0),
//         itemsCount: Array.isArray(s.items) ? s.items.reduce((a, it) => a + (Number(it.quantity) || 0), 0) : "—",
//         deliveredAt: s.deliveredAt || s.createdAt,
//       }));
//     }

//     if (reportType === "sellRequests") {
//       return data.map((r) => {
//         // determine pretty location:
//         let locationPretty = "N/A";
//         // if r.location is object with lat/lng, use addressMap if available
//         const locObj = r.location && typeof r.location === "object" ? r.location : null;
//         if (locObj && locObj.lat && locObj.lng) {
//           const key = fmtKey(locObj.lat, locObj.lng);
//           locationPretty = addressMap[key] || `${locObj.lat}, ${locObj.lng}`;
//         } else if (r.locationDisplay && typeof r.locationDisplay === "string" && r.locationDisplay !== "N/A") {
//           locationPretty = r.locationDisplay;
//         } else {
//           // fallback to extractAddress from top-level fields
//           const ex = extractAddress(r);
//           locationPretty = ex && ex !== "—" ? ex : "N/A";
//         }

//         return {
//           sellId: r.sellId || r.selId || r._id || r.sell_id || "",
//           userId: r.userId || "—",
//           name: r.name || "—",
//           contact: r.contact || "—",
//           location: locationPretty,
//           price: Number(r.price ?? 0),
//           status: r.status || "pending",
//           createdAt: r.createdAt,
//         };
//       });
//     }

//     if (reportType === "demolitions") {
//       return data.map((r) => {
//         let locationPretty = "N/A";
//         const locObj = r.location && typeof r.location === "object" ? r.location : null;
//         if (locObj && locObj.lat && locObj.lng) {
//           const key = fmtKey(locObj.lat, locObj.lng);
//           locationPretty = addressMap[key] || `${locObj.lat}, ${locObj.lng}`;
//         } else {
//           const ex = extractAddress(r);
//           locationPretty = ex && ex !== "—" ? ex : "N/A";
//         }

//         return {
//           demolishId: r.demolishId || r._id || r.demolish_id || "",
//           userId: r.userId || "—",
//           name: r.name || "—",
//           contact: r.contact || "—",
//           location: locationPretty,
//           price: Number(r.price ?? 0),
//           status: r.status || "pending",
//           createdAt: r.createdAt,
//         };
//       });
//     }

//     return [];
//   }, [data, reportType, addressMap, fmtKey]);

//   // CSV export implementation (generic)
//   const exportCSV = () => {
//     const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
//     const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
//     if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
//       alert("Please provide valid From and To dates.");
//       return;
//     }
//     if (to < from) {
//       alert("'To' date must be the same or after the 'From' date.");
//       return;
//     }

//     const rows = exportRowsAll;
//     if (!rows || rows.length === 0) {
//       alert("No data found for the selected report and date range.");
//       return;
//     }

//     // Build headers and body per report type (note: removed Created At for sellRequests & demolitions)
//     let headers = [];
//     let bodyLines = [];

//     if (reportType === "orders") {
//       headers = ["Order ID", "User Email", "Status", "Total Items", "Total Amount", "Address"];
//       bodyLines = rows.map((r) =>
//         [
//           `"${String(r.orderId).replace(/"/g, '""')}"`,
//           `"${String(r.email).replace(/"/g, '""')}"`,
//           r.status,
//           r.items,
//           Number(r.amount).toFixed(2),
//           `"${String(r.address || "—").replace(/"/g, '""')}"`,
//         ].join(",")
//       );
//     } else if (reportType === "sales") {
//       headers = ["Sale ID", "Order ID", "User ID", "Total", "Items Count", "Delivered At"];
//       bodyLines = rows.map((r) =>
//         [
//           `"${String(r.saleId).replace(/"/g, '""')}"`,
//           `"${String(r.orderId).replace(/"/g, '""')}"`,
//           `"${String(r.userId).replace(/"/g, '""')}"`,
//           Number(r.total).toFixed(2),
//           r.itemsCount,
//           r.deliveredAt ? new Date(r.deliveredAt).toISOString() : "",
//         ].join(",")
//       );
//     } else if (reportType === "sellRequests") {
//       headers = ["Sell ID", "User ID", "Name", "Contact", "Location", "Price", "Status"];
//       bodyLines = rows.map((r) =>
//         [
//           `"${String(r.sellId).replace(/"/g, '""')}"`,
//           `"${String(r.userId).replace(/"/g, '""')}"`,
//           `"${String(r.name).replace(/"/g, '""')}"`,
//           `"${String(r.contact).replace(/"/g, '""')}"`,
//           `"${String(r.location || "N/A").replace(/"/g, '""')}"`,
//           Number(r.price).toFixed(2),
//           r.status,
//         ].join(",")
//       );
//     } else if (reportType === "demolitions") {
//       headers = ["Demolish ID", "User ID", "Name", "Contact", "Location", "Price", "Status"];
//       bodyLines = rows.map((r) =>
//         [
//           `"${String(r.demolishId).replace(/"/g, '""')}"`,
//           `"${String(r.userId).replace(/"/g, '""')}"`,
//           `"${String(r.name).replace(/"/g, '""')}"`,
//           `"${String(r.contact).replace(/"/g, '""')}"`,
//           `"${String(r.location || "N/A").replace(/"/g, '""')}"`,
//           Number(r.price).toFixed(2),
//           r.status,
//         ].join(",")
//       );
//     }

//     const blob = new Blob([headers.join(",") + "\n" + bodyLines.join("\n")], {
//       type: "text/csv;charset=utf-8;",
//     });

//     const fileName = `${reportType}_from_${fromDate}_to_${toDate}.csv`;
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.setAttribute("download", fileName);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="container mt-4">
//       {/* Top control card: Generate Reports */}
//       <Card className="shadow-sm mb-4">
//         <Card.Body className="d-flex flex-wrap gap-3 align-items-end">
//           <div className="me-auto">
//             <h5 className="mb-1">Generate Reports</h5>
//             <div className="text-muted" style={{ fontSize: 14 }}>
//               Choose a report type and date range, then export as CSV or PDF.
//             </div>
//             <div className="mt-2">
//               <small className="text-muted">
//                 Signed in as: <strong>{currentUser.email || "—"}</strong>
//               </small>
//             </div>

//             {reportType === "sales" && (
//               <div style={{ marginTop: 8, fontSize: 13 }}>
//                 <strong>Total sales (all time):</strong>{" "}
//                 {salesTotal == null ? "—" : `₱${Number(salesTotal).toLocaleString()}`}
//                 <div style={{ fontSize: 12, color: "#666" }}>
//                   Note: server `/api/sales/total` returns overall total. Server-side range-total not implemented.
//                 </div>
//               </div>
//             )}

//             {reportType === "sellRequests" && lastUsedSellEndpoint && (
//               <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
//                 Fetched from: <code>{lastUsedSellEndpoint}</code>
//               </div>
//             )}
//           </div>

//           {/* Controls */}
//           <div className="d-flex align-items-center gap-2">
//             <Form.Label className="m-0">Report</Form.Label>
//             <Form.Select
//               value={reportType}
//               onChange={(e) => setReportType(e.target.value)}
//               style={{ width: 220 }}
//             >
//               {REPORT_TYPES.map((r) => (
//                 <option key={r.value} value={r.value}>
//                   {r.label}
//                 </option>
//               ))}
//             </Form.Select>
//           </div>

//           <div className="d-flex align-items-center gap-2">
//             <Form.Label className="m-0">From</Form.Label>
//             <Form.Control
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               style={{ width: 160 }}
//             />
//           </div>

//           <div className="d-flex align-items-center gap-2">
//             <Form.Label className="m-0">To</Form.Label>
//             <Form.Control
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               style={{ width: 160 }}
//             />
//           </div>

//           <div className="d-flex gap-2">
//             <Button
//               variant="outline-dark"
//               size="sm"
//               onClick={exportCSV}
//               disabled={loading || exportRowsAll.length === 0}
//             >
//               Download CSV
//             </Button>

//             {/* PDF button now captures the preview HTML to ensure PDF = table */}
//             <Button
//               variant="outline-primary"
//               size="sm"
//               onClick={() => {
//                 try {
//                   const html = tablePreviewRef.current ? tablePreviewRef.current.innerHTML : "";
//                   setTableHtmlForPdf(html);
//                 } catch (err) {
//                   setTableHtmlForPdf("");
//                 }
//                 setShowReportModal(true);
//               }}
//               disabled={loading || exportRowsAll.length === 0}
//             >
//               Download PDF
//             </Button>
//           </div>
//         </Card.Body>
//       </Card>

//       {/* Preview / table card */}
//       <Card className="shadow-sm">
//         <Card.Body>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//             <div>
//               <strong>{REPORT_TYPES.find((t) => t.value === reportType)?.label}</strong>
//               <div style={{ fontSize: 13, color: "#666" }}>
//                 {loading ? "Loading..." : `${data.length} rows found for selected range`}
//               </div>
//             </div>

//             <div>
//               <Button
//                 size="sm"
//                 variant="secondary"
//                 onClick={() => {
//                   setFromDate(firstOfMonthISO);
//                   setToDate(todayISO);
//                 }}
//               >
//                 Reset Dates
//               </Button>
//             </div>
//           </div>

//           <div style={{ marginTop: 12 }}>
//             {data.length === 0 ? (
//               <div style={{ color: "#888" }}>No data to preview.</div>
//             ) : (
//               <div ref={tablePreviewRef} style={{ maxHeight: 700, overflow: "auto" }}>
//                 <table className="table table-sm">
//                   <thead>
//                     <tr>
//                       {reportType === "orders" && (
//                         <>
//                           <th>Order ID</th>
//                           <th>Email</th>
//                           <th>Status</th>
//                           <th>Amount</th>
//                           <th>Address</th>
//                         </>
//                       )}
//                       {reportType === "sales" && (
//                         <>
//                           <th>Sale ID</th>
//                           <th>Order ID</th>
//                           <th>Total</th>
//                           <th>Delivered At</th>
//                         </>
//                       )}
//                       {reportType === "sellRequests" && (
//                         <>
//                           <th>Sell ID</th>
//                           <th>Name</th>
//                           <th>Contact</th>
//                           <th>Location</th>
//                           <th>Price</th>
//                           <th>Status</th>
//                         </>
//                       )}
//                       {reportType === "demolitions" && (
//                         <>
//                           <th>Demolish ID</th>
//                           <th>Name</th>
//                           <th>Contact</th>
//                           <th>Location</th>
//                           <th>Price</th>
//                           <th>Status</th>
//                         </>
//                       )}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {exportRowsAll.map((r, idx) => (
//                       <tr key={idx}>
//                         {reportType === "orders" && (
//                           <>
//                             <td>{r.orderId}</td>
//                             <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
//                               {r.email}
//                             </td>
//                             <td>{r.status}</td>
//                             <td>{Number(r.amount).toFixed(2)}</td>
//                             <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
//                               {r.address || "—"}
//                             </td>
//                           </>
//                         )}

//                         {reportType === "sales" && (
//                           <>
//                             <td>{r.saleId}</td>
//                             <td>{r.orderId}</td>
//                             <td>{Number(r.total).toFixed(2)}</td>
//                             <td>{r.deliveredAt ? new Date(r.deliveredAt).toLocaleString() : "—"}</td>
//                           </>
//                         )}

//                         {reportType === "sellRequests" && (
//                           <>
//                             <td>{r.sellId}</td>
//                             <td>{r.name}</td>
//                             <td>{r.contact}</td>
//                             <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
//                               {r.location || "N/A"}
//                             </td>
//                             <td>{Number(r.price).toFixed(2)}</td>
//                             <td>{r.status}</td>
//                           </>
//                         )}

//                         {reportType === "demolitions" && (
//                           <>
//                             <td>{r.demolishId}</td>
//                             <td>{r.name}</td>
//                             <td>{r.contact}</td>
//                             <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
//                               {r.location || "N/A"}
//                             </td>
//                             <td>{Number(r.price).toFixed(2)}</td>
//                             <td>{r.status}</td>
//                           </>
//                         )}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>

//                 {/* Summary footer: show total rows */}
//                 <div style={{ fontSize: 13, color: "#666" }}>
//                   Showing {exportRowsAll.length} row{exportRowsAll.length !== 1 ? "s" : ""}.
//                 </div>
//               </div>
//             )}
//           </div>
//         </Card.Body>
//       </Card>

//       {/* Report modal: opens Report.jsx and passes the rows, type, dates and recipient */}
//       <Report
//         show={showReportModal}
//         handleClose={() => setShowReportModal(false)}
//         reportType={reportType}
//         rows={exportRowsAll}
//         reportTo={currentUser.email}
//         fromDate={fromDate}
//         toDate={toDate}
//         title="Report"
//         tableHtml={tableHtmlForPdf}
//       />
//     </div>
//   );
// };

// export default ReportDashboard;
