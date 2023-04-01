window.onload = (event) => {
    console.log('page is fully loaded');
};

chrome.runtime.onMessage.addListener((res)=>{
    console.log('page is on message')
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'email.compose') {
      // Do something when the email compose event is triggered
    }
});
  