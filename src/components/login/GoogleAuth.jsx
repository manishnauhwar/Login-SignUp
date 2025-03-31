import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import "../../App.css";

const GoogleAuth = () => {
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    try {
      const res = await axiosInstance.post("/", {
        token: response.credential
      });

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google authentication error:", error);
      alert("Authentication failed! Please try again.");
    }
  };

  const handleError = () => {
    alert("Login Failed! Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="google-login-container">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          render={(renderProps) => (
            <button
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
              className="custom-google-button"
            >
              Sign in with Google
            </button>
          )}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
