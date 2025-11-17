import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Auth from "../Auth/Auth";
import { useAuth } from "../../context/AuthContext";

export default function Section2() {
  const sectionRef = useRef(null);
  const { user } = useAuth();
  const [animationClass, setAnimationClass] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimationClass("animate__animated animate__fadeInUp");
        }
      },
      { threshold: 0.3 }
    );
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  const handleLearnMore = async (path) => {
    if (user) {
      window.location.href = path;
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = path;
    } catch (err) {
      console.warn("User not authenticated");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setShowAuthModal(true);
    }
  };

  const services = [
    {
      title: "Buy Antiques",
      icon: "bi-cart-check",
      description: "Browse and buy rare collectibles from our trusted antique sellers.",
      path: "/buy",
      color: "#ff4d6d",
    },
    {
      title: "Sell Antiques",
      icon: "bi-box-arrow-up",
      description: "List your antique items and reach collectors around the world.",
      path: "/sell",
      color: "#2ecc71",
    },
    {
      title: "Demolish Items",
      icon: "bi-trash",
      description: "Request safe and responsible removal of unusable antique items.",
      path: "/demolish",
      color: "#3498db",
    },
  ];

  return (
    <section
      id="services"
      ref={sectionRef}
      className="position-relative py-5 overflow-hidden"
      style={{ background: "#f8f9fb" }}
    >
      <div className={`container position-relative ${animationClass}`} style={{ zIndex: 2 }}>
        <div className="text-center mb-5">
          <h2 className="fw-bold fs-1">
            <span style={{ color: "#111" }}>Our </span>
            <span style={{ color: "#393939ff" }}>Services</span>
          </h2>
          <p className="text-muted mt-3" style={{ maxWidth: "600px", margin: "0 auto" }}>
            Our mission is to drive progress and enhance the lives of our customers by delivering
            superior products and services that exceed expectations.
          </p>
        </div>

        <div className="row g-4">
          {services.map((service, index) => (
            <div key={index} className="col-md-4">
              <div
                className="card border-0 shadow-sm h-100 rounded-4 p-4 position-relative"
                style={{
                  background: "#fff",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle shadow-sm mb-3"
                  style={{
                    width: "48px",
                    height: "48px",
                    background: service.color,
                    color: "#fff",
                    fontSize: "1.25rem",
                    position: "absolute",
                    top: "-20px",
                    left: "20px",
                  }}
                >
                  <i className={`bi ${service.icon}`}></i>
                </div>

                <div className="mt-4">
                  <h5 className="fw-bold">{service.title}</h5>
                  <p className="text-muted mb-4">{service.description}</p>
                  <button
                    className="btn p-0 fw-semibold text-decoration-none"
                    style={{ color: service.color }}
                    onClick={() => handleLearnMore(service.path)}
                  >
                    Read more →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Auth show={showAuthModal} onHide={() => setShowAuthModal(false)} />
    </section>
  );
}
