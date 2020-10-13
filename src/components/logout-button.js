import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {MDBDropdownItem} from 'mdbreact';

const LogoutButton = () => {
  const { logout } = useAuth0();
  return (
    // <button
    //   className="btn btn-danger btn-block"
    //   onClick={() =>
    //     logout({
    //       returnTo: window.location.origin,
    //     })
    //   }
    // >
    //   Log Out
    // </button>
    <MDBDropdownItem onClick={() =>
      logout({
        returnTo: window.location.origin,
      })
    }>Выйти</MDBDropdownItem>
  );
};

export default LogoutButton;