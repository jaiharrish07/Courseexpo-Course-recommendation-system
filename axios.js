import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, // This is still needed for cookies
  headers: {
    "Content-Type": "application/json"
  },
});

// --- THIS IS THE NEW CODE ---
// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem("token");
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);
// --- END OF NEW CODE ---


// Your existing error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;