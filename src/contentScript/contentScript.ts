import {
  getRecentSentMail,
  refreshAccessToken,
} from "../services/oauthService";
import { getAvisoUserInfo } from "../storage/syncGetters";
import { extractGmail, getMailId, getUniqueKey } from "../utils/utils";

// let initialize: any;
// let uuid: string = "";
// let subject: string = "";
let counter: number = 0;
let timeout: number = 5000;
let sendCounter: number = 0;
const altText = "tracker";

const insertImage = async (index) => {
  const key = getUniqueKey();
  const linkElement = document.createElement("a");
  const { domain } = await chrome.storage.sync.get("domain");
  const { avisoUserInfo } = await chrome.storage.sync.get("avisoUserInfo");
  let host = domain;
  if (domain.includes("pf3-alpha") || domain.includes("pf2-alpha")) {
    host = "https://relationship-dev.aviso.com";
  } else if (domain.includes("qa")) {
    host = "https://relationship-qa.aviso.com";
  } else if (domain.includes("app-mirror")) {
    host = "https://relationship-service.aviso.com";
  } else if (domain.includes("app.aviso.com")) {
    host = "https://relationship-service.aviso.com";
  }
  const link = `${host}/relationships/pixel.png?uuid=${key}&tenant_name=${avisoUserInfo?.current_tenant}`;
  linkElement.href = link;

  const imageElement = document.createElement("img");
  imageElement.src = link;
  // imageElement.onerror = function () {
  // this.src = chrome.runtime.getURL("pixel.png");
  // };
  imageElement.alt = altText;
  imageElement.height = 20;
  imageElement.width = 20;

  const brElement = document.createElement("br");
  linkElement.appendChild(brElement);
  linkElement.appendChild(brElement);
  linkElement.appendChild(brElement);
  linkElement.appendChild(imageElement);

  getMailBody()[index].insertAdjacentElement("beforeend", linkElement);
};

const getButton = () => {
  const button = document.createElement("button");
  const imageElement = document.createElement("img");
  imageElement.src = "./AppLogo.png";

  button.appendChild(imageElement);
  return button;
};

const getMailBody = () => {
  return document.querySelectorAll(".Am.Al.editable.LW-avf.tS-tW");
};

const setMailBody = (mailBody: any, index: number) => {
  const testFrame = mailBody.querySelector(`[alt="${altText}"]`);
  if (!testFrame) {
    insertImage(index);
  }
};

const getMessageData = (message: any, name: string = "") => {
  const value: any = message.payload.headers?.find(
    (d) => d.name === name
  )?.value;
  return value ? value : "";
};

// contentScript.js
const requestMailInfo = (uuid: string, subject: string) => {
  getRecentSentMail()
    .then(async (messageInfo) => {
      if (getMessageData(messageInfo, "Subject") === subject) {
        const recipients = [];
        const messageId = getMessageData(messageInfo, "Message-ID")
          .replace("<", "")
          .replace(">", "");
        const from = extractGmail(getMessageData(messageInfo, "From"))[0];
        const to = extractGmail(getMessageData(messageInfo, "To"));
        if (getMessageData(messageInfo, "Cc")) {
          const cc = extractGmail(getMessageData(messageInfo, "Cc"));
          recipients.push(...cc);
        }
        if (getMessageData(messageInfo, "Bcc")) {
          const bcc = extractGmail(getMessageData(messageInfo, "Bcc"));
          recipients.push(...bcc);
        }
        recipients.push(...to);
        const userInfo = await getAvisoUserInfo();
        const payload = {
          eid: messageInfo.id,
          message_id: messageId,
          uuid,
          to_email: recipients,
          from_email: from,
          subject,
          current_tenant: userInfo.current_tenant,
        };

        await chrome.runtime.sendMessage(
          { message: "send_payload", payload },
          (res) => {
            console.log("bg", res);
          }
        );

        console.log("uuid", uuid, messageInfo, messageId, from, to, recipients);
      } else if (counter++ < 5) {
        setTimeout(() => {
          requestMailInfo(uuid, subject);
        }, 10000);
      }
    })
    .catch(async (err) => {
      console.log("fis", err);
      if (err.code === 401) {
        const refreshToken = await refreshAccessToken();

        console.log("printing token" + refreshToken);
        requestMailInfo(uuid, subject);
      }
    });
};

const setButtonListener = (sendButton: any, index: number) => {
  sendButton?.addEventListener("click", (eve) => {
    // Send button clicked, perform your desired action here
    console.log("send", index);
    counter = 0;

    const testFrame: any = document.querySelectorAll(`[alt="${altText}"]`);
    const uuid = testFrame[index].src.split("uuid=").pop().split("&")[0];
    const subjectField: any = document.querySelectorAll('[name="subjectbox"]');
    const subject = subjectField[index]?.value;

    setTimeout(() => {
      console.log("sent clicked");
      requestMailInfo(uuid, subject);
    }, 1000);
    console.log("Send button clicked!", eve);
  });
};

const setSendButton = () => {
  const sendButtons = document.querySelectorAll(".dC")
    ? document.querySelectorAll(".dC")
    : [];
  console.log("send:", sendButtons);
  if (sendButtons.length === 0 && sendCounter++ < 5) {
    setTimeout(() => {
      setSendButton();
    }, 1000);
  }

  // sendButtons?.forEach((sendButton: any, index: number) => {
  if (sendButtons.length > 0) {
    // sendButtonEventListener
    sendButtons.forEach(setButtonListener);
  } else {
    // setTimeout(captureSendButton, 3000); // Retry after 1 second if the send button is not found
  }
};

const init = async () => {
  timeout = 100;
  await chrome.runtime.sendMessage({ message: "validate" }, (res) => {
    console.log("bg", res);
  });
};

const showModal = () => {
  const modal = document.createElement("dialog");
  modal.setAttribute(
    "style",
    `
  height:450px;
  border: none;
  top: -19rem;
  left: 72rem;
  border-radius:20px;
  background-color:white;
  position: fixed; box-shadow: 0px 12px 48px rgba(29, 5, 64, 0.32);
  `
  );
  modal.innerHTML = `<iframe id="popup-content" style="height:100%"></iframe>
  <div style="position:absolute; top:0px; left:5px;">
  <button  id="close-button" style="padding: 8px 12px; font-size: 16px; border: none; border-radius: 50px;">x</button>
  </div>`;
  modal.id = "aviso-modal";
  document.body.appendChild(modal);
  const iframe: any = document.getElementById("popup-content");
  iframe.frameBorder = 0;
};

const singInModal = () => {
  const modal = document.createElement("dialog");
  modal.setAttribute(
    "style",
    `
  height:50px;
  width:100px;

  border: none;
  top: 0rem;
  left: 0rem;
  border-radius:20px;
  background-color:white;
  position: fixed; box-shadow: 0px 12px 48px rgba(29, 5, 64, 0.32);
  `
  );
  modal.innerHTML = `<div style="position:relative; top:0px; left:5px;">
  <button  id="aviso-close-button" style="padding: 8px 12px; font-size: 16px; border: none; border-radius: 50px;">Close</button>
  <button  id="aviso-sigin-button" style="padding: 8px 12px; font-size: 16px; border: none; border-radius: 50px;">Sign In</button>
  </div>
  `;
  modal.id = "aviso-sigin-modal";
  document.body.appendChild(modal);
  const iframe: any = document.getElementById("popup-content");
  iframe.frameBorder = 0;
};

const insertButton = () => {
  const searchBox = document.querySelector(".gb_he.gb_fe.kOOQU");
  if (!searchBox) {
    setTimeout(() => {
      insertButton();
    }, 1000);
  }
  if (searchBox) {
    const button = getButton();

    showModal();
    singInModal();
    const dialog: HTMLDialogElement | any =
      document.getElementById("aviso-modal");
    button.addEventListener("click", function () {
      // Logic for button click event goes here
      if (dialog.open) {
        dialog.close();
      } else {
        dialog.showModal();
      }
      const button: any = document.getElementById("close-button");
      button.addEventListener("click", () => {
        dialog.close();
      });
    });
    searchBox.insertAdjacentElement("afterend", button);
  }
};

window.addEventListener("click", async function (ele: any) {
  const { userInfo } = await chrome.storage.sync.get("userInfo");
  if (userInfo.email === getMailId(document.title)) {
    const clickedButton: Text = ele.target?.childNodes[0];
    if (clickedButton?.data === "Compose") {
      console.log("compose clicked");
      this.setTimeout(() => {
        const mailBody: any = getMailBody();
        mailBody.forEach(setMailBody);
        setSendButton();
      }, timeout);
    }
  }
});

window.addEventListener("load", async (ele) => {
  
  const { userInfo } = await chrome.storage.sync.get("userInfo");
  registerMessageEventListner();
  setTimeout(() => {
    if (userInfo.email === getMailId(document.title)) {
      init();
    } else {
      alert("Please do signIn with Aviso Email Tracker");
    }
  }, 1000);
});

function registerMessageEventListner() {
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    switch (request.action) {
      case "logged_in":
        alert("Please do signIn with Aviso Email Tracker");
        sendResponse({ farewell: "goodbye" });
        break;
      case "Failed":
        alert("Please do signIn with Aviso Email Tracker");
        break;
    }
  });
}

window.addEventListener("beforeunload", () => {
  console.log("unload");
});

const hashChange = async (ele: HashChangeEvent) => {
  const { userInfo } = await chrome.storage.sync.get("userInfo");
  if (userInfo.email === getMailId(document.title)) {
    if (ele.newURL.includes("compose")) {
      setSendButton();
    }
  }
};

window.addEventListener("hashchange", hashChange);
