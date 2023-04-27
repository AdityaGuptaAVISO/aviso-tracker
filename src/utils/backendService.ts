export const getLinkId=(payload)=>{

    return new Promise(async (resolve, reject)=>{
        const response:any = await fetch('https://aviso-tracker.aviso.com/track/generate-pixel/', { 
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).catch(err=> reject(err));

        const data = await response?.json();
        return resolve(data)
    })
    
}