import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import { Modal, Button, Image } from "react-bootstrap";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { FaTrashAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { addNotification } from "../../../../functions/utils/notifications"; // ✅ Import notification utility

const DemolishDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const snapshot = await getDocs(collection(db, "demolishRequest"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        console.error("Error fetching demolish requests:", err);
        setError("Failed to fetch demolish requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    const filtered = requests.filter((request) =>
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.where.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchQuery, requests]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        const deletedRequest = requests.find((r) => r.id === id);
        await deleteDoc(doc(db, "demolishRequest", id));
        await addNotification(
          `Demolish request from ${deletedRequest.name} was deleted.`,
          "demolish"
        );
        setRequests((prev) => prev.filter((req) => req.id !== id));
      } catch (error) {
        console.error("Error deleting request:", error);
      }
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const ref = doc(db, "demolishRequest", id);
      await updateDoc(ref, { status: newStatus });

      const updatedRequest = requests.find((r) => r.id === id);
      await addNotification(
        `Demolish request from ${updatedRequest.name} was ${newStatus}.`,
        "demolish"
      );

      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
      );
    } catch (error) {
      console.error(`Error updating status to ${newStatus}:`, error);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedRequest) return;

    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text("Demolish Request Details", 10, 20);
    docPDF.setFontSize(12);
    docPDF.text(`ID: ${selectedRequest.id}`, 10, 40);
    docPDF.text(`Name: ${selectedRequest.name}`, 10, 50);
    docPDF.text(`Contact: ${selectedRequest.contact}`, 10, 60);
    docPDF.text(`Location: ${selectedRequest.where}`, 10, 70);
    docPDF.text(`Urgency: ${selectedRequest.urgency}`, 10, 80);
    const description = docPDF.splitTextToSize(`Description: ${selectedRequest.description}`, 180);
    docPDF.text(description, 10, 90);

    if (selectedRequest.image) {
      docPDF.addImage(selectedRequest.image, "JPEG", 120, 40, 70, 70);
    }

    docPDF.save(`Demolish_Request_${selectedRequest.id}.pdf`);
  };

  const handleDownloadExcel = () => {
    const exportData = filteredRequests.map((req) => {
      const { image, ...rest } = req;
      return rest;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Demolish Requests");
    XLSX.writeFile(wb, "Demolish_Requests.xlsx");
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Demolish Requests</h2>
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          style={{ width: "250px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <div className="table-responsive" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <table className="table table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Urgency</th>
                <th>Description</th>
                <th>Image</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.name}</td>
                    <td>{request.contact}</td>
                    <td>{request.where}</td>
                    <td>{request.urgency}</td>
                    <td>{request.description}</td>
                    <td>
                      {request.image && (
                        <Image
                          src={request.image}
                          alt="Uploaded"
                          width="50"
                          height="50"
                          rounded
                          onClick={() => setSelectedRequest(request)}
                          style={{ cursor: "pointer" }}
                        />
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          request.status === "accepted"
                            ? "bg-success"
                            : request.status === "declined"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {request.status || "pending"}
                      </span>
                    </td>
                    <td className="d-flex flex-column gap-1">
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => handleStatusUpdate(request.id, "accepted")}
                        disabled={request.status === "accepted"}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={() => handleStatusUpdate(request.id, "declined")}
                        disabled={request.status === "declined"}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(request.id)}
                      >
                        <FaTrashAlt />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">No results found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex justify-content-end mt-3 gap-2">
        <Button variant="success" onClick={handleDownloadExcel}>
          Download Excel
        </Button>
        {selectedRequest && (
          <Button variant="danger" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        )}
      </div>

      {selectedRequest && (
        <Modal show={true} onHide={() => setSelectedRequest(null)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Request Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6">
                <p><strong>ID:</strong> {selectedRequest.id}</p>
                <p><strong>Name:</strong> {selectedRequest.name}</p>
                <p><strong>Contact:</strong> {selectedRequest.contact}</p>
                <p><strong>Location:</strong> {selectedRequest.where}</p>
                <p><strong>Urgency:</strong> {selectedRequest.urgency}</p>
                <p><strong>Description:</strong> {selectedRequest.description}</p>
              </div>
              <div className="col-md-6 text-center">
                {selectedRequest.image && (
                  <Image src={selectedRequest.image} fluid style={{ maxHeight: "300px" }} />
                )}
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default DemolishDashboard;
