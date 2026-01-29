
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Box,
//   Typography,
//   Card,
//   CircularProgress,
//   Rating,
//   Button,
//   IconButton,
//   Menu,
//   MenuItem,
//   Tooltip,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
// } from "@mui/material";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import Swal from "sweetalert2";
// import toast from "react-hot-toast";

// const Reviews = () => {
//   const [reviews, setReviews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filterRating, setFilterRating] = useState(null); // null = show all

//   // Menu state
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [selectedReviewId, setSelectedReviewId] = useState(null);

//   const API_URL = process.env.REACT_APP_API_URL || ""; // ensure defined

//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");
//         const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

//         // GET all reviews
//         const res = await axios.get(`${API_URL}/api/reviews`, config);
//         const data = Array.isArray(res.data) ? res.data : [];

//         // Attempt to fetch users to resolve emails/names (best-effort)
//         let userMap = {};
//         try {
//           const usersRes = await axios.get(`${API_URL}/api/users`, config);
//           const users = Array.isArray(usersRes.data) ? usersRes.data : [];
//           users.forEach((u) => {
//             if (u && u._id) userMap[String(u._id)] = u;
//           });
//         } catch (userErr) {
//           console.warn("Could not fetch users:", userErr?.message);
//         }

//         // Enrich and sort
//         const enriched = data.map((r) => ({
//           ...r,
//           userEmail:
//             (r.userId && userMap[String(r.userId)] && userMap[String(r.userId)].email) ||
//             r.userEmail ||
//             "N/A",
//           userName:
//             (r.userId && userMap[String(r.userId)] && userMap[String(r.userId)].name) ||
//             r.userName ,
//         }));

//         const sorted = enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//         setReviews(sorted);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching reviews:", err);
//         setError("Failed to load reviews.");
//         toast.error("Failed to load reviews.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReviews();
//   }, [API_URL]);

//   const formatDate = (d) => {
//     if (!d) return "Unknown date";
//     try {
//       return new Date(d).toLocaleDateString();
//     } catch {
//       return d;
//     }
//   };

//   // Menu handlers
//   const handleMenuOpen = (event, reviewId) => {
//     setAnchorEl(event.currentTarget);
//     setSelectedReviewId(reviewId);
//   };
//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     setSelectedReviewId(null);
//   };

//   /**
//    * Deletes a review.
//    * Backend is intentionally permissive: any user can delete any review by id.
//    */
//   const handleDelete = async (reviewId) => {
//     handleMenuClose();

//     const result = await Swal.fire({
//       title: "Delete review?",
//       text: "This action cannot be undone.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Delete",
//       cancelButtonText: "Cancel",
//       focusCancel: true,
//       confirmButtonColor: "#d33",
//     });

//     if (!result.isConfirmed) return;

//     try {
//       const token = localStorage.getItem("token");
//       const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

//       // Call permissive delete endpoint
//       const url = `${API_URL}/api/reviews/${reviewId}`;
//       const res = await axios.delete(url, config);

//       // Optimistic UI: remove item locally
//       setReviews((prev) => prev.filter((r) => r._id !== reviewId));

//       toast.success(res?.data?.message || "Review deleted.");
//     } catch (err) {
//       console.error("Failed to delete review:", err);
//       const serverMessage =
//         err?.response?.data?.message ||
//         err?.message ||
//         "Failed to delete review. Check server logs or permissions.";
//       setError(serverMessage);
//       toast.error(serverMessage);
//     }
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
//         <Typography variant="h4" sx={{ fontWeight: "bold" }}>
//           Customer Reviews for Unika Antika
//         </Typography>

//         {/* Star Filter */}
//         <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
//           <Typography variant="body2" sx={{ fontWeight: "500" }}>
//             Filter by stars:
//           </Typography>
//           <Button
//             variant={filterRating === null ? "contained" : "outlined"}
//             size="small"
//             onClick={() => setFilterRating(null)}
//             sx={{ minWidth: "50px" }}
//           >
//             All
//           </Button>
//           {[5, 4, 3, 2, 1].map((star) => (
//             <Button
//               key={star}
//               variant={filterRating === star ? "contained" : "outlined"}
//               size="small"
//               onClick={() => setFilterRating(star)}
//               sx={{ minWidth: "50px" }}
//             >
//               {star}★
//             </Button>
//           ))}
//         </Box>
//       </Box>

//       {loading ? (
//         <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
//           <CircularProgress />
//         </Box>
//       ) : error ? (
//         <Card sx={{ p: 2, bgcolor: "#fff3cd", borderRadius: 1 }}>
//           <Typography color="error">{error}</Typography>
//         </Card>
//       ) : reviews.length === 0 ? (
//         <Card sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 1, textAlign: "center" }}>
//           <Typography color="textSecondary">No reviews yet.</Typography>
//         </Card>
//       ) : (
//         <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
//           <Table>
//             <TableHead>
//               <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
//                 <TableCell sx={{ fontWeight: "bold", width: "20%" }}>Customer</TableCell>
//                 <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Rating</TableCell>
//                 <TableCell sx={{ fontWeight: "bold", width: "50%" }}>Feedback</TableCell>
//                 <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Date</TableCell>
//                 <TableCell sx={{ fontWeight: "bold", width: "5%", textAlign: "center" }}>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {reviews
//                 .filter((review) => filterRating === null || review.rating === filterRating)
//                 .map((review) => (
//                   <TableRow
//                     key={review._id}
//                     sx={{
//                       "&:hover": { backgroundColor: "#fafafa" },
//                       borderBottom: "1px solid #e0e0e0",
//                     }}
//                   >
//                     <TableCell sx={{ fontSize: "0.9rem" }}>
//                       <Box>
//                         <Typography variant="body2" sx={{ fontWeight: "500" }}>
//                           {review.userName}
//                         </Typography>
//                         <Typography variant="caption" color="textSecondary">
//                           {review.userEmail}
//                         </Typography>
//                       </Box>
//                     </TableCell>
//                     <TableCell>
//                       <Rating value={review.rating} readOnly size="small" />
//                       <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
//                         {review.rating} / 5
//                       </Typography>
//                     </TableCell>
//                     <TableCell sx={{ fontSize: "0.9rem", maxWidth: "400px" }}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           display: "-webkit-box",
//                           WebkitLineClamp: 2,
//                           WebkitBoxOrient: "vertical",
//                         }}
//                       >
//                         {review.feedback || "No feedback provided."}
//                       </Typography>
//                     </TableCell>
//                     <TableCell sx={{ fontSize: "0.9rem" }}>
//                       <Typography variant="caption">{formatDate(review.createdAt)}</Typography>
//                     </TableCell>
//                     <TableCell sx={{ textAlign: "center" }}>
//                       <Tooltip title="Actions">
//                         <IconButton
//                           size="small"
//                           onClick={(e) => handleMenuOpen(e, review._id)}
//                           aria-controls={anchorEl && selectedReviewId === review._id ? "review-menu" : undefined}
//                           aria-haspopup="true"
//                           aria-expanded={anchorEl && selectedReviewId === review._id ? "true" : undefined}
//                         >
//                           <MoreVertIcon fontSize="small" />
//                         </IconButton>
//                       </Tooltip>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//             </TableBody>
//           </Table>

//           {/* Menu is rendered once and anchored to the clicked button */}
//           <Menu
//             id="review-menu"
//             anchorEl={anchorEl}
//             open={Boolean(anchorEl)}
//             onClose={handleMenuClose}
//             anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//             transformOrigin={{ vertical: "top", horizontal: "right" }}
//           >
//             <MenuItem
//               onClick={() => {
//                 if (selectedReviewId) handleDelete(selectedReviewId);
//                 else handleMenuClose();
//               }}
//             >
//               Delete
//             </MenuItem>
//           </Menu>
//         </TableContainer>
//       )}
//     </Box>
//   );
// };

// export default Reviews;


// src/pages/Reviews.jsx (or wherever your Reviews component file is)
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Rating,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRating, setFilterRating] = useState(null); // null = show all

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || ""; // ensure defined

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        // GET all reviews
        const res = await axios.get(`${API_URL}/api/reviews`, config);
        const data = Array.isArray(res.data) ? res.data : [];

        // Attempt to fetch users to resolve emails/names (best-effort)
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

        // Enrich and sort
        const enriched = data.map((r) => ({
          ...r,
          userEmail:
            (r.userId && userMap[String(r.userId)] && userMap[String(r.userId)].email) ||
            r.userEmail ||
            "N/A",
          userName:
            (r.userId && userMap[String(r.userId)] && userMap[String(r.userId)].name) ||
            r.userName,
        }));

        const sorted = enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReviews(sorted);
        setError(null);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews.");
        toast.error("Failed to load reviews.");
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

  const formatCategory = (c) => {
    const v = String(c || "").trim();
    if (!v) return "—";
    if (v === "pricing") return "Pricing";
    if (v === "quality_of_items") return "Quality of Items";
    if (v === "service") return "Service";
    return v;
  };

  // Menu handlers
  const handleMenuOpen = (event, reviewId) => {
    setAnchorEl(event.currentTarget);
    setSelectedReviewId(reviewId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReviewId(null);
  };

  /**
   * Deletes a review.
   * Backend is intentionally permissive: any user can delete any review by id.
   */
  const handleDelete = async (reviewId) => {
    handleMenuClose();

    const result = await Swal.fire({
      title: "Delete review?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      focusCancel: true,
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      // Call permissive delete endpoint
      const url = `${API_URL}/api/reviews/${reviewId}`;
      const res = await axios.delete(url, config);

      // Optimistic UI: remove item locally
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));

      toast.success(res?.data?.message || "Review deleted.");
    } catch (err) {
      console.error("Failed to delete review:", err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete review. Check server logs or permissions.";
      setError(serverMessage);
      toast.error(serverMessage);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Customer Reviews for Unika Antika
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
        <Card sx={{ p: 2, bgcolor: "#fff3cd", borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Card>
      ) : reviews.length === 0 ? (
        <Card sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 1, textAlign: "center" }}>
          <Typography color="textSecondary">No reviews yet.</Typography>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", width: "18%" }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "12%" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "45%" }}>Feedback</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "12%" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "3%", textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews
                .filter((review) => filterRating === null || review.rating === filterRating)
                .map((review) => (
                  <TableRow
                    key={review._id}
                    sx={{
                      "&:hover": { backgroundColor: "#fafafa" },
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: "500" }}>
                          {review.userName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {review.userEmail}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                        {review.rating} / 5
                      </Typography>
                    </TableCell>

                    {/* ✅ NEW: Category */}
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <Typography variant="body2">{formatCategory(review.category)}</Typography>
                    </TableCell>

                    <TableCell sx={{ fontSize: "0.9rem", maxWidth: "400px" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {review.feedback || "No feedback provided."}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <Typography variant="caption">{formatDate(review.createdAt)}</Typography>
                    </TableCell>

                    <TableCell sx={{ textAlign: "center" }}>
                      <Tooltip title="Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, review._id)}
                          aria-controls={anchorEl && selectedReviewId === review._id ? "review-menu" : undefined}
                          aria-haspopup="true"
                          aria-expanded={anchorEl && selectedReviewId === review._id ? "true" : undefined}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Menu is rendered once and anchored to the clicked button */}
          <Menu
            id="review-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                if (selectedReviewId) handleDelete(selectedReviewId);
                else handleMenuClose();
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </TableContainer>
      )}
    </Box>
  );
};

export default Reviews;
