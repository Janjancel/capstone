

// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import Swal from "sweetalert2";
// import toast from "react-hot-toast";
// import Alert from "react-bootstrap/Alert";
// import { FaArrowLeft } from "react-icons/fa";
// import CartModal from "./CartModal";
// import axios from "axios";
// import { useAuth } from "../../context/AuthContext";

// export default function Cart() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [cartItems, setCartItems] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [totalPrice, setTotalPrice] = useState("0.00");
//   const [cartCount, setCartCount] = useState(0);
//   const [error, setError] = useState(null);
//   const [selectAll, setSelectAll] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [userAddress, setUserAddress] = useState({});
//   const [showEmptyAlert, setShowEmptyAlert] = useState(false);

//   const API_URL = process.env.REACT_APP_API_URL;

//   // fetchCart memoized so it can be safely used in useEffect deps
//   const fetchCart = useCallback(async () => {
//     if (!user || !API_URL) return;
//     try {
//       const res = await axios.get(`${API_URL}/api/cart/${user._id}`);
//       const items = Array.isArray(res.data?.cartItems) ? res.data.cartItems : [];

//       const itemDetails = await Promise.all(
//         items.map(async (item) => {
//           const itemId = item.itemId || item.id || item._id;
//           if (!itemId) return null;
//           try {
//             const itemRes = await axios.get(`${API_URL}/api/items/${itemId}`);
//             return itemRes.data ? { ...itemRes.data, id: itemId, quantity: item.quantity } : null;
//           } catch (err) {
//             // individual item fetch failed — skip it
//             console.warn(`Failed to load item ${itemId}`, err);
//             return null;
//           }
//         })
//       );

//       const validItems = itemDetails.filter(Boolean);
//       setCartItems(validItems);
//       const count = validItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
//       setCartCount(count);
//       setShowEmptyAlert(validItems.length === 0);
//       setError(null);
//     } catch (err) {
//       console.error("Fetch cart error:", err);
//       setError("Failed to fetch cart.");
//     }
//   }, [API_URL, user]);

//   // load cart when user or fetchCart changes
//   useEffect(() => {
//     if (user) fetchCart();
//   }, [user, fetchCart]);

//   // fetch address (include API_URL in deps to satisfy eslint)
//   useEffect(() => {
//     if (!user || !API_URL) return;

//     const fetchAddress = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/users/${user._id}/address`);
//         setUserAddress(res.data || {});
//       } catch (err) {
//         if (err.response?.status === 404) {
//           console.warn("User address not found. Skipping.");
//           setUserAddress({});
//         } else {
//           console.error("Failed to load address.", err);
//         }
//       }
//     };

//     fetchAddress();
//   }, [user, API_URL]);

//   // calculate total price whenever selectedItems or cartItems change
//   useEffect(() => {
//     const total = cartItems.reduce((sum, item) => {
//       const selected = selectedItems.find((sel) => sel.id === item.id);
//       if (!selected) return sum;
//       const priceNum = Number(item.price) || 0;
//       const qty = Number(item.quantity) || 0;
//       return sum + qty * priceNum;
//     }, 0);

//     // keep as string formatted to 2 decimals to match UI display
//     setTotalPrice(total.toFixed(2));
//   }, [selectedItems, cartItems]);

//   const handleSelectItem = (item) => {
//     setSelectedItems((prev) =>
//       prev.some((i) => i.id === item.id)
//         ? prev.filter((i) => i.id !== item.id)
//         : [...prev, item]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedItems([]);
//       setSelectAll(false);
//     } else {
//       setSelectedItems([...cartItems]);
//       setSelectAll(true);
//     }
//   };

//   const handleDeleteSelected = async () => {
//     if (!user || selectedItems.length === 0 || !API_URL) return;

//     const confirmed = await Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, delete them!",
//     });

//     if (confirmed.isConfirmed) {
//       try {
//         await axios.put(`${API_URL}/api/cart/${user._id}/remove`, {
//           removeItems: selectedItems.map((i) => i.id),
//         });
//         setSelectedItems([]);
//         setSelectAll(false);
//         toast.success("Selected items removed.");
//         // refresh cart
//         await fetchCart();
//       } catch (err) {
//         console.error("Failed deleting selected items:", err);
//         toast.error("Failed to delete items.");
//       }
//     }
//   };

//   const handleQuantityChange = async (item, newQty) => {
//     if (!user || !API_URL) return;
//     if (newQty < 1) return;

//     try {
//       await axios.put(`${API_URL}/api/cart/${user._id}/update`, {
//         id: item.id,
//         quantity: newQty,
//       });

//       // update local state
//       const updated = cartItems.map((ci) =>
//         ci.id === item.id ? { ...ci, quantity: newQty } : ci
//       );
//       setCartItems(updated);

//       // update cart count (recompute)
//       const count = updated.reduce((sum, i) => sum + (i.quantity || 0), 0);
//       setCartCount(count);
//     } catch (err) {
//       console.error("Failed to update quantity:", err);
//       toast.error("Failed to update quantity.");
//     }
//   };

//   const filteredCartItems = cartItems.filter((item) =>
//     item.name?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (!user) return <p className="text-center mt-5">Please log in.</p>;

//   return (
//     <div className="container-fluid d-flex justify-content-center">
//       <div
//         className="bg-white p-4 rounded shadow w-100"
//         style={{ maxWidth: "1100px", minHeight: "70vh" }}
//       >
//         <div className="d-flex justify-content-between mb-3 align-items-center">
//           <h2 className="d-flex align-items-center">
//             <FaArrowLeft
//               className="me-2"
//               style={{ cursor: "pointer" }}
//               onClick={() => navigate("/buy")}
//             />
//             Your Cart
//           </h2>
//           <input
//             type="text"
//             className="form-control w-25"
//             placeholder="Search items..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>

//         {showEmptyAlert && (
//           <Alert variant="warning">
//             Your cart is empty. Go to the <a href="/buy">Buy</a> page to add items.
//           </Alert>
//         )}

//         {error && <p className="text-danger">{error}</p>}

//         {filteredCartItems.length > 0 ? (
//           <div className="table-responsive" style={{ maxHeight: "40vh", overflow: "auto" }}>
//             <table className="table table-bordered table-striped text-center">
//               <thead className="table-dark">
//                 <tr>
//                   <th>
//                     <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
//                   </th>
//                   <th>Image</th>
//                   <th>Name</th>
//                   <th>Description</th>
//                   <th>Price</th>
//                   <th>Quantity</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredCartItems.map((item) => (
//                   <tr key={item.id}>
//                     <td>
//                       <input
//                         type="checkbox"
//                         checked={selectedItems.some((i) => i.id === item.id)}
//                         onChange={() => handleSelectItem(item)}
//                       />
//                     </td>
//                     <td>
//                       <img
//                         src={
//                           Array.isArray(item.images) && item.images.length > 0
//                             ? item.images[0]
//                             : "/placeholder.jpg"
//                         }
//                         alt={item.name}
//                         className="img-thumbnail"
//                         style={{ width: "70px", height: "50px", objectFit: "cover" }}
//                         onError={(e) => (e.target.src = "/placeholder.jpg")}
//                       />
//                     </td>
//                     <td>{item.name}</td>
//                     <td className="text-truncate" style={{ maxWidth: "150px" }}>
//                       {item.description}
//                     </td>
//                     <td className="text-primary fw-bold">₱{item.price}</td>
//                     <td>
//                       <button
//                         className="btn btn-sm btn-outline-secondary me-2"
//                         onClick={() => handleQuantityChange(item, Number(item.quantity) - 1)}
//                       >
//                         -
//                       </button>
//                       <span className="fw-bold">{item.quantity}</span>
//                       <button
//                         className="btn btn-sm btn-outline-secondary ms-2"
//                         onClick={() => handleQuantityChange(item, Number(item.quantity) + 1)}
//                       >
//                         +
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-muted text-center">No items found.</p>
//         )}

//         <div className="d-flex justify-content-between mt-4">
//           <button className="btn btn-danger" disabled={!selectedItems.length} onClick={handleDeleteSelected}>
//             Delete Selected
//           </button>
//           <h4>
//             Total: <span className="text-success">₱{totalPrice}</span>
//           </h4>
//           <h4>
//             Items: <span className="text-info">{cartCount}</span>
//           </h4>
//           <button className="btn btn-success" disabled={!selectedItems.length} onClick={() => setShowModal(true)}>
//             Place Order
//           </button>
//         </div>

//         <CartModal
//           show={showModal}
//           onClose={() => setShowModal(false)}
//           user={user}
//           totalPrice={totalPrice}
//           selectedItems={selectedItems}
//           defaultAddress={userAddress}
//           setCartItems={setCartItems}
//           setSelectedItems={setSelectedItems}
//           setCartCount={setCartCount}
//           setShowModal={setShowModal}
//         />
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Alert from "react-bootstrap/Alert";
import { FaArrowLeft } from "react-icons/fa";
import CartModal from "./CartModal";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState("0.00");
  const [cartCount, setCartCount] = useState(0);
  const [error, setError] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userAddress, setUserAddress] = useState({});
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  // fetchCart memoized so it can be safely used in useEffect deps
  const fetchCart = useCallback(async () => {
    if (!user || !API_URL) return;
    try {
      const res = await axios.get(`${API_URL}/api/cart/${user._id}`);
      const items = Array.isArray(res.data?.cartItems) ? res.data.cartItems : [];

      const itemDetails = await Promise.all(
        items.map(async (item) => {
          const itemId = item.itemId || item.id || item._id;
          if (!itemId) return null;
          try {
            const itemRes = await axios.get(`${API_URL}/api/items/${itemId}`);
            // normalize: attach cart quantity into the fetched item
            return itemRes.data
              ? { ...itemRes.data, id: itemId, quantity: item.quantity }
              : null;
          } catch (err) {
            // individual item fetch failed — skip it
            console.warn(`Failed to load item ${itemId}`, err);
            return null;
          }
        })
      );

      // keep only fully-resolved items
      const validItems = itemDetails.filter(Boolean);

      // Only include items where availability === true (handle boolean or string)
      const availableItems = validItems.filter((i) => {
        // guard: treat strictly true or string "true" as available
        return i?.availability === true || i?.availability === "true";
      });

      setCartItems(availableItems);

      // cartCount = sum of quantities of available items
      const count = availableItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
      setCartCount(count);

      setShowEmptyAlert(availableItems.length === 0);
      setError(null);

      // If selectedItems contain items that are no longer available, remove them
      setSelectedItems((prevSelected) =>
        prevSelected.filter((s) => availableItems.some((a) => a.id === s.id))
      );
      // ensure selectAll stays consistent
      setSelectAll(false);
    } catch (err) {
      console.error("Fetch cart error:", err);
      setError("Failed to fetch cart.");
    }
  }, [API_URL, user]);

  // load cart when user or fetchCart changes
  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  // fetch address (include API_URL in deps to satisfy eslint)
  useEffect(() => {
    if (!user || !API_URL) return;

    const fetchAddress = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/${user._id}/address`);
        setUserAddress(res.data || {});
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn("User address not found. Skipping.");
          setUserAddress({});
        } else {
          console.error("Failed to load address.", err);
        }
      }
    };

    fetchAddress();
  }, [user, API_URL]);

  // calculate total price whenever selectedItems or cartItems change
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      const selected = selectedItems.find((sel) => sel.id === item.id);
      if (!selected) return sum;
      const priceNum = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + qty * priceNum;
    }, 0);

    // keep as string formatted to 2 decimals to match UI display
    setTotalPrice(total.toFixed(2));
  }, [selectedItems, cartItems]);

  const handleSelectItem = (item) => {
    setSelectedItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      // select only the currently shown cart items
      setSelectedItems([...cartItems]);
      setSelectAll(true);
    }
  };

  const handleDeleteSelected = async () => {
    if (!user || selectedItems.length === 0 || !API_URL) return;

    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them!",
    });

    if (confirmed.isConfirmed) {
      try {
        await axios.put(`${API_URL}/api/cart/${user._id}/remove`, {
          removeItems: selectedItems.map((i) => i.id),
        });
        setSelectedItems([]);
        setSelectAll(false);
        toast.success("Selected items removed.");
        // refresh cart
        await fetchCart();
      } catch (err) {
        console.error("Failed deleting selected items:", err);
        toast.error("Failed to delete items.");
      }
    }
  };

  const handleQuantityChange = async (item, newQty) => {
    if (!user || !API_URL) return;
    if (newQty < 1) return;

    try {
      await axios.put(`${API_URL}/api/cart/${user._id}/update`, {
        id: item.id,
        quantity: newQty,
      });

      // update local state
      const updated = cartItems.map((ci) =>
        ci.id === item.id ? { ...ci, quantity: newQty } : ci
      );
      setCartItems(updated);

      // update cart count (recompute)
      const count = updated.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
      setCartCount(count);

      // also update selectedItems quantities if the item is selected
      setSelectedItems((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, quantity: newQty } : s))
      );
    } catch (err) {
      console.error("Failed to update quantity:", err);
      toast.error("Failed to update quantity.");
    }
  };

  // Only search within already-available cart items (cartItems is already filtered by availability)
  const filteredCartItems = cartItems.filter((item) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return <p className="text-center mt-5">Please log in.</p>;

  return (
    <div className="container-fluid d-flex justify-content-center">
      <div
        className="bg-white p-4 rounded shadow w-100"
        style={{ maxWidth: "1100px", minHeight: "70vh" }}
      >
        <div className="d-flex justify-content-between mb-3 align-items-center">
          <h2 className="d-flex align-items-center">
            <FaArrowLeft
              className="me-2"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/buy")}
            />
            Your Cart
          </h2>
          <input
            type="text"
            className="form-control w-25"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {showEmptyAlert && (
          <Alert variant="warning">
            Your cart has no available items. Items that are not available are hidden from the cart.
            Go to the <a href="/buy">Buy</a> page to add items.
          </Alert>
        )}

        {error && <p className="text-danger">{error}</p>}

        {filteredCartItems.length > 0 ? (
          <div className="table-responsive" style={{ maxHeight: "40vh", overflow: "auto" }}>
            <table className="table table-bordered table-striped text-center">
              <thead className="table-dark">
                <tr>
                  <th>
                    <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                  </th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {filteredCartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.some((i) => i.id === item.id)}
                        onChange={() => handleSelectItem(item)}
                      />
                    </td>
                    <td>
                      <img
                        src={
                          Array.isArray(item.images) && item.images.length > 0
                            ? item.images[0]
                            : "/placeholder.jpg"
                        }
                        alt={item.name}
                        className="img-thumbnail"
                        style={{ width: "70px", height: "50px", objectFit: "cover" }}
                        onError={(e) => (e.target.src = "/placeholder.jpg")}
                      />
                    </td>
                    <td>{item.name}</td>
                    <td className="text-truncate" style={{ maxWidth: "150px" }}>
                      {item.description}
                    </td>
                    <td className="text-primary fw-bold">₱{item.price}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleQuantityChange(item, Number(item.quantity) - 1)}
                      >
                        -
                      </button>
                      <span className="fw-bold">{item.quantity}</span>
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={() => handleQuantityChange(item, Number(item.quantity) + 1)}
                      >
                        +
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted text-center">No items found.</p>
        )}

        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-danger" disabled={!selectedItems.length} onClick={handleDeleteSelected}>
            Delete Selected
          </button>
          <h4>
            Total: <span className="text-success">₱{totalPrice}</span>
          </h4>
          <h4>
            Items: <span className="text-info">{cartCount}</span>
          </h4>
          <button className="btn btn-success" disabled={!selectedItems.length} onClick={() => setShowModal(true)}>
            Place Order
          </button>
        </div>

        <CartModal
          show={showModal}
          onClose={() => setShowModal(false)}
          user={user}
          totalPrice={totalPrice}
          selectedItems={selectedItems}
          defaultAddress={userAddress}
          setCartItems={setCartItems}
          setSelectedItems={setSelectedItems}
          setCartCount={setCartCount}
          setShowModal={setShowModal}
        />
      </div>
    </div>
  );
}
