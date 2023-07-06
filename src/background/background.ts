chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("request :");
  console.log(request);
  console.log(sender);
  console.log("sendResponse", sendResponse);
  if (request.message === "send_payload") {
    console.log("bg", request.payload);
    sendMailInfo(request.payload);
  } else if (request.message === "validate") {
    const { cookie } = await chrome.storage.sync.get("cookie");
    const { domain }: any = await chrome.storage.sync.get("domain");

    const response = await whoAmI(domain, cookie);

    sendResponse(response);
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
        console.log("res:", res);
        if (res.ok && res.status) {
          return res.json();
        } else {
          if (res.status >= 400) {
            await chrome.storage.sync.remove("cookie");
            await chrome.storage.sync.remove("avisoUserInfo");
            chrome.storage.sync.set({ isSignedIn: false }, () => {
              console.log("clear the cookies");
            });
            return reject(res);
          }
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
          "hccaghdflcdhmnenedpopanbdjjnmden",
          { message: "Hello from background!", data },
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
  const { domain }: any = await chrome.storage.sync.get("domain");
  if (tab.url && tab.url.startsWith(domain)) {
    // Check cookieStoreId based on the tabId
    if (changeInfo.status === "complete") {
      const { cookie } = await chrome.storage.sync.get("cookie");
      if (!cookie && domain !== "") {
        chrome.cookies.getAll({ url: domain }, function (cookies) {
          // Handle the captured cookies here or send them to the content script
          console.log("CK", cookies);
          const cookie = Object.entries(cookies)
            .map(([name, value]) => {
              return `${value.name}=${value.value}`;
            })
            .join("; ");

          // chrome.runtime.sendMessage({ cookie });
          whoAmI(domain, cookie);
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
      }
    })
    .then((data: any) => {
      console.log("data:", data);
      return data;
      // return resolve(data);
    })
    .catch((err) => {
      console.warn(err);
    });
};
