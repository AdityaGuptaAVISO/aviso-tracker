import { getAvisoUserInfo } from "../storage/syncGetters";

export const getUniqueKey = () => {
  const currentDate = new Date().toISOString().replace(/[-:.]/g, "");
  const randomNum = Math.random().toString(36).substr(2, 9);
  return currentDate + randomNum;
  return getAvisoUserInfo().then((userInfo) => {
    const data = `${userInfo?.email ? userInfo?.email : ""}${
      userInfo?.current_tenant ? userInfo?.current_tenant : ""
    }`;

    console.log(data + currentDate);
  });
};

export const ValidateEmail = (mail: string) => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  } else if (mail.length === 0) {
    return false;
  }

  alert("You have entered an invalid email address!");
  return false;
};

export const extractGmail = (gmails: string) => {
  const emailRegex = /<([^>]+)>/;
  return gmails.split(",")?.map((gmail: string) => {
    return gmail && gmail.match(emailRegex)[1];
  });
};

// export const encryptData = (data: string, key: string): string => {
//   const encryptedData = CryptoJS.AES.encrypt(data, key).toString();
//   return encryptedData;
// };

// export const decryptData = (encryptedData: string, key: string): string => {
//   const decryptedData = CryptoJS.AES.decrypt(encryptedData, key).toString(
//     CryptoJS.enc.Utf8
//   );
//   return decryptedData;
// };
