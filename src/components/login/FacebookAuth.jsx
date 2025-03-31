import React from "react";
import FacebookLogin from "react-facebook-login";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const FacebookAuth = () => {
  const navigate = useNavigate();

  const responseFacebook = async (response) => {
    if (response.accessToken) {
      try {
        const res = await axiosInstance.post("/facebook", {
          accessToken: response.accessToken
        });

        if (res.data.success) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Facebook authentication error:", error);
        alert("Authentication failed! Please try again.");
      }
    } else {
      alert("Login Failed! Please try again.");
    }
  };

  return (
    <div className="facebook-login">
      <FacebookLogin
        appId={import.meta.env.VITE_FACEBOOK_APP_ID}
        autoLoad={false}
        fields="name,email,picture"
        callback={responseFacebook}
        cssClass="facebook-button"
        icon="fa-facebook"
        textButton="Facebook Login"
      />
    </div>
  );
};

export default FacebookAuth;
