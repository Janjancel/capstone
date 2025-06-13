
// import React, { useState, useEffect } from "react";
// import { Button, Table, Modal, Form, Spinner } from "react-bootstrap";
// import {
//   getFirestore,
//   collection,
//   setDoc,
//   query,
//   orderBy,
//   onSnapshot,
//   doc,
//   deleteDoc
// } from "firebase/firestore";
// import { app, auth } from "../../firebase/firebase";
// import Swal from "sweetalert2";
// import "bootstrap/dist/css/bootstrap.min.css";
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

//   const db = getFirestore(app);

//   const convertImageToBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });

//   useEffect(() => {
//     const q = query(collection(db, "items"), orderBy("name", "asc"));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setItems(fetched);
//       setAllItems(fetched);
//     });
//     return () => unsubscribe();
//   }, [db]);

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
//           await deleteDoc(doc(db, "items", itemId));
//           Swal.fire("Deleted!", "The item has been deleted.", "success");
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

//       const user = auth.currentUser;
//       if (!user) {
//         Swal.fire("Error", "User not authenticated.", "error");
//         setLoading(false);
//         return;
//       }

//       await setDoc(
//         doc(db, "items", newItem.name),
//         {
//           name: newItem.name,
//           description: newItem.description,
//           price: newItem.price,
//           origin: newItem.origin || "",
//           age: newItem.age || "",
//           image: imageBase64,
//           createdAt: new Date(),
//         },
//         { merge: true }
//       );

//       Swal.fire("Success", "Item added successfully!", "success");
//       setNewItem({ name: "", description: "", price: "", origin: "", age: "", image: null });
//       setShowAddModal(false);
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
//                 <tr key={item.id}>
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
//                     <Button variant="danger" onClick={() => handleDeleteItem(item.id)}>
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

//       {/* Add Modal */}
//       <Modal show={showAddModal} onHide={() => setShowAddModal(false)} backdrop="static">
//         <Modal.Header closeButton>
//           <Modal.Title>Add New Antique</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             {["name", "description", "price", "origin", "age"].map((field) => (
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

// FRONTEND: Items.jsx (Updated to use Express + MongoDB backend)

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
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const convertImageToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const fetchItems = async () => {
    setFetching(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
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
          await axios.delete(`${process.env.REACT_APP_API_URL}/api/items/${itemId}`);
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
      let imageBase64 = "";
      if (newItem.image) {
        imageBase64 = await convertImageToBase64(newItem.image);
      }

      await axios.post(`${process.env.REACT_APP_API_URL}/api/items`, {
        ...newItem,
        image: imageBase64,
      });

      Swal.fire("Success", "Item added successfully!", "success");
      setNewItem({ name: "", description: "", price: "", origin: "", age: "", image: null });
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
              const filtered = allItems.filter(item =>
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
              <th>Image</th>
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
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: 50, height: 50, objectFit: "cover" }}
                      />
                    ) : (
                      "No image"
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
                    <Button variant="danger" onClick={() => handleDeleteItem(item._id)}>
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

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Add New Antique</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {[
              "name",
              "description",
              "price",
              "origin",
              "age",
            ].map((field) => (
              <Form.Group className="mb-3" key={field}>
                <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                <Form.Control
                  type={field === "description" ? "textarea" : field === "price" || field === "age" ? "number" : "text"}
                  value={newItem[field]}
                  onChange={(e) => setNewItem({ ...newItem, [field]: e.target.value })}
                  as={field === "description" ? "textarea" : "input"}
                  rows={field === "description" ? 3 : undefined}
                />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddItem} disabled={loading}>
            {loading ? "Adding..." : "Add Antique"}
          </Button>
        </Modal.Footer>
      </Modal>

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
