import React, { ChangeEvent } from "react";

import "./popup.scss";

import { logoutUser } from "../services/authServices";
import { googleSignIn } from "../services/oauthService";

interface PopupProps {}
interface PopupState {
  isvalid: boolean;
  userName: string;
  customDomain: string;
  error: any | undefined;
  userInfo: any;
  gmailUserInfo: any;
  showLoader: boolean;
}
class Popup extends React.Component<PopupProps, PopupState> {
  constructor(props) {
    super(props);
    this.state = {
      isvalid: false,
      userName: "",
      customDomain: "",
      error: undefined,
      userInfo: undefined,
      gmailUserInfo: undefined,
      showLoader: false,
    };

    this.init();
  }

  componentDidMount() {
    const self = this;
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      switch (request.action) {
        case "logged_in":
          if (request?.avisoUserInfo) {
            self.setState({
              showLoader: false,
              error: undefined,
              userInfo: request?.avisoUserInfo,
            });
          }
          sendResponse({ farewell: "goodbye" });
          break;
        case "Failed":
          self.setState({ showLoader: false, error: request.error });
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log('Component updated');
    if (prevState.userInfo !== this.state.userInfo) {
      this.render();
    }
    if (prevState.gmailUserInfo !== this.state.gmailUserInfo) {
      this.render();
    }
  }

  componentWillUnmount() {
    console.log("Component will unmount");
  }

  async init() {
    const { avisoUserInfo } = await chrome.storage.sync.get("avisoUserInfo");
    const { userInfo } = await chrome.storage.sync.get("userInfo");
    console.log("popup", avisoUserInfo, userInfo);
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
    this.setState({ showLoader: true, error: undefined });
    const domain = this.state.customDomain.includes("https://")
      ? this.state.customDomain
      : `https://${this.state.customDomain}`;
    if (domain.includes("https://")) {
      chrome.storage.sync.set({ domain }, async () => {
        chrome.tabs.create({ url: domain });
        console.log("domain set successfully");
      });
    }
  };

  handleGoogleSignIn = async () => {
    this.setState({ showLoader: true, error: undefined });
    await googleSignIn()
      .then((res) => {
        console.log(res);

        this.setState({
          showLoader: false,
          error: undefined,
          gmailUserInfo: res,
        });
        chrome.tabs.reload();
      })
      .catch((err) => {
        this.setState({ showLoader: false, error: err });
      });
  };

  render() {
    const renderErrorMessage = (error: any) => (
      <div className="error">
        {error?.message ? `* ${error?.message} ` : ""}
        <b>{error?.email ? error?.email : ""}</b>
      </div>
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
            <label className="custom-domain-hint">
              https://domain.app.aviso.com
            </label>
            {renderErrorMessage(this.state?.error)}
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
          <div className="profile-container">
            <img
              className="profile-image"
              src={this.state.gmailUserInfo.picture}
            />
          </div>
          <div className="card">
            <label className="card-title">Name</label>
            <label className="card-value">
              {this.state.userInfo?.currentName
                ? this.state.userInfo?.currentName
                : this.state.gmailUserInfo.name}
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
            {renderErrorMessage(this.state?.error)}
            <div className="google-btn" onClick={this.handleGoogleSignIn}>
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
        {this.state.showLoader && (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        )}
        <div className="header">
          <img className="header-icon" src="./logo.png" />
          <h1> Aviso Mail Tracker</h1>
        </div>
        {!this.state.userInfo?.email && renderCustomBrowser()}
        {this.state.userInfo?.email && renderInfoPage()}
        {this.state.userInfo?.email &&
          !this.state.gmailUserInfo?.email &&
          renderGoogleSignIn()}
        {this.state.gmailUserInfo?.email && this.state.userInfo?.email && (
          <button
            className="button"
            onClick={() => {
              logoutUser();
              this.setState({ userInfo: undefined });
              this.setState({ gmailUserInfo: undefined });
            }}
          >
            Logout
          </button>
        )}
      </div>
    );
  }
}

export default Popup;
