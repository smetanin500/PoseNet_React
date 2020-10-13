import React, { Component } from "react";
import { BrowserRouter as Router } from 'react-router-dom';
//import Loading from "./components";
import LogOut from "./components/LogOut";
import "./index.css";
import {
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavbarToggler,
  MDBCollapse,
  MDBNavItem,
  MDBFooter,
  MDBNavLink,
  MDBIcon,
  MDBDropdown,
  MDBDropdownToggle, 
  MDBDropdownMenu, 
  MDBDropdownItem,
  MDBContainer,
  MDBCardBody,
  MDBTable,
  MDBTableBody
} from 'mdbreact';
import Routes from './Routes';
import logo from './assets/logo.png'


class App extends Component {
  


  state = {
    collapseID: ''
  };

  

  toggleCollapse = collapseID => () =>
    this.setState(prevState => ({
      collapseID: prevState.collapseID !== collapseID ? collapseID : ''
    }));

  closeCollapse = collID => () => {
    const { collapseID } = this.state;
    window.scrollTo(0, 0);
    collapseID === collID && this.setState({ collapseID: '' });
  };

  render() {

    const { collapseID } = this.state;

    // const { isLoading } = useAuth0();

    // if (isLoading) {
    //   return <Loading />;
    // }

    return (
      <Router>
    	<div className="flyout">
      <MDBNavbar color='indigo' dark expand='md' fixed='top' scrolling>
            <MDBNavbarBrand  className='py-0 font-weight-bold'>
              <img alt='MDB React Logo' className='img-fluid' src={logo} />
            </MDBNavbarBrand>
            <MDBNavbarToggler
              onClick={this.toggleCollapse('mainNavbarCollapse')}
            />
            <MDBCollapse id='mainNavbarCollapse' isOpen={collapseID} navbar>
              <MDBNavbarNav right>
                <MDBNavItem>
                  <MDBNavLink
                    exact
                    to='/camera'
                    onClick={this.closeCollapse('mainNavbarCollapse')}
                  >
                    <strong>Упражнения</strong>
                  </MDBNavLink>
                </MDBNavItem>
                <MDBNavItem>
                  <MDBDropdown>
                    <MDBDropdownToggle nav caret>
                      <MDBIcon icon="user" />
                    </MDBDropdownToggle>
                    <MDBDropdownMenu className="dropdown-default">
                      <LogOut />
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </MDBNavItem>


              </MDBNavbarNav>
            </MDBCollapse>
          </MDBNavbar>


          <main style={{ marginTop: '4rem' }}>
            <Routes />
          </main>

          <MDBContainer>
            <MDBCardBody>
              <MDBTable>
                <MDBTableBody>
                  <tr>
                  <span className={'fas fa-circle white-text fa-4x'}></span>
                  </tr>
                  <tr>
                  </tr>
                </MDBTableBody>
              </MDBTable>
            </MDBCardBody>
          </MDBContainer>  

          <MDBFooter color='indigo' className="footerPage">
            <p className='footer-copyright mb-0 py-3 text-center'>
              &copy; {new Date().getFullYear()} Copyright:
              <a > ООО ИРЗ </a>
            </p>
          </MDBFooter>     
        </div>
      </Router>
    );
  }
}

export default App
