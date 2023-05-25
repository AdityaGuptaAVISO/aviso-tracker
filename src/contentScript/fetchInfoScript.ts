import { getLinkId } from "../utils/backendService";


let initialize:any;

if(initialize===undefined){  
  initialize = () => {
    
    let recipients= [];
    const recipientsField = document.querySelector('.fX.aiL');
    // const subjectField = document.querySelector('[name="subjectbox"]');
    
    var iframe:any = document.querySelector('.Am.Al.editable.LW-avf.tS-tW');
    
    if(iframe){
      iframe.addEventListener('focus', (event:any) => {
        const mailTracker:any = document.getElementById('aviso-img');
        console.log('mail:',mailTracker)
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
document.addEventListener('DOMContentLoaded', initialize);
