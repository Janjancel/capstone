
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   CircularProgress,
//   Rating,
//   Button,
//   IconButton,
//   Menu,
//   MenuItem,
//   Tooltip,
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

//   const API_URL = process.env.REACT_APP_API_URL;

//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");
//         const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

//         const res = await axios.get(`${API_URL}/api/reviews`, config);
//         const data = Array.isArray(res.data) ? res.data : [];

//         // Fetch user emails to resolve user information
//         let userMap = {};
//         try {
//           const usersRes = await axios.get(`${API_URL}/api/users`, config);
//           const users = Array.isArray(usersRes.data) ? usersRes.data : [];
//           users.forEach((u) => {
//             if (u && u._id) userMap[String(u._id)] = u;
//           });
//         } catch (userErr) {
//           console.warn("Could not fetch users:", userErr?.message);
//           // not critical — continue with available data
//         }

//         // Enrich reviews with user info
//         const enriched = data.map((r) => ({
//           ...r,
//           userEmail:
//             (r.userId && userMap[String(r.userId)] && userMap[String(r.userId)].email) ||
//             r.userEmail ||
//             "N/A",
//           userName:
//             (r.userId && userMap[String(r.userId)] && userMap[String(r.userId)].name) ||
//             r.userName ||
//             "Anonymous",
//         }));

//         // Sort by newest first
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

//   const handleDelete = async (reviewId) => {
//     handleMenuClose();

//     // SweetAlert2 confirmation
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

//       // NOTE: backend must support DELETE /api/reviews/:id
//       await axios.delete(`${API_URL}/api/reviews/${reviewId}`, config);

//       // Remove locally for immediate UX
//       setReviews((prev) => prev.filter((r) => r._id !== reviewId));

//       toast.success("Review deleted.");
//     } catch (err) {
//       console.error("Failed to delete review:", err);
//       setError("Failed to delete review. Try again or check server support for DELETE /api/reviews/:id");
//       toast.error("Failed to delete review.");
//     }
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
//         <Typography variant="h4" sx={{ fontWeight: "bold" }}>
//           Customer Reviews
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
//         <Box sx={{ p: 2, bgcolor: "#fff3cd", borderRadius: 1 }}>
//           <Typography color="error">{error}</Typography>
//         </Box>
//       ) : reviews.length === 0 ? (
//         <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 1, textAlign: "center" }}>
//           <Typography color="textSecondary">No reviews yet.</Typography>
//         </Box>
//       ) : (
//         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 2 }}>
//           {reviews
//             .filter((review) => filterRating === null || review.rating === filterRating)
//             .map((review) => (
//               <Card key={review._id} sx={{ boxShadow: 1 }}>
//                 <CardContent>
//                   <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
//                     <Box>
//                       <Typography variant="caption" color="textSecondary">
//                         {review.userEmail}
//                       </Typography>
//                     </Box>

//                     {/* Date + three-dots action */}
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                       <Typography variant="caption" color="textSecondary">
//                         {formatDate(review.createdAt)}
//                       </Typography>

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
//                     </Box>
//                   </Box>

//                   <Box sx={{ mb: 2 }}>
//                     <Rating value={review.rating} readOnly />
//                   </Box>

//                   <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
//                     {review.feedback || "No feedback provided."}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             ))}

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
//             {/* add more actions here if needed in future */}
//           </Menu>
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default Reviews;


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   CircularProgress,
//   Rating,
//   Button,
//   IconButton,
//   Menu,
//   MenuItem,
//   Tooltip,
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

//   const API_URL = process.env.REACT_APP_API_URL;

//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");
//         const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

//         const res = await axios.get(`${API_URL}/api/reviews`, config);
//         const data = Array.isArray(res.data) ? res.data : [];

//         // Fetch user emails to resolve user information
//         let userMap = {};
//         try {
//           const usersRes = await axios.get(`${API_URL}/api/users`, config);
//           const users = Array.isArray(usersRes.data) ? usersRes.data : [];
//           users.forEach((u) => {
//             if (u && u._id) userMap[String(u._id)] = u;
//           });
//         } catch (userErr) {
//           console.warn("Could not fetch users:", userErr?.message);
//           // not critical — continue with available data
//         }

//         // Enrich reviews with user info
//         const enriched = data.map((r) => ({
//           ...r,
//           userEmail:
//             (r.userId && userMap[String(r.userId)] && userMap[String(r.userId)].email) ||
//             r.userEmail ||
//             "N/A",
//           userName:
//             (r.userId && userMap[String(r.userId)] && userMap[String(r.userId)].name) ||
//             r.userName ||
//             "Anonymous",
//         }));

//         // Sort by newest first
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
//    * - For owner deletion, this will attempt to include the current user's id as a query param.
//    * - For admin deletion, include the x-admin header in localStorage (if your app sets it) or the token will be used.
//    */
//   const handleDelete = async (reviewId) => {
//     handleMenuClose();

//     // SweetAlert2 confirmation
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

//       // Try to determine current user id if available in localStorage (common pattern)
//       let currentUserId = null;
//       try {
//         const rawUser = localStorage.getItem("user");
//         if (rawUser) {
//           const parsed = JSON.parse(rawUser);
//           if (parsed && parsed._id) currentUserId = parsed._id;
//         }
//         if (!currentUserId) {
//           // fallback to older pattern
//           const alt = localStorage.getItem("userId");
//           if (alt) currentUserId = alt;
//         }
//       } catch {
//         currentUserId = null;
//       }

//       // Build URL: include ?userId=... if we have currentUserId (this tells backend it's an owner delete)
//       let url = `${API_URL}/api/reviews/${reviewId}`;
//       if (currentUserId) url += `?userId=${encodeURIComponent(currentUserId)}`;

//       // Send delete request. Backend supports query param userId for owner deletion.
//       const res = await axios.delete(url, config);

//       // Remove locally for immediate UX
//       setReviews((prev) => prev.filter((r) => r._id !== reviewId));

//       toast.success(res?.data?.message || "Review deleted.");
//     } catch (err) {
//       console.error("Failed to delete review:", err);
//       const serverMessage =
//         err?.response?.data?.message ||
//         err?.message ||
//         "Failed to delete review. Try again or check server support for DELETE /api/reviews/:id";
//       setError(serverMessage);
//       toast.error(serverMessage);
//     }
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
//         <Typography variant="h4" sx={{ fontWeight: "bold" }}>
//           Customer Reviews
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
//         <Box sx={{ p: 2, bgcolor: "#fff3cd", borderRadius: 1 }}>
//           <Typography color="error">{error}</Typography>
//         </Box>
//       ) : reviews.length === 0 ? (
//         <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 1, textAlign: "center" }}>
//           <Typography color="textSecondary">No reviews yet.</Typography>
//         </Box>
//       ) : (
//         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 2 }}>
//           {reviews
//             .filter((review) => filterRating === null || review.rating === filterRating)
//             .map((review) => (
//               <Card key={review._id} sx={{ boxShadow: 1 }}>
//                 <CardContent>
//                   <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
//                     <Box>
//                       <Typography variant="caption" color="textSecondary">
//                         {review.userEmail}
//                       </Typography>
//                     </Box>

//                     {/* Date + three-dots action */}
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                       <Typography variant="caption" color="textSecondary">
//                         {formatDate(review.createdAt)}
//                       </Typography>

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
//                     </Box>
//                   </Box>

//                   <Box sx={{ mb: 2 }}>
//                     <Rating value={review.rating} readOnly />
//                   </Box>

//                   <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
//                     {review.feedback || "No feedback provided."}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             ))}

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
//             {/* add more actions here if needed in future */}
//           </Menu>
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default Reviews;

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Rating,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
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
            r.userName ||
            "Anonymous",
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
                      <Typography variant="caption" color="textSecondary">
                        {review.userEmail}
                      </Typography>
                    </Box>

                    {/* Date + three-dots action */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(review.createdAt)}
                      </Typography>

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
                    </Box>
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
            {/* add more actions here if needed in future */}
          </Menu>
        </Box>
      )}
    </Box>
  );
};

export default Reviews;
