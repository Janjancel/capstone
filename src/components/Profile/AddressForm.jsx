// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import toast from "react-hot-toast";
// import axios from "axios";
// import EditAddressModal from "./EditAddressModal";
// import addressData from "../../data/addressData.json";
// import { useAuth } from "../../context/AuthContext";

// const AddressForm = () => {
//   const API_URL = process.env.REACT_APP_API_URL;
//   const { user } = useAuth();

//   const [address, setAddress] = useState({
//     region: "",
//     province: "",
//     city: "",
//     barangay: "",
//     street: "",
//     houseNo: "",
//     zipCode: "",
//   });

//   const [isAddressSaved, setIsAddressSaved] = useState(false);
//   const [isAdding, setIsAdding] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [options, setOptions] = useState({
//     regions: [],
//     provinces: [],
//     cities: [],
//     barangays: [],
//   });

//   useEffect(() => {
//     setOptions({
//       regions: Object.keys(addressData).map((regionCode) => ({
//         code: regionCode,
//         name: addressData[regionCode].region_name,
//       })),
//       provinces: [],
//       cities: [],
//       barangays: [],
//     });
//   }, []);

//   useEffect(() => {
//     const fetchUserAddress = async () => {
//       if (!user || !user._id) return;

//       try {
//         const res = await axios.get(`${API_URL}/api/address/${user._id}`);
//         const userAddress = res.data;

//         if (userAddress && Object.keys(userAddress).length > 0) {
//           setAddress(userAddress);
//           setIsAddressSaved(true);
//           setIsAdding(false);
//         } else {
//           setIsAddressSaved(false);
//           setIsAdding(true);
//         }
//       } catch (err) {
//         console.error("❌ Error fetching user address:", err);
//         toast.error("Unable to load your address.");
//       }
//     };

//     fetchUserAddress();
//   }, [user, API_URL]);

//   useEffect(() => {
//     if (!address.region) return;

//     const regionData = addressData[address.region];
//     if (regionData && regionData.province_list) {
//       const filteredProvinces = Object.keys(regionData.province_list).map(
//         (province) => ({
//           name: province,
//           code: province,
//         })
//       );

//       setOptions((prev) => ({
//         ...prev,
//         provinces: filteredProvinces,
//         cities: [],
//         barangays: [],
//       }));
//     } else {
//       setOptions((prev) => ({
//         ...prev,
//         provinces: [],
//         cities: [],
//         barangays: [],
//       }));
//     }
//   }, [address.region]);

//   useEffect(() => {
//     if (!address.province) return;

//     const regionData = addressData[address.region];
//     const provinceData = regionData?.province_list?.[address.province];
//     if (provinceData && provinceData.municipality_list) {
//       const filteredCities = Object.keys(provinceData.municipality_list).map(
//         (city) => ({
//           name: city,
//           code: city,
//         })
//       );

//       setOptions((prev) => ({
//         ...prev,
//         cities: filteredCities,
//         barangays: [],
//       }));
//     } else {
//       setOptions((prev) => ({
//         ...prev,
//         cities: [],
//         barangays: [],
//       }));
//     }
//   }, [address.province, address.region]);

//   useEffect(() => {
//     if (!address.city) return;

//     const regionData = addressData[address.region];
//     const provinceData = regionData?.province_list?.[address.province];
//     const cityData = provinceData?.municipality_list?.[address.city];

//     if (cityData && cityData.barangay_list) {
//       setOptions((prev) => ({
//         ...prev,
//         barangays: cityData.barangay_list,
//       }));
//     } else {
//       setOptions((prev) => ({
//         ...prev,
//         barangays: [],
//       }));
//     }
//   }, [address.city, address.province, address.region]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;

//     setAddress((prev) => ({
//       ...prev,
//       [name]: value,
//       ...(name === "region" ? { province: "", city: "", barangay: "" } : {}),
//       ...(name === "province" ? { city: "", barangay: "" } : {}),
//       ...(name === "city" ? { barangay: "" } : {}),
//     }));
//   };

//   const validateAddress = () => {
//     return Object.values(address).every((field) => field !== "");
//   };

//   const handleSaveAddress = async () => {
//     if (!user) return toast.error("User not found.");
//     if (!validateAddress()) {
//       return toast.error("Please fill in all the fields.");
//     }

//     Swal.fire({
//       title: "Save Address?",
//       text: "Are you sure you want to save this address?",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Yes, save it!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await axios.post(`${API_URL}/api/address/save`, {
//             userId: user._id,
//             address: address,
//           });

//           toast.success("Address saved successfully!");
//           setIsAddressSaved(true);
//           setIsEditing(false);
//           setIsAdding(false);
//         } catch (err) {
//           console.error("Error saving address:", err);
//           toast.error("Failed to save address.");
//         }
//       }
//     });
//   };

//   const renderDropdown = (label, name, list) => (
//     <div className="mb-3">
//       <label>{label}</label>
//       <select
//         className="form-control"
//         name={name}
//         value={address[name]}
//         onChange={handleInputChange}
//         disabled={
//           (name === "province" && !address.region) ||
//           (name === "city" && !address.province) ||
//           (name === "barangay" && !address.city)
//         }
//       >
//         <option value="">Select {label}</option>
//         {(list || []).map((item, idx) => (
//           <option key={idx} value={item.code || item.name}>
//             {item.name || item}
//           </option>
//         ))}
//       </select>
//     </div>
//   );

//   const renderViewMode = () => (
//     <div className="card p-4 shadow-sm">
//       <div className="d-flex justify-content-between align-items-center">
//         <h4 className="mb-3">Address</h4>
//         <button
//           className="btn btn-sm btn-outline-primary"
//           onClick={() => setIsEditing(true)}
//         >
//           Edit Address
//         </button>
//       </div>
//       <address>
//         {Object.entries(address).map(([key, value]) => (
//           <p className="mb-1" key={key}>
//             <strong>
//               {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}:
//             </strong>{" "}
//             {value || "Not Provided"}
//           </p>
//         ))}
//       </address>
//     </div>
//   );

//   const renderAddMode = () => (
//     <div className="card p-4 shadow-sm">
//       <h4>Address</h4>
//       {renderDropdown("Region", "region", options.regions)}
//       {renderDropdown("Province", "province", options.provinces)}
//       {renderDropdown("City", "city", options.cities)}
//       {renderDropdown("Barangay", "barangay", options.barangays)}

//       <div className="mb-3">
//         <label>Subdivision / Street</label>
//         <input
//           type="text"
//           className="form-control"
//           name="street"
//           value={address.street}
//           onChange={handleInputChange}
//         />
//       </div>

//       <div className="mb-3">
//         <label>House No.</label>
//         <input
//           type="text"
//           className="form-control"
//           name="houseNo"
//           value={address.houseNo}
//           onChange={handleInputChange}
//         />
//       </div>

//       <div className="mb-3">
//         <label>ZIP Code</label>
//         <input
//           type="text"
//           className="form-control"
//           name="zipCode"
//           value={address.zipCode}
//           onChange={handleInputChange}
//         />
//       </div>

//       <button className="btn btn-success mt-2" onClick={handleSaveAddress}>
//         Save Address
//       </button>
//     </div>
//   );

//   return isAdding
//     ? renderAddMode()
//     : isAddressSaved && !isEditing
//     ? renderViewMode()
//     : (
//       <EditAddressModal
//         isEditing={isEditing}
//         setIsEditing={setIsEditing}
//         address={address}
//         setAddress={setAddress}
//         handleSaveAddress={handleSaveAddress}
//         options={options}
//         renderDropdown={renderDropdown}
//       />
//     );
// };

// export default AddressForm;


// import React, { useState, useEffect, useRef } from "react";
// import Swal from "sweetalert2";
// import toast from "react-hot-toast";
// import axios from "axios";
// import EditAddressModal from "./EditAddressModal";
// import addressData from "../../data/addressData.json";
// import { useAuth } from "../../context/AuthContext";

// const AddressForm = () => {
//   const API_URL =
//     process.env.REACT_APP_API_URL || "https://capstone-backend-k4uu.onrender.com";
//   const { user } = useAuth();

//   const [address, setAddress] = useState({
//     region: "",
//     province: "",
//     city: "",
//     barangay: "",
//     street: "",
//     houseNo: "",
//     zipCode: "",
//   });

//   // coordinates pinned locally
//   const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
//   // true when coords were resolved locally (found by geocoder)
//   const [isCoordinatesFound, setIsCoordinatesFound] = useState(false);
//   // true when coords were saved to backend successfully
//   const [coordsSaved, setCoordsSaved] = useState(false);

//   const [isAddressSaved, setIsAddressSaved] = useState(false);
//   const [isAdding, setIsAdding] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [options, setOptions] = useState({
//     regions: [],
//     provinces: [],
//     cities: [],
//     barangays: [],
//   });

//   // inline search query for manual geocoding
//   const [searchQuery, setSearchQuery] = useState("");

//   // a small ref used to debounce automatic geocoding
//   const geocodeTimeoutRef = useRef(null);

//   useEffect(() => {
//     setOptions({
//       regions: Object.keys(addressData).map((regionCode) => ({
//         code: regionCode,
//         name: addressData[regionCode].region_name,
//       })),
//       provinces: [],
//       cities: [],
//       barangays: [],
//     });
//   }, []);

//   useEffect(() => {
//     const fetchUserAddress = async () => {
//       if (!user || !user._id) return;

//       try {
//         const res = await axios.get(`${API_URL}/api/address/${user._id}`);
//         const userAddress = res.data;

//         if (userAddress && Object.keys(userAddress).length > 0) {
//           setAddress(userAddress);
//           setIsAddressSaved(true);
//           setIsAdding(false);

//           // Try to fetch coordinates for the user if backend has them
//           try {
//             const coordsRes = await axios.get(
//               `${API_URL}/api/address/coordinates/${user._id}`
//             );
//             if (
//               coordsRes.data &&
//               coordsRes.data.lat !== undefined &&
//               coordsRes.data.lng !== undefined &&
//               coordsRes.data.lat !== null &&
//               coordsRes.data.lng !== null
//             ) {
//               setCoordinates({
//                 lat: coordsRes.data.lat,
//                 lng: coordsRes.data.lng,
//               });
//               setIsCoordinatesFound(true);
//               setCoordsSaved(true); // coordinates exist on server
//             }
//           } catch (err) {
//             // ignore — will geocode locally if needed
//           }
//         } else {
//           setIsAddressSaved(false);
//           setIsAdding(true);
//         }
//       } catch (err) {
//         console.error("❌ Error fetching user address:", err);
//         toast.error("Unable to load your address.");
//       }
//     };

//     fetchUserAddress();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user, API_URL]);

//   useEffect(() => {
//     if (!address.region) return;

//     const regionData = addressData[address.region];
//     if (regionData && regionData.province_list) {
//       const filteredProvinces = Object.keys(regionData.province_list).map(
//         (province) => ({
//           name: province,
//           code: province,
//         })
//       );

//       setOptions((prev) => ({
//         ...prev,
//         provinces: filteredProvinces,
//         cities: [],
//         barangays: [],
//       }));
//     } else {
//       setOptions((prev) => ({
//         ...prev,
//         provinces: [],
//         cities: [],
//         barangays: [],
//       }));
//     }
//   }, [address.region]);

//   useEffect(() => {
//     if (!address.province) return;

//     const regionData = addressData[address.region];
//     const provinceData = regionData?.province_list?.[address.province];
//     if (provinceData && provinceData.municipality_list) {
//       const filteredCities = Object.keys(provinceData.municipality_list).map(
//         (city) => ({
//           name: city,
//           code: city,
//         })
//       );

//       setOptions((prev) => ({
//         ...prev,
//         cities: filteredCities,
//         barangays: [],
//       }));
//     } else {
//       setOptions((prev) => ({
//         ...prev,
//         cities: [],
//         barangays: [],
//       }));
//     }
//   }, [address.province, address.region]);

//   useEffect(() => {
//     if (!address.city) return;

//     const regionData = addressData[address.region];
//     const provinceData = regionData?.province_list?.[address.province];
//     const cityData = provinceData?.municipality_list?.[address.city];

//     if (cityData && cityData.barangay_list) {
//       setOptions((prev) => ({
//         ...prev,
//         barangays: cityData.barangay_list,
//       }));
//     } else {
//       setOptions((prev) => ({
//         ...prev,
//         barangays: [],
//       }));
//     }
//   }, [address.city, address.province, address.region]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;

//     setAddress((prev) => ({
//       ...prev,
//       [name]: value,
//       ...(name === "region" ? { province: "", city: "", barangay: "" } : {}),
//       ...(name === "province" ? { city: "", barangay: "" } : {}),
//       ...(name === "city" ? { barangay: "" } : {}),
//     }));

//     // when user changes address parts, coordinates are outdated
//     setCoordsSaved(false);
//     setIsCoordinatesFound(false);
//     setCoordinates({ lat: null, lng: null });
//   };

//   // Build query string from available address parts
//   const buildGeocodeQuery = () => {
//     const parts = [];
//     if (address.houseNo) parts.push(address.houseNo);
//     if (address.street) parts.push(address.street);
//     if (address.barangay) parts.push(address.barangay);
//     if (address.city) parts.push(address.city);
//     if (address.province) parts.push(address.province);
//     if (address.region) parts.push(address.region);
//     parts.push("Philippines");
//     return parts.filter(Boolean).join(", ");
//   };

//   // geocode function that queries Nominatim (OpenStreetMap)
//   const geocodeAddress = async (query) => {
//     if (!query || !query.trim()) return null;
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//           query
//         )}`
//       );
//       const data = await res.json();
//       if (data && data.length > 0) {
//         const { lat, lon } = data[0];
//         return { lat: parseFloat(lat), lng: parseFloat(lon) };
//       }
//       return null;
//     } catch (err) {
//       console.error("Geocode error:", err);
//       return null;
//     }
//   };

//   // debounce geocoding when important fields change (auto attempt)
//   useEffect(() => {
//     // only run if at least barangay/city/province/region present (we try as soon as we have something)
//     const shouldAttempt =
//       address.region || address.province || address.city || address.barangay;

//     if (!shouldAttempt) return;

//     // clear previous timer
//     if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);

//     geocodeTimeoutRef.current = setTimeout(async () => {
//       const q = buildGeocodeQuery();
//       if (!q) return;

//       const toastId = toast.loading("Finding coordinates for selected address...");
//       const coords = await geocodeAddress(q);

//       toast.dismiss(toastId);
//       if (coords) {
//         setCoordinates(coords);
//         setIsCoordinatesFound(true);
//         setCoordsSaved(false); // not saved to server yet
//         toast.success("Coordinates found and pinned for selected address ✅");
//       } else {
//         setIsCoordinatesFound(false);
//         setCoordinates({ lat: null, lng: null });
//         setCoordsSaved(false);
//         toast.error("Unable to find coordinates for the selected address.");
//       }
//     }, 700); // 700ms debounce

//     return () => {
//       if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     address.region,
//     address.province,
//     address.city,
//     address.barangay,
//     address.street,
//     address.houseNo,
//   ]);

//   // manual inline search triggered by the user using the search bar
//   const handleManualSearch = async () => {
//     const q = searchQuery?.trim() || buildGeocodeQuery();
//     if (!q) {
//       toast.error("Please enter search terms or select more address fields.");
//       return;
//     }

//     const toastId = toast.loading("Searching for coordinates...");
//     const coords = await geocodeAddress(q);
//     toast.dismiss(toastId);

//     if (coords) {
//       setCoordinates(coords);
//       setIsCoordinatesFound(true);
//       setCoordsSaved(false);
//       toast.success("Coordinates found and pinned ✅");
//     } else {
//       setIsCoordinatesFound(false);
//       setCoordinates({ lat: null, lng: null });
//       setCoordsSaved(false);
//       toast.error("No coordinates found for that query.");
//     }
//   };

//   const validateAddress = () => {
//     // Ensure required fields are present
//     return (
//       address.region &&
//       address.province &&
//       address.city &&
//       address.barangay &&
//       address.street !== undefined &&
//       address.houseNo !== undefined &&
//       address.zipCode !== undefined
//     );
//   };

//   const handleSaveAddress = async () => {
//     if (!user) return toast.error("User not found.");
//     if (!validateAddress()) {
//       return toast.error("Please fill in all the fields.");
//     }

//     const result = await Swal.fire({
//       title: "Save Address?",
//       text: "Are you sure you want to save this address?",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Yes, save it!",
//     });

//     if (!result.isConfirmed) return;

//     try {
//       // 1) Save address
//       await axios.post(`${API_URL}/api/address/save`, {
//         userId: user._id,
//         address,
//       });

//       toast.success("Address saved successfully!");

//       // 2) Ensure we have coordinates; if not, attempt one more instant geocode
//       let coordsToSave = coordinates;
//       if (!coordsToSave || !coordsToSave.lat || !coordsToSave.lng) {
//         const q = buildGeocodeQuery();
//         if (q) {
//           const toastId = toast.loading("Trying to resolve coordinates...");
//           const coords = await geocodeAddress(q);
//           toast.dismiss(toastId);
//           if (coords) {
//             coordsToSave = coords;
//             setCoordinates(coords);
//             setIsCoordinatesFound(true);
//             toast.success("Coordinates found and pinned for selected address ✅");
//           } else {
//             setIsCoordinatesFound(false);
//             toast.error("Coordinates could not be found automatically.");
//           }
//         }
//       }

//       // 3) Save coordinates if available
//       if (coordsToSave && coordsToSave.lat && coordsToSave.lng) {
//         // Your router currently expects integer lat/lng; round here.
//         const latInt = Math.round(Number(coordsToSave.lat));
//         const lngInt = Math.round(Number(coordsToSave.lng));
//         try {
//           await axios.post(`${API_URL}/api/address/coordinates/save`, {
//             userId: user._id,
//             coordinates: { lat: latInt, lng: lngInt },
//           });
//           toast.success("Coordinates saved successfully!");
//           setCoordsSaved(true); // hide search bar
//         } catch (err) {
//           console.error("Failed to save coordinates:", err);
//           toast.error("Failed to save coordinates to server.");
//           setCoordsSaved(false);
//         }
//       } else {
//         // coordinates missing - notify user but address is saved
//         toast("Address saved, but coordinates were not available.");
//         setCoordsSaved(false);
//       }

//       setIsAddressSaved(true);
//       setIsEditing(false);
//       setIsAdding(false);
//     } catch (err) {
//       console.error("Error saving address:", err);
//       toast.error("Failed to save address.");
//     }
//   };

//   // dropdown renderer remains the same
//   const renderDropdown = (label, name, list) => (
//     <div className="mb-3">
//       <label>{label}</label>
//       <select
//         className="form-control"
//         name={name}
//         value={address[name]}
//         onChange={handleInputChange}
//         disabled={
//           (name === "province" && !address.region) ||
//           (name === "city" && !address.province) ||
//           (name === "barangay" && !address.city)
//         }
//       >
//         <option value="">Select {label}</option>
//         {(list || []).map((item, idx) => (
//           <option key={idx} value={item.code || item.name}>
//             {item.name || item}
//           </option>
//         ))}
//       </select>
//     </div>
//   );

//   const renderViewMode = () => (
//     <div className="card p-4 shadow-sm">
//       <div className="d-flex justify-content-between align-items-center">
//         <h4 className="mb-3">Address</h4>
//         <button
//           className="btn btn-sm btn-outline-primary"
//           onClick={() => setIsEditing(true)}
//         >
//           Edit Address
//         </button>
//       </div>
//       <address>
//         {Object.entries(address).map(([key, value]) => (
//           <p className="mb-1" key={key}>
//             <strong>
//               {key.charAt(0).toUpperCase() +
//                 key.slice(1).replace(/([A-Z])/g, " $1")}
//               :
//             </strong>{" "}
//             {value || "Not Provided"}
//           </p>
//         ))}

//         <p className="mb-1">
//           <strong>Coordinates:</strong>{" "}
//           {coordsSaved
//             ? `${coordinates.lat}, ${coordinates.lng}`
//             : isCoordinatesFound
//             ? `${coordinates.lat}, ${coordinates.lng} (not saved yet)`
//             : "Not pinned"}
//         </p>

//         {!coordsSaved && (
//           <small className="text-muted d-block">
//             Tip: Use the search bar while editing to pin exact coordinates, then save
//             the address to persist them.
//           </small>
//         )}
//       </address>
//     </div>
//   );

//   const renderAddMode = () => (
//     <div className="card p-4 shadow-sm">
//       <h4>Address</h4>
//       {renderDropdown("Region", "region", options.regions)}
//       {renderDropdown("Province", "province", options.provinces)}
//       {renderDropdown("City", "city", options.cities)}
//       {renderDropdown("Barangay", "barangay", options.barangays)}

//       <div className="mb-3">
//         <label>Subdivision / Street</label>
//         <input
//           type="text"
//           className="form-control"
//           name="street"
//           value={address.street}
//           onChange={handleInputChange}
//         />
//       </div>

//       <div className="mb-3">
//         <label>House No.</label>
//         <input
//           type="text"
//           className="form-control"
//           name="houseNo"
//           value={address.houseNo}
//           onChange={handleInputChange}
//         />
//       </div>

//       <div className="mb-3">
//         <label>ZIP Code</label>
//         <input
//           type="text"
//           className="form-control"
//           name="zipCode"
//           value={address.zipCode}
//           onChange={handleInputChange}
//         />
//       </div>

//       <div className="mb-3">
//         <label>Coordinates</label>
//         <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//           {/* Show search bar when coordinates are NOT saved to server */}
//           {!coordsSaved ? (
//             <>
//               <input
//                 className="form-control"
//                 placeholder="Search (e.g. Brgy, City, Province) — optional"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     e.preventDefault();
//                     handleManualSearch();
//                   }
//                 }}
//                 style={{ flex: 1 }}
//                 aria-label="Coordinates search"
//               />
//               <button
//                 className="btn btn-outline-primary"
//                 type="button"
//                 onClick={handleManualSearch}
//                 title="Search for coordinates"
//               >
//                 Search
//               </button>
//               <button
//                 className="btn btn-outline-secondary"
//                 type="button"
//                 onClick={() => {
//                   // use auto-built query from address (fallback)
//                   const q = buildGeocodeQuery();
//                   if (!q) {
//                     toast.error("Please select address fields or enter search terms.");
//                     return;
//                   }
//                   setSearchQuery(q);
//                   // perform search
//                   handleManualSearch();
//                 }}
//                 title="Use address fields to search"
//               >
//                 Use Address
//               </button>
//             </>
//           ) : (
//             // coordsSaved === true -> hide search and show pinned coords
//             <div>
//               <small>Saved: {coordinates.lat}, {coordinates.lng}</small>
//             </div>
//           )}
//         </div>

//         {/* display current pinned coordinates (even if not saved) */}
//         <div style={{ marginTop: 8 }}>
//           {isCoordinatesFound ? (
//             <small className="text-success">
//               Pinned: {coordinates.lat}, {coordinates.lng}{" "}
//               {!coordsSaved && <em>(not saved yet)</em>}
//             </small>
//           ) : (
//             <small className="text-muted">Coordinates not found yet</small>
//           )}
//         </div>

//         {/* Notes underneath to avoid confusion */}
//         <div style={{ marginTop: 8 }}>
//           <small className="text-muted d-block">
//             Notes:
//           </small>
//           <ul style={{ marginTop: 4 }}>
//             <li style={{ fontSize: 12, color: "#6c757d" }}>
//               You can type a custom search (e.g. "Brgy. X, City Y") or click "Use Address"
//               to geocode from the fields above.
//             </li>
//             <li style={{ fontSize: 12, color: "#6c757d" }}>
//               After coordinates appear as "Pinned", press <strong>Save Address</strong> to
//               persist them to our servers. Once saved, the search bar will disappear and
//               the saved coordinates will be shown.
//             </li>
//             <li style={{ fontSize: 12, color: "#6c757d" }}>
//               If coordinates can't be resolved automatically, try adding more address detail.
//             </li>
//           </ul>
//         </div>
//       </div>

//       <button className="btn btn-success mt-2" onClick={handleSaveAddress}>
//         Save Address
//       </button>
//     </div>
//   );

//   // Pass coordinates and setCoordinates to modal so edits can also use them
//   return isAdding
//     ? renderAddMode()
//     : isAddressSaved && !isEditing
//     ? renderViewMode()
//     : (
//       <EditAddressModal
//         isEditing={isEditing}
//         setIsEditing={setIsEditing}
//         address={address}
//         setAddress={setAddress}
//         handleSaveAddress={handleSaveAddress}
//         options={options}
//         renderDropdown={renderDropdown}
//         coordinates={coordinates}
//         setCoordinates={setCoordinates}
//         isCoordinatesFound={isCoordinatesFound}
//         setIsCoordinatesFound={setIsCoordinatesFound}
//         coordsSaved={coordsSaved}
//         setCoordsSaved={setCoordsSaved}
//       />
//     );
// };

// export default AddressForm;


//==================================================


import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import axios from "axios";
import EditAddressModal from "./EditAddressModal";
import addressData from "../../data/addressData.json";
import { useAuth } from "../../context/AuthContext";

const AddressForm = () => {
  const API_URL =
    process.env.REACT_APP_API_URL || "https://capstone-backend-k4uu.onrender.com";
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

  // coordinates pinned locally
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  // true when coords were resolved locally (found by geocoder)
  const [isCoordinatesFound, setIsCoordinatesFound] = useState(false);
  // true when coords were saved to backend successfully
  const [coordsSaved, setCoordsSaved] = useState(false);

  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [isAdding, setIsAdding] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [options, setOptions] = useState({
    regions: [],
    provinces: [],
    cities: [],
    barangays: [],
  });

  // inline search query for manual geocoding
  const [searchQuery, setSearchQuery] = useState("");

  // a small ref used to debounce automatic geocoding
  const geocodeTimeoutRef = useRef(null);

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

          // Try to fetch coordinates for the user if backend has them
          try {
            const coordsRes = await axios.get(
              `${API_URL}/api/address/coordinates/${user._id}`
            );
            if (
              coordsRes.data &&
              coordsRes.data.lat !== undefined &&
              coordsRes.data.lng !== undefined &&
              coordsRes.data.lat !== null &&
              coordsRes.data.lng !== null
            ) {
              setCoordinates({
                lat: coordsRes.data.lat,
                lng: coordsRes.data.lng,
              });
              setIsCoordinatesFound(true);
              setCoordsSaved(true); // coordinates exist on server
            }
          } catch (err) {
            // ignore — will geocode locally if needed
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, API_URL]);

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
    const provinceData = regionData?.province_list?.[address.province];
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
    const provinceData = regionData?.province_list?.[address.province];
    const cityData = provinceData?.municipality_list?.[address.city];

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

    // when user changes address parts, coordinates are outdated
    setCoordsSaved(false);
    setIsCoordinatesFound(false);
    setCoordinates({ lat: null, lng: null });
  };

  // Build query string from available address parts
  const buildGeocodeQuery = () => {
    const parts = [];
    if (address.houseNo) parts.push(address.houseNo);
    if (address.street) parts.push(address.street);
    if (address.barangay) parts.push(address.barangay);
    if (address.city) parts.push(address.city);
    if (address.province) parts.push(address.province);
    if (address.region) parts.push(address.region);
    parts.push("Philippines");
    return parts.filter(Boolean).join(", ");
  };

  // geocode function that queries Nominatim (OpenStreetMap)
  const geocodeAddress = async (query) => {
    if (!query || !query.trim()) return null;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      }
      return null;
    } catch (err) {
      console.error("Geocode error:", err);
      return null;
    }
  };

  // debounce geocoding when important fields change (auto attempt)
  useEffect(() => {
    // only run if at least barangay/city/province/region present (we try as soon as we have something)
    const shouldAttempt =
      address.region || address.province || address.city || address.barangay;

    if (!shouldAttempt) return;

    // clear previous timer
    if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);

    geocodeTimeoutRef.current = setTimeout(async () => {
      const q = buildGeocodeQuery();
      if (!q) return;

      const toastId = toast.loading("Finding coordinates for selected address...");
      const coords = await geocodeAddress(q);

      toast.dismiss(toastId);
      if (coords) {
        setCoordinates(coords);
        setIsCoordinatesFound(true);
        setCoordsSaved(false); // not saved to server yet
        toast.success("Coordinates found and pinned for selected address ✅");
      } else {
        setIsCoordinatesFound(false);
        setCoordinates({ lat: null, lng: null });
        setCoordsSaved(false);
        toast.error("Unable to find coordinates for the selected address.");
      }
    }, 700); // 700ms debounce

    return () => {
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    address.region,
    address.province,
    address.city,
    address.barangay,
    address.street,
    address.houseNo,
  ]);

  // manual inline search triggered by the user using the search bar
  const handleManualSearch = async () => {
    const q = searchQuery?.trim() || buildGeocodeQuery();
    if (!q) {
      toast.error("Please enter search terms or select more address fields.");
      return;
    }

    const toastId = toast.loading("Searching for coordinates...");
    const coords = await geocodeAddress(q);
    toast.dismiss(toastId);

    if (coords) {
      setCoordinates(coords);
      setIsCoordinatesFound(true);
      setCoordsSaved(false);
      toast.success("Coordinates found and pinned ✅");
    } else {
      setIsCoordinatesFound(false);
      setCoordinates({ lat: null, lng: null });
      setCoordsSaved(false);
      toast.error("No coordinates found for that query.");
    }
  };

  const validateAddress = () => {
    // Ensure required fields are present
    return (
      address.region &&
      address.province &&
      address.city &&
      address.barangay &&
      address.street !== undefined &&
      address.houseNo !== undefined &&
      address.zipCode !== undefined
    );
  };

  // build a safe endpoint (trim trailing slash)
  const buildEndpoint = (path) => {
    const base = (API_URL || "").replace(/\/$/, "");
    if (!base) return path; // relative path fallback
    return `${base}${path}`;
  };

  // try post, but if 404 returned, attempt fallback endpoints
  const trySaveCoordinatesWithFallback = async (payload) => {
    const endpointsToTry = [
      buildEndpoint("/api/address/coordinates/save"),
      buildEndpoint("/api/address/coordinates"),
      // also try relative (in case your dev proxy is configured to forward)
      "/api/address/coordinates/save",
      "/api/address/coordinates",
    ];

    for (let i = 0; i < endpointsToTry.length; i++) {
      const ep = endpointsToTry[i];
      try {
        const resp = await axios.post(ep, payload);
        return resp;
      } catch (err) {
        // if 404, move to next fallback; otherwise rethrow or return error for handling
        if (err && err.response && err.response.status === 404) {
          console.warn(`Coordinates save returned 404 at ${ep}, trying next fallback...`);
          // also print server body for easier debugging (dev server often returns index HTML)
          if (err.response.data) {
            console.debug("Server response body:", err.response.data);
          }
          continue;
        }
        // other error (400, 500, network, CORS) — bubble up so caller can display appropriate message
        throw err;
      }
    }

    // if all fallbacks exhausted, throw a 404-like error
    const e = new Error("All coordinate save endpoints returned 404 or failed.");
    e.code = "ALL_404";
    throw e;
  };

  const handleSaveAddress = async () => {
    if (!user) return toast.error("User not found.");
    if (!validateAddress()) {
      return toast.error("Please fill in all the fields.");
    }

    const result = await Swal.fire({
      title: "Save Address?",
      text: "Are you sure you want to save this address?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save it!",
    });

    if (!result.isConfirmed) return;

    try {
      // 1) Save address
      await axios.post(`${API_URL}/api/address/save`, {
        userId: user._id,
        address,
      });

      toast.success("Address saved successfully!");

      // 2) Ensure we have coordinates; if not, attempt one more instant geocode
      let coordsToSave = coordinates;
      if (!coordsToSave || !coordsToSave.lat || !coordsToSave.lng) {
        const q = buildGeocodeQuery();
        if (q) {
          const toastId = toast.loading("Trying to resolve coordinates...");
          const coords = await geocodeAddress(q);
          toast.dismiss(toastId);
          if (coords) {
            coordsToSave = coords;
            setCoordinates(coords);
            setIsCoordinatesFound(true);
            toast.success("Coordinates found and pinned for selected address ✅");
          } else {
            setIsCoordinatesFound(false);
            toast.error("Coordinates could not be found automatically.");
          }
        }
      }

      // 3) Save coordinates if available
      if (coordsToSave && coordsToSave.lat && coordsToSave.lng) {
        // Your router currently expects integer lat/lng; round here.
        const latInt = Math.round(Number(coordsToSave.lat));
        const lngInt = Math.round(Number(coordsToSave.lng));

        try {
          await trySaveCoordinatesWithFallback({
            userId: user._id,
            coordinates: { lat: latInt, lng: lngInt },
          });

          toast.success("Coordinates saved successfully!");
          setCoordsSaved(true); // hide search bar
        } catch (err) {
          console.error("Failed to save coordinates after fallbacks:", err);
          // Show more helpful message when all endpoints returned 404 (likely dev proxy issue)
          if (err && (err.code === "ALL_404" || (err.response && err.response.status === 404))) {
            toast.error("Failed to save coordinates (404). Check backend route and dev proxy.");
          } else if (err && err.response && err.response.data) {
            // If server sent a useful message, show it (be careful with HTML bodies)
            const msg =
              typeof err.response.data === "string"
                ? err.response.data.substring(0, 300) // don't dump huge HTML
                : JSON.stringify(err.response.data);
            toast.error(`Failed to save coordinates: ${msg}`);
          } else {
            toast.error("Failed to save coordinates to server.");
          }
          setCoordsSaved(false);
        }
      } else {
        // coordinates missing - notify user but address is saved
        toast("Address saved, but coordinates were not available.");
        setCoordsSaved(false);
      }

      setIsAddressSaved(true);
      setIsEditing(false);
      setIsAdding(false);
    } catch (err) {
      console.error("Error saving address:", err);
      toast.error("Failed to save address.");
    }
  };

  // dropdown renderer remains the same
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
              {key.charAt(0).toUpperCase() +
                key.slice(1).replace(/([A-Z])/g, " $1")}
              :
            </strong>{" "}
            {value || "Not Provided"}
          </p>
        ))}

        <p className="mb-1">
          <strong>Coordinates:</strong>{" "}
          {coordsSaved
            ? `${coordinates.lat}, ${coordinates.lng}`
            : isCoordinatesFound
            ? `${coordinates.lat}, ${coordinates.lng} (not saved yet)`
            : "Not pinned"}
        </p>

        {!coordsSaved && (
          <small className="text-muted d-block">
            Tip: Use the search bar while editing to pin exact coordinates, then save
            the address to persist them.
          </small>
        )}
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

      <div className="mb-3">
        <label>Coordinates</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Show search bar when coordinates are NOT saved to server */}
          {!coordsSaved ? (
            <>
              <input
                className="form-control"
                placeholder="Search (e.g. Brgy, City, Province) — optional"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleManualSearch();
                  }
                }}
                style={{ flex: 1 }}
                aria-label="Coordinates search"
              />
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={handleManualSearch}
                title="Search for coordinates"
              >
                Search
              </button>
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => {
                  // use auto-built query from address (fallback)
                  const q = buildGeocodeQuery();
                  if (!q) {
                    toast.error("Please select address fields or enter search terms.");
                    return;
                  }
                  setSearchQuery(q);
                  // perform search
                  handleManualSearch();
                }}
                title="Use address fields to search"
              >
                Use Address
              </button>
            </>
          ) : (
            // coordsSaved === true -> hide search and show pinned coords
            <div>
              <small>Saved: {coordinates.lat}, {coordinates.lng}</small>
            </div>
          )}
        </div>

        {/* display current pinned coordinates (even if not saved) */}
        <div style={{ marginTop: 8 }}>
          {isCoordinatesFound ? (
            <small className="text-success">
              Pinned: {coordinates.lat}, {coordinates.lng}{" "}
              {!coordsSaved && <em>(not saved yet)</em>}
            </small>
          ) : (
            <small className="text-muted">Coordinates not found yet</small>
          )}
        </div>

        {/* Notes underneath to avoid confusion */}
        <div style={{ marginTop: 8 }}>
          <small className="text-muted d-block">
            Notes:
          </small>
          <ul style={{ marginTop: 4 }}>
            <li style={{ fontSize: 12, color: "#6c757d" }}>
              You can type a custom search (e.g. "Brgy. X, City Y") or click "Use Address"
              to geocode from the fields above.
            </li>
            <li style={{ fontSize: 12, color: "#6c757d" }}>
              After coordinates appear as "Pinned", press <strong>Save Address</strong> to
              persist them to our servers. Once saved, the search bar will disappear and
              the saved coordinates will be shown.
            </li>
            <li style={{ fontSize: 12, color: "#6c757d" }}>
              If coordinates can't be resolved automatically, try adding more address detail.
            </li>
          </ul>
        </div>
      </div>

      <button className="btn btn-success mt-2" onClick={handleSaveAddress}>
        Save Address
      </button>
    </div>
  );

  // Pass coordinates and setCoordinates to modal so edits can also use them
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
        coordinates={coordinates}
        setCoordinates={setCoordinates}
        isCoordinatesFound={isCoordinatesFound}
        setIsCoordinatesFound={setIsCoordinatesFound}
        coordsSaved={coordsSaved}
        setCoordsSaved={setCoordsSaved}
      />
    );
};

export default AddressForm;
