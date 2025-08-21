import React from "react";
import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const Loader = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Title & Search Skeleton */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton variant="text" width={150} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        <Skeleton variant="rectangular" width={200} height={40} />
      </Box>

      {/* Table Skeleton */}
      <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
        <Table stickyHeader>
          {/* <TableHead>
            <TableRow>
              {[
                "ID",
                "Name",
                "Contact",
                "Location",
                "Price",
                "Description",
                "Status",
                "Actions",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    bgcolor: "grey.700",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead> */}
          <TableHead>
  <TableRow>
    {[
      "ID",
      "Name",
      "Contact",
      "Location",
      "Price",
      "Description",
      "Status",
      "Actions",
    ].map((head, i) => (
      <TableCell
        key={i}
        sx={{
          bgcolor: "grey.700",
          color: "white",
          fontWeight: "bold",
        }}
      >
        <Skeleton
          variant="text"
          width={`${Math.floor(Math.random() * 40) + 60}%`}
          height={30}
          animation={false} // disable MUI's shimmer
          className="animate__animated animate__pulse animate__infinite"
        />
      </TableCell>
    ))}
  </TableRow>
</TableHead>
          <TableBody>
            {[...Array(6)].map((_, index) => (
              <TableRow key={index}>
                {[...Array(8)].map((__, i) => (
                  <TableCell key={i}>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Download Button Skeleton */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Skeleton variant="rectangular" width={180} height={40} />
      </Box>
    </Box>
  );
};

export default Loader;
