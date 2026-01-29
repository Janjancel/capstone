
// import React, { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Typography,
//   Box,
//   TextField,
//   IconButton,
// } from "@mui/material";
// import { Star, StarBorder } from "@mui/icons-material";
// import axios from "axios";
// import toast from "react-hot-toast";

// export default function ReviewModal({ open, onClose, orderId = null }) {
//   const [rating, setRating] = useState(0); // 0-5
//   const [hover, setHover] = useState(-1);
//   const [feedback, setFeedback] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     if (!open) {
//       // reset when closed
//       setRating(0);
//       setHover(-1);
//       setFeedback("");
//       setSubmitting(false);
//     }
//   }, [open]);

//   const handleStarClick = (value) => {
//     setRating(value);
//   };
//   const handleStarHover = (value) => {
//     setHover(value);
//   };
//   const handleStarLeave = () => {
//     setHover(-1);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (rating < 1 || rating > 5) {
//       toast.error("Please select at least one star.");
//       return;
//     }

//     try {
//       setSubmitting(true);

//       // Standardized API base (remove trailing slash if present)
//       const API_URL = process.env.REACT_APP_API_URL
//         ? process.env.REACT_APP_API_URL.replace(/\/$/, "")
//         : "";
//       const url = API_URL ? `${API_URL}/api/reviews` : `/api/reviews`;

//       // Pull userId (your backend requires it in the schema)
//       const userId = localStorage.getItem("userId") || null;

//       const token = localStorage.getItem("token");
//       const headers = {
//         "Content-Type": "application/json",
//       };
//       if (token) headers.Authorization = `Bearer ${token}`;

//       const payload = {
//         rating,
//         feedback,
//         // include userId if available (backend schema requires it)
//         ...(userId ? { userId } : {}),
//         // include orderId if provided (helpful for linking review to order)
//         ...(orderId ? { orderId } : {}),
//       };

//       await axios.post(url, payload, { headers });

//       toast.success("Thank you — your review was submitted!");
//       onClose?.();
//       // reset
//       setRating(0);
//       setHover(-1);
//       setFeedback("");
//     } catch (err) {
//       // Improved error logging for easier debugging
//       console.error("Review submit failed. Request URL / response:", {
//         url:
//           (process.env.REACT_APP_API_URL
//             ? process.env.REACT_APP_API_URL.replace(/\/$/, "")
//             : "") + "/api/reviews",
//         error: err?.toJSON ? err.toJSON() : err,
//         response: err?.response?.data,
//         status: err?.response?.status,
//       });

//       // Show server message if available, otherwise fallback
//       const message =
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Failed to submit review. Please try again.";
//       toast.error(message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <form onSubmit={handleSubmit}>
//         <DialogTitle>Write a Review</DialogTitle>
//         <DialogContent>
//           <Box sx={{ py: 2 }}>
//             <Typography variant="body1" gutterBottom>
//               Please rate your experience and leave feedback for us.
//             </Typography>
//             <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <IconButton
//                   key={star}
//                   onClick={() => handleStarClick(star)}
//                   onMouseEnter={() => handleStarHover(star)}
//                   onMouseLeave={handleStarLeave}
//                   color="primary"
//                   size="large"
//                   aria-label={`${star} star`}
//                 >
//                   {((hover !== -1 ? hover : rating) >= star) ? <Star /> : <StarBorder />}
//                 </IconButton>
//               ))}
//               <Typography sx={{ ml: 2 }}>{rating} / 5</Typography>
//             </Box>
//             <TextField
//               label="Feedback (optional)"
//               multiline
//               rows={4}
//               fullWidth
//               value={feedback}
//               onChange={(e) => setFeedback(e.target.value)}
//               variant="outlined"
//               placeholder="Share your experience..."
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={onClose} color="secondary" variant="outlined" disabled={submitting}>
//             Cancel
//           </Button>
//           <Button
//             color="primary"
//             variant="contained"
//             type="submit"
//             disabled={submitting || rating < 1}
//           >
//             {submitting ? "Submitting..." : "Submit Review"}
//           </Button>
//         </DialogActions>
//       </form>
//     </Dialog>
//   );
// }


// src/components/ReviewModal.jsx  (or wherever your ReviewModal file is)
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

export default function ReviewModal({ open, onClose, orderId = null }) {
  const [category, setCategory] = useState("service");
  const [rating, setRating] = useState(0); // 0-5
  const [hover, setHover] = useState(-1);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      // reset when closed
      setCategory("service");
      setRating(0);
      setHover(-1);
      setFeedback("");
      setSubmitting(false);
    }
  }, [open]);

  const handleStarClick = (value) => {
    setRating(value);
  };
  const handleStarHover = (value) => {
    setHover(value);
  };
  const handleStarLeave = () => {
    setHover(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      toast.error("Please select a review category.");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please select at least one star.");
      return;
    }

    try {
      setSubmitting(true);

      // Standardized API base (remove trailing slash if present)
      const API_URL = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace(/\/$/, "")
        : "";
      const url = API_URL ? `${API_URL}/api/reviews` : `/api/reviews`;

      // Pull userId (your backend requires it in the schema)
      const userId = localStorage.getItem("userId") || null;

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const payload = {
        category, // ✅ NEW
        rating,
        feedback,
        // include userId if available (backend schema requires it)
        ...(userId ? { userId } : {}),
        // include orderId if provided (helpful for linking review to order)
        ...(orderId ? { orderId } : {}),
      };

      await axios.post(url, payload, { headers });

      toast.success("Thank you — your review was submitted!");
      onClose?.();
      // reset
      setCategory("service");
      setRating(0);
      setHover(-1);
      setFeedback("");
    } catch (err) {
      // Improved error logging for easier debugging
      console.error("Review submit failed. Request URL / response:", {
        url:
          (process.env.REACT_APP_API_URL
            ? process.env.REACT_app_API_URL.replace(/\/$/, "")
            : "") + "/api/reviews",
        error: err?.toJSON ? err.toJSON() : err,
        response: err?.response?.data,
        status: err?.response?.status,
      });

      // Show server message if available, otherwise fallback
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit review. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Please rate your experience and leave feedback for us.
            </Typography>

            {/* ✅ NEW: Category */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="review-category-label">Category</InputLabel>
              <Select
                labelId="review-category-label"
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="pricing">Pricing</MenuItem>
                <MenuItem value="quality_of_items">Quality of Items</MenuItem>
                <MenuItem value="service">Service</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconButton
                  key={star}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  color="primary"
                  size="large"
                  aria-label={`${star} star`}
                >
                  {(hover !== -1 ? hover : rating) >= star ? <Star /> : <StarBorder />}
                </IconButton>
              ))}
              <Typography sx={{ ml: 2 }}>{rating} / 5</Typography>
            </Box>

            <TextField
              label="Feedback (optional)"
              multiline
              rows={4}
              fullWidth
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              variant="outlined"
              placeholder="Share your experience..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="outlined" disabled={submitting}>
            Cancel
          </Button>
          <Button color="primary" variant="contained" type="submit" disabled={submitting || rating < 1}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
