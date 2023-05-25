import React, { useEffect, useState } from 'react';

import  './popup.scss';

import { googleSignIn } from '../utils/oauthService';
import { getUserInfo } from '../utils/storage';

const Popup = () =>{
    const [token, setToken] = useState<string>('');
    const [userInfo, setUserInfo] = useState<any>(undefined);

    useEffect(() => {
        chrome.storage.sync.get()
        setUserInfo(getUserInfo());
    })

    const doSignIn=()=>{
        googleSignIn();
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
        <div className='aviso-tracker-popup'>
            <div className='warning'>
                <div className='warning-header'>
                    <img className='warning-header-icon' src='./logo.png'/>
                </div>
                <div className='warning-contect'>
                    <h1> Aviso Mail Tracker</h1>
                    <button className='signin-btn' onClick={doSignIn}>SignIn</button>
                    <button className='logout' onClick={doSignOut}>Logout</button>
                </div>
            </div>
            
        </div>
    )
}

export default  Popup;