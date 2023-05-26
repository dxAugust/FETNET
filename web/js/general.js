const socket = io();
socket.connect(window.location.origin);

function clearMessageBox()
{
    const messageText = document.getElementById("messagebox");
    messageText.value = "";
}

function sendMessage()
{
    const messageText = document.getElementById("messagebox").value;
    socket.emit('chat-message', JSON.stringify({ accessToken: getCookie("accessToken"), message: messageText }));
    clearMessageBox();
}

function boxMessage(event)
{
    if (event.keyCode === 13)
    {
        sendMessage();
        clearMessageBox();
    }
}

function loadMessageHistory()
{
    const messageList = document.getElementById("chatWindowMessages");
    const historyRequest = new XMLHttpRequest();
    const dialogURL = window.location.origin + "/api/data/dialogs/murchalka";
    historyRequest.open("GET", dialogURL, true);
    historyRequest.setRequestHeader("Content-type", "application/json");
    historyRequest.onloadend = function () {
        if (historyRequest.readyState == historyRequest.DONE) {
            if (historyRequest.status === 200) {
                let response = historyRequest.responseText;
                let messages = JSON.parse(response);

                messages.forEach(message => {
                    messageList.insertAdjacentHTML("beforeend", `
                         <li class="chat-message">
                             <img src="../../api/user/avatar/${message.id}" class="chat-profile-pic">
                             <a href="../../u/${message.username}" class="chat-nickname">${message.username}:</a>
                             <div class="chat-message-text">${message.text}</div>
                         </li>
                        `);
                });
            }
        }
    }
    historyRequest.send();
}

function procceedChat()
{
    const messagebox = document.getElementById("messagebox");
    const sendMessageButton = document.getElementById("sendMessage");
    sendMessageButton.addEventListener('click', sendMessage, false);
    messagebox.addEventListener("keypress", boxMessage, false);
    loadMessageHistory();
    
    socket.on('chat-message-emit', (msgObject) => {
        let message = msgObject;

        const messageList = document.getElementById("chatWindowMessages");

        let htmlMessage = `
            <li class="chat-message">
                <img src="../../api/user/avatar/${message.id}" class="chat-profile-pic">
                <a href="../../u/${message.username}" class="chat-nickname">${message.username}:</a>
                <div class="chat-message-text">${message.text}</div>
            </li>
        `;

        messageList.insertAdjacentHTML("beforeend", htmlMessage);
    });
}


let httpRequest = new XMLHttpRequest(); 
let serverURL = window.location.origin;
let serviceAPI = serverURL + "/api/service/stats";
window.addEventListener("DOMContentLoaded", (event) => {
    const onlineTitle = document.querySelector(".welcome-online-status");

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
                    onlineTitle.innerHTML = `
                        <div class="sphere-online-blink"></div>
                        <div class="current-online">${statsObject.online}</div> ${getTitle(statsObject.online, ['мужчина', 'мужчин'])} честной судьбы с нами
                    `;
                }
            }
        }
    }

    httpRequest.send();

    this.procceedChat();
});