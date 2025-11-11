

// import React, { useState, useEffect } from 'react';
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

//   useEffect(() => {
//     fetchHeritageItems();
//   }, []);

//   const authHeaders = () => {
//     const token = localStorage.getItem('token');
//     return { Authorization: `Bearer ${token}` };
//   };

//   const fetchHeritageItems = async () => {
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
//   };

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

//     // numeric coercion for latitude/longitude but allow empty string
//     if (name === 'latitude' || name === 'longitude') {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value === '' ? '' : value, // keep as string for controlled input, parse on submit
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
  Image
} from 'react-bootstrap';
import { toast } from 'react-toastify';

const HeritageDashboard = () => {
  const [heritageItems, setHeritageItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const API_URL = process.env.REACT_APP_API_URL;

  // Stable auth header generator (so it can be used safely in callbacks/effects)
  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }, []);

  // Fetch function memoized so we can safely include it in useEffect deps
  const fetchHeritageItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/heritage`, {
        headers: authHeaders(),
      });
      setHeritageItems(data || []);
    } catch (error) {
      console.error('Error fetching heritage items:', error);
      toast.error('Failed to fetch heritage items');
    } finally {
      setLoading(false);
    }
  }, [API_URL, authHeaders]);

  useEffect(() => {
    fetchHeritageItems();
  }, [fetchHeritageItems]);

  // ---------- Helpers ----------
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      latitude: '',
      longitude: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setFormData({
      name: item.name || '',
      description: item.description || '',
      image: item.image || '',
      // keep as '' for empty so inputs remain controlled as strings
      latitude: item.latitude ?? '',
      longitude: item.longitude ?? '',
    });
    setIsEditing(true);
    setEditingId(item._id);
    setShowModal(true);
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

    // keep latitude/longitude as strings for controlled input; parse to Number on submit
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
      toast.warn('Name is required');
      return false;
    }
    // latitude/longitude are optional; if provided, must be valid numbers
    if (formData.latitude !== '' && isNaN(Number(formData.latitude))) {
      toast.warn('Latitude must be a number');
      return false;
    }
    if (formData.longitude !== '' && isNaN(Number(formData.longitude))) {
      toast.warn('Longitude must be a number');
      return false;
    }
    return true;
  };

  // ---------- Add ----------
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        image: formData.image?.trim() || '',
        latitude:
          formData.latitude === '' ? undefined : Number(formData.latitude),
        longitude:
          formData.longitude === '' ? undefined : Number(formData.longitude),
      };

      await axios.post(`${API_URL}/api/heritage`, payload, {
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      });

      toast.success('Heritage item added');
      closeModal();
      // refetch (keeps UI consistent)
      fetchHeritageItems();
    } catch (error) {
      console.error('Error adding heritage item:', error);
      const msg =
        error?.response?.data?.message || 'Failed to add heritage item';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Edit ----------
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !editingId) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        image: formData.image?.trim() || '',
        latitude:
          formData.latitude === '' ? undefined : Number(formData.latitude),
        longitude:
          formData.longitude === '' ? undefined : Number(formData.longitude),
      };

      await axios.patch(`${API_URL}/api/heritage/${editingId}`, payload, {
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      });

      toast.success('Heritage item updated');
      closeModal();
      fetchHeritageItems();
    } catch (error) {
      console.error('Error updating heritage item:', error);
      const msg =
        error?.response?.data?.message || 'Failed to update heritage item';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Delete ----------
  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this heritage item? This cannot be undone.');
    if (!ok) return;

    try {
      await axios.delete(`${API_URL}/api/heritage/${id}`, {
        headers: authHeaders(),
      });
      toast.success('Heritage item deleted');
      // Optimistic update
      setHeritageItems((prev) => prev.filter((x) => x._id !== id));
    } catch (error) {
      console.error('Error deleting heritage item:', error);
      const msg =
        error?.response?.data?.message || 'Failed to delete heritage item';
      toast.error(msg);
    }
  };

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Heritage Items Dashboard</h2>
        <Button variant="primary" onClick={openAddModal}>
          + Add Heritage
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th style={{ minWidth: 180 }}>Name</th>
            <th>Description</th>
            <th style={{ minWidth: 140 }}>Image</th>
            <th style={{ minWidth: 120 }}>Latitude</th>
            <th style={{ minWidth: 120 }}>Longitude</th>
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
            heritageItems.map((item) => (
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
                <td>{item.latitude ?? '—'}</td>
                <td>{item.longitude ?? '—'}</td>
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
            ))
          )}
        </tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={closeModal} backdrop="static" centered>
        <Form onSubmit={isEditing ? handleEdit : handleAdd}>
          <Modal.Header closeButton>
            <Modal.Title>
              {isEditing ? 'Edit Heritage Item' : 'Add Heritage Item'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group controlId="heritageName">
                  <Form.Label>Name <span className="text-danger">*</span></Form.Label>
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
