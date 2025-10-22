
// import React, { useRef, useState, useEffect } from "react";
// import {
//   Modal,
//   Form,
//   Button,
//   Image,
//   Spinner,
// } from "react-bootstrap";
// import Swal from "sweetalert2";
// import axios from "axios";
// import toast from "react-hot-toast";

// const EditItemModal = ({ show, onHide, item }) => {
//   const [updatedItem, setUpdatedItem] = useState({
//     name: item.name || "",
//     description: item.description || "",
//     price: item.price ?? "",
//     condition: item.condition ?? "",
//     origin: item.origin || "",
//     age: item.age || "",
//     category: item.category || "Table",
//     images: [], // newly added files (not existing URLs)
//   });

//   // previews contains both existing URLs and new blob: URLs
//   const [preview, setPreview] = useState(item.images || []);
//   const [removedExisting, setRemovedExisting] = useState([]); // URLs removed by user
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   // ===== file input (hidden) =====
//   const fileInputRef = useRef(null);

//   const resetFileInput = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.value = ""; // fully clear <input type="file">
//     }
//   };

//   // reset state on modal open/close or when item changes
//   useEffect(() => {
//     if (show) {
//       setUpdatedItem({
//         name: item.name || "",
//         description: item.description || "",
//         price: item.price ?? "",
//         condition: item.condition ?? "",
//         origin: item.origin || "",
//         age: item.age || "",
//         category: item.category || "Table",
//         images: [],
//       });
//       setPreview(item.images || []);
//       setRemovedExisting([]);
//       resetFileInput(); // ensure input is empty on open
//     } else {
//       // also clear when hidden
//       resetFileInput();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [show, item]);

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

//   const handleOpenFilePicker = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFiles = (files) => {
//     const incoming = Array.from(files || []);
//     if (!incoming.length) return;

//     setUploading(true);

//     // limit to 5 new images (matches backend upload.array("images", 5))
//     const firstFive = incoming.slice(0, 5).filter((f) => f.type.startsWith("image/"));

//     // create blob previews
//     const newBlobPreviews = firstFive.map((file) => URL.createObjectURL(file));

//     // add to preview and to updatedItem.images
//     setPreview((prev) => [...prev, ...newBlobPreviews]);
//     setUpdatedItem((prev) => ({ ...prev, images: [...prev.images, ...firstFive] }));

//     setUploading(false);
//     // do NOT reset input here — user may add more; we’ll clear on save/close
//   };

//   const onDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     handleFiles(e.dataTransfer.files);
//   };

//   const onDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   // Remove a specific preview (either existing URL or blob)
//   const handleRemovePreview = (src) => {
//     // If it's a blob URL, remove the corresponding File object from updatedItem.images
//     if (src.startsWith("blob:")) {
//       setUpdatedItem((prev) => {
//         // Find the blob index by matching object URLs
//         // Since order is consistent with preview push, we remove by index of src among blob previews
//         let blobIndex = -1;
//         let count = -1;
//         // Build a map of current blob URLs to index in images
//         const currentBlobURLs = prev.images.map((f) => URL.createObjectURL(f));
//         // Find match
//         for (let i = 0; i < currentBlobURLs.length; i++) {
//           if (currentBlobURLs[i] === src) {
//             blobIndex = i;
//             break;
//           }
//         }
//         // Revoke created object URLs to avoid memory leaks (best-effort)
//         currentBlobURLs.forEach((u) => URL.revokeObjectURL(u));

//         if (blobIndex > -1) {
//           const newFiles = [...prev.images];
//           newFiles.splice(blobIndex, 1);
//           return { ...prev, images: newFiles };
//         }
//         return prev;
//       });
//     } else {
//       // Existing server URL — mark as removed so we don't keep it
//       setRemovedExisting((prev) => Array.from(new Set([...prev, src])));
//     }

//     // Remove from visual previews
//     setPreview((prev) => prev.filter((p) => p !== src));
//   };

//   const handleSave = async () => {
//     // validate condition
//     if (
//       updatedItem.condition !== "" &&
//       (Number.isNaN(Number(updatedItem.condition)) ||
//         Number(updatedItem.condition) < 1 ||
//         Number(updatedItem.condition) > 10)
//     ) {
//       toast.error("Condition must be a number between 1 and 10");
//       return;
//     }

//     const confirm = await Swal.fire({
//       title: "Are you sure?",
//       text: "Do you want to save these changes?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, save it!",
//     });
//     if (!confirm.isConfirmed) return;

//     setLoading(true);
//     try {
//       // Compute which existing images to keep (item.images minus removedExisting)
//       const original = Array.isArray(item.images) ? item.images : [];
//       const keepExisting = original.filter((url) => !removedExisting.includes(url));

//       const formData = new FormData();
//       formData.append("name", updatedItem.name);
//       formData.append("description", updatedItem.description);
//       formData.append("price", updatedItem.price);
//       formData.append("condition", updatedItem.condition);
//       formData.append("origin", updatedItem.origin);
//       formData.append("age", updatedItem.age);
//       formData.append("category", updatedItem.category);

//       // Provide keepImages so the backend can overwrite with these + new uploads
//       formData.append("keepImages", JSON.stringify(keepExisting));

//       // Append new images (files)
//       if (updatedItem.images.length > 0) {
//         updatedItem.images.forEach((file) => formData.append("images", file));
//       }

//       await axios.put(
//         `${process.env.REACT_APP_API_URL}/api/items/${item._id}`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       toast.success("Item updated successfully!");

//       // Reset file input & local new images (as requested)
//       setUpdatedItem((prev) => ({ ...prev, images: [] }));
//       resetFileInput();

//       onHide();
//     } catch (error) {
//       console.error("Update error:", error);
//       toast.error(error?.response?.data?.error || "Failed to update item.");
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
//               <Form.Label>
//                 {field.charAt(0).toUpperCase() + field.slice(1)}
//               </Form.Label>
//               <Form.Control
//                 type={
//                   field === "description"
//                     ? "textarea"
//                     : field === "price" || field === "age"
//                     ? "number"
//                     : "text"
//                 }
//                 as={field === "description" ? "textarea" : "input"}
//                 rows={field === "description" ? 3 : undefined}
//                 value={updatedItem[field]}
//                 onChange={(e) =>
//                   setUpdatedItem({ ...updatedItem, [field]: e.target.value })
//                 }
//                 min={field === "price" ? 0 : undefined}
//                 step={field === "price" ? "0.01" : undefined}
//                 placeholder={
//                   field === "price" ? "e.g., 1500.00" :
//                   field === "age" ? "e.g., 80" : undefined
//                 }
//               />
//               {field === "price" && (
//                 <Form.Text muted>Enter a valid number (no currency symbols).</Form.Text>
//               )}
//             </Form.Group>
//           ))}

//           {/* Condition (1–10) */}
//           <Form.Group className="mb-3">
//             <Form.Label>Condition (1–10)</Form.Label>
//             <Form.Control
//               type="number"
//               value={updatedItem.condition}
//               onChange={(e) =>
//                 setUpdatedItem({ ...updatedItem, condition: e.target.value })
//               }
//               min={1}
//               max={10}
//               step={1}
//               required
//               placeholder="Rate from 1 (poor) to 10 (excellent)"
//             />
//             <Form.Text muted>
//               Required. Whole number between 1 and 10. If unchanged, the current value will be kept.
//             </Form.Text>
//           </Form.Group>

//           {/* Category */}
//           <Form.Group className="mb-3">
//             <Form.Label>Category</Form.Label>
//             <Form.Select
//               value={updatedItem.category}
//               onChange={(e) =>
//                 setUpdatedItem({ ...updatedItem, category: e.target.value })
//               }
//             >
//               {categories.map((cat) => (
//                 <option key={cat} value={cat}>
//                   {cat}
//                 </option>
//               ))}
//             </Form.Select>
//           </Form.Group>

//           {/* Enhanced dashed dropzone with removable thumbnails */}
//           <Form.Group className="mb-3">
//             <Form.Label>Item Images</Form.Label>

//             {/* Hidden input */}
//             <Form.Control
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={(e) => handleFiles(e.target.files)}
//               style={{ display: "none" }}
//             />

//             <div
//               role="button"
//               tabIndex={0}
//               onClick={handleOpenFilePicker}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" || e.key === " ") handleOpenFilePicker();
//               }}
//               onDragOver={onDragOver}
//               onDrop={onDrop}
//               style={{
//                 border: "2px dashed #6c757d",
//                 borderRadius: 8,
//                 minHeight: 140,
//                 padding: 12,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: preview?.length ? "flex-start" : "center",
//                 gap: 8,
//                 flexWrap: "wrap",
//                 cursor: "pointer",
//                 background: "#fafafa",
//               }}
//               aria-label="Image upload area"
//               title="Click to select images or drag & drop here"
//             >
//               {uploading ? (
//                 <div className="d-flex align-items-center gap-2">
//                   <Spinner animation="border" size="sm" /> Preparing images...
//                 </div>
//               ) : preview?.length ? (
//                 preview.map((src, idx) => (
//                   <div
//                     key={`${src}-${idx}`}
//                     style={{
//                       width: 80,
//                       height: 80,
//                       borderRadius: 6,
//                       overflow: "hidden",
//                       border: "1px solid #dee2e6",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       background: "#fff",
//                       position: "relative",
//                     }}
//                   >
//                     {/* X (remove) button */}
//                     <button
//                       type="button"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleRemovePreview(src);
//                       }}
//                       aria-label="Remove image"
//                       title="Remove image"
//                       style={{
//                         position: "absolute",
//                         top: 4,
//                         right: 4,
//                         width: 22,
//                         height: 22,
//                         borderRadius: "50%",
//                         border: "none",
//                         background: "rgba(0,0,0,0.6)",
//                         color: "#fff",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         lineHeight: 1,
//                         fontSize: 14,
//                         cursor: "pointer",
//                       }}
//                     >
//                       ×
//                     </button>

//                     <Image
//                       src={src}
//                       alt={`preview-${idx}`}
//                       style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                     />
//                   </div>
//                 ))
//               ) : (
//                 <div style={{ textAlign: "center" }}>
//                   <div style={{ fontWeight: 600, marginBottom: 4 }}>
//                     Click to upload or drag & drop
//                   </div>
//                   <div style={{ fontSize: 12, color: "#6c757d" }}>
//                     Up to 5 new images • JPG/PNG • Clear, well-lit photos recommended
//                   </div>
//                 </div>
//               )}
//             </div>

//             <Form.Text muted>
//               Remove any existing image with the “×” button. New images you add here will be appended.
//               <br />
//               <strong>Note:</strong> The form sends <code>keepImages</code> so the server can overwrite the image list
//               (existing kept + newly uploaded). Make sure your API uses it accordingly.
//             </Form.Text>
//           </Form.Group>
//         </Form>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={() => { onHide(); resetFileInput(); }}>
//           Cancel
//         </Button>
//         <Button
//           variant="primary"
//           onClick={handleSave}
//           disabled={loading || uploading}
//         >
//           {loading ? "Saving..." : "Save Changes"}
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default EditItemModal;

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Modal, Form, Button, Image, Spinner, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Table",
  "Chair",
  "Flooring",
  "Cabinet",
  "Post",
  "Scraps",
  "Stones",
  "Windows",
  "Bed",
  "Uncategorized",
];

const EditItemModal = ({ show, onHide, item }) => {
  // ---- New: keep BOTH fields for backward compatibility ----
  const [updatedItem, setUpdatedItem] = useState({
    name: item.name || "",
    description: item.description || "",
    price: item.price ?? "",
    condition: item.condition ?? "",
    origin: item.origin || "",
    age: item.age || "",
    // prefer array if present, else seed from legacy single
    categories: Array.isArray(item.categories)
      ? item.categories
      : item.category
      ? [item.category]
      : [],
    category:
      item.category ||
      (Array.isArray(item.categories) && item.categories[0]) ||
      "Table",
  });

  // Existing image URLs that come from the server
  const [existingUrls, setExistingUrls] = useState(Array.isArray(item.images) ? item.images : []);

  // Newly added images: [{ url: objectURL, file: File }]
  const [newPreviews, setNewPreviews] = useState([]);

  // Track which existing URLs were removed (for keepImages)
  const [removedExisting, setRemovedExisting] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Reset state on open or when item changes
  useEffect(() => {
    if (show) {
      const nextCategories = Array.isArray(item.categories)
        ? item.categories
        : item.category
        ? [item.category]
        : [];

      setUpdatedItem({
        name: item.name || "",
        description: item.description || "",
        price: item.price ?? "",
        condition: item.condition ?? "",
        origin: item.origin || "",
        age: item.age || "",
        categories: nextCategories,
        category: item.category || nextCategories[0] || "Table",
      });

      setExistingUrls(Array.isArray(item.images) ? item.images : []);
      setNewPreviews([]);       // reset new files
      setRemovedExisting([]);   // reset removals
      resetFileInput();
    } else {
      resetFileInput();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, item]);

  // Combined preview list for UI (existing first, then new)
  const combinedPreview = useMemo(
    () => [...existingUrls, ...newPreviews.map((p) => p.url)],
    [existingUrls, newPreviews]
  );

  // ---- Categories helpers (multi-select via checkboxes) ----
  const selectedCategories = updatedItem.categories || [];
  const setCategories = (nextArr) => {
    setUpdatedItem((prev) => ({
      ...prev,
      categories: nextArr,
      category: nextArr[0] || "", // keep legacy field in sync
    }));
  };
  const toggleCategory = (cat) => {
    const set = new Set(selectedCategories);
    set.has(cat) ? set.delete(cat) : set.add(cat);
    setCategories(Array.from(set));
  };
  const clearCategories = () => setCategories([]);

  // ---- Files ----
  const handleOpenFilePicker = () => fileInputRef.current?.click();

  const handleFiles = (files) => {
    const incoming = Array.from(files || []);
    if (!incoming.length) return;

    setUploading(true);

    // Limit: up to 5 NEW files (does not touch existing)
    const remainingSlots = Math.max(0, 5 - newPreviews.length);
    const toAdd = incoming
      .filter((f) => f.type?.startsWith("image/"))
      .slice(0, remainingSlots);

    const newItems = toAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file), // stable URL for remove
    }));

    setNewPreviews((prev) => [...prev, ...newItems]);
    setUploading(false);
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

  // Remove preview: if it's an existing URL, mark for removal; if it's a blob, drop it & revoke URL
  const handleRemovePreview = (src) => {
    // First check newPreviews
    const idx = newPreviews.findIndex((p) => p.url === src);
    if (idx > -1) {
      // revoke objectURL and remove
      URL.revokeObjectURL(newPreviews[idx].url);
      setNewPreviews((prev) => {
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
      return;
    }

    // Otherwise it's an existing server URL
    if (existingUrls.includes(src)) {
      setRemovedExisting((prev) => Array.from(new Set([...prev, src])));
      setExistingUrls((prev) => prev.filter((u) => u !== src));
    }
  };

  // Cleanup object URLs on unmount/close
  useEffect(() => {
    return () => {
      newPreviews.forEach((p) => {
        try {
          URL.revokeObjectURL(p.url);
        } catch {}
      });
    };
  }, [newPreviews]);

  const handleSave = async () => {
    // Validate condition
    const cond = updatedItem.condition;
    if (
      cond !== "" &&
      (Number.isNaN(Number(cond)) ||
        Number(cond) < 1 ||
        Number(cond) > 10)
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
      // existingUrls now already excludes removed ones; send it as keepImages
      const keepExisting = existingUrls;

      const formData = new FormData();
      formData.append("name", updatedItem.name);
      formData.append("description", updatedItem.description);
      formData.append("price", String(updatedItem.price ?? ""));
      formData.append("condition", String(updatedItem.condition ?? ""));
      formData.append("origin", updatedItem.origin);
      formData.append("age", updatedItem.age);

      // ✅ Multi-category: send array AND keep legacy single
      const cats = (updatedItem.categories || []).length
        ? updatedItem.categories
        : ["Uncategorized"];
      formData.append("categories", JSON.stringify(cats));
      formData.append("category", cats[0] || ""); // legacy compatibility

      // For your API to overwrite images list: existing kept + new uploads
      formData.append("keepImages", JSON.stringify(keepExisting));

      // Append new images
      if (newPreviews.length) {
        newPreviews.forEach(({ file }) => formData.append("images", file));
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/items/${item._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Item updated successfully!");

      // Reset new files and input
      setNewPreviews([]);
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
                  field === "price"
                    ? "e.g., 1500.00"
                    : field === "age"
                    ? "e.g., 80"
                    : undefined
                }
              />
              {field === "price" && (
                <Form.Text muted>
                  Enter a valid number (no currency symbols).
                </Form.Text>
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

          {/* ✅ Multi-categories (checkbox grid) with legacy sync */}
          <Form.Group className="mb-3">
            <Form.Label>Categories</Form.Label>

            {/* Selected summary */}
            <div className="mb-2" aria-live="polite">
              {selectedCategories.length ? (
                <>
                  {selectedCategories.map((c) => (
                    <Badge key={c} bg="secondary" style={{ marginRight: 6, marginBottom: 6 }}>
                      {c}
                    </Badge>
                  ))}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={clearCategories}
                    style={{ textDecoration: "none" }}
                  >
                    clear
                  </Button>
                </>
              ) : (
                <span style={{ color: "#6c757d" }}>No category selected yet.</span>
              )}
            </div>

            {/* Checkbox grid */}
            <div
              role="group"
              aria-label="Select one or more categories"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 4,
              }}
            >
              {CATEGORIES.map((cat) => (
                <Form.Check
                  key={cat}
                  type="checkbox"
                  id={`edit-cat-${cat}`}
                  label={cat}
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
              ))}
            </div>

            <Form.Text muted>
              Select one or more categories. If none are selected, it will default to "Uncategorized" on save.
            </Form.Text>
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
                justifyContent: combinedPreview.length ? "flex-start" : "center",
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
              ) : combinedPreview.length ? (
                combinedPreview.map((src, idx) => (
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
              <strong>Note:</strong> This form sends <code>keepImages</code> (the remaining existing URLs) so your API
              can overwrite the image list to: <em>kept existing</em> + <em>new uploads</em>.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            onHide();
            resetFileInput();
          }}
        >
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
