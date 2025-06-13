import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const EditAddressModal = ({ isEditing, setIsEditing, address, setAddress, handleSaveAddress, options, renderDropdown }) => {
  // Safety check to make sure address is always an object
  const safeAddress = address || {
    region: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
    houseNo: "",
    zipCode: "",
  };

  return (
    <Modal show={isEditing} onHide={() => setIsEditing(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Address</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {renderDropdown("Region", "region", options.regions)}
        {renderDropdown("Province", "province", options.provinces)}
        {renderDropdown("City", "city", options.cities)}
        {renderDropdown("Barangay", "barangay", options.barangays)}

        <div className="mb-3">
          <label>Subdivision / Street</label>
          <input
            type="text"
            className="form-control"
            name="street"
            value={safeAddress.street}
            onChange={(e) => setAddress({ ...safeAddress, street: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>House No.</label>
          <input
            type="text"
            className="form-control"
            name="houseNo"
            value={safeAddress.houseNo}
            onChange={(e) => setAddress({ ...safeAddress, houseNo: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>ZIP Code</label>
          <input
            type="text"
            className="form-control"
            name="zipCode"
            value={safeAddress.zipCode}
            onChange={(e) => setAddress({ ...safeAddress, zipCode: e.target.value })}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setIsEditing(false)}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveAddress}>
          Save Address
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditAddressModal;
