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
  return false;
};

export const extractGmail = (gmails: string) => {
  if (ValidateEmail(gmails)) {
    return gmails;
  }

  const emailRegex = /<([^>]+)>/;
  return gmails.split(",")?.map((gmail: string) => {
    return gmail && gmail.match(emailRegex)[1];
  });
};

export const getMailId = (data: string) => {
  // Regular expression pattern to extract the email ID
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})/;

  // Extract the email ID using match()
  const emailMatch = data.match(emailRegex);

  // Check if a match is found and retrieve the email ID
  return emailMatch ? emailMatch[0] : null;
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
