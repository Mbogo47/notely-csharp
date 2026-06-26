import axios, { AxiosError } from "axios";
import store from "../store/store";
import { logout } from "../store/authSlice";

export const getApiErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : "Request failed";
  }

  const responseData = error.response?.data as
    | { error?: unknown; message?: unknown; errors?: unknown }
    | string
    | undefined;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    if (typeof responseData.error === "string" && responseData.error.trim()) {
      return responseData.error;
    }

    if (typeof responseData.message === "string" && responseData.message.trim()) {
      return responseData.message;
    }

    if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      return responseData.errors.filter(Boolean).join(" ");
    }

    if (typeof responseData.errors === "string" && responseData.errors.trim()) {
      return responseData.errors;
    }
  }

  return error.response?.statusText || error.message || "Request failed";
};


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
  (error: AxiosError) => {
    error.message = getApiErrorMessage(error);

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