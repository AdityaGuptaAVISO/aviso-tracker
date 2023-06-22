import React, { ChangeEvent, useEffect, useState } from "react";

import "./popup.scss";

import { googleSignIn } from "../services/oauthService";
import ReactModal from "react-modal";
import { getAvisoUserInfo, getSyncStorage } from "../storage/syncGetters";
import {
  validateAuthentication,
  checkForSSO,
  userLogin,
  whoAmI,
  logoutUser,
} from "../services/authServices";
import { ValidateEmail } from "../utils/utils";

interface PopupProps {}
interface PopupState {
  token: string;
  csrfToken: string;
  isvalid: boolean;
  ssoFlag: boolean;
  isModalOpen: boolean;
  userName: string;
  emailError: string;
  loginError: string;
  password: string;
  userInfo: any;
}
class Popup extends React.Component<PopupProps, PopupState> {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      csrfToken: "",
      isvalid: false,
      ssoFlag: false,
      isModalOpen: false,
      userName: "",
      emailError: "",
      loginError: "",
      password: "",
      userInfo: undefined,
    };

    this.init();
  }

  componentDidMount() {
    console.log("Component mounted", this.state.userInfo);
    whoAmI();
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log('Component updated');
    if (prevState.userInfo !== this.state.userInfo) {
      console.log("Counter value changed");
      this.render()
    }
  }

  componentWillUnmount() {
    console.log("Component will unmount");
  }

  init() {
    getAvisoUserInfo()
      .then(({ avisoUserInfo }) => {
        console.log("userInfo", avisoUserInfo);
        if (!avisoUserInfo?.email) {
          validateAuthentication().then((data: any) => {
            console.log("d1", data);
            if (data?.csrf_token) {
              this.setState({ csrfToken: data.csrf_token });
            } else if (data?.email) {
              this.setState({ userInfo: data });
            }
          });
        } else {
          this.setState({ userInfo: avisoUserInfo });
        }
      })
      .catch((err) => console.log(err));
  }

  onUserNameChanged = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ userName: e.target.value, emailError: "" }, () => {
      if (e.target.value.length > 0 && this.state.password.length > 0) {
        this.setState({ isvalid: true });
      } else {
        this.setState({ isvalid: false });
      }
    });
  };

  onPasswordChanged = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ password: e.target.value }, () => {
      if (this.state.userName.length > 0 && e.target.value.length > 0) {
        this.setState({ isvalid: true });
      } else {
        this.setState({ isvalid: false });
      }
    });
  };

  loginEmailValidate = () => {
    if (ValidateEmail(this.state.userName)) {
      checkForSSO(this.state.userName)
        .then((data: any) => {
          if (data["_error"]) {
            this.setState({ emailError: data.message });
          } else {
            this.setState({ ssoFlag: data.samlsso });
          }
        })
        .catch((err) => console.error(err));
    } else {
      this.setState({ emailError: "Provide valid Username" });
    }
  };

  loginValidate = async () => {
    const csrfmiddlewaretoken = await getSyncStorage("csrftoken");
    userLogin({
      username: this.state.userName,
      password: this.state.password,
      csrfmiddlewaretoken: this.state.csrfToken,
    })
      .then((res) => {
        this.setState({userInfo:res})
        // googleSignIn();
      })
      .catch((err) => this.setState({ loginError: err }));
  };

  render() {
    const renderErrorMessage = (error: string) => (
      <div className="error">{error ? "* " + error : ""}</div>
    );

    const renderLoginPage = () => {
      return (
        <div className="warning">
          <div className="warning-content">
            <input
              className="warning-input-box"
              placeholder="Username (Email)"
              value={this.state.userName}
              onChange={this.onUserNameChanged}
              onBlur={this.loginEmailValidate}
            ></input>
            {renderErrorMessage(this.state.emailError)}
            <input
              type="password"
              className="warning-input-box"
              placeholder="Password"
              value={this.state.password}
              onChange={this.onPasswordChanged}
            ></input>
            {renderErrorMessage(this.state.loginError)}
            <button
              className={"button " + (this.state.isvalid ? "" : "disabled")}
              onClick={() => this.loginValidate()}
            >
              SIGN IN
            </button>
          </div>
        </div>
      );
    };

    const renderInfoPage = () => {
      return (
        <div className="content">
          <div className="card">
            <label className="card-title">Name</label>
            <label className="card-value">{this.state.userInfo.name}</label>
          </div>
          <div className="card">
            <label className="card-title">Email</label>
            <label className="card-value">{this.state.userInfo.email}</label>
          </div>
          <div className="card">
            <label className="card-title">Tenant</label>
            <label className="card-value">
              {this.state.userInfo?.current_tenant
                ? this.state.userInfo?.current_tenant
                : ""}
            </label>
          </div>
        </div>
      );
    };

    return (
      <div className="aviso-tracker-popup">
        <div className="header">
          <img className="header-icon" src="./logo.png" />
          <h2> Aviso Mail Tracker</h2>
        </div>
        {this.state.userInfo?.email ? renderInfoPage() : renderLoginPage()}
        <button
          onClick={() => {
            logoutUser();
            this.setState({ userInfo: undefined });
            whoAmI();
          }}
        >
          Test
        </button>
      </div>
    );
  }
}

export default Popup;
