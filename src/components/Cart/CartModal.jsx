import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Form, Alert } from "react-bootstrap";
import toast from "react-hot-toast";
import axios from "axios";
import EditAddressModal from "../Profile/EditAddressModal";
import addressData from "../../data/addressData.json";

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

  useEffect(() => {
    if (show && user) {
      const fetchAddress = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/address/${user._id}`);
          const userAddress = res.data;
          if (userAddress && Object.keys(userAddress).length > 0) {
            setAddress(userAddress);
          }
        } catch (err) {
          console.error("❌ Error fetching user address:", err);
          toast.error("Unable to load your address.");
        }
      };

      fetchAddress();

      const regionList = Object.keys(addressData).map((code) => ({
        code,
        name: addressData[code].region_name,
      }));
      setOptions((prev) => ({ ...prev, regions: regionList }));
    }
  }, [show, user]);

  useEffect(() => {
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
    const regionData = addressData[address.region];
    const provinceData = regionData?.province_list[address.province];
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
    const regionData = addressData[address.region];
    const provinceData = regionData?.province_list[address.province];
    const cityData = provinceData?.municipality_list[address.city];
    if (cityData?.barangay_list) {
      setOptions((prev) => ({
        ...prev,
        barangays: cityData.barangay_list,
      }));
    }
  }, [address.city, address.province, address.region]);

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

  const isAddressComplete = () =>
    address.region &&
    address.province &&
    address.city &&
    address.barangay &&
    address.street &&
    address.houseNo;

  const handleOrderConfirmation = async () => {
    if (!user || !isAddressComplete()) return;

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/orders`, {
        userId: user._id,
        items: selectedItems,
        total: parseFloat(totalPrice),
        address,
        notes: "",
      });

      await axios.put(`${API_URL}/api/cart/${user._id}/remove`, {
        removeItems: selectedItems.map((i) => i.id),
      });

      setCartItems([]);
      setSelectedItems([]);
      setCartCount(0);
      setShowModal(false);
      toast.success("Order placed successfully!");
      onClose();
    } catch (err) {
      console.error("Order failed:", err);
      setError("Failed to place the order. Please try again.");
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
            setShowModal(false);
            setIsEditing(true);
          }}
        >
          Edit Address
        </button>
      </div>
      {Object.entries(address).map(([key, value]) => (
        <p className="mb-1" key={key}>
          <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}:</strong>{" "}
          {value || "Not Provided"}
        </p>
      ))}
    </div>
  );

    const handleSaveAddress = async () => {
      if (!user) return toast.error("User not found.");
      if (!validateAddress()) {
        return toast.error("Please fill in all the fields.");
      }
  
      Swal.fire({
        title: "Save Address?",
        text: "Are you sure you want to save this address?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, save it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.post(`${API_URL}/api/address/save`, {
              userId: user._id,
              address: address,
            });
  
            toast.success("Address saved successfully!");
            setIsAddressSaved(true);
            setIsEditing(false);
            setIsAdding(false);
          } catch (err) {
            console.error("Error saving address:", err);
            toast.error("Failed to save address.");
          }
        }
      });
    };

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
                    <Form.Control type="text" value={user?.displayName || "N/A"} disabled />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={user?.email || "N/A"} disabled />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control type="text" value={user?.phoneNumber || "N/A"} disabled />
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
                {selectedItems.length > 0 ? (
                  <div className="table-responsive" style={{ maxHeight: "200px", overflowY: "auto" }}>
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
                        {selectedItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <img
                                src={item.image || "/placeholder.jpg"}
                                alt={item.name}
                                style={{ width: "60px", height: "50px", objectFit: "cover" }}
                                className="img-thumbnail"
                              />
                            </td>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>₱{parseFloat(item.price).toFixed(2)}</td>
                            <td>₱{(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No items selected.</p>
                )}

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <h4>
                    Total: <span className="text-success">₱{parseFloat(totalPrice).toFixed(2)}</span>
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
