
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Typography,
//   Grid,
//   Button,
//   Card,
//   CardContent,
//   CardMedia,
//   Box,
//   Chip,
//   Divider,
//   Tooltip,
//   IconButton,
//   Skeleton,
// } from "@mui/material";
// import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import jsPDF from "jspdf";

// const ReqDetailModalSell = ({ request = {}, onClose }) => {
//   // ID to show/copy
//   const displayId = useMemo(() => request?.sellId || request?._id || "", [request]);

//   // ===== Reverse Geocoding (cached) =====
//   const [prettyAddress, setPrettyAddress] = useState("");
//   const [addrLoading, setAddrLoading] = useState(false);

//   const hasCoords = !!(request?.location?.lat && request?.location?.lng);
//   const coordKey = useMemo(() => {
//     if (!hasCoords) return null;
//     const fmt = (n) => Number(n).toFixed(6);
//     return `${fmt(request.location.lat)},${fmt(request.location.lng)}`;
//   }, [hasCoords, request]);

//   const getCachedAddress = (key) => {
//     try {
//       const raw = localStorage.getItem("geo_address_cache");
//       if (!raw) return null;
//       const json = JSON.parse(raw);
//       return json[key] || null;
//     } catch {
//       return null;
//     }
//   };

//   const setCachedAddress = (key, val) => {
//     try {
//       const raw = localStorage.getItem("geo_address_cache");
//       const json = raw ? JSON.parse(raw) : {};
//       json[key] = val;
//       localStorage.setItem("geo_address_cache", JSON.stringify(json));
//     } catch {}
//   };

//   useEffect(() => {
//     let active = true;
//     const run = async () => {
//       if (!coordKey) {
//         setPrettyAddress("N/A");
//         return;
//       }
//       const cached = getCachedAddress(coordKey);
//       if (cached) {
//         setPrettyAddress(cached);
//         return;
//       }
//       setAddrLoading(true);
//       try {
//         const { lat, lng } = request.location;
//         const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fil,en`;
//         const res = await fetch(url, { headers: { Accept: "application/json" } });
//         if (!res.ok) throw new Error("Reverse geocode failed");
//         const data = await res.json();
//         const a = data.address || {};
//         const pretty =
//           data.display_name ||
//           [a.road, a.suburb || a.village || a.barangay, a.town || a.city || a.municipality, a.state, a.country]
//             .filter(Boolean)
//             .join(", ");
//         const value = pretty || coordKey;
//         if (!active) return;
//         setPrettyAddress(value);
//         setCachedAddress(coordKey, value);
//       } catch {
//         if (!active) return;
//         setPrettyAddress(coordKey);
//       } finally {
//         if (active) setAddrLoading(false);
//       }
//     };
//     run();
//     return () => {
//       active = false;
//     };
//   }, [coordKey, request]);
//   // =====================================

//   // Copy helpers
//   const [idCopied, setIdCopied] = useState(false);
//   const [addrCopied, setAddrCopied] = useState(false);

//   const copyId = async () => {
//     try {
//       await navigator.clipboard.writeText(displayId);
//       setIdCopied(true);
//       setTimeout(() => setIdCopied(false), 1200);
//     } catch {}
//   };

//   const copyAddress = async () => {
//     try {
//       await navigator.clipboard.writeText(prettyAddress || "");
//       setAddrCopied(true);
//       setTimeout(() => setAddrCopied(false), 1200);
//     } catch {}
//   };

//   // Status chip color (adjusted for sell flow)
//   const statusColor = (status) => {
//     if (!status) return "warning";
//     const s = String(status).toLowerCase();
//     // scheduled/ocular/accepted -> success
//     if (s.includes("scheduled") || s.includes("ocular") || s.includes("accept") || s.includes("accepted")) return "success";
//     // declined/cancelled -> error
//     if (s.includes("declin") || s.includes("cancel")) return "error";
//     return "warning";
//   };

//   // PDF download with pretty address
//   const handleDownloadPDF = () => {
//     const docPDF = new jsPDF();
//     docPDF.setFontSize(16);
//     docPDF.text("Sell Request Details", 10, 20);
//     docPDF.setFontSize(12);

//     docPDF.text(`ID: ${displayId}`, 10, 40);
//     docPDF.text(`Name: ${request.name ?? ""}`, 10, 50);
//     docPDF.text(`Contact: ${request.contact ?? ""}`, 10, 60);

//     const locText = hasCoords ? (prettyAddress || `${request.location.lat}, ${request.location.lng}`) : "N/A";
//     docPDF.text(`Location: ${locText}`, 10, 70);

//     docPDF.text(`Price: ₱${request.price ?? ""}`, 10, 80);
//     const description = docPDF.splitTextToSize(`Description: ${request.description ?? ""}`, 180);
//     docPDF.text(description, 10, 90);

//     let y = 110;
//     if (request.images) {
//       if (request.images.front) {
//         docPDF.text("Front View:", 10, y);
//         try {
//           docPDF.addImage(request.images.front, "JPEG", 50, y - 5, 60, 60);
//         } catch {}
//         y += 70;
//       }
//       if (request.images.side) {
//         docPDF.text("Side View:", 10, y);
//         try {
//           docPDF.addImage(request.images.side, "JPEG", 50, y - 5, 60, 60);
//         } catch {}
//         y += 70;
//       }
//       if (request.images.back) {
//         docPDF.text("Back View:", 10, y);
//         try {
//           docPDF.addImage(request.images.back, "JPEG", 50, y - 5, 60, 60);
//         } catch {}
//         y += 70;
//       }
//     }

//     docPDF.save(`Sell_Request_${request._id || "export"}.pdf`);
//   };

//   const DetailRow = ({ label, children, noWrap = false }) => (
//     <Box sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: noWrap ? "nowrap" : "wrap" }}>
//       <Typography sx={{ fontWeight: 600, minWidth: 110 }}>{label}</Typography>
//       <Typography sx={{ color: "text.secondary" }}>{children}</Typography>
//     </Box>
//   );

//   // ----------------------------
//   // Timeline / History logic (ported from Demolish and tailored for Sell)
//   // Accept several possible keys for history; normalize them to sorted array of { status, message?, createdAt }
//   const rawHistory =
//     request.statusHistory || request.history || request.statusTimeline || request.status_changes || request.statusChanges || null;

//   // Helper to safely parse date-like values
//   const parseDate = (v) => {
//     if (!v) return null;
//     const d = v instanceof Date ? v : new Date(v);
//     if (isNaN(d.getTime())) return null;
//     return d;
//   };

//   const synthesizeHistory = () => {
//     // If server doesn't provide a history array, create minimal timeline with sell flow in mind:
//     const items = [];
//     const created = parseDate(request.createdAt);
//     if (created) {
//       items.push({
//         status: request.initialStatus || "pending",
//         message: "Request created",
//         createdAt: created,
//       });
//     }

//     // If there's an ocular/schedule date field, include ocular scheduled event
//     const ocularAt = parseDate(request.scheduledOcularAt) || parseDate(request.scheduledDate) || null;
//     if (ocularAt) {
//       items.push({
//         status: "ocular_scheduled",
//         message: "Ocular visit scheduled",
//         createdAt: ocularAt,
//       });
//     }

//     // If there's an explicit accept/decline timestamp fields, include them
//     if (request.acceptedAt) {
//       const at = parseDate(request.acceptedAt);
//       items.push({
//         status: "accepted",
//         message: request.acceptMessage || "Request accepted",
//         createdAt: at || new Date(),
//       });
//     } else if (request.declinedAt) {
//       const at = parseDate(request.declinedAt);
//       items.push({
//         status: "declined",
//         message: request.declineMessage || "Request declined",
//         createdAt: at || new Date(),
//       });
//     }

//     // fallback final status (use updatedAt)
//     const updated = parseDate(request.updatedAt) || new Date();
//     // ensure we reflect the server's current status if present
//     items.push({
//       status: request.status || "pending",
//       message: undefined,
//       createdAt: updated,
//     });

//     // dedupe & sort
//     const unique = items
//       .filter(Boolean)
//       .map((it) => ({ ...it, createdAt: it.createdAt || new Date() }))
//       .sort((a, b) => a.createdAt - b.createdAt);

//     return unique;
//   };

//   const normalizedHistory = useMemo(() => {
//     let arr = [];
//     if (Array.isArray(rawHistory) && rawHistory.length > 0) {
//       arr = rawHistory
//         .map((it) => {
//           if (!it) return null;
//           // handle different field names
//           // Prefer canonical sell flow names when possible (map common variants)
//           let status = it.status || it.name || it.type || (it.to && `changed to ${it.to}`) || "updated";
//           // normalize common backend variants
//           const sLow = String(status).toLowerCase();
//           if (sLow.includes("ocular") || sLow.includes("schedule")) status = "ocular_scheduled";
//           if (sLow.includes("accept")) status = "accepted";
//           if (sLow.includes("declin")) status = "declined";

//           const message = it.message || it.note || it.summary || it.text || undefined;
//           const createdAt = parseDate(it.createdAt || it.date || it.timestamp || it.time || it.created_at || it.updatedAt);
//           return { status, message, createdAt: createdAt || new Date() };
//         })
//         .filter(Boolean)
//         .sort((a, b) => a.createdAt - b.createdAt);
//     } else {
//       arr = synthesizeHistory();
//     }
//     // make sure we have at least one entry
//     if (arr.length === 0) {
//       arr = [
//         {
//           status: request.status || "pending",
//           message: undefined,
//           createdAt: parseDate(request.updatedAt) || parseDate(request.createdAt) || new Date(),
//         },
//       ];
//     }
//     return arr;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [request]);

//   // Helper format
//   const formatDateTime = (d) => {
//     if (!d) return "N/A";
//     try {
//       const dt = d instanceof Date ? d : new Date(d);
//       return dt.toLocaleString();
//     } catch {
//       return String(d);
//     }
//   };

//   // Current status (last item)
//   const currentStatus = normalizedHistory.length ? normalizedHistory[normalizedHistory.length - 1].status : request.status;

//   // ----------------------------
//   // Duration calculation
//   // Terminal statuses we consider for "end" of transaction in sell flow:
//   // - ocular_scheduled or scheduled is an intermediate important status but not final
//   // - final statuses: accepted / declined / cancelled
//   const TERMINAL_STATUSES = ["accepted", "accept", "declined", "decline", "cancelled"];

//   const findStart = (hist) => {
//     if (!Array.isArray(hist) || hist.length === 0) return parseDate(request.createdAt) || null;
//     // prefer earliest 'pending' or 'request created' like statuses; else first item
//     const lowerMatch = hist.find((h) => h.status && String(h.status).toLowerCase().includes("pending"));
//     if (lowerMatch && lowerMatch.createdAt) return parseDate(lowerMatch.createdAt);
//     // fallback to the very first item's createdAt
//     return parseDate(hist[0].createdAt) || parseDate(request.createdAt) || null;
//   };

//   const findEnd = (hist) => {
//     if (!Array.isArray(hist) || hist.length === 0) return null;
//     // find first occurrence of terminal statuses (accepted/declined/cancelled)
//     for (let i = 0; i < hist.length; i++) {
//       const s = hist[i].status;
//       if (!s) continue;
//       const sl = String(s).toLowerCase();
//       if (TERMINAL_STATUSES.some((t) => sl.includes(t))) {
//         return parseDate(hist[i].createdAt) || null;
//       }
//     }
//     // no terminal found
//     return null;
//   };

//   const formatDuration = (ms) => {
//     if (ms == null || isNaN(ms)) return "N/A";
//     if (ms < 1000) return `${ms} ms`;
//     const totalSeconds = Math.floor(ms / 1000);
//     const days = Math.floor(totalSeconds / (24 * 3600));
//     const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     const seconds = totalSeconds % 60;
//     const parts = [];
//     if (days) parts.push(`${days}d`);
//     if (hours) parts.push(`${hours}h`);
//     if (minutes) parts.push(`${minutes}m`);
//     if (!days && !hours && !minutes) parts.push(`${seconds}s`);
//     return parts.join(" ");
//   };

//   const transactionStart = findStart(normalizedHistory);
//   const transactionEnd = findEnd(normalizedHistory) || null; // null means not ended by our terminal statuses
//   const durationMs =
//     transactionStart && transactionEnd
//       ? transactionEnd - transactionStart
//       : transactionStart && !transactionEnd
//       ? Date.now() - transactionStart
//       : null;
//   const durationText = durationMs ? formatDuration(durationMs) : "N/A";

//   // ----------------------------
//   // Timeline UI component
//   // ----------------------------
//   const Timeline = ({ items = [] }) => {
//     return (
//       <Box sx={{ position: "relative", pl: 2, pr: 1, my: 1 }}>
//         {/* vertical line */}
//         <Box
//           sx={{
//             position: "absolute",
//             left: 11,
//             top: 8,
//             bottom: 8,
//             width: "2px",
//             bgcolor: "divider",
//             borderRadius: 1,
//           }}
//         />
//         <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//           {items.map((it, idx) => {
//             const isLast = idx === items.length - 1;
//             return (
//               <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
//                 {/* dot & time */}
//                 <Box sx={{ width: 110, minWidth: 110 }}>
//                   <Typography variant="caption" sx={{ color: "text.secondary" }}>
//                     {formatDateTime(it.createdAt)}
//                   </Typography>
//                 </Box>

//                 <Box sx={{ flex: 1 }}>
//                   <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                     <Box
//                       sx={{
//                         width: 16,
//                         height: 16,
//                         borderRadius: "50%",
//                         bgcolor: isLast ? "primary.main" : "background.paper",
//                         border: "2px solid",
//                         borderColor: isLast ? "primary.main" : "divider",
//                         boxShadow: isLast ? 2 : "none",
//                         flexShrink: 0,
//                       }}
//                     />
//                     <Chip
//                       size="small"
//                       label={it.status}
//                       color={statusColor(it.status)}
//                       variant={isLast ? "filled" : "outlined"}
//                       sx={{ textTransform: "capitalize", fontWeight: 600 }}
//                     />
//                   </Box>
//                   {it.message && (
//                     <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
//                       {it.message}
//                     </Typography>
//                   )}
//                 </Box>
//               </Box>
//             );
//           })}
//         </Box>
//       </Box>
//     );
//   };

//   // ----------------------------

//   return (
//     <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
//       <DialogTitle sx={{ fontWeight: 700 }}>Request Details</DialogTitle>

//       <DialogContent dividers>
//         <Card
//           sx={{
//             borderRadius: 2,
//             overflow: "hidden",
//             border: "1px solid",
//             borderColor: "divider",
//           }}
//         >
//           {/* Header / Status */}
//           <Box
//             sx={{
//               px: 2,
//               py: 1.5,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               bgcolor: "background.default",
//               borderBottom: "1px solid",
//               borderColor: "divider",
//             }}
//           >
//             <Typography variant="h6" sx={{ fontWeight: 700 }}>
//               Sell Request
//             </Typography>
//             <Chip
//               label={currentStatus || request.status || "pending"}
//               color={statusColor(currentStatus || request.status)}
//               variant="outlined"
//               sx={{ textTransform: "capitalize", fontWeight: 600 }}
//             />
//           </Box>

//           <CardContent sx={{ pt: 2 }}>
//             {/* Meta Details */}
//             <Grid container spacing={2}>
//               <Grid item xs={12} md={6}>
//                 <DetailRow label="ID:">
//                   <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
//                     <Typography sx={{ color: "text.secondary" }}>{displayId || "—"}</Typography>
//                     {displayId && (
//                       <Tooltip title={idCopied ? "Copied!" : "Copy ID"}>
//                         <IconButton size="small" onClick={copyId}>
//                           <ContentCopyIcon fontSize="inherit" />
//                         </IconButton>
//                       </Tooltip>
//                     )}
//                   </Box>
//                 </DetailRow>
//                 <DetailRow label="Name:">{request.name || "—"}</DetailRow>
//                 <DetailRow label="Contact:">{request.contact || "—"}</DetailRow>
//                 <DetailRow label="Price:">₱{request.price ?? "—"}</DetailRow>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <DetailRow label="Location:" noWrap>
//                   {addrLoading ? (
//                     <Skeleton variant="text" width={220} />
//                   ) : hasCoords ? (
//                     <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
//                       <Typography sx={{ color: "text.secondary" }}>{prettyAddress}</Typography>
//                       <Tooltip title={addrCopied ? "Copied!" : "Copy address"}>
//                         <IconButton size="small" onClick={copyAddress}>
//                           <ContentCopyIcon fontSize="inherit" />
//                         </IconButton>
//                       </Tooltip>
//                     </Box>
//                   ) : (
//                     "N/A"
//                   )}
//                 </DetailRow>
//                 {hasCoords && (
//                   <DetailRow label="Coordinates:">
//                     {request.location.lat}, {request.location.lng}
//                   </DetailRow>
//                 )}
//               </Grid>
//             </Grid>

//             {/* Description */}
//             {request.description && String(request.description).trim() !== "" && (
//               <>
//                 <Divider sx={{ my: 2 }} />
//                 <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
//                   Description
//                 </Typography>
//                 <Typography sx={{ color: "text.secondary", whiteSpace: "pre-line" }}>
//                   {request.description}
//                 </Typography>
//               </>
//             )}

//             {/* Images Section */}
//             {(request.images?.front || request.images?.side || request.images?.back) && (
//               <>
//                 <Divider sx={{ my: 2 }} />
//                 <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
//                   Uploaded Images
//                 </Typography>
//                 <Grid container spacing={2}>
//                   {["front", "side", "back"].map(
//                     (key) =>
//                       request.images?.[key] && (
//                         <Grid item xs={12} sm={4} key={key}>
//                           <Card
//                             elevation={0}
//                             sx={{
//                               border: "1px solid",
//                               borderColor: "divider",
//                               borderRadius: 2,
//                               overflow: "hidden",
//                             }}
//                           >
//                             <CardMedia
//                               component="img"
//                               height="200"
//                               image={request.images[key]}
//                               alt={`${key} view`}
//                               sx={{ objectFit: "cover" }}
//                             />
//                             <Box sx={{ p: 1 }}>
//                               <Typography
//                                 align="center"
//                                 variant="caption"
//                                 color="text.secondary"
//                                 sx={{ textTransform: "capitalize" }}
//                               >
//                                 {key} view
//                               </Typography>
//                             </Box>
//                           </Card>
//                         </Grid>
//                       )
//                   )}
//                 </Grid>
//               </>
//             )}

//             {/* Timeline */}
//             <Divider sx={{ my: 2 }} />
//             <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
//               Status History
//             </Typography>
//             <Timeline items={normalizedHistory} />

//             {/* Transaction duration */}
//             <Divider sx={{ my: 2 }} />
//             <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
//               Transaction Duration
//             </Typography>
//             <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
//               <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
//                 <Typography sx={{ fontWeight: 600, minWidth: 110 }}>Start:</Typography>
//                 <Typography sx={{ color: "text.secondary" }}>
//                   {transactionStart ? formatDateTime(transactionStart) : "N/A"}
//                 </Typography>
//               </Box>

//               <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
//                 <Typography sx={{ fontWeight: 600, minWidth: 110 }}>{transactionEnd ? "End:" : "Current:"}</Typography>
//                 <Typography sx={{ color: "text.secondary" }}>{transactionEnd ? formatDateTime(transactionEnd) : "Still in progress"}</Typography>
//               </Box>

//               <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
//                 <Typography sx={{ fontWeight: 600, minWidth: 110 }}>Duration:</Typography>
//                 <Typography sx={{ color: "text.secondary" }}>
//                   {transactionStart ? (transactionEnd ? durationText : `${durationText} (so far)`) : "N/A"}
//                 </Typography>
//               </Box>
//             </Box>
//           </CardContent>
//         </Card>
//       </DialogContent>

//       <DialogActions sx={{ justifyContent: "flex-end", pb: 2 }}>
//         <Button variant="contained" color="primary" onClick={handleDownloadPDF}>
//           Download PDF
//         </Button>
//         <Button variant="outlined" color="secondary" onClick={onClose}>
//           Close
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ReqDetailModalSell;


import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  Skeleton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import jsPDF from "jspdf";
import html2pdf from "html2pdf.js";
import logo from "../../../images/logo.png"; // adjust path if necessary

const ReqDetailModalSell = ({ request = {}, onClose }) => {
  // ID to show/copy
  const displayId = useMemo(() => request?.sellId || request?._id || "", [request]);

  // ===== Reverse Geocoding (cached) =====
  const [prettyAddress, setPrettyAddress] = useState("");
  const [addrLoading, setAddrLoading] = useState(false);

  const hasCoords = !!(request?.location?.lat && request?.location?.lng);
  const coordKey = useMemo(() => {
    if (!hasCoords) return null;
    const fmt = (n) => Number(n).toFixed(6);
    return `${fmt(request.location.lat)},${fmt(request.location.lng)}`;
  }, [hasCoords, request]);

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
    } catch {}
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!coordKey) {
        setPrettyAddress("N/A");
        return;
      }
      const cached = getCachedAddress(coordKey);
      if (cached) {
        setPrettyAddress(cached);
        return;
      }
      setAddrLoading(true);
      try {
        const { lat, lng } = request.location;
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fil,en`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("Reverse geocode failed");
        const data = await res.json();
        const a = data.address || {};
        const pretty =
          data.display_name ||
          [a.road, a.suburb || a.village || a.barangay, a.town || a.city || a.municipality, a.state, a.country]
            .filter(Boolean)
            .join(", ");
        const value = pretty || coordKey;
        if (!active) return;
        setPrettyAddress(value);
        setCachedAddress(coordKey, value);
      } catch {
        if (!active) return;
        setPrettyAddress(coordKey);
      } finally {
        if (active) setAddrLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [coordKey, request]);
  // =====================================

  // Copy helpers
  const [idCopied, setIdCopied] = useState(false);
  const [addrCopied, setAddrCopied] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(displayId);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 1200);
    } catch {}
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(prettyAddress || "");
      setAddrCopied(true);
      setTimeout(() => setAddrCopied(false), 1200);
    } catch {}
  };

  // Status chip color (adjusted for sell flow)
  const statusColor = (status) => {
    if (!status) return "warning";
    const s = String(status).toLowerCase();
    // scheduled/ocular/accepted -> success
    if (s.includes("scheduled") || s.includes("ocular") || s.includes("accept") || s.includes("accepted")) return "success";
    // declined/cancelled -> error
    if (s.includes("declin") || s.includes("cancel")) return "error";
    return "warning";
  };

  // ----------------------------
  // Timeline / History logic (ported from Demolish and tailored for Sell)
  // Accept several possible keys for history; normalize them to sorted array of { status, message?, createdAt }
  const rawHistory =
    request.statusHistory || request.history || request.statusTimeline || request.status_changes || request.statusChanges || null;

  // Helper to safely parse date-like values
  const parseDate = (v) => {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d.getTime())) return null;
    return d;
  };

  const synthesizeHistory = () => {
    // If server doesn't provide a history array, create minimal timeline with sell flow in mind:
    const items = [];
    const created = parseDate(request.createdAt);
    if (created) {
      items.push({
        status: request.initialStatus || "pending",
        message: "Request created",
        createdAt: created,
      });
    }

    // If there's an ocular/schedule date field, include ocular scheduled event
    const ocularAt = parseDate(request.scheduledOcularAt) || parseDate(request.scheduledDate) || null;
    if (ocularAt) {
      items.push({
        status: "ocular_scheduled",
        message: "Ocular visit scheduled",
        createdAt: ocularAt,
      });
    }

    // If there's an explicit accept/decline timestamp fields, include them
    if (request.acceptedAt) {
      const at = parseDate(request.acceptedAt);
      items.push({
        status: "accepted",
        message: request.acceptMessage || "Request accepted",
        createdAt: at || new Date(),
      });
    } else if (request.declinedAt) {
      const at = parseDate(request.declinedAt);
      items.push({
        status: "declined",
        message: request.declineMessage || "Request declined",
        createdAt: at || new Date(),
      });
    }

    // fallback final status (use updatedAt)
    const updated = parseDate(request.updatedAt) || new Date();
    // ensure we reflect the server's current status if present
    items.push({
      status: request.status || "pending",
      message: undefined,
      createdAt: updated,
    });

    // dedupe & sort
    const unique = items
      .filter(Boolean)
      .map((it) => ({ ...it, createdAt: it.createdAt || new Date() }))
      .sort((a, b) => a.createdAt - b.createdAt);

    return unique;
  };

  const normalizedHistory = useMemo(() => {
    let arr = [];
    if (Array.isArray(rawHistory) && rawHistory.length > 0) {
      arr = rawHistory
        .map((it) => {
          if (!it) return null;
          // handle different field names
          // Prefer canonical sell flow names when possible (map common variants)
          let status = it.status || it.name || it.type || (it.to && `changed to ${it.to}`) || "updated";
          // normalize common backend variants
          const sLow = String(status).toLowerCase();
          if (sLow.includes("ocular") || sLow.includes("schedule")) status = "ocular_scheduled";
          if (sLow.includes("accept")) status = "accepted";
          if (sLow.includes("declin")) status = "declined";

          const message = it.message || it.note || it.summary || it.text || undefined;
          const createdAt = parseDate(it.createdAt || it.date || it.timestamp || it.time || it.created_at || it.updatedAt);
          return { status, message, createdAt: createdAt || new Date() };
        })
        .filter(Boolean)
        .sort((a, b) => a.createdAt - b.createdAt);
    } else {
      arr = synthesizeHistory();
    }
    // make sure we have at least one entry
    if (arr.length === 0) {
      arr = [
        {
          status: request.status || "pending",
          message: undefined,
          createdAt: parseDate(request.updatedAt) || parseDate(request.createdAt) || new Date(),
        },
      ];
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  // Helper format
  const formatDateTime = (d) => {
    if (!d) return "N/A";
    try {
      const dt = d instanceof Date ? d : new Date(d);
      return dt.toLocaleString();
    } catch {
      return String(d);
    }
  };

  // Current status (last item)
  const currentStatus = normalizedHistory.length ? normalizedHistory[normalizedHistory.length - 1].status : request.status;

  // ----------------------------
  // Duration calculation
  // Terminal statuses we consider for "end" of transaction in sell flow:
  // - ocular_scheduled or scheduled is an intermediate important status but not final
  // - final statuses: accepted / declined / cancelled
  const TERMINAL_STATUSES = ["accepted", "accept", "declined", "decline", "cancelled"];

  const findStart = (hist) => {
    if (!Array.isArray(hist) || hist.length === 0) return parseDate(request.createdAt) || null;
    // prefer earliest 'pending' or 'request created' like statuses; else first item
    const lowerMatch = hist.find((h) => h.status && String(h.status).toLowerCase().includes("pending"));
    if (lowerMatch && lowerMatch.createdAt) return parseDate(lowerMatch.createdAt);
    // fallback to the very first item's createdAt
    return parseDate(hist[0].createdAt) || parseDate(request.createdAt) || null;
  };

  const findEnd = (hist) => {
    if (!Array.isArray(hist) || hist.length === 0) return null;
    // find first occurrence of terminal statuses (accepted/declined/cancelled)
    for (let i = 0; i < hist.length; i++) {
      const s = hist[i].status;
      if (!s) continue;
      const sl = String(s).toLowerCase();
      if (TERMINAL_STATUSES.some((t) => sl.includes(t))) {
        return parseDate(hist[i].createdAt) || null;
      }
    }
    // no terminal found
    return null;
  };

  const formatDuration = (ms) => {
    if (ms == null || isNaN(ms)) return "N/A";
    if (ms < 1000) return `${ms} ms`;
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (!days && !hours && !minutes) parts.push(`${seconds}s`);
    return parts.join(" ");
  };

  const transactionStart = findStart(normalizedHistory);
  const transactionEnd = findEnd(normalizedHistory) || null; // null means not ended by our terminal statuses
  const durationMs =
    transactionStart && transactionEnd
      ? transactionEnd - transactionStart
      : transactionStart && !transactionEnd
      ? Date.now() - transactionStart
      : null;
  const durationText = durationMs ? formatDuration(durationMs) : "N/A";

  // ----------------------------
  // Timeline UI component
  // ----------------------------
  const Timeline = ({ items = [] }) => {
    return (
      <Box sx={{ position: "relative", pl: 2, pr: 1, my: 1 }}>
        {/* vertical line */}
        <Box
          sx={{
            position: "absolute",
            left: 11,
            top: 8,
            bottom: 8,
            width: "2px",
            bgcolor: "divider",
            borderRadius: 1,
          }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map((it, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                {/* dot & time */}
                <Box sx={{ width: 110, minWidth: 110 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {formatDateTime(it.createdAt)}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        bgcolor: isLast ? "primary.main" : "background.paper",
                        border: "2px solid",
                        borderColor: isLast ? "primary.main" : "divider",
                        boxShadow: isLast ? 2 : "none",
                        flexShrink: 0,
                      }}
                    />
                    <Chip
                      size="small"
                      label={it.status}
                      color={statusColor(it.status)}
                      variant={isLast ? "filled" : "outlined"}
                      sx={{ textTransform: "capitalize", fontWeight: 600 }}
                    />
                  </Box>
                  {it.message && (
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                      {it.message}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // ----------------------------
  // Invoice-like hidden area (used for HTML -> PDF export)
  // Set to A4 sizing (210mm x 297mm) to ensure output fits A4
  // ----------------------------
  const invoiceRef = useRef();

  // Build invoice-like data from request
  const invoiceData = useMemo(() => {
    return {
      id: displayId || request._id || "",
      date: request.createdAt || request.createdAt,
      customer: request.name || request.contact || "",
      contact: request.contact || request.email || "",
      address:
        prettyAddress ||
        (request.address ? (typeof request.address === "string" ? request.address : Object.values(request.address).filter(Boolean).join(", ")) : ""),
      items: request.items || [],
      price: request.price ?? request.total ?? 0,
      description: request.description || "",
      images: request.images || {},
      status: currentStatus || request.status || "pending",
    };
  }, [request, displayId, prettyAddress, currentStatus]);

  const formatPHP = (n) =>
    `₱${Number(n || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // New: download the invoice layout using html2pdf configured for A4
  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    if (!element) {
      // fallback to very small jsPDF output if invoiceRef missing
      const docPDF = new jsPDF();
      docPDF.setFontSize(16);
      docPDF.text("Sell Request Details", 10, 20);
      docPDF.setFontSize(12);
      docPDF.text(`ID: ${displayId}`, 10, 40);
      docPDF.text(`Name: ${request.name ?? ""}`, 10, 50);
      docPDF.text(`Contact: ${request.contact ?? ""}`, 10, 60);
      const locText = hasCoords ? (prettyAddress || `${request.location.lat}, ${request.location.lng}`) : "N/A";
      docPDF.text(`Location: ${locText}`, 10, 70);
      docPDF.text(`Price: ₱${request.price ?? ""}`, 10, 80);
      const description = docPDF.splitTextToSize(`Description: ${request.description ?? ""}`, 180);
      docPDF.text(description, 10, 90);
      docPDF.save(`Sell_Request_${request._id || "export"}.pdf`);
      return;
    }

    // html2pdf options for A4 (units in mm via jsPDF)
    const opt = {
      margin: 10, // mm margin
      filename: `sell_request_${invoiceData.id || "invoice"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Temporarily show the invoice element (if hidden) to ensure rendering
    const prevDisplay = element.style.display;
    element.style.display = "block";

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .finally(() => {
        element.style.display = prevDisplay;
      });
  };

  const DetailRow = ({ label, children, noWrap = false }) => (
    <Box sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: noWrap ? "nowrap" : "wrap" }}>
      <Typography sx={{ fontWeight: 600, minWidth: 110 }}>{label}</Typography>
      <Typography sx={{ color: "text.secondary" }}>{children}</Typography>
    </Box>
  );

  // ----------------------------
  // render
  // ----------------------------
  return (
    <>
      {/* Hidden invoice DOM used for PDF export (A4 dimensions) */}
      <Box
        ref={invoiceRef}
        sx={{
          display: "none",
          p: 0,
          bgcolor: "#ffffff",
          color: "text.primary",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          // Set explicit A4 width to match jsPDF A4 (210mm)
          width: "210mm",
        }}
      >
        {/* Add some inner padding that will be respected inside A4 width */}
        <Box sx={{ padding: "12mm" }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e0e0e0", pb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box component="img" src={logo} alt="Logo" sx={{ height: 60, objectFit: "contain" }} />
              <Box>
                <Typography sx={{ fontWeight: 800 }}>Unika Antika</Typography>
                <Typography sx={{ fontSize: 12, color: "#666" }}>Company address line 1</Typography>
                <Typography sx={{ fontSize: 12, color: "#666" }}>Phone • Email</Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontWeight: 700, fontSize: 18, letterSpacing: "1px" }}>Sell Request</Typography>
              <Typography sx={{ fontSize: 12, color: "#666", mt: 1 }}>Request ID: {invoiceData.id || "—"}</Typography>
              <Chip label={invoiceData.status} sx={{ mt: 1, textTransform: "capitalize", fontWeight: 600 }} />
            </Box>
          </Box>

          {/* Info */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 13 }}>
                <strong>Seller:</strong> {invoiceData.customer || "N/A"}
              </Typography>
              <Typography sx={{ fontSize: 13 }}>{invoiceData.contact}</Typography>
              {invoiceData.address && <Typography sx={{ fontSize: 13 }}>{invoiceData.address}</Typography>}
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 13 }}>
                <strong>Date:</strong> {invoiceData.date ? new Date(invoiceData.date).toLocaleString() : "N/A"}
              </Typography>
            </Box>
          </Box>

          {/* Description */}
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Description</Typography>
            <Typography sx={{ whiteSpace: "pre-line", color: "#444" }}>{invoiceData.description || "—"}</Typography>
          </Box>

          {/* Images */}
          {invoiceData.images && (invoiceData.images.front || invoiceData.images.side || invoiceData.images.back) && (
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              {["front", "side", "back"].map(
                (k) =>
                  invoiceData.images[k] && (
                    <Box key={k} sx={{ width: "60mm", border: "1px solid #eee", overflow: "hidden" }}>
                      <img src={invoiceData.images[k]} alt={k} style={{ width: "100%", height: "auto", display: "block" }} />
                      <Typography sx={{ textAlign: "center", fontSize: 11, color: "#666", p: 0.5 }}>{k} view</Typography>
                    </Box>
                  )
              )}
            </Box>
          )}

          {/* Price block */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <table style={{ width: 320, borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ padding: 8, border: "1px solid #eee" }}>
                    <strong>Price:</strong>
                  </td>
                  <td style={{ padding: 8, border: "1px solid #eee", textAlign: "right" }}>{formatPHP(invoiceData.price)}</td>
                </tr>
                <tr style={{ background: "#f8f9fa" }}>
                  <th style={{ padding: 8, border: "1px solid #eee", textAlign: "left" }}>Total</th>
                  <th style={{ padding: 8, border: "1px solid #eee", textAlign: "right" }}>{formatPHP(invoiceData.price)}</th>
                </tr>
              </tbody>
            </table>
          </Box>

          <Box sx={{ textAlign: "right", mt: 3 }}>
            <Typography sx={{ borderTop: "1px solid #eee", pt: 2 }}>Authorised Sign</Typography>
          </Box>

          <Box sx={{ textAlign: "center", mt: 2, borderTop: "1px solid #eee", pt: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#666" }}>Thank you for your business</Typography>
          </Box>
        </Box>
      </Box>

      {/* Visible modal */}
      <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
        {/* hide default title — replaced by invoice-style header */}
        <DialogTitle sx={{ fontWeight: 700, display: "none" }}>Request Details</DialogTitle>

        <DialogContent dividers>
          <Card
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* --- Invoice-style header implemented here --- */}
            <Box
              sx={{
                px: 2,
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "background.default",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              {/* Left: Logo + company info (invoice header style) */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box component="img" src={logo} alt="Logo" sx={{ height: 56, objectFit: "contain" }} />
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 16 }}>Unika Antika</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Company address line 1
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                    Phone • Email
                  </Typography>
                </Box>
              </Box>

              {/* Right: Request title + status chip (keeps sell-specific info) */}
              <Box sx={{ textAlign: "right", minWidth: 160 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "1px" }}>
                  Sell Request
                </Typography>
                <Chip
                  label={currentStatus || request.status || "pending"}
                  color={statusColor(currentStatus || request.status)}
                  variant="outlined"
                  sx={{ textTransform: "capitalize", fontWeight: 600, mt: 1 }}
                />
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
                  Request ID: {displayId || "—"}
                </Typography>
              </Box>
            </Box>
            {/* --- end header --- */}

            <CardContent sx={{ pt: 2 }}>
              {/* Meta Details */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <DetailRow label="ID:">
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                      <Typography sx={{ color: "text.secondary" }}>{displayId || "—"}</Typography>
                      {displayId && (
                        <Tooltip title={idCopied ? "Copied!" : "Copy ID"}>
                          <IconButton size="small" onClick={copyId}>
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </DetailRow>
                  <DetailRow label="Name:">{request.name || "—"}</DetailRow>
                  <DetailRow label="Contact:">{request.contact || "—"}</DetailRow>
                  <DetailRow label="Price:">₱{request.price ?? "—"}</DetailRow>
                </Grid>
                <Grid item xs={12} md={6}>
                  <DetailRow label="Location:" noWrap>
                    {addrLoading ? (
                      <Skeleton variant="text" width={220} />
                    ) : hasCoords ? (
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                        <Typography sx={{ color: "text.secondary" }}>{prettyAddress}</Typography>
                        <Tooltip title={addrCopied ? "Copied!" : "Copy address"}>
                          <IconButton size="small" onClick={copyAddress}>
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      "N/A"
                    )}
                  </DetailRow>
                  {hasCoords && (
                    <DetailRow label="Coordinates:">
                      {request.location.lat}, {request.location.lng}
                    </DetailRow>
                  )}
                </Grid>
              </Grid>

              {/* Description */}
              {request.description && String(request.description).trim() !== "" && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Description
                  </Typography>
                  <Typography sx={{ color: "text.secondary", whiteSpace: "pre-line" }}>{request.description}</Typography>
                </>
              )}

              {/* Images Section */}
              {(request.images?.front || request.images?.side || request.images?.back) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Uploaded Images
                  </Typography>
                  <Grid container spacing={2}>
                    {["front", "side", "back"].map(
                      (key) =>
                        request.images?.[key] && (
                          <Grid item xs={12} sm={4} key={key}>
                            <Card
                              elevation={0}
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                            >
                              <CardMedia
                                component="img"
                                height="200"
                                image={request.images[key]}
                                alt={`${key} view`}
                                sx={{ objectFit: "cover" }}
                              />
                              <Box sx={{ p: 1 }}>
                                <Typography
                                  align="center"
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {key} view
                                </Typography>
                              </Box>
                            </Card>
                          </Grid>
                        )
                    )}
                  </Grid>
                </>
              )}

              {/* Timeline */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Status History
              </Typography>
              <Timeline items={normalizedHistory} />

              {/* Transaction duration */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Transaction Duration
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography sx={{ fontWeight: 600, minWidth: 110 }}>Start:</Typography>
                  <Typography sx={{ color: "text.secondary" }}>{transactionStart ? formatDateTime(transactionStart) : "N/A"}</Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography sx={{ fontWeight: 600, minWidth: 110 }}>{transactionEnd ? "End:" : "Current:"}</Typography>
                  <Typography sx={{ color: "text.secondary" }}>{transactionEnd ? formatDateTime(transactionEnd) : "Still in progress"}</Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography sx={{ fontWeight: 600, minWidth: 110 }}>Duration:</Typography>
                  <Typography sx={{ color: "text.secondary" }}>{transactionStart ? (transactionEnd ? durationText : `${durationText} (so far)`) : "N/A"}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", pb: 2 }}>
          <Button variant="contained" color="primary" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReqDetailModalSell;
