import { Buffer } from "buffer";

export const setToken = (token: string) => {
  const accessToken = Buffer.from(token, "utf8").toString("base64");
  chrome.storage.sync.set({ accessToken }, () => {
    console.log("Data stored successfully");
  });
};

export const setRefreshToken = (token: string) => {
  const refreshToken = Buffer.from(token, "utf8").toString("base64");
  chrome.storage.sync.set({ refreshToken }, () => {
    console.log("refresh stored successfully");
  });
};

export const setAuthCode = (token: string) => {
  const authCode = Buffer.from(token, "utf8").toString("base64");
  chrome.storage.sync.set({ authCode }, () => {
    console.log("auth stored successfully");
  });
};

export const setUserInfo = (userInfo: any) => {
  chrome.storage.sync.set({ userInfo }, () => {
    console.log("user stored successfully");
  });
};

export const setAvisoUserInfo = (avisoUserInfo: any) => {
  chrome.storage.local.set({ avisoUserInfo }, () => {
    console.log("avisonuserInfo stored successfully");
  });
};

export const setCsrftoken = (csrftoken: string) => {
  chrome.storage.sync.set({ csrftoken }, () => {
    console.log("token stored successfully");
  });
};

export const setDeviceId = (deviceId: string) => {
  chrome.storage.sync.set({ deviceId }, () => {
    console.log("deviceid stored successfully");
  });
};
