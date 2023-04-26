// fetch('https://icanhazdadjoke.com/slack')
//     .then(data => data.json())
//     .then(jokeData => {
//         const jokeText = jokeData.attachments[0].text;
//         const jokeElement = document.getElementById('jokeElement');

//         jokeElement.innerHTML = jokeText;
//     })

// curl --location 'http://3.18.211.232/api/generate-pixel?to=aditya.gupta%40aviso.com&from=aditya17325%40iiitd.ac.in&subject=test'
// call this curl to generate pixel

// const API_KEY = 'AIzaSyD1YOHiErFDW0Sdad2GJkZFWroKj0HVlQo';

// function signIn() {
//     // Google's OAuth 2.0 endpoint for requesting an access token
//     console.log("hello");
//     var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
  
//     // Create <form> element to submit parameters to OAuth 2.0 endpoint.
//     var form = document.createElement('form');
//     form.setAttribute('method', 'GET'); // Send as a GET request.
//     form.setAttribute('action', oauth2Endpoint);
  
//     // Parameters to pass to OAuth 2.0 endpoint.
//     var params = {'client_id': '946879539129-m5url1u1dparj9qkstu3iu1nqfgvgi5m.apps.googleusercontent.com',
//                   'redirect_uri': 'https://gmail.com/',
//                   'response_type': 'token',
//                   'scope':'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.addons.current.action.compose https://www.googleapis.com/auth/gmail.addons.current.message.action https://www.googleapis.com/auth/gmail.modify',
//                   'include_granted_scopes': 'true',
//                   'state': 'pass-through value'};
  
//     // Add form parameters as hidden input values.
//     for (var p in params) {
//       var input = document.createElement('input');
//       input.setAttribute('type', 'hidden');
//       input.setAttribute('name', p);
//       input.setAttribute('value', params[p]);
//       form.appendChild(input);
//     }
  
//     // Add form to page and submit it to open the OAuth 2.0 endpoint.
//     document.body.appendChild(form);
//     form.submit();
// }

// (() => {
// // Check if the code is running in a browser environment before attaching the event listener.
//     document.getElementById("btn").addEventListener("click", signIn);
// })();

let token = "";

document.getElementById('signin-btn').addEventListener('click', function() {
    chrome.runtime.sendMessage({message: 'get_access_token'}, function(response) {
        console.log("printing token" +response);
        token = response;
    });
});


document.getElementById('logout-btn').addEventListener('click', function() {
    console.log('token seARCH')
    if (token !== "") {
        console.log('token found')
        chrome.runtime.sendMessage({message: 'logout', token: token}, function(response) {
            console.log(response);
        });
    } else {
        console.log('no token found');
    }
});
