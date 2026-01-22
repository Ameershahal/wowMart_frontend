import axios from "axios";
import Swal from "sweetalert2";

// Use local API in development, remote in production
const API_BASE_URL = "https://wowmart-h0ky.onrender.com/api";  // Production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Attach token from localStorage automatically (user or admin)
api.interceptors.request.use(
  (config) => {
    try {
      // Check if this is an admin route
      const isAdminRoute = config.url?.startsWith('/admin');
      
      // Use admin token for admin routes, user token for others
      const token = isAdminRoute 
        ? localStorage.getItem("adminToken")
        : localStorage.getItem("token");
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // Silently fail - token might not be available
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth failures
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const isAdminRoute = error.config?.url?.startsWith('/admin');
      
      if (isAdminRoute) {
        // Admin session expired
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminAuth");
        localStorage.removeItem("admin");
        
        // Only show popup if not already on login page
        if (!window.location.pathname.includes('/admin/login')) {
          await Swal.fire({
            icon: "error",
            title: "Session Expired",
            text: "Your admin session has expired. Please login again.",
            confirmButtonText: "Login",
            allowOutsideClick: false,
          });
          window.location.href = "/admin/login";
        }
      } else {
        // User session expired
        await Swal.fire({
          icon: "error",
          title: "Session Expired",
          text: "Your session has expired. Please login again.",
          confirmButtonText: "Login",
          allowOutsideClick: false,
        });

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
