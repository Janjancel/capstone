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

import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  Image,
  Spinner,
} from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";

const EditItemModal = ({ show, onHide, item }) => {
  const [updatedItem, setUpdatedItem] = useState({
    name: item.name || "",
    description: item.description || "",
    price: item.price ?? "",
    condition: item.condition ?? "",
    origin: item.origin || "",
    age: item.age || "",
    category: item.category || "Table",
    images: [], // newly added files (not existing URLs)
  });

  // previews contains both existing URLs and new blob: URLs
  const [preview, setPreview] = useState(item.images || []);
  const [removedExisting, setRemovedExisting] = useState([]); // URLs removed by user
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ===== file input (hidden) =====
  const fileInputRef = useRef(null);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // fully clear <input type="file">
    }
  };

  // reset state on modal open/close or when item changes
  useEffect(() => {
    if (show) {
      setUpdatedItem({
        name: item.name || "",
        description: item.description || "",
        price: item.price ?? "",
        condition: item.condition ?? "",
        origin: item.origin || "",
        age: item.age || "",
        category: item.category || "Table",
        images: [],
      });
      setPreview(item.images || []);
      setRemovedExisting([]);
      resetFileInput(); // ensure input is empty on open
    } else {
      // also clear when hidden
      resetFileInput();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, item]);

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

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = (files) => {
    const incoming = Array.from(files || []);
    if (!incoming.length) return;

    setUploading(true);

    // limit to 5 new images (matches backend upload.array("images", 5))
    const firstFive = incoming.slice(0, 5).filter((f) => f.type.startsWith("image/"));

    // create blob previews
    const newBlobPreviews = firstFive.map((file) => URL.createObjectURL(file));

    // add to preview and to updatedItem.images
    setPreview((prev) => [...prev, ...newBlobPreviews]);
    setUpdatedItem((prev) => ({ ...prev, images: [...prev.images, ...firstFive] }));

    setUploading(false);
    // do NOT reset input here — user may add more; we’ll clear on save/close
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Remove a specific preview (either existing URL or blob)
  const handleRemovePreview = (src) => {
    // If it's a blob URL, remove the corresponding File object from updatedItem.images
    if (src.startsWith("blob:")) {
      setUpdatedItem((prev) => {
        // Find the blob index by matching object URLs
        // Since order is consistent with preview push, we remove by index of src among blob previews
        let blobIndex = -1;
        let count = -1;
        // Build a map of current blob URLs to index in images
        const currentBlobURLs = prev.images.map((f) => URL.createObjectURL(f));
        // Find match
        for (let i = 0; i < currentBlobURLs.length; i++) {
          if (currentBlobURLs[i] === src) {
            blobIndex = i;
            break;
          }
        }
        // Revoke created object URLs to avoid memory leaks (best-effort)
        currentBlobURLs.forEach((u) => URL.revokeObjectURL(u));

        if (blobIndex > -1) {
          const newFiles = [...prev.images];
          newFiles.splice(blobIndex, 1);
          return { ...prev, images: newFiles };
        }
        return prev;
      });
    } else {
      // Existing server URL — mark as removed so we don't keep it
      setRemovedExisting((prev) => Array.from(new Set([...prev, src])));
    }

    // Remove from visual previews
    setPreview((prev) => prev.filter((p) => p !== src));
  };

  const handleSave = async () => {
    // validate condition
    if (
      updatedItem.condition !== "" &&
      (Number.isNaN(Number(updatedItem.condition)) ||
        Number(updatedItem.condition) < 1 ||
        Number(updatedItem.condition) > 10)
    ) {
      toast.error("Condition must be a number between 1 and 10");
      return;
    }

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
      // Compute which existing images to keep (item.images minus removedExisting)
      const original = Array.isArray(item.images) ? item.images : [];
      const keepExisting = original.filter((url) => !removedExisting.includes(url));

      const formData = new FormData();
      formData.append("name", updatedItem.name);
      formData.append("description", updatedItem.description);
      formData.append("price", updatedItem.price);
      formData.append("condition", updatedItem.condition);
      formData.append("origin", updatedItem.origin);
      formData.append("age", updatedItem.age);
      formData.append("category", updatedItem.category);

      // Provide keepImages so the backend can overwrite with these + new uploads
      formData.append("keepImages", JSON.stringify(keepExisting));

      // Append new images (files)
      if (updatedItem.images.length > 0) {
        updatedItem.images.forEach((file) => formData.append("images", file));
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/items/${item._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Item updated successfully!");

      // Reset file input & local new images (as requested)
      setUpdatedItem((prev) => ({ ...prev, images: [] }));
      resetFileInput();

      onHide();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.error || "Failed to update item.");
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
                min={field === "price" ? 0 : undefined}
                step={field === "price" ? "0.01" : undefined}
                placeholder={
                  field === "price" ? "e.g., 1500.00" :
                  field === "age" ? "e.g., 80" : undefined
                }
              />
              {field === "price" && (
                <Form.Text muted>Enter a valid number (no currency symbols).</Form.Text>
              )}
            </Form.Group>
          ))}

          {/* Condition (1–10) */}
          <Form.Group className="mb-3">
            <Form.Label>Condition (1–10)</Form.Label>
            <Form.Control
              type="number"
              value={updatedItem.condition}
              onChange={(e) =>
                setUpdatedItem({ ...updatedItem, condition: e.target.value })
              }
              min={1}
              max={10}
              step={1}
              required
              placeholder="Rate from 1 (poor) to 10 (excellent)"
            />
            <Form.Text muted>
              Required. Whole number between 1 and 10. If unchanged, the current value will be kept.
            </Form.Text>
          </Form.Group>

          {/* Category */}
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

          {/* Enhanced dashed dropzone with removable thumbnails */}
          <Form.Group className="mb-3">
            <Form.Label>Item Images</Form.Label>

            {/* Hidden input */}
            <Form.Control
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              style={{ display: "none" }}
            />

            <div
              role="button"
              tabIndex={0}
              onClick={handleOpenFilePicker}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleOpenFilePicker();
              }}
              onDragOver={onDragOver}
              onDrop={onDrop}
              style={{
                border: "2px dashed #6c757d",
                borderRadius: 8,
                minHeight: 140,
                padding: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: preview?.length ? "flex-start" : "center",
                gap: 8,
                flexWrap: "wrap",
                cursor: "pointer",
                background: "#fafafa",
              }}
              aria-label="Image upload area"
              title="Click to select images or drag & drop here"
            >
              {uploading ? (
                <div className="d-flex align-items-center gap-2">
                  <Spinner animation="border" size="sm" /> Preparing images...
                </div>
              ) : preview?.length ? (
                preview.map((src, idx) => (
                  <div
                    key={`${src}-${idx}`}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 6,
                      overflow: "hidden",
                      border: "1px solid #dee2e6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fff",
                      position: "relative",
                    }}
                  >
                    {/* X (remove) button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePreview(src);
                      }}
                      aria-label="Remove image"
                      title="Remove image"
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>

                    <Image
                      src={src}
                      alt={`preview-${idx}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    Click to upload or drag & drop
                  </div>
                  <div style={{ fontSize: 12, color: "#6c757d" }}>
                    Up to 5 new images • JPG/PNG • Clear, well-lit photos recommended
                  </div>
                </div>
              )}
            </div>

            <Form.Text muted>
              Remove any existing image with the “×” button. New images you add here will be appended.
              <br />
              <strong>Note:</strong> The form sends <code>keepImages</code> so the server can overwrite the image list
              (existing kept + newly uploaded). Make sure your API uses it accordingly.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => { onHide(); resetFileInput(); }}>
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
