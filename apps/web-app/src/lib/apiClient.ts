import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Assuming your Next.js API routes are under /api
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors for handling tokens, errors, etc.
// apiClient.interceptors.request.use(config => {
//   // const token = /* get token from somewhere e.g. localStorage or UserStore */;
//   // if (token) {
//   //   config.headers.Authorization = `Bearer ${token}`;
//   // }
//   return config;
// });

// apiClient.interceptors.response.use(
//   response => response,
//   error => {
//     // Handle errors globally if needed
//     return Promise.reject(error);
//   }
// );

export default apiClient; 