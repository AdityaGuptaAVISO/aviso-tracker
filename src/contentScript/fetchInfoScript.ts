import { getLinkId } from "../services/backendService";
import { getRecentSentMail } from "../services/oauthService";
import { extractGmail, getUniqueKey } from "../utils/utils";

let initialize: any;
let uuid: string = "";
let subject: string = "";
let counter: number = 0;
let sendCounter: number = 0;
let sentDetails: boolean = false;

const insertImage = (index) => {
  const key = getUniqueKey();
  const linkElement = document.createElement("a");
  linkElement.href = `https://aviso-tracker.aviso.com/track/pixel.png?sh=${key}`;

  const imageElement = document.createElement("img");
  imageElement.src = `https://aviso-tracker.aviso.com/track/pixel.png?sh=${key}`;
  imageElement.alt = "aviso-tracker";

  linkElement.appendChild(imageElement);

  getMailBody()[index].insertAdjacentElement("beforeend", linkElement);
};

const getMailBody = () => {
  return document.querySelectorAll(".Am.Al.editable.LW-avf.tS-tW");
};

const setMailBody = (mailBody: any, index: number) => {
  const testFrame = mailBody.querySelector('[alt="aviso-tracker"]');
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
const requestMailInfo = () => {
  getRecentSentMail()
    .then((messageInfo) => {
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
        const payload = {
          eid: messageInfo.id,
          messageId,
          uuid,
          to: recipients,
          from,
          subject,
        };
        if (!sentDetails) {
          sentDetails = true;
          getLinkId(payload).then((res: any) => {
            console.log("Final", res);
            uuid = "";
          });
          console.log(
            "uuid",
            uuid,
            messageInfo,
            messageId,
            from,
            to,
            recipients
          );
        }
      } else if (counter++ < 5) {
        setTimeout(requestMailInfo, 1000);
      }
    })
    .catch((err) => {
      console.log("fis", err);
      if (counter++ < 5) {
        setTimeout(requestMailInfo, 1000);
      }
    });
};

if (initialize === undefined) {
  initialize = () => {
    const setComposeButton = () => {
      const composeButton: any = document.querySelector(".T-I.T-I-KE.L3");
      console.log("comp:", composeButton);
      if (!composeButton) {
        setTimeout(() => {
          setComposeButton();
        }, 10000);
      }
      // composeButtonEventListener
      composeButton?.addEventListener("click", (event: any) => {
        setTimeout(() => {
          sendCounter = 0;
          console.log("clicked");
          const mailBody: any = getMailBody();
          mailBody.forEach(setMailBody);
          setSendButton();
        }, 100);
      });
    };

    const setSendButton = () => {
      const sendButton = document.querySelector(
        'div[role="button"][data-tooltip="Send"]'
      );
      console.log("send:", sendButton);
      if (!sendButton && sendCounter++ < 5) {
        setTimeout(() => {
          setSendButton();
        }, 10000);
      }

      // sendButtons?.forEach((sendButton: any, index: number) => {
      if (sendButton) {
        // sendButtonEventListener
        sendButton?.addEventListener("click", (eve) => {
          // Send button clicked, perform your desired action here
          counter = 0;
          sentDetails = false;
          const testFrame: any = document.querySelector(
            '[alt="aviso-tracker"]'
          );
          uuid = testFrame.src.split("sh=")[1];
          const subjectField: any = document.querySelector(
            '[name="subjectbox"]'
          );
          subject = subjectField?.value;

          setTimeout(() => {
            console.log("sent clicked");
            requestMailInfo();
          }, 10000);
          console.log("Send button clicked!", eve);
        });
      } else {
        // setTimeout(captureSendButton, 3000); // Retry after 1 second if the send button is not found
      }
    };

    setComposeButton();

    setSendButton();
  };
}

initialize();
