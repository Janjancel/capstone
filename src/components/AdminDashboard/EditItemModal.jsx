import React, { useState } from "react";
import { Modal, Form, Button, Image, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";

const EditItemModal = ({ show, onHide, item }) => {
  const [updatedItem, setUpdatedItem] = useState({ ...item });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(item.image || "");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setUpdatedItem((prev) => ({ ...prev, image: base64String }));
      setPreview(base64String);
      setUploading(false);
    };
    reader.onerror = () => {
      Swal.fire("Error", "Failed to read image file.", "error");
      setUploading(false);
    };

    reader.readAsDataURL(file); // Read as base64
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/items/${item._id}`, updatedItem);
      Swal.fire("Updated!", "Item updated successfully.", "success");
      onHide();
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire("Error", "Failed to update item.", "error");
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
              <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
              <Form.Control
                type={field === "description" ? "textarea" : field === "price" || field === "age" ? "number" : "text"}
                as={field === "description" ? "textarea" : "input"}
                rows={field === "description" ? 3 : undefined}
                value={updatedItem[field]}
                onChange={(e) => setUpdatedItem({ ...updatedItem, [field]: e.target.value })}
              />
            </Form.Group>
          ))}

          <Form.Group className="mb-3">
            <Form.Label>Item Image</Form.Label>
            <Form.Control
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {uploading && (
              <div className="mt-2">
                <Spinner animation="border" size="sm" /> Converting image...
              </div>
            )}
            {preview && !uploading && (
              <div className="mt-3">
                <Image src={preview} thumbnail style={{ maxHeight: "150px", objectFit: "contain" }} />
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading || uploading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditItemModal;
