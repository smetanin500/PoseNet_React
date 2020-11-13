import React, { Component } from 'react'
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBEdgeHeader } from 'mdbreact';
import LoginButton from "../components/login-button";



class LoginPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      IsAuthenticatedUser: false

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
                    <strong>Приветствуем вас на сайте!</strong>
                  </h3>
                  <h5 className="dark-grey-text mb-5">
                    Для авторизации или регистрации нажмите кнопку Войти
                  </h5>
                </div>
                <div className="text-center mb-3">
                   {/* <LogIn />  */}
                   <LoginButton />
                  {/* <GetUser /> */}
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