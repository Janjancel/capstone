// import React, { useState, useEffect } from "react";
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

//   const fetchItems = async () => {
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
//   };

//   useEffect(() => {
//     fetchItems();
//   }, []);

//   // ----- Helpers for mixed category model (string vs array) -----
//   const itemCategories = (it) => {
//     if (Array.isArray(it?.categories)) return it.categories;
//     if (it?.category) return [it.category];
//     return []; // treat as uncategorized
//   };

//   const matchesCategory = (it, selected) => {
//     if (!selected) return true; // "All"
//     const cats = itemCategories(it);
//     return cats.includes(selected);
//   };

//   const matchesSearch = (it, term) => {
//     if (!term) return true;
//     const name = (it?.name || "").toLowerCase();
//     return name.includes(term.toLowerCase());
//   };

//   // Recompute visible items whenever data or filters change
//   useEffect(() => {
//     const filtered = (allItems || []).filter(
//       (it) => matchesSearch(it, searchTerm) && matchesCategory(it, categoryFilter)
//     );
//     setItems(filtered);
//   }, [allItems, searchTerm, categoryFilter]);

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
//           onChange={(e) => setSearchTerm((e.target.value || "").toLowerCase())}
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
    // (Uncategorized exists server-side as default; add here if you want to filter it explicitly)
  ];

  // UI filters (design unchanged: single dropdown)
  const [categoryFilter, setCategoryFilter] = useState("");
  // Track search term so search + category filter combine cleanly
  const [searchTerm, setSearchTerm] = useState("");

  // ----- Fetch items (memoized so effects can safely depend on it) -----
  const fetchItems = useCallback(async () => {
    setFetching(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/items`
      );
      setAllItems(response.data || []);
      setItems(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch items");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
      return cats.includes(selected);
    },
    [itemCategories]
  );

  const matchesSearch = useCallback((it, term) => {
    if (!term) return true;
    const name = (it?.name || "").toLowerCase();
    return name.includes(term.toLowerCase());
  }, []);

  // Recompute visible items whenever data or filters change
  useEffect(() => {
    const filtered = (allItems || []).filter(
      (it) => matchesSearch(it, searchTerm) && matchesCategory(it, categoryFilter)
    );
    setItems(filtered);
  }, [allItems, searchTerm, categoryFilter, matchesCategory, matchesSearch]);

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

  // Render helper: readable category cell (keeps same column; shows comma list when array)
  const renderCategoryCell = (it) => {
    const cats = itemCategories(it);
    if (cats.length) return cats.join(", ");
    // fallback for truly empty/uncategorized
    return it?.category || "Uncategorized";
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
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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
          }}
          item={selectedItem}
        />
      )}
    </Box>
  );
};

export default Items;
