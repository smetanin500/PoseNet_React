import React, { Component} from "react";
import { BrowserRouter as Router } from 'react-router-dom';
//import Loading from "./components";
import LogoutButton from "./components/logout-button";
//import "./index.css";
import logo from './assets/logo.png'
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
  MDBContainer
} from 'mdbreact';
import Routes from './Routes';
// import DeviceOrientation, { Orientation } from 'react-screen-orientation'
const isMobile = /Mobile|webOS|BlackBerry|IEMobile|MeeGo|mini|Fennec|Windows Phone|Android|iP(ad|od|hone)/i.test(navigator.userAgent);



class App extends Component {
  


  state = {
    collapseID: '',
    currentPath : window.location.href
  };


  TwoFingersTouchAndScroll(e) {
      if(e.scale !== 1) {
        e.preventDefault();
      }
      if(e.scrollTop !== 1) {
        e.preventDefault();
      }
      // var node = e.target;
      // const bottom = node.scrollHeight - node.scrollTop === node.clientHeight;
      //   if (bottom) {
      //     e.preventDefault();
      //   }
  }

  DoubleTap(e) {
      e.preventDefault();
      e.target.click();
}

//  deviceOrientation() {
//   var body = document.body;
//   switch(window.orientation) {
//     case 90:
//       body.classList = '';
//       body.classList.add('rotation90');
//       break;
//     case -90:
//       body.classList = '';
//       body.classList.add('rotation-90');
//       break;
//     default:
//       body.classList = '';
//       body.classList.add('portrait');
//       break;
//   }
// }

  async componentDidMount() {
    window.document.addEventListener("touchmove", this.TwoFingersTouchAndScroll, {passive: false})
    window.document.addEventListener("touchend", this.DoubleTap, {passive: false})
    // var devWidth, devHeight;
    // window.addEventListener('load', function() {
    //   devWidth  = screen.width;
    //   devHeight = screen.height;
    // });
    // window.addEventListener('orientationchange', function () {
    //   if (devWidth < 768 && (window.orientation === 90 || window.orientation == -90)) {
    //     document.body.style.width = devWidth + 'px';
    //     document.body.style.height = devHeight + 'px';
    //     document.body.style.transform = 'rotate(-90deg)';
    //     document.body.style.transformOrigin = ''+(devHeight/2)+'px '+(devHeight/2)+'px';
    //   } else {
    //     document.body.removeAttribute('style');
    //   }
    // }, true);
    // window.addEventListener('orientationchange', this.deviceOrientation);
    // this.deviceOrientation();
    // await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  }

  

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


    return (
      <Router>
        {/* <DeviceOrientation lockOrientation={'portrait'}>
        <Orientation orientation='portrait' alwaysRender={false}> */}
    	  {!isMobile &&<div className="flyout" >
          <MDBNavbar color='indigo' dark expand='md' fixed='top' scrolling>
            <MDBNavbarBrand  className='py-0 font-weight-bold'>
              <img alt='MDB React Logo' className='img-fluid' src={logo} width = '142' height = '92'/>
            </MDBNavbarBrand>
            <MDBNavbarToggler
              onClick={this.toggleCollapse('mainNavbarCollapse')}
            />

            {((this.state.currentPath.split('//')[1]).split('/')[1]) !== "" && 
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
                      <LogoutButton />
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </MDBNavItem>
              </MDBNavbarNav>
            </MDBCollapse>}
          </MDBNavbar>

          <main style={{ marginTop: '4rem' }}>
            <Routes />
          </main>

          <MDBContainer>
                    <span className={'fas fa-circle white-text fa-4x'}></span>
          </MDBContainer>  

          <MDBFooter color='indigo' className="footerPage">
            <p className='footer-copyright mb-0 py-3 text-center'>
              &copy; {new Date().getFullYear()} Copyright:
              <a href="URL"> ООО ИРЗ </a>
            </p>
          </MDBFooter>     
        </div>}






        {isMobile && <div className="flyout">         
          <main>
            <Routes />
          </main>

          <MDBContainer>
                    <span className={'fas fa-circle white-text fa-4x'}></span>
          </MDBContainer>  

          <MDBFooter color='indigo' className="footerPage">
            <p className='footer-copyright mb-0 py-3 text-center'>
              &copy; {new Date().getFullYear()} Copyright:
              <a href="URL"> ООО ИРЗ </a>
            </p>
          </MDBFooter>     
        </div>}
        {/* </Orientation>
        <Orientation orientation='landscape'>
          <div>
            <p>Please rotate your device</p>
          </div>
        </Orientation>
        </DeviceOrientation> */}
      </Router>
    );
  }
}

export default App
