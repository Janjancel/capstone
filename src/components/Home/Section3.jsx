import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "animate.css";
import img1 from "../images/items/ilohan.jpg";
import img2 from "../images/items/carabao bench.jpg";
import img3 from "../images/items/suyod.jpg";

export default function Section3({ title = "Featured Antiques", description = "Browse our timeless antique selections" }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAnimationClass(entry.isIntersecting ? "animate__animated animate__fadeIn" : "");
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const antiques = [
    { id: 1, image: img1, name: "Ilohan", description: "Available in select stores", price: "$120.00" },
    { id: 2, image: img2, name: "Carabao Bench", description: "Online exclusive", price: "$80.00" },
    { id: 3, image: img3, name: "Suyod", description: "Hand-painted classic", price: "$150.00" },
  ];

  return (
    <section className="py-5 bg-white" ref={sectionRef} id="home-sec3">
      <div className={`container ${animationClass}`}>
        {/* Section Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">{title}</h2>
            <p className="text-muted mb-0">{description}</p>
          </div>
          <button className="btn btn-dark" onClick={() => navigate("/buy")}>
            Explore all →
          </button>
        </div>

        {/* Product Grid */}
        <div className="row g-4">
          {antiques.map((item) => (
            <div className="col-12 col-sm-6 col-lg-4" key={item.id}>
              <div className="card border-0 shadow-sm h-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="card-img-top"
                  style={{ height: "250px", objectFit: "cover", borderTopLeftRadius: "0.5rem", borderTopRightRadius: "0.5rem" }}
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />
                <div className="card-body">
                  <h5 className="card-title fw-semibold">{item.name}</h5>
                  <p className="card-text text-muted mb-1">{item.description}</p>
                  <p className="card-text fw-bold">{item.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
