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
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  withCredentials: true, // keep if your backend sets cookies
});

export default api;
