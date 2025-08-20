import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Box,
} from "@mui/material";

const BuyModal = ({ open, onClose, item, onConfirm, userAddress }) => {
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm(userAddress, notes);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <img
            src={item.image || "placeholder.jpg"}
            alt={item.name}
            style={{ width: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "8px" }}
            onError={(e) => (e.target.src = "placeholder.jpg")}
          />
        </Box>
        <Typography variant="body1" gutterBottom>
          {item.description}
        </Typography>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          ₱{item.price}
        </Typography>
        {item.origin && (
          <Typography variant="body2" gutterBottom>
            Origin: {item.origin}
          </Typography>
        )}
        {item.age && (
          <Typography variant="body2" gutterBottom>
            Age: {item.age}
          </Typography>
        )}
        <TextField
          label="Notes"
          multiline
          rows={3}
          fullWidth
          variant="outlined"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirm Purchase
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuyModal;
