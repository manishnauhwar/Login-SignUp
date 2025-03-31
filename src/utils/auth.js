import axios from "axios";

const axiosInstance = axios.create();

export const isAuthenticated = () => {
  const user = localStorage.getItem("user");
  return !!user;
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = async () => {
  try {
    await axiosInstance.post("/users/logout");
    localStorage.removeItem("user");
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};