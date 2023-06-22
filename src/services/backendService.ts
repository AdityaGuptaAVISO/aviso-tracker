export const getLinkId = (payload) => {
  return new Promise(async (resolve, reject) => {
    const response: any = await fetch(
      "https://pf3-alpha.aviso.com/relationships/email_tracker",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    ).catch((err) => reject(err));

    const data = await response?.json();
    return resolve(data);
  });
};

export const emailValidater = (username) => {
  return new Promise(async (resolve, reject) => {
    fetch(
      `https://app-mirror.aviso.com/account/onsamlsso??user_name=${username}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        resolve(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        reject(error);
      });
  });
};

export const doLogin = (payload) => {
  return new Promise(async (resolve, reject) => {
    const response: any = await fetch(
      "https://app-mirror.aviso.com//account/login/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    ).catch((err) => reject(err));

    const data = await response?.json();
    return resolve(data);
  });
};
