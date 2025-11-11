

// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Auth from "../Auth/Auth";
// import { useAuth } from "../../context/AuthContext";
// import MapComponent from "../MapComponent";
// import "animate.css";
// import "./Home.css";

// // Images
// import avif from "../images/fun-fact.webp";
// import img4 from "../images/clock.jpeg";
// import img5 from "../images/horn.webp";

// export default function Home() {
//   useEffect(() => {
//     const checkAuth = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       try {
//         await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       } catch (err) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("userId");
//       }
//     };

//     checkAuth();
//   }, []);

//   return (
//     <div id="homepage">
//       <Section1
//         title="Unika Antika"
//         subtitle="Timeless antiques for collectors and dreamers."
//       />

//       <Section2 />
//       <Section3
//         title="Featured Antiques"
//         description="Discover our handpicked treasures"
//       />
//       <Section4
//         title="Educational Facts"
//         description="Uncover the history behind antique masterpieces"
//       />
//     </div>
//   );
// }

// /* -------------------- Section 1 -------------------- */
// function Section1({ title, subtitle }) {
//   const navigate = useNavigate();

//   return (
//     <section
//       id="home-sec1"
//       className="d-flex flex-column align-items-center justify-content-center text-center"
//       style={{
//         minHeight: "70vh",
//         position: "relative",
//         overflow: "hidden",
//         padding: "2rem 1rem",
//       }}
//     >
//       {/* Background Image Layer */}
//       <div
//         style={{
//           backgroundImage: `url(${avif})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           zIndex: 1,
//           filter: "brightness(0.7)",
//         }}
//       />

//       {/* Overlay */}
//       <div
//         style={{
//           background: "rgba(0,0,0,0.45)",
//           backdropFilter: "blur(6px)",
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           zIndex: 2,
//         }}
//       />

//       {/* Text Content */}
//       <div style={{ position: "relative", zIndex: 3, maxWidth: "900px" }}>
//         <h1
//           style={{
//             fontSize: "clamp(2rem, 5vw, 5rem)",
//             fontWeight: "900",
//             textTransform: "uppercase",
//             backgroundImage: `url(${avif})`,
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//             WebkitBackgroundClip: "text",
//             color: "transparent",
//             WebkitTextStroke: "1px rgba(255,255,255,0.2)",
//             textShadow: "0 4px 30px rgba(0,0,0,0.4)",
//           }}
//         >
//           {title}
//         </h1>

//         <p
//           style={{
//             fontSize: "clamp(1rem, 2vw, 1.25rem)",
//             fontWeight: "400",
//             color: "rgba(255, 255, 255, 0.9)",
//             marginTop: "1.25rem",
//             lineHeight: "1.6",
//           }}
//         >
//           {subtitle}
//         </p>

//         {/* <div style={{ marginTop: 24 }}>
//           <button className="btn btn-outline-light me-2" onClick={() => navigate("/register")}>
//             Register
//           </button>
//           <button className="btn btn-light" onClick={() => navigate("/login")}>
//             Login
//           </button>
//         </div> */}
//       </div>
//     </section>
//   );
// }

// /* -------------------- Section 2 -------------------- */
// function Section2() {
//   const sectionRef = useRef(null);
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [animationClass, setAnimationClass] = useState("");
//   const [showAuthModal, setShowAuthModal] = useState(false);

//   useEffect(() => {
//     const el = sectionRef.current;
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setAnimationClass("animate__animated animate__fadeInUp");
//         }
//       },
//       { threshold: 0.3 }
//     );
//     if (el) observer.observe(el);
//     return () => {
//       if (el) observer.unobserve(el);
//     };
//   }, []);

//   const handleLearnMore = async (path) => {
//     if (user) {
//       navigate(path);
//       return;
//     }
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setShowAuthModal(true);
//       return;
//     }
//     try {
//       await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       navigate(path);
//     } catch (err) {
//       console.warn("User not authenticated");
//       localStorage.removeItem("token");
//       localStorage.removeItem("userId");
//       setShowAuthModal(true);
//     }
//   };

//   const services = [
//     {
//       title: "Buy Antiques",
//       icon: "bi-cart-check",
//       description: "Browse and buy rare collectibles from our trusted antique sellers.",
//       path: "/buy",
//       color: "#ff4d6d",
//     },
//     {
//       title: "Sell Antiques",
//       icon: "bi-box-arrow-up",
//       description: "List your antique items and reach collectors around the world.",
//       path: "/sell",
//       color: "#2ecc71",
//     },
//     {
//       title: "Demolish Items",
//       icon: "bi-trash",
//       description: "Request safe and responsible removal of unusable antique items.",
//       path: "/demolish",
//       color: "#3498db",
//     },
//   ];

//   return (
//     <section
//       id="services"
//       ref={sectionRef}
//       className="position-relative py-5 overflow-hidden"
//       style={{ background: "#f8f9fb" }}
//     >
//       <div className={`container position-relative ${animationClass}`} style={{ zIndex: 2 }}>
//         {/* Section Heading */}
//         <div className="text-center mb-5">
//           <h2 className="fw-bold fs-1">
//             <span style={{ color: "#111" }}>Our </span>
//             <span style={{ color: "#393939ff" }}>Services</span>
//           </h2>
//           <p className="text-muted mt-3" style={{ maxWidth: "600px", margin: "0 auto" }}>
//             Our mission is to drive progress and enhance the lives of our customers by delivering
//             superior products and services that exceed expectations.
//           </p>
//         </div>

//         {/* Services Grid */}
//         <div className="row g-4">
//           {services.map((service, index) => (
//             <div key={index} className="col-md-4">
//               <div
//                 className="card border-0 shadow-sm h-100 rounded-4 p-4 position-relative"
//                 style={{
//                   background: "#fff",
//                   transition: "all 0.3s ease",
//                 }}
//               >
//                 {/* Floating Icon Badge */}
//                 <div
//                   className="d-flex align-items-center justify-content-center rounded-circle shadow-sm mb-3"
//                   style={{
//                     width: "48px",
//                     height: "48px",
//                     background: service.color,
//                     color: "#fff",
//                     fontSize: "1.25rem",
//                     position: "absolute",
//                     top: "-20px",
//                     left: "20px",
//                   }}
//                 >
//                   <i className={`bi ${service.icon}`}></i>
//                 </div>

//                 {/* Card Content */}
//                 <div className="mt-4">
//                   <h5 className="fw-bold">{service.title}</h5>
//                   <p className="text-muted mb-4">{service.description}</p>
//                   <button
//                     className="btn p-0 fw-semibold text-decoration-none"
//                     style={{ color: service.color }}
//                     onClick={() => handleLearnMore(service.path)}
//                   >
//                     Read more →
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Auth Modal */}
//       <Auth show={showAuthModal} onHide={() => setShowAuthModal(false)} />
//     </section>
//   );
// }

// /* -------------------- Section 3 -------------------- */
// function Section3({ title, description }) {
//   const navigate = useNavigate();
//   const sectionRef = useRef(null);
//   const [animationClass, setAnimationClass] = useState("");
//   const [featured, setFeatured] = useState([]);

//   useEffect(() => {
//     const el = sectionRef.current;
//     const observer = new IntersectionObserver(
//       ([entry]) =>
//         setAnimationClass(entry.isIntersecting ? "animate__animated animate__fadeInUp" : ""),
//       { threshold: 0.3 }
//     );
//     if (el) observer.observe(el);
//     return () => {
//       if (el) observer.unobserve(el);
//     };
//   }, []);

//   useEffect(() => {
//     const fetchFeatured = async () => {
//       try {
//         const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/featured-items`);
//         setFeatured(res.data);
//       } catch (err) {
//         console.error("Error fetching featured items:", err);
//       }
//     };
//     fetchFeatured();
//   }, []);

//   // Automatic carousel component
//   const Carousel = ({ images = [], itemName }) => {
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const carouselImages = images.length > 0 ? images : ["/placeholder.jpg"];

//     // Automatically slide every 3 seconds
//     useEffect(() => {
//       const interval = setInterval(() => {
//         setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
//       }, 3000);
//       return () => clearInterval(interval);
//     }, [carouselImages.length]);

//     return (
//       <div style={{ position: "relative", textAlign: "center" }}>
//         <img
//           src={carouselImages[currentIndex]}
//           alt={itemName}
//           style={{
//             width: "100%",
//             height: "280px",
//             objectFit: "cover",
//             borderTopLeftRadius: "0.5rem",
//             borderTopRightRadius: "0.5rem",
//             transition: "opacity 0.5s ease-in-out",
//           }}
//           onError={(e) => (e.target.src = "/placeholder.jpg")}
//         />

//         {/* Dots indicator */}
//         {carouselImages.length > 1 && (
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               marginTop: "0.5rem",
//             }}
//           >
//             {carouselImages.map((_, idx) => (
//               <div
//                 key={idx}
//                 style={{
//                   width: 8,
//                   height: 8,
//                   borderRadius: "50%",
//                   margin: "0 4px",
//                   backgroundColor: currentIndex === idx ? "#0d6efd" : "#c4c4c4",
//                   transition: "background-color 0.3s",
//                 }}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <section className="py-5 bg-white" ref={sectionRef} id="home-sec3">
//       <div className={`container ${animationClass}`}>
//         {/* Heading */}
//         <div className="d-flex justify-content-between align-items-center mb-5">
//           <div>
//             <h2 className="fw-bold">{title}</h2>
//             <p className="text-muted">{description}</p>
//           </div>
//           <div>
//             <button className="btn btn-outline-dark px-4" onClick={() => navigate("/buy")}>
//               Shop All →
//             </button>
//           </div>
//         </div>

//         {/* Product Grid */}
//         <div className="row g-4">
//           {featured.length > 0 ? (
//             featured.map((f) => (
//               <div className="col-12 col-sm-6 col-lg-3" key={f._id}>
//                 <div
//                   className="card border-0 h-100 shadow-sm rounded-3"
//                   style={{ transition: "all 0.3s ease" }}
//                 >
//                   {/* Carousel */}
//                   <Carousel images={f.item.images} itemName={f.item.name} />

//                   {/* Card Content */}
//                   <div className="card-body text-center">
//                     <p className="small text-muted mb-1">{f.item.description}</p>
//                     <h6 className="fw-semibold">{f.item.name}</h6>
//                     <p className="fw-bold mb-0">₱{f.item.price}</p>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="col-12 text-center">
//               <p className="text-muted">No featured items available.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }

// /* -------------------- Section 4 -------------------- */
// function Section4({ title, description }) {
//   const [showDiv, setShowDiv] = useState(false);
//   const [inView, setInView] = useState(false);
//   const sectionRef = useRef(null);

//   useEffect(() => {
//     const el = sectionRef.current;
//     const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
//       threshold: 0.3,
//     });
//     if (el) observer.observe(el);
//     return () => {
//       if (el) observer.unobserve(el);
//     };
//   }, []);

//   return (
//     <section
//       className={`bg-light py-5 text-center animate__animated ${inView ? "animate__fadeIn animate__slower" : ""}`}
//       ref={sectionRef}
//     >
//       <div className="container">
//         <div className="row align-items-center mb-4">
//           <div className="col-md-8 text-start">
//             <h1 className="fs-2 fw-bold text-capitalize">{title}</h1>
//             <p className="fs-6 text-secondary">{description}</p>
//             <button className="btn btn-dark mt-3" onClick={() => setShowDiv(!showDiv)}>
//               {showDiv ? "Hide Map" : "Explore More"}
//             </button>
//           </div>
//         </div>

//         <div className="row g-4">
//           <div className="col-md-6">
//             <div className="bg-white rounded shadow-sm overflow-hidden">
//               <div className="card-img-top" style={{ height: "200px", overflow: "hidden" }}>
//                 <img src={img4} className="w-100 h-100" style={{ objectFit: "cover" }} alt="Educational Fact 1" />
//               </div>
//               <div className="p-3">
//                 <p className="text-muted small">Explore the rich history of ancient artifacts and their significance.</p>
//               </div>
//             </div>
//           </div>

//           <div className="col-md-6">
//             <div className="bg-white rounded shadow-sm overflow-hidden">
//               <div className="card-img-top" style={{ height: "200px", overflow: "hidden" }}>
//                 <img src={img5} className="w-100 h-100" style={{ objectFit: "cover" }} alt="Educational Fact 2" />
//               </div>
//               <div className="p-3">
//                 <p className="text-muted small">Learn about the craftsmanship and techniques used in antique creations.</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Expandable Map Section */}
//         <div
//           className="mt-4 overflow-hidden transition-height"
//           style={{
//             maxHeight: showDiv ? "500px" : "0px",
//             height: showDiv ? "500px" : "0px",
//             transition: "max-height 0.5s ease-in-out, height 0.5s ease-in-out",
//           }}
//         >
//           <h2 className="fs-4 text-center mt-3">Locations of Heritage Houses in Region IV-A</h2>
//           <div className="w-100" style={{ height: "400px", minHeight: "400px" }}>
//             <MapComponent />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Auth from "../Auth/Auth";
import { useAuth } from "../../context/AuthContext";
import MapComponent from "../MapComponent";
import "animate.css";
import "./Home.css";

// Images
import avif from "../images/fun-fact.webp";
import img4 from "../images/clock.jpeg";
import img5 from "../images/horn.webp";

export default function Home() {
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      }
    };

    checkAuth();
  }, []);

  return (
    <div id="homepage">
      <Section1
        title="Unika Antika"
        subtitle="Timeless antiques for collectors and dreamers."
      />

      <Section2 />
      <Section3
        title="Featured Antiques"
        description="Discover our handpicked treasures"
      />
      <Section4
        title="Educational Facts"
        description="Uncover the history behind antique masterpieces"
      />
    </div>
  );
}

/* -------------------- Section 1 -------------------- */
function Section1({ title, subtitle }) {
  // navigate removed per request

  return (
    <section
      id="home-sec1"
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{
        minHeight: "70vh",
        position: "relative",
        overflow: "hidden",
        padding: "2rem 1rem",
      }}
    >
      {/* Background Image Layer */}
      <div
        style={{
          backgroundImage: `url(${avif})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          filter: "brightness(0.7)",
        }}
      />

      {/* Overlay */}
      <div
        style={{
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
        }}
      />

      {/* Text Content */}
      <div style={{ position: "relative", zIndex: 3, maxWidth: "900px" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 5rem)",
            fontWeight: "900",
            textTransform: "uppercase",
            backgroundImage: `url(${avif})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.2)",
            textShadow: "0 4px 30px rgba(0,0,0,0.4)",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            fontWeight: "400",
            color: "rgba(255, 255, 255, 0.9)",
            marginTop: "1.25rem",
            lineHeight: "1.6",
          }}
        >
          {subtitle}
        </p>

        {/* register/login buttons were commented out previously */}
      </div>
    </section>
  );
}

/* -------------------- Section 2 -------------------- */
function Section2() {
  const sectionRef = useRef(null);
  // navigate removed per request
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
      // use full-page navigation (replaces react-router navigate)
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
        {/* Section Heading */}
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

        {/* Services Grid */}
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
                {/* Floating Icon Badge */}
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

                {/* Card Content */}
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

      {/* Auth Modal */}
      <Auth show={showAuthModal} onHide={() => setShowAuthModal(false)} />
    </section>
  );
}

/* -------------------- Section 3 -------------------- */
function Section3({ title, description }) {
  // navigate removed per request
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

  // Automatic carousel component
  const Carousel = ({ images = [], itemName }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselImages = images.length > 0 ? images : ["/placeholder.jpg"];

    // Automatically slide every 3 seconds
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

        {/* Dots indicator */}
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
        {/* Heading */}
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

        {/* Product Grid */}
        <div className="row g-4">
          {featured.length > 0 ? (
            featured.map((f) => (
              <div className="col-12 col-sm-6 col-lg-3" key={f._id}>
                <div
                  className="card border-0 h-100 shadow-sm rounded-3"
                  style={{ transition: "all 0.3s ease" }}
                >
                  {/* Carousel */}
                  <Carousel images={f.item.images} itemName={f.item.name} />

                  {/* Card Content */}
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

/* -------------------- Section 4 -------------------- */
function Section4({ title, description }) {
  const [showDiv, setShowDiv] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.3,
    });
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <section
      className={`bg-light py-5 text-center animate__animated ${inView ? "animate__fadeIn animate__slower" : ""}`}
      ref={sectionRef}
    >
      <div className="container">
        <div className="row align-items-center mb-4">
          <div className="col-md-8 text-start">
            <h1 className="fs-2 fw-bold text-capitalize">{title}</h1>
            <p className="fs-6 text-secondary">{description}</p>
            <button className="btn btn-dark mt-3" onClick={() => setShowDiv(!showDiv)}>
              {showDiv ? "Hide Map" : "Explore More"}
            </button>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <div className="bg-white rounded shadow-sm overflow-hidden">
              <div className="card-img-top" style={{ height: "200px", overflow: "hidden" }}>
                <img src={img4} className="w-100 h-100" style={{ objectFit: "cover" }} alt="Educational Fact 1" />
              </div>
              <div className="p-3">
                <p className="text-muted small">Explore the rich history of ancient artifacts and their significance.</p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="bg-white rounded shadow-sm overflow-hidden">
              <div className="card-img-top" style={{ height: "200px", overflow: "hidden" }}>
                <img src={img5} className="w-100 h-100" style={{ objectFit: "cover" }} alt="Educational Fact 2" />
              </div>
              <div className="p-3">
                <p className="text-muted small">Learn about the craftsmanship and techniques used in antique creations.</p>
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
          <h2 className="fs-4 text-center mt-3">Locations of Heritage Houses in Region IV-A</h2>
          <div className="w-100" style={{ height: "400px", minHeight: "400px" }}>
            <MapComponent />
          </div>
        </div>
      </div>
    </section>
  );
}


