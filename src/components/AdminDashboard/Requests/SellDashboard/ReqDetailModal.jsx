import React from "react";
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
} from "@mui/material";
import jsPDF from "jspdf";

const ReqDetailModal = ({ request, onClose }) => {
  const handleDownloadPDF = () => {
    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text("Sell Request Details", 10, 20);
    docPDF.setFontSize(12);
    docPDF.text(`ID: ${request._id}`, 10, 40);
    docPDF.text(`Name: ${request.name}`, 10, 50);
    docPDF.text(`Contact: ${request.contact}`, 10, 60);
    docPDF.text(
      `Location: ${request.location?.lat}, ${request.location?.lng}`,
      10,
      70
    );
    docPDF.text(`Price: ₱${request.price}`, 10, 80);
    const description = docPDF.splitTextToSize(
      `Description: ${request.description}`,
      180
    );
    docPDF.text(description, 10, 90);

    if (request.image) {
      docPDF.addImage(request.image, "JPEG", 120, 40, 70, 70);
    }

    docPDF.save(`Sell_Request_${request._id}.pdf`);
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Request Details</DialogTitle>
      <DialogContent>
        <Card sx={{ display: "flex", borderRadius: 2, overflow: "hidden" }}>
          {/* Left side: details */}
          <CardContent sx={{ flex: 1 }}>
            <Typography><strong>ID:</strong> {request._id}</Typography>
            <Typography><strong>Name:</strong> {request.name}</Typography>
            <Typography><strong>Contact:</strong> {request.contact}</Typography>
            <Typography>
              <strong>Location:</strong> {request.location?.lat}, {request.location?.lng}
            </Typography>
            <Typography><strong>Price:</strong> ₱{request.price}</Typography>
            <Typography><strong>Description:</strong> {request.description}</Typography>
          </CardContent>

          {/* Right side: image */}
          {request.image && (
            <CardMedia
              component="img"
              sx={{ width: 250, objectFit: "cover" }}
              image={request.image}
              alt="Request"
            />
          )}
        </Card>
      </DialogContent>

      {/* Buttons at bottom center */}
      <DialogActions sx={{ justifyContent: "right", pb: 2 }}>
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

export default ReqDetailModal;
