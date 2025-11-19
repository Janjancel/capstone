// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   Typography,
//   Button,
//   Box,
//   IconButton,
//   CircularProgress,
// } from "@mui/material";
// import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

// const BuyPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [item, setItem] = useState(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const API_URL = process.env.REACT_APP_API_URL;

//   useEffect(() => {
//     const fetchItem = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(`${API_URL}/api/items/${id}`);
//         setItem(res.data);
//         setError(null);
//       } catch (err) {
//         setError("Failed to load item details.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (id) fetchItem();
//   }, [id, API_URL]);

//   const images = Array.isArray(item?.images) && item.images.length > 0 ? item.images : ["placeholder.jpg"];

//   const handlePrev = () => {
//     setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
//   };

//   const handleNext = () => {
//     setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
//   };

//   const handleConfirm = async () => {
//     // Implement order logic here (example stub)
//     try {
//       // await axios.post(`${API_URL}/api/orders`, { itemId: id });
//       console.log("Confirm purchase", { itemId: id });
//       navigate("/");
//     } catch (err) {
//       console.error("Order failed", err);
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ width: '100vw', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <CircularProgress />
//         <Typography sx={{ ml: 2 }} variant="h6">Loading item details...</Typography>
//       </Box>
//     );
//   }

//   if (error) {
//     return <Typography color="error" sx={{ p: 4 }}>{error}</Typography>;
//   }

//   if (!item) {
//     return <Typography variant="h6" sx={{ p: 4 }}>No item found.</Typography>;
//   }

//   return (
//     <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default', p: { xs: 2, md: 6 } }}>
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 4, maxWidth: 1200, mx: 'auto' }}>
//         {/* Image Carousel */}
//         <Box sx={{ flex: 1, position: 'relative', textAlign: 'center', minWidth: 320 }}>
//           <img
//             src={images[currentIndex]}
//             alt={item.name}
//             style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '16px', background: '#f5f5f5' }}
//             onError={(e) => (e.target.src = 'placeholder.jpg')}
//           />
//           {images.length > 1 && (
//             <>
//               <IconButton onClick={handlePrev} sx={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}>
//                 <ArrowBackIos />
//               </IconButton>
//               <IconButton onClick={handleNext} sx={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}>
//                 <ArrowForwardIos />
//               </IconButton>
//             </>
//           )}
//           {images.length > 1 && (
//             <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
//               {images.map((_, index) => (
//                 <Box
//                   key={index}
//                   onClick={() => setCurrentIndex(index)}
//                   sx={{ width: 12, height: 12, borderRadius: '50%', mx: 0.5, cursor: 'pointer', backgroundColor: currentIndex === index ? 'primary.main' : 'grey.400' }}
//                 />
//               ))}
//             </Box>
//           )}
//         </Box>

//         {/* Details Section */}
//         <Box sx={{ flex: 2, minWidth: 320 }}>
//           <Typography variant="h3" fontWeight="bold" gutterBottom>{item.name}</Typography>
//           <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>₱{item.price}</Typography>
//           <Typography variant="body1" sx={{ mb: 2 }}>{item.description}</Typography>
//           {item.origin && <Typography variant="body2" sx={{ mb: 1 }}>Origin: <b>{item.origin}</b></Typography>}
//           {item.age && <Typography variant="body2" sx={{ mb: 1 }}>Age: <b>{item.age}</b></Typography>}

//           <Box mt={4} display="flex" gap={2}>
//             <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
//             <Button onClick={handleConfirm} variant="contained" color="primary">Confirm Purchase</Button>
//           </Box>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default BuyPage;


import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Button,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import toast from "react-hot-toast";
import CartModal from "../Cart/CartModal";
import { useAuth } from "../../context/AuthContext";

const BuyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cart modal state for Buy Now flow
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userAddress, setUserAddress] = useState({});

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/items/${id}`);
        setItem(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch item:", err);
        setError("Failed to load item details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id, API_URL]);

  // fetch user address for buy-now flow
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(`${API_URL}/api/users/${user._id}/address`);
        setUserAddress(res.data || {});
      } catch (err) {
        console.warn("Failed to fetch user address:", err);
      }
    };
    fetchUserAddress();
  }, [user, API_URL]);

  const images =
    Array.isArray(item?.images) && item.images.length > 0
      ? item.images
      : ["placeholder.jpg"];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  /**
   * Add to Cart
   */
  const handleAddToCart = async (itemId) => {
    if (!user?._id) {
      toast.error("Please log in to add items to cart.");
      return;
    }

    // Basic local availability guard
    if (!item || (item.availability !== true && item.availability !== "true")) {
      toast.error("Item is no longer available.");
      setItem(null);
      return;
    }

    try {
      await axios.post(`${API_URL}/api/cart/${user._id}/add`, { itemId });
      toast.success("Item added to cart!");
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: 1 }));
    } catch (err) {
      console.error("Add to cart error:", err);
      if (err?.response?.status === 409) {
        toast.error("Item is no longer available.");
        setItem(null);
      } else {
        toast.error("Could not add item to cart.");
      }
    }
  };

  /**
   * Open Cart Modal for Buy Now
   */
  const openCartModalForItem = (it) => {
    if (!user?._id) {
      toast.error("Please log in to proceed with purchase.");
      return;
    }

    if (!it || (it.availability !== true && it.availability !== "true")) {
      toast.error("This item is no longer available.");
      setItem(null);
      return;
    }

    setSelectedItem(it);
    setShowCartModal(true);
  };

  /**
   * handleOrderConfirm (used by CartModal when confirming a buy-now)
   * Accepts (address, notes, itemsToOrder) — returns/throws so CartModal can show errors.
   */
  const handleOrderConfirm = async (address = {}, notes = "", itemsToOrder = []) => {
    if (!user?._id) throw new Error("User not authenticated.");

    const orderItems = (itemsToOrder && itemsToOrder.length > 0)
      ? itemsToOrder
      : selectedItem
      ? [selectedItem]
      : [];

    if (orderItems.length === 0) throw new Error("No items to order.");

    const firstItem = orderItems[0];
    const itemId = firstItem._id || firstItem.id;

    try {
      // 1) Create order
      await axios.post(`${API_URL}/api/orders`, {
        userId: user._id,
        items: orderItems,
        total: parseFloat(firstItem.price || 0),
        address,
        notes,
      });

      // 2) Attempt to set availability false on item resource
      try {
        await axios.put(`${API_URL}/api/items/${itemId}`, {
          availability: false,
        });
      } catch (availErr) {
        console.warn("Failed to update item availability:", availErr);
      }

      // 3) Remove the ordered item from ALL carts so it doesn't linger
      try {
        await axios.delete(`${API_URL}/api/carts/remove-item/${itemId}`);
      } catch (removeErr) {
        console.warn("Failed to remove ordered item from all carts:", removeErr);
      }

      // 4) Update local UI
      if (item && ((item._id || item.id) === itemId)) {
        setItem(null);
      }

      // 5) Close modal + notify success
      toast.success("Order placed successfully!");
      setSelectedItem(null);
      setShowCartModal(false);

      // 6) Notify other parts of app
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: -1 }));

      return;
    } catch (err) {
      console.error("Order failed:", err);
      if (err?.response?.status === 409) {
        // item conflict / unavailable
        setItem(null);
        setSelectedItem(null);
        setShowCartModal(false);
        throw new Error("Order failed: item is no longer available.");
      } else {
        throw new Error(err?.response?.data?.message || "Failed to place order.");
      }
    }
  };

  // Close modal helper — clears selected item too
  const closeCartModal = () => {
    setShowCartModal(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "100vw",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }} variant="h6">
          Loading item details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 4 }}>
        {error}
      </Typography>
    );
  }

  if (!item) {
    return (
      <Typography variant="h6" sx={{ p: 4 }}>
        No item found.
      </Typography>
    );
  }

  // styles reused for button consistency
  const buyNowSx = {
    backgroundColor: "#272626ff",
    color: "white",
    "&:hover": { backgroundColor: "grey.800" },
    borderRadius: 2,
    px: 3,
  };

  const addToCartSx = {
    borderColor: "#272626ff",
    color: "#272626ff",
    "&:hover": {
      borderColor: "grey.800",
      backgroundColor: "rgba(39,38,38,0.06)",
    },
    borderRadius: 2,
    px: 2,
  };

  const backSx = {
    borderColor: "grey.400",
    color: "text.primary",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.04)",
    },
    borderRadius: 2,
    px: 2,
  };

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: { xs: 2, md: 6 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 4,
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        {/* Image Carousel (on top) */}
        <Box
          sx={{
            width: "100%",
            position: "relative",
            textAlign: "center",
            minHeight: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={images[currentIndex]}
            alt={item.name}
            style={{
              width: "100%",
              maxHeight: 600,
              objectFit: "contain",
              borderRadius: 16,
              background: "#f5f5f5",
            }}
            onError={(e) => (e.target.src = "placeholder.jpg")}
          />
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 10,
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                }}
                aria-label="previous image"
              >
                <ArrowBackIos />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 10,
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                }}
                aria-label="next image"
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}
        </Box>

        {images.length > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: -1 }}>
            {images.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  mx: 0.5,
                  cursor: "pointer",
                  backgroundColor:
                    currentIndex === index ? "primary.main" : "grey.400",
                }}
              />
            ))}
          </Box>
        )}

        {/* Details Section (below image) */}
        <Box
          sx={{
            flex: 1,
            minWidth: 320,
            bgcolor: "transparent",
            px: { xs: 0, md: 2 },
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {item.name}
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
            ₱{item.price}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {item.description}
          </Typography>
          {item.origin && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              Origin: <b>{item.origin}</b>
            </Typography>
          )}
          {item.age && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              Age: <b>{item.age}</b>
            </Typography>
          )}

          {/* Replaced Back / Confirm with Add to Cart + Buy Now */}
          <Box mt={4} display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={backSx}
            >
              Back
            </Button>

            <Button
              variant="outlined"
              onClick={() => handleAddToCart(item._id || item.id)}
              disabled={item?.availability !== true && item?.availability !== "true"}
              sx={addToCartSx}
            >
              Add to Cart
            </Button>

            <Button
              variant="contained"
              onClick={() => openCartModalForItem(item)}
              disabled={item?.availability !== true && item?.availability !== "true"}
              sx={buyNowSx}
            >
              Buy Now
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Cart Modal (Buy Now) */}
      {selectedItem && (
        <CartModal
          show={showCartModal}
          onClose={closeCartModal}
          onConfirm={handleOrderConfirm}
          user={user}
          totalPrice={selectedItem.price}
          selectedItems={[selectedItem]}
          defaultAddress={userAddress}
          setShowModal={setShowCartModal}
          setSelectedItems={() => setSelectedItem(null)}
          setCartItems={() => {}}
          setCartCount={() => {}}
        />
      )}
    </Box>
  );
};

export default BuyPage;
