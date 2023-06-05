const socket = io();
socket.connect(window.location.origin);

function clearMessageBox()
{
    const messageText = document.getElementById("messagebox");
    messageText.value = "";
}

let chatAttachments = [];
function sendMessage()
{
    const messageText = document.getElementById("messagebox").value;
    if (chatAttachments.length === 0)
    {
        socket.emit('chat-message', JSON.stringify({ accessToken: getCookie("accessToken"), message: messageText }));
    } else {
        document.getElementById("attachmentList").innerHTML = ``;

        let formData = new FormData();
        formData.append("attachment", chatAttachments[0]);
        const attachmentRequest = new XMLHttpRequest();
        const attachApiURL = window.location.origin + "/api/data/attachment/murchalka";
        attachmentRequest.open("POST", attachApiURL, true);
        attachmentRequest.setRequestHeader("Authorization", getCookie("accessToken"));
        attachmentRequest.onloadend = function () {
            if (attachmentRequest.readyState == attachmentRequest.DONE) {
                if (attachmentRequest.status === 200) 
                {
                    let attachResponse = attachmentRequest.responseText;
                    let attachmentObject = JSON.parse(attachResponse);

                    socket.emit('chat-message', JSON.stringify(
                    { 
                        accessToken: getCookie("accessToken"), 
                        message: messageText,
                        attachment: attachmentObject.attachmentid
                    }));

                    chatAttachments = [];
                }
            }
        }

        attachmentRequest.send(formData);
    }
    
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

function attachFiles()
{
    const attachmentList = document.getElementById("attachmentList");

    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = _this => {
              let files = Array.from(input.files);
              if (files[0].type === "image/png" 
                || files[0].type === "image/jpeg" 
                || files[0].type === "image/gif")
                {
                    attachmentList.innerHTML = `
                    <li id="attachmentItem" class="attachment-item">
                        <img class="attachment-item-img" src="${URL.createObjectURL(files[0])}">
                    </li>
                    `;

                    chatAttachments = files;

                    document.getElementById("attachmentItem").addEventListener("click", () => {
                        files[0] = null;
                        chatAttachments = [];

                        document.getElementById("attachmentItem").remove();
                    });
                }
          };
    input.click();
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

                let months = ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'];
                let dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
                for(let i = 0; i < messages.length; i++) {
                    let messageDate = new Date(messages[i].timestamp);

                    if (!document.getElementById(`timestamp${messageDate.getFullYear() + messageDate.getMonth() + messageDate.getDate()}`))
                    {
                        messageList.insertAdjacentHTML("beforeend", `
                            <time class="chat-timestamp" id="timestamp${messageDate.getFullYear() + messageDate.getMonth() + messageDate.getDate()}">
                                ${dayNames[messageDate.getDay()]} ${messageDate.getDate()} ${months[messageDate.getMonth()]} ${messageDate.getFullYear()}
                            </time>
                        `);
                    }

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

let typingTimer = null;
function messageBoxTyping(event)
{

}

function messageBoxStopTyping(event)
{

}

function procceedChat()
{
    const messagebox = document.getElementById("messagebox");
    const sendMessageButton = document.getElementById("sendMessage");
    const attachButton = document.getElementById("attachButton");

    if (getCookie("accessToken"))
    {
        sendMessageButton.addEventListener('click', sendMessage, false);
        attachButton.addEventListener('click', attachFiles, false);
        messagebox.addEventListener("keypress", boxMessage, false);
        messagebox.addEventListener("keydown", messageBoxTyping, false);
        messagebox.addEventListener("keyup", messageBoxStopTyping, false);
        messagebox.addEventListener("input", (event) => {
            messagebox.style.height = 0;
            messagebox.style.height = (messagebox.scrollHeight - 15) + "px";
            document.getElementById("attachButton").style.height = (messagebox.scrollHeight - 30) + "px";
        });
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
            if (message.username != document.getElementById("selfProfileName").textContent)
            {
                if (document.visibilityState === "hidden")
                {
                    new Notification("Мурчалка", 
                    {
                        body: `${message.username}: ${message.text}`,
                        icon: "./img/logotype.png"
                    });
                }
            }
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
    } else {
        Notification.requestPermission().then((permission) => {
            handlePermission(permission);
        });
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./js/service/notify.js').then(function(registration) {
            console.log('ServiceWorker registration successful');
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
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