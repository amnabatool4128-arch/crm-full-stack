import axios from "axios";

/* localStorage key for the auth token */
export const TOKEN_KEY = "ttp_crm_token";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Normalize responses & errors
api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const status = error.response?.status;

    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    // Auto logout on expired/invalid token
    if (status === 401 && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem(TOKEN_KEY);
    }

    return Promise.reject({
      status,
      message,
    });
  },
);

export default api;
