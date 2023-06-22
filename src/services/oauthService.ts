import mainfest from "../static/manifest.json";
import { getToken } from "../storage/syncGetters";
import { setToken, setUserInfo } from "../storage/syncSetters";
import { google } from "googleapis";



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
      (redirectUrl) => {
        if (redirectUrl) {
          // The ID token is in the URL hash
          const urlHash = redirectUrl.split("#")[1];
          const params = new URLSearchParams(urlHash);
          const jwt = params.get("id_token");

          // Parse the JSON Web Token
          const base64Url = jwt.split(".")[1];
          const base64 = base64Url.replace("-", "+").replace("_", "/");
          const token = JSON.parse(atob(base64));

          const accessToken = redirectUrl.match(/access_token=([^&]*)/)[1];

          setUserInfo(token);
          setToken(accessToken);
          return resolve(true);
        }
      }
    );
  });
};

export const getGAPIAccessToken = () => {
  chrome.storage.local.get(["accessToken"]).then((result) => {
    console.log("Value currently is " + result.key);
  });
};

export const getRecentSentMail = () => {
  return new Promise<any>((resolve, reject) => {
    const apiUrl =
      "https://www.googleapis.com/gmail/v1/users/manjupriya.jain@aviso.com/messages";

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
          if (data?.error&&Object.keys(data?.error).length > 0) {
            
            switch(data.error.code){
              case 401: 
                googleSignIn();
                return reject(data.error)
            }
          }
          fetchEmaildetails({ accessToken, message: data.messages[0] })
            .then((res: any) => {
              console.log(res);
              return resolve(res);
            })
            .catch((err) => {
              reject(err);
            });

        })
        .catch((err) => {
          console.error(err);
          return reject(err)
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
