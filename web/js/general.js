const socket = io();
socket.connect(window.location.origin);

function sendMessage()
{
    const messageText = document.getElementById("messagebox").value;
    
    socket.on('message', function (msg) {
        socket.send('This is where I send data?');
    });
}

function procceedChat()
{
    const sendMessageButton = document.getElementById("sendMessage");
    sendMessageButton.addEventListener('click', sendMessage, false);
}


let httpRequest = new XMLHttpRequest(); 
let serverURL = window.location.origin;
let serviceAPI = serverURL + "/api/service/stats";
window.addEventListener("DOMContentLoaded", (event) => {
    const onlinePeople = document.querySelector(".current-online");

    httpRequest.open("GET", serviceAPI, true); 
    httpRequest.setRequestHeader("Content-type", "application/json");
    httpRequest.onloadend = function () {
        if (httpRequest.readyState == httpRequest.DONE) {   
            if (httpRequest.status === 200)
            {
                let response = httpRequest.responseText;
                let statsObject = JSON.parse(response); 

                if (statsObject)
                { 
                    onlinePeople.textContent = statsObject.online;
                }
            }
        }
    }

    httpRequest.send();

    this.procceedChat();
});