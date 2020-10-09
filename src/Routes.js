import React from 'react';
import { Route, Switch } from 'react-router-dom';


import NavBar from './pages/NavBar';
import FooterPage from './pages/FooterPage';


// FREE
import Camera from './pages/Camera.js'
import LoginPage from './pages/LoginPage.js'





class Routes extends React.Component {
  render() {
    return (
      <Switch>

        <Route path='/pages/NavBar' component={NavBar} />
        <Route path='/navigation/footer' component={FooterPage} />


        <Route path='/camera' component={Camera} />
        <Route path='/' component={LoginPage} />
        

        <Route
          render={function() {
            return <h1>Not Found</h1>;
          }}
        />
      </Switch>
    );
  }
}

export default Routes;
