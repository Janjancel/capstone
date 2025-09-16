import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import toast from "react-hot-toast";
import axios from "axios";
import CartModal from "./Cart/CartModal";
import BuyModal from "./BuyModal"; // new modal for item details
import { useAuth } from "../context/AuthContext";
import FilterListIcon from "@mui/icons-material/FilterList";

const Buy = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [userAddress, setUserAddress] = useState({});
  const [filterAnchor, setFilterAnchor] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch user address
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(`${API_URL}/api/users/${user._id}/address`);
        setUserAddress(res.data || {});
      } catch (err) {
        console.error("Failed to fetch address:", err);
      }
    };
    fetchUserAddress();
  }, [user]);

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/items`);
        const itemArray = Array.isArray(res.data) ? res.data : [];
        setItems(itemArray);
        setFilteredItems(itemArray);
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

  // Filter items
  useEffect(() => {
    let filtered = items.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (priceFilter === "low") {
      filtered = filtered.filter((item) => item.price < 5000);
    } else if (priceFilter === "mid") {
      filtered = filtered.filter(
        (item) => item.price >= 5000 && item.price <= 20000
      );
    } else if (priceFilter === "high") {
      filtered = filtered.filter((item) => item.price > 20000);
    }

    setFilteredItems(filtered);
  }, [searchQuery, priceFilter, items]);

  const truncateText = (text, length) =>
    text?.length > length ? text.substring(0, length) + "..." : text;

  const handleAddToCart = async (itemId) => {
    if (!user?._id) {
      toast.error("Please log in to add items to cart.");
      return;
    }
    try {
      await axios.post(`${API_URL}/api/cart/${user._id}/add`, { itemId });
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
    setShowCartModal(true);
  };

  const handleOrderConfirm = async (address, notes) => {
    if (!user?._id || !selectedItem) return;
    try {
      await axios.post(`${API_URL}/api/orders`, {
        userId: user._id,
        items: [selectedItem],
        total: parseFloat(selectedItem.price),
        address,
        notes,
      });
      toast.success("Order placed successfully!");
      setSelectedItem(null);
      setShowCartModal(false);
    } catch (err) {
      console.error("Order failed:", err);
      toast.error("Failed to place order.");
    }
  };

  const handleFilterOpen = (event) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 1,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Antique Shop
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            size="small"
            variant="outlined"
            label="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 250 }}
          />
          <Tooltip title="Filter by Price">
            <IconButton onClick={handleFilterOpen}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={handleFilterClose}
          >
            <MenuItem disabled>Filter by Price</MenuItem>
            <MenuItem
              onClick={() => setPriceFilter("")}
              sx={{
                fontWeight: priceFilter === "" ? "bold" : "normal",
                bgcolor: priceFilter === "" ? "grey.700" : "inherit",
                color:
                  priceFilter === "" ? "primary.contrastText" : "inherit",
              }}
            >
              All
            </MenuItem>
            <MenuItem
              onClick={() => setPriceFilter("low")}
              sx={{
                fontWeight: priceFilter === "low" ? "bold" : "normal",
                bgcolor: priceFilter === "low" ? "grey.700" : "inherit",
                color:
                  priceFilter === "low" ? "primary.contrastText" : "inherit",
              }}
            >
              Below ₱5,000
            </MenuItem>
            <MenuItem
              onClick={() => setPriceFilter("mid")}
              sx={{
                fontWeight: priceFilter === "mid" ? "bold" : "normal",
                bgcolor: priceFilter === "mid" ? "grey.700" : "inherit",
                color:
                  priceFilter === "mid" ? "primary.contrastText" : "inherit",
              }}
            >
              ₱5,000 – ₱20,000
            </MenuItem>
            <MenuItem
              onClick={() => setPriceFilter("high")}
              sx={{
                fontWeight: priceFilter === "high" ? "bold" : "normal",
                bgcolor: priceFilter === "high" ? "grey.700" : "inherit",
                color:
                  priceFilter === "high" ? "primary.contrastText" : "inherit",
              }}
            >
              Above ₱20,000
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Loading */}
      {loading && <CircularProgress sx={{ mb: 2 }} />}

      {/* Items Grid */}
      <Grid container spacing={2} justifyContent="center">
        {!loading && filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Grid item key={item._id}>
              <Card
                sx={{
                  width: "300px",
                  borderRadius: 2,
                  boxShadow: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedItem(item);
                  setShowBuyModal(true);
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  // image={item.image || "placeholder.jpg"}
                    image={
    Array.isArray(item.images) && item.images.length > 0
      ? item.images[0] // ✅ show only the first image
      : "placeholder.jpg"
  }
                  alt={item.name}
                  onError={(e) => (e.target.src = "placeholder.jpg")}
                  sx={{ borderRadius: "8px 8px 0 0" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    fontSize="1rem"
                    fontWeight="bold"
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {truncateText(item.description, 50)}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mt: 1 }}
                  >
                    ₱{item.price}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    // color="grey.700"
                    // bgcolor=""
                    sx={{ backgroundColor: "#272626ff", color: "white", "&:hover": { backgroundColor: "grey.800" } }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyNow(item);
                    }}
                  >
                    Buy Now
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="dark"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item._id);
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : !loading ? (
          <Typography color="error">⚠️ No items available.</Typography>
        ) : null}
      </Grid>

      {/* Buy Modal */}
      {selectedItem && (
        <BuyModal
          open={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          item={selectedItem}
        />
      )}

      {/* Cart Modal */}
      {selectedItem && (
        <CartModal
          show={showCartModal}
          onClose={() => setShowCartModal(false)}
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
    </Container>
  );
};

export default Buy;






// import React, { useEffect, useState } from "react";
// import { OverlayTrigger, Popover } from "react-bootstrap";
// import toast from "react-hot-toast";
// import axios from "axios";
// import CartModal from "./Cart/CartModal";
// import { useAuth } from "../context/AuthContext"; // ✅ Import global auth

// const Buy = () => {
//   const { user } = useAuth(); // ✅ Get global user context
//   const [items, setItems] = useState([]);
//   const [filteredItems, setFilteredItems] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [userAddress, setUserAddress] = useState({});

//   useEffect(() => {
//     const fetchUserAddress = async () => {
//       if (!user?._id) return;
//       try {
//         const res = await axios.get(`/api/users/${user._id}/address`);
//         setUserAddress(res.data || {});
//       } catch (err) {
//         console.error("Failed to fetch address:", err);
//       }
//     };
//     fetchUserAddress();
//   }, [user]);

//   useEffect(() => {
//     const fetchItems = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get("/api/items");
//         setItems(res.data);
//         setFilteredItems(res.data);
//         setError(null);
//       } catch (err) {
//         console.error("Failed to fetch items:", err);
//         setError("Failed to load items.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchItems();
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
//     if (!user?._id) {
//       toast.error("Please log in to add items to cart.");
//       return;
//     }

//     try {
//       await axios.post(`/api/cart/${user._id}/add`, { itemId });
//       toast.success("Item added to cart!");
//       window.dispatchEvent(new CustomEvent("cartUpdated", { detail: 1 }));
//     } catch (err) {
//       console.error("Add to cart error:", err);
//       toast.error("Could not add item to cart.");
//     }
//   };

//   const handleBuyNow = (item) => {
//     if (!user?._id) {
//       toast.error("Please log in to proceed with purchase.");
//       return;
//     }
//     setSelectedItem({ ...item, quantity: 1 });
//     setShowModal(true);
//   };

//   const handleOrderConfirm = async (address, notes) => {
//     if (!user?._id || !selectedItem) return;

//     try {
//       await axios.post(`/api/orders`, {
//         userId: user._id,
//         items: [selectedItem],
//         total: parseFloat(selectedItem.price),
//         address,
//         notes,
//       });

//       toast.success("Order placed successfully!");
//       setSelectedItem(null);
//       setShowModal(false);
//     } catch (err) {
//       console.error("Order failed:", err);
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
//             <div className="col-md-2 mb-4" key={item._id}>
//               <div className="card" style={{ border: "none", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderRadius: "12px", padding: "10px", textAlign: "left" }}>
//                 {item.image && (
//                   <img
//                     src={item.image}
//                     alt={item.name}
//                     className="card-img-top"
//                     style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }}
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
//                           <img src={item.image} alt={item.name} className="img-fluid mb-2" />
//                           <p>{item.description}</p>
//                           <p className="fw-bold">₱{item.price}</p>
//                           {item.origin && <p>Origin: {item.origin}</p>}
//                           {item.age && <p>Age: {item.age}</p>}
//                           {item.createdAt && <p>Created At: {new Date(item.createdAt).toLocaleString()}</p>}
//                         </Popover.Body>
//                       </Popover>
//                     }
//                   >
//                     <h5 style={{ fontSize: "1rem", fontWeight: "bold", cursor: "pointer" }}>
//                       {item.name}
//                     </h5>
//                   </OverlayTrigger>
//                   <p style={{ fontSize: "0.9rem", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                     {truncateText(item.description, 50)}
//                   </p>
//                   <p style={{ fontSize: "1rem", fontWeight: "bold", color: "#333" }}>
//                     ₱{item.price}
//                   </p>
//                   <div className="d-flex gap-2">
//                     <button className="btn btn-dark btn-sm" onClick={() => handleBuyNow(item)}>Buy Now</button>
//                     <button className="btn btn-outline-dark btn-sm" onClick={() => handleAddToCart(item._id)}>Add to Cart</button>
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
