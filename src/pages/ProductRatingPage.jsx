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

// ProductRatingPage
// - Improved API base discovery (env, known host, relative)
// - Tries both /api/product-ratings and /product-ratings endpoints
// - Better validation, error handling & UX feedback
// - Keeps original props (orderId, productId) from useParams

const ProductRatingPage = () => {
  const { orderId, productId } = useParams();

  // rating can be number (1-5) or null while the user hasn't chosen anything
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // API base candidates: env -> known deployed host seen in logs -> relative
  const ENV_API = process.env.REACT_APP_API_URL || null;
  const FALLBACK_HOST = "https://capstone-backend-k4uu.onrender.com";
  const API_BASES = [ENV_API, FALLBACK_HOST, ""].filter((b) => b !== null && b !== undefined);

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

  const buildCandidateUrls = (base) => {
    const b = base.replace(/\/$/, "");
    return [`${b}/api/product-ratings`, `${b}/product-ratings`].map((u) => (u.startsWith("https://") || u.startsWith("http://") || u.startsWith("/") ? u : u));
  };

  const handleSubmit = async () => {
    // validation: require a rating
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

    // Try each base and each candidate endpoint until one succeeds or all fail
    for (const base of API_BASES) {
      const candidates = buildCandidateUrls(base);
      for (const url of candidates) {
        try {
          // Make a POST request. If base is empty and url begins with "/", axios will use relative URL.
          await axios.post(url, payload, { headers });
          setSuccess(true);
          toast.success("Rating submitted successfully!");
          setSubmitting(false);
          return;
        } catch (err) {
          lastError = err;
          const status = err?.response?.status;
          // If server returned a non-404 error, stop trying and surface the message
          if (status && status !== 404) {
            const serverMessage = err.response?.data?.error || err.response?.data?.message || err.response?.statusText;
            const friendly = serverMessage || `Server returned ${status}`;
            toast.error(`Failed to submit rating: ${friendly}`);
            console.error("Rating submit error (not 404)", { url, status, serverMessage, err });
            setSubmitting(false);
            return;
          }

          // if 404 or network-level error, try next candidate
          console.warn("Rating endpoint candidate failed (will try next)", { url, status, message: err.message });
        }
      }
    }

    // if we get here everything failed
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
