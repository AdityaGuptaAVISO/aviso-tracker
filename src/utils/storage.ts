export const getUserInfo = () => {
    chrome.storage.sync.get(['userInfo'], (result) => {
        return result
    });
}

  