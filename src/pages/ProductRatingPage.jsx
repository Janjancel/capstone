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


import React, { useState } from "react";
import { Box, Typography, Button, Rating, TextField } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

/**
 * ProductRatingPage
 * - Tries absolute backend host first to avoid hitting frontend dev server (which can return 405).
 * - Handles 404 and 405 specially with helpful messages.
 * - Preserves original behavior (orderId/productId from useParams, optional auth/user id).
 */

const ProductRatingPage = () => {
  const { orderId, productId } = useParams();

  // rating: null while not chosen, otherwise number 1-5
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Candidate API bases (order matters): env -> known deployed host -> browser origin -> relative (last resort)
  const ENV_API = process.env.REACT_APP_API_URL || null;
  const FALLBACK_HOST = "https://capstone-backend-k4uu.onrender.com";
  // browser origin is useful if backend is served from same host as frontend in some deployments
  const ORIGIN = typeof window !== "undefined" ? window.location.origin : null;

  // Build ordered list of bases, skip null/undefined
  const API_BASES = [
    ENV_API,          // if provided (e.g. https://api.example.com)
    FALLBACK_HOST,    // explicit Render host you saw in logs
    ORIGIN,           // same-origin deployments
    ""                // empty -> relative paths; try last to avoid hitting frontend server
  ].filter((b, i, arr) => b !== null && b !== undefined);

  // Helper: for a given base, return candidate URLs.
  // If base is empty string, produce relative paths (to try last).
  const buildCandidateUrls = (base) => {
    if (base === "") {
      // relative paths (last-resort)
      return ["/api/product-ratings", "/product-ratings"];
    }
    // ensure no trailing slash
    const trimmed = base.replace(/\/$/, "");
    return [`${trimmed}/api/product-ratings`, `${trimmed}/product-ratings`];
  };

  const getStoredUserId = () => {
    try {
      const rawUser = localStorage.getItem("user") || localStorage.getItem("userData");
      if (!rawUser) return null;
      const parsed = JSON.parse(rawUser);
      if (!parsed) return null;
      if (typeof parsed === "string") return parsed;
      return parsed?.id || parsed?._id || parsed?.userId || null;
    } catch (err) {
      return null;
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("authToken") || null;
  };

  const handleSubmit = async () => {
    if (rating === null || typeof rating !== "number" || rating < 0 || rating > 5) {
      toast.error("Please select a rating between 0 and 5.");
      return;
    }

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

    let lastError = null;

    // Try each base in order (absolute bases first), each with two candidate paths
    for (const base of API_BASES) {
      const candidates = buildCandidateUrls(base);
      for (const url of candidates) {
        try {
          // POST JSON (axios will set Content-Type: application/json)
          await axios.post(url, payload, { headers });
          setSuccess(true);
          toast.success("Rating submitted successfully!");
          setSubmitting(false);
          return;
        } catch (err) {
          lastError = err;
          const status = err?.response?.status;

          // Special handling for 405: method not allowed
          if (status === 405) {
            // 405 often means the route exists but doesn't accept POST (or CORS/preflight blocked)
            toast.error(
              "Method not allowed (405). The backend may not accept POST at this path — check the backend route and CORS settings."
            );
            console.error("Rating submit 405 — check backend route and CORS. Details:", {
              triedUrl: url,
              status,
              serverData: err.response?.data,
              err,
            });
            setSubmitting(false);
            return;
          }

          // If server returned a non-404 error (and not 405), stop trying and show message
          if (status && status !== 404) {
            const serverMessage = err.response?.data?.error || err.response?.data?.message || err.response?.statusText;
            const friendly = serverMessage || `Server returned ${status}`;
            toast.error(`Failed to submit rating: ${friendly}`);
            console.error("Rating submit error (not 404/405)", { url, status, serverMessage, err });
            setSubmitting(false);
            return;
          }

          // else status === 404 or network-level error -> try next candidate
          console.warn("Rating endpoint candidate failed (will try next)", {
            triedUrl: url,
            status,
            message: err.message,
          });
        }
      }
    }

    // Exhausted all candidates
    if (lastError) {
      const status = lastError?.response?.status;
      const dataMsg = lastError?.response?.data?.error || lastError?.response?.data?.message;
      if (status === 404) {
        toast.error("Rating endpoint not found (404). Please verify the backend route or API URL.");
      } else if (status) {
        toast.error(`Server returned ${status}: ${dataMsg || lastError.message}`);
      } else {
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
