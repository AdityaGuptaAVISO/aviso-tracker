import mainfest from "../static/manifest.json";
import clientSecret from "../client_secret.json";
import { getRefreshToken, getToken, getUserInfo } from "../storage/syncGetters";
import {
  setAuthCode,
  setRefreshToken,
  setToken,
  setUserInfo,
} from "../storage/syncSetters";

export const googleSignIn = () => {
  const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
  const nonce = Math.random().toString(36).substring(2, 15);

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  const scopes = `openid email profile ${mainfest.oauth2.scopes.join(" ")}`;

  authUrl.searchParams.set("client_id", mainfest.oauth2.client_id);
  authUrl.searchParams.set("response_type", "token id_token code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  // Add the OpenID scope. Scopes allow you to access the user’s information.
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("access_type", "offline");
  // Show the consent screen after login.
  authUrl.searchParams.set("prompt", "consent");
  return new Promise<Boolean>((resolve, reject) => {
    return chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.href,
        interactive: true,
      },
      async (redirectUrl) => {
        if (redirectUrl) {
          // The ID token is in the URL hash
          const urlHash = redirectUrl.split("#")[1];
          const params = new URLSearchParams(urlHash);
          const jwt = params.get("id_token");
          const authCode = params.get("code");

          // Parse the JSON Web Token
          const base64Url = jwt.split(".")[1];
          const base64 = base64Url.replace("-", "+").replace("_", "/");
          const user = JSON.parse(atob(base64));

          const { avisoUserInfo } = await chrome.storage.sync.get(
            "avisoUserInfo"
          );
          if (avisoUserInfo?.email !== user.email) {
            return reject({
              message: `Please Sign In with this Id`,
              email: avisoUserInfo?.email,
            });
          }
          chrome.runtime.sendMessage(
            { message: "request_token", authCode },
            function (response) {
              console.log("printing token" + response);
            }
          );

          await requestTokens(authCode)
            .then(async (res: any) => {
              chrome.runtime.sendMessage(
                { message: "request_token", authCode, res, user },
                function (response) {
                  console.log("printing token" + response);
                }
              );
              await setToken(res.access_token);
              await setRefreshToken(res.refresh_token);

              await setUserInfo(user);
              await setAuthCode(authCode);
              return resolve(user);
            })
            .catch((err) => reject(err));
        }
      }
    );
  });
};

// Function to request access token and refresh token
export const requestTokens = async (code) => {
  return new Promise<Boolean>(async (resolve, reject) => {
    const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
    const url = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      code: code,
      client_id: clientSecret.web.client_id,
      client_secret: clientSecret.web.client_secret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("requestTokens:", data, response);
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token;
        const expriyTime = data.expires_in;
        const tokenType = data.token_type;

        return resolve(data);
      } else {
        throw new Error("Failed to retrieve tokens");
      }
    } catch (error) {
      console.error("Error retrieving tokens:", error);
      // Handle error
      return reject(error);
    }
  });
};

// Function to refresh the access token
export const refreshAccessToken = async () => {
  const refreshToken = await getRefreshToken();
  const url = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientSecret.web.client_id,
    client_secret: clientSecret.web.client_secret,
    grant_type: "refresh_token",
  });
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("RT", data);
      const accessToken = data.access_token;
      setToken(accessToken);
      // Update the access token in your application's authentication mechanism
      // ...

      return accessToken;
    } else {
      throw new Error("Failed to refresh access token");
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
    // Handle error
  }
};

export const getRecentSentMail = () => {
  return new Promise<any>(async (resolve, reject) => {
    const userInfo = await getUserInfo();
    console.log("UI", userInfo);
    const apiUrl = `https://www.googleapis.com/gmail/v1/users/${userInfo.email}/messages`;

    const url = new URL(apiUrl);
    url.searchParams.set("q", "in:sent");
    url.searchParams.set("maxResults", "1");
    return getToken().then((accessToken: any) => {
      return fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data?.error && Object.keys(data?.error).length > 0) {
            switch (data.error.code) {
              case 401:
                return reject(data.error);
            }
          }
          return fetchEmaildetails({ accessToken, message: data.messages[0] })
            .then((res: any) => {
              console.log(res);
              return resolve(res);
            })
            .catch((err) => {
              return reject(err);
            });
        })
        .catch((err) => {
          console.error(err);
          return reject(err);
        });
    });
  });
};

const fetchEmaildetails = ({ accessToken, message }) => {
  return new Promise<any>((resolve, reject) => {
    const apiUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`;

    return fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response: Response) => {
        console.log("t2", response);
        if (response.ok) {
          return response.json();
        }
        switch (response.status) {
          case 400:
            break;
          case 401:
            break;
          default:
            break;
        }
      })
      .then((data) => {
        return resolve(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        return reject(error);
      });
  });
};
