import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// 🔥 Attach token automatically
API.interceptors.request.use((req) => {
  const token = typeof window !== "undefined"
    ? (sessionStorage.getItem("token") || localStorage.getItem("token"))
    : null;

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// 🔥 Auto-redirect to login on expired/invalid token
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      const currentTabToken = sessionStorage.getItem("token");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      if (!currentTabToken || localStorage.getItem("token") === currentTabToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;