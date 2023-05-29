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
    } else if (request.message=== 'recevier_id') {
        debugger;
        console.log('message:',request.message,'\n body:',request.body);

    } else if (request.action === 'getActiveTab') {
        // Use the chrome.tabs API to get information about the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          // Send the result back to the content script
          console.log(request);
          sendResponse({ tab: tabs[0] });
        });
        // Return true to indicate that we want to send a response asynchronously
        return true;
    } 
    
});

chrome.runtime.onInstalled.addListener((details)=>{
    console.log("I just installed chrome extension");

    // chrome.action.setBadgeText({
    //     text: "Aviso",
    // });

    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.runtime.setUninstallURL('');
    }
})

let injectScript: boolean = false;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) =>{
    if (tab.url && tab.url.startsWith("https://mail.google.com/") && tab.url.includes("compose") ) {

        if(changeInfo.status === 'complete'){
            
           //excuting contentScript
            chrome.scripting.executeScript({
                target: {tabId} ,
                files: ['fetchInfoScript.js'],
            }).then(re=>{
                console.log('test',re);
                injectScript= true
            });
            
        }
    }

   
});