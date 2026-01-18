

// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Box,
//   Typography,
//   IconButton,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import toast from "react-hot-toast";

// /**
//  * EditAddressModal
//  *
//  * Props:
//  * - isEditing: bool
//  * - setIsEditing: fn
//  * - address: object (controlled)
//  * - setAddress: fn
//  * - handleSaveAddress: fn (parent will save address & coordinates)
//  * - options: { regions, provinces, cities, barangays }
//  * - renderDropdown: fn (keeps parity with parent)
//  *
//  * Optional props for coordinates handling (recommended):
//  * - coordinates: { lat, lng }
//  * - setCoordinates: fn
//  * - isCoordinatesFound: bool
//  * - setIsCoordinatesFound: fn
//  * - coordsSaved: bool
//  * - setCoordsSaved: fn
//  *
//  * This modal provides an inline search bar next to "Coordinates" when coords are not yet
//  * saved (coordsSaved === false). After successful save on the parent, coordsSaved should be
//  * toggled to true so the UI hides the search bar and displays saved coordinates.
//  */
// const EditAddressModal = ({
//   isEditing,
//   setIsEditing,
//   address,
//   setAddress,
//   handleSaveAddress,
//   options,
//   renderDropdown,
//   coordinates = { lat: null, lng: null },
//   setCoordinates = () => {},
//   isCoordinatesFound = false,
//   setIsCoordinatesFound = () => {},
//   coordsSaved = false,
//   setCoordsSaved = () => {},
// }) => {
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   // Ensure address is an object
//   const safeAddress = address || {
//     region: "",
//     province: "",
//     city: "",
//     barangay: "",
//     street: "",
//     houseNo: "",
//     zipCode: "",
//   };

//   // Utility: build fallback query from address fields (full address fallback)
//   const buildGeocodeQuery = () => {
//     const parts = [];
//     if (safeAddress.houseNo) parts.push(safeAddress.houseNo);
//     if (safeAddress.street) parts.push(safeAddress.street);
//     if (safeAddress.barangay) parts.push(safeAddress.barangay);
//     if (safeAddress.city) parts.push(safeAddress.city);
//     if (safeAddress.province) parts.push(safeAddress.province);
//     if (safeAddress.region) parts.push(safeAddress.region);
//     parts.push("Philippines");
//     return parts.filter(Boolean).join(", ");
//   };

//   // New helper: build query using only barangay, city, province (what Use Address should use)
//   const buildBarangayCityProvinceQuery = () => {
//     const parts = [];
//     if (safeAddress.barangay) parts.push(safeAddress.barangay);
//     if (safeAddress.city) parts.push(safeAddress.city);
//     if (safeAddress.province) parts.push(safeAddress.province);
//     parts.push("Philippines");
//     return parts.filter(Boolean).join(", ");
//   };

//   // Geocode with Nominatim
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

//   // Called when user clicks Search or presses Enter in the search box
//   const handleManualSearch = async () => {
//     const q = (searchQuery || "").trim() || buildGeocodeQuery();
//     if (!q) {
//       toast.error("Please enter search terms or complete more address fields.");
//       return;
//     }

//     const toastId = toast.loading("Searching for coordinates...");
//     const coords = await geocodeAddress(q);
//     toast.dismiss(toastId);

//     if (coords) {
//       setCoordinates(coords);
//       setIsCoordinatesFound(true);
//       setCoordsSaved(false); // still needs to be saved to backend by parent
//       toast.success("Coordinates found and pinned ✅");
//     } else {
//       setIsCoordinatesFound(false);
//       setCoordinates({ lat: null, lng: null });
//       setCoordsSaved(false);
//       toast.error("No coordinates found for that query.");
//     }
//   };

//   const handleSave = () => {
//     // Call parent's save; parent is responsible for persisting coordinates
//     handleSaveAddress?.();
//     setIsEditing(false);
//     setShowConfirmation(true);
//   };

//   return (
//     <>
//       <Dialog
//         open={isEditing}
//         onClose={() => setIsEditing(false)}
//         fullWidth
//         maxWidth="sm"
//       >
//         <DialogTitle sx={{ m: 0, p: 2 }}>
//           <Box display="flex" alignItems="center" justifyContent="space-between">
//             <Typography variant="h6">Edit Address</Typography>
//             <IconButton aria-label="close" onClick={() => setIsEditing(false)}>
//               <CloseIcon />
//             </IconButton>
//           </Box>
//         </DialogTitle>

//         <DialogContent dividers>
//           <Box display="flex" flexDirection="column" gap={2}>
//             {renderDropdown("Region", "region", options.regions)}
//             {renderDropdown("Province", "province", options.provinces)}
//             {renderDropdown("City", "city", options.cities)}
//             {renderDropdown("Barangay", "barangay", options.barangays)}

//             <TextField
//               label="Subdivision / Street"
//               variant="outlined"
//               fullWidth
//               name="street"
//               value={safeAddress.street}
//               onChange={(e) =>
//                 setAddress({ ...safeAddress, street: e.target.value })
//               }
//             />

//             <TextField
//               label="House No."
//               variant="outlined"
//               fullWidth
//               name="houseNo"
//               value={safeAddress.houseNo}
//               onChange={(e) =>
//                 setAddress({ ...safeAddress, houseNo: e.target.value })
//               }
//             />

//             <TextField
//               label="ZIP Code"
//               variant="outlined"
//               fullWidth
//               name="zipCode"
//               value={safeAddress.zipCode}
//               onChange={(e) =>
//                 setAddress({ ...safeAddress, zipCode: e.target.value })
//               }
//             />

//             {/* Coordinates area with inline search & notes */}
//             <Box>
//               <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                 Coordinates
//               </Typography>

//               <Box display="flex" gap={1} alignItems="center">
//                 {/* If coords are saved on server, show saved coords only */}
//                 {coordsSaved ? (
//                   <Box>
//                     <Typography variant="body2">
//                       Saved: {coordinates?.lat}, {coordinates?.lng}
//                     </Typography>
//                   </Box>
//                 ) : (
//                   // coords not saved -> show search bar + buttons
//                   <>
//                     <TextField
//                       placeholder="Search (e.g. Brgy, City, Province) — optional"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") {
//                           e.preventDefault();
//                           handleManualSearch();
//                         }
//                       }}
//                       size="small"
//                       fullWidth
//                       inputProps={{ "aria-label": "Coordinates search" }}
//                     />
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       onClick={handleManualSearch}
//                     >
//                       Search
//                     </Button>
//                     <Button
//                       variant="text"
//                       size="small"
//                       onClick={() => {
//                         // Use only barangay, city, province when "Use Address" is pressed
//                         const q = buildBarangayCityProvinceQuery();
//                         if (!q) {
//                           toast.error("Please select barangay, city, and province first.");
//                           return;
//                         }
//                         setSearchQuery(q);
//                         handleManualSearch();
//                       }}
//                     >
//                       Use Address
//                     </Button>
//                   </>
//                 )}
//               </Box>

//               {/* Show currently pinned coordinates (even if not saved) */}
//               <Box mt={1}>
//                 {isCoordinatesFound && coordinates?.lat && coordinates?.lng ? (
//                   <Typography variant="body2" color="success.main">
//                     Pinned: {coordinates.lat}, {coordinates.lng}{" "}
//                     {!coordsSaved && <em>(not saved yet)</em>}
//                   </Typography>
//                 ) : (
//                   <Typography variant="body2" color="text.secondary">
//                     Coordinates not pinned yet
//                   </Typography>
//                 )}
//               </Box>

//               {/* Notes */}
//               <Box mt={1}>
//                 <Typography variant="caption" color="text.secondary" display="block">
//                   Notes:
//                 </Typography>
//                 <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 18 }}>
//                   <li style={{ fontSize: 13, color: "#6c757d" }}>
//                     Type a custom search (e.g. "Brgy. X, City Y") or click "Use Address"
//                     to geocode from the fields above.
//                   </li>
//                   <li style={{ fontSize: 13, color: "#6c757d" }}>
//                     <strong>Use Address:</strong> will use <em>only</em> Barangay, City,
//                     and Province (plus "Philippines") when resolving coordinates.
//                   </li>
//                   <li style={{ fontSize: 13, color: "#6c757d" }}>
//                     After coordinates appear as "Pinned", press <strong>Save</strong> to
//                     persist them to the server. Once saved, the search bar will be hidden
//                     and the saved coordinates will be displayed.
//                   </li>
//                   <li style={{ fontSize: 13, color: "#6c757d" }}>
//                     If coordinates can't be resolved, try adding more address detail or use
//                     the manual search field to enter a different query.
//                   </li>
//                 </ul>
//               </Box>
//             </Box>
//           </Box>
//         </DialogContent>

//         <DialogActions>
//           <Button
//             variant="contained"
//             color="error"
//             onClick={() => setIsEditing(false)}
//           >
//             Close
//           </Button>
//           <Button variant="outlined" color="primary" onClick={handleSave}>
//             Save Address
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={showConfirmation}
//         autoHideDuration={3000}
//         onClose={() => setShowConfirmation(false)}
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//       >
//         <Alert
//           onClose={() => setShowConfirmation(false)}
//           severity="success"
//           sx={{ width: "100%" }}
//         >
//           Address saved successfully!
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default EditAddressModal;


import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";

/**
 * EditAddressModal
 *
 * Props:
 * - isEditing: bool
 * - setIsEditing: fn
 * - address: object (controlled)
 * - setAddress: fn
 * - handleSaveAddress: fn (parent will save address & coordinates)
 * - options: { regions, provinces, cities, barangays }
 * - renderDropdown: fn (keeps parity with parent)
 *
 * Optional props for coordinates handling (recommended):
 * - coordinates: { lat, lng }
 * - setCoordinates: fn
 * - isCoordinatesFound: bool
 * - setIsCoordinatesFound: fn
 * - coordsSaved: bool
 * - setCoordsSaved: fn
 *
 * This modal allows the user to edit coordinates directly (latitude/longitude)
 * as well as search for them via the existing search field. When the user
 * edits the numeric lat/lng fields we mark coordsSaved = false so the parent
 * knows coordinates have changed and must be persisted when the user presses
 * "Save Address".
 */
const EditAddressModal = ({
  isEditing,
  setIsEditing,
  address,
  setAddress,
  handleSaveAddress,
  options,
  renderDropdown,
  coordinates = { lat: null, lng: null },
  setCoordinates = () => {},
  isCoordinatesFound = false,
  setIsCoordinatesFound = () => {},
  coordsSaved = false,
  setCoordsSaved = () => {},
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Local inputs for latitude and longitude so user can type freely
  const [latInput, setLatInput] = useState(
    coordinates && coordinates.lat !== null && coordinates.lat !== undefined
      ? String(coordinates.lat)
      : ""
  );
  const [lngInput, setLngInput] = useState(
    coordinates && coordinates.lng !== null && coordinates.lng !== undefined
      ? String(coordinates.lng)
      : ""
  );

  // Keep local inputs in sync when parent coordinates prop changes
  useEffect(() => {
    setLatInput(
      coordinates && coordinates.lat !== null && coordinates.lat !== undefined
        ? String(coordinates.lat)
        : ""
    );
    setLngInput(
      coordinates && coordinates.lng !== null && coordinates.lng !== undefined
        ? String(coordinates.lng)
        : ""
    );
  }, [coordinates]);

  // Ensure address is an object
  const safeAddress =
    address || {
      region: "",
      province: "",
      city: "",
      barangay: "",
      street: "",
      houseNo: "",
      zipCode: "",
    };

  // Utility: build fallback query from address fields (full address fallback)
  const buildGeocodeQuery = () => {
    const parts = [];
    if (safeAddress.houseNo) parts.push(safeAddress.houseNo);
    if (safeAddress.street) parts.push(safeAddress.street);
    if (safeAddress.barangay) parts.push(safeAddress.barangay);
    if (safeAddress.city) parts.push(safeAddress.city);
    if (safeAddress.province) parts.push(safeAddress.province);
    if (safeAddress.region) parts.push(safeAddress.region);
    parts.push("Philippines");
    return parts.filter(Boolean).join(", ");
  };

  // New helper: build query using only barangay, city, province (what Use Address should use)
  const buildBarangayCityProvinceQuery = () => {
    const parts = [];
    if (safeAddress.barangay) parts.push(safeAddress.barangay);
    if (safeAddress.city) parts.push(safeAddress.city);
    if (safeAddress.province) parts.push(safeAddress.province);
    parts.push("Philippines");
    return parts.filter(Boolean).join(", ");
  };

  // Geocode with Nominatim
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

  // Called when user clicks Search or presses Enter in the search box
  const handleManualSearch = async () => {
    const q = (searchQuery || "").trim() || buildGeocodeQuery();
    if (!q) {
      toast.error("Please enter search terms or complete more address fields.");
      return;
    }

    const toastId = toast.loading("Searching for coordinates...");
    const coords = await geocodeAddress(q);
    toast.dismiss(toastId);

    if (coords) {
      setCoordinates(coords);
      setIsCoordinatesFound(true);
      setCoordsSaved(false); // still needs to be saved to backend by parent
      toast.success("Coordinates found and pinned ✅");
    } else {
      setIsCoordinatesFound(false);
      setCoordinates({ lat: null, lng: null });
      setCoordsSaved(false);
      toast.error("No coordinates found for that query.");
    }
  };

  // Validate coordinate numeric ranges
  const validateLatLng = (lat, lng) => {
    if (lat === "" || lng === "" || lat === null || lng === null) return false;
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return false;
    if (latNum < -90 || latNum > 90) return false;
    if (lngNum < -180 || lngNum > 180) return false;
    return true;
  };

  const handleSave = () => {
    // Call parent's save; parent is responsible for persisting coordinates
    handleSaveAddress?.();
    setIsEditing(false);
    setShowConfirmation(true);
  };

  return (
    <>
      <Dialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Edit Address</Typography>
            <IconButton aria-label="close" onClick={() => setIsEditing(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
            {renderDropdown("Region", "region", options.regions)}
            {renderDropdown("Province", "province", options.provinces)}
            {renderDropdown("City", "city", options.cities)}
            {renderDropdown("Barangay", "barangay", options.barangays)}

            <TextField
              label="Subdivision / Street"
              variant="outlined"
              fullWidth
              name="street"
              value={safeAddress.street}
              onChange={(e) => setAddress({ ...safeAddress, street: e.target.value })}
            />

            <TextField
              label="House No."
              variant="outlined"
              fullWidth
              name="houseNo"
              value={safeAddress.houseNo}
              onChange={(e) => setAddress({ ...safeAddress, houseNo: e.target.value })}
            />

            <TextField
              label="ZIP Code"
              variant="outlined"
              fullWidth
              name="zipCode"
              value={safeAddress.zipCode}
              onChange={(e) => setAddress({ ...safeAddress, zipCode: e.target.value })}
            />

            {/* Coordinates area with inline search & notes */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Coordinates
              </Typography>

              <Box display="flex" gap={1} alignItems="center">
                {/* If coords are saved on server, show saved coords but still allow editing */}
                {coordsSaved ? (
                  <Box>
                    <Typography variant="body2">
                      Saved: {coordinates?.lat}, {coordinates?.lng}
                    </Typography>
                  </Box>
                ) : null}

                {/* search bar + buttons (available when coords are not saved) */}
                <TextField
                  placeholder="Search (e.g. Brgy, City, Province) — optional"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleManualSearch();
                    }
                  }}
                  size="small"
                  fullWidth
                  inputProps={{ "aria-label": "Coordinates search" }}
                />
                <Button variant="outlined" size="small" onClick={handleManualSearch}>
                  Search
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    // Use only barangay, city, province when "Use Address" is pressed
                    const q = buildBarangayCityProvinceQuery();
                    if (!q) {
                      toast.error("Please select barangay, city, and province first.");
                      return;
                    }
                    setSearchQuery(q);
                    handleManualSearch();
                  }}
                >
                  Use Address
                </Button>
              </Box>

              {/* Manual numeric edit fields */}
              {/* Manual coordinate edit section removed */}

              {/* Show currently pinned coordinates (even if not saved) */}
              <Box mt={1}>
                {isCoordinatesFound && coordinates?.lat && coordinates?.lng ? (
                  <Typography variant="body2" color="success.main">
                    Pinned: {coordinates.lat}, {coordinates.lng}{" "}
                    {!coordsSaved && <em>(not saved yet)</em>}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Coordinates not pinned yet
                  </Typography>
                )}
              </Box>

              {/* Notes */}
              <Box mt={1}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Notes:
                </Typography>
                <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 18 }}>
                  <li style={{ fontSize: 13, color: "#6c757d" }}>
                    Type a custom search (e.g. "Brgy. X, City Y") or click "Use Address"
                    to geocode from the fields above.
                  </li>
                  <li style={{ fontSize: 13, color: "#6c757d" }}>
                    <strong>Use Address:</strong> will use <em>only</em> Barangay, City,
                    and Province (plus "Philippines") when resolving coordinates.
                  </li>
                  <li style={{ fontSize: 13, color: "#6c757d" }}>
                    After coordinates appear as "Pinned", press <strong>Save</strong> to
                    persist them to the server. Once saved, the search bar will be hidden
                    and the saved coordinates will be displayed.
                  </li>
                  <li style={{ fontSize: 13, color: "#6c757d" }}>
                    You can also manually enter numeric latitude and longitude above and
                    click <strong>Apply Coordinates</strong>. The parent will persist them
                    when you press <strong>Save Address</strong>.
                  </li>
                </ul>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => setIsEditing(false)}
          >
            Close
          </Button>
          <Button variant="outlined" color="primary" onClick={handleSave}>
            Save Address
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showConfirmation}
        autoHideDuration={3000}
        onClose={() => setShowConfirmation(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowConfirmation(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Address saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditAddressModal;
