import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { setAuthData } from "../../utils/auth";
import { useTranslation } from "react-i18next";
import "../../App.css";

const GoogleAuth = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (response) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/", {
        token: response.credential
      });

      if (res.data.success && res.data.user && res.data.user.token) {
        setAuthData(res.data.user.token, res.data.user);
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Google authentication error:", error);
      alert("Authentication failed! Please try again.");
    } finally {
      setIsLoading(false);
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
          useOneTap={true}
          flow="implicit"
          popup={true}
          render={(renderProps) => (
            <button
              onClick={renderProps.onClick}
              disabled={renderProps.disabled || isLoading}
              className="custom-google-button"
            >
              {isLoading ? t("loading") : t("signInWithGoogle")}
            </button>
          )}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
