
// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import Auth from "../Auth/Auth";
// import { useAuth } from "../../context/AuthContext";
// import MapComponent from "../MapComponent";
// import "animate.css";
// import "./Home.css";

// // Images
// import avif from "../images/unika_logo.png";

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

//       {/* NEW Section 4: Feedback Draft (static card) */}
//       <Section4 />

//       {/* RENAMED: previous Section4 is now Section5 */}
//       <Section5
//         title="Educational Facts"
//         description="Uncover the history behind antique masterpieces"
//       />
//     </div>
//   );
// }

// /* -------------------- Section 1 -------------------- */
// function Section1({ title, subtitle }) {
//   // navigate removed per request

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

//         {/* register/login buttons were commented out previously */}
//       </div>
//     </section>
//   );
// }

// /* -------------------- Section 2 -------------------- */
// function Section2() {
//   const sectionRef = useRef(null);
//   // navigate removed per request
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
//       // use full-page navigation (replaces react-router navigate)
//       window.location.href = path;
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
//       window.location.href = path;
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
//   // navigate removed per request
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
//             <button
//               className="btn btn-outline-dark px-4"
//               onClick={() => (window.location.href = "/buy")}
//             >
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

// /* -------------------- Section 4 (NEW) - Static Feedback Draft -------------------- */
// function Section4() {
//   // Static content only (no placeholders)
//   const profileInitials = "UA"; // static initials for the circular profile
//   const email = "collector@unikaantika.com"; // static email shown under the circle
//   const feedbackText = "Thank you for choosing us — your feedback helps us improve.";

//   return (
//     <section className="py-5 bg-white" id="home-sec4">
//       <div className="container">
//         <div className="row justify-content-center">
//           <div className="col-md-8">
//             <div
//               className="card shadow-sm rounded-4 p-4"
//               style={{ overflow: "hidden", border: "1px solid rgba(0,0,0,0.04)" }}
//             >
//               <div className="d-flex">
//                 {/* Left column: profile circle + email */}
//                 <div style={{ width: 180 }}>
//                   <div
//                     style={{
//                       width: 84,
//                       height: 84,
//                       borderRadius: "50%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       fontWeight: 800,
//                       fontSize: 24,
//                       background: "linear-gradient(135deg,#f0e6dd,#d9cbb1)",
//                       color: "#3b3b3b",
//                       boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
//                       marginBottom: 12,
//                     }}
//                   >
//                     {profileInitials}
//                   </div>

//                   <div style={{ fontSize: 13, color: "#6c6c6c" }}>{email}</div>
//                 </div>

//                 {/* Right column: stars + feedback sentence */}
//                 <div className="flex-grow-1 d-flex align-items-start" style={{ paddingLeft: 20 }}>
//                   <div>
//                     {/* 5 static stars */}
//                     <div style={{ fontSize: 20, marginBottom: 8 }} aria-hidden>
//                       {/* Use unicode stars so no external icons are required */}
//                       <span style={{ marginRight: 6 }}>★</span>
//                       <span style={{ marginRight: 6 }}>★</span>
//                       <span style={{ marginRight: 6 }}>★</span>
//                       <span style={{ marginRight: 6 }}>★</span>
//                       <span style={{ marginRight: 6 }}>★</span>
//                     </div>

//                     <p style={{ margin: 0, color: "#444", fontSize: 16 }}>{feedbackText}</p>

//                     {/* additional static metadata if desired */}
//                     <div style={{ marginTop: 10, fontSize: 13, color: "#9a9a9a" }}>
//                       <span>Posted on Nov 13, 2025</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// /* -------------------- Section 5 (RENAMED from previous Section4) -------------------- */
// function Section5({ title, description }) {
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
//           </div>
//         </div>

//         {/* Direct Map Display (replaced image cards & explore button) */}
//         <div>
//           <div className="w-100" style={{ height: "500px", minHeight: "400px" }}>
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
import avif from "../images/unika_logo.png";

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

      {/* UPDATED Section 4: Reviews (dynamic) */}
      <Section4 />

      {/* RENAMED: previous Section4 is now Section5 */}
      <Section5
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

/* -------------------- Section 4 (UPDATED) - Reviews List with email resolution -------------------- */
function Section4() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/\/$/, "")
    : "";

  useEffect(() => {
    let mounted = true;
    const fetchReviewsAndUsers = async () => {
      try {
        setLoading(true);
        // Fetch reviews
        const res = await axios.get(`${API_URL || ""}/api/reviews`);
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];

        // Extract unique userIds
        const userIds = Array.from(
          new Set(data.map((r) => (r.userId ? String(r.userId) : null)).filter(Boolean))
        );

        let userMap = {};

        // Try to fetch all users to resolve emails (some environments may require auth)
        try {
          const token = localStorage.getItem("token");
          const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
          const usersRes = await axios.get(`${API_URL || ""}/api/users`, config);
          const users = Array.isArray(usersRes.data) ? usersRes.data : [];
          users.forEach((u) => {
            if (u && u._id) userMap[String(u._id)] = u;
          });
        } catch (userErr) {
          // If fetching users fails (no auth or endpoint not available), log and continue.
          console.warn("Could not fetch users to resolve emails:", userErr?.message || userErr);
          userMap = {};
        }

        // Attach userEmail where possible
        const enriched = data.map((r) => ({
          ...r,
          userEmail: (r.userId && userMap[String(r.userId)] && userMap[String(r.userId)].email) || r.userEmail || null,
        }));

        // sort newest first, limit to 6
        const sorted = enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (mounted) setReviews(sorted.slice(0, 6));
      } catch (err) {
        console.error("Error fetching reviews:", err);
        if (mounted) setError("Failed to load reviews.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReviewsAndUsers();

    return () => {
      mounted = false;
    };
  }, [API_URL]);

  const formatDate = (d) => {
    if (!d) return "Unknown date";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  return (
    <section className="py-5 bg-white" id="home-sec4">
      <div className="container">
        <div className="row mb-4">
          <div className="col-md-8">
            <h3 className="fw-bold">What people say</h3>
            <p className="text-muted">Real feedback from our buyers and sellers.</p>
          </div>
        </div>

        {loading ? (
          <div className="row">
            {[1, 2, 3].map((n) => (
              <div className="col-md-4 mb-3" key={n}>
                <div className="card p-3 shadow-sm rounded-3">
                  <div style={{ height: 90, background: "#f6f6f6", borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="row">
            <div className="col-12">
              <div className="alert alert-warning">{error}</div>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          // fallback to the original static draft if no reviews exist
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div
                className="card shadow-sm rounded-4 p-4"
                style={{ overflow: "hidden", border: "1px solid rgba(0,0,0,0.04)" }}
              >
                <div className="d-flex">
                  <div style={{ width: 180 }}>
                    <div
                      style={{
                        width: 84,
                        height: 84,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 24,
                        background: "linear-gradient(135deg,#f0e6dd,#d9cbb1)",
                        color: "#3b3b3b",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                        marginBottom: 12,
                      }}
                    >
                      UA
                    </div>

                    <div style={{ fontSize: 13, color: "#6c6c6c" }}>collector@unikaantika.com</div>
                  </div>

                  <div className="flex-grow-1 d-flex align-items-start" style={{ paddingLeft: 20 }}>
                    <div>
                      <div style={{ fontSize: 20, marginBottom: 8 }} aria-hidden>
                        <span style={{ marginRight: 6 }}>★</span>
                        <span style={{ marginRight: 6 }}>★</span>
                        <span style={{ marginRight: 6 }}>★</span>
                        <span style={{ marginRight: 6 }}>★</span>
                        <span style={{ marginRight: 6 }}>★</span>
                      </div>

                      <p style={{ margin: 0, color: "#444", fontSize: 16 }}>
                        Thank you for choosing us — your feedback helps us improve.
                      </p>

                      <div style={{ marginTop: 10, fontSize: 13, color: "#9a9a9a" }}>
                        <span>Posted on Nov 13, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {reviews.map((r) => (
              <div className="col-md-4" key={r._id || JSON.stringify(r).slice(0, 20)}>
                <div className="card p-3 h-100 shadow-sm rounded-3">
                  <div className="d-flex align-items-start">
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 18,
                        background: "#f2f2f2",
                        color: "#333",
                        marginRight: 12,
                        flexShrink: 0,
                      }}
                    >
                      {r.userId ? String(r.userId).slice(0, 2).toUpperCase() : "AN"}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>
                          {/* Display email above the stars */}
                          {r.userEmail || "Anonymous"}
                        </div>
                        <div style={{ marginLeft: "auto", fontSize: 13, color: "#888" }}>
                          {formatDate(r.createdAt)}
                        </div>
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <div aria-hidden style={{ fontSize: 18, color: "#f1b33b", marginBottom: 6 }}>
                          {renderStars(r.rating)}
                        </div>
                        <div style={{ color: "#444" }}>{r.feedback || <i>No feedback provided.</i>}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// small helper to render stars as unicode
function renderStars(value) {
  const v = Number(value) || 0;
  const full = Math.max(0, Math.min(5, Math.round(v)));
  const stars = [];
  for (let i = 0; i < full; i++) stars.push("★");
  for (let i = full; i < 5; i++) stars.push("☆");
  return stars.join(" ");
}

/* -------------------- Section 5 (RENAMED from previous Section4) -------------------- */
function Section5({ title, description }) {
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
          </div>
        </div>

        {/* Direct Map Display (replaced image cards & explore button) */}
        <div>
          <div className="w-100" style={{ height: "500px", minHeight: "400px" }}>
            <MapComponent />
          </div>
        </div>
      </div>
    </section>
  );
}
