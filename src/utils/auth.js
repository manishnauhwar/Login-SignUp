import axios from "axios";

const axiosInstance = axios.create();

export const isAuthenticated = () => {
  const user = localStorage.getItem("user");
  // Check if user data exists in localStorage
  return !!user;
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = async () => {
  try {
    // Call logout endpoint to clear the cookie
    await axiosInstance.post("/users/logout");
    // Clear local storage
    localStorage.removeItem("user");
    // Redirect to login
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear local storage and redirect even if server call fails
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};