import axios from "axios";

const axiosInstance = axios.create();

export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  return !!token;
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const setAuthData = (token, user) => {
  localStorage.setItem("accessToken", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const logout = async () => {
  try {
    await axiosInstance.post("/users/logout");
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  }
};