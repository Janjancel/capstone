import { Chip } from "@mui/material";

export default function StatusChip({ value }) {
  const color =
    value === "accepted"
      ? "success"
      : value === "declined"
      ? "error"
      : value === "ocular_scheduled" || value === "scheduled"
      ? "primary"
      : value === "completed"
      ? "secondary"
      : value === "awaiting_price_approval"
      ? "info"
      : value === "price_accepted"
      ? "success"
      : value === "price_declined"
      ? "warning"
      : "default";

  const label = (value || "pending").replaceAll("_", " ");

  return (
    <Chip
      size="small"
      color={color}
      label={label}
      sx={{ textTransform: "capitalize" }}
    />
  );
}
