import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Section3() {
  const title = "Featured Antiques";
  const description = "Discover our handpicked treasures";
  const sectionRef = useRef(null);
  const [animationClass, setAnimationClass] = useState("");
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const el = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setAnimationClass(entry.isIntersecting ? "animate__animated animate__fadeInUp" : ""),
      { threshold: 0.3 }
    );
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/featured-items`);
        setFeatured(res.data);
      } catch (err) {
        console.error("Error fetching featured items:", err);
      }
    };
    fetchFeatured();
  }, []);

  const Carousel = ({ images = [], itemName }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselImages = images.length > 0 ? images : ["/placeholder.jpg"];

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }, [carouselImages.length]);

    return (
      <div style={{ position: "relative", textAlign: "center" }}>
        <img
          src={carouselImages[currentIndex]}
          alt={itemName}
          style={{
            width: "100%",
            height: "280px",
            objectFit: "cover",
            borderTopLeftRadius: "0.5rem",
            borderTopRightRadius: "0.5rem",
            transition: "opacity 0.5s ease-in-out",
          }}
          onError={(e) => (e.target.src = "/placeholder.jpg")}
        />

        {carouselImages.length > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "0.5rem",
            }}
          >
            {carouselImages.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  margin: "0 4px",
                  backgroundColor: currentIndex === idx ? "#0d6efd" : "#c4c4c4",
                  transition: "background-color 0.3s",
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="py-5 bg-white" ref={sectionRef} id="home-sec3">
      <div className={`container ${animationClass}`}>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold">{title}</h2>
            <p className="text-muted">{description}</p>
          </div>
          <div>
            <button
              className="btn btn-outline-dark px-4"
              onClick={() => (window.location.href = "/buy")}
            >
              Shop All →
            </button>
          </div>
        </div>

        <div className="row g-4">
          {featured.length > 0 ? (
            featured.map((f) => (
              <div className="col-12 col-sm-6 col-lg-3" key={f._id}>
                <div
                  className="card border-0 h-100 shadow-sm rounded-3"
                  style={{ transition: "all 0.3s ease" }}
                >
                  <Carousel images={f.item.images} itemName={f.item.name} />

                  <div className="card-body text-center">
                    <p className="small text-muted mb-1">{f.item.description}</p>
                    <h6 className="fw-semibold">{f.item.name}</h6>
                    <p className="fw-bold mb-0">₱{f.item.price}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p className="text-muted">No featured items available.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
