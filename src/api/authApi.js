// // src/api/authApi.js
// import axios from 'axios';

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
//   withCredentials: true,
// });

// export default api;


// src/api/authApi.js
import axios from 'axios';

const api = axios.create({
  baseURL: "https://capstone-backend-production-7ec4.up.railway.app/api",
  withCredentials: true, // keep if your backend sets cookies
});

export default api;
