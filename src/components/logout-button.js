import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {MDBDropdownItem} from 'mdbreact';


const LogoutButton = () => {
  const { logout } = useAuth0();
  return (
    <MDBDropdownItem 
    onClick={() =>
      logout({
        returnTo: window.location.origin,
      })
      // onClick={() =>
        
      //   window.location.assign(window.location.origin)
        
    }>Выйти</MDBDropdownItem>
  );
};

export default LogoutButton;