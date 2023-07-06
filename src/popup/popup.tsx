import React, { ChangeEvent } from "react";

import "./popup.scss";

import { logoutUser } from "../services/authServices";
import { googleSignIn } from "../services/oauthService";

interface PopupProps {}
interface PopupState {
  token: string;
  csrfToken: string;
  isvalid: boolean;
  ssoFlag: boolean;
  userName: string;
  customDomain: string;
  emailError: string;
  loginError: string;
  password: string;
  userInfo: any;
  gmailUserInfo: any;
}
class Popup extends React.Component<PopupProps, PopupState> {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      csrfToken: "",
      isvalid: false,
      ssoFlag: false,
      userName: "",
      customDomain: "",
      emailError: "",
      loginError: "",
      password: "",
      userInfo: undefined,
      gmailUserInfo: undefined,
    };

    this.init();
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    // console.log('Component updated');
    if (prevState.userInfo !== this.state.userInfo) {
      this.render();
    }
  }

  componentWillUnmount() {
    console.log("Component will unmount");
  }

  async init() {
    const { avisoUserInfo } = await chrome.storage.sync.get("avisoUserInfo");
    const { userInfo } = await chrome.storage.sync.get("userInfo");
    console.log("popup", avisoUserInfo);
    this.setState({ userInfo: avisoUserInfo, gmailUserInfo: userInfo });
  }

  onDomain = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ customDomain: e.target.value }, () => {
      if (this.state.customDomain.length > 0 && e.target.value.length > 0) {
        this.setState({ isvalid: true });
      } else {
        this.setState({ isvalid: false });
      }
    });
  };

  setDomain = () => {
    chrome.tabs.create({ url: this.state.customDomain });
    const domain = this.state.customDomain.includes("https://")
      ? this.state.customDomain
      : `https://${this.state.customDomain}`;
    if (domain.includes("https://")) {
      chrome.storage.sync.set({ domain }, async () => {
        const userInfo = await chrome.storage.sync.get("userInfo");
      });
    }
  };

  render() {
    const renderErrorMessage = (error: string) => (
      <div className="error">{error ? "* " + error : ""}</div>
    );

    const renderCustomBrowser = () => {
      return (
        <div className="warning">
          <div className="warning-content">
            <input
              className="warning-input-box"
              placeholder="Custom Domain"
              value={this.state.customDomain}
              onChange={this.onDomain}
            ></input>
            <label className="custom-domain-hint">domain.app.aviso.com</label>
            {renderErrorMessage(this.state.emailError)}
            <button
              className={"button " + (this.state.isvalid ? "" : "disabled")}
              onClick={() => this.setDomain()}
            >
              Continue
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
            <label className="card-value">
              {this.state.userInfo.currentName}
            </label>
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

    const renderGoogleSignIn = () => {
      return (
        <div className="warning">
          <div className="warning-content">
            {renderErrorMessage(this.state.emailError)}
            <div
              className="google-btn"
              onClick={() => {
                googleSignIn()
                  .then()
                  .catch((err) => {
                    this.setState({ emailError: err });
                  });
              }}
            >
              <div className="google-icon-wrapper">
                <img
                  className="google-icon"
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                />
              </div>
              <p className="btn-text">
                <b>Sign in with Google</b>
              </p>
            </div>
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
        {!this.state.userInfo?.email && renderCustomBrowser()}
        {this.state.userInfo?.email && renderInfoPage()}
        {this.state.gmailUserInfo?.email && renderGoogleSignIn()}
        <button
        className="button"
          onClick={() => {
            logoutUser();
            this.setState({ userInfo: undefined });
          }}
        >
          Logout
        </button>
      </div>
    );
  }
}

export default Popup;
