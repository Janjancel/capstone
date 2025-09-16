// import React, { useState } from "react";
// import { Modal, Form, Button, Image, Spinner } from "react-bootstrap";
// import Swal from "sweetalert2";
// import axios from "axios";

// const EditItemModal = ({ show, onHide, item }) => {
//   const [updatedItem, setUpdatedItem] = useState({ ...item });
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [preview, setPreview] = useState(item.image || "");

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setUploading(true);

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const base64String = reader.result;
//       setUpdatedItem((prev) => ({ ...prev, image: base64String }));
//       setPreview(base64String);
//       setUploading(false);
//     };
//     reader.onerror = () => {
//       Swal.fire("Error", "Failed to read image file.", "error");
//       setUploading(false);
//     };

//     reader.readAsDataURL(file); // Read as base64
//   };

//   const handleSave = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/items/${item._id}`, updatedItem);
//       Swal.fire("Updated!", "Item updated successfully.", "success");
//       onHide();
//     } catch (error) {
//       console.error("Update error:", error);
//       Swal.fire("Error", "Failed to update item.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal show={show} onHide={onHide} backdrop="static">
//       <Modal.Header closeButton>
//         <Modal.Title>Edit Antique</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form>
//           {["name", "description", "price", "origin", "age"].map((field) => (
//             <Form.Group className="mb-3" key={field}>
//               <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
//               <Form.Control
//                 type={field === "description" ? "textarea" : field === "price" || field === "age" ? "number" : "text"}
//                 as={field === "description" ? "textarea" : "input"}
//                 rows={field === "description" ? 3 : undefined}
//                 value={updatedItem[field]}
//                 onChange={(e) => setUpdatedItem({ ...updatedItem, [field]: e.target.value })}
//               />
//             </Form.Group>
//           ))}

//           <Form.Group className="mb-3">
//             <Form.Label>Item Image</Form.Label>
//             <Form.Control
//               id="file-input"
//               type="file"
//               accept="image/*"
//               onChange={handleImageChange}
//             />
//             {uploading && (
//               <div className="mt-2">
//                 <Spinner animation="border" size="sm" /> Converting image...
//               </div>
//             )}
//             {preview && !uploading && (
//               <div className="mt-3">
//                 <Image src={preview} thumbnail style={{ maxHeight: "150px", objectFit: "contain" }} />
//               </div>
//             )}
//           </Form.Group>
//         </Form>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onHide}>
//           Cancel
//         </Button>
//         <Button variant="primary" onClick={handleSave} disabled={loading || uploading}>
//           {loading ? "Saving..." : "Save Changes"}
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default EditItemModal;

import React, { useState } from "react";
import {
  Modal,
  Form,
  Button,
  Image,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";

const EditItemModal = ({ show, onHide, item }) => {
  const [updatedItem, setUpdatedItem] = useState({
    name: item.name || "",
    description: item.description || "",
    price: item.price || "",
    origin: item.origin || "",
    age: item.age || "",
    category: item.category || "Table", // ✅ default to current or Table
    images: [], // new uploads
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(item.images || []); // ✅ show existing images

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);

    // Show previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreview((prev) => [...prev, ...newPreviews]);

    // Save files for upload
    setUpdatedItem((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    setUploading(false);
  };

  const handleSave = async () => {
    // ✅ SweetAlert confirmation before save
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save these changes?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, save it!",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", updatedItem.name);
      formData.append("description", updatedItem.description);
      formData.append("price", updatedItem.price);
      formData.append("origin", updatedItem.origin);
      formData.append("age", updatedItem.age);
      formData.append("category", updatedItem.category); // ✅ send category

      // Append new images
      if (updatedItem.images.length > 0) {
        updatedItem.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/items/${item._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Item updated successfully!");
      onHide();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Edit Antique</Modal.Title>
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
                as={field === "description" ? "textarea" : "input"}
                rows={field === "description" ? 3 : undefined}
                value={updatedItem[field]}
                onChange={(e) =>
                  setUpdatedItem({ ...updatedItem, [field]: e.target.value })
                }
              />
            </Form.Group>
          ))}

          {/* ✅ Category Dropdown with current category pre-selected */}
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={updatedItem.category}
              onChange={(e) =>
                setUpdatedItem({ ...updatedItem, category: e.target.value })
              }
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Item Images</Form.Label>
            <Form.Control
              id="file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {uploading && (
              <div className="mt-2">
                <Spinner animation="border" size="sm" /> Preparing images...
              </div>
            )}
            {preview.length > 0 && !uploading && (
              <Row className="mt-3">
                {preview.map((src, idx) => (
                  <Col xs={4} key={idx} className="mb-2">
                    <Image
                      src={src}
                      thumbnail
                      style={{ maxHeight: "120px", objectFit: "contain" }}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={loading || uploading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditItemModal;
