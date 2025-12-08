// import React from "react";
// import avif from "../images/unika_logo.png";

// export default function Section1() {
//   const title = "Unika Antika";
//   const subtitle = "Timeless antiques for collectors and dreamers.";

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
//       </div>
//     </section>
//   );
// }


import React from "react";
import bgVideo from "../images/bedyo.mov"; // <-- add your video file here
import avif from "../images/unika_logo.png";

export default function Section1() {
  const title = "Unika Antika";
  const subtitle = "Timeless antiques for collectors and dreamers.";

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
      {/* --- Background Video --- */}
      <video
        src={bgVideo}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
          filter: "brightness(0.55)",
        }}
      />

      {/* --- Dark overlay + blur --- */}
      {/* <div
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
      /> */}

      {/* --- Text content --- */}
      <div style={{ position: "relative", zIndex: 3, maxWidth: "900px" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 5rem)",
            fontWeight: "900",
            textTransform: "uppercase",
            // backgroundImage: `url(${avif})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            WebkitBackgroundClip: "text",
            color: "white",
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
      </div>
    </section>
  );
}
