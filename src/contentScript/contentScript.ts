

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     // Do something here when a tab is updated
    
//     console.log('Tab updated:', tabId, changeInfo, tab);
    
//     if (tab.url && tab.url.startsWith("https://mail.google.com/mail/u/") && tab.url.includes("compose")) {
//         debugger;
        
//         if (changeInfo.status === 'complete') {
//             chrome.tabs.sendMessage(tabId, {type: 'getDoc'}, function (doc) {
//               console.log(doc);
//             });
//         }
//         // Find the message body textarea element
//                 // Get the compose window
        
//     }
   
// });