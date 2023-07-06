export const whoAmI = async () => {
  const { cookie } = await chrome.storage.sync.get("cookie");
  const { domain } = await chrome.storage.sync.get("domain");

  console.log("login", domain, cookie);
  let url = new URL(`${domain}/account/whoAmI`);
  return new Promise(async (resolve, reject) => {
    fetch(url, {
      headers: {
        "Access-Control-Expose-Headers": "Set-Cookie",
        Cookie: cookie,
      },
    })
      .then((res: Response) => {
        console.log("res:", res);
        if (res.ok && res.status) {
          return res.json();
        } else {
          return reject(res);
        }
      })
      .then((data: any) => {
        console.log("data:", data);
        const avisoUserInfo = {
          currentName: data.currentName,
          currentUserId: data.currentUserId,
          current_tenant: data.current_tenant,
          email: data.email,
        };
        chrome.storage.sync.set({ avisoUserInfo }, () => {
          console.log("userInfo stored successfully");
        });
        chrome.storage.sync.set({ cookie }, () => {
          console.log("cookie stored successfully");
        });
      })
      .catch((error: Error) => {
        return reject(error);
      });
  });
};
