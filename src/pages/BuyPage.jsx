import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const BuyPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [notes, setNotes] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setError("Failed to load item details.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, API_URL]);

  useEffect(() => {
    // Optionally fetch user address here if needed
    // Example: fetch from /api/users/:userId/address
  }, []);

  const images = Array.isArray(item?.images) && item.images.length > 0 ? item.images : ["placeholder.jpg"];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleConfirm = () => {
    // Implement order logic here
    // Example: axios.post(`${API_URL}/api/orders`, {...})
    // Add navigation or feedback here if needed
  };

  if (loading) {
    return <Typography variant="h6">Loading item details...</Typography>;
  }
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
  if (!item) {
    return <Typography variant="h6">No item found.</Typography>;
  }

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default', p: { xs: 2, md: 6 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 4, maxWidth: 1200, mx: 'auto' }}>
        {/* Image Carousel */}
        <Box sx={{ flex: 1, position: 'relative', textAlign: 'center', minWidth: 320 }}>
          <img
            src={images[currentIndex]}
            alt={item.name}
            style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '16px', background: '#f5f5f5' }}
            onError={(e) => (e.target.src = 'placeholder.jpg')}
          />
          {images.length > 1 && (
            <>
              <IconButton onClick={handlePrev} sx={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}>
                <ArrowBackIos />
              </IconButton>
              <IconButton onClick={handleNext} sx={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}>
                <ArrowForwardIos />
              </IconButton>
            </>
          )}
          {images.length > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              {images.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  sx={{ width: 12, height: 12, borderRadius: '50%', mx: 0.5, cursor: 'pointer', backgroundColor: currentIndex === index ? 'primary.main' : 'grey.400' }}
                />
              ))}
            </Box>
          )}
        </Box>
        {/* Details Section */}
        <Box sx={{ flex: 2, minWidth: 320 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>{item.name}</Typography>
          <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>₱{item.price}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{item.description}</Typography>
          {item.origin && <Typography variant="body2" sx={{ mb: 1 }}>Origin: <b>{item.origin}</b></Typography>}
          {item.age && <Typography variant="body2" sx={{ mb: 1 }}>Age: <b>{item.age}</b></Typography>}
          {/* Add more details here if needed */}
          <Box mt={4} display="flex" gap={2}>
            <Button variant="outlined" href="/">Back</Button>
            <Button onClick={handleConfirm} variant="contained" color="primary">Confirm Purchase</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BuyPage;
