import React, { useEffect, useRef } from "react";
import MapComponent from "../MapComponent";

export default function Section5() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const currentRef = contentRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentRef.classList.add("fade-in");
          observer.unobserve(currentRef);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(currentRef);
    return () => {
      observer.unobserve(currentRef);
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
            <h3 className="fw-bold">Discover Where Antiques are from</h3>
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
