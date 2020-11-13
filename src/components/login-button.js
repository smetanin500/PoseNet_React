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
      onClick={() => loginWithRedirect({redirectUri : window.location.href + "camera"})}
      //onClick = {() => window.location.assign(window.location.href + "camera")}
    >
      Войти
    </MDBBtn>
  );
};

export default LoginButton;