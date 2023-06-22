import { getAuthToken, getSyncStorage } from "../storage/syncGetters";
import {
  setAvisoUserInfo,
  setCsrftoken,
  setDeviceId,
  setUserInfo,
} from "../storage/syncSetters";
import { googleSignIn } from "./oauthService";

export const APP_DOMAIN = "https://pf3-alpha.aviso.com";
/**
 * If the session already exists (checked via cookie),
 * a 200 OK is returned.
 * Other wise, a 401 is returned with csrf_token in
 * the response body.
 */

export const createAuthorizationHeader = () => {
  return new Promise(async (resolve, reject) => {
    const csrfToken: string = await getSyncStorage("csrftoken");
    const deviceId: string = await getSyncStorage("deviceId");
    const authToken: string = await getAuthToken();
    const headers: Headers = new Headers();

    headers.append("Accept", "application/json, text/plain, */*");
    headers.append("X_FORWARDED_PROTO", "https");
    headers.append("Content-Type", "application/json");
    // headers.append("csrftoken", csrfToken);
    // headers.append("x-g-device-id", deviceId); // required for all session
    headers.append(
      "cookie",
      `	x-g-device-id=${deviceId}; csrftoken=${csrfToken}; sessionid=gjrakc16mfc87ruzqxmptcidw1qhbfgs; x-g-tenant=venafi_frp.com`
    ); // required for all session

    // if (prior_session) {
    // headers.set("device-id", deviceId); // required for aviso SSO session
    // headers.set("authorization-token", authToken);
    // }
    console.log("caH", csrfToken);
    return resolve({
      headers,
      withCredentials: true,
    });
  });
};

export const validateAuthentication = () => {
  return createAuthorizationHeader()
    .then((options: any) => {
      options["observe"] = "response";
      let url = APP_DOMAIN + "/napi/m";
      return new Promise((resolve, reject) => {
        fetch(url, options)
          .then((response) => {
            console.log("d2", response);
            if (response.ok) {
              return response.json();
            }
            switch (response.status) {
              case 503:
                alert("503 Service Temporarily Unavailable");
                break;
              case 401:
                console.log("response:", response);
                return response.json();
                break;
            }
          })
          .then((data) => {
            console.log("d3", data);
            if (data?.csrf_token) {
              setCsrftoken(data.csrf_token);
              if (data["x-g-device-id"]) {
                setDeviceId(data["x-g-device-id"]);
              }
              return resolve(data);
            } else if (data?.username) {
              setAvisoUserInfo(data);
              googleSignIn();
              return resolve(data);
            }
          })
          .catch((err) => {
            // This validation error will be thrown when the user is NOT AUTHENTICVATED,
            // The server responds with a ERR RESPONSE object that contains a fresh csrfToken
            // This csrfToken is then set in NativeStorage and then used to protect against authenticated routes
            let hasAuthorized = false;
            console.log("d4", err);
            switch (err.status) {
              case 401:
                return reject(new Error(err));
                break;
            }
            return reject(hasAuthorized);
          });
      });
    })
    .catch((err) => console.log(err));
};

/** @todo remove credentials dependancy */
export const checkForSSO = (userName: string) => {
  return createAuthorizationHeader().then((options: any) => {
    options["observe"] = "response";
    let url = new URL(`${APP_DOMAIN}/napi/m/account/onsamlsso`);
    url.searchParams.set("user_name", userName);

    return new Promise((resolve, reject) => {
      fetch(url, options)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return resolve(data);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  });
};

export const userLogin = (payload: any) => {
  return createAuthorizationHeader().then((options: any) => {
    options["observe"] = "response";
    options["method"] = "POST";

    let url = new URL(`${APP_DOMAIN}/napi/m/login`);
    return new Promise(async (resolve, reject) => {
      await getSyncStorage("deviceId")
        .then((data) => (payload["x-g-device-id"] = data))
        .catch((err) => console.log("Error:", err));
      options["body"] = JSON.stringify(payload);
      fetch(url, options)
        .then((res: Response) => {
          
          if (res.ok && res.status) {
            return res.json();
          } else {
            const loginFailedMsg =
              "Please verify that the username and password are correct.";

            const ipValidationMsg =
              "Please enter the validation code to continue. Check your email.";
            const badRequestMsg =
              "Something went wrong. Please quit the app and re-launch again.";

            switch (res.status) {
              case 401:
                throw new Error(loginFailedMsg);
              case 430:
                throw new Error(ipValidationMsg);
              case 403:
                validateAuthentication();
                throw new Error(badRequestMsg);
              case 400:
                throw new Error(badRequestMsg);
            }
          }
        })
        .then((data: any) => {
          // Process the response data
          setCookie(data,payload);
          googleSignIn().then((res) => {
            if (res) setAvisoUserInfo(data);
            return resolve(data);
          });
        })
        .catch((err: Error) => {
          return reject(err);
        });
    });
  });
};

const setCookie = (userInfo: any,data) => {
  console.log("coo", data);

  chrome.cookies.set(
    {
      url: APP_DOMAIN,
      name: "aviso-tracker",
      value: `csrftoken=${data.csrf_token};`,
    },
    (cookie) => {
      console.log("Cookie set:", cookie);
    }
  );
};

export const whoAmI = () => {
  return createAuthorizationHeader().then((options: any) => {
    console.log("whoAmI:", options);
    let url = new URL(
      `https://qa-pf-alpha2.aviso.com/fm_svc/mobile_schema?period=2023Q2`
    );

    return new Promise(async (resolve, reject) => {
      fetch(url, options)
        .then((res: Response) => {
          console.log("res:", res);
          if (res.ok && res.status) {
            return res.json();
          } else {
            const loginFailedMsg =
              "Please verify that the username and password are correct.";

            const ipValidationMsg =
              "Please enter the validation code to continue. Check your email.";
            const badRequestMsg =
              "Something went wrong. Please quit the app and re-launch again.";

            switch (res.status) {
              case 401:
                throw new Error(loginFailedMsg);
              case 430:
                throw new Error(ipValidationMsg);
              case 403:
                validateAuthentication();
                throw new Error(badRequestMsg);
              case 400:
                throw new Error(badRequestMsg);
            }
          }
        })
        .then((data: any) => {
          // Process the response data
          // googleSignIn().then((res) => {
          //   if (res) setAvisoUserInfo(data);
          //   return resolve(data);
          // });
        })
        .catch((err: Error) => {
          return reject(err);
        });
    });
  });
};

export const logoutUser = () => {
  return createAuthorizationHeader().then((options: any) => {
    options["observe"] = "response";
    let url = APP_DOMAIN + "/napi/m/auth/logout";

    return new Promise((resolve, reject) => {
      fetch(url, options)
        .then((res) => {
          chrome.storage.local.clear();
          chrome.storage.sync.clear();
          
          return res.json();
        })
        .then((data: any) => {
          console.log("logout", data);
        })
        .catch((err) => {
          if (err && err.status) {
            switch (err.status) {
              case 401:
                break;
            }
          }
          reject(new Error(err));
        });
    });
  });
};
