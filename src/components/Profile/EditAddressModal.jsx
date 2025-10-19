

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const EditAddressModal = ({
  isEditing,
  setIsEditing,
  address,
  setAddress,
  handleSaveAddress,
  options,
  renderDropdown,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Safety check to make sure address is always an object
  const safeAddress = address || {
    region: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
    houseNo: "",
    zipCode: "",
  };

  const handleSave = () => {
    handleSaveAddress?.();
    setIsEditing(false); // hide modal
    setShowConfirmation(true); // show confirmation
  };

  return (
    <>
      <Dialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Edit Address</Typography>
            <IconButton aria-label="close" onClick={() => setIsEditing(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
            {renderDropdown("Region", "region", options.regions)}
            {renderDropdown("Province", "province", options.provinces)}
            {renderDropdown("City", "city", options.cities)}
            {renderDropdown("Barangay", "barangay", options.barangays)}

            <TextField
              label="Subdivision / Street"
              variant="outlined"
              fullWidth
              name="street"
              value={safeAddress.street}
              onChange={(e) =>
                setAddress({ ...safeAddress, street: e.target.value })
              }
            />

            <TextField
              label="House No."
              variant="outlined"
              fullWidth
              name="houseNo"
              value={safeAddress.houseNo}
              onChange={(e) =>
                setAddress({ ...safeAddress, houseNo: e.target.value })
              }
            />

            <TextField
              label="ZIP Code"
              variant="outlined"
              fullWidth
              name="zipCode"
              value={safeAddress.zipCode}
              onChange={(e) =>
                setAddress({ ...safeAddress, zipCode: e.target.value })
              }
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => setIsEditing(false)}
          >
            Close
          </Button>
          <Button variant="outlined" color="dark" onClick={handleSave}>
            Save Address
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showConfirmation}
        autoHideDuration={3000}
        onClose={() => setShowConfirmation(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowConfirmation(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Address saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditAddressModal;
