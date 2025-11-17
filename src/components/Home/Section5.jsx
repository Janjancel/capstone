import React, { useEffect, useRef } from "react";
import MapComponent from "../MapComponent";

export default function Section5() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          contentRef.current.classList.add("fade-in");
          observer.unobserve(contentRef.current);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(contentRef.current);
    return () => {
      if (contentRef.current) observer.unobserve(contentRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-5"
      id="home-sec5"
      style={{
        background: "#fafaf7",
        borderTop: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <div className="container">
        <div className="row mb-4">
          <div className="col-md-6">
            <h3 className="fw-bold">Educational Facts</h3>
            <p className="text-muted">
              Discover the heritage items we preserve and understand their stories through our interactive map.
            </p>
          </div>
        </div>

        <div
          ref={contentRef}
          style={{
            opacity: 0,
            transition: "opacity 0.8s ease-in-out",
          }}
          onAnimationStart={(e) => {
            if (e.animationName === "fadeInAnimation") {
              e.currentTarget.style.opacity = "1";
            }
          }}
        >
          <div className="row">
            <div className="col-12">
              <div className="card p-4 rounded-4 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
                <MapComponent />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInAnimation {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .fade-in {
          animation: fadeInAnimation 0.8s ease-in-out forwards;
        }
      `}</style>
    </section>
  );
}
