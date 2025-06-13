import React, { useState, useEffect, useRef } from "react";
import "animate.css";
import img4 from "../images/clock.jpeg";
import img5 from "../images/horn.webp";
import MapComponent from "../MapComponent";

export default function Section4({ title, description }) {
  const [showDiv, setShowDiv] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (sectionEl) observer.observe(sectionEl);

    return () => {
      if (sectionEl) observer.unobserve(sectionEl);
    };
  }, []);

  return (
    <section
      className={`bg-light py-5 text-center animate__animated ${
        inView ? "animate__fadeIn animate__slower" : ""
      }`}
      ref={sectionRef}
    >
      <div className="container">
        {/* Title & Description */}
        <div className="row align-items-center mb-4">
          <div className="col-md-8 text-start">
            <h1 className="fs-2 fw-bold text-capitalize">{title}</h1>
            <p className="fs-6 text-secondary">{description}</p>
            <button
              className="btn btn-dark mt-3"
              onClick={() => setShowDiv(!showDiv)}
            >
              {showDiv ? "Hide Map" : "Explore More"}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="row g-4">
          <div className="col-md-6">
            <div className="bg-white rounded shadow-sm overflow-hidden">
              <div className="card-img-top" style={{ height: "200px", overflow: "hidden" }}>
                <img
                  src={img4}
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                  alt="Educational Fact 1"
                />
              </div>
              <div className="p-3">
                <p className="text-muted small">
                  Explore the rich history of ancient artifacts and their significance.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="bg-white rounded shadow-sm overflow-hidden">
              <div className="card-img-top" style={{ height: "200px", overflow: "hidden" }}>
                <img
                  src={img5}
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                  alt="Educational Fact 2"
                />
              </div>
              <div className="p-3">
                <p className="text-muted small">
                  Learn about the craftsmanship and techniques used in antique creations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Map Section */}
        <div
          className="mt-4 overflow-hidden transition-height"
          style={{
            maxHeight: showDiv ? "500px" : "0px",
            height: showDiv ? "500px" : "0px",
            transition: "max-height 0.5s ease-in-out, height 0.5s ease-in-out",
          }}
        >
          <h2 className="fs-4 text-center mt-3">
            Locations of Heritage Houses in Region IV-A
          </h2>
          <div className="w-100" style={{ height: "400px", minHeight: "400px" }}>
            <MapComponent />
          </div>
        </div>
      </div>
    </section>
  );
}
