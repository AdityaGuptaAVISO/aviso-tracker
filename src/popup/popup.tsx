import React, { useState } from 'react';

import './popup.css';

const Popup = () =>{
    const [token, setToken] = useState<string>('');

    const doSignIn=()=>{
        chrome.runtime.sendMessage({message: 'get_access_token'}, (response)=> {
            console.log("printing token" +response);
            setToken(response)
        });
    }

    const doSignOut=()=>{
        console.log('token seARCH')
        if (token !== "") {
            console.log('token found')
            chrome.runtime.sendMessage({message: 'logout', token}, (response)=> {
                console.log(response);
            });
        } else {
            console.log('no token found');
        }
    }

    return (
        <div>
            <h1> Aviso Mail Tracker</h1>
            <button className='signin-btn' onClick={doSignIn}>SignIn</button>
            <button className='logout' onClick={doSignOut}>Logout</button>
        </div>
    )
}

export default  Popup;