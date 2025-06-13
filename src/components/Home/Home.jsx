import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import Section1 from './Section1';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No user logged in");
        return;
      }

      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("User logged in:", res.data.email);
      } catch (err) {
        console.error("Invalid or expired token");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      }
    };

    checkAuth();
  }, []);

  return (
    <div id="homepage">
      <Section1
        title="Welcome to Unika Antika"
        subtitle="Explore our unique collection of antique items."
        onRegisterClick={() => navigate('/register')}
        onLoginClick={() => navigate('/login')}
      />

      <Section2
        title="Discover the Unique"
        subtitle="Explore our collection of exquisite antiques"
        onSearchSubmit={(e) => {
          e.preventDefault();
          console.log('Searching...');
        }}
        onViewAllClick={() => console.log('View All clicked')}
      />

      <Section3
        title="Featured Products"
        description="Discover our handpicked collection"
        onShopNowClick={() => console.log('Shop Now clicked')}
      />

      <Section4
        title="Educational Facts"
        description="Read about the history of antique treasures"
      />
    </div>
  );
}
