import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PRO_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(`API Error for ${error.config?.url}:`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";

    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
