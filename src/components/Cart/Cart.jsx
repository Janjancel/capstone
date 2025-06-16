
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import Swal from "sweetalert2";
// import toast from "react-hot-toast";
// import Alert from "react-bootstrap/Alert";
// import { FaArrowLeft } from "react-icons/fa";
// import { auth, db } from "../../firebase/firebase";
// import {
//   doc,
//   setDoc,
//   updateDoc,
//   getDoc,
//   serverTimestamp,
//   onSnapshot,
// } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";
// import CartModal from "./CartModal";

// export default function Cart() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(undefined);
//   const [cartItems, setCartItems] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [totalPrice, setTotalPrice] = useState(0);
//   const [cartCount, setCartCount] = useState(0);
//   const [error, setError] = useState(null);
//   const [selectAll, setSelectAll] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [userAddress, setUserAddress] = useState({});
//   const [showEmptyAlert, setShowEmptyAlert] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser || null);
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     const fetchUserInfo = async () => {
//       if (!user) return;
//       try {
//         const addressRef = doc(db, "users", user.uid, "address", "userAddress");
//         const addressSnap = await getDoc(addressRef);
//         if (addressSnap.exists()) setUserAddress(addressSnap.data());
//       } catch (err) {
//         console.error("Error fetching address:", err);
//       }
//     };
//     fetchUserInfo();
//   }, [user]);

//   useEffect(() => {
//     if (!user) return;

//     const cartRef = doc(db, "carts", user.uid);
//     const unsubscribe = onSnapshot(cartRef, async (cartSnap) => {
//       if (!cartSnap.exists()) {
//         await setDoc(cartRef, { cartItems: [] });
//         setCartItems([]);
//         setCartCount(0);
//         setShowEmptyAlert(true);
//         return;
//       }

//       const cartData = cartSnap.data();
//       const items = await Promise.all(
//         (cartData.cartItems || []).map(async ({ id, quantity }) => {
//           const itemRef = doc(db, "items", id);
//           const itemSnap = await getDoc(itemRef);
//           return itemSnap.exists() ? { ...itemSnap.data(), id, quantity } : null;
//         })
//       );

//       const validItems = items.filter(Boolean);
//       setCartItems(validItems);
//       setCartCount(validItems.reduce((sum, i) => sum + i.quantity, 0));
//       if (validItems.length === 0) setShowEmptyAlert(true);
//     });

//     return () => unsubscribe();
//   }, [user]);

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
//     } else {
//       setSelectedItems([...cartItems]);
//     }
//     setSelectAll(!selectAll);
//   };

//   const handleDeleteSelected = async () => {
//     if (!user || selectedItems.length === 0) return;

//     const confirmed = await Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete them!",
//     });

//     if (confirmed.isConfirmed) {
//       try {
//         const cartRef = doc(db, "carts", user.uid);
//         const updatedCart = cartItems
//           .filter((item) => !selectedItems.some((sel) => sel.id === item.id))
//           .map(({ id, quantity }) => ({ id, quantity }));

//         await updateDoc(cartRef, { cartItems: updatedCart });
//         setSelectedItems([]);
//         setSelectAll(false);
//         toast.success("Selected items removed.");
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to delete items.");
//       }
//     }
//   };

//   const handleQuantityChange = async (item, newQuantity) => {
//     if (!user || newQuantity < 1) return;

//     const updatedItems = cartItems.map((i) =>
//       i.id === item.id ? { ...i, quantity: newQuantity } : i
//     );

//     try {
//       const cartRef = doc(db, "carts", user.uid);
//       await updateDoc(cartRef, {
//         cartItems: updatedItems.map(({ id, quantity }) => ({ id, quantity })),
//       });
//       setCartItems(updatedItems);
//     } catch (err) {
//       console.error("Quantity update failed:", err);
//     }
//   };

//   useEffect(() => {
//     const total = cartItems.reduce((sum, item) => {
//       if (selectedItems.find((sel) => sel.id === item.id)) {
//         return sum + item.quantity * parseFloat(item.price);
//       }
//       return sum;
//     }, 0);
//     setTotalPrice(total.toFixed(2));
//   }, [selectedItems, cartItems]);

// const handleOrderConfirm = async (address, notes) => {
//   if (!user || selectedItems.length === 0) return;

//   try {
//     const orderRef = doc(db, "orders", `${user.uid}_${Date.now()}`);
//     await setDoc(orderRef, {
//       userId: user.uid,
//       items: selectedItems,
//       total: parseFloat(totalPrice),
//       address,
//       notes,
//       createdAt: serverTimestamp(),
//       status: "Pending", // ✅ Add this line to set order status
//     });

//     const remaining = cartItems.filter(
//       (item) => !selectedItems.find((sel) => sel.id === item.id)
//     );
//     const cartRef = doc(db, "carts", user.uid);
//     await updateDoc(cartRef, {
//       cartItems: remaining.map(({ id, quantity }) => ({ id, quantity })),
//     });

//     setCartItems(remaining);
//     setSelectedItems([]);
//     setCartCount(remaining.reduce((sum, i) => sum + i.quantity, 0));
//     setShowModal(false);
//     toast.success("Order placed successfully!");
//   } catch (err) {
//     console.error("Order failed:", err);
//     toast.error("Failed to place order.");
//   }
// };


//   const filteredCartItems = cartItems.filter((item) =>
//     item.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (user === undefined) return <p className="text-center mt-5">Loading...</p>;

//   return (
//     <div className="container-fluid d-flex justify-content-center">
//       <div className="bg-white p-4 rounded shadow d-flex flex-column justify-content-between" style={{ width: "80vw", minHeight: "70vh" }}>
//         <div>
//           <div className="d-flex justify-content-between mb-3 align-items-center">
//             <h2 className="d-flex align-items-center">
//               <FaArrowLeft
//                 style={{ cursor: "pointer", marginRight: "10px" }}
//                 onClick={() => navigate("/buy")}
//               />
//               Your Cart
//             </h2>
//             <input
//               type="text"
//               className="form-control w-25"
//               placeholder="Search items..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>

//           {showEmptyAlert && (
//             <Alert variant="warning">
//               Your cart is empty. Go to the <a href="/buy">Buy</a> page to add items.
//             </Alert>
//           )}

//           {error && <p className="text-danger">{error}</p>}

//           {filteredCartItems.length > 0 ? (
//             <div className="table-responsive" style={{ maxHeight: "40vh", overflow: "auto" }}>
//               <table className="table table-bordered table-striped text-center">
//                 <thead className="table-dark">
//                   <tr>
//                     <th><input type="checkbox" onChange={handleSelectAll} checked={selectAll} /></th>
//                     <th>Image</th>
//                     <th>Name</th>
//                     <th>Description</th>
//                     <th>Price</th>
//                     <th>Quantity</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredCartItems.map((item) => (
//                     <tr key={item.id}>
//                       <td>
//                         <input
//                           type="checkbox"
//                           checked={selectedItems.some((i) => i.id === item.id)}
//                           onChange={() => handleSelectItem(item)}
//                         />
//                       </td>
//                       <td>
//                         <img
//                           src={item.image || "placeholder.jpg"}
//                           alt={item.name}
//                           className="img-thumbnail"
//                           style={{ width: "70px", height: "50px", objectFit: "cover" }}
//                         />
//                       </td>
//                       <td>{item.name}</td>
//                       <td className="text-truncate" style={{ maxWidth: "150px" }}>{item.description}</td>
//                       <td className="text-primary fw-bold">₱{item.price}</td>
//                       <td>
//                         <button onClick={() => handleQuantityChange(item, item.quantity - 1)} className="btn btn-sm btn-outline-secondary me-2">-</button>
//                         <span className="fw-bold">{item.quantity}</span>
//                         <button onClick={() => handleQuantityChange(item, item.quantity + 1)} className="btn btn-sm btn-outline-secondary ms-2">+</button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <p className="text-muted text-center">No items found.</p>
//           )}
//         </div>

//         <div className="d-flex justify-content-between mt-3">
//           <button className="btn btn-danger" disabled={!selectedItems.length} onClick={handleDeleteSelected}>
//             Delete Selected
//           </button>
//           <h4>Total: <span className="text-success">₱{totalPrice}</span></h4>
//           <h4>Items: <span className="text-info">{cartCount}</span></h4>
//           <button className="btn btn-success" disabled={!selectedItems.length} onClick={() => setShowModal(true)}>
//             Place Order
//           </button>
//         </div>

// // No longer includes handleOrderConfirm

// <CartModal
//   show={showModal}
//   onClose={() => setShowModal(false)}
//   user={user}
//   totalPrice={totalPrice}
//   selectedItems={selectedItems}
//   defaultAddress={userAddress}
//   setCartItems={setCartItems}
//   setSelectedItems={setSelectedItems}
//   setCartCount={setCartCount}
//   setShowModal={setShowModal}
// />

//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
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
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [error, setError] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userAddress, setUserAddress] = useState({});
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cart/${user._id}`);
      const items = Array.isArray(res.data?.cartItems) ? res.data.cartItems : [];

      const itemDetails = await Promise.all(
        items.map(async (item) => {
          const itemId = item.itemId || item.id || item._id;
          if (!itemId) return null;
          try {
            const res = await axios.get(`${API_URL}/api/items/${itemId}`);
            return res.data ? { ...res.data, id: itemId, quantity: item.quantity } : null;
          } catch {
            return null;
          }
        })
      );

      const validItems = itemDetails.filter(Boolean);
      setCartItems(validItems);
      setCartCount(validItems.reduce((sum, i) => sum + i.quantity, 0));
      setShowEmptyAlert(validItems.length === 0);
    } catch (err) {
      console.error("Fetch cart error:", err);
      setError("Failed to fetch cart.");
    }
  };

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/${user._id}/address`);
        setUserAddress(res.data || {});
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn("User address not found. Skipping.");
        } else {
          console.error("Failed to load address.", err);
        }
      }
    };
    if (user) fetchAddress();
  }, [user]);

  const handleSelectItem = (item) => {
    setSelectedItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(selectAll ? [] : [...cartItems]);
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    if (!user || selectedItems.length === 0) return;

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
        fetchCart();
      } catch {
        toast.error("Failed to delete items.");
      }
    }
  };

  const handleQuantityChange = async (item, newQty) => {
    if (!user || newQty < 1) return;
    try {
      await axios.put(`${API_URL}/api/cart/${user._id}/update`, {
        id: item.id,
        quantity: newQty,
      });
      const updated = cartItems.map((ci) =>
        ci.id === item.id ? { ...ci, quantity: newQty } : ci
      );
      setCartItems(updated);
    } catch {
      toast.error("Failed to update quantity.");
    }
  };

  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) =>
        selectedItems.find((sel) => sel.id === item.id)
          ? sum + item.quantity * parseFloat(item.price)
          : sum,
      0
    );
    setTotalPrice(total.toFixed(2));
  }, [selectedItems, cartItems]);

  const filteredCartItems = cartItems.filter((item) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return <p className="text-center mt-5">Please log in.</p>;

  return (
    <div className="container-fluid d-flex justify-content-center">
      <div className="bg-white p-4 rounded shadow w-100" style={{ maxWidth: "1100px", minHeight: "70vh" }}>
        <div className="d-flex justify-content-between mb-3 align-items-center">
          <h2 className="d-flex align-items-center">
            <FaArrowLeft className="me-2" style={{ cursor: "pointer" }} onClick={() => navigate("/buy")} />
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
            Your cart is empty. Go to the <a href="/buy">Buy</a> page to add items.
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
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        className="img-thumbnail"
                        style={{ width: "70px", height: "50px", objectFit: "cover" }}
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
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="fw-bold">{item.quantity}</span>
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
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
          <button
            className="btn btn-danger"
            disabled={!selectedItems.length}
            onClick={handleDeleteSelected}
          >
            Delete Selected
          </button>
          <h4>
            Total: <span className="text-success">₱{totalPrice}</span>
          </h4>
          <h4>
            Items: <span className="text-info">{cartCount}</span>
          </h4>
          <button
            className="btn btn-success"
            disabled={!selectedItems.length}
            onClick={() => setShowModal(true)}
          >
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
