import React from "react";
import { Modal, Button, Image } from "react-bootstrap";
import jsPDF from "jspdf";

const ReqDetailModalDemolish = ({ request, onClose }) => {
  const handleDownloadPDF = () => {
    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text("Demolish Request Details", 10, 20);
    docPDF.setFontSize(12);
    docPDF.text(`ID: ${request._id}`, 10, 40);
    docPDF.text(`Name: ${request.name}`, 10, 50);
    docPDF.text(`Contact: ${request.contact}`, 10, 60);
    docPDF.text(
      `Location: ${request.location?.lat}, ${request.location?.lng}`,
      10,
      70
    );
    const description = docPDF.splitTextToSize(
      `Description: ${request.description}`,
      180
    );
    docPDF.text(description, 10, 80);

    if (request.image) {
      docPDF.addImage(request.image, "JPEG", 120, 40, 70, 70);
    }

    docPDF.save(`Demolish_Request_${request._id}.pdf`);
  };

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Request Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-md-6">
            <p>
              <strong>ID:</strong> {request._id}
            </p>
            <p>
              <strong>Name:</strong> {request.name}
            </p>
            <p>
              <strong>Contact:</strong> {request.contact}
            </p>
            <p>
              <strong>Location:</strong> {request.location?.lat},{" "}
              {request.location?.lng}
            </p>
            <p>
              <strong>Description:</strong> {request.description}
            </p>
            <p>
              <strong>Status:</strong>{" "}
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
            </p>
          </div>
          <div className="col-md-6 text-center">
            {request.image && (
              <Image
                src={request.image}
                fluid
                style={{ maxHeight: "300px" }}
              />
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleDownloadPDF}>
          Download PDF
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReqDetailModalDemolish;
