

import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Form, Alert } from "react-bootstrap";
import toast from "react-hot-toast";
import axios from "axios";
import EditAddressModal from "../Profile/EditAddressModal";
import addressData from "../../data/addressData.json";

// Use PUBLIC_URL so it works whether hosted at "/" or a subpath
const PLACEHOLDER_IMG = `${process.env.PUBLIC_URL || ""}/placeholder.jpg`;

/** ------------------------------- ID helper ------------------------------- */
function getItemId(candidate) {
  // Normalize possible keys coming from Cart flow vs Buy-Now flow
  // Cart items usually: { id }, direct item objects: { _id }, sometimes { itemId }
  return candidate?.id || candidate?.itemId || candidate?._id || null;
}

/** -------------------------------- Image helpers -------------------------------- */
function getFirstUrl(candidate) {
  // returns the first usable string URL from various shapes
  if (!candidate) return null;

  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();

  if (Array.isArray(candidate)) {
    // find the first non-empty string
    const found = candidate.find(
      (c) => typeof c === "string" && c.trim().length > 0
    );
    if (found) return found.trim();
    // allow array of objects like [{url:'...'}]
    for (const c of candidate) {
      const nested = getFirstUrl(c);
      if (nested) return nested;
    }
    return null;
  }

  if (typeof candidate === "object") {
    // common keys first
    const priorityKeys = ["front", "main", "cover", "primary", "side", "back", "url"];
    for (const k of priorityKeys) {
      if (k in candidate) {
        const nested = getFirstUrl(candidate[k]);
        if (nested) return nested;
      }
    }
    // then scan all props
    for (const k in candidate) {
      const nested = getFirstUrl(candidate[k]);
      if (nested) return nested;
    }
  }

  return null;
}

// ----- Shared image-display logic used in Cart + CartModal -----
export function getItemImage(item) {
  // Try the flexible shapes you use across the app
  return getFirstUrl(item?.images) || getFirstUrl(item?.image) || PLACEHOLDER_IMG;
}

/** One-time-fallback <img/> to avoid onError loops / flicker */
function SafeImg({ src, alt, style, className }) {
  const [finalSrc, setFinalSrc] = useState(src || PLACEHOLDER_IMG);

  useEffect(() => {
    setFinalSrc(src || PLACEHOLDER_IMG);
  }, [src]);

  return (
    <img
      src={finalSrc}
      alt={alt}
      style={style}
      className={className}
      onError={() => {
        if (finalSrc !== PLACEHOLDER_IMG) setFinalSrc(PLACEHOLDER_IMG);
      }}
    />
  );
}

/** -------------------------------- Component -------------------------------- */
const CartModal = ({
  show,
  onClose,
  user,
  totalPrice,
  selectedItems,
  setCartItems,
  setSelectedItems,
  setCartCount,
  setShowModal,
}) => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [address, setAddress] = useState({
    region: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
    houseNo: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [options, setOptions] = useState({
    regions: [],
    provinces: [],
    cities: [],
    barangays: [],
  });

  // Safer auth header helper (always returns object)
  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "region" ? { province: "", city: "", barangay: "" } : {}),
      ...(name === "province" ? { city: "", barangay: "" } : {}),
      ...(name === "city" ? { barangay: "" } : {}),
    }));
  };

  const renderDropdown = (label, name, list) => (
    <Form.Group className="mb-3" controlId={`form-${name}`}>
      <Form.Label>{label}</Form.Label>
      <Form.Select
        name={name}
        value={address[name]}
        onChange={handleInputChange}
        disabled={
          (name === "province" && !address.region) ||
          (name === "city" && !address.province) ||
          (name === "barangay" && !address.city)
        }
      >
        <option value="">Select {label}</option>
        {list.map((item, idx) => (
          <option key={idx} value={item.code || item.name}>
            {item.name || item}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );

  // --- Address and dependent dropdowns ---
  useEffect(() => {
    const loadRegions = () => {
      const regionList = Object.keys(addressData).map((regionCode) => ({
        code: regionCode,
        name: addressData[regionCode].region_name,
      }));
      setOptions((prev) => ({ ...prev, regions: regionList }));
    };

    if (show && user) {
      loadRegions();
      const fetchAddress = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/address/${user._id}`, {
            headers: authHeaders(),
          });
          const userAddress = res.data;
          if (userAddress && Object.keys(userAddress).length > 0) {
            setAddress(userAddress);
          }
        } catch (err) {
          console.error("Error fetching user address:", err);
          // don't block the modal; just notify
          toast.error("Failed to load address.");
        }
      };
      fetchAddress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, user, API_URL]);

  useEffect(() => {
    if (!address.region) return;
    const regionData = addressData[address.region];
    if (regionData?.province_list) {
      const provinces = Object.keys(regionData.province_list).map((name) => ({
        name,
        code: name,
      }));
      setOptions((prev) => ({
        ...prev,
        provinces,
        cities: [],
        barangays: [],
      }));
    }
  }, [address.region]);

  useEffect(() => {
    if (!address.province) return;
    const provinceData =
      addressData[address.region]?.province_list[address.province];
    if (provinceData?.municipality_list) {
      const cities = Object.keys(provinceData.municipality_list).map((name) => ({
        name,
        code: name,
      }));
      setOptions((prev) => ({
        ...prev,
        cities,
        barangays: [],
      }));
    }
  }, [address.province, address.region]);

  useEffect(() => {
    if (!address.city) return;
    const cityData =
      addressData[address.region]?.province_list[address.province]
        ?.municipality_list[address.city];
    if (cityData?.barangay_list) {
      setOptions((prev) => ({
        ...prev,
        barangays: cityData.barangay_list,
      }));
    }
  }, [address.city, address.province, address.region]);

  const isAddressComplete = () =>
    address.region &&
    address.province &&
    address.city &&
    address.barangay &&
    address.street &&
    address.houseNo;

  const handleSaveAddress = async () => {
    if (!user) return toast.error("User not found.");
    const isComplete = Object.values(address).every((field) => field !== "");
    if (!isComplete) return toast.error("Please fill in all the fields.");
    try {
      await axios.post(
        `${API_URL}/api/address/save`,
        { userId: user._id, address },
        { headers: { "Content-Type": "application/json", ...authHeaders() } }
      );
      toast.success("Address saved!");
      setIsEditing(false);
      setShowModal(true);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save address.");
    }
  };

  /** Build the clean JSON payload the backend expects (no multipart). */
  const buildOrderPayload = () => {
    const items = (selectedItems || []).map((i) => {
      const itemId = getItemId(i); // <-- FIX: normalize id for Buy Now
      const priceNum = Number(i.price) || Number(i.unitPrice) || 0;
      const qtyNum = Number(i.quantity) || 1;

      // Normalize images to an array of strings (if present)
      let imagesArr = [];
      if (Array.isArray(i.images)) {
        imagesArr = i.images
          .map((x) => getFirstUrl(x))
          .filter((u) => typeof u === "string" && u.trim().length > 0);
      } else if (typeof i.images === "string") {
        imagesArr = [i.images];
      } else if (i.image) {
        const one = getFirstUrl(i.image);
        if (one) imagesArr = [one];
      }

      return {
        id: itemId, // must exist for backend validation
        quantity: qtyNum,
        // snapshot fields
        name: i.name || i.title || i.itemName || `Item ${itemId || ""}`,
        price: priceNum,
        image: getItemImage(i), // primary image (fallback handled)
        images: imagesArr, // optional
        // frontend subtotal (server can recompute)
        subtotal: Number((qtyNum * priceNum).toFixed(2)),
      };
    });

    const numericTotal =
      items.reduce((acc, it) => acc + (Number(it.subtotal) || 0), 0) || 0;

    return {
      userId: user?._id,
      items,
      address,
      notes: "",
      // Provide total as hint; server should still validate
      total: Number(numericTotal.toFixed(2)),
    };
  };

  // --- Order confirmation ---
  const handleOrderConfirmation = async () => {
    if (!user) return toast.error("User not found.");
    if (!isAddressComplete())
      return toast.error("Please complete your shipping address first.");
    if (!selectedItems || selectedItems.length === 0)
      return toast.error("No items selected.");

    setError("");
    setLoading(true);
    try {
      const payload = buildOrderPayload();

      // Validate we have IDs (preempt 500s caused by undefined id)
      const missingIds = payload.items.filter((it) => !it.id).length;
      if (missingIds > 0) {
        throw new Error("One or more items are missing an ID. Please retry.");
      }

      // Prefer JSON submission
      const orderRes = await axios.post(`${API_URL}/api/orders`, payload, {
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });

      const created = orderRes.data;
      const orderId = created?._id || created?.order?._id || created?.orderId;

      // 🔹 After order creation: mark each ordered item as unavailable (availability: false)
      // Best-effort: attempt to update each item individually; log but don't block on failures.
      const orderedIds = payload.items.map((it) => it.id).filter(Boolean);
      let availabilityFailures = 0;
      for (const id of orderedIds) {
        try {
          await axios.put(
            `${API_URL}/api/items/${id}`,
            { availability: false },
            { headers: { "Content-Type": "application/json", ...authHeaders() } }
          );
        } catch (availErr) {
          // If item already sold/unavailable, backend might return 409 or 400 — handle gracefully
          availabilityFailures += 1;
          console.warn(`Failed to update availability for item ${id}:`, availErr);
        }
      }

      // 🔹 Create notification for admin (best-effort)
      if (orderId) {
        try {
          await axios.post(
            `${API_URL}/api/notifications`,
            {
              userId: user._id,
              orderId,
              for: "order",
              role: "admin",
              status: "new",
              message: `New order placed by ${user.displayName || user.email}`,
            },
            { headers: { "Content-Type": "application/json", ...authHeaders() } }
          );
        } catch (notifErr) {
          console.warn("Notification create failed (non-blocking):", notifErr);
        }
      }

      // 🔹 Remove ordered items from cart (only if we actually have cart item ids)
      try {
        const removeIds = (selectedItems || [])
          .map((i) => getItemId(i))
          .filter(Boolean);
        if (removeIds.length > 0) {
          await axios.put(
            `${API_URL}/api/cart/${user._id}/remove`,
            { removeItems: removeIds },
            { headers: { "Content-Type": "application/json", ...authHeaders() } }
          );
        }

        // Locally remove from UI state as well
        try {
          setCartItems && setCartItems((prev = []) => prev.filter((it) => !removeIds.includes(getItemId(it))));
        } catch (e) {}
        try {
          setSelectedItems && setSelectedItems([]);
        } catch (e) {}
      } catch (rmErr) {
        console.warn("Cart cleanup failed (non-blocking):", rmErr);
      }

      // 🔹 Reset UI state
      try { setCartCount && setCartCount(0); } catch {}
      try { setShowModal && setShowModal(false); } catch {}

      // Notify other parts of the app that cart changed.
      // Use number of removed items as detail so listeners can update badges incrementally.
      const removedCount = (selectedItems || []).length;
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: removedCount }));

      // Provide user feedback
      if (availabilityFailures > 0) {
        toast.success(`Order placed (but ${availabilityFailures} item(s) failed to update availability).`);
      } else {
        toast.success("Order placed successfully!");
      }

      onClose && onClose();
    } catch (err) {
      // Robust error extraction
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to place the order. Please try again.";
      console.error("Order failed:", err);

      // If server says item was already unavailable / conflict (409),
      // remove the unavailable items locally and inform the user.
      if (err?.response?.status === 409) {
        toast.error("Order failed: one or more items are no longer available.");
        // remove locally to avoid showing unavailable item
        try {
          const unavailableIds = (err?.response?.data?.unavailable || []).map(String);
          if (unavailableIds.length > 0) {
            setCartItems && setCartItems((prev = []) => prev.filter((it) => !unavailableIds.includes(String(getItemId(it)))));
            setSelectedItems && setSelectedItems([]);
            setCartCount && setCartCount((prev = 0) => Math.max(0, prev - unavailableIds.length));
            window.dispatchEvent(new CustomEvent("cartUpdated", { detail: -unavailableIds.length }));
          } else {
            // fallback: remove all selected items
            setCartItems && setCartItems((prev = []) => prev.filter((it) => !((selectedItems || []).map(getItemId).includes(getItemId(it)))));
            setSelectedItems && setSelectedItems([]);
            setCartCount && setCartCount(0);
            window.dispatchEvent(new CustomEvent("cartUpdated", { detail: - (selectedItems || []).length }));
          }
        } catch (cleanupErr) {
          console.warn("Cleanup after 409 failed:", cleanupErr);
        }
      }

      setError(serverMsg);
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderViewMode = () => (
    <div className="card p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="mb-3">Shipping Address</h4>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => {
            setShowModal && setShowModal(false);
            setIsEditing(true);
          }}
        >
          Edit Address
        </button>
      </div>
      {Object.entries(address).map(([key, value]) => (
        <p className="mb-1" key={key}>
          <strong>
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
            :
          </strong>{" "}
          {value || "Not Provided"}
        </p>
      ))}
    </div>
  );

  const formatPHP = (n) =>
    `₱${(Number(n) || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Compute live total from selectedItems to stay consistent even if totalPrice prop is stale
  const computedTotal = (selectedItems || []).reduce((sum, it) => {
    const qty = Number(it.quantity) || 1;
    const price = Number(it.price) || Number(it.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  return (
    <>
      {!isEditing && (
        <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
          <Modal.Header closeButton>
            <Modal.Title>Confirm Your Order</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : error ? (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            ) : (
              <>
                <h5>User Information</h5>
                <Form>
                  <Form.Group className="mb-2">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={user?.displayName || "N/A"}
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={user?.email || "N/A"}
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={user?.phoneNumber || "N/A"}
                      disabled
                    />
                  </Form.Group>

                  {!isAddressComplete() && (
                    <Alert variant="warning">
                      Your shipping address is incomplete. Please{" "}
                      <a href="/profile">add your address</a> in your profile first.
                    </Alert>
                  )}

                  {renderViewMode()}
                </Form>

                <h5 className="mt-4">Order Summary</h5>
                {selectedItems && selectedItems.length > 0 ? (
                  <div
                    className="table-responsive"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    <table className="table table-bordered text-center align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Image</th>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((item) => {
                          const id = getItemId(item) || item.name || Math.random();
                          const imgSrc = getItemImage(item);
                          const qty = Number(item.quantity) || 1;
                          const price = Number(item.price) || Number(item.unitPrice) || 0;
                          return (
                            <tr key={id}>
                              <td>
                                <SafeImg
                                  src={imgSrc}
                                  alt={item.name || "Item"}
                                  style={{
                                    width: "60px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                  className="img-thumbnail"
                                />
                              </td>
                              <td>{item.name || item.title || `Item ${getItemId(item) || ""}`}</td>
                              <td>{qty}</td>
                              <td>{formatPHP(price)}</td>
                              <td>{formatPHP(qty * price)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No items selected.</p>
                )}

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <h4>
                    Total:{" "}
                    <span className="text-success">
                      {formatPHP(computedTotal || totalPrice || 0)}
                    </span>
                  </h4>
                  <Button
                    variant="success"
                    onClick={handleOrderConfirmation}
                    disabled={!isAddressComplete() || loading || !selectedItems || selectedItems.length === 0}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Order"
                    )}
                  </Button>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {isEditing && (
        <EditAddressModal
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          address={address}
          setAddress={setAddress}
          handleSaveAddress={handleSaveAddress}
          options={options}
          renderDropdown={renderDropdown}
        />
      )}
    </>
  );
};

export default CartModal;



//==============================================================================================================







//----------------------------------------------------------------------------------------------



