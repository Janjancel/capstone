import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

const AddItemModal = ({
  show,
  onHide,
  newItem,
  setNewItem,
  handleAddItem,
  loading,
  categories,
}) => {
  return (
    <Modal show={show} onHide={onHide} backdrop="static">
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

          {/* ✅ Category Dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={newItem.category}
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value })
              }
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

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
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleAddItem} disabled={loading}>
          {loading ? "Adding..." : "Add Antique"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddItemModal;
