import { getLinkId } from "../utils/backendService";


let initialize:any;

if(initialize===undefined){
  function getAllRecipients() {
    // Retrieve all the email addresses in the To, Cc, and Bcc fields.
    const toInput:any = document.getElementsByClassName("afV");
    const to = toInput ? toInput.value : "";
    // const cc = ccInput ? ccInput.value : "";
    // const bcc = bccInput ? bccInput.value : "";
    // const allRecipients = to.split(",").concat(cc.split(",")).concat(bcc.split(","));
    return '';
  }
  
  function handleComposeButtonClick() {
    // Get all the recipients before sending the email.
    const allRecipients = getAllRecipients();
    console.log("All recipients:", allRecipients);
  }
  
  
  initialize = () => {
    // Add a listener to the Gmail compose button.
    
    let recipients= [];
    const recipientsField = document.querySelector('.fX.aiL');
    // const subjectField = document.querySelector('[name="subjectbox"]');
    
    var iframe:any = document.querySelector('.Am.Al.editable.LW-avf.tS-tW');
    
    if(iframe){
      iframe.addEventListener('focus', (event:any) => {
          const ls= document.querySelectorAll('.afV')
          recipients=[]
          ls.forEach(element => {
              recipients.push(element.getAttribute("data-hovercard-id")); 
          });
          const fromField:any = document.querySelector('[name="from"]')
          const subjectField:any = document.querySelector('[name="subjectbox"]');
          
          const payload= {to:recipients,from:fromField?.value,subject:subjectField?.value}
          console.log('payload:',payload)
          getLinkId(payload).then((res:any)=>{
            console.log("test",res)
            const mailbody: any = document.querySelector('[aria-label="Message Body"]')
            var imgHtml = `<img id='aviso-img' alt='aviso-tracker' src="aviso-tracker.aviso.com/track/pixel.png?sh=${res.id}" />`;
            iframe.insertAdjacentHTML('beforeend',imgHtml);
            // resolve(res)
        }).catch(err=> 
          console.log("test",err)
          // reject(err)
        );
          
          // getLinkId()
          // .then((res:any)=>{
          //   console.log(res);
          //   debugger;
          //   var imgHtml = `<br/> <br/> <br/> <img src="https://aviso-tracker.aviso.com/track/pixel.png?sh=${res.key}>`;
          //   iframe.insertAdjacentHTML('beforeend',imgHtml);
          
          // })
          // chrome.runtime.sendMessage({message: 'genrateLink', payload: {to:recipients,from,subject}}, function(response) {
            // });

          
      });
    }

    if(recipientsField){
        recipientsField.addEventListener('focusout', (event:any) => {
          const ls= document.querySelectorAll('.afV')
          recipients=[]
          ls.forEach(element => {
              recipients.push(element.getAttribute("data-hovercard-id")); 
          });
        });
    }

    const sendButton = document.querySelector('.T-I.J-J5-Ji.aoO.v7.T-I-atl.L3');

    // Add a click event listener to the "Send" button
    sendButton.addEventListener('click', () => {
      // Code to execute when the "Send" button is clicked
      console.log('Send button clicked!');
    });
    
  }

  initialize();
  
}