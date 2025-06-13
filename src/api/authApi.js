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
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Only if your backend uses cookies/sessions
});

export default api;
