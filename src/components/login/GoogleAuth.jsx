import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { setAuthData } from "../../utils/auth";
import "../../App.css";

const GoogleAuth = () => {
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    try {
      console.log("Google OAuth response received");
      const res = await axiosInstance.post("/", {
        token: response.credential
      });

      console.log("Server response:", res.data);

      if (res.data.success && res.data.user && res.data.user.token) {
        // Store token and user data
        setAuthData(res.data.user.token, res.data.user);
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Invalid response from server");
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
          useOneTap={false}
          flow="implicit"
          popup={true}
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
