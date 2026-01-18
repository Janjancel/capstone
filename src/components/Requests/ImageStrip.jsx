import { Box, Stack } from "@mui/material";

export default function ImageStrip({ images, onCardClickStop }) {
  const urls = [images?.front, images?.side, images?.back].filter(Boolean);
  if (!urls.length) return null;

  return (
    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
      {urls.map((src, idx) => (
        <Box
          key={idx}
          component="img"
          src={src}
          alt={`preview-${idx}`}
          sx={{
            width: 84,
            height: 84,
            objectFit: "cover",
            borderRadius: 1.5,
            border: "1px solid #eee",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onCardClickStop) onCardClickStop(e);
            window.open(src, "_blank");
          }}
        />
      ))}
    </Stack>
  );
}
