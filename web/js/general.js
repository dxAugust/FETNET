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

                for(let i = 0; i < messages.length; i++) {
                    messageList.insertAdjacentHTML("beforeend", `
                         <li class="chat-message" data-id="${i}">
                             <img src="../../api/user/avatar/${messages[i].id}" class="chat-profile-pic">
                             <a href="../../u/${messages[i].username}" class="chat-nickname">${messages[i].username}:</a>
                             <div class="chat-message-text">${messages[i].text}</div>
                         </li>
                    `);
                }
            }
        }
    }
    historyRequest.send();
}

function procceedChat()
{
    const messagebox = document.getElementById("messagebox");
    const sendMessageButton = document.getElementById("sendMessage");

    if (getCookie("accessToken"))
    {
        sendMessageButton.addEventListener('click', sendMessage, false);
        messagebox.addEventListener("keypress", boxMessage, false);
    } else {
        sendMessageButton.remove();
        messagebox.remove();

        const chatInputBox = document.querySelector(".chat-window-input");
        chatInputBox.innerHTML = `
            <div class="chat-window-denied">Войдите чтобы чё-нить черкануть сюда :)</div>
        `;
    }

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

        if (Notification.permission === "granted")
        {
            new Notification("FETNET - Мурчалка", 
            {
                body: `${message.username}: ${message.text}`,
                icon: "./img/logotype.png"
            });
        }
    });
}

function handlePermission() {
    if (Notification.permission === "granted")
    {
        const chatNotification = document.getElementById("chatNotificationButton");
        chatNotification.classList.add("enabled");
    }
}

function enableNotifications()
{
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications.");
        alert("This browser does not support system notifications");
    } else {
        Notification.requestPermission().then((permission) => {
            handlePermission(permission);
        });
    }
}

function messageListScroll(event)
{
    const messageList = document.getElementById("chat");
    const chatScrollButton = document.getElementById("chatScrollButton");
    if (messageList.scrollTop < (-messageList.clientWidth - messageList.clientWidth))
    {
        chatScrollButton.style.visibility = "visible";
    } else {
        chatScrollButton.style.visibility = "hidden";
    }
}

function scrollDownChat()
{
    const messageList = document.getElementById("chat");
    messageList.scrollTo(0, messageList.scrollHeight);
}

let httpRequest = new XMLHttpRequest(); 
let serverURL = window.location.origin;
let serviceAPI = serverURL + "/api/service/stats";
window.addEventListener("DOMContentLoaded", (event) => {
    const onlineTitle = document.querySelector(".welcome-online-status");

    handlePermission();

    const chatNotification = document.getElementById("chatNotificationButton");
    if (chatNotification)
    {
        chatNotification.addEventListener('click', enableNotifications, false);
    }

    const chatWindow = document.getElementById("chat");
    if (chatWindow)
    {
        chatWindow.addEventListener("scroll", messageListScroll, false);
    }

    const scrollDownButton = document.getElementById("chatScrollButton");
    if (scrollDownButton)
    {
        scrollDownButton.addEventListener("click", scrollDownChat, false);
    }

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
                        <div class="current-online">${statsObject.online}</div> ${getTitle(statsObject.online, ['мужчина', 'мужчин', 'мужчин'])} честной судьбы с нами
                    `;
                }
            }
        }
    }

    httpRequest.send();

    this.procceedChat();
});