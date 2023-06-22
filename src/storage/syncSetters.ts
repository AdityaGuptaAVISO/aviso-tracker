export const setToken = (token: string) => {
  const accessToken = window.btoa(token);
  chrome.storage.sync.set({ accessToken }, () => {
    console.log("Data stored successfully");
  });
};

export const setUserInfo = (userInfo: any) => {
  chrome.storage.sync.set({ userInfo }, () => {
  });
};

export const setAvisoUserInfo = (avisoUserInfo:any) => {
  chrome.storage.local.set({ avisoUserInfo }, () => {
  });
}

export const setCsrftoken = (csrftoken: string) => {
  chrome.storage.sync.set({ csrftoken }, () => {
  });
};

export const setDeviceId = (deviceId: string) => {
  chrome.storage.sync.set({ deviceId }, () => {
  });
};