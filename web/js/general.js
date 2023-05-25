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

function loadUserData(id)
{
    
}

function loadMessageHistory(hObj)
{
    hObj = JSON.parse(hObj);
    
    const messageList = document.getElementById("chatWindowMessages");
    hObj.messages.forEach(message => {  
        const profileRequest = new XMLHttpRequest();
        const serverURL = window.location.origin + "/api/user/fetch";
        profileRequest.open("GET", serverURL + `?id=${message.id}`, true);
        profileRequest.setRequestHeader("Content-type", "application/json");
        profileRequest.onloadend = function () {
            if (profileRequest.readyState == profileRequest.DONE) {
                if (profileRequest.status === 200) {
                    let response = profileRequest.responseText;
                    let userObject = JSON.parse(response);

                    if (userObject) {
                        messageList.insertAdjacentHTML("beforeend", `
                        <li class="chat-message">
                            <img src="../../api/user/avatar/${message.id}" class="chat-profile-pic">
                            <a href="../../u/${userObject.data[0].username}" class="chat-nickname">${userObject.data[0].username}:</a>
                            <div class="chat-message-text">${message.text}</div>
                        </li>
                        `);
                    }
                }
            }
        }
        profileRequest.send();
    });
}

function procceedChat()
{
    const messagebox = document.getElementById("messagebox");
    const sendMessageButton = document.getElementById("sendMessage");
    sendMessageButton.addEventListener('click', sendMessage, false);
    messagebox.addEventListener("keypress", boxMessage, false);

    socket.on('connect',function() { 
        socket.on('chat-message:history', (historyObject) => {
            loadMessageHistory(historyObject);
        });
    });
    
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