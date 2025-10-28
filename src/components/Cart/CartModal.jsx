// src/components/Cart/CartModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Spinner, Form, Alert } from "react-bootstrap";
import toast from "react-hot-toast";
import axios from "axios";
import EditAddressModal from "../Profile/EditAddressModal";
import addressData from "../../data/addressData.json";

// Use PUBLIC_URL so it works whether hosted at "/" or a subpath
const PLACEHOLDER_IMG = `${process.env.PUBLIC_URL || ""}/placeholder.jpg`;

/** ---------- Robust extractor: find the first usable URL in any shape ---------- */
function getFirstUrl(candidate) {
  if (!candidate) return null;

  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();

  if (Array.isArray(candidate)) {
    // First, any non-empty string
    const found = candidate.find((c) => typeof c === "string" && c.trim().length > 0);
    if (found) return found.trim();
    // Then, scan nested items (arrays/objects)
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

/** ---------- Shared image-display logic used in Cart + CartModal ---------- */
export function getItemImage(item) {
  return (
    getFirstUrl(item?.images) ||
    getFirstUrl(item?.image) ||
    PLACEHOLDER_IMG
  );
}

/** ---------- Helpers ---------- */
const formatPHP = (n) =>
  `₱${(Number(n) || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
  const API_URL = useMemo(() => process.env.REACT_APP_API_URL, []);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  const [address, setAddress] = useState({
    region: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
    houseNo: "",
    zipCode: "",
  });
  const [options, setOptions] = useState({
    regions: [],
    provinces: [],
    cities: [],
    barangays: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  /** ---------- Address inputs ---------- */
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

  /** ---------- Load regions + user address on open ---------- */
  useEffect(() => {
    const loadRegions = () => {
      const regionList = Object.keys(addressData).map((regionCode) => ({
        code: regionCode,
        name: addressData[regionCode].region_name,
      }));
      setOptions((prev) => ({ ...prev, regions: regionList }));
    };

    const fetchAddress = async () => {
      if (!user?._id) return;
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
        toast.error("Failed to load address.");
      }
    };

    if (show && user) {
      loadRegions();
      fetchAddress();
    }
  }, [show, user, API_URL]);

  /** ---------- Dependent dropdowns ---------- */
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
    if (!address.province || !address.region) return;
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
    if (!address.city || !address.province || !address.region) return;
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

  /** ---------- Address helpers ---------- */
  const isAddressComplete = () =>
    !!(address.region &&
      address.province &&
      address.city &&
      address.barangay &&
      address.street &&
      address.houseNo);

  const handleSaveAddress = async () => {
    if (!user?._id) return toast.error("User not found.");
    const isComplete = Object.values(address).every((field) => String(field || "").trim() !== "");
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

  /** ---------- Normalize items for order payload ---------- */
  const normalizeCartItems = (items = []) => {
    return items.map((it) => {
      const imageUrl = getItemImage(it);
      const id =
        it.cartItemId || it.itemId || it._id || it.id || it.sku || it.code;
      return {
        id, // your backend can map/validate this as needed
        name: it.name,
        quantity: Number(it.quantity) || 1,
        price: Number(it.price) || 0,
        image: imageUrl, // store URL (no uploading in this call)
      };
    });
  };

  /** ---------- Order creation (JSON, not multipart) ---------- */
  const handleOrderConfirmation = async () => {
    if (!user?._id) return toast.error("User not found.");
    if (!isAddressComplete()) {
      return toast.error("Please complete your shipping address first.");
    }

    setLoading(true);
    setError("");

    try {
      const items = normalizeCartItems(selectedItems);
      const total =
        items.reduce((sum, it) => sum + (it.quantity * it.price || 0), 0) || 0;

      const payload = {
        userId: user._id,
        items,
        address,
        notes: "",
        total,
      };

      // POST as JSON (no multipart)
      const orderRes = await axios.post(`${API_URL}/api/orders`, payload, {
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });

      const orderId = orderRes.data?._id || orderRes.data?.orderId;

      // 🔹 Notify admin (JSON)
      if (orderId) {
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
      }

      // 🔹 Remove items from cart (use a few common id keys as fallback)
      const idsToRemove = selectedItems.map(
        (i) => i.cartItemId || i._id || i.id || i.itemId
      );

      await axios.put(
        `${API_URL}/api/cart/${user._id}/remove`,
        { removeItems: idsToRemove },
        { headers: { "Content-Type": "application/json", ...authHeaders() } }
      );

      // 🔹 Reset UI
      setCartItems([]);
      setSelectedItems([]);
      setCartCount(0);
      setShowModal(false);
      toast.success("Order placed successfully!");
      onClose?.();
    } catch (err) {
      console.error("Order failed:", err);

      const status = err?.response?.status;
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error";

      setError(
        `Failed to place the order${
          status ? ` (HTTP ${status})` : ""
        }. ${serverMsg}`
      );
      toast.error("Order failed. Please review details and try again.");
    } finally {
      setLoading(false);
    }
  };

  /** ---------- View mode block for address ---------- */
  const renderViewMode = () => (
    <div className="card p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="mb-3">Shipping Address</h4>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => {
            setShowModal(false);
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
          {String(value || "").trim() || "Not Provided"}
        </p>
      ))}
    </div>
  );

  /** ---------- UI ---------- */
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
                {selectedItems?.length > 0 ? (
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
                          const imgSrc = getItemImage(item);
                          const subtotal =
                            (Number(item.quantity) || 0) *
                            (parseFloat(item.price) || 0);
                          return (
                            <tr key={item.id || item._id || item.itemId}>
                              <td>
                                <img
                                  src={imgSrc}
                                  alt={item.name}
                                  style={{
                                    width: "60px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                  className="img-thumbnail"
                                  onError={(e) => {
                                    e.currentTarget.src = PLACEHOLDER_IMG;
                                  }}
                                />
                              </td>
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                              <td>{formatPHP(parseFloat(item.price))}</td>
                              <td>{formatPHP(subtotal)}</td>
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
                      {formatPHP(parseFloat(totalPrice))}
                    </span>
                  </h4>
                  <Button
                    variant="success"
                    onClick={handleOrderConfirmation}
                    disabled={!isAddressComplete()}
                  >
                    Confirm Order
                  </Button>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
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
