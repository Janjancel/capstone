import React, { useState, useEffect } from "react";
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
    condition: "", // ✅ new: condition (1-10)
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
    // (Uncategorized exists server-side as default; you can add it here if you want to filter it explicitly)
  ];

  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchItems = async () => {
    setFetching(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/items`
      );
      setItems(response.data);
      setAllItems(response.data);
    } catch (error) {
      toast.error("Failed to fetch items");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
    if (
      Number.isNaN(conditionNum) ||
      conditionNum < 1 ||
      conditionNum > 10
    ) {
      toast.error("Condition must be a number between 1 and 10");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("description", newItem.description);
      formData.append("price", newItem.price);
      formData.append("condition", String(conditionNum)); // ✅ include condition
      formData.append("origin", newItem.origin);
      formData.append("age", newItem.age);
      formData.append("category", newItem.category);

      if (newItem.images.length > 0) {
        newItem.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/items`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

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
      toast.error(error?.response?.data?.error || "There was an issue adding the item");
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
          onChange={(e) => {
            const value = e.target.value.toLowerCase();
            if (!value) {
              setItems(allItems);
            } else {
              const filtered = allItems.filter((item) =>
                item.name.toLowerCase().includes(value)
              );
              setItems(filtered);
            }
          }}
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
                      onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        if (!e.target.value) {
                          setItems(allItems);
                        } else {
                          setItems(
                            allItems.filter(
                              (item) => item.category === e.target.value
                            )
                          );
                        }
                      }}
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
                <TableCell>Condition (1–10)</TableCell>{/* ✅ new column */}
                <TableCell>Images</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length ? (
                items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>₱{item.price}</TableCell>
                    <TableCell>{item.condition ?? "—"}</TableCell>{/* ✅ show condition */}
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
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, item._id)}
                      >
                        <MoreVert />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && menuItemId === item._id}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => handleEdit(item)}>
                          Edit
                        </MenuItem>
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
                                error.response?.data?.error || "Failed to add as featured"
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

      {/* ✅ Add Item Modal */}
      <AddItemModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        newItem={newItem}
        setNewItem={setNewItem}
        handleAddItem={handleAddItem}
        loading={loading}
        categories={categories}
      />

      {/* ✅ Edit Modal */}
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
