chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  switch (request.message) {
    case "send_payload":
      sendMailInfo(request.payload)
        .then((res) => {
          sendResponse({ message: "success", payload: res });
        })
        .catch((err) => {
          sendResponse({ message: "failed", payload: err });
        });
      break;
    case "validate":
      const { cookie } = await chrome.storage.sync.get("cookie");
      const { domain }: any = await chrome.storage.sync.get("domain");

      await whoAmI(domain, cookie)
        .then((res) => {
          sendResponse({ success: true });
        })
        .catch((err) => {
          sendResponse({ message: "failed", payload: err });
        });
      break;
  }
});

const whoAmI = (domain, cookie) => {
  let url = new URL(`${domain}/account/whoAmI`);

  return new Promise(async (resolve, reject) => {
    fetch(url, {
      headers: {
        "Access-Control-Expose-Headers": "Set-Cookie",
        Cookie: cookie,
      },
    })
      .then(async (res: Response) => {
        if (res.ok && res.status) {
          return res.json();
        } else {
          if (res.status >= 300 || res.status < 500) {
            await chrome.storage.sync.remove("cookie");
            await chrome.storage.sync.remove("avisoUserInfo");
            chrome.storage.sync.set({ isSignedIn: false }, () => {
              console.log("isSignedIn the cookies");
            });
            let message = "Failed to login";
            switch (res.status) {
              case 401:
                message = "Please verify login";
                break;
              case 430:
                message =
                  "Please enter the validation code to continue. Check your email.";
                break;
              case 400:
                message =
                  "Something went wrong. Please quit the app and re-launch again.";
                break;
            }
            chrome.runtime.sendMessage(
              { action: "Failed", error: { message } },
              function (response) {
                console.log("Response from content script:", response);
              }
            );
            return reject(res);
          }
        }
      })
      .then((data: any) => {
        if (data?.current_tenant === "administrative.domain") {
          chrome.runtime.sendMessage(
            { action: "Failed", error: { message: "Please switch to tenant" } },
            function (res) {
              console.log("Response from content script:", res);
            }
          );
          return reject(data);
        }
        const avisoUserInfo = {
          currentName: data.currentName,
          currentUserId: data.currentUserId,
          current_tenant: data.current_tenant,
          email: data.email,
        };
        chrome.storage.sync.set({ isSignedIn: true }, () => {
          console.log("isSignedIn stored successfully");
        });
        chrome.storage.sync.set({ avisoUserInfo }, () => {
          console.log("userInfo stored successfully");
        });
        chrome.storage.sync.set({ cookie }, () => {
          console.log("cookie stored successfully");
        });
        chrome.runtime.sendMessage(
          { action: "logged_in", avisoUserInfo },
          function (response) {
            console.log("Response from content script:", response);
          }
        );
        return resolve(data);
      })
      .catch((err: Error) => {
        return reject(err);
      });
  });
};

chrome.runtime.onInstalled.addListener((details) => {
  console.log("I just installed chrome extension");

  chrome.action.setBadgeText({
    text: "Aviso",
  });

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.setUninstallURL("");
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  let { domain }: any = await chrome.storage.sync.get("domain");

  if (tab.url && domain && tab.url.includes(domain.split("://")[1])) {
    // Check cookieStoreId based on the tabId
    if (`${tab.url.split(".com")[0]}.com` !== domain) {
      domain = `${tab.url.split(".com")[0]}.com`;
      chrome.storage.sync.set({ domain }, async () => {
        const userInfo = await chrome.storage.sync.get("userInfo");
      });
    }
    if (changeInfo.status === "complete") {
      const { cookie } = await chrome.storage.sync.get("cookie");
      if (!cookie && domain !== "") {
        chrome.cookies.getAll({ url: domain }, function (cookies) {
          // Handle the captured cookies here or send them to the content script

          const cookie = Object.entries(cookies)
            .map(([name, value]) => {
              return `${value.name}=${value.value}`;
            })
            .join("; ");

          (async () => {
            const res = await whoAmI(domain, cookie);
            const [tab] = await chrome.tabs.query({
              active: true,
              lastFocusedWindow: true,
            });
            const response = await chrome.tabs.sendMessage(tab.id, {
              message: "logged_in",
              res,
            });

            console.log(response);
          })();
        });
      }
    }
  }
});

const sendMailInfo = async (payload) => {
  const { domain } = await chrome.storage.sync.get("domain");
  const { cookie } = await chrome.storage.sync.get("cookie");
  return await fetch(`${domain}/relationships/email_tracker`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Access-Control-Expose-Headers": "Set-Cookie",
      Cookie: cookie,
    },
  })
    .then((res: Response) => {
      console.log("GL", res);
      if (res.ok) {
        return res.json();
      }

      switch (res.status) {
        case 401:
          chrome.storage.sync.remove("cookie");
          break;
          case 500:
            
            break;
      }
    })
    .then((data: any) => {
      console.log("data:", data);
      return data;
      // return resolve(data);
    })
    .catch((err) => {
      chrome.runtime.sendMessage(
        { action: "Failed", err },
        function (response) {
          console.log("Response from content script:", response);
        }
      );
      console.warn(err);
    });
};
