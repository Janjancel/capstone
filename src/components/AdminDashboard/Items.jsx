
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
//     // (Uncategorized exists server-side as default; add here if you want to filter it explicitly)
//   ];

//   // UI filters (design unchanged: single dropdown)
//   const [categoryFilter, setCategoryFilter] = useState("");
//   // Track search term so search + category filter combine cleanly
//   const [searchTerm, setSearchTerm] = useState("");

//   // ----- Fetch items (memoized so effects can safely depend on it) -----
//   const fetchItems = useCallback(async () => {
//     setFetching(true);
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/items`
//       );
//       setAllItems(response.data || []);
//       setItems(response.data || []);
//     } catch (error) {
//       toast.error("Failed to fetch items");
//     } finally {
//       setFetching(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchItems();
//   }, [fetchItems]);

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
//       return cats.includes(selected);
//     },
//     [itemCategories]
//   );

//   const matchesSearch = useCallback((it, term) => {
//     if (!term) return true;
//     const name = (it?.name || "").toLowerCase();
//     return name.includes(term.toLowerCase());
//   }, []);

//   // Recompute visible items whenever data or filters change
//   useEffect(() => {
//     const filtered = (allItems || []).filter(
//       (it) => matchesSearch(it, searchTerm) && matchesCategory(it, categoryFilter)
//     );
//     setItems(filtered);
//   }, [allItems, searchTerm, categoryFilter, matchesCategory, matchesSearch]);

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
//       });
//       setShowAddModal(false);
//       fetchItems();
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

//   // Render helper: readable category cell (keeps same column; shows comma list when array)
//   const renderCategoryCell = (it) => {
//     const cats = itemCategories(it);
//     if (cats.length) return cats.join(", ");
//     // fallback for truly empty/uncategorized
//     return it?.category || "Uncategorized";
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Toaster position="top-right" />
//       <h2>Items in Cart</h2>

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
//                       </Menu>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={6} align="center">
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
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItemId, setMenuItemId] = useState(null);

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

  // UI filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("available"); // default to available
  const [searchTerm, setSearchTerm] = useState("");

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
    availabilityFilter, // included so fetchItems applied filters instantly
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
      <h2>Items in Cart</h2>

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

                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.length ? (
                items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{renderCategoryCell(item)}</TableCell>
                    <TableCell>₱{item.price}</TableCell>
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
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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
