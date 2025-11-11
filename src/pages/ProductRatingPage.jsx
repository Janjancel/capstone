import React, { useState } from "react";
import { Box, Typography, Button, Rating, TextField } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const ProductRatingPage = () => {
  const { orderId, productId } = useParams();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async () => {
    if (rating === null || rating < 0 || rating > 5) {
      toast.error('Please select a rating between 0 and 5.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await Swal.fire({
        title: 'Submit Rating?',
        text: 'Are you sure you want to submit this rating?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, submit',
        cancelButtonText: 'Cancel',
      });
      if (!result.isConfirmed) {
        setSubmitting(false);
        return;
      }
      await axios.post(`${API_URL}/api/product-ratings`, {
        order: orderId,
        product: productId,
        rating,
        review,
      });
      setSuccess(true);
      toast.success('Rating submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto" mt={6} p={3} boxShadow={3} borderRadius={2} bgcolor="background.paper">
      <Typography variant="h4" gutterBottom>Rate Product</Typography>
      <Typography variant="body1" gutterBottom>How would you rate this product?</Typography>
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
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={submitting || rating === null}>
          Submit Rating
        </Button>
      </Box>
      {success && <Typography color="success.main" sx={{ mt: 2 }}>Thank you for your rating!</Typography>}
    </Box>
  );
};

export default ProductRatingPage;
