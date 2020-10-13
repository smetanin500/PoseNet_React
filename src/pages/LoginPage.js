import React, { Component } from 'react'
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn, MDBIcon, MDBModalFooter, MDBEdgeHeader } from 'mdbreact';
import LogIn from "../components/LogIn";

class LoginPage extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  ChangeState = nr => () => {
    this.setState({
        [nr] : !this.state[nr]
    })
  };



  render () {

    return (
      <>  
      <MDBEdgeHeader color='indigo darken-3' className='sectionPage' /> 
      <MDBContainer>
        <MDBRow center>
          <MDBCol md="6">
            <MDBCard>
              <MDBCardBody className="mx-4">
                <div className="text-center">
                  <h3 className="dark-grey-text mb-5">
                    <strong>Войти</strong>
                  </h3>
                </div>
                <div className="text-center mb-3">
                  <LogIn />
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      </>
    );
  };
}

export default LoginPage;