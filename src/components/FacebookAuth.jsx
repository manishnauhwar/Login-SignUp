import React from "react";
import FacebookLogin from "react-facebook-login";
import { useNavigate } from "react-router-dom";

const FacebookAuth = () => {
  const navigate = useNavigate();

  const responseFacebook = async (response) => {
    if (response.accessToken) {
      const { email, name } = response;

      try {
        const res = await fetch(`http://localhost:5000/users?email=${email}`);
        const users = await res.json();

        if (users.length > 0) {
          localStorage.setItem("authToken", response.accessToken);
          navigate("/home");
        } else {
          await fetch("http://localhost:5000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name })
          });

          navigate("/login");
        }
      } catch (error) {
        alert("Authentication failed!");
      }
    } else {
      alert("Login Failed!");
    }
  };

  return (
    <div className="facebook-login">
      <FacebookLogin
        appId="677991588125938"
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
