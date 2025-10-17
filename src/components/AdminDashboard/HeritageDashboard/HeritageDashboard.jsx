import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

const HeritageDashboard = () => {
  const [heritageItems, setHeritageItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeritageItems();
  }, []);

  const fetchHeritageItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/heritage`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHeritageItems(data);
    } catch (error) {
      console.error('Error fetching heritage items:', error);
      toast.error('Failed to fetch heritage items');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/heritage/${itemId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Heritage item approved successfully');
      fetchHeritageItems();
    } catch (error) {
      console.error('Error approving heritage item:', error);
      toast.error('Failed to approve heritage item');
    }
  };

  const handleReject = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/heritage/${itemId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Heritage item rejected successfully');
      fetchHeritageItems();
    } catch (error) {
      console.error('Error rejecting heritage item:', error);
      toast.error('Failed to reject heritage item');
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
      <h2 className="mb-4">Heritage Items Dashboard</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Submitted By</th>
            <th>Date Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {heritageItems.map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.status}</td>
              <td>{item.submittedBy?.name || 'N/A'}</td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>
                {item.status === 'pending' && (
                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(item._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(item._id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default HeritageDashboard;