import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Collapse,
  Stack,
  IconButton
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

/**
 * FAQs.jsx
 * - Uses same black / grey / off-white palette
 * - Fonts removed (uses default / inherited fonts)
 */

const palette = {
  black: "#0B0B0B",
  grey800: "#2E2E2E",
  grey600: "#6E6E6E",
  grey300: "#CFCFCF",
  offWhite: "#F7F6F3",
  bg: "#F2F2F0"
};

const faqs = [
  {
    question: "Lorem ipsum dolor sit amet?",
    answer:
      "Lorem ipsum madela dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum."
  },
  {
    question: "Consectetur adipiscing elit?",
    answer:
      "Lorem ipsum madela, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisi."
  },
  {
    question: "Vivamus lacinia odio vitae?",
    answer:
      "Lorem ipsum madela, vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada."
  },
  {
    question: "Vestibulum ante ipsum primis?",
    answer:
      "Lorem ipsum madela, vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae."
  },
  {
    question: "Cras venenatis euismod malesuada?",
    answer:
      "Lorem ipsum madela, cras venenatis euismod malesuada. Etiam porta sem malesuada magna mollis euismod."
  }
];

export default function FAQs() {
  const [hovered, setHovered] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpand = (idx) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: palette.bg,
        px: 2,
        py: 4,
        color: palette.grey800
        // font-family intentionally left to default / inherited
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 700, mx: "auto" }}>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ color: palette.black, fontWeight: 700 }}
        >
          Frequently Asked Questions
        </Typography>

        <Box sx={{ maxHeight: "72vh", overflow: "auto", pr: 1 }}>
          {faqs.map((faq, idx) => {
            const isExpanded = expandedItems.has(idx);
            return (
              <Paper
                key={idx}
                elevation={2}
                sx={{
                  mb: 2,
                  p: 2,
                  cursor: "pointer",
                  transition: "transform 0.18s, box-shadow 0.18s, border-left 0.18s",
                  bgcolor: palette.offWhite,
                  border: `1px solid ${palette.grey300}`,
                  display: "flex",
                  alignItems: "flex-start",
                  borderLeft: isExpanded ? `6px solid ${palette.black}` : undefined,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                    borderLeft: isExpanded ? `6px solid ${palette.black}` : `4px solid ${palette.black}`
                  }
                }}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => toggleExpand(idx)}
                role="button"
                aria-expanded={isExpanded}
              >
                <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ width: "100%" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 500, color: palette.black }}
                    >
                      {faq.question}
                    </Typography>

                    <Collapse in={isExpanded || hovered === idx} timeout="auto">
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          color: palette.grey600,
                          whiteSpace: "pre-line"
                        }}
                      >
                        {faq.answer}
                      </Typography>
                    </Collapse>
                  </Box>

                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(idx);
                    }}
                    aria-label={isExpanded ? "Collapse answer" : "Expand answer"}
                    sx={{
                      alignSelf: "center",
                      bgcolor: palette.offWhite,
                      border: `1px solid ${palette.grey300}`,
                      color: palette.black,
                      "&:hover": { bgcolor: "#EFEDEC" },
                      ml: 1
                    }}
                    size="small"
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
