// src/utils/auth.js
export const setAuthToken = ( token: string) => {
    localStorage.setItem("authToken", token);
  };
  
  export const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };
  
  export const isAuthenticated = () => {
    return !!getAuthToken();
  };
  
  export const logout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/"; 
  };
  