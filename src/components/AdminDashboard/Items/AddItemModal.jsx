
// import React, { useRef, useMemo } from "react";
// import { Modal, Form, Button, Badge } from "react-bootstrap";

// const AddItemModal = ({
//   show,
//   onHide,
//   newItem,
//   setNewItem,
//   handleAddItem,
//   loading,
//   categories,
// }) => {
//   const fileInputRef = useRef(null);

//   // Backward + forward compatibility:
//   // Prefer array newItem.categories; if absent, seed from legacy newItem.category
//   const selectedCategories = useMemo(() => {
//     if (Array.isArray(newItem?.categories)) return newItem.categories;
//     if (newItem?.category) return [newItem.category];
//     return [];
//   }, [newItem]);

//   const setCategories = (nextArr) => {
//     // Write to both fields to keep legacy consumers working
//     setNewItem({
//       ...newItem,
//       categories: nextArr,
//       category: nextArr[0] || "",
//     });
//   };

//   const toggleCategory = (cat) => {
//     const set = new Set(selectedCategories);
//     if (set.has(cat)) set.delete(cat);
//     else set.add(cat);
//     setCategories(Array.from(set));
//   };

//   const clearCategories = () => setCategories([]);

//   const handleOpenFilePicker = () => {
//     if (fileInputRef.current) fileInputRef.current.click();
//   };

//   const handleFiles = (files) => {
//     const incoming = Array.from(files || []);
//     // Limit to 5 images to match backend route (upload.array("images", 5))
//     const firstFive = incoming
//       .slice(0, 5)
//       .filter((f) => f.type?.startsWith("image/"));
//     setNewItem({ ...newItem, images: firstFive });
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

//   return (
//     <Modal show={show} onHide={onHide} backdrop="static">
//       <Modal.Header closeButton>
//         <Modal.Title>Add New Antique</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form>
//           {/* Name, Description, Price, Origin, Age */}
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
//                 value={newItem[field]}
//                 onChange={(e) =>
//                   setNewItem({ ...newItem, [field]: e.target.value })
//                 }
//                 as={field === "description" ? "textarea" : "input"}
//                 rows={field === "description" ? 3 : undefined}
//                 required={["name", "description", "price"].includes(field)}
//                 min={field === "price" ? 0 : undefined}
//                 step={field === "price" ? "0.01" : undefined}
//                 placeholder={
//                   field === "price"
//                     ? "e.g., 1500.00"
//                     : field === "age"
//                     ? "e.g., 80"
//                     : undefined
//                 }
//               />
//               {field === "price" && (
//                 <Form.Text muted>
//                   Enter a valid number (no currency symbols).
//                 </Form.Text>
//               )}
//             </Form.Group>
//           ))}

//           {/* ✅ Condition (1–10) */}
//           <Form.Group className="mb-3">
//             <Form.Label>Condition (1–10)</Form.Label>
//             <Form.Control
//               type="number"
//               value={newItem.condition}
//               onChange={(e) =>
//                 setNewItem({ ...newItem, condition: e.target.value })
//               }
//               min={1}
//               max={10}
//               step={1}
//               required
//               placeholder="Rate the item's condition from 1 (poor) to 10 (excellent)"
//             />
//             <Form.Text muted>
//               Required. Must be a whole number between 1 and 10.
//             </Form.Text>
//           </Form.Group>

//           {/* ✅ Categories (Multi-select via checkboxes; backward-friendly) */}
//           <Form.Group className="mb-3">
//             <Form.Label>Categories</Form.Label>

//             {/* Selected summary with quick clear */}
//             <div className="mb-2" aria-live="polite">
//               {selectedCategories.length ? (
//                 <>
//                   {selectedCategories.map((c) => (
//                     <Badge
//                       key={c}
//                       bg="secondary"
//                       style={{ marginRight: 6, marginBottom: 6 }}
//                     >
//                       {c}
//                     </Badge>
//                   ))}
//                   <Button
//                     variant="link"
//                     size="sm"
//                     onClick={clearCategories}
//                     style={{ textDecoration: "none" }}
//                   >
//                     clear
//                   </Button>
//                 </>
//               ) : (
//                 <span style={{ color: "#6c757d" }}>
//                   No category selected yet.
//                 </span>
//               )}
//             </div>

//             {/* Checkbox list */}
//             <div
//               role="group"
//               aria-label="Select one or more categories"
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
//                 gap: 4,
//               }}
//             >
//               {categories.map((cat) => (
//                 <Form.Check
//                   key={cat}
//                   type="checkbox"
//                   id={`cat-${cat}`}
//                   label={cat}
//                   checked={selectedCategories.includes(cat)}
//                   onChange={() => toggleCategory(cat)}
//                 />
//               ))}
//             </div>

//             <Form.Text muted>
//               Select one or more categories (default is "Uncategorized" if none
//               selected during save).
//             </Form.Text>
//           </Form.Group>

//           {/* ✅ Enhanced Images Input with dashed rectangle & previews */}
//           <Form.Group className="mb-3">
//             <Form.Label>Images</Form.Label>

//             {/* Hidden native input to keep multiple upload behavior intact */}
//             <Form.Control
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={(e) => handleFiles(e.target.files)}
//               style={{ display: "none" }}
//             />

//             {/* Drop area */}
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
//                 justifyContent: newItem.images?.length ? "flex-start" : "center",
//                 gap: 8,
//                 flexWrap: "wrap",
//                 cursor: "pointer",
//                 background: "#fafafa",
//               }}
//               aria-label="Image upload area"
//               title="Click to select images or drag & drop here"
//             >
//               {newItem.images?.length ? (
//                 newItem.images.map((file, idx) => (
//                   <div
//                     key={`${file.name}-${idx}`}
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
//                     }}
//                   >
//                     <img
//                       src={URL.createObjectURL(file)}
//                       alt={`preview-${idx}`}
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "cover",
//                         display: "block",
//                       }}
//                     />
//                   </div>
//                 ))
//               ) : (
//                 <div style={{ textAlign: "center" }}>
//                   <div style={{ fontWeight: 600, marginBottom: 4 }}>
//                     Click to upload or drag & drop
//                   </div>
//                   <div style={{ fontSize: 12, color: "#6c757d" }}>
//                     Up to 5 images • JPG/PNG • Clear, well-lit photos recommended
//                   </div>
//                 </div>
//               )}
//             </div>

//             <Form.Text muted>
//               Tip: You can select multiple images at once. Max 5 images per item
//               to match the upload limit.
//             </Form.Text>
//           </Form.Group>
//         </Form>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onHide}>
//           Close
//         </Button>
//         <Button variant="primary" onClick={handleAddItem} disabled={loading}>
//           {loading ? "Adding..." : "Add Antique"}
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default AddItemModal;

import React, { useRef, useMemo } from "react";
import { Modal, Form, Button, Badge } from "react-bootstrap";

const AddItemModal = ({
  show,
  onHide,
  newItem,
  setNewItem,
  handleAddItem,
  loading,
  categories,
}) => {
  const fileInputRef = useRef(null);

  // Backward + forward compatibility:
  // Prefer array newItem.categories; if absent, seed from legacy newItem.category
  const selectedCategories = useMemo(() => {
    if (Array.isArray(newItem?.categories)) return newItem.categories;
    if (newItem?.category) return [newItem.category];
    return [];
  }, [newItem]);

  const setCategories = (nextArr) => {
    // Write to both fields to keep legacy consumers working
    setNewItem({
      ...newItem,
      categories: nextArr,
      category: nextArr[0] || "",
    });
  };

  const toggleCategory = (cat) => {
    const set = new Set(selectedCategories);
    if (set.has(cat)) set.delete(cat);
    else set.add(cat);
    setCategories(Array.from(set));
  };

  const clearCategories = () => setCategories([]);

  const handleOpenFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFiles = (files) => {
    const incoming = Array.from(files || []);
    // Limit to 5 images to match backend route (upload.array("images", 5))
    const firstFive = incoming
      .slice(0, 5)
      .filter((f) => f.type?.startsWith("image/"));
    setNewItem({ ...newItem, images: firstFive });
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

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Add New Antique</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Name, Description, Price, Origin, Age */}
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
                value={newItem[field] ?? ""}
                onChange={(e) =>
                  setNewItem({ ...newItem, [field]: e.target.value })
                }
                as={field === "description" ? "textarea" : "input"}
                rows={field === "description" ? 3 : undefined}
                required={["name", "description", "price"].includes(field)}
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
              value={newItem.condition ?? ""}
              onChange={(e) =>
                setNewItem({ ...newItem, condition: e.target.value })
              }
              min={1}
              max={10}
              step={1}
              required
              placeholder="Rate the item's condition from 1 (poor) to 10 (excellent)"
            />
            <Form.Text muted>
              Required. Must be a whole number between 1 and 10.
            </Form.Text>
          </Form.Group>

          {/* Quantity */}
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              value={
                typeof newItem.quantity === "undefined" ? 1 : newItem.quantity
              }
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: e.target.value })
              }
              min={0}
              step={1}
              required
            />
            <Form.Text muted>
              Enter the available quantity (integer ≥ 0). Defaults to 1.
            </Form.Text>
          </Form.Group>

          {/* Categories (Multi-select via checkboxes; backward-friendly) */}
          <Form.Group className="mb-3">
            <Form.Label>Categories</Form.Label>

            {/* Selected summary with quick clear */}
            <div className="mb-2" aria-live="polite">
              {selectedCategories.length ? (
                <>
                  {selectedCategories.map((c) => (
                    <Badge
                      key={c}
                      bg="secondary"
                      style={{ marginRight: 6, marginBottom: 6 }}
                    >
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
                <span style={{ color: "#6c757d" }}>
                  No category selected yet.
                </span>
              )}
            </div>

            {/* Checkbox list */}
            <div
              role="group"
              aria-label="Select one or more categories"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 4,
              }}
            >
              {categories.map((cat) => (
                <Form.Check
                  key={cat}
                  type="checkbox"
                  id={`cat-${cat}`}
                  label={cat}
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
              ))}
            </div>

            <Form.Text muted>
              Select one or more categories (default is "Uncategorized" if none
              selected during save).
            </Form.Text>
          </Form.Group>

          {/* Enhanced Images Input with dashed rectangle & previews */}
          <Form.Group className="mb-3">
            <Form.Label>Images</Form.Label>

            {/* Hidden native input to keep multiple upload behavior intact */}
            <Form.Control
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              style={{ display: "none" }}
            />

            {/* Drop area */}
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
                justifyContent: newItem.images?.length ? "flex-start" : "center",
                gap: 8,
                flexWrap: "wrap",
                cursor: "pointer",
                background: "#fafafa",
              }}
              aria-label="Image upload area"
              title="Click to select images or drag & drop here"
            >
              {newItem.images?.length ? (
                newItem.images.map((file, idx) => (
                  <div
                    key={`${file.name ?? idx}-${idx}`}
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
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${idx}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    Click to upload or drag & drop
                  </div>
                  <div style={{ fontSize: 12, color: "#6c757d" }}>
                    Up to 5 images • JPG/PNG • Clear, well-lit photos recommended
                  </div>
                </div>
              )}
            </div>

            <Form.Text muted>
              Tip: You can select multiple images at once. Max 5 images per item
              to match the upload limit.
            </Form.Text>
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
