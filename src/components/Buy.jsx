

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Container,
//   Box,
//   Typography,
//   TextField,
//   Grid,
//   Card,
//   CardMedia,
//   CardContent,
//   CardActions,
//   Button,
//   CircularProgress,
//   IconButton,
//   Menu,
//   MenuItem,
//   Tooltip,
//   Divider,
// } from "@mui/material";
// import toast from "react-hot-toast";
// import axios from "axios";
// import CartModal from "./Cart/CartModal";
// import { useAuth } from "../context/AuthContext";
// import FilterListIcon from "@mui/icons-material/FilterList";

// const Buy = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [items, setItems] = useState([]);
//   const [filteredItems, setFilteredItems] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [priceFilter, setPriceFilter] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState(""); // keeps same single-select design
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showCartModal, setShowCartModal] = useState(false);
//   const [userAddress, setUserAddress] = useState({});
//   const [filterAnchor, setFilterAnchor] = useState(null);

//   const API_URL = process.env.REACT_APP_API_URL;

//   const categories = [
//     "Table",
//     "Chair",
//     "Flooring",
//     "Cabinet",
//     "Post",
//     "Scraps",
//     "Stones",
//     "Windows",
//     "Bed",
//   ];

//   // ---- Helpers to support legacy + new category models ----
//   const getItemCategories = (item) => {
//     if (Array.isArray(item?.categories)) return item.categories;
//     if (item?.category) return [item.category];
//     return [];
//   };

//   const itemMatchesCategory = (item, selected) => {
//     if (!selected) return true; // "All"
//     const cats = getItemCategories(item);
//     return cats.some((c) => c && c.toLowerCase() === selected.toLowerCase());
//   };

//   // Fetch user address
//   useEffect(() => {
//     const fetchUserAddress = async () => {
//       if (!user?._id) return;
//       try {
//         const res = await axios.get(`${API_URL}/api/users/${user._id}/address`);
//         setUserAddress(res.data || {});
//       } catch (err) {
//         console.error("Failed to fetch address:", err);
//       }
//     };
//     fetchUserAddress();
//   }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Fetch items — keep only availability === true
//   useEffect(() => {
//     const fetchItems = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(`${API_URL}/api/items`);
//         const itemArray = Array.isArray(res.data) ? res.data : [];

//         // IMPORTANT: only include items with availability === true
//         const availableOnly = itemArray.filter(
//           (it) => it?.availability === true || it?.availability === "true"
//         );

//         setItems(availableOnly);
//         setFilteredItems(availableOnly);
//         setError(null);
//       } catch (err) {
//         console.error("Failed to fetch items:", err);
//         setError("Failed to load items.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchItems();
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   // Filter items (search + price + category) — ensure availability check preserved
//   useEffect(() => {
//     let filtered = items.filter(
//       (item) =>
//         item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.description?.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     // price filter
//     if (priceFilter === "low") {
//       filtered = filtered.filter((item) => item.price < 5000);
//     } else if (priceFilter === "mid") {
//       filtered = filtered.filter(
//         (item) => item.price >= 5000 && item.price <= 20000
//       );
//     } else if (priceFilter === "high") {
//       filtered = filtered.filter((item) => item.price > 20000);
//     }

//     // category filter (supports both string + array)
//     if (categoryFilter) {
//       filtered = filtered.filter((item) =>
//         itemMatchesCategory(item, categoryFilter)
//       );
//     }

//     // Final safety: enforce availability === true
//     filtered = filtered.filter(
//       (it) => it?.availability === true || it?.availability === "true"
//     );

//     setFilteredItems(filtered);
//   }, [searchQuery, priceFilter, categoryFilter, items]); // eslint-disable-line react-hooks/exhaustive-deps

//   const truncateText = (text, length) =>
//     text?.length > length ? text.substring(0, length) + "..." : text;

//   const handleAddToCart = async (itemId) => {
//     if (!user?._id) {
//       toast.error("Please log in to add items to cart.");
//       return;
//     }

//     // extra guard: confirm item is still available locally
//     const item = items.find((it) => it._id === itemId);
//     if (!item || (item.availability !== true && item.availability !== "true")) {
//       toast.error("Item is no longer available.");
//       // remove stale locally
//       setItems((prev) => prev.filter((it) => it._id !== itemId));
//       setFilteredItems((prev) => prev.filter((it) => it._id !== itemId));
//       return;
//     }

//     try {
//       await axios.post(`${API_URL}/api/cart/${user._id}/add`, { itemId });
//       toast.success("Item added to cart!");
//       window.dispatchEvent(new CustomEvent("cartUpdated", { detail: 1 }));
//       // do NOT set availability to false here — reservation happens on order confirm
//     } catch (err) {
//       console.error("Add to cart error:", err);
//       if (err?.response?.status === 409) {
//         toast.error("Item is no longer available.");
//         setItems((prev) => prev.filter((it) => it._id !== itemId));
//         setFilteredItems((prev) => prev.filter((it) => it._id !== itemId));
//       } else {
//         toast.error("Could not add item to cart.");
//       }
//     }
//   };

//   // Buy Now opens CartModal
//   const openCartModalForItem = (item) => {
//     if (!user?._id) {
//       toast.error("Please log in to proceed with purchase.");
//       return;
//     }

//     // guard availability
//     if (item?.availability !== true && item?.availability !== "true") {
//       toast.error("This item is no longer available.");
//       setItems((prev) => prev.filter((it) => it._id !== item._id));
//       setFilteredItems((prev) => prev.filter((it) => it._id !== item._id));
//       return;
//     }

//     setSelectedItem(item);
//     setShowCartModal(true);
//   };

//   // Card click navigates to BuyPage (/buy/:id)
//   const handleCardClick = (item) => {
//     if (!user?._id) {
//       toast.error("Please log in to proceed to the buy page.");
//       return;
//     }
//     // guard availability before navigating
//     if (item?.availability !== true && item?.availability !== "true") {
//       toast.error("This item is no longer available.");
//       setItems((prev) => prev.filter((it) => it._id !== item._id));
//       setFilteredItems((prev) => prev.filter((it) => it._id !== item._id));
//       return;
//     }
//     navigate(`/buy/${item._id}`);
//   };

//   /**
//    * handleOrderConfirm
//    * - Creates the order on the server.
//    * - Marks ordered item's availability=false (reservation finalized).
//    * - Removes the item locally (so it no longer shows).
//    */
//   // const handleOrderConfirm = async (address, notes) => {
//   //   if (!user?._id || !selectedItem) return;

//   //   try {
//   //     // 1) Create order
//   //     await axios.post(`${API_URL}/api/orders`, {
//   //       userId: user._id,
//   //       items: [selectedItem],
//   //       total: parseFloat(selectedItem.price),
//   //       address,
//   //       notes,
//   //     });

//   //     // 2) After order creation, set the item's availability to false on the item resource.
//   //     try {
//   //       await axios.put(`${API_URL}/api/items/${selectedItem._id}`, {
//   //         availability: false,
//   //       });
//   //     } catch (availErr) {
//   //       console.warn(
//   //         "Failed to update item availability to false after order:",
//   //         availErr
//   //       );
//   //     }

//   //     // 3) Remove the ordered item from local items/filter so UI stays consistent
//   //     setItems((prev) => prev.filter((it) => it._id !== selectedItem._id));
//   //     setFilteredItems((prev) => prev.filter((it) => it._id !== selectedItem._id));

//   //     // 4) Close modal and notify user
//   //     toast.success("Order placed successfully!");
//   //     setSelectedItem(null);
//   //     setShowCartModal(false);

//   //     // 5) Notify other parts of the app (e.g., cart badge) that cart changed
//   //     window.dispatchEvent(new CustomEvent("cartUpdated", { detail: -1 }));
//   //   } catch (err) {
//   //     console.error("Order failed:", err);

//   //     // If server says item was already unavailable / conflict
//   //     if (err?.response?.status === 409) {
//   //       toast.error("Order failed: item is no longer available.");
//   //       // remove locally to avoid showing unavailable item
//   //       setItems((prev) => prev.filter((it) => it._id !== selectedItem._id));
//   //       setFilteredItems((prev) => prev.filter((it) => it._id !== selectedItem._id));
//   //       setSelectedItem(null);
//   //       setShowCartModal(false);
//   //     } else {
//   //       toast.error("Failed to place order.");
//   //     }
//   //   }
//   // };

//   const handleOrderConfirm = async (address, notes) => {
//   if (!user?._id || !selectedItem) return;

//   const itemId = selectedItem._id || selectedItem.id;

//   try {
//     // 1) Create order
//     await axios.post(`${API_URL}/api/orders`, {
//       userId: user._id,
//       items: [selectedItem],
//       total: parseFloat(selectedItem.price),
//       address,
//       notes,
//     });

//     // 2) After order creation, set the item's availability to false on the item resource.
//     try {
//       await axios.put(`${API_URL}/api/items/${itemId}`, {
//         availability: false,
//       });
//     } catch (availErr) {
//       console.warn(
//         "Failed to update item availability to false after order:",
//         availErr
//       );
//       // proceed — we'll still attempt to remove the item from carts and update UI
//     }

//     // 3) Remove the ordered item from ALL carts (so other users' carts no longer reference it)
//     try {
//       // Endpoint from your router: DELETE /api/carts/remove-item/:itemId
//       await axios.delete(`${API_URL}/api/carts/remove-item/${itemId}`);
//     } catch (removeErr) {
//       console.warn("Failed to remove ordered item from all carts:", removeErr);
//       // proceed — we still update local UI to hide the item
//     }

//     // 4) Remove the ordered item from local items/filter so UI stays consistent
//     setItems((prev) => prev.filter((it) => (it._id || it.id) !== itemId));
//     setFilteredItems((prev) => prev.filter((it) => (it._id || it.id) !== itemId));

//     // 5) Close modal and notify user
//     toast.success("Order placed successfully!");
//     setSelectedItem(null);
//     setShowCartModal(false);

//     // 6) Notify other parts of the app (e.g., cart badge) that cart changed
//     // You may want to send a more explicit payload, but keeping your existing behavior.
//     window.dispatchEvent(new CustomEvent("cartUpdated", { detail: -1 }));
//   } catch (err) {
//     console.error("Order failed:", err);

//     // If server says item was already unavailable / conflict
//     if (err?.response?.status === 409) {
//       toast.error("Order failed: item is no longer available.");
//       // remove locally to avoid showing unavailable item
//       setItems((prev) => prev.filter((it) => (it._id || it.id) !== itemId));
//       setFilteredItems((prev) => prev.filter((it) => (it._id || it.id) !== itemId));
//       setSelectedItem(null);
//       setShowCartModal(false);
//     } else {
//       toast.error("Failed to place order.");
//     }
//   }
// };


//   const handleFilterOpen = (event) => {
//     setFilterAnchor(event.currentTarget);
//   };

//   const handleFilterClose = () => {
//     setFilterAnchor(null);
//   };

//   // Render label for category on the card (supports multiple)
//   const renderCategoryLabel = (item) => {
//     const cats = getItemCategories(item);
//     if (cats.length) return cats.join(", ");
//     return item?.category || "Uncategorized";
//   };

//   // Close modal helper — clears selected item too
//   const closeCartModal = () => {
//     setShowCartModal(false);
//     setSelectedItem(null);
//   };

//   return (
//     <Container maxWidth={false} disableGutters sx={{ minHeight: "100vh", p: 3 }}>
//       {/* Header */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 3,
//           gap: 1,
//         }}
//       >
//         <Typography variant="h4" fontWeight="bold">
//           Antique Shop
//         </Typography>

//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           <TextField
//             size="small"
//             variant="outlined"
//             label="Search items..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             sx={{ width: 250 }}
//           />
//           <Tooltip title="Filter by Price / Category">
//             <IconButton onClick={handleFilterOpen}>
//               <FilterListIcon />
//             </IconButton>
//           </Tooltip>
//           <Menu
//             anchorEl={filterAnchor}
//             open={Boolean(filterAnchor)}
//             onClose={handleFilterClose}
//           >
//             <MenuItem disabled>Filter by Price</MenuItem>
//             <MenuItem onClick={() => setPriceFilter("")}>All</MenuItem>
//             <MenuItem onClick={() => setPriceFilter("low")}>Below ₱5,000</MenuItem>
//             <MenuItem onClick={() => setPriceFilter("mid")}>₱5,000 – ₱20,000</MenuItem>
//             <MenuItem onClick={() => setPriceFilter("high")}>Above ₱20,000</MenuItem>
//             <Divider />
//             <MenuItem disabled>Filter by Category</MenuItem>
//             <MenuItem onClick={() => setCategoryFilter("")}>All</MenuItem>
//             {categories.map((cat) => (
//               <MenuItem
//                 key={cat}
//                 onClick={() => setCategoryFilter(cat)}
//                 sx={{
//                   fontWeight: categoryFilter === cat ? "bold" : "normal",
//                   bgcolor: categoryFilter === cat ? "grey.700" : "inherit",
//                   color:
//                     categoryFilter === cat ? "primary.contrastText" : "inherit",
//                 }}
//               >
//                 {cat}
//               </MenuItem>
//             ))}
//           </Menu>
//         </Box>
//       </Box>

//       {/* Error */}
//       {error && (
//         <Typography color="error" sx={{ mb: 2 }}>
//           {error}
//         </Typography>
//       )}

//       {/* Loading */}
//       {loading && <CircularProgress sx={{ mb: 2 }} />}

//       {/* Items Grid */}
//       <Grid container spacing={2} justifyContent="center">
//         {!loading && filteredItems.length > 0 ? (
//           filteredItems.map((item) => (
//             <Grid item key={item._id}>
//               <Card
//                 sx={{
//                   width: "300px",
//                   borderRadius: 2,
//                   boxShadow: 3,
//                   height: "100%",
//                   display: "flex",
//                   flexDirection: "column",
//                   cursor: "pointer",
//                 }}
//                 onClick={() => handleCardClick(item)}
//               >
//                 <CardMedia
//                   component="img"
//                   height="200"
//                   image={
//                     Array.isArray(item.images) && item.images.length > 0
//                       ? item.images[0]
//                       : "placeholder.jpg"
//                   }
//                   alt={item.name}
//                   onError={(e) => (e.target.src = "placeholder.jpg")}
//                   sx={{ borderRadius: "8px 8px 0 0" }}
//                 />
//                 <CardContent sx={{ flexGrow: 1 }}>
//                   <Typography variant="h6" fontSize="1rem" fontWeight="bold">
//                     {item.name}
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     color="text.secondary"
//                     sx={{
//                       whiteSpace: "nowrap",
//                       overflow: "hidden",
//                       textOverflow: "ellipsis",
//                     }}
//                   >
//                     {truncateText(item.description, 50)}
//                   </Typography>
//                   <Typography
//                     variant="body1"
//                     fontWeight="bold"
//                     color="text.primary"
//                     sx={{ mt: 1 }}
//                   >
//                     ₱{item.price}
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     {renderCategoryLabel(item)}
//                   </Typography>
//                 </CardContent>
//                 <CardActions>
//                   <Button
//                     size="small"
//                     variant="contained"
//                     sx={{
//                       backgroundColor: "#272626ff",
//                       color: "white",
//                       "&:hover": { backgroundColor: "grey.800" },
//                     }}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       openCartModalForItem(item);
//                     }}
//                     disabled={item?.availability !== true && item?.availability !== "true"}
//                   >
//                     Buy Now
//                   </Button>
//                   <Button
//                     size="small"
//                     variant="outlined"
//                     color="dark"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleAddToCart(item._id);
//                     }}
//                     disabled={item?.availability !== true && item?.availability !== "true"}
//                   >
//                     Add to Cart
//                   </Button>
//                 </CardActions>
//               </Card>
//             </Grid>
//           ))
//         ) : !loading ? (
//           <Typography color="error">⚠️ No items available.</Typography>
//         ) : null}
//       </Grid>

//       {/* Cart Modal */}
//       {selectedItem && (
//         <CartModal
//           show={showCartModal}
//           onClose={closeCartModal}
//           onConfirm={handleOrderConfirm}
//           user={user}
//           totalPrice={selectedItem.price}
//           selectedItems={[selectedItem]}
//           defaultAddress={userAddress}
//           setShowModal={setShowCartModal}
//           setSelectedItems={() => setSelectedItem(null)}
//           setCartItems={() => {}}
//           setCartCount={() => {}}
//         />
//       )}
//     </Container>
//   );
// };

// export default Buy;


// //=======================================================================================
// //THE CODE BELOW IS FOR ADD TO CART > AVAILABILITY OF ITEM = "FALSE"

// // import React, { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import {
// //   Container,
// //   Box,
// //   Typography,
// //   TextField,
// //   Grid,
// //   Card,
// //   CardMedia,
// //   CardContent,
// //   CardActions,
// //   Button,
// //   CircularProgress,
// //   IconButton,
// //   Menu,
// //   MenuItem,
// //   Tooltip,
// //   Divider,
// // } from "@mui/material";
// // import toast from "react-hot-toast";
// // import axios from "axios";
// // import CartModal from "./Cart/CartModal";
// // import { useAuth } from "../context/AuthContext";
// // import FilterListIcon from "@mui/icons-material/FilterList";

// // const Buy = () => {
// //   const { user } = useAuth();
// //   const navigate = useNavigate();

// //   const [items, setItems] = useState([]);
// //   const [filteredItems, setFilteredItems] = useState([]);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [priceFilter, setPriceFilter] = useState("");
// //   const [categoryFilter, setCategoryFilter] = useState(""); // keeps same single-select design
// //   const [error, setError] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const [selectedItem, setSelectedItem] = useState(null);
// //   const [showCartModal, setShowCartModal] = useState(false);
// //   const [userAddress, setUserAddress] = useState({});
// //   const [filterAnchor, setFilterAnchor] = useState(null);

// //   const API_URL = process.env.REACT_APP_API_URL;

// //   const categories = [
// //     "Table",
// //     "Chair",
// //     "Flooring",
// //     "Cabinet",
// //     "Post",
// //     "Scraps",
// //     "Stones",
// //     "Windows",
// //     "Bed",
// //     // You can add "Uncategorized" if you want a visible option in the UI
// //   ];

// //   // ---- Helpers to support legacy + new category models ----
// //   const getItemCategories = (item) => {
// //     if (Array.isArray(item?.categories)) return item.categories;
// //     if (item?.category) return [item.category];
// //     return [];
// //   };

// //   const itemMatchesCategory = (item, selected) => {
// //     if (!selected) return true; // "All"
// //     const cats = getItemCategories(item);
// //     return cats.some((c) => c && c.toLowerCase() === selected.toLowerCase());
// //   };

// //   // Fetch user address
// //   useEffect(() => {
// //     const fetchUserAddress = async () => {
// //       if (!user?._id) return;
// //       try {
// //         const res = await axios.get(`${API_URL}/api/users/${user._id}/address`);
// //         setUserAddress(res.data || {});
// //       } catch (err) {
// //         console.error("Failed to fetch address:", err);
// //       }
// //     };
// //     fetchUserAddress();
// //   }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

// //   // Fetch items (only keep availability === true)
// //   useEffect(() => {
// //     const fetchItems = async () => {
// //       setLoading(true);
// //       try {
// //         const res = await axios.get(`${API_URL}/api/items`);
// //         const itemArray = Array.isArray(res.data) ? res.data : [];
// //         // Only include items where availability === true (explicit)
// //         const availableOnly = itemArray.filter((it) => it?.availability === true);
// //         setItems(availableOnly);
// //         setFilteredItems(availableOnly);
// //         setError(null);
// //       } catch (err) {
// //         console.error("Failed to fetch items:", err);
// //         setError("Failed to load items.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchItems();
// //   }, []); // eslint-disable-line react-hooks/exhaustive-deps

// //   // Filter items (search + price + category) — ensure we keep availability check
// //   useEffect(() => {
// //     let filtered = items.filter(
// //       (item) =>
// //         (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //           item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
// //     );

// //     // price filter
// //     if (priceFilter === "low") {
// //       filtered = filtered.filter((item) => item.price < 5000);
// //     } else if (priceFilter === "mid") {
// //       filtered = filtered.filter(
// //         (item) => item.price >= 5000 && item.price <= 20000
// //       );
// //     } else if (priceFilter === "high") {
// //       filtered = filtered.filter((item) => item.price > 20000);
// //     }

// //     // category filter (now supports both string + array)
// //     if (categoryFilter) {
// //       filtered = filtered.filter((item) =>
// //         itemMatchesCategory(item, categoryFilter)
// //       );
// //     }

// //     // final safety: ensure only availability === true are shown (in case items changes)
// //     filtered = filtered.filter((item) => item?.availability === true);

// //     setFilteredItems(filtered);
// //   }, [searchQuery, priceFilter, categoryFilter, items]); // eslint-disable-line react-hooks/exhaustive-deps

// //   const truncateText = (text, length) =>
// //     text?.length > length ? text.substring(0, length) + "..." : text;

// //   const handleAddToCart = async (itemId) => {
// //     if (!user?._id) {
// //       toast.error("Please log in to add items to cart.");
// //       return;
// //     }
// //     try {
// //       await axios.post(`${API_URL}/api/cart/${user._id}/add`, { itemId });
// //       toast.success("Item added to cart!");
// //       window.dispatchEvent(new CustomEvent("cartUpdated", { detail: 1 }));
// //       // Optionally remove the item from local state since it's reserved now
// //       // (If your API sets availability=false on add, refetch or remove locally)
// //       setItems((prev) => prev.filter((it) => it._id !== itemId));
// //       setFilteredItems((prev) => prev.filter((it) => it._id !== itemId));
// //     } catch (err) {
// //       console.error("Add to cart error:", err);
// //       // if backend returns 409 for unavailable, show message:
// //       if (err?.response?.status === 409) {
// //         toast.error("Item is no longer available.");
// //         // remove locally to keep UI consistent
// //         setItems((prev) => prev.filter((it) => it._id !== itemId));
// //         setFilteredItems((prev) => prev.filter((it) => it._id !== itemId));
// //       } else {
// //         toast.error("Could not add item to cart.");
// //       }
// //     }
// //   };

// //   // Buy Now opens CartModal
// //   const openCartModalForItem = (item) => {
// //     if (!user?._id) {
// //       toast.error("Please log in to proceed with purchase.");
// //       return;
// //     }
// //     // double-check availability before opening
// //     if (item?.availability !== true) {
// //       toast.error("This item is no longer available.");
// //       // remove locally if stale
// //       setItems((prev) => prev.filter((it) => it._id !== item._id));
// //       setFilteredItems((prev) => prev.filter((it) => it._id !== item._id));
// //       return;
// //     }
// //     setSelectedItem(item);
// //     setShowCartModal(true);
// //   };

// //   // Card click navigates to BuyPage (/buy/:id)
// //   const handleCardClick = (item) => {
// //     // If you want non-logged-in users to view the buy page, remove this check.
// //     if (!user?._id) {
// //       toast.error("Please log in to proceed to the buy page.");
// //       return;
// //     }
// //     // If item is no longer available, prevent navigation
// //     if (item?.availability !== true) {
// //       toast.error("This item is no longer available.");
// //       setItems((prev) => prev.filter((it) => it._id !== item._id));
// //       setFilteredItems((prev) => prev.filter((it) => it._id !== item._id));
// //       return;
// //     }
// //     navigate(`/buy/${item._id}`);
// //   };

// //   const handleOrderConfirm = async (address, notes) => {
// //     if (!user?._id || !selectedItem) return;
// //     try {
// //       await axios.post(`${API_URL}/api/orders`, {
// //         userId: user._id,
// //         items: [selectedItem],
// //         total: parseFloat(selectedItem.price),
// //         address,
// //         notes,
// //       });
// //       toast.success("Order placed successfully!");
// //       setSelectedItem(null);
// //       setShowCartModal(false);
// //       // remove item locally after order
// //       setItems((prev) => prev.filter((it) => it._id !== selectedItem._id));
// //       setFilteredItems((prev) => prev.filter((it) => it._id !== selectedItem._id));
// //     } catch (err) {
// //       console.error("Order failed:", err);
// //       toast.error("Failed to place order.");
// //     }
// //   };

// //   const handleFilterOpen = (event) => {
// //     setFilterAnchor(event.currentTarget);
// //   };

// //   const handleFilterClose = () => {
// //     setFilterAnchor(null);
// //   };

// //   // Render label for category on the card (supports multiple)
// //   const renderCategoryLabel = (item) => {
// //     const cats = getItemCategories(item);
// //     if (cats.length) return cats.join(", ");
// //     return item?.category || "Uncategorized";
// //   };

// //   // Close modal helper — clears selected item too
// //   const closeCartModal = () => {
// //     setShowCartModal(false);
// //     setSelectedItem(null);
// //   };

// //   return (
// //     <Container maxWidth={false} disableGutters sx={{ minHeight: "100vh", p: 3 }}>
// //       {/* Header */}
// //       <Box
// //         sx={{
// //           display: "flex",
// //           justifyContent: "space-between",
// //           alignItems: "center",
// //           mb: 3,
// //           gap: 1,
// //         }}
// //       >
// //         <Typography variant="h4" fontWeight="bold">
// //           Antique Shop
// //         </Typography>

// //         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
// //           <TextField
// //             size="small"
// //             variant="outlined"
// //             label="Search items..."
// //             value={searchQuery}
// //             onChange={(e) => setSearchQuery(e.target.value)}
// //             sx={{ width: 250 }}
// //           />
// //           <Tooltip title="Filter by Price / Category">
// //             <IconButton onClick={handleFilterOpen}>
// //               <FilterListIcon />
// //             </IconButton>
// //           </Tooltip>
// //           <Menu
// //             anchorEl={filterAnchor}
// //             open={Boolean(filterAnchor)}
// //             onClose={handleFilterClose}
// //           >
// //             <MenuItem disabled>Filter by Price</MenuItem>
// //             <MenuItem onClick={() => setPriceFilter("")}>All</MenuItem>
// //             <MenuItem onClick={() => setPriceFilter("low")}>Below ₱5,000</MenuItem>
// //             <MenuItem onClick={() => setPriceFilter("mid")}>₱5,000 – ₱20,000</MenuItem>
// //             <MenuItem onClick={() => setPriceFilter("high")}>Above ₱20,000</MenuItem>
// //             <Divider />
// //             <MenuItem disabled>Filter by Category</MenuItem>
// //             <MenuItem onClick={() => setCategoryFilter("")}>All</MenuItem>
// //             {categories.map((cat) => (
// //               <MenuItem
// //                 key={cat}
// //                 onClick={() => setCategoryFilter(cat)}
// //                 sx={{
// //                   fontWeight: categoryFilter === cat ? "bold" : "normal",
// //                   bgcolor: categoryFilter === cat ? "grey.700" : "inherit",
// //                   color:
// //                     categoryFilter === cat ? "primary.contrastText" : "inherit",
// //                 }}
// //               >
// //                 {cat}
// //               </MenuItem>
// //             ))}
// //           </Menu>
// //         </Box>
// //       </Box>

// //       {/* Error */}
// //       {error && (
// //         <Typography color="error" sx={{ mb: 2 }}>
// //           {error}
// //         </Typography>
// //       )}

// //       {/* Loading */}
// //       {loading && <CircularProgress sx={{ mb: 2 }} />}

// //       {/* Items Grid */}
// //       <Grid container spacing={2} justifyContent="center">
// //         {!loading && filteredItems.length > 0 ? (
// //           filteredItems.map((item) => (
// //             <Grid item key={item._id}>
// //               <Card
// //                 sx={{
// //                   width: "300px",
// //                   borderRadius: 2,
// //                   boxShadow: 3,
// //                   height: "100%",
// //                   display: "flex",
// //                   flexDirection: "column",
// //                   cursor: "pointer",
// //                 }}
// //                 onClick={() => handleCardClick(item)} // clicking card navigates to /buy/:id
// //               >
// //                 <CardMedia
// //                   component="img"
// //                   height="200"
// //                   image={
// //                     Array.isArray(item.images) && item.images.length > 0
// //                       ? item.images[0]
// //                       : "placeholder.jpg"
// //                   }
// //                   alt={item.name}
// //                   onError={(e) => (e.target.src = "placeholder.jpg")}
// //                   sx={{ borderRadius: "8px 8px 0 0" }}
// //                 />
// //                 <CardContent sx={{ flexGrow: 1 }}>
// //                   <Typography variant="h6" fontSize="1rem" fontWeight="bold">
// //                     {item.name}
// //                   </Typography>
// //                   <Typography
// //                     variant="body2"
// //                     color="text.secondary"
// //                     sx={{
// //                       whiteSpace: "nowrap",
// //                       overflow: "hidden",
// //                       textOverflow: "ellipsis",
// //                     }}
// //                   >
// //                     {truncateText(item.description, 50)}
// //                   </Typography>
// //                   <Typography
// //                     variant="body1"
// //                     fontWeight="bold"
// //                     color="text.primary"
// //                     sx={{ mt: 1 }}
// //                   >
// //                     ₱{item.price}
// //                   </Typography>
// //                   <Typography variant="caption" color="text.secondary">
// //                     {renderCategoryLabel(item)}
// //                   </Typography>
// //                 </CardContent>
// //                 <CardActions>
// //                   <Button
// //                     size="small"
// //                     variant="contained"
// //                     sx={{
// //                       backgroundColor: "#272626ff",
// //                       color: "white",
// //                       "&:hover": { backgroundColor: "grey.800" },
// //                     }}
// //                     onClick={(e) => {
// //                       e.stopPropagation();
// //                       openCartModalForItem(item); // Buy Now opens CartModal
// //                     }}
// //                     disabled={item?.availability !== true}
// //                   >
// //                     Buy Now
// //                   </Button>
// //                   <Button
// //                     size="small"
// //                     variant="outlined"
// //                     color="dark"
// //                     onClick={(e) => {
// //                       e.stopPropagation();
// //                       handleAddToCart(item._id);
// //                     }}
// //                     disabled={item?.availability !== true}
// //                   >
// //                     Add to Cart
// //                   </Button>
// //                 </CardActions>
// //               </Card>
// //             </Grid>
// //           ))
// //         ) : !loading ? (
// //           <Typography color="error">⚠️ No items available.</Typography>
// //         ) : null}
// //       </Grid>

// //       {/* Cart Modal */}
// //       {selectedItem && (
// //         <CartModal
// //           show={showCartModal}
// //           onClose={closeCartModal}
// //           onConfirm={handleOrderConfirm}
// //           user={user}
// //           totalPrice={selectedItem.price}
// //           selectedItems={[selectedItem]}
// //           defaultAddress={userAddress}
// //           setShowModal={setShowCartModal}
// //           setSelectedItems={() => setSelectedItem(null)}
// //           setCartItems={() => {}}
// //           setCartCount={() => {}}
// //         />
// //       )}
// //     </Container>
// //   );
// // };

// // export default Buy;
  

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
} from "@mui/material";
import toast from "react-hot-toast";
import axios from "axios";
import CartModal from "./Cart/CartModal";
import { useAuth } from "../context/AuthContext";
import FilterListIcon from "@mui/icons-material/FilterList";

const Buy = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // keeps same single-select design
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [userAddress, setUserAddress] = useState({});
  const [filterAnchor, setFilterAnchor] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  const categories = [
    "Table",
    "Chair",
    "Flooring",
    "Cabinet",
    "Post",
    "Scraps",
    "Stones",
    "Windows",
    "Bed",
  ];

  // ---- Helpers to support legacy + new category models ----
  const getItemCategories = (item) => {
    if (Array.isArray(item?.categories)) return item.categories;
    if (item?.category) return [item.category];
    return [];
  };

  const itemMatchesCategory = (item, selected) => {
    if (!selected) return true; // "All"
    const cats = getItemCategories(item);
    return cats.some((c) => c && c.toLowerCase() === selected.toLowerCase());
  };

  // Fetch user address
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(`${API_URL}/api/users/${user._id}/address`);
        setUserAddress(res.data || {});
      } catch (err) {
        console.error("Failed to fetch address:", err);
      }
    };
    fetchUserAddress();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch items — keep only availability === true
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/items`);
        const itemArray = Array.isArray(res.data) ? res.data : [];

        // IMPORTANT: only include items with availability === true
        const availableOnly = itemArray.filter(
          (it) => it?.availability === true || it?.availability === "true"
        );

        setItems(availableOnly);
        setFilteredItems(availableOnly);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch items:", err);
        setError("Failed to load items.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter items (search + price + category) — ensure availability check preserved
  useEffect(() => {
    let filtered = items.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // price filter
    if (priceFilter === "low") {
      filtered = filtered.filter((item) => item.price < 5000);
    } else if (priceFilter === "mid") {
      filtered = filtered.filter(
        (item) => item.price >= 5000 && item.price <= 20000
      );
    } else if (priceFilter === "high") {
      filtered = filtered.filter((item) => item.price > 20000);
    }

    // category filter (supports both string + array)
    if (categoryFilter) {
      filtered = filtered.filter((item) =>
        itemMatchesCategory(item, categoryFilter)
      );
    }

    // Final safety: enforce availability === true
    filtered = filtered.filter(
      (it) => it?.availability === true || it?.availability === "true"
    );

    setFilteredItems(filtered);
  }, [searchQuery, priceFilter, categoryFilter, items]); // eslint-disable-line react-hooks/exhaustive-deps

  const truncateText = (text, length) =>
    text?.length > length ? text.substring(0, length) + "..." : text;

  const handleAddToCart = async (itemId) => {
    if (!user?._id) {
      toast.error("Please log in to add items to cart.");
      return;
    }

    // extra guard: confirm item is still available locally
    const item = items.find((it) => it._id === itemId);
    if (!item || (item.availability !== true && item.availability !== "true")) {
      toast.error("Item is no longer available.");
      // remove stale locally
      setItems((prev) => prev.filter((it) => it._id !== itemId));
      setFilteredItems((prev) => prev.filter((it) => it._id !== itemId));
      return;
    }

    try {
      await axios.post(`${API_URL}/api/cart/${user._id}/add`, { itemId });
      toast.success("Item added to cart!");
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: 1 }));
      // do NOT set availability to false here — reservation happens on order confirm
    } catch (err) {
      console.error("Add to cart error:", err);
      if (err?.response?.status === 409) {
        toast.error("Item is no longer available.");
        setItems((prev) => prev.filter((it) => it._id !== itemId));
        setFilteredItems((prev) => prev.filter((it) => it._id !== itemId));
      } else {
        toast.error("Could not add item to cart.");
      }
    }
  };

  // Buy Now opens CartModal
  const openCartModalForItem = (item) => {
    if (!user?._id) {
      toast.error("Please log in to proceed with purchase.");
      return;
    }

    // guard availability
    if (item?.availability !== true && item?.availability !== "true") {
      toast.error("This item is no longer available.");
      setItems((prev) => prev.filter((it) => it._id !== item._id));
      setFilteredItems((prev) => prev.filter((it) => it._id !== item._id));
      return;
    }

    setSelectedItem(item);
    setShowCartModal(true);
  };

  // Card click navigates to BuyPage (/buy/:id)
  const handleCardClick = (item) => {
    if (!user?._id) {
      toast.error("Please log in to proceed to the buy page.");
      return;
    }
    // guard availability before navigating
    if (item?.availability !== true && item?.availability !== "true") {
      toast.error("This item is no longer available.");
      setItems((prev) => prev.filter((it) => it._id !== item._id));
      setFilteredItems((prev) => prev.filter((it) => it._id !== item._id));
      return;
    }
    navigate(`/buy/${item._id}`);
  };

  /**
   * handleOrderConfirm (used for Buy-Now flows)
   * - Accepts same signature as CartModal's delegated onConfirm (address, notes, selectedItems)
   * - Returns a Promise and throws/rejects on failure so CartModal can surface errors
   */
  const handleOrderConfirm = async (address = {}, notes = "", itemsToOrder = []) => {
    if (!user?._id) throw new Error("User not authenticated.");
    // If itemsToOrder provided by CartModal, use that, otherwise fallback to selectedItem
    const orderItems = (itemsToOrder && itemsToOrder.length > 0) ? itemsToOrder : selectedItem ? [selectedItem] : [];
    if (orderItems.length === 0) throw new Error("No items to order.");

    const item = orderItems[0];
    const itemId = item._id || item.id;

    try {
      // 1) Create order
      await axios.post(`${API_URL}/api/orders`, {
        userId: user._id,
        items: orderItems,
        total: parseFloat(item.price),
        address,
        notes,
      });

      // 2) After order creation, set the item's availability to false on the item resource.
      try {
        await axios.put(`${API_URL}/api/items/${itemId}`, {
          availability: false,
        });
      } catch (availErr) {
        console.warn(
          "Failed to update item availability to false after order:",
          availErr
        );
        // proceed — we'll still attempt to remove the item from carts and update UI
      }

      // 3) Remove the ordered item from ALL carts (so other users' carts no longer reference it)
      try {
        // Endpoint from your router: DELETE /api/carts/remove-item/:itemId
        await axios.delete(`${API_URL}/api/carts/remove-item/${itemId}`);
      } catch (removeErr) {
        console.warn("Failed to remove ordered item from all carts:", removeErr);
        // proceed — we still update local UI to hide the item
      }

      // 4) Remove the ordered item from local items/filter so UI stays consistent
      setItems((prev) => prev.filter((it) => (it._id || it.id) !== itemId));
      setFilteredItems((prev) => prev.filter((it) => (it._id || it.id) !== itemId));

      // 5) Close modal and notify user
      toast.success("Order placed successfully!");
      setSelectedItem(null);
      setShowCartModal(false);

      // 6) Notify other parts of the app (e.g., cart badge) that cart changed
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: -1 }));

      // resolve successfully (CartModal will do additional UI cleanup)
      return;
    } catch (err) {
      console.error("Order failed:", err);

      // If server says item was already unavailable / conflict
      if (err?.response?.status === 409) {
        // remove locally to avoid showing unavailable item
        setItems((prev) => prev.filter((it) => (it._id || it.id) !== itemId));
        setFilteredItems((prev) => prev.filter((it) => (it._id || it.id) !== itemId));
        setSelectedItem(null);
        setShowCartModal(false);
        throw new Error("Order failed: item is no longer available.");
      } else {
        throw new Error(err?.response?.data?.message || "Failed to place order.");
      }
    }
  };

  const handleFilterOpen = (event) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  // Render label for category on the card (supports multiple)
  const renderCategoryLabel = (item) => {
    const cats = getItemCategories(item);
    if (cats.length) return cats.join(", ");
    return item?.category || "Uncategorized";
  };

  // Close modal helper — clears selected item too
  const closeCartModal = () => {
    setShowCartModal(false);
    setSelectedItem(null);
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 1,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Antique Shop
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            size="small"
            variant="outlined"
            label="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 250 }}
          />
          <Tooltip title="Filter by Price / Category">
            <IconButton onClick={handleFilterOpen}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={handleFilterClose}
          >
            <MenuItem disabled>Filter by Price</MenuItem>
            <MenuItem onClick={() => setPriceFilter("")}>All</MenuItem>
            <MenuItem onClick={() => setPriceFilter("low")}>Below ₱5,000</MenuItem>
            <MenuItem onClick={() => setPriceFilter("mid")}>₱5,000 – ₱20,000</MenuItem>
            <MenuItem onClick={() => setPriceFilter("high")}>Above ₱20,000</MenuItem>
            <Divider />
            <MenuItem disabled>Filter by Category</MenuItem>
            <MenuItem onClick={() => setCategoryFilter("")}>All</MenuItem>
            {categories.map((cat) => (
              <MenuItem
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                sx={{
                  fontWeight: categoryFilter === cat ? "bold" : "normal",
                  bgcolor: categoryFilter === cat ? "grey.700" : "inherit",
                  color:
                    categoryFilter === cat ? "primary.contrastText" : "inherit",
                }}
              >
                {cat}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Loading */}
      {loading && <CircularProgress sx={{ mb: 2 }} />}

      {/* Items Grid */}
      <Grid container spacing={2} justifyContent="center">
        {!loading && filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Grid item key={item._id}>
              <Card
                sx={{
                  width: "300px",
                  borderRadius: 2,
                  boxShadow: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                }}
                onClick={() => handleCardClick(item)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    Array.isArray(item.images) && item.images.length > 0
                      ? item.images[0]
                      : "placeholder.jpg"
                  }
                  alt={item.name}
                  onError={(e) => (e.target.src = "placeholder.jpg")}
                  sx={{ borderRadius: "8px 8px 0 0" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontSize="1rem" fontWeight="bold">
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {truncateText(item.description, 50)}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mt: 1 }}
                  >
                    ₱{item.price}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {renderCategoryLabel(item)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      backgroundColor: "#272626ff",
                      color: "white",
                      "&:hover": { backgroundColor: "grey.800" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openCartModalForItem(item);
                    }}
                    disabled={item?.availability !== true && item?.availability !== "true"}
                  >
                    Buy Now
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="dark"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item._id);
                    }}
                    disabled={item?.availability !== true && item?.availability !== "true"}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : !loading ? (
          <Typography color="error">⚠️ No items available.</Typography>
        ) : null}
      </Grid>

      {/* Cart Modal */}
      {selectedItem && (
        <CartModal
          show={showCartModal}
          onClose={closeCartModal}
          onConfirm={handleOrderConfirm} // delegate Buy-now order creation to this function
          user={user}
          totalPrice={selectedItem.price}
          selectedItems={[selectedItem]}
          defaultAddress={userAddress}
          setShowModal={setShowCartModal}
          setSelectedItems={() => setSelectedItem(null)}
          setCartItems={() => {}}
          setCartCount={() => {}}
        />
      )}
    </Container>
  );
};

export default Buy;
