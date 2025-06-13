import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Auth from "../Auth/Auth";
import "./Home.css";
import "animate.css";
import bgVideo from "../images/ninja.mp4";
import { useAuth } from "../../context/AuthContext"; // ✅ auth context

export default function Section2() {
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ pull user from context
  const [animationClass, setAnimationClass] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const sectionEl = sectionRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimationClass("animate__animated animate__fadeInUp");
        }
      },
      { threshold: 0.3 }
    );

    if (sectionEl) observer.observe(sectionEl);
    return () => {
      if (sectionEl) observer.unobserve(sectionEl);
    };
  }, []);

  const handleLearnMore = async (path) => {
    if (user) {
      navigate(path); // ✅ user already exists
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setShowAuthModal(true); // ✅ no token, show auth
      return;
    }

    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate(path); // ✅ verified via token
    } catch (err) {
      console.warn("User not authenticated");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setShowAuthModal(true); // ✅ failed token check, fallback
    }
  };

  const services = [
    {
      title: "Buy Antiques",
      icon: "bi-cart-check",
      description: "Browse and buy rare collectibles from our trusted antique sellers.",
      path: "/buy",
    },
    {
      title: "Sell Antiques",
      icon: "bi-box-arrow-up",
      description: "List your antique items and reach collectors around the world.",
      path: "/sell",
    },
    {
      title: "Demolish Items",
      icon: "bi-trash",
      description: "Request safe and responsible removal of unusable antique items.",
      path: "/demolish",
    },
  ];

  return (
    <section id="services" ref={sectionRef} className="position-relative text-white py-5 overflow-hidden">
      {/* Background Video */}
      <video
        className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
        autoPlay
        muted
        loop
        playsInline
        style={{ zIndex: 0, objectFit: "cover" }}
      >
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1 }}
      ></div>

      {/* Foreground content */}
      <div className={`container position-relative ${animationClass}`} style={{ zIndex: 2 }}>
        <h2 className="fw-bold text-center mb-5">Our Services</h2>
        <div className="row g-4">
          {services.map((service, index) => (
            <div key={index} className="col-md-4">
              <div
                className="card h-100 text-center border-0 bg-white bg-opacity-25 text-white shadow-lg"
                style={{ backdropFilter: "blur(10px)" }}
              >
                <div className="card-body">
                  <i className={`bi ${service.icon} display-4 text-white mb-3`}></i>
                  <h5 className="card-title fw-bold">{service.title}</h5>
                  <p className="card-text">{service.description}</p>
                  <button
                    className="btn btn-outline-light mt-2"
                    onClick={() => handleLearnMore(service.path)}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      <Auth show={showAuthModal} onHide={() => setShowAuthModal(false)} />
    </section>
  );
}
