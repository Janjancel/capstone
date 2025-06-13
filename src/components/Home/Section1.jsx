// import React, { useRef, useState, useEffect } from "react";
import "./Home.css";
// import ninjaVideo from "../images/ninja.mp4"; // Ensure the correct path to your video file

export default function Section1({ title, subtitle }) {

  return (
    <section id="home-sec1">
        {/* Background Video */}
        {/* <video ref={videoRef} autoPlay muted loop className="background-video">
          <source src={ninjaVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}

      <div className="home-sec1-container">

        {/* Upper Content */}
        <div className="animate__animated animate__rubberBand ">
          <h1 className="welcome">{title}</h1>
          <h6 className="explore">{subtitle}</h6>
        </div>

        {/* Lower Section (Buttons) */}
        <div className="lower">
          {/* <button id="register" onClick={onRegisterClick}><p>Register</p></button>
          <button id="login" onClick={onLoginClick}><p>Login</p></button> */}
        </div>
      </div>
    </section>
  );
}
