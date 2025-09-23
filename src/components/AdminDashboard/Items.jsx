

// import React, { useState, useEffect } from "react";
// import { Button, Table, Modal, Form, Spinner } from "react-bootstrap";
// import axios from "axios";
// import Swal from "sweetalert2";
// import EditItemModal from "./EditItemModal";

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
//     origin: "",
//     age: "",
//     category: "", // ✅ new field
//     images: [], // ✅ store multiple files
//   });
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(false);

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

//   const fetchItems = async () => {
//     setFetching(true);
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/items`
//       );
//       setItems(response.data);
//       setAllItems(response.data);
//     } catch (error) {
//       Swal.fire("Error", "Failed to fetch items", "error");
//     } finally {
//       setFetching(false);
//     }
//   };

//   useEffect(() => {
//     fetchItems();
//   }, []);

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
//           Swal.fire("Deleted!", "The item has been deleted.", "success");
//           fetchItems();
//         } catch (error) {
//           Swal.fire("Error", "Issue deleting the item.", "error");
//         }
//       }
//     });
//   };

//   const handleAddItem = async () => {
//     if (
//       !newItem.name ||
//       !newItem.description ||
//       !newItem.price ||
//       !newItem.category
//     ) {
//       Swal.fire("Error", "Please fill in all required fields.", "error");
//       return;
//     }

//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("name", newItem.name);
//       formData.append("description", newItem.description);
//       formData.append("price", newItem.price);
//       formData.append("origin", newItem.origin);
//       formData.append("age", newItem.age);
//       formData.append("category", newItem.category); // ✅ include category

//       if (newItem.images.length > 0) {
//         newItem.images.forEach((file) => {
//           formData.append("images", file); // ✅ append multiple
//         });
//       }

//       await axios.post(
//         `${process.env.REACT_APP_API_URL}/api/items`,
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       Swal.fire("Success", "Item added successfully!", "success");
//       setNewItem({
//         name: "",
//         description: "",
//         price: "",
//         origin: "",
//         age: "",
//         category: "",
//         images: [],
//       });
//       setShowAddModal(false);
//       fetchItems();
//     } catch (error) {
//       Swal.fire("Error", "There was an issue adding the item.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2>Items in Cart</h2>
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <Button variant="primary" onClick={() => setShowAddModal(true)}>
//           Add New Antique
//         </Button>
//         <Form.Control
//           type="text"
//           placeholder="Search by name..."
//           style={{ maxWidth: "250px" }}
//           onChange={(e) => {
//             const value = e.target.value.toLowerCase();
//             if (!value) {
//               setItems(allItems);
//             } else {
//               const filtered = allItems.filter((item) =>
//                 item.name.toLowerCase().includes(value)
//               );
//               setItems(filtered);
//             }
//           }}
//         />
//       </div>

//       {fetching ? (
//         <Spinner animation="border" />
//       ) : (
//         <Table striped bordered hover responsive>
//           <thead>
//             <tr>
//               <th>Item Name</th>
//               <th>Category</th>
//               <th>Price</th>
//               <th>Images</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length ? (
//               items.map((item) => (
//                 <tr key={item._id}>
//                   <td>{item.name}</td>
//                   <td>{item.category}</td>
//                   <td>₱{item.price}</td>
//                   <td>
//                     {item.images && item.images.length > 0 ? (
//                       <div style={{ display: "flex", gap: "5px" }}>
//                         {item.images.map((img, idx) => (
//                           <img
//                             key={idx}
//                             src={img}
//                             alt={item.name}
//                             style={{
//                               width: 50,
//                               height: 50,
//                               objectFit: "cover",
//                             }}
//                           />
//                         ))}
//                       </div>
//                     ) : (
//                       "No images"
//                     )}
//                   </td>
//                   <td>
//                     <Button
//                       variant="warning"
//                       className="me-2"
//                       onClick={() => {
//                         setSelectedItem(item);
//                         setShowEditModal(true);
//                       }}
//                     >
//                       Edit
//                     </Button>
//                     <Button
//                       variant="danger"
//                       onClick={() => handleDeleteItem(item._id)}
//                     >
//                       Delete
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="5" className="text-center">
//                   No items available.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </Table>
//       )}

//       {/* Add Item Modal */}
//       <Modal
//         show={showAddModal}
//         onHide={() => setShowAddModal(false)}
//         backdrop="static"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Add New Antique</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             {["name", "description", "price", "origin", "age"].map((field) => (
//               <Form.Group className="mb-3" key={field}>
//                 <Form.Label>
//                   {field.charAt(0).toUpperCase() + field.slice(1)}
//                 </Form.Label>
//                 <Form.Control
//                   type={
//                     field === "description"
//                       ? "textarea"
//                       : field === "price" || field === "age"
//                       ? "number"
//                       : "text"
//                   }
//                   value={newItem[field]}
//                   onChange={(e) =>
//                     setNewItem({ ...newItem, [field]: e.target.value })
//                   }
//                   as={field === "description" ? "textarea" : "input"}
//                   rows={field === "description" ? 3 : undefined}
//                 />
//               </Form.Group>
//             ))}

//             {/* ✅ Category Dropdown */}
//             <Form.Group className="mb-3">
//               <Form.Label>Category</Form.Label>
//               <Form.Select
//                 value={newItem.category}
//                 onChange={(e) =>
//                   setNewItem({ ...newItem, category: e.target.value })
//                 }
//               >
//                 <option value="">-- Select Category --</option>
//                 {categories.map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Images</Form.Label>
//               <Form.Control
//                 type="file"
//                 accept="image/*"
//                 multiple // ✅ allow selecting multiple
//                 onChange={(e) =>
//                   setNewItem({ ...newItem, images: Array.from(e.target.files) })
//                 }
//               />
//               <div className="d-flex gap-2 mt-2">
//                 {newItem.images.length > 0 &&
//                   newItem.images.map((file, idx) => (
//                     <img
//                       key={idx}
//                       src={URL.createObjectURL(file)}
//                       alt="preview"
//                       style={{ width: 50, height: 50, objectFit: "cover" }}
//                     />
//                   ))}
//               </div>
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowAddModal(false)}>
//             Close
//           </Button>
//           <Button
//             variant="primary"
//             onClick={handleAddItem}
//             disabled={loading}
//           >
//             {loading ? "Adding..." : "Add Antique"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Edit Modal */}
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
//     </div>
//   );
// };

// export default Items;

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
      !newItem.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("description", newItem.description);
      formData.append("price", newItem.price);
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
        origin: "",
        age: "",
        category: "",
        images: [],
      });
      setShowAddModal(false);
      fetchItems();
    } catch (error) {
      toast.error("There was an issue adding the item");
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
                  <TableCell colSpan={5} align="center">
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
