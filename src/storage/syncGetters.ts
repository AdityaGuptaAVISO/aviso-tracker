import { getterTypes } from "../types";
import { Buffer } from "buffer";

export const getToken = () => {
  return new Promise<any>((resolve, reject) => {
    return chrome.storage.sync.get("accessToken", (result: any) => {
      if (result?.accessToken) {
        return resolve(
          Buffer.from(result?.accessToken, "base64").toString("utf8")
        ); // Decode the value using Base64
      } else {
        return resolve("");
      }
    });
  });
};

export const getAuthToken = () => {
  return new Promise<string>((resolve, reject) => {
    return chrome.storage.sync.get("authToken", (result: any) => {
      if (result && result?.authToken) {
        return resolve(
          Buffer.from(result?.authToken, "base64").toString("utf8")
        ); // Decode the value using Base64
      } else {
        return resolve("");
      }
    });
  });
};

export const getRefreshToken = () => {
  return new Promise<string>((resolve, reject) => {
    return chrome.storage.sync.get("refreshToken", (result: any) => {
      if (result && result?.refreshToken) {
        return resolve(
          Buffer.from(result?.refreshToken, "base64").toString("utf8")
        ); // Decode the value using Base64
      } else {
        return "";
      }
    });
  });
};

export const getAvisoUserInfo = () => {
  return new Promise<any>(async (resolve, reject) => {
    return resolve(await chrome.storage.local.get("avisoUserInfo"));
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

export const getUserInfo = () => {
  return new Promise<any>((resolve, reject) => {
    return chrome.storage.sync.get("userInfo", (result: any) => {
      if (result && result?.userInfo) {
        return resolve(result.userInfo);
      } else {
        return resolve("");
      } // Decode the value using Base64
    });
  });
};

