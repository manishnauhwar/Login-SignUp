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
  localStorage.setItem("token", token); 
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event('auth-change'));
};

export const logout = async () => {
  try {
    await axiosInstance.post("/users/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = "/login";
  }
};