
// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import {
//   Table,
//   Button,
//   Spinner,
//   Modal,
//   Form,
//   Row,
//   Col,
//   Image
// } from 'react-bootstrap';
// import { toast } from 'react-toastify';

// const HeritageDashboard = () => {
//   const [heritageItems, setHeritageItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Add/Edit modal state
//   const [showModal, setShowModal] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   // Form state
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     image: '',
//     latitude: '',
//     longitude: '',
//   });

//   const API_URL = process.env.REACT_APP_API_URL;

//   // Stable auth header generator (so it can be used safely in callbacks/effects)
//   const authHeaders = useCallback(() => {
//     const token = localStorage.getItem('token');
//     return { Authorization: `Bearer ${token}` };
//   }, []);

//   // Fetch function memoized so we can safely include it in useEffect deps
//   const fetchHeritageItems = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data } = await axios.get(`${API_URL}/api/heritage`, {
//         headers: authHeaders(),
//       });
//       setHeritageItems(data || []);
//     } catch (error) {
//       console.error('Error fetching heritage items:', error);
//       toast.error('Failed to fetch heritage items');
//     } finally {
//       setLoading(false);
//     }
//   }, [API_URL, authHeaders]);

//   useEffect(() => {
//     fetchHeritageItems();
//   }, [fetchHeritageItems]);

//   // ---------- Helpers ----------
//   const resetForm = () => {
//     setFormData({
//       name: '',
//       description: '',
//       image: '',
//       latitude: '',
//       longitude: '',
//     });
//   };

//   const openAddModal = () => {
//     resetForm();
//     setIsEditing(false);
//     setEditingId(null);
//     setShowModal(true);
//   };

//   const openEditModal = (item) => {
//     setFormData({
//       name: item.name || '',
//       description: item.description || '',
//       image: item.image || '',
//       // keep as '' for empty so inputs remain controlled as strings
//       latitude: item.latitude ?? '',
//       longitude: item.longitude ?? '',
//     });
//     setIsEditing(true);
//     setEditingId(item._id);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     if (submitting) return;
//     setShowModal(false);
//     setIsEditing(false);
//     setEditingId(null);
//     resetForm();
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // keep latitude/longitude as strings for controlled input; parse to Number on submit
//     if (name === 'latitude' || name === 'longitude') {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value === '' ? '' : value,
//       }));
//       return;
//     }

//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     if (!formData.name.trim()) {
//       toast.warn('Name is required');
//       return false;
//     }
//     // latitude/longitude are optional; if provided, must be valid numbers
//     if (formData.latitude !== '' && isNaN(Number(formData.latitude))) {
//       toast.warn('Latitude must be a number');
//       return false;
//     }
//     if (formData.longitude !== '' && isNaN(Number(formData.longitude))) {
//       toast.warn('Longitude must be a number');
//       return false;
//     }
//     return true;
//   };

//   // ---------- Add ----------
//   const handleAdd = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     try {
//       setSubmitting(true);
//       const payload = {
//         name: formData.name.trim(),
//         description: formData.description?.trim() || '',
//         image: formData.image?.trim() || '',
//         latitude:
//           formData.latitude === '' ? undefined : Number(formData.latitude),
//         longitude:
//           formData.longitude === '' ? undefined : Number(formData.longitude),
//       };

//       await axios.post(`${API_URL}/api/heritage`, payload, {
//         headers: { ...authHeaders(), 'Content-Type': 'application/json' },
//       });

//       toast.success('Heritage item added');
//       closeModal();
//       // refetch (keeps UI consistent)
//       fetchHeritageItems();
//     } catch (error) {
//       console.error('Error adding heritage item:', error);
//       const msg =
//         error?.response?.data?.message || 'Failed to add heritage item';
//       toast.error(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ---------- Edit ----------
//   const handleEdit = async (e) => {
//     e.preventDefault();
//     if (!validateForm() || !editingId) return;

//     try {
//       setSubmitting(true);
//       const payload = {
//         name: formData.name.trim(),
//         description: formData.description?.trim() || '',
//         image: formData.image?.trim() || '',
//         latitude:
//           formData.latitude === '' ? undefined : Number(formData.latitude),
//         longitude:
//           formData.longitude === '' ? undefined : Number(formData.longitude),
//       };

//       await axios.patch(`${API_URL}/api/heritage/${editingId}`, payload, {
//         headers: { ...authHeaders(), 'Content-Type': 'application/json' },
//       });

//       toast.success('Heritage item updated');
//       closeModal();
//       fetchHeritageItems();
//     } catch (error) {
//       console.error('Error updating heritage item:', error);
//       const msg =
//         error?.response?.data?.message || 'Failed to update heritage item';
//       toast.error(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ---------- Delete ----------
//   const handleDelete = async (id) => {
//     const ok = window.confirm('Delete this heritage item? This cannot be undone.');
//     if (!ok) return;

//     try {
//       await axios.delete(`${API_URL}/api/heritage/${id}`, {
//         headers: authHeaders(),
//       });
//       toast.success('Heritage item deleted');
//       // Optimistic update
//       setHeritageItems((prev) => prev.filter((x) => x._id !== id));
//     } catch (error) {
//       console.error('Error deleting heritage item:', error);
//       const msg =
//         error?.response?.data?.message || 'Failed to delete heritage item';
//       toast.error(msg);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center vh-100">
//         <Spinner animation="border" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </Spinner>
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid p-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2 className="mb-0">Heritage Items Dashboard</h2>
//         <Button variant="primary" onClick={openAddModal}>
//           + Add Heritage
//         </Button>
//       </div>

//       <Table striped bordered hover responsive>
//         <thead>
//           <tr>
//             <th style={{ minWidth: 180 }}>Name</th>
//             <th>Description</th>
//             <th style={{ minWidth: 140 }}>Image</th>
//             <th style={{ minWidth: 120 }}>Latitude</th>
//             <th style={{ minWidth: 120 }}>Longitude</th>
//             <th style={{ minWidth: 140 }}>Date Created</th>
//             <th style={{ minWidth: 160 }}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {heritageItems.length === 0 ? (
//             <tr>
//               <td colSpan={7} className="text-center text-muted py-4">
//                 No heritage items yet.
//               </td>
//             </tr>
//           ) : (
//             heritageItems.map((item) => (
//               <tr key={item._id}>
//                 <td className="fw-semibold">{item.name}</td>
//                 <td style={{ maxWidth: 360, whiteSpace: 'pre-wrap' }}>
//                   {item.description || '—'}
//                 </td>
//                 <td>
//                   {item.image ? (
//                     <Image
//                       src={item.image}
//                       alt={item.name}
//                       thumbnail
//                       style={{ maxWidth: 120, maxHeight: 80, objectFit: 'cover' }}
//                       onError={(e) => (e.currentTarget.style.display = 'none')}
//                     />
//                   ) : (
//                     '—'
//                   )}
//                 </td>
//                 <td>{item.latitude ?? '—'}</td>
//                 <td>{item.longitude ?? '—'}</td>
//                 <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>
//                 <td>
//                   <div className="d-flex gap-2">
//                     <Button
//                       variant="outline-secondary"
//                       size="sm"
//                       onClick={() => openEditModal(item)}
//                     >
//                       Edit
//                     </Button>
//                     <Button
//                       variant="outline-danger"
//                       size="sm"
//                       onClick={() => handleDelete(item._id)}
//                     >
//                       Delete
//                     </Button>
//                   </div>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </Table>

//       {/* Add/Edit Modal */}
//       <Modal show={showModal} onHide={closeModal} backdrop="static" centered>
//         <Form onSubmit={isEditing ? handleEdit : handleAdd}>
//           <Modal.Header closeButton>
//             <Modal.Title>
//               {isEditing ? 'Edit Heritage Item' : 'Add Heritage Item'}
//             </Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Row className="g-3">
//               <Col md={12}>
//                 <Form.Group controlId="heritageName">
//                   <Form.Label>Name <span className="text-danger">*</span></Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     placeholder="e.g., Casa Herrera"
//                     required
//                   />
//                 </Form.Group>
//               </Col>

//               <Col md={12}>
//                 <Form.Group controlId="heritageDesc">
//                   <Form.Label>Description</Form.Label>
//                   <Form.Control
//                     as="textarea"
//                     rows={3}
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     placeholder="Short background or notes"
//                   />
//                 </Form.Group>
//               </Col>

//               <Col md={12}>
//                 <Form.Group controlId="heritageImage">
//                   <Form.Label>Image URL</Form.Label>
//                   <Form.Control
//                     type="url"
//                     name="image"
//                     value={formData.image}
//                     onChange={handleChange}
//                     placeholder="https://…"
//                   />
//                   {!!formData.image && (
//                     <div className="mt-2">
//                       <Image
//                         src={formData.image}
//                         alt="preview"
//                         thumbnail
//                         style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover' }}
//                         onError={(e) => (e.currentTarget.style.display = 'none')}
//                       />
//                     </div>
//                   )}
//                 </Form.Group>
//               </Col>

//               <Col md={6}>
//                 <Form.Group controlId="heritageLat">
//                   <Form.Label>Latitude</Form.Label>
//                   <Form.Control
//                     type="number"
//                     name="latitude"
//                     value={formData.latitude}
//                     onChange={handleChange}
//                     step="any"
//                     placeholder="e.g., 13.9365"
//                   />
//                 </Form.Group>
//               </Col>

//               <Col md={6}>
//                 <Form.Group controlId="heritageLng">
//                   <Form.Label>Longitude</Form.Label>
//                   <Form.Control
//                     type="number"
//                     name="longitude"
//                     value={formData.longitude}
//                     onChange={handleChange}
//                     step="any"
//                     placeholder="e.g., 121.6131"
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={closeModal} disabled={submitting}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="primary" disabled={submitting}>
//               {submitting ? (
//                 <>
//                   <Spinner size="sm" animation="border" className="me-2" /> Saving…
//                 </>
//               ) : isEditing ? (
//                 'Save Changes'
//               ) : (
//                 'Add Heritage'
//               )}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default HeritageDashboard;


import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  Spinner,
  Modal,
  Form,
  Row,
  Col,
  Image,
  Badge,
  Pagination,
} from 'react-bootstrap';
import toast from 'react-hot-toast';
import { Box, Tooltip, IconButton } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import MapComponent from '../../MapComponent';

const HeritageDashboard = () => {
  const [heritageItems, setHeritageItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    latitude: '',
    longitude: '',
  });

  // Items (for checklist)
  const [itemsList, setItemsList] = useState([]); // all available items from server
  const [selectedItems, setSelectedItems] = useState([]); // array of item _ids selected for this heritage

  const API_URL = process.env.REACT_APP_API_URL;

  // Stable auth header generator
  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }, []);

  // Fetch items list for checklist
  const fetchItemsList = useCallback(async () => {
    try {
      // Expect your backend to expose GET /api/items returning all items
      const { data } = await axios.get(`${API_URL}/api/items`, {
        headers: authHeaders(),
      });
      setItemsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch items list (check /api/items):', err);
      setItemsList([]);
    }
  }, [API_URL, authHeaders]);

  // Fetch heritage items (list). We'll attempt to populate items per-site where possible.
  const fetchHeritageItems = useCallback(async () => {
    setLoading(true);
    try {
      // first fetch all heritage sites
      const { data } = await axios.get(`${API_URL}/api/heritage`, {
        headers: authHeaders(),
      });

      const sites = Array.isArray(data) ? data : [];

      // Try to fetch populated items for each site using the populate endpoint (if available).
      // This will fallback gracefully if errors occur.
      const populated = await Promise.all(
        sites.map(async (s) => {
          try {
            const resp = await axios.get(`${API_URL}/api/heritage/${s._id}?populate=true`, {
              headers: authHeaders(),
            });
            return resp.data || s;
          } catch (err) {
            // populate endpoint might not exist for list — return the original site
            return s;
          }
        })
      );

      setHeritageItems(populated);
    } catch (error) {
      console.error('Error fetching heritage items:', error);
      toast.error('Failed to fetch heritage items');
    } finally {
      setLoading(false);
    }
  }, [API_URL, authHeaders]);

  useEffect(() => {
    fetchHeritageItems();
    fetchItemsList();
  }, [fetchHeritageItems, fetchItemsList]);

  // ---------- Helpers ----------
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      latitude: '',
      longitude: '',
    });
    setSelectedItems([]);
  };

  const openAddModal = () => {
    resetForm();
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  // When editing, fetch populated heritage so we get items array as objects
  const openEditModal = async (item) => {
    try {
      setIsEditing(true);
      setEditingId(item._id);
      // try to fetch populated version
      let payload = item;
      try {
        const resp = await axios.get(`${API_URL}/api/heritage/${item._id}?populate=true`, {
          headers: authHeaders(),
        });
        payload = resp.data || item;
      } catch (err) {
        // fallback to provided item (may contain bare item ids)
        payload = item;
      }

      setFormData({
        name: payload.name || '',
        description: payload.description || '',
        image: payload.image || '',
        latitude: payload.latitude ?? '',
        longitude: payload.longitude ?? '',
      });

      // selectedItems should be an array of ids. payload.items may be array of objects or ids
      if (Array.isArray(payload.items)) {
        const ids = payload.items.map((it) => (typeof it === 'object' ? it._id : it)).filter(Boolean);
        setSelectedItems(ids);
      } else {
        setSelectedItems([]);
      }

      setShowModal(true);
    } catch (err) {
      console.error('Error opening edit modal:', err);
      toast.error('Failed to load heritage for editing');
    }
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'latitude' || name === 'longitude') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? '' : value,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast('Name is required', { icon: '⚠️' });
      return false;
    }
    if (formData.latitude !== '' && isNaN(Number(formData.latitude))) {
      toast('Latitude must be a number', { icon: '⚠️' });
      return false;
    }
    if (formData.longitude !== '' && isNaN(Number(formData.longitude))) {
      toast('Longitude must be a number', { icon: '⚠️' });
      return false;
    }
    return true;
  };

  // Checkbox toggle for items checklist
  const toggleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      const idStr = String(itemId);
      if (prev.map(String).includes(idStr)) {
        return prev.filter((p) => String(p) !== idStr);
      }
      return [...prev, itemId];
    });
  };

  // ---------- Add Heritage ----------
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        image: formData.image?.trim() || '',
        latitude: formData.latitude === '' ? undefined : Number(formData.latitude),
        longitude: formData.longitude === '' ? undefined : Number(formData.longitude),
        items: selectedItems,
      };

      await axios.post(`${API_URL}/api/heritage`, payload, {
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      });

      toast.success('Heritage item added');
      closeModal();
      fetchHeritageItems();
    } catch (error) {
      console.error('Error adding heritage item:', error);
      const msg = error?.response?.data?.message || 'Failed to add heritage item';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Edit Heritage ----------
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !editingId) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        image: formData.image?.trim() || '',
        latitude: formData.latitude === '' ? undefined : Number(formData.latitude),
        longitude: formData.longitude === '' ? undefined : Number(formData.longitude),
        items: selectedItems,
      };

      await axios.patch(`${API_URL}/api/heritage/${editingId}`, payload, {
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      });

      toast.success('Heritage item updated');
      closeModal();
      fetchHeritageItems();
    } catch (error) {
      console.error('Error updating heritage item:', error);
      const msg = error?.response?.data?.message || 'Failed to update heritage item';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Delete Heritage ----------
  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this heritage item? This cannot be undone.');
    if (!ok) return;

    try {
      await axios.delete(`${API_URL}/api/heritage/${id}`, {
        headers: authHeaders(),
      });
      toast.success('Heritage item deleted');
      setHeritageItems((prev) => prev.filter((x) => x._id !== id));
    } catch (error) {
      console.error('Error deleting heritage item:', error);
      const msg = error?.response?.data?.message || 'Failed to delete heritage item';
      toast.error(msg);
    }
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <h2 className="mb-0" style={{ margin: 0 }}>Heritage Items Dashboard</h2>
          <Tooltip title={showMap ? 'Hide Map' : 'Show Map'}>
            <IconButton onClick={() => setShowMap((prev) => !prev)}>
              <MapIcon color={showMap ? 'primary' : 'action'} />
            </IconButton>
          </Tooltip>
        </Box>
        <Button variant="primary" onClick={openAddModal}>
          + Add Heritage
        </Button>
      </Box>

      {/* Map */}
      {showMap && (
        <Box sx={{ mb: 2 }}>
          <div className="card p-4 rounded-4 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
            <MapComponent />
          </div>
        </Box>
      )}


      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th style={{ minWidth: 180 }}>Name</th>
            <th>Description</th>
            <th style={{ minWidth: 140 }}>Image</th>
            <th style={{ minWidth: 160 }}>Attached Items</th>
            <th style={{ minWidth: 160 }}>Coordinates</th>
            <th style={{ minWidth: 140 }}>Date Created</th>
            <th style={{ minWidth: 160 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {heritageItems.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-muted py-4">
                No heritage items yet.
              </td>
            </tr>
          ) : (
            heritageItems.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => {
              const lat = item.latitude ?? null;
              const lng = item.longitude ?? null;
              const coordinates =
                lat === null && lng === null ? '—' : `${lat ?? '—'}, ${lng ?? '—'}`;

              return (
                <tr key={item._id}>
                  <td className="fw-semibold">{item.name}</td>
                  <td style={{ maxWidth: 360, whiteSpace: 'pre-wrap' }}>
                    {item.description || '—'}
                  </td>
                  <td>
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        thumbnail
                        style={{ maxWidth: 120, maxHeight: 80, objectFit: 'cover' }}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      '—'
                    )}
                  </td>

                  <td>
                    {/* Display attached items. item.items may be array of objects or ids */}
                    {Array.isArray(item.items) && item.items.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {item.items.map((it) => {
                          const obj = typeof it === 'object' ? it : null;
                          const id = obj ? obj._id : it;
                          const name = obj ? obj.name : 'Item';
                          const img = obj && obj.images && obj.images[0] ? obj.images[0] : null;
                          return (
                            <Badge
                              bg="light"
                              text="dark"
                              key={id}
                              className="border d-inline-flex align-items-center"
                              style={{ marginRight: 6, padding: '6px 8px', height: 28 }}
                            >
                              {img ? (
                                <Image
                                  src={img}
                                  alt={name}
                                  rounded
                                  style={{ width: 24, height: 20, objectFit: 'cover', marginRight: 6 }}
                                  onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                              ) : null}
                              <span style={{ fontSize: 13 }}>{name}</span>
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  <td>{coordinates}</td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => openEditModal(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      {heritageItems.length > 0 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            {Array.from(
              {
                length: Math.min(
                  Math.ceil(heritageItems.length / pageSize),
                  20
                ),
              },
              (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              )
            )}
          </Pagination>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={closeModal} backdrop="static" centered size="lg">
        <Form onSubmit={isEditing ? handleEdit : handleAdd}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Edit Heritage Item' : 'Add Heritage Item'}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group controlId="heritageName">
                  <Form.Label>
                    Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Casa Herrera"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="heritageDesc">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Short background or notes"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="heritageImage">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://…"
                  />
                  {!!formData.image && (
                    <div className="mt-2">
                      <Image
                        src={formData.image}
                        alt="preview"
                        thumbnail
                        style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover' }}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="heritageLat">
                  <Form.Label>Latitude</Form.Label>
                  <Form.Control
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="any"
                    placeholder="e.g., 13.9365"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="heritageLng">
                  <Form.Label>Longitude</Form.Label>
                  <Form.Control
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="any"
                    placeholder="e.g., 121.6131"
                  />
                </Form.Group>
              </Col>

              {/* ---------- Items Checklist ---------- */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Attach Items</Form.Label>
                  <div
                    style={{
                      maxHeight: 220,
                      overflowY: 'auto',
                      padding: 8,
                      border: '1px solid #e9ecef',
                      borderRadius: 6,
                    }}
                  >
                    {itemsList.length === 0 ? (
                      <div className="text-muted small">No items available.</div>
                    ) : (
                      itemsList.map((it) => (
                        <Form.Check
                          key={it._id}
                          type="checkbox"
                          id={`chk-item-${it._id}`}
                          label={
                            <div className="d-flex align-items-center gap-2">
                              {it.images && it.images[0] ? (
                                <Image
                                  src={it.images[0]}
                                  alt={it.name}
                                  rounded
                                  style={{ width: 36, height: 28, objectFit: 'cover' }}
                                  onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                              ) : null}
                              <div>
                                <div style={{ fontSize: 14 }}>{it.name}</div>
                                <div className="text-muted small">{it.origin || `₱${it.price ?? '—'}`}</div>
                              </div>
                            </div>
                          }
                          checked={selectedItems.map(String).includes(String(it._id))}
                          onChange={() => toggleSelectItem(it._id)}
                          className="mb-2"
                        />
                      ))
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" /> Saving…
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add Heritage'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HeritageDashboard;
