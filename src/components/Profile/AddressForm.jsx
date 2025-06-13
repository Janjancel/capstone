import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import axios from "axios";
import EditAddressModal from "./EditAddressModal"; // Import EditAddressModal

// Importing the single JSON file
import addressData from "../../data/addressData.json";
import { useAuth } from "../../context/AuthContext"; // Auth context

const AddressForm = () => {
  const { user } = useAuth(); // ✅ pull user from context
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
  const [isAdding, setIsAdding] = useState(true); // State to check if user is adding an address
  const [isEditing, setIsEditing] = useState(false); // State to check if user is editing an address
  const [options, setOptions] = useState({
    regions: [],
    provinces: [],
    cities: [],
    barangays: [],
  });

  // Set regions from addressData.json
  useEffect(() => {
    setOptions({
      regions: Object.keys(addressData).map((regionCode) => ({
        code: regionCode,
        name: addressData[regionCode].region_name,
      })),
      provinces: [], // Will be updated based on region
      cities: [], // Will be updated based on province
      barangays: [], // Will be updated based on city
    });
  }, []);

  // Fetch user address from the backend if user is logged in
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!user || !user._id) return;

      try {
        const res = await axios.get(`/api/address/${user._id}`);
        const userAddress = res.data;

        if (userAddress && Object.keys(userAddress).length > 0) {
          setAddress(userAddress);         // Set the fetched address
          setIsAddressSaved(true);         // Mark as saved
          setIsAdding(false);              // Switch to view mode
        } else {
          setIsAddressSaved(false);        // No saved address
          setIsAdding(true);               // Show add form
        }
      } catch (err) {
        console.error("❌ Error fetching user address:", err);
        toast.error("Unable to load your address.");
      }
    };

    fetchUserAddress();
  }, [user]);  // Only depend on 'user' because the address is fetched only once per user

  // Handle region change and filter provinces accordingly
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
  }, [address.region]);  // Add address.region to the dependency array

  // Handle province change and filter cities accordingly
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
  }, [address.province, address.region]);  // Add address.province and address.region to the dependency array

  // Handle city change and filter barangays accordingly
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
  }, [address.city, address.province, address.region]);  // Add address.city, address.province, and address.region to the dependency array

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

  // Validate if all fields are filled before saving the address
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
          // Example of calling an API to save the address
          await axios.post("http://localhost:5000/api/address/save", {
            userId: user._id, // Assuming user has _id in the context
            address: address,
          });

          toast.success("Address saved successfully!");
          setIsAddressSaved(true); // Mark address as saved
          setIsEditing(false); // Close the modal after saving
          setIsAdding(false); // Stop adding mode
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
          onClick={() => setIsEditing(true)} // Open modal to edit address
        >
          Edit Address
        </button>
      </div>
      <address>
        {Object.entries(address).map(([key, value]) => (
          <p className="mb-1" key={key}>
            <strong>
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
              :
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

  return isAdding ? renderAddMode() : isAddressSaved && !isEditing ? renderViewMode() : (
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
