import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post("http://localhost:8000/api/token/refresh/", {
            refresh: refreshToken,
          });

          const { access } = response.data;

          // Store new access token
          localStorage.setItem("accessToken", access);

          // Update the original request header
          originalRequest.headers.Authorization = `Bearer ${access}`;

          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          console.error("RefreshToken failed", refreshError);
          // Optional: Logout user if refresh fails
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
