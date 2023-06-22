import { getterTypes } from "../types";

export const getToken = () => {
  return new Promise<any>((resolve, reject) => {
    return chrome.storage.sync.get("accessToken", (result: any) => {
      return resolve(atob(result.accessToken)); // Decode the value using Base64
    });
  });
};

export const getAuthToken = () => {
  return new Promise<string>((resolve, reject) => {
    return chrome.storage.sync.get("authToken", (result: any) => {
      if (result && result?.authToken) {
        return resolve(atob(result.authToken)); // Decode the value using Base64
      } else {
        return resolve("");
      }
    });
  });
};

export const getAvisoUserInfo = () => {
  return new Promise<any>(async (resolve, reject) => {
    return resolve(await chrome.storage.local.get("avisoUserInfo"))
  });
};

export const getSyncStorage = (key: getterTypes) => {
  return new Promise<string>((resolve, reject) => {
    return chrome.storage.sync.get(key, (result: any) => {
      if (result && result[key]) {
        return resolve(result[key]);
      } else {
        return resolve("");
      } // Decode the value using Base64
    });
  });
};
