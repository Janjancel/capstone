import React, { useEffect, useMemo, useState } from "react";
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

const ReqDetailModalDemolish = ({ request, onClose }) => {
  // ID to show/copy
  const displayId = useMemo(() => request?.demolishId || request?._id || "", [request]);

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

  // Status chip color
  const statusColor = (status) => {
    if (status === "scheduled" || status === "ocular_scheduled") return "success";
    if (status === "declined") return "error";
    return "warning";
  };

  // PDF download with pretty address
  const handleDownloadPDF = () => {
    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text("Demolish Request Details", 10, 20);
    docPDF.setFontSize(12);

    docPDF.text(`ID: ${displayId}`, 10, 40);
    docPDF.text(`Name: ${request.name ?? ""}`, 10, 50);
    docPDF.text(`Contact: ${request.contact ?? ""}`, 10, 60);

    const locText = hasCoords ? (prettyAddress || `${request.location.lat}, ${request.location.lng}`) : "N/A";
    docPDF.text(`Location: ${locText}`, 10, 70);

    docPDF.text(`Price: ₱${request.price ?? ""}`, 10, 80);
    const description = docPDF.splitTextToSize(`Description: ${request.description ?? ""}`, 180);
    docPDF.text(description, 10, 90);

    let y = 110;
    if (request.images) {
      if (request.images.front) {
        docPDF.text("Front View:", 10, y);
        docPDF.addImage(request.images.front, "JPEG", 50, y - 5, 60, 60);
        y += 70;
      }
      if (request.images.side) {
        docPDF.text("Side View:", 10, y);
        docPDF.addImage(request.images.side, "JPEG", 50, y - 5, 60, 60);
        y += 70;
      }
      if (request.images.back) {
        docPDF.text("Back View:", 10, y);
        docPDF.addImage(request.images.back, "JPEG", 50, y - 5, 60, 60);
        y += 70;
      }
    }

    docPDF.save(`Demolish_Request_${request._id}.pdf`);
  };

  const DetailRow = ({ label, children, noWrap = false }) => (
    <Box sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: noWrap ? "nowrap" : "wrap" }}>
      <Typography sx={{ fontWeight: 600, minWidth: 110 }}>{label}</Typography>
      <Typography sx={{ color: "text.secondary" }}>{children}</Typography>
    </Box>
  );

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Request Details</DialogTitle>

      <DialogContent dividers>
        <Card
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Header / Status */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "background.default",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Demolish Request
            </Typography>
            <Chip
              label={request.status || "pending"}
              color={statusColor(request.status)}
              variant="outlined"
              sx={{ textTransform: "capitalize", fontWeight: 600 }}
            />
          </Box>

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
                <Typography sx={{ color: "text.secondary", whiteSpace: "pre-line" }}>
                  {request.description}
                </Typography>
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
  );
};

export default ReqDetailModalDemolish;
