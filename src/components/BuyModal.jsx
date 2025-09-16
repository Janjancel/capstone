// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Typography,
//   Button,
//   TextField,
//   Box,
// } from "@mui/material";

// const BuyModal = ({ open, onClose, item, onConfirm, userAddress }) => {
//   const [notes, setNotes] = useState("");

//   const handleConfirm = () => {
//     onConfirm(userAddress, notes);
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle>{item.name}</DialogTitle>
//       <DialogContent>
//         <Box sx={{ textAlign: "center", mb: 2 }}>
//           <img
//             src={item.image || "placeholder.jpg"}
//             alt={item.name}
//             style={{ width: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "8px" }}
//             onError={(e) => (e.target.src = "placeholder.jpg")}
//           />
//         </Box>
//         <Typography variant="body1" gutterBottom>
//           {item.description}
//         </Typography>
//         <Typography variant="h6" fontWeight="bold" gutterBottom>
//           ₱{item.price}
//         </Typography>
//         {item.origin && (
//           <Typography variant="body2" gutterBottom>
//             Origin: {item.origin}
//           </Typography>
//         )}
//         {item.age && (
//           <Typography variant="body2" gutterBottom>
//             Age: {item.age}
//           </Typography>
//         )}
//         <TextField
//           label="Notes"
//           multiline
//           rows={3}
//           fullWidth
//           variant="outlined"
//           value={notes}
//           onChange={(e) => setNotes(e.target.value)}
//           sx={{ mt: 2 }}
//         />
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} variant="outlined">
//           Cancel
//         </Button>
//         <Button onClick={handleConfirm} variant="contained" color="primary">
//           Confirm Purchase
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default BuyModal;

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
  IconButton,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const BuyModal = ({ open, onClose, item, onConfirm, userAddress }) => {
  const [notes, setNotes] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleConfirm = () => {
    onConfirm(userAddress, notes);
  };

  const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : ["placeholder.jpg"];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item.name}</DialogTitle>
      <DialogContent>
        {/* Carousel */}
        <Box sx={{ position: "relative", textAlign: "center", mb: 2 }}>
          <img
            src={images[currentIndex]}
            alt={item.name}
            style={{
              width: "100%",
              maxHeight: "300px",
              objectFit: "contain",
              borderRadius: "8px",
            }}
            onError={(e) => (e.target.src = "placeholder.jpg")}
          />

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 10,
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                }}
              >
                <ArrowBackIos />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 10,
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              {images.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    mx: 0.5,
                    cursor: "pointer",
                    backgroundColor: currentIndex === index ? "primary.main" : "grey.400",
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Item Details */}
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
