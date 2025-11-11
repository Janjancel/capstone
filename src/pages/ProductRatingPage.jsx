// import React, { useState } from "react";
// import { Box, Typography, Button, Rating, TextField } from "@mui/material";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import Swal from 'sweetalert2';
// import toast from 'react-hot-toast';

// const ProductRatingPage = () => {
//   const { orderId, productId } = useParams();
//   const [rating, setRating] = useState(0);
//   const [review, setReview] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const API_URL = process.env.REACT_APP_API_URL;

//   const handleSubmit = async () => {
//     if (rating === null || rating < 0 || rating > 5) {
//       toast.error('Please select a rating between 0 and 5.');
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const result = await Swal.fire({
//         title: 'Submit Rating?',
//         text: 'Are you sure you want to submit this rating?',
//         icon: 'question',
//         showCancelButton: true,
//         confirmButtonText: 'Yes, submit',
//         cancelButtonText: 'Cancel',
//       });
//       if (!result.isConfirmed) {
//         setSubmitting(false);
//         return;
//       }
//       await axios.post(`${API_URL}/api/product-ratings`, {
//         order: orderId,
//         product: productId,
//         rating,
//         review,
//       });
//       setSuccess(true);
//       toast.success('Rating submitted successfully!');
//     } catch (err) {
//       toast.error('Failed to submit rating.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Box maxWidth={500} mx="auto" mt={6} p={3} boxShadow={3} borderRadius={2} bgcolor="background.paper">
//       <Typography variant="h4" gutterBottom>Rate Product</Typography>
//       <Typography variant="body1" gutterBottom>How would you rate this product?</Typography>
//       <Rating
//         name="product-rating"
//         value={rating}
//         onChange={(e, newValue) => setRating(newValue)}
//         precision={1}
//         max={5}
//       />
//       <TextField
//         label="Review (optional)"
//         multiline
//         rows={3}
//         fullWidth
//         variant="outlined"
//         value={review}
//         onChange={(e) => setReview(e.target.value)}
//         sx={{ mt: 2 }}
//       />
//       <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
//         <Button variant="contained" color="primary" onClick={handleSubmit} disabled={submitting || rating === null}>
//           Submit Rating
//         </Button>
//       </Box>
//       {success && <Typography color="success.main" sx={{ mt: 2 }}>Thank you for your rating!</Typography>}
//     </Box>
//   );
// };

// export default ProductRatingPage;


// src/pages/ProductRatingPage.jsx
import React, { useState } from "react";
import { Box, Typography, Button, Rating, TextField } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const ProductRatingPage = () => {
  const { orderId, productId } = useParams();
  // rating can be number or null for MUI Rating
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Primary source for API URL is environment variable.
  // Fallbacks: explicitly try the common backend hostname used in your logs,
  // and finally default to empty string (which makes axios use relative URLs).
  const ENV_API = process.env.REACT_APP_API_URL || null;
  const FALLBACK_HOST = "https://capstone-backend-k4uu.onrender.com";
  const API_BASES = [
    ENV_API, // might be undefined in some envs
    FALLBACK_HOST,
    "", // relative (for dev when proxy is used)
  ].filter(Boolean);

  // Try to extract user id and token (if stored)
  // Adjust keys if your app stores these under different names.
  const getStoredUserId = () => {
    try {
      // common patterns: localStorage 'user' as JSON, or 'userData'
      const rawUser = localStorage.getItem("user") || localStorage.getItem("userData");
      if (!rawUser) return null;
      const parsed = JSON.parse(rawUser);
      // if parsed is a plain id string:
      if (typeof parsed === "string") return parsed;
      // try common fields
      return parsed?.id || parsed?._id || null;
    } catch (err) {
      return null;
    }
  };

  const getAuthToken = () => {
    // common token keys
    return localStorage.getItem("token") || localStorage.getItem("authToken") || null;
  };

  const handleSubmit = async () => {
    // Basic validation
    if (rating === null || typeof rating !== "number" || rating < 0 || rating > 5) {
      toast.error("Please select a rating between 0 and 5.");
      return;
    }

    // Confirm with the user
    const confirmation = await Swal.fire({
      title: "Submit Rating?",
      text: "Are you sure you want to submit this rating?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, submit",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    setSubmitting(true);

    // Build payload
    const payload = {
      order: orderId,
      product: productId,
      rating,
      review,
    };

    const userId = getStoredUserId();
    if (userId) payload.user = userId;

    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Attempt to post to likely endpoints. If first returns 404, try fallback.
    // This avoids failing immediately when backend route has a slightly different base.
    let lastError = null;
    for (const base of API_BASES) {
      // prefer explicit /api path first as your backend logs show /api/product-ratings
      const candidateUrls = [
        `${base.replace(/\/$/, "")}/api/product-ratings`,
        `${base.replace(/\/$/, "")}/product-ratings`,
      ];
      for (const url of candidateUrls) {
        // if base is "", url becomes "/api/product-ratings" which is fine (relative)
        try {
          await axios.post(url, payload, { headers });
          setSuccess(true);
          toast.success("Rating submitted successfully!");
          setSubmitting(false);
          return;
        } catch (err) {
          lastError = err;
          // If 404, we'll try the next candidate; otherwise, break early for other errors.
          const status = err?.response?.status;
          if (status && status !== 404) {
            // Non-404 -> likely validation/auth error. Show helpful message and stop trying.
            const serverMessage =
              err.response?.data?.error || err.response?.data?.message || err.response?.statusText;
            toast.error(`Failed to submit rating: ${serverMessage || "Server error"}`);
            setSubmitting(false);
            return;
          }
          // else status === 404 or no status (network) -> continue trying other endpoints
        }
      }
    }

    // If we exhausted options:
    if (lastError) {
      // If server responded, give a bit more info
      const status = lastError?.response?.status;
      const dataMsg = lastError?.response?.data?.error || lastError?.response?.data?.message;
      if (status === 404) {
        toast.error(
          "Rating endpoint not found (404). Please check the backend route or API base URL."
        );
      } else if (status) {
        toast.error(`Server returned ${status}: ${dataMsg || lastError.message}`);
      } else {
        // network / CORS / other
        toast.error(`Network error or server unreachable: ${lastError.message}`);
      }
    } else {
      toast.error("Failed to submit rating due to an unknown error.");
    }

    setSubmitting(false);
  };

  return (
    <Box
      maxWidth={500}
      mx="auto"
      mt={6}
      p={3}
      boxShadow={3}
      borderRadius={2}
      bgcolor="background.paper"
    >
      <Typography variant="h4" gutterBottom>
        Rate Product
      </Typography>
      <Typography variant="body1" gutterBottom>
        How would you rate this product?
      </Typography>

      <Rating
        name="product-rating"
        value={rating}
        onChange={(e, newValue) => setRating(newValue)}
        precision={1}
        max={5}
      />

      <TextField
        label="Review (optional)"
        multiline
        rows={3}
        fullWidth
        variant="outlined"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        sx={{ mt: 2 }}
      />

      <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting || rating === null}
        >
          {submitting ? "Submitting..." : "Submit Rating"}
        </Button>
      </Box>

      {success && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          Thank you for your rating!
        </Typography>
      )}
    </Box>
  );
};

export default ProductRatingPage;
