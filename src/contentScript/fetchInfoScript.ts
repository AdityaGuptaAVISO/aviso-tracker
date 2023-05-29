import { getLinkId } from "../utils/backendService";


let initialize:any;

const insertImage = (index) => {
  const linkElement = document.createElement('a');
  linkElement.href = `https://aviso-tracker.aviso.com/track/pixel.png?sh=${"res.id"}`;
 
  const imageElement = document.createElement('img');
  imageElement.src = `https://aviso-tracker.aviso.com/track/pixel.png?sh=${"res.id"}`;
  imageElement.alt = 'aviso-tracker';
 
  linkElement.appendChild(imageElement);

  getMailBody()[index].insertAdjacentElement('beforeend',linkElement);
}

const getMailBody = ()=> {
  return document.querySelectorAll('.Am.Al.editable.LW-avf.tS-tW')
}

const setMailBody = (mailBody:any, index:number) =>{
  const testFrame = mailBody.querySelector('[alt="aviso-tracker"]');
  if(!testFrame){
    insertImage(index)
  }
}

if(initialize===undefined){  
  initialize = () => {
    
    let recipients= [];
    
    var iframe:any = document.querySelector('.Am.Al.editable.LW-avf.tS-tW');

    const composeButton:any = document.querySelector('.T-I.T-I-KE.L3');
    composeButton?.addEventListener('click', (event:any)=>{          
      setTimeout(()=>{
        const mailBody:any = getMailBody()
        mailBody.forEach(setMailBody)
      },2000)
    })

    if(iframe){
      iframe.addEventListener('focus', (event:any) => {
        const mailTracker:any = document.getElementById('aviso-img');
        if(mailTracker){
          return;
        }
        const ls= document.querySelectorAll('.afV')
        recipients=[]
        ls.forEach(element => {
            recipients.push(element.getAttribute("data-hovercard-id")); 
        });
        const fromField:any = document.querySelector('[name="from"]')
        const subjectField:any = document.querySelector('[name="subjectbox"]');

        const payload= {to:recipients,from:fromField?.value,subject:subjectField?.value}
        console.log('payload:',payload,mailTracker);
        getLinkId(payload).then((res:any)=>{
            console.log("test",res)
            var imgHtml = `<a id='aviso-img' alt='aviso-tracker' href="aviso-tracker.aviso.com/track/pixel.png?sh=${res.id}"></a>`;
            iframe.insertAdjacentHTML('beforeend',imgHtml);
            var imgTag = `<img id='aviso-img1' alt='aviso-tracker' src="https://aviso-tracker.aviso.com/track/pixel.png?sh=${res.id}"></img>` 
            const anchorTag = document.getElementById('aviso-img');
            anchorTag.insertAdjacentHTML('beforeend',imgTag);
      
      }).catch(err=> 
        console.log("test",err)
      );
        
    });
  }

  }
  
}

initialize();
