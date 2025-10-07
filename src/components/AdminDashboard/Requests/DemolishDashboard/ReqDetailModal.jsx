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

const ReqDetailModalDemolish = ({ request, onClose }) => {
  const handleDownloadPDF = () => {
    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text("Demolish Request Details", 10, 20);
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
            <Typography>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: request.status === "scheduled" || request.status === "ocular_scheduled"
                    ? "green"
                    : request.status === "declined"
                    ? "red"
                    : "orange",
                  fontWeight: "bold"
                }}
              >
                {request.status || "pending"}
              </span>
            </Typography>
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
                        {key.charAt(0).toUpperCase() + key.slice(1)} view
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

export default ReqDetailModalDemolish;
