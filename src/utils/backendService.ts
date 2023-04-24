export const getLinkId=(payload)=>{

    return new Promise(async (resolve, reject)=>{
        await fetch('https://aviso-tracker.aviso.com/track/generate-pixel', { 
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then((res:any)=>{
            console.log("test",res)
            resolve(res)
        }).catch(err=> reject(err));
    })
    
}