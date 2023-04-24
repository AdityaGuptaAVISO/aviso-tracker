/* global gapi */
const API_KEY = 'AIzaSyD1YOHiErFDW0Sdad2GJkZFWroKj0HVlQo';

let user_signed_in = false;
const emailTab = 'https://mail.google.com/mail';
const scope= ['https://mail.google.com/']
// import {gapi} from "@types/gapi";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("request :");
    console.log(request);
    console.log(sender),
    sendResponse('Front the background script')
    if (request.message === 'get_access_token') {
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            console.log("access_token - "+ token);
            sendResponse({ access_token: token });
            return token
        });
        // return true;
    } else if (request.message === 'get_profile') {
        chrome.identity.getProfileUserInfo( (user_info)=> {
            console.log(user_info);
        });
    } else if (request.message === 'logout') {
        console.log(request);
        chrome.identity.removeCachedAuthToken({ token: request.token }, function() {
            console.log('logged out');
        });
    }
});

chrome.runtime.onInstalled.addListener(()=>{
    console.log("I just installed chrome extension");

    chrome.action.setBadgeText({
        text: "Aviso",
    });
})

let clientId = '36920512029-4umvf35aq3ml6vhild9bvk0uu441mrl1.apps.googleusercontent.com'
let redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`
let nonce = Math.random().toString(36).substring(2, 15)

chrome.action.onClicked.addListener(async (tab)=>{
    doSignIn()
    // if(tab.url.startsWith(emailTab)){
        // console.log("Email tab clicked",tab)
    // }
})

const doSignIn=()=>{
    // console.log('Onclicked :',tab);

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'token id_token');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    // Add the OpenID scope. Scopes allow you to access the user’s information.
    authUrl.searchParams.set('scope', 'openid profile email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.labels');
    authUrl.searchParams.set('nonce', nonce);
    // Show the consent screen after login.
    authUrl.searchParams.set('prompt', 'consent');

    chrome.identity.launchWebAuthFlow(
        {
          url: authUrl.href,
          interactive: true,
        },
        (redirectUrl) => {
          if (redirectUrl) {

            // The ID token is in the URL hash
            const urlHash = redirectUrl.split('#')[1];
            const params = new URLSearchParams(urlHash);
            const jwt = params.get('id_token');
  
            // Parse the JSON Web Token
            const base64Url = jwt.split('.')[1];
            const base64 = base64Url.replace('-', '+').replace('_', '/');
            const token = JSON.parse(atob(base64));

            const accessToken = redirectUrl.match(/access_token=([^&]*)/)[1];

            fetch('https://www.googleapis.com/gmail/v1/users/me/messages', {
            headers: {
                Authorization: 'Bearer ' + accessToken
              }
            })
            .then(response => response.json())
            .then(data => console.log(data));
            // gapi.client.setApiKey(API_KEY);
            // gapi.client.load('gmail', 'v1', function () {
            //   gapi.auth2.getAuthInstance().signIn({
            //     scope: scope
            //   }).then(function () {
            //     // Use the Gmail API to compose and send email messages
            //     // ...
            //   });
            // });
            // gapi.load('client:auth2', () => {
            //     gapi.client.init({
            //       apiKey: API_KEY,
            //       clientId: clientId,
            //       discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
            //       scope: 'https://www.googleapis.com/auth/gmail.readonly',
            //     }).then(() => {
            //     //   const authInstance = gapi.auth2.getAuthInstance();
            //     //   authInstance.signIn().then(() => {
            //     //     const currentUser = authInstance.currentUser.get();
            //     //     const idToken = currentUser.getAuthResponse().id_token;
            //     //     // Use the idToken to authenticate with your server
            //     //   });
            //     });
            //   });
            // authorize();
            console.log('token', token);
          }
        },
    );
}

function gmailAPILoaded(){
    console.log('gmail auth')
    //do stuff here
}

