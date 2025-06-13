import React, { useState } from "react";
import "animate.css";

export default function About() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="about-page">
      {/* Header Section */}
      <section className="bg-dark text-white text-center py-5">
        <div className="container">
          <h1 className="fw-bold display-5">Unika Antika</h1>
          <p className="lead">Discover the history and treasures of Unika Antika.</p>
        </div>
      </section>

      {/* About Us Description */}
      <section className="py-5 bg-white text-center">
        <div className="container">
          {/* <h2 className="fw-bold mb-4">About Us</h2> */}
          <p className="text-muted mx-auto" style={{ maxWidth: "800px" }}>
            At Unika Antika, our purpose is simple: to preserve heritage through beautiful and sustainable design.
          </p>
          <p className="text-muted mx-auto mt-3" style={{ maxWidth: "800px" }}>
            What began as a small antique shop has grown into a center for curated history and design. Today, we offer
            handcrafted furniture, vintage items, and responsible demolition services — all guided by our values of
            sustainability and storytelling. Through every item we sell, we seek to pass on a piece of the past while
            building a more thoughtful future.
          </p>
          <p className="text-muted mx-auto mt-3" style={{ maxWidth: "800px" }}>
            We hope that someday, people won’t just remember us for what we sell, but for the way we preserve,
            repurpose, and reimagine history together.
          </p>

          <button
            className="btn btn-dark mt-4"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "Show Less" : "Learn More"}
          </button>

          {showMore && (
            <div className="mt-5 text-start animate__animated animate__fadeIn" style={{ maxWidth: "900px", margin: "0 auto" }}>
              <div className="mb-4">
                <h4 className="fw-bold">Mission</h4>
                <p className="text-muted">
                  Our mission is to blend craftsmanship and sustainability by offering unique antiques,
                  high-quality reclaimed wood, and custom furniture, while delivering safe and responsible
                  demolition services. We strive to honor the past, reduce waste, and provide our customers
                  with materials and furnishings that bring timeless character and environmental integrity
                  to every project.
                </p>
              </div>

              <div className="mb-4">
                <h4 className="fw-bold">Vision</h4>
                <p className="text-muted">
                  To be the leading provider of sustainable antique treasures and reclaimed materials,
                  preserving history through thoughtfully curated pieces and eco-conscious demolition
                  services that transform spaces and inspire creativity.
                </p>
              </div>

              <div>
                <h4 className="fw-bold">Background</h4>
                <p className="text-muted">
                  The Wariza Antique Shop is a proud family-owned business with a rich history spanning over 60 years.
                  It all began with the visionary couple, Milagros Rafa Wariza and her husband, Jose "Peping" Wariza,
                  who shared a deep love for timeless treasures and sustainable craftsmanship. They built the shop
                  with a mission to preserve history through high-quality antiques, reclaimed woods, and custom furniture.
                  After their passing, their children—Jeffrey, Michelle, Jaxon, and Sharon Wariza—took up the mantle,
                  ensuring that the family legacy continues to thrive. Today, the shop stands as a testament to the
                  Wariza family's dedication, blending tradition, sustainability, and a deep connection to the community
                  that has supported them through the decades.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
