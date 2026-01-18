

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Tabs,
  Tab,
} from "@mui/material";
import toast from "react-hot-toast";
import axios from "axios";
import CartModal from "../Cart/CartModal";
import { useAuth } from "../../context/AuthContext";
import FilterListIcon from "@mui/icons-material/FilterList";

const Buy = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [userAddress, setUserAddress] = useState({});
  const [filterAnchor, setFilterAnchor] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  // Updated categories to match server model
  const categories = [
    "Table",
    "Chair",
    "Cabinet",
    "Post",
    "Scraps",
    "Stones",
    "Windows",
    "Railings",
    "Doors",
    "Others",
  ];

  const getItemCategories = (item) => {
    if (Array.isArray(item?.categories)) return item.categories;
    if (item?.category) return [item.category];
    return [];
  };

  const itemMatchesCategory = useCallback((item, selected) => {
    if (!selected) return true;
    const cats = getItemCategories(item);
    return cats.some((c) => c && c.toLowerCase() === selected.toLowerCase());
  }, []);

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
  }, [user, API_URL]);

  // fetch items (includes quantity)
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/items`);
        const itemArray = Array.isArray(res.data) ? res.data : [];

        // Only show available items (server controls availability) but keep quantity
        const availableOnly = itemArray.filter(
          (it) => it?.availability === true || it?.availability === "true"
        );

        setItems(availableOnly);
        setFilteredItems(availableOnly);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch items:", err);
        setError("Failed to load items.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [API_URL]);

  useEffect(() => {
    let filtered = items.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    if (priceFilter === "low") {
      filtered = filtered.filter((item) => Number(item.price) < 5000);
    } else if (priceFilter === "mid") {
      filtered = filtered.filter(
        (item) => Number(item.price) >= 5000 && Number(item.price) <= 20000
      );
    } else if (priceFilter === "high") {
      filtered = filtered.filter((item) => Number(item.price) > 20000);
    }

    if (categoryFilter) {
      filtered = filtered.filter((item) =>
        itemMatchesCategory(item, categoryFilter)
      );
    }

    filtered = filtered.filter(
      (it) => it?.availability === true || it?.availability === "true"
    );

    setFilteredItems(filtered);
  }, [searchQuery, priceFilter, categoryFilter, items, itemMatchesCategory]);

  const truncateText = (text, length) =>
    text?.length > length ? text.substring(0, length) + "..." : text;

  const handleAddToCart = async (itemId) => {
    if (!user?._id) {
      toast.error("Please log in to add items to cart.");
      return;
    }

    const item = items.find((it) => it._id === itemId);
    if (!item || (item.availability !== true && item.availability !== "true")) {
      toast.error("Item is no longer available.");
      setItems((prev) => prev.filter((it) => it._id !== itemId));
      setFilteredItems((prev) => prev.filter((it) => it._id !== itemId));
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
        setItems((prev) => prev.filter((it) => it._id !== itemId));
        setFilteredItems((prev) => prev.filter((it) => it._id !== itemId));
      } else {
        toast.error("Could not add item to cart.");
      }
    }
  };

  const openCartModalForItem = (item) => {
    if (!user?._id) {
      toast.error("Please log in to proceed with purchase.");
      return;
    }

    if (item?.availability !== true && item?.availability !== "true") {
      toast.error("This item is no longer available.");
      setItems((prev) => prev.filter((it) => it._id !== item._id));
      setFilteredItems((prev) => prev.filter((it) => it._id !== item._id));
      return;
    }

    setSelectedItem(item);
    setShowCartModal(true);
  };

  const handleCardClick = (item) => {
    if (!user?._id) {
      toast.error("Please log in to proceed to the buy page.");
      return;
    }
    if (item?.availability !== true && item?.availability !== "true") {
      toast.error("This item is no longer available.");
      setItems((prev) => prev.filter((it) => it._id !== item._id));
      setFilteredItems((prev) => prev.filter((it) => it._id !== item._id));
      return;
    }
    navigate(`/buy/${item._id}`);
  };

  const handleFilterOpen = (event) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const renderCategoryLabel = (item) => {
    const cats = getItemCategories(item);
    if (cats.length) return cats.join(", ");
    return item?.category || "Uncategorized";
  };

  const closeCartModal = () => {
    setShowCartModal(false);
    setSelectedItem(null);
  };

  // Helper to call decrement endpoint
  const decrementItem = async (id, amount = 1, headers = {}) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/items/${id}/decrement`,
        { amount },
        { headers: { "Content-Type": "application/json", ...headers } }
      );
      return { ok: true, data: res.data };
    } catch (err) {
      return { ok: false, err };
    }
  };

  // ------------ NEW: parent-provided onConfirm handler ----------------
  // This lets the CartModal delegate order creation to Buy, which will
  // ensure the item's quantity is decremented and local state is updated.
  const handleParentConfirm = useCallback(
    async (address, notes = "", selectedItems = []) => {
      if (!user?._id) throw new Error("User not found.");
      if (!selectedItems || selectedItems.length === 0)
        throw new Error("No items selected.");

      // Build payload similar to CartModal's buildOrderPayload
      const itemsPayload = selectedItems.map((i) => ({
        id: i._id || i.id || i.itemId || i._id,
        quantity: Number(i.quantity) || 1,
        name: i.name || i.title || i.itemName || "",
        price: Number(i.price) || Number(i.unitPrice) || 0,
        image:
          Array.isArray(i.images) && i.images.length ? i.images[0] : i.image || "",
        subtotal: Number(
          ((Number(i.quantity) || 1) * (Number(i.price) || 0)).toFixed(2)
        ),
      }));

      const total = itemsPayload.reduce((acc, it) => acc + (Number(it.subtotal) || 0), 0);

      // send order to server
      const payload = {
        userId: user._id,
        items: itemsPayload,
        address: address || userAddress || {},
        notes: notes || "",
        total: Number(total.toFixed(2)),
      };

      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // create order
      const orderRes = await axios.post(`${API_URL}/api/orders`, payload, {
        headers: { "Content-Type": "application/json", ...headers },
      });

      const created = orderRes.data;

      // decrement quantities atomically using backend endpoint
      const orderedIds = itemsPayload
        .map((it) => ({ id: it.id, amount: it.quantity }))
        .filter(Boolean);
      const insufficient = [];
      const decrementFailures = [];

      for (const ord of orderedIds) {
        const result = await decrementItem(ord.id, ord.amount, headers);
        if (!result.ok) {
          // inspect response for insufficient stock
          const resp = result.err?.response;
          if (
            resp?.status === 400 &&
            resp?.data?.error?.toLowerCase?.().includes("insufficient")
          ) {
            insufficient.push(String(ord.id));
          } else {
            decrementFailures.push(String(ord.id));
          }
        } else {
          // success -> update local item's quantity and availability
          const updated = result.data;
          try {
            setItems((prev = []) =>
              prev.map((it) => (String(it._id) === String(updated._id) ? updated : it))
            );
            setFilteredItems((prev = []) =>
              prev.map((it) => (String(it._id) === String(updated._id) ? updated : it))
            );
          } catch (e) {
            console.warn("Failed to update local item after decrement:", e);
          }
        }
      }

      // Handle insufficient stock: remove locally and notify user
      if (insufficient.length > 0) {
        toast.error("Some items were out of stock and removed from your cart.");
        setItems((prev = []) => prev.filter((it) => !insufficient.includes(String(it._id))));
        setFilteredItems((prev = []) =>
          prev.filter((it) => !insufficient.includes(String(it._id)))
        );
      }

      if (decrementFailures.length > 0) {
        toast.success(
          `Order placed (but failed to update stock for ${decrementFailures.length} item(s)).`
        );
      }

      // remove item locally so UI updates correctly (if quantity reached 0 backend should set availability=false)
      try {
        const removedIds = orderedIds.map((o) => String(o.id));
        setItems((prev = []) =>
          prev.filter(
            (it) => !removedIds.includes(String(it._id)) || (it.quantity && it.quantity > 0)
          )
        );
        setFilteredItems((prev = []) =>
          prev.filter(
            (it) => !removedIds.includes(String(it._id)) || (it.quantity && it.quantity > 0)
          )
        );
      } catch (e) {
        console.warn("Local cleanup failed:", e);
      }

      // optionally remove from cart via API (best-effort)
      try {
        if (orderedIds.length > 0) {
          const ids = orderedIds.map((o) => o.id);
          await axios.put(
            `${API_URL}/api/cart/${user._id}/remove`,
            { removeItems: ids },
            { headers: { "Content-Type": "application/json", ...headers } }
          );
        }
      } catch (e) {
        console.warn("Cart removal failed:", e);
      }

      // success — return created order so CartModal knows it succeeded
      return created;
    },
    [API_URL, user, userAddress, decrementItem]
  );

  return (
    <Container maxWidth={false} disableGutters sx={{ minHeight: "100vh", p: 3 }}>
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
          <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={handleFilterClose}>
            <MenuItem disabled>Filter by Price</MenuItem>
            <MenuItem onClick={() => setPriceFilter("")}>All</MenuItem>
            <MenuItem onClick={() => setPriceFilter("low")}>Below ₱5,000</MenuItem>
            <MenuItem onClick={() => setPriceFilter("mid")}>₱5,000 – ₱20,000</MenuItem>
            <MenuItem onClick={() => setPriceFilter("high")}>Above ₱20,000</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={categoryFilter || ""}
          onChange={(e, newValue) => setCategoryFilter(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" value="" />
          {categories.map((cat) => (
            <Tab key={cat} label={cat} value={cat} />
          ))}
        </Tabs>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading && <CircularProgress sx={{ mb: 2 }} />}

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
                onClick={() => handleCardClick(item)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : "placeholder.jpg"
                  }
                  alt={item.name}
                  onError={(e) => (e.target.src = "placeholder.jpg")}
                  sx={{ borderRadius: "8px 8px 0 0" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontSize="1rem" fontWeight="bold">
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
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                    <Typography variant="body1" fontWeight="bold" color="text.primary">
                      ₱{item.price}
                    </Typography>
                    {/* show quantity available */}
                    <Typography variant="caption" color={item.quantity > 0 ? "success.main" : "error.main"}>
                      {typeof item.quantity !== "undefined" && item.quantity !== null
                        ? `${item.quantity} left`
                        : "Quantity N/A"}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {renderCategoryLabel(item)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      backgroundColor: "#272626ff",
                      color: "white",
                      "&:hover": { backgroundColor: "grey.800" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openCartModalForItem(item);
                    }}
                    disabled={item?.availability !== true && item?.availability !== "true"}
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
                    disabled={item?.availability !== true && item?.availability !== "true"}
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

      {selectedItem && (
        <CartModal
          show={showCartModal}
          onClose={closeCartModal}
          onConfirm={handleParentConfirm} // <-- delegate order creation to parent so quantity updates
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
