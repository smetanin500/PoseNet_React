import React from "react";
import { MDBBtn } from 'mdbreact';
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <MDBBtn
      type="button"
      gradient="blue"
      rounded
      className="btn-block z-depth-1a"
      onClick={() => loginWithRedirect({redirectUri : "http://localhost:3000/camera"})}
    >
      Войти
    </MDBBtn>
    // <button
    //   className="btn btn-primary btn-block"
    //   onClick={() => loginWithRedirect({redirectUri : "http://localhost:3000/camera"})}
    // >
    //   Войти
    // </button>
  );
};

export default LoginButton;