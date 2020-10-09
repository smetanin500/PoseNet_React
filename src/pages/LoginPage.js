import React, { Component } from 'react'
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn, MDBIcon, MDBModalFooter, MDBEdgeHeader } from 'mdbreact';

class LoginPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      registerUser: false,
      forgetPassword: false
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
      {!this.state.registerUser && !this.state.forgetPassword && <MDBContainer>
        <MDBRow center>
          <MDBCol md="6">
            <MDBCard>
              <MDBCardBody className="mx-4">
                <div className="text-center">
                  <h3 className="dark-grey-text mb-5">
                    <strong>Войти</strong>
                  </h3>
                </div>
                <MDBInput
                  label="Введите email"
                  group
                  type="email"
                  validate
                  error="wrong"
                  success="right"
                />
                <MDBInput
                  label="Введите пароль"
                  group
                  type="password"
                  validate
                  containerClass="mb-0"
                />
                <p className="font-small blue-text d-flex justify-content-end pb-3">
                  Забыли
                  <a href="#!" className="blue-text ml-1" onClick = {this.ChangeState("forgetPassword")}>

                    пароль?
                  </a>
                </p>
                <div className="text-center mb-3">
                  <MDBBtn
                    type="button"
                    gradient="blue"
                    rounded
                    className="btn-block z-depth-1a"
                  >
                    Войти
                  </MDBBtn>
                </div>
              </MDBCardBody>
              <MDBModalFooter className="mx-5 pt-3 mb-1">
                <p className="font-small grey-text d-flex justify-content-end">
                  Не зарегестрированы?
                  <a href="#!" className="blue-text ml-1" onClick = {this.ChangeState("registerUser")}>

                    Регистрация
                  </a>
                </p>
              </MDBModalFooter>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>}


      {this.state.registerUser && <MDBContainer>
        <MDBRow center>
          <MDBCol md="6">
            <MDBCard>
              <MDBCardBody>
                <form>
                  <p className="h4 text-center py-4">Регистрация</p>
                  <div className="grey-text">
                    <MDBInput
                      label="Введите ваше имя"
                      icon="user"
                      group
                      required
                      type="text"
                      validate
                      error="wrong"
                      success="right"
                    />
                    <MDBInput
                      label="Введите ваш email"
                      icon="envelope"
                      group
                      required
                      type="email"
                      validate
                      error="wrong"
                      success="right"
                    />
                    <MDBInput
                      label="Введите пароль"
                      icon="lock"
                      group
                      required
                      type="password"
                      validate
                    />
                    <MDBInput
                      label="Подтвердите пароль"
                      icon="lock"
                      group
                      required
                      type="password"
                      validate
                    />
                  </div>
                  <div className="text-center mb-3">
                    <MDBBtn gradient="blue" type="submit">
                      Зарегестрироваться
                    </MDBBtn>
                  </div>
                  <p className='text-center'>
                  <a href="#!" className="red-text ml-1" onClick = {this.ChangeState("registerUser")}>

                    Отмена
                  </a>
                </p>
                </form>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>}

      {this.state.forgetPassword && <MDBContainer>
        <MDBRow center>
          <MDBCol md="6">
            <MDBCard>
              <MDBCardBody>
                <form>
                  <p className="h4 text-center py-4">Смена пароля</p>
                  <div className="grey-text">
                    <MDBInput
                      label="Введите ваш email"
                      icon="envelope"
                      group
                      required
                      type="email"
                      validate
                      error="wrong"
                      success="right"
                    />
                    <MDBInput
                      label="Введите новый пароль"
                      icon="lock"
                      group
                      required
                      type="password"
                      validate
                    />
                    <MDBInput
                      label="Подтвердите пароль"
                      icon="lock"
                      group
                      required
                      type="password"
                      validate
                    />
                  </div>
                  <div className="text-center mb-3">
                    <MDBBtn gradient="blue" type="submit">
                      Сменить пароль
                    </MDBBtn>
                  </div>
                  <p className='text-center'>
                  <a href="#!" className="red-text ml-1" onClick = {this.ChangeState("forgetPassword")}>

                    Отмена
                  </a>
                </p>
                </form>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>}
      </>
    );
  };
}

export default LoginPage;