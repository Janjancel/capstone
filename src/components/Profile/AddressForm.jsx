import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import axios from "axios";
import EditAddressModal from "./EditAddressModal";
import addressData from "../../data/addressData.json";
import { useAuth } from "../../context/AuthContext";

const AddressForm = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useAuth();

  const [address, setAddress] = useState({
    region: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
    houseNo: "",
    zipCode: "",
  });

  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [isAdding, setIsAdding] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [options, setOptions] = useState({
    regions: [],
    provinces: [],
    cities: [],
    barangays: [],
  });

  useEffect(() => {
    setOptions({
      regions: Object.keys(addressData).map((regionCode) => ({
        code: regionCode,
        name: addressData[regionCode].region_name,
      })),
      provinces: [],
      cities: [],
      barangays: [],
    });
  }, []);

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!user || !user._id) return;

      try {
        const res = await axios.get(`${API_URL}/api/address/${user._id}`);
        const userAddress = res.data;

        if (userAddress && Object.keys(userAddress).length > 0) {
          setAddress(userAddress);
          setIsAddressSaved(true);
          setIsAdding(false);
        } else {
          setIsAddressSaved(false);
          setIsAdding(true);
        }
      } catch (err) {
        console.error("❌ Error fetching user address:", err);
        toast.error("Unable to load your address.");
      }
    };

    fetchUserAddress();
  }, [user]);

  useEffect(() => {
    if (!address.region) return;

    const regionData = addressData[address.region];
    if (regionData && regionData.province_list) {
      const filteredProvinces = Object.keys(regionData.province_list).map(
        (province) => ({
          name: province,
          code: province,
        })
      );

      setOptions((prev) => ({
        ...prev,
        provinces: filteredProvinces,
        cities: [],
        barangays: [],
      }));
    } else {
      setOptions((prev) => ({
        ...prev,
        provinces: [],
        cities: [],
        barangays: [],
      }));
    }
  }, [address.region]);

  useEffect(() => {
    if (!address.province) return;

    const regionData = addressData[address.region];
    const provinceData = regionData.province_list[address.province];
    if (provinceData && provinceData.municipality_list) {
      const filteredCities = Object.keys(provinceData.municipality_list).map(
        (city) => ({
          name: city,
          code: city,
        })
      );

      setOptions((prev) => ({
        ...prev,
        cities: filteredCities,
        barangays: [],
      }));
    } else {
      setOptions((prev) => ({
        ...prev,
        cities: [],
        barangays: [],
      }));
    }
  }, [address.province, address.region]);

  useEffect(() => {
    if (!address.city) return;

    const regionData = addressData[address.region];
    const provinceData = regionData.province_list[address.province];
    const cityData = provinceData.municipality_list[address.city];

    if (cityData && cityData.barangay_list) {
      setOptions((prev) => ({
        ...prev,
        barangays: cityData.barangay_list,
      }));
    } else {
      setOptions((prev) => ({
        ...prev,
        barangays: [],
      }));
    }
  }, [address.city, address.province, address.region]);

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

  const validateAddress = () => {
    return Object.values(address).every((field) => field !== "");
  };

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

  const renderDropdown = (label, name, list) => (
    <div className="mb-3">
      <label>{label}</label>
      <select
        className="form-control"
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
        {(list || []).map((item, idx) => (
          <option key={idx} value={item.code || item.name}>
            {item.name || item}
          </option>
        ))}
      </select>
    </div>
  );

  const renderViewMode = () => (
    <div className="card p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="mb-3">Address</h4>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => setIsEditing(true)}
        >
          Edit Address
        </button>
      </div>
      <address>
        {Object.entries(address).map(([key, value]) => (
          <p className="mb-1" key={key}>
            <strong>
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}:
            </strong>{" "}
            {value || "Not Provided"}
          </p>
        ))}
      </address>
    </div>
  );

  const renderAddMode = () => (
    <div className="card p-4 shadow-sm">
      <h4>Address</h4>
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
          value={address.street}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-3">
        <label>House No.</label>
        <input
          type="text"
          className="form-control"
          name="houseNo"
          value={address.houseNo}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-3">
        <label>ZIP Code</label>
        <input
          type="text"
          className="form-control"
          name="zipCode"
          value={address.zipCode}
          onChange={handleInputChange}
        />
      </div>

      <button className="btn btn-success mt-2" onClick={handleSaveAddress}>
        Save Address
      </button>
    </div>
  );

  return isAdding
    ? renderAddMode()
    : isAddressSaved && !isEditing
    ? renderViewMode()
    : (
      <EditAddressModal
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        address={address}
        setAddress={setAddress}
        handleSaveAddress={handleSaveAddress}
        options={options}
        renderDropdown={renderDropdown}
      />
    );
};

export default AddressForm;
