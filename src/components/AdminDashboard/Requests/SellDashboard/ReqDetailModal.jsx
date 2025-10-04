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

    // Add images from request.images
    let y = 110;
    ["front", "side", "back"].forEach((key) => {
      if (request.images?.[key]) {
        docPDF.text(`${key} view:`, 10, y);
        docPDF.addImage(request.images[key], "JPEG", 50, y - 5, 60, 60);
        y += 70;
      }
    });

    docPDF.save(`Sell_Request_${request._id}.pdf`);
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Request Details</DialogTitle>
      <DialogContent>
        <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
          <CardContent>
            <Typography><strong>ID:</strong> {request._id}</Typography>
            <Typography><strong>Name:</strong> {request.name}</Typography>
            <Typography><strong>Contact:</strong> {request.contact}</Typography>
            <Typography>
              <strong>Location:</strong> {request.location?.lat}, {request.location?.lng}
            </Typography>
            <Typography><strong>Price:</strong> ₱{request.price}</Typography>
            <Typography><strong>Description:</strong> {request.description}</Typography>
          </CardContent>

          {/* Images Section */}
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Uploaded Images
            </Typography>
            <Grid container spacing={2}>
              {["front", "side", "back"].map(
                (key) =>
                  request.images?.[key] && (
                    <Grid item xs={12} sm={4} key={key}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={request.images[key]}
                        alt={`${key} view`}
                        sx={{ borderRadius: 2, objectFit: "cover" }}
                      />
                      <Typography align="center" variant="caption" color="text.secondary">
                        {key} view
                      </Typography>
                    </Grid>
                  )
              )}
            </Grid>
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

export default ReqDetailModal;
