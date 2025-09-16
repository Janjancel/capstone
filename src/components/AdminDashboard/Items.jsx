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
//     image: null,
//   });
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(false);

//   const convertImageToBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });

//   const fetchItems = async () => {
//     setFetching(true);
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
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
//           await axios.delete(`${process.env.REACT_APP_API_URL}/api/items/${itemId}`);
//           Swal.fire("Deleted!", "The item has been deleted.", "success");
//           fetchItems();
//         } catch (error) {
//           Swal.fire("Error", "Issue deleting the item.", "error");
//         }
//       }
//     });
//   };

//   const handleAddItem = async () => {
//     if (!newItem.name || !newItem.description || !newItem.price) {
//       Swal.fire("Error", "Please fill in the required fields.", "error");
//       return;
//     }

//     setLoading(true);
//     try {
//       let imageBase64 = "";
//       if (newItem.image) {
//         imageBase64 = await convertImageToBase64(newItem.image);
//       }

//       await axios.post(`${process.env.REACT_APP_API_URL}/api/items`, {
//         ...newItem,
//         image: imageBase64,
//       });

//       Swal.fire("Success", "Item added successfully!", "success");
//       setNewItem({ name: "", description: "", price: "", origin: "", age: "", image: null });
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
//               const filtered = allItems.filter(item =>
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
//               <th>Price</th>
//               <th>Image</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length ? (
//               items.map((item) => (
//                 <tr key={item._id}>
//                   <td>{item.name}</td>
//                   <td>₱{item.price}</td>
//                   <td>
//                     {item.image ? (
//                       <img
//                         src={item.image}
//                         alt={item.name}
//                         style={{ width: 50, height: 50, objectFit: "cover" }}
//                       />
//                     ) : (
//                       "No image"
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
//                     <Button variant="danger" onClick={() => handleDeleteItem(item._id)}>
//                       Delete
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4" className="text-center">
//                   No items available.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </Table>
//       )}

//       <Modal show={showAddModal} onHide={() => setShowAddModal(false)} backdrop="static">
//         <Modal.Header closeButton>
//           <Modal.Title>Add New Antique</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             {[
//               "name",
//               "description",
//               "price",
//               "origin",
//               "age",
//             ].map((field) => (
//               <Form.Group className="mb-3" key={field}>
//                 <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
//                 <Form.Control
//                   type={field === "description" ? "textarea" : field === "price" || field === "age" ? "number" : "text"}
//                   value={newItem[field]}
//                   onChange={(e) => setNewItem({ ...newItem, [field]: e.target.value })}
//                   as={field === "description" ? "textarea" : "input"}
//                   rows={field === "description" ? 3 : undefined}
//                 />
//               </Form.Group>
//             ))}
//             <Form.Group className="mb-3">
//               <Form.Label>Image</Form.Label>
//               <Form.Control
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowAddModal(false)}>
//             Close
//           </Button>
//           <Button variant="primary" onClick={handleAddItem} disabled={loading}>
//             {loading ? "Adding..." : "Add Antique"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

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
//     image: null,
//   });
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(false);

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
//     if (!newItem.name || !newItem.description || !newItem.price) {
//       Swal.fire("Error", "Please fill in the required fields.", "error");
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
//       if (newItem.image) {
//         formData.append("image", newItem.image);
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
//         image: null,
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
//               <th>Price</th>
//               <th>Image</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length ? (
//               items.map((item) => (
//                 <tr key={item._id}>
//                   <td>{item.name}</td>
//                   <td>₱{item.price}</td>
//                   <td>
//                     {item.image ? (
//                       <img
//                         src={item.image}
//                         alt={item.name}
//                         style={{
//                           width: 50,
//                           height: 50,
//                           objectFit: "cover",
//                         }}
//                       />
//                     ) : (
//                       "No image"
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
//                 <td colSpan="4" className="text-center">
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
//             <Form.Group className="mb-3">
//               <Form.Label>Image</Form.Label>
//               <Form.Control
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) =>
//                   setNewItem({ ...newItem, image: e.target.files[0] })
//                 }
//               />
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
import { Button, Table, Modal, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import EditItemModal from "./EditItemModal";

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
    images: [], // ✅ store multiple files
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchItems = async () => {
    setFetching(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/items`
      );
      setItems(response.data);
      setAllItems(response.data);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch items", "error");
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
          Swal.fire("Deleted!", "The item has been deleted.", "success");
          fetchItems();
        } catch (error) {
          Swal.fire("Error", "Issue deleting the item.", "error");
        }
      }
    });
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.price) {
      Swal.fire("Error", "Please fill in the required fields.", "error");
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

      if (newItem.images.length > 0) {
        newItem.images.forEach((file) => {
          formData.append("images", file); // ✅ append multiple
        });
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/items`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      Swal.fire("Success", "Item added successfully!", "success");
      setNewItem({
        name: "",
        description: "",
        price: "",
        origin: "",
        age: "",
        images: [],
      });
      setShowAddModal(false);
      fetchItems();
    } catch (error) {
      Swal.fire("Error", "There was an issue adding the item.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Items in Cart</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add New Antique
        </Button>
        <Form.Control
          type="text"
          placeholder="Search by name..."
          style={{ maxWidth: "250px" }}
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
      </div>

      {fetching ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Price</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>₱{item.price}</td>
                  <td>
                    {item.images && item.images.length > 0 ? (
                      <div style={{ display: "flex", gap: "5px" }}>
                        {item.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={item.name}
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: "cover",
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      "No images"
                    )}
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      className="me-2"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteItem(item._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No items available.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Add Item Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Antique</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {["name", "description", "price", "origin", "age"].map((field) => (
              <Form.Group className="mb-3" key={field}>
                <Form.Label>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Form.Label>
                <Form.Control
                  type={
                    field === "description"
                      ? "textarea"
                      : field === "price" || field === "age"
                      ? "number"
                      : "text"
                  }
                  value={newItem[field]}
                  onChange={(e) =>
                    setNewItem({ ...newItem, [field]: e.target.value })
                  }
                  as={field === "description" ? "textarea" : "input"}
                  rows={field === "description" ? 3 : undefined}
                />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>Images</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple // ✅ allow selecting multiple
                onChange={(e) =>
                  setNewItem({ ...newItem, images: Array.from(e.target.files) })
                }
              />
              <div className="d-flex gap-2 mt-2">
                {newItem.images.length > 0 &&
                  newItem.images.map((file, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{ width: 50, height: 50, objectFit: "cover" }}
                    />
                  ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleAddItem}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Antique"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
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
    </div>
  );
};

export default Items;
