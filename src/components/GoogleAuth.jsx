import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const GoogleAuth = () => {
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    const token = response.credential;
    const userData = JSON.parse(atob(token.split(".")[1]));

    try {
      const res = await fetch(`http://localhost:5000/users?email=${userData.email}`);
      const users = await res.json();

      if (users.length > 0) {
        localStorage.setItem("authToken", token);
        navigate("/home");
      } else {
        await fetch("http://localhost:5000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userData.email, name: userData.name })
        });

        navigate("/login");
      }
    } catch (error) {
      alert("Authentication failed!");
    }
  };

  const handleError = () => {
    alert("Login Failed!");
  };

  return (
    <GoogleOAuthProvider clientId="1017771155951-5ioboilkq21lo4pflqg3kqof3eevdaed.apps.googleusercontent.com">
      <div className="google-login-container">
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} className="google-button" />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
