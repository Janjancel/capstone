import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Card, CardContent, CircularProgress, Rating, Button } from "@mui/material";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRating, setFilterRating] = useState(null); // null = show all

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const res = await axios.get(`${API_URL}/api/reviews`, config);
        const data = Array.isArray(res.data) ? res.data : [];

        // Fetch user emails to resolve user information
        let userMap = {};
        try {
          const usersRes = await axios.get(`${API_URL}/api/users`, config);
          const users = Array.isArray(usersRes.data) ? usersRes.data : [];
          users.forEach((u) => {
            if (u && u._id) userMap[String(u._id)] = u;
          });
        } catch (userErr) {
          console.warn("Could not fetch users:", userErr?.message);
        }

        // Enrich reviews with user info
        const enriched = data.map((r) => ({
          ...r,
        //   userName: (r.userId && userMap[String(r.userId)] && userMap[String(r.userId)].name) || "Anonymous",
          userEmail: (r.userId && userMap[String(r.userId)] && userMap[String(r.userId)].email) || r.userEmail || "N/A",
        }));

        // Sort by newest first
        const sorted = enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReviews(sorted);
        setError(null);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [API_URL]);

  const formatDate = (d) => {
    if (!d) return "Unknown date";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Customer Reviews
        </Typography>
        
        {/* Star Filter */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: "500" }}>
            Filter by stars:
          </Typography>
          <Button
            variant={filterRating === null ? "contained" : "outlined"}
            size="small"
            onClick={() => setFilterRating(null)}
            sx={{ minWidth: "50px" }}
          >
            All
          </Button>
          {[5, 4, 3, 2, 1].map((star) => (
            <Button
              key={star}
              variant={filterRating === star ? "contained" : "outlined"}
              size="small"
              onClick={() => setFilterRating(star)}
              sx={{ minWidth: "50px" }}
            >
              {star}★
            </Button>
          ))}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, bgcolor: "#fff3cd", borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : reviews.length === 0 ? (
        <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 1, textAlign: "center" }}>
          <Typography color="textSecondary">No reviews yet.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 2 }}>
          {reviews
            .filter((review) => filterRating === null || review.rating === filterRating)
            .map((review) => (
            <Card key={review._id} sx={{ boxShadow: 1 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {review.userName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {review.userEmail}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {formatDate(review.createdAt)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Rating value={review.rating} readOnly />
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {review.feedback || "No feedback provided."}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Reviews;
