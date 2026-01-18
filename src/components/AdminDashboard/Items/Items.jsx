
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Button,
//   TextField,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   TableContainer,
//   Paper,
//   CircularProgress,
//   Box,
//   Menu,
//   MenuItem,
//   IconButton,
//   Select,
//   FormControl,
//   InputLabel,
//   Chip,
// } from "@mui/material";
// import { MoreVert } from "@mui/icons-material";
// import axios from "axios";
// import Swal from "sweetalert2";
// import toast, { Toaster } from "react-hot-toast";
// import EditItemModal from "./EditItemModal";
// import AddItemModal from "./AddItemModal";

// const Items = () => {
//   const [items, setItems] = useState([]);
//   const [allItems, setAllItems] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [newItem, setNewItem] = useState({
//     name: "",
//     description: "",
//     price: "",
//     condition: "", // 1-10
//     origin: "",
//     age: "",
//     category: "",
//     images: [],
//     quantity: 1,
//   });
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(false);

//   const [anchorEl, setAnchorEl] = useState(null);
//   const [menuItemId, setMenuItemId] = useState(null);

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

//   // UI filters
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [availabilityFilter, setAvailabilityFilter] = useState("available"); // default to available
//   const [searchTerm, setSearchTerm] = useState("");

//   // ----- Fetch items (memoized so effects can safely depend on it) -----
//   const fetchItems = useCallback(async () => {
//     setFetching(true);
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/items`
//       );
//       const data = Array.isArray(response.data) ? response.data : [];
//       setAllItems(data);
//       // apply current filters immediately
//       const filtered = data.filter((it) =>
//         matchesSearch(it, searchTerm) &&
//         matchesCategory(it, categoryFilter) &&
//         matchesAvailability(it, availabilityFilter)
//       );
//       setItems(filtered);
//     } catch (error) {
//       toast.error("Failed to fetch items");
//     } finally {
//       setFetching(false);
//     }
//   }, [
//     searchTerm,
//     categoryFilter,
//     availabilityFilter, // included so fetchItems applied filters instantly
//   ]);

//   useEffect(() => {
//     fetchItems();
//     // subscribe to global cart updates so admin list reflects items added to cart
//     const cartHandler = () => {
//       // Re-fetch to get authoritative availability state from server
//       fetchItems();
//     };
//     window.addEventListener("cartUpdated", cartHandler);
//     // also listen for item changes from other admin panels if you dispatch 'itemUpdated' with detail { itemId }
//     const itemUpdatedHandler = () => {
//       fetchItems();
//     };
//     window.addEventListener("itemUpdated", itemUpdatedHandler);

//     return () => {
//       window.removeEventListener("cartUpdated", cartHandler);
//       window.removeEventListener("itemUpdated", itemUpdatedHandler);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // run once on mount

//   // ----- Helpers for mixed category model (string vs array) -----
//   const itemCategories = useCallback((it) => {
//     if (Array.isArray(it?.categories)) return it.categories;
//     if (it?.category) return [it.category];
//     return []; // treat as uncategorized
//   }, []);

//   // memoize matchers so they are stable references for useEffect deps
//   const matchesCategory = useCallback(
//     (it, selected) => {
//       if (!selected) return true; // "All"
//       const cats = itemCategories(it);
//       // normalize case
//       return cats.some((c) => String(c).toLowerCase() === String(selected).toLowerCase());
//     },
//     [itemCategories]
//   );

//   const matchesSearch = useCallback((it, term) => {
//     if (!term) return true;
//     const name = (it?.name || "").toLowerCase();
//     const desc = (it?.description || "").toLowerCase();
//     return name.includes(term.toLowerCase()) || desc.includes(term.toLowerCase());
//   }, []);

//   const matchesAvailability = useCallback((it, filter) => {
//     // treat undefined availability as true (server default true)
//     const isAvailable = it?.availability === undefined ? true : Boolean(it.availability);
//     if (!filter || filter === "all") return true;
//     if (filter === "available") return isAvailable === true;
//     if (filter === "unavailable") return isAvailable === false;
//     return true;
//   }, []);

//   // Recompute visible items whenever data or filters change
//   useEffect(() => {
//     const filtered = (allItems || []).filter(
//       (it) =>
//         matchesSearch(it, searchTerm) &&
//         matchesCategory(it, categoryFilter) &&
//         matchesAvailability(it, availabilityFilter)
//     );
//     setItems(filtered);
//   }, [
//     allItems,
//     searchTerm,
//     categoryFilter,
//     availabilityFilter,
//     matchesCategory,
//     matchesSearch,
//     matchesAvailability,
//   ]);

//   const handleDeleteItem = (itemId) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "This item will be deleted permanently!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, delete it!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await axios.delete(
//             `${process.env.REACT_APP_API_URL}/api/items/${itemId}`
//           );
//           toast.success("Item deleted successfully");
//           fetchItems();
//           window.dispatchEvent(new CustomEvent("itemUpdated", { detail: { itemId } }));
//         } catch (error) {
//           toast.error("Issue deleting the item");
//         }
//       }
//     });
//   };

//   const handleAddItem = async () => {
//     if (
//       !newItem.name ||
//       !newItem.description ||
//       !newItem.price ||
//       !newItem.category ||
//       newItem.condition === "" // ensure provided
//     ) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     // Local validation for condition range (1-10)
//     const conditionNum = Number(newItem.condition);
//     if (Number.isNaN(conditionNum) || conditionNum < 1 || conditionNum > 10) {
//       toast.error("Condition must be a number between 1 and 10");
//       return;
//     }

//     // validate quantity
//     const quantityNum = Number(newItem.quantity ?? 1);
//     if (!Number.isInteger(quantityNum) || quantityNum < 0) {
//       toast.error("Quantity must be an integer >= 0");
//       return;
//     }

//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("name", newItem.name);
//       formData.append("description", newItem.description);
//       formData.append("price", newItem.price);
//       formData.append("condition", String(conditionNum));
//       formData.append("origin", newItem.origin);
//       formData.append("age", newItem.age);
//       // Keep single-field category (server will also map to categories array)
//       formData.append("category", newItem.category);
//       formData.append("quantity", String(quantityNum));

//       if (newItem.images.length > 0) {
//         newItem.images.forEach((file) => {
//           formData.append("images", file);
//         });
//       }

//       await axios.post(`${process.env.REACT_APP_API_URL}/api/items`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       toast.success("Item added successfully");
//       setNewItem({
//         name: "",
//         description: "",
//         price: "",
//         condition: "",
//         origin: "",
//         age: "",
//         category: "",
//         images: [],
//         quantity: 1,
//       });
//       setShowAddModal(false);
//       fetchItems();
//       window.dispatchEvent(new CustomEvent("itemUpdated"));
//     } catch (error) {
//       toast.error(
//         error?.response?.data?.error || "There was an issue adding the item"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMenuOpen = (event, itemId) => {
//     setAnchorEl(event.currentTarget);
//     setMenuItemId(itemId);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     setMenuItemId(null);
//   };

//   const handleEdit = (item) => {
//     setSelectedItem(item);
//     setShowEditModal(true);
//     handleMenuClose();
//   };

//   const handleDelete = (itemId) => {
//     handleDeleteItem(itemId);
//     handleMenuClose();
//   };

//   // toggle availability on server and update UI immediately
//   const toggleAvailability = async (item) => {
//     const itemId = item._id;
//     const newAvailability = !(item?.availability === undefined ? true : Boolean(item.availability));
//     try {
//       // optimistic UI update
//       setAllItems((prev) =>
//         prev.map((it) => (String(it._id) === String(itemId) ? { ...it, availability: newAvailability } : it))
//       );
//       setItems((prev) =>
//         prev.map((it) => (String(it._id) === String(itemId) ? { ...it, availability: newAvailability } : it))
//       );

//       // persist change
//       // Expect server to accept PATCH { availability: boolean }
//       await axios.patch(`${process.env.REACT_APP_API_URL}/api/items/${itemId}`, {
//         availability: newAvailability,
//       });

//       toast.success(newAvailability ? "Item marked available" : "Item marked unavailable");
//       window.dispatchEvent(new CustomEvent("itemUpdated", { detail: { itemId } }));
//     } catch (err) {
//       // revert optimistic update on failure
//       setAllItems((prev) =>
//         prev.map((it) => (String(it._id) === String(itemId) ? { ...it, availability: item.availability } : it))
//       );
//       setItems((prev) =>
//         prev.map((it) => (String(it._id) === String(itemId) ? { ...it, availability: item.availability } : it))
//       );
//       toast.error("Failed to update availability");
//     } finally {
//       handleMenuClose();
//     }
//   };

//   // decrement stock (calls POST /:id/decrement)
//   const decrementStock = async (item, amount = 1) => {
//     const itemId = item._id;
//     try {
//       // optimistic local update (don't allow negative)
//       setAllItems((prev) =>
//         prev.map((it) =>
//           String(it._id) === String(itemId)
//             ? { ...it, quantity: Math.max(0, (it.quantity ?? 1) - amount), availability: ((it.quantity ?? 1) - amount) > 0 }
//             : it
//         )
//       );
//       setItems((prev) =>
//         prev.map((it) =>
//           String(it._id) === String(itemId)
//             ? { ...it, quantity: Math.max(0, (it.quantity ?? 1) - amount), availability: ((it.quantity ?? 1) - amount) > 0 }
//             : it
//         )
//       );

//       const res = await axios.post(
//         `${process.env.REACT_APP_API_URL}/api/items/${itemId}/decrement`,
//         { amount }
//       );

//       // replace with authoritative server response
//       const updated = res.data;
//       setAllItems((prev) => prev.map((it) => (String(it._id) === String(updated._id) ? updated : it)));
//       setItems((prev) => prev.map((it) => (String(it._id) === String(updated._id) ? updated : it)));

//       toast.success(`Decremented ${amount} from ${item.name}`);
//       window.dispatchEvent(new CustomEvent("itemUpdated", { detail: { itemId } }));
//     } catch (err) {
//       // On failure, refetch authoritative data and show message
//       fetchItems();
//       const msg =
//         err?.response?.data?.error ||
//         (err.response?.status === 404 ? "Item not found" : "Failed to decrement stock");
//       toast.error(msg);
//     } finally {
//       handleMenuClose();
//     }
//   };

//   // Render helper: readable category cell (keeps same column; shows comma list when array)
//   const renderCategoryCell = (it) => {
//     const cats = itemCategories(it);
//     if (cats.length) return cats.join(", ");
//     // fallback for truly empty/uncategorized
//     return it?.category || "Uncategorized";
//   };

//   const renderAvailabilityChip = (it) => {
//     const isAvailable = it?.availability === undefined ? true : Boolean(it.availability);
//     return isAvailable ? (
//       <Chip label="Available" size="small" color="success" />
//     ) : (
//       <Chip label="Unavailable" size="small" color="default" sx={{ bgcolor: "grey.300" }} />
//     );
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Toaster position="top-right" />
//       <h2>Items in Inventory</h2>

//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           mb: 2,
//           gap: 2,
//         }}
//       >
//         <Button variant="contained" onClick={() => setShowAddModal(true)}>
//           Add New Antique
//         </Button>

//         <TextField
//           label="Search by name..."
//           variant="outlined"
//           size="small"
//           onChange={(e) => setSearchTerm(e.target.value || "")}
//         />
//       </Box>

//       {fetching ? (
//         <CircularProgress />
//       ) : (
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Item Name</TableCell>
//                 <TableCell>
//                   <FormControl size="small" fullWidth>
//                     <InputLabel>Category</InputLabel>
//                     <Select
//                       value={categoryFilter}
//                       label="Category"
//                       onChange={(e) => setCategoryFilter(e.target.value)}
//                     >
//                       <MenuItem value="">All</MenuItem>
//                       {categories.map((cat) => (
//                         <MenuItem key={cat} value={cat}>
//                           {cat}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </TableCell>
//                 <TableCell>Price</TableCell>
//                 <TableCell>Condition (1–10)</TableCell>
//                 <TableCell>Images</TableCell>

//                 {/* NEW: Availability filter dropdown placed between Images and Actions */}
//                 <TableCell>
//                   <FormControl size="small" fullWidth>
//                     <InputLabel>Availability</InputLabel>
//                     <Select
//                       value={availabilityFilter}
//                       label="Availability"
//                       onChange={(e) => setAvailabilityFilter(e.target.value)}
//                     >
//                       <MenuItem value="available">Available</MenuItem>
//                       <MenuItem value="unavailable">Unavailable</MenuItem>
//                       <MenuItem value="all">All</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </TableCell>

//                 <TableCell>Quantity</TableCell>

//                 <TableCell align="center">Actions</TableCell>
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {items.length ? (
//                 items.map((item) => (
//                   <TableRow key={item._id}>
//                     <TableCell>{item.name}</TableCell>
//                     <TableCell>{renderCategoryCell(item)}</TableCell>
//                     <TableCell>₱{item.price}</TableCell>
//                     <TableCell>{item.condition ?? "—"}</TableCell>
//                     <TableCell>
//                       {item.images && item.images.length > 0 ? (
//                         <Box sx={{ display: "flex", gap: 1 }}>
//                           {item.images.map((img, idx) => (
//                             <img
//                               key={idx}
//                               src={img}
//                               alt={item.name}
//                               style={{
//                                 width: 50,
//                                 height: 50,
//                                 objectFit: "cover",
//                                 borderRadius: 4,
//                               }}
//                             />
//                           ))}
//                         </Box>
//                       ) : (
//                         "No images"
//                       )}
//                     </TableCell>

//                     {/* Availability display cell */}
//                     <TableCell>{renderAvailabilityChip(item)}</TableCell>

//                     {/* Quantity cell */}
//                     <TableCell>{typeof item.quantity === "undefined" ? 1 : item.quantity}</TableCell>

//                     <TableCell align="center">
//                       <IconButton onClick={(e) => handleMenuOpen(e, item._id)}>
//                         <MoreVert />
//                       </IconButton>
//                       <Menu
//                         anchorEl={anchorEl}
//                         open={Boolean(anchorEl) && menuItemId === item._id}
//                         onClose={handleMenuClose}
//                       >
//                         <MenuItem onClick={() => handleEdit(item)}>Edit</MenuItem>
//                         <MenuItem onClick={() => handleDelete(item._id)}>
//                           Delete
//                         </MenuItem>

//                         <MenuItem
//                           onClick={async () => {
//                             try {
//                               await axios.post(
//                                 `${process.env.REACT_APP_API_URL}/api/items/${item._id}/feature`
//                               );
//                               toast.success("Item added as featured");
//                             } catch (error) {
//                               toast.error(
//                                 error.response?.data?.error ||
//                                   "Failed to add as featured"
//                               );
//                             }
//                             handleMenuClose();
//                           }}
//                         >
//                           Add as Featured Item
//                         </MenuItem>

//                         {/* Toggle availability quickly */}
//                         <MenuItem
//                           onClick={() => {
//                             toggleAvailability(item);
//                           }}
//                         >
//                           {item?.availability === false ? "Mark Available" : "Mark Unavailable"}
//                         </MenuItem>

//                         {/* Decrement stock by 1 */}
//                         <MenuItem
//                           onClick={() => {
//                             decrementStock(item, 1);
//                           }}
//                         >
//                           Decrement stock by 1
//                         </MenuItem>
//                       </Menu>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={8} align="center">
//                     No items available.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       )}

//       {/* Add Item Modal (kept same props) */}
//       <AddItemModal
//         show={showAddModal}
//         onHide={() => setShowAddModal(false)}
//         newItem={newItem}
//         setNewItem={setNewItem}
//         handleAddItem={handleAddItem}
//         loading={loading}
//         categories={categories}
//       />

//       {/* Edit Item Modal (kept same props) */}
//       {selectedItem && (
//         <EditItemModal
//           show={showEditModal}
//           onHide={() => {
//             setShowEditModal(false);
//             setSelectedItem(null);
//             fetchItems();
//           }}
//           item={selectedItem}
//         />
//       )}
//     </Box>
//   );
// };

// export default Items;


import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  CircularProgress,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import axios from "axios";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import EditItemModal from "./EditItemModal";
import AddItemModal from "./AddItemModal";

const Items = () => {
  // Format price to Philippine Peso with comma separators
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0.00";
    const num = parseFloat(price);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    condition: "", // 1-10
    origin: "",
    age: "",
    category: "",
    images: [],
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItemId, setMenuItemId] = useState(null);

  // Updated categories to match the server model
  const categories = [
    "Table",
    "Chair",
    "Cabinet",
    "Post",
    "Scraps",
    "Stones",
    "Windows",
    "Railings",
    "Doors",
    "Others",
    "Uncategorized",
  ];

  // UI filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("available"); // default to available
  const [searchTerm, setSearchTerm] = useState("");

  // ----- Helpers for mixed category model (string vs array) -----
  const itemCategories = useCallback((it) => {
    if (Array.isArray(it?.categories)) return it.categories;
    if (it?.category) return [it.category];
    return []; // treat as uncategorized
  }, []);

  // memoize matchers so they are stable references for useEffect deps
  const matchesCategory = useCallback(
    (it, selected) => {
      if (!selected) return true; // "All"
      const cats = itemCategories(it);
      // normalize case
      return cats.some((c) => String(c).toLowerCase() === String(selected).toLowerCase());
    },
    [itemCategories]
  );

  const matchesSearch = useCallback((it, term) => {
    if (!term) return true;
    const name = (it?.name || "").toLowerCase();
    const desc = (it?.description || "").toLowerCase();
    return name.includes(term.toLowerCase()) || desc.includes(term.toLowerCase());
  }, []);

  const matchesAvailability = useCallback((it, filter) => {
    // treat undefined availability as true (server default true)
    const isAvailable = it?.availability === undefined ? true : Boolean(it.availability);
    if (!filter || filter === "all") return true;
    if (filter === "available") return isAvailable === true;
    if (filter === "unavailable") return isAvailable === false;
    return true;
  }, []);

  // ----- Fetch items (memoized so effects can safely depend on it) -----
  const fetchItems = useCallback(async () => {
    setFetching(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/items`
      );
      const data = Array.isArray(response.data) ? response.data : [];
      setAllItems(data);
      // apply current filters immediately
      const filtered = data.filter((it) =>
        matchesSearch(it, searchTerm) &&
        matchesCategory(it, categoryFilter) &&
        matchesAvailability(it, availabilityFilter)
      );
      setItems(filtered);
    } catch (error) {
      toast.error("Failed to fetch items");
    } finally {
      setFetching(false);
    }
  }, [
    searchTerm,
    categoryFilter,
    availabilityFilter,
    matchesSearch,
    matchesCategory,
    matchesAvailability,
  ]);

  useEffect(() => {
    fetchItems();
    // subscribe to global cart updates so admin list reflects items added to cart
    const cartHandler = () => {
      // Re-fetch to get authoritative availability state from server
      fetchItems();
    };
    window.addEventListener("cartUpdated", cartHandler);
    // also listen for item changes from other admin panels if you dispatch 'itemUpdated' with detail { itemId }
    const itemUpdatedHandler = () => {
      fetchItems();
    };
    window.addEventListener("itemUpdated", itemUpdatedHandler);

    return () => {
      window.removeEventListener("cartUpdated", cartHandler);
      window.removeEventListener("itemUpdated", itemUpdatedHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Recompute visible items whenever data or filters change
  useEffect(() => {
    const filtered = (allItems || []).filter(
      (it) =>
        matchesSearch(it, searchTerm) &&
        matchesCategory(it, categoryFilter) &&
        matchesAvailability(it, availabilityFilter)
    );
    setItems(filtered);
  }, [
    allItems,
    searchTerm,
    categoryFilter,
    availabilityFilter,
    matchesCategory,
    matchesSearch,
    matchesAvailability,
  ]);

  const handleDeleteItem = (itemId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This item will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${process.env.REACT_APP_API_URL}/api/items/${itemId}`
          );
          toast.success("Item deleted successfully");
          fetchItems();
          window.dispatchEvent(new CustomEvent("itemUpdated", { detail: { itemId } }));
        } catch (error) {
          toast.error("Issue deleting the item");
        }
      }
    });
  };

  const handleAddItem = async () => {
    if (
      !newItem.name ||
      !newItem.description ||
      !newItem.price ||
      !newItem.category ||
      newItem.condition === "" // ensure provided
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Local validation for condition range (1-10)
    const conditionNum = Number(newItem.condition);
    if (Number.isNaN(conditionNum) || conditionNum < 1 || conditionNum > 10) {
      toast.error("Condition must be a number between 1 and 10");
      return;
    }

    // validate quantity
    const quantityNum = Number(newItem.quantity ?? 1);
    if (!Number.isInteger(quantityNum) || quantityNum < 0) {
      toast.error("Quantity must be an integer >= 0");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("description", newItem.description);
      formData.append("price", newItem.price);
      formData.append("condition", String(conditionNum));
      formData.append("origin", newItem.origin);
      formData.append("age", newItem.age);
      // Keep single-field category (server will also map to categories array)
      formData.append("category", newItem.category);
      formData.append("quantity", String(quantityNum));

      if (newItem.images.length > 0) {
        newItem.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      await axios.post(`${process.env.REACT_APP_API_URL}/api/items`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Item added successfully");
      setNewItem({
        name: "",
        description: "",
        price: "",
        condition: "",
        origin: "",
        age: "",
        category: "",
        images: [],
        quantity: 1,
      });
      setShowAddModal(false);
      fetchItems();
      window.dispatchEvent(new CustomEvent("itemUpdated"));
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "There was an issue adding the item"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, itemId) => {
    setAnchorEl(event.currentTarget);
    setMenuItemId(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItemId(null);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
    handleMenuClose();
  };

  const handleDelete = (itemId) => {
    handleDeleteItem(itemId);
    handleMenuClose();
  };

  // toggle availability on server and update UI immediately
  const toggleAvailability = async (item) => {
    const itemId = item._id;
    const newAvailability = !(item?.availability === undefined ? true : Boolean(item.availability));
    try {
      // optimistic UI update
      setAllItems((prev) =>
        prev.map((it) => (String(it._id) === String(itemId) ? { ...it, availability: newAvailability } : it))
      );
      setItems((prev) =>
        prev.map((it) => (String(it._id) === String(itemId) ? { ...it, availability: newAvailability } : it))
      );

      // persist change
      // Expect server to accept PATCH { availability: boolean }
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/items/${itemId}`, {
        availability: newAvailability,
      });

      toast.success(newAvailability ? "Item marked available" : "Item marked unavailable");
      window.dispatchEvent(new CustomEvent("itemUpdated", { detail: { itemId } }));
    } catch (err) {
      // revert optimistic update on failure
      setAllItems((prev) =>
        prev.map((it) => (String(it._id) === String(itemId) ? { ...it, availability: item.availability } : it))
      );
      setItems((prev) =>
        prev.map((it) => (String(it._id) === String(itemId) ? { ...it, availability: item.availability } : it))
      );
      toast.error("Failed to update availability");
    } finally {
      handleMenuClose();
    }
  };

  // decrement stock (calls POST /:id/decrement)
  const decrementStock = async (item, amount = 1) => {
    const itemId = item._id;
    try {
      // optimistic local update (don't allow negative)
      setAllItems((prev) =>
        prev.map((it) =>
          String(it._id) === String(itemId)
            ? { ...it, quantity: Math.max(0, (it.quantity ?? 1) - amount), availability: ((it.quantity ?? 1) - amount) > 0 }
            : it
        )
      );
      setItems((prev) =>
        prev.map((it) =>
          String(it._id) === String(itemId)
            ? { ...it, quantity: Math.max(0, (it.quantity ?? 1) - amount), availability: ((it.quantity ?? 1) - amount) > 0 }
            : it
        )
      );

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/items/${itemId}/decrement`,
        { amount }
      );

      // replace with authoritative server response
      const updated = res.data;
      setAllItems((prev) => prev.map((it) => (String(it._id) === String(updated._id) ? updated : it)));
      setItems((prev) => prev.map((it) => (String(it._id) === String(updated._id) ? updated : it)));

      toast.success(`Decremented ${amount} from ${item.name}`);
      window.dispatchEvent(new CustomEvent("itemUpdated", { detail: { itemId } }));
    } catch (err) {
      // On failure, refetch authoritative data and show message
      fetchItems();
      const msg =
        err?.response?.data?.error ||
        (err.response?.status === 404 ? "Item not found" : "Failed to decrement stock");
      toast.error(msg);
    } finally {
      handleMenuClose();
    }
  };

  // Render helper: readable category cell (keeps same column; shows comma list when array)
  const renderCategoryCell = (it) => {
    const cats = itemCategories(it);
    if (cats.length) return cats.join(", ");
    // fallback for truly empty/uncategorized
    return it?.category || "Uncategorized";
  };

  const renderAvailabilityChip = (it) => {
    const isAvailable = it?.availability === undefined ? true : Boolean(it.availability);
    return isAvailable ? (
      <Chip label="Available" size="small" color="success" />
    ) : (
      <Chip label="Unavailable" size="small" color="default" sx={{ bgcolor: "grey.300" }} />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />
      <h2>Items in Inventory</h2>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
        }}
      >
        <Button variant="contained" onClick={() => setShowAddModal(true)}>
          Add New Antique
        </Button>

        <TextField
          label="Search by name..."
          variant="outlined"
          size="small"
          onChange={(e) => setSearchTerm(e.target.value || "")}
        />
      </Box>

      {fetching ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      label="Category"
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Condition (1–10)</TableCell>
                <TableCell>Images</TableCell>

                {/* NEW: Availability filter dropdown placed between Images and Actions */}
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Availability</InputLabel>
                    <Select
                      value={availabilityFilter}
                      label="Availability"
                      onChange={(e) => setAvailabilityFilter(e.target.value)}
                    >
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="unavailable">Unavailable</MenuItem>
                      <MenuItem value="all">All</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>

                <TableCell>Quantity</TableCell>

                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.length ? (
                items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{renderCategoryCell(item)}</TableCell>
                    <TableCell>₱{formatPrice(item.price)}</TableCell>
                    <TableCell>{item.condition ?? "—"}</TableCell>
                    <TableCell>
                      {item.images && item.images.length > 0 ? (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {item.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={item.name}
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                                borderRadius: 4,
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        "No images"
                      )}
                    </TableCell>

                    {/* Availability display cell */}
                    <TableCell>{renderAvailabilityChip(item)}</TableCell>

                    {/* Quantity cell */}
                    <TableCell>{typeof item.quantity === "undefined" ? 1 : item.quantity}</TableCell>

                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuOpen(e, item._id)}>
                        <MoreVert />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && menuItemId === item._id}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => handleEdit(item)}>Edit</MenuItem>
                        <MenuItem onClick={() => handleDelete(item._id)}>
                          Delete
                        </MenuItem>

                        <MenuItem
                          onClick={async () => {
                            try {
                              await axios.post(
                                `${process.env.REACT_APP_API_URL}/api/items/${item._id}/feature`
                              );
                              toast.success("Item added as featured");
                            } catch (error) {
                              toast.error(
                                error.response?.data?.error ||
                                  "Failed to add as featured"
                              );
                            }
                            handleMenuClose();
                          }}
                        >
                          Add as Featured Item
                        </MenuItem>

                        {/* Toggle availability quickly */}
                        <MenuItem
                          onClick={() => {
                            toggleAvailability(item);
                          }}
                        >
                          {item?.availability === false ? "Mark Available" : "Mark Unavailable"}
                        </MenuItem>

                        {/* Decrement stock by 1 */}
                        <MenuItem
                          onClick={() => {
                            decrementStock(item, 1);
                          }}
                        >
                          Decrement stock by 1
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No items available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Item Modal (kept same props) */}
      <AddItemModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        newItem={newItem}
        setNewItem={setNewItem}
        handleAddItem={handleAddItem}
        loading={loading}
        categories={categories}
        allItems={allItems}
      />

      {/* Edit Item Modal (kept same props) */}
      {selectedItem && (
        <EditItemModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedItem(null);
            fetchItems();
          }}
          item={selectedItem}
        />
      )}
    </Box>
  );
};

export default Items;
