const API_KEY = 'AIzaSyD1YOHiErFDW0Sdad2GJkZFWroKj0HVlQo';

let user_signed_in = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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