import axios from "axios";
import store  from "../store/store";
import { logout } from "../store/authSlice";


const axiosInstance = axios.create({
  baseURL: import.meta.env.domain,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from Redux first
    let token = store.getState().auth.token;
    
    // If no token in Redux, try localStorage as fallback
    if (!token) {
      token = localStorage.getItem("token");
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
     console.log(`Making request to: ${config.baseURL}${config.url}`); // Debug log
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens
      localStorage.removeItem("token");
      store.dispatch(logout());
      
      // Redirect to login if not already there
      if (window.location.pathname !== "/signin") {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;