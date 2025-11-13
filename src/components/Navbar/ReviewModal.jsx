// import React, { useState, useEffect } from "react";
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

// export default function ReviewModal({ open, onClose }) {
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

//       // Use env var if provided, otherwise relative path (works with create-react-app proxy or same-origin).
//       const base = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/$/, "") : "";
//       const url = base ? `${base}/api/reviews` : `/api/reviews`;

//       const token = localStorage.getItem("token");
//       const headers = {
//         "Content-Type": "application/json",
//       };
//       if (token) headers.Authorization = `Bearer ${token}`;

//       await axios.post(
//         url,
//         {
//           rating,
//           feedback,
//         },
//         {
//           headers,
//         }
//       );

//       toast.success("Thank you — your review was submitted!");
//       onClose?.();
//       // reset
//       setRating(0);
//       setHover(-1);
//       setFeedback("");
//     } catch (err) {
//       // show server message if available, otherwise fallback
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

// ReviewModal.jsx
import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

export default function ReviewModal({ open, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(-1);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // normalize env var (remove trailing slash) or fallback to empty string (same-origin)
  const API_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/\/$/, "")
    : "";

  useEffect(() => {
    if (!open) {
      setRating(0);
      setHover(-1);
      setFeedback("");
      setSubmitting(false);
    }
  }, [open]);

  const handleStarClick = (value) => setRating(value);
  const handleStarHover = (value) => setHover(value);
  const handleStarLeave = () => setHover(-1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error("Please select at least one star.");
      return;
    }

    // include userId if present, but do NOT require it
    const userId = localStorage.getItem("userId");

    try {
      setSubmitting(true);

      const url = `${API_URL}/api/reviews`; // if API_URL === "" -> relative path /api/reviews
      const payload = { rating, feedback };
      if (userId) payload.userId = userId;

      // DEBUG: helps confirm where the request goes (remove in production)
      // eslint-disable-next-line no-console
      console.info("Submitting review to:", url, "payload:", payload);

      // No Authorization header sent (authMiddleware removed on server)
      await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // optional: create notification only if your backend supports it
      // sending without Authorization; wrapped in try/catch so notification failure
      // doesn't block the main flow.
      try {
        if (API_URL) {
          await axios.post(
            `${API_URL}/api/notifications`,
            {
              userId: userId || null,
              message: `New customer review submitted.`,
              status: "unread",
              for: "review",
              role: "admin",
              read: false,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      } catch (notifErr) {
        // don't fail submission if notification POST fails
        // eslint-disable-next-line no-console
        console.warn("Notifications POST failed:", notifErr?.response?.data || notifErr.message);
      }

      toast.success("Thank you — your review has been submitted!");

      setRating(0);
      setHover(-1);
      setFeedback("");
      onClose?.();
    } catch (err) {
      // better error parsing
      // eslint-disable-next-line no-console
      console.error("Review submit failed:", err?.response?.data || err.message || err);

      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
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
