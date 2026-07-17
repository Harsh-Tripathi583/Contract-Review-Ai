import axios from "axios";

// Single axios instance. All API modules should use this.
// Base URL is read from Vite env — swap for real FastAPI URL when ready.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    // Central place to normalize error shape for React Query.
    return Promise.reject(error);
  },
);
