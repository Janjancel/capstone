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
      if (!token) return;

      try {
        await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
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
        onRegisterClick={() => navigate('/register')}
        onLoginClick={() => navigate('/login')}
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
