import mainfest from '../static/manifest.json';


const refreshToken=async (refreshToken)=>{
    const response= await fetch('https://auth2')
}

export const googleSignIn=()=>{
    

    const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`
    const nonce = Math.random().toString(36).substring(2, 15)

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    const scopes = `openid email profile ${mainfest.oauth2.scopes.join(' ')}`

    authUrl.searchParams.set('client_id', mainfest.oauth2.client_id);
    authUrl.searchParams.set('response_type', 'token id_token');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    // Add the OpenID scope. Scopes allow you to access the user’s information.
    authUrl.searchParams.set('scope', scopes);
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
            chrome.runtime.sendMessage({message: 'get_access_token',accessToken}, (response)=> {
                console.log("printing token" +response);
            });
            chrome.storage.sync.set({ accessToken }, () => {
              console.log('Value is set to ' + accessToken);
            });

            chrome.storage.sync.set({userInfo: token}, () => {
              console.log('Value is set to ' + accessToken);
            });

            fetch('https://www.googleapis.com/gmail/v1/users/me/messages', {
            headers: {
                Authorization: 'Bearer ' + accessToken
              }
            })
            .then(response => response.json())
            .then(data => console.log(data));
            
          }
        },
    );
}