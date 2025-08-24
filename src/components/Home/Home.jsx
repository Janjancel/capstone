// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './Home.css';
// import Section1 from './Section1';
// import Section2 from './Section2';
// import Section3 from './Section3';
// import Section4 from './Section4';

// export default function Home() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkAuth = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       try {
//         await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
//           headers: { Authorization: `Bearer ${token}` }
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
//         onRegisterClick={() => navigate('/register')}
//         onLoginClick={() => navigate('/login')}
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


import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Auth from "../Auth/Auth";
import { useAuth } from "../../context/AuthContext"; 
import MapComponent from "../MapComponent";
import "animate.css";
import "./Home.css";

// Images
import bgVideo from "../images/ninja.mp4";
import avif from "../images/fun-fact.webp"
import img1 from "../images/items/ilohan.jpg";
import img2 from "../images/items/carabao bench.jpg";
import img3 from "../images/items/suyod.jpg";
import img4 from "../images/clock.jpeg";
import img5 from "../images/horn.webp";

export default function Home() {
  const navigate = useNavigate();

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
        onRegisterClick={() => navigate("/register")}
        onLoginClick={() => navigate("/login")}
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
function Section1({ title, subtitle, onRegisterClick, onLoginClick }) {
  const navigate = useNavigate();

  return (
      <section
        id="home-sec1"
        className="d-flex flex-column align-items-center justify-content-center text-center"
        style={{
          minHeight: "60vh",
          position: "relative",
          overflow: "hidden",
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
          }}
        />

        {/* Glassmorphism Overlay */}
        <div
          style={{
            // background: "rgba(0,0,0,0.6)",
            // WebkitBackdropFilter: "blur(10px)",
            // backdropFilter: "blur(10px)",
            // border: "px solid rgba(0,0,0,0.3)",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
          }}
        />

        {/* Text Content */}
        <div style={{ position: "relative", zIndex: 3 }}>
          <h1
            style={{
              fontSize: "clamp(1.5625rem, 0.3024rem + 10.0806vw, 9.375rem)", 
              fontWeight: "900",
              textTransform: "uppercase",
              backgroundImage: `url(${avif})`,   
              backgroundSize: "cover",         
              backgroundPosition: "center",     
              backgroundAttachment: "fixed",     
              WebkitBackgroundClip: "text",
              color: "rgba(255,255,255,0.85)",
              WebkitTextStroke: "1px rgba(255,255,255,0.15)", // subtle stroke
              textShadow: "0 0 10px rgba(0,0,0,0.2)",
              position: "relative",
              zIndex: 3,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: "clamp(0.625rem, 0.504rem + 0.9677vw, 1.375rem)",
              fontWeight: "400",
              color: "rgba(255, 255, 255, 0.85)",
              marginTop: "1rem",
            }}
          >
            {subtitle}
          </p>
        </div>
      </section>

  );
}

/* -------------------- Section 2 -------------------- */
function Section2() {
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
      {/* <video
        className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
        autoPlay
        muted
        loop
        playsInline
        style={{ zIndex: 0, objectFit: "cover" }}
      >
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video> */}

      {/* Dark overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "#fff", zIndex: 1 }}
      ></div>

      {/* Foreground content */}
      <div className={`container position-relative ${animationClass}`} style={{ zIndex: 2 }}>
        <h2 className="fw-bold text-center mb-5 text-black">Our Services</h2>
        <div className="row g-4">
          {services.map((service, index) => (
            <div key={index} className="col-md-4">
              <div
                className="card h-100 text-center border-0 bg-white bg-opacity-25 text-black shadow-lg"
                style={{ backdropFilter: "blur(10px)" }}
              >
                <div className="card-body">
                  <i className={`bi ${service.icon} display-4 text-white mb-3`}></i>
                  <h5 className="card-title fw-bold">{service.title}</h5>
                  <p className="card-text">{service.description}</p>
                  <button
                    className="btn btn-outline-dark mt-2"
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



/* -------------------- Section 3 -------------------- */
function Section3({ title, description }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) =>
        setAnimationClass(entry.isIntersecting ? "animate__animated animate__fadeInUp" : ""),
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
        {/* Heading */}
        <div className="d-flex justify-content-between">
          <div className="text-center mb-5">
            <h2 className="fw-bold">{title}</h2>
            <p className="text-muted">{description}</p>
          </div>

                  {/* Explore Button */}
          <div className="text-center mt-4">
            <button className="btn btn-outline-dark px-4" onClick={() => navigate("/buy")}>
              Explore All →
            </button>
          </div>
        </div>

        {/* Product Cards */}
        <div className="row g-4">
          {antiques.map((item) => (
            <div className="col-12 col-sm-6 col-lg-4" key={item.id}>
              <div className="card border-0 shadow-sm h-100 rounded-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="card-img-top rounded-top"
                  style={{
                    height: "280px",
                    objectFit: "cover",
                  }}
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="fw-semibold">{item.name}</h5>
                  <p className="text-muted small mb-2">{item.description}</p>
                  <p className="fw-bold mb-3">{item.price}</p>
                  <button
                    className="btn btn-dark mt-auto"
                    onClick={() => navigate("/buy")}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
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
    const sectionEl = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
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


// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Auth from "../Auth/Auth";
// import { useAuth } from "../../context/AuthContext"; 
// import MapComponent from "../MapComponent";
// import "animate.css";
// import "./Home.css";

// // Images
// import bgVideo from "../images/ninja.mp4";
// import avif from "../images/gold.jpg"
// import img1 from "../images/items/ilohan.jpg";
// import img2 from "../images/items/carabao bench.jpg";
// import img3 from "../images/items/suyod.jpg";
// import img4 from "../images/clock.jpeg";
// import img5 from "../images/horn.webp";

// export default function Home() {
//   const navigate = useNavigate();

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
//         onRegisterClick={() => navigate("/register")}
//         onLoginClick={() => navigate("/login")}
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
// function Section1({ title, subtitle, onRegisterClick, onLoginClick }) {
//   const navigate = useNavigate();

//   return (
//       <section
//         id="home-sec1"
//         className="d-flex flex-column align-items-center justify-content-center text-center"
//         style={{
//           minHeight: "60vh",
//           position: "relative",
//           overflow: "hidden",
//         }}
//       >
//         {/* Background Image Layer */}
//         <div
//           style={{
//             backgroundImage: `url(${avif})`,
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             zIndex: 1,
//           }}
//         />

//         {/* Glassmorphism Overlay */}
//         <div
//           style={{
//             background: "#f0f0f0ff",
//             // WebkitBackdropFilter: "blur(10px)",
//             // backdropFilter: "blur(10px)",
//             // border: "px solid rgba(0,0,0,0.3)",
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             zIndex: 2,
//           }}
//         />

//         {/* Text Content */}
//         <div style={{ position: "relative", zIndex: 3 }}>
//           <h1
//             style={{
//               fontSize: "clamp(1.5625rem, 0.3024rem + 10.0806vw, 9.375rem)", 
//               fontWeight: "900",
//               textTransform: "uppercase",
//               backgroundImage: `url(${avif})`,   
//               backgroundSize: "cover",         
//               backgroundPosition: "center",     
//               backgroundAttachment: "fixed",     
//               WebkitBackgroundClip: "text",
//               color: "transparent",
//               WebkitTextStroke: "1px rgba(55, 55, 55, 0.15)", // subtle stroke
//               textShadow: "0 5px 20px rgba(0,0,0,0.2)",
//               position: "relative",
//               zIndex: 3,
//             }}
//           >
//             {title}
//           </h1>

//           <p
//             style={{
//               fontSize: "clamp(0.625rem, 0.504rem + 0.9677vw, 1.375rem)",
//               fontWeight: "400",
//               color: "rgba(46, 46, 46, 0.85)",
//               marginTop: "1rem",
//             }}
//           >
//             {subtitle}
//           </p>
//         </div>
//       </section>

//   );
// }

// /* -------------------- Section 2 -------------------- */
// function Section2() {
//   const sectionRef = useRef(null);
//   const navigate = useNavigate();
//   const { user } = useAuth(); // ✅ pull user from context
//   const [animationClass, setAnimationClass] = useState("");
//   const [showAuthModal, setShowAuthModal] = useState(false);

//   useEffect(() => {
//     const sectionEl = sectionRef.current;

//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setAnimationClass("animate__animated animate__fadeInUp");
//         }
//       },
//       { threshold: 0.3 }
//     );

//     if (sectionEl) observer.observe(sectionEl);
//     return () => {
//       if (sectionEl) observer.unobserve(sectionEl);
//     };
//   }, []);

//   const handleLearnMore = async (path) => {
//     if (user) {
//       navigate(path); // ✅ user already exists
//       return;
//     }

//     const token = localStorage.getItem("token");
//     if (!token) {
//       setShowAuthModal(true); // ✅ no token, show auth
//       return;
//     }

//     try {
//       await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       navigate(path); // ✅ verified via token
//     } catch (err) {
//       console.warn("User not authenticated");
//       localStorage.removeItem("token");
//       localStorage.removeItem("userId");
//       setShowAuthModal(true); // ✅ failed token check, fallback
//     }
//   };

//   const services = [
//     {
//       title: "Buy Antiques",
//       icon: "bi-cart-check",
//       description: "Browse and buy rare collectibles from our trusted antique sellers.",
//       path: "/buy",
//     },
//     {
//       title: "Sell Antiques",
//       icon: "bi-box-arrow-up",
//       description: "List your antique items and reach collectors around the world.",
//       path: "/sell",
//     },
//     {
//       title: "Demolish Items",
//       icon: "bi-trash",
//       description: "Request safe and responsible removal of unusable antique items.",
//       path: "/demolish",
//     },
//   ];

//   return (
// <section
//   id="services"
//   ref={sectionRef}
//   className="position-relative text-center py-5 overflow-hidden"
//   style={{
//     minHeight: "60vh",
//     position: "relative",
//     overflow: "hidden",
//   }}
// >
//   {/* Background Video */}
//   {/* <video
//     className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
//     autoPlay
//     muted
//     loop
//     playsInline
//     style={{ zIndex: 0, objectFit: "cover" }}
//   >
//     <source src={bgVideo} type="video/mp4" />
//     Your browser does not support the video tag.
//   </video> */}

//   {/* Background Image Layer (like Section 1) */}
//   <div
//     style={{
//       backgroundImage: `url(${avif})`,
//       backgroundSize: "cover",
//       backgroundPosition: "center",
//       position: "absolute",
//       top: 0,
//       left: 0,
//       width: "100%",
//       height: "100%",
//       zIndex: 0,
//     }}
//   />

//   {/* Glassmorphism Overlay (light theme like Section 1) */}
//   <div
//     style={{
//       background: "#f0f0f0ff",
//       position: "absolute",
//       top: 0,
//       left: 0,
//       width: "100%",
//       height: "100%",
//       zIndex: 1,
//     }}
//   />

//   {/* Foreground content */}
//   <div
//     className={`container position-relative ${animationClass}`}
//     style={{ zIndex: 2 }}
//   >
//     {/* Heading styled like Section 1 */}
//     <h2
//       style={{
//         // fontSize: "clamp(1.5625rem, 0.3024rem + 10.0806vw, 9.375rem)",
//         fontWeight: "900",
//         textTransform: "uppercase",
//         backgroundImage: `url(${avif})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundAttachment: "fixed",
//         WebkitBackgroundClip: "text",
//         color: "transparent",
//         WebkitTextStroke: "1px rgba(55, 55, 55, 0.15)", // subtle stroke
//         textShadow: "0 5px 20px rgba(0,0,0,0.2)",
//       }}
//     >
//       Our Services
//     </h2>

//     <div className="row g-4 mt-4">
//       {services.map((service, index) => (
//         <div key={index} className="col-md-4">
//           <div
//             className="card h-100 text-center border-0 bg-black bg-opacity-25 shadow-lg"
//             style={{ backdropFilter: "blur(10px)",
//              }}
//           >
//             <div className="card-body">
//               <i
//                 className={`bi ${service.icon} display-4 mb-3`}
//                 style={{ color: "rgba(46, 46, 46, 0.85)" }}
//               ></i>
//               <h5
//                 className="card-title fw-bold"
//                 style={{ color: "rgba(20, 20, 20, 0.9)" }}
//               >
//                 {service.title}
//               </h5>
//               <p className="card-text" style={{ color: "rgba(46, 46, 46, 0.85)" }}>
//                 {service.description}
//               </p>
//               <button
//                 className="btn btn-outline-dark mt-2"
//                 onClick={() => handleLearnMore(service.path)}
//               >
//                 Learn More
//               </button>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>

//   {/* Auth Modal */}
//   <Auth show={showAuthModal} onHide={() => setShowAuthModal(false)} />
// </section>

//   );
// }



// /* -------------------- Section 3 -------------------- */
// function Section3({ title, description }) {
//   const navigate = useNavigate();
//   const sectionRef = useRef(null);
//   const [animationClass, setAnimationClass] = useState("");

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) =>
//         setAnimationClass(entry.isIntersecting ? "animate__animated animate__fadeInUp" : ""),
//       { threshold: 0.3 }
//     );
//     if (sectionRef.current) observer.observe(sectionRef.current);
//     return () => {
//       if (sectionRef.current) observer.unobserve(sectionRef.current);
//     };
//   }, []);

//   const antiques = [
//     { id: 1, image: img1, name: "Ilohan", description: "Available in select stores", price: "$120.00" },
//     { id: 2, image: img2, name: "Carabao Bench", description: "Online exclusive", price: "$80.00" },
//     { id: 3, image: img3, name: "Suyod", description: "Hand-painted classic", price: "$150.00" },
//   ];

//   return (
// <section
//   className="position-relative py-5 overflow-hidden"
//   ref={sectionRef}
//   id="home-sec3"
//   style={{ minHeight: "60vh" }}
// >
//   {/* Background Image Layer */}
//   <div
//     style={{
//       backgroundImage: `url(${avif})`,
//       backgroundSize: "cover",
//       backgroundPosition: "center",
//       position: "absolute",
//       top: 0,
//       left: 0,
//       width: "100%",
//       height: "100%",
//       zIndex: 0,
//     }}
//   />

//   {/* Glassmorphism Overlay */}
//   <div
//     style={{
//       background: "#f0f0f0ff",
//       position: "absolute",
//       top: 0,
//       left: 0,
//       width: "100%",
//       height: "100%",
//       zIndex: 1,
//     }}
//   />

//   {/* Foreground content */}
//   <div className={`container position-relative ${animationClass}`} style={{ zIndex: 2 }}>
//     <div className="d-flex justify-content-between align-items-center flex-wrap mb-5">
//       {/* Left side: Title + Description */}
//       <div>
//         <h2
//           style={{
//             fontWeight: "900",
//             textTransform: "uppercase",
//             backgroundImage: `url(${avif})`,
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//             WebkitBackgroundClip: "text",
//             color: "transparent",
//             WebkitTextStroke: "1px rgba(55, 55, 55, 0.15)",
//             textShadow: "0 5px 20px rgba(0,0,0,0.2)",
//           }}
//         >
//           {title}
//         </h2>
//         <p className="text-muted">{description}</p>
//       </div>

//       {/* Right side: Explore Button */}
//       <div>
//         <button
//           className="btn btn-outline-dark px-4"
//           onClick={() => navigate("/buy")}
//         >
//           Explore All →
//         </button>
//       </div>
//     </div>

//     {/* Product Cards */}
//     <div className="row g-4">
//       {antiques.map((item) => (
//         <div className="col-12 col-sm-6 col-lg-4" key={item.id}>
//           <div className="card border-0 shadow-sm h-100 rounded-3">
//             <img
//               src={item.image}
//               alt={item.name}
//               className="card-img-top rounded-top"
//               style={{ height: "280px", objectFit: "cover" }}
//               onError={(e) => (e.target.src = "/placeholder.jpg")}
//             />
//             <div className="card-body d-flex flex-column">
//               <h5 className="fw-semibold">{item.name}</h5>
//               <p className="text-muted small mb-2">{item.description}</p>
//               <p className="fw-bold mb-3">{item.price}</p>
//               <button
//                 className="btn btn-dark mt-auto"
//                 onClick={() => navigate("/buy")}
//               >
//                 Add to Cart
//               </button>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>
// </section>

//   );
// }


// /* -------------------- Section 4 -------------------- */
// function Section4({ title, description }) {
//   const [showDiv, setShowDiv] = useState(false);
//   const [inView, setInView] = useState(false);
//   const sectionRef = useRef(null);

//   useEffect(() => {
//     const sectionEl = sectionRef.current;
//     const observer = new IntersectionObserver(
//       ([entry]) => setInView(entry.isIntersecting),
//       { threshold: 0.3 }
//     );
//     if (sectionEl) observer.observe(sectionEl);
//     return () => {
//       if (sectionEl) observer.unobserve(sectionEl);
//     };
//   }, []);

//   return (
// <section
//   className={`py-5 text-center animate__animated ${
//     inView ? "animate__fadeIn animate__slower" : ""
//   }`}
//   ref={sectionRef}
//   style={{
//     background: "#f0f0f0ff", // section overlay background
//     color: "#333",
//   }}
// >
//   <div className="container">
//     <div className="row align-items-center mb-4">
//       <div className="col-md-8 text-start">
//         <h1
//           className="fw-bold text-capitalize"
//           style={{
//             // fontSize: "clamp(0.625rem, 0.4032rem + 1.7742vw, 2rem)",
//             fontWeight: "900",
//             textTransform: "uppercase",
//             backgroundImage: `url(${avif})`, // letters background
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//             // filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.6))", // shadow for contrast
//           }}
//         >
//           {title}
//         </h1>
//         <p className=" text-dark">{description}</p>
//         <button
//           className="btn btn-dark mt-3"
//           onClick={() => setShowDiv(!showDiv)}
//         >
//           {showDiv ? "Hide Map" : "Explore More"}
//         </button>
//       </div>
//     </div>

//     <div className="row g-4">
//       <div className="col-md-6">
//         <div className="bg-white rounded shadow-sm overflow-hidden">
//           <div
//             className="card-img-top"
//             style={{ height: "200px", overflow: "hidden" }}
//           >
//             <img
//               src={img4}
//               className="w-100 h-100"
//               style={{ objectFit: "cover" }}
//               alt="Educational Fact 1"
//             />
//           </div>
//           <div className="p-3">
//             <p className="text-dark small">
//               Explore the rich history of ancient artifacts and their significance.
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="col-md-6">
//         <div className="bg-white rounded shadow-sm overflow-hidden">
//           <div
//             className="card-img-top"
//             style={{ height: "200px", overflow: "hidden" }}
//           >
//             <img
//               src={img5}
//               className="w-100 h-100"
//               style={{ objectFit: "cover" }}
//               alt="Educational Fact 2"
//             />
//           </div>
//           <div className="p-3">
//             <p className="text-dark small">
//               Learn about the craftsmanship and techniques used in antique creations.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* Expandable Map Section */}
//     <div
//       className="mt-4 overflow-hidden transition-height"
//       style={{
//         maxHeight: showDiv ? "500px" : "0px",
//         height: showDiv ? "500px" : "0px",
//         transition: "max-height 0.5s ease-in-out, height 0.5s ease-in-out",
//       }}
//     >
//       <h2 className="fs-4 text-center mt-3 text-dark">
//         Locations of Heritage Houses in Region IV-A
//       </h2>
//       <div className="w-100" style={{ height: "400px", minHeight: "400px" }}>
//         <MapComponent />
//       </div>
//     </div>
//   </div>
// </section>

//   );
// }
