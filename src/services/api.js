import axios from "axios";
import { getApiBaseUrl, checkProductionReachable, setActiveApiUrl } from "../utils/apiOrigin.js";

const API_BASE_URL = getApiBaseUrl();
let isProductionChecked = false;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage automatically (user or admin) and resolve backend availability
api.interceptors.request.use(
  async (config) => {
    // 1. Ensure production reachability check has resolved
    try {
      const resolvedUrl = await checkProductionReachable();
      setActiveApiUrl(resolvedUrl);
      api.defaults.baseURL = resolvedUrl;
      config.baseURL = resolvedUrl;
    } catch (err) {
      console.error("Error resolving API base URL:", err);
    }

    // 2. Attach Authorization token
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
          const { default: Swal } = await import("sweetalert2");
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
        const { default: Swal } = await import("sweetalert2");
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
