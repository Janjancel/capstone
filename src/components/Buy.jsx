// import React, { useEffect, useState } from "react";
// import {
//   collection,
//   onSnapshot,
//   doc,
//   setDoc,
//   getDoc,
//   serverTimestamp,
// } from "firebase/firestore";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { db } from "../firebase/firebase";
// import { OverlayTrigger, Popover } from "react-bootstrap";
// import toast from "react-hot-toast";
// import CartModal from "./Cart/CartModal";

// const Buy = () => {
//   const [items, setItems] = useState([]);
//   const [filteredItems, setFilteredItems] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [user, setUser] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [userAddress, setUserAddress] = useState({});

//   const auth = getAuth();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       setUser(currentUser);
//       if (currentUser) {
//         try {
//           const addressRef = doc(db, "users", currentUser.uid, "address", "userAddress");
//           const addressSnap = await getDoc(addressRef);
//           if (addressSnap.exists()) setUserAddress(addressSnap.data());
//         } catch (err) {
//           console.error("Failed to fetch address:", err);
//         }
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   // ✅ Real-time items listener
//   useEffect(() => {
//     setLoading(true);
//     const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
//       try {
//         const itemsList = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setItems(itemsList);
//         setFilteredItems(itemsList);
//         setError(null);
//       } catch (err) {
//         console.error("❌ Realtime fetch failed:", err);
//         setError("Failed to load items.");
//       } finally {
//         setLoading(false);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     const filtered = items.filter((item) =>
//       item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       item.description.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//     setFilteredItems(filtered);
//   }, [searchQuery, items]);

//   const truncateText = (text, length) =>
//     text.length > length ? text.substring(0, length) + "..." : text;

//   const handleAddToCart = async (itemId) => {
//     try {
//       if (!user) {
//         toast.error("Please log in to add items to cart.");
//         return;
//       }

//       const cartRef = doc(db, "carts", user.uid);
//       const cartSnap = await getDoc(cartRef);

//       let cartItems = [];

//       if (cartSnap.exists()) {
//         const data = cartSnap.data();
//         cartItems = data.cartItems || [];
//       } else {
//         await setDoc(cartRef, {
//           userId: user.uid,
//           cartItems: [],
//         });
//       }

//       const itemIndex = cartItems.findIndex((item) => item.id === itemId);

//       if (itemIndex !== -1) {
//         cartItems[itemIndex].quantity += 1;
//       } else {
//         cartItems.push({ id: itemId, quantity: 1 });
//       }

//       await setDoc(cartRef, {
//         userId: user.uid,
//         cartItems,
//       });

//       toast.success("Item added to cart!");
//       window.dispatchEvent(new CustomEvent("cartUpdated", { detail: 1 }));
//     } catch (err) {
//       console.error("❌ Error adding to cart:", err);
//       toast.error("Could not add item to cart.");
//     }
//   };

//   const handleBuyNow = (item) => {
//     if (!user) {
//       toast.error("Please log in to proceed with purchase.");
//       return;
//     }
//     setSelectedItem({ ...item, quantity: 1 });
//     setShowModal(true);
//   };

//   const handleOrderConfirm = async (address, notes) => {
//     if (!user || !selectedItem) return;

//     try {
//       const orderRef = doc(db, "orders", `${user.uid}_${Date.now()}`);
//       await setDoc(orderRef, {
//         userId: user.uid,
//         items: [selectedItem],
//         total: parseFloat(selectedItem.price),
//         address,
//         notes,
//         createdAt: serverTimestamp(),
//         status: "Pending",
//       });

//       toast.success("Order placed successfully!");
//       setSelectedItem(null);
//       setShowModal(false);
//     } catch (err) {
//       console.error("❌ Order failed:", err);
//       toast.error("Failed to place order.");
//     }
//   };

//   return (
//     <div style={{ minHeight: "100vh", padding: "20px" }}>
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h2>Antique Shop</h2>
//         <input
//           type="text"
//           className="form-control w-25"
//           placeholder="Search items..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>

//       {error && <p className="text-danger">{error}</p>}

//       <div className="row">
//         {loading ? (
//           <p>Loading items...</p>
//         ) : filteredItems.length > 0 ? (
//           filteredItems.map((item) => (
//             <div className="col-md-2 mb-4" key={item.id}>
//               <div
//                 className="card"
//                 style={{
//                   border: "none",
//                   boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
//                   borderRadius: "12px",
//                   padding: "10px",
//                   textAlign: "left",
//                 }}
//               >
//                 {item.image && (
//                   <img
//                     src={item.image}
//                     alt={item.name}
//                     className="card-img-top"
//                     style={{
//                       width: "100%",
//                       height: "150px",
//                       objectFit: "cover",
//                       borderRadius: "8px",
//                     }}
//                     onError={(e) => (e.target.src = "placeholder.jpg")}
//                   />
//                 )}
//                 <div className="card-body">
//                   <OverlayTrigger
//                     trigger="click"
//                     placement="auto"
//                     overlay={
//                       <Popover>
//                         <Popover.Header as="h3">{item.name}</Popover.Header>
//                         <Popover.Body>
//                           <img
//                             src={item.image}
//                             alt={item.name}
//                             className="img-fluid mb-2"
//                           />
//                           <p>{item.description}</p>
//                           <p className="fw-bold">₱{item.price}</p>
//                           {item.origin && <p>Origin: {item.origin}</p>}
//                           {item.age && <p>Age: {item.age}</p>}
//                           {item.createdAt && (
//                             <p>
//                               Created At:{" "}
//                               {item.createdAt?.toDate().toLocaleString()}
//                             </p>
//                           )}
//                         </Popover.Body>
//                       </Popover>
//                     }
//                   >
//                     <h5
//                       style={{
//                         fontSize: "1rem",
//                         fontWeight: "bold",
//                         cursor: "pointer",
//                       }}
//                     >
//                       {item.name}
//                     </h5>
//                   </OverlayTrigger>
//                   <p
//                     style={{
//                       fontSize: "0.9rem",
//                       color: "#555",
//                       whiteSpace: "nowrap",
//                       overflow: "hidden",
//                       textOverflow: "ellipsis",
//                     }}
//                   >
//                     {truncateText(item.description, 50)}
//                   </p>
//                   <p style={{ fontSize: "1rem", fontWeight: "bold", color: "#333" }}>
//                     ₱{item.price}
//                   </p>
//                   <div className="d-flex gap-2">
//                     <button
//                       className="btn btn-dark"
//                       style={{ fontSize: "0.65rem" }}
//                       onClick={() => handleBuyNow(item)}
//                     >
//                       Buy Now
//                     </button>
//                     <button
//                       className="btn btn-outline-dark"
//                       style={{ fontSize: "0.65rem" }}
//                       onClick={() => handleAddToCart(item.id)}
//                     >
//                       Add to Cart
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-danger">⚠️ No items available.</p>
//         )}
//       </div>

//       {selectedItem && (
//         <CartModal
//           show={showModal}
//           onClose={() => setShowModal(false)}
//           onConfirm={handleOrderConfirm}
//           user={user}
//           totalPrice={selectedItem.price}
//           selectedItems={[selectedItem]}
//           defaultAddress={userAddress}
//           setShowModal={setShowModal}
//           setSelectedItems={() => setSelectedItem(null)}
//           setCartItems={() => {}}
//           setCartCount={() => {}}
//         />
//       )}
//     </div>
//   );
// };

// export default Buy;

import React, { useEffect, useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import toast from "react-hot-toast";
import axios from "axios";
import CartModal from "./Cart/CartModal";
import { useAuth } from "../context/AuthContext"; // ✅ Import global auth

const Buy = () => {
  const { user } = useAuth(); // ✅ Get global user context
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userAddress, setUserAddress] = useState({});

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(`/api/users/${user._id}/address`);
        setUserAddress(res.data || {});
      } catch (err) {
        console.error("Failed to fetch address:", err);
      }
    };
    fetchUserAddress();
  }, [user]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/items");
        setItems(res.data);
        setFilteredItems(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch items:", err);
        setError("Failed to load items.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const truncateText = (text, length) =>
    text.length > length ? text.substring(0, length) + "..." : text;

  const handleAddToCart = async (itemId) => {
    if (!user?._id) {
      toast.error("Please log in to add items to cart.");
      return;
    }

    try {
      await axios.post(`/api/cart/${user._id}/add`, { itemId });
      toast.success("Item added to cart!");
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: 1 }));
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Could not add item to cart.");
    }
  };

  const handleBuyNow = (item) => {
    if (!user?._id) {
      toast.error("Please log in to proceed with purchase.");
      return;
    }
    setSelectedItem({ ...item, quantity: 1 });
    setShowModal(true);
  };

  const handleOrderConfirm = async (address, notes) => {
    if (!user?._id || !selectedItem) return;

    try {
      await axios.post(`/api/orders`, {
        userId: user._id,
        items: [selectedItem],
        total: parseFloat(selectedItem.price),
        address,
        notes,
      });

      toast.success("Order placed successfully!");
      setSelectedItem(null);
      setShowModal(false);
    } catch (err) {
      console.error("Order failed:", err);
      toast.error("Failed to place order.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Antique Shop</h2>
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && <p className="text-danger">{error}</p>}

      <div className="row">
        {loading ? (
          <p>Loading items...</p>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div className="col-md-2 mb-4" key={item._id}>
              <div className="card" style={{ border: "none", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderRadius: "12px", padding: "10px", textAlign: "left" }}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="card-img-top"
                    style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }}
                    onError={(e) => (e.target.src = "placeholder.jpg")}
                  />
                )}
                <div className="card-body">
                  <OverlayTrigger
                    trigger="click"
                    placement="auto"
                    overlay={
                      <Popover>
                        <Popover.Header as="h3">{item.name}</Popover.Header>
                        <Popover.Body>
                          <img src={item.image} alt={item.name} className="img-fluid mb-2" />
                          <p>{item.description}</p>
                          <p className="fw-bold">₱{item.price}</p>
                          {item.origin && <p>Origin: {item.origin}</p>}
                          {item.age && <p>Age: {item.age}</p>}
                          {item.createdAt && <p>Created At: {new Date(item.createdAt).toLocaleString()}</p>}
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <h5 style={{ fontSize: "1rem", fontWeight: "bold", cursor: "pointer" }}>
                      {item.name}
                    </h5>
                  </OverlayTrigger>
                  <p style={{ fontSize: "0.9rem", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {truncateText(item.description, 50)}
                  </p>
                  <p style={{ fontSize: "1rem", fontWeight: "bold", color: "#333" }}>
                    ₱{item.price}
                  </p>
                  <div className="d-flex gap-2">
                    <button className="btn btn-dark btn-sm" onClick={() => handleBuyNow(item)}>Buy Now</button>
                    <button className="btn btn-outline-dark btn-sm" onClick={() => handleAddToCart(item._id)}>Add to Cart</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-danger">⚠️ No items available.</p>
        )}
      </div>

      {selectedItem && (
        <CartModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleOrderConfirm}
          user={user}
          totalPrice={selectedItem.price}
          selectedItems={[selectedItem]}
          defaultAddress={userAddress}
          setShowModal={setShowModal}
          setSelectedItems={() => setSelectedItem(null)}
          setCartItems={() => {}}
          setCartCount={() => {}}
        />
      )}
    </div>
  );
};

export default Buy;
