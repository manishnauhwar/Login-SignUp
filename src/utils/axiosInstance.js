import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PRO_URL,
  withCredentials: true,
});


export default axiosInstance;
