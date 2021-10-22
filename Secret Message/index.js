const input = document.querySelector('#message-input');
const linkInput = document.querySelector('#link-input');

const messageForm = document.querySelector('#message-form');
const linkForm = document.querySelector('#link-form');

const { hash } = window.location;

const message = atob(hash.replace("#", ""));

if (message) {
    document.querySelector("#message-form").classList.add("hide");
    document.querySelector("#message-show").classList.remove("hide");

    document.querySelector("h1").innerHTML = message;

}

document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();

  messageForm.classList.add('hide');
  linkForm.classList.remove('hide');

  //   Convert to a base64 string
  const encrypted = btoa(input.value);

  linkInput.value = `${window.location}#${encrypted}`;
  linkInput.select();
});

// Base64 Encoding process:
/*
ASCI:                   s           e           c
ASCI Char Code          115         101         99
8 digit binary          01110011    01100101   01100011
All 24 dig combined        011100110110010101100011

Groups of 6 chars       1) 011100   2) 110110 3) 010101 4) 100011
Convert each group      c           2           V           j
 of 6 into a char

 Join chars together c2Vj

 can achieve with btoa("sec");  
 atob("c2Vj");
*/

/*
URL anatomy: 
                Domain          Path            Query String    Hash/fragment
                message.com    /index.html/     ?color=red      #value     

Hash/Fragment: Store info relevant only to OUR browser and not some backend server
*/
