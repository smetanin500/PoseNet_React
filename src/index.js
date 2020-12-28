import React from "react";
import ReactDOM from "react-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";
//import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import Auth0ProviderWithHistory from "./auth/auth0-provider-with-history";

import * as serviceWorker from './serviceWorker';



ReactDOM.render(
    <Router>
      <Auth0ProviderWithHistory> 
        <div><App /></div>
      </Auth0ProviderWithHistory> 
    </Router>,
    document.getElementById("root"),
  );

serviceWorker.register();