let selfData = {
    name: "",
};

function showLoginForm() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    registerForm.style.display = 'none';
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
    } else {
        loginForm.style.display = 'none';
    }
}

function showRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    loginForm.style.display = 'none';
    if (registerForm.style.display === 'none') {
        registerForm.style.display = 'block';
    } else {
        registerForm.style.display = 'none';
    }
}

function getCookie(name) 
{
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
 
let request = new XMLHttpRequest(); 
let absoluteURL = window.location.origin;
let userAPI = absoluteURL + "/api/user";

let authAPI = absoluteURL + "/api/user/auth";
function authUser(username, password) {
    request.open("GET", authAPI + `?username=${username}&password=${password}`, true); 
    request.setRequestHeader("Content-type", "application/json");
    request.onloadend = function () {
        if (request.readyState == request.DONE) {   
            if (request.status === 200)
            {
                let response = request.responseText;

                const errorMessage = document.querySelector(".login-form-error");
                errorMessage.style.display = 'none';

                let userObject = JSON.parse(response); 

                if (userObject)
                {
                    let days = 30;
                    var expires = "";
                    if (days) {
                        var date = new Date();
                        date.setTime(date.getTime() + (days*24*60*60*1000));
                        expires = "; expires=" + date.toUTCString();
                    }
                    document.cookie = "accessToken" + "=" + userObject.data[0].accessToken  + expires + "; path=/";
                    
                    window.location.reload();
                }
            }

            if (request.status === 401)
            {
                const errorBlock = document.querySelector(".login-form-error");
                errorBlock.style.display = 'flex';
                const errorMessage = document.querySelector(".login-form-error-text");
                errorMessage.textContent = "Неверный пароль";
            }

            if (request.status === 404)
            {
                const errorBlock = document.querySelector(".login-form-error");
                errorBlock.style.display = 'flex';
                const errorMessage = document.querySelector(".login-form-error-text");
                errorMessage.textContent = "Аккаунт не существует";
            }

            if (request.status === 410)
            {
                window.location.href = "/ban";
            }
        }
    }

    try {
        request.send(); 
    } catch (err) {}
}

let registerAPI = absoluteURL + "/api/user/register";
function registerUser(username, password, email) {
    request.open("POST", registerAPI + `?username=${username}&password=${password}&email=${email}`, true); 
    request.setRequestHeader("Content-type", "application/json");
    request.onloadend = function () {
        if (request.readyState == request.DONE) {   
            if (request.status === 200)
            {
                let response = request.responseText;

                console.log(response);
                let userObject = JSON.parse(response); 

                if (userObject)
                {
                    let days = 30;
                    var expires = "";
                    if (days) {
                        var date = new Date();
                        date.setTime(date.getTime() + (days*24*60*60*1000));
                        expires = "; expires=" + date.toUTCString();
                    }
                    document.cookie = "accessToken" + "=" + userObject.execData[0].accessToken  + expires + "; path=/";
                    
                    window.location.reload();
                }
            }
        }
    }

    request.send();
}

function modalCloseClick()
{
    const overlayModal = document.getElementById("overlay-modal");

    document.querySelector(".modal").classList.remove("active");
    overlayModal.classList.remove('active');
}

function processPost(event)
{
    event.target.classList.remove('animate');
  
    event.target.classList.add('animate');
    setTimeout(function(){
        event.target.classList.remove('animate');
    },700);

    const postsAPIURL = window.location.origin + `/api/posts/`;

    let postRequest = new XMLHttpRequest();
    let formData = new FormData();
    postRequest.open("POST", postsAPIURL, true);
    postRequest.setRequestHeader("Authorization", getCookie("accessToken"));
    postRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    postRequest.onloadend = function () {
        if (postRequest.readyState == postRequest.DONE) {
            if (postRequest.status === 200) {
                let userData = JSON.parse(postRequest.responseText);
                window.location.href = window.location.origin + `/u/${userData.redirectUser}`;
            }
        }
    }

    postRequest.send(`privacy=${document.getElementById("privacy-sets").dataset.access}&postbody=${document.getElementById("post-message-box").textContent}`);
}

function postButtonClick()
{
    let sessionToken = getCookie("accessToken");
    if (sessionToken != null)
    {
        if (!document.getElementById("overlay-modal"))
        {
            const overlayModal = document.createElement("div");
            overlayModal.id = "overlay-modal";
            overlayModal.classList.add("modal-overlay");
            overlayModal.classList.add("active");

            overlayModal.addEventListener("click", modalCloseClick);

            if (!document.querySelector(".modal"))
            {
                document.body.insertAdjacentElement("afterbegin", overlayModal);
                document.body.insertAdjacentHTML("afterbegin", `
                <div class="modal" id="postModal">
                    <p class="modal__title">Запостить чё-нить</p>
                    <svg class="modal__cross modal-close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="#FFFFFF" d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z"/>
                    </svg>
                    
                    <div class="posting-block">
                        <div id="privacy-sets" class="privacy-settings" data-access="public">
                            <div class="post-icon" style="margin-right: 5px;">
                                <svg fill="#2b8501" width="40px" height="40px" viewBox="-1 0 19 19" xmlns="http://www.w3.org/2000/svg" class="cf-icon-svg"><path d="M16.5 9.5a8 8 0 1 1-8-8 8 8 0 0 1 8 8zm-2.97.006a5.03 5.03 0 1 0-5.03 5.03 5.03 5.03 0 0 0 5.03-5.03zm-7.383-.4H4.289a4.237 4.237 0 0 1 2.565-3.498q.1-.042.2-.079a7.702 7.702 0 0 0-.907 3.577zm0 .8a7.7 7.7 0 0 0 .908 3.577q-.102-.037-.201-.079a4.225 4.225 0 0 1-2.565-3.498zm.8-.8a9.04 9.04 0 0 1 .163-1.402 6.164 6.164 0 0 1 .445-1.415c.289-.615.66-1.013.945-1.013.285 0 .656.398.945 1.013a6.18 6.18 0 0 1 .445 1.415 9.078 9.078 0 0 1 .163 1.402zm3.106.8a9.073 9.073 0 0 1-.163 1.402 6.187 6.187 0 0 1-.445 1.415c-.289.616-.66 1.013-.945 1.013-.285 0-.656-.397-.945-1.013a6.172 6.172 0 0 1-.445-1.415 9.036 9.036 0 0 1-.163-1.402zm1.438-3.391a4.211 4.211 0 0 1 1.22 2.591h-1.858a7.698 7.698 0 0 0-.908-3.577q.102.037.201.08a4.208 4.208 0 0 1 1.345.906zm-.638 3.391h1.858a4.238 4.238 0 0 1-2.565 3.498q-.1.043-.2.08a7.697 7.697 0 0 0 .907-3.578z"/></svg>
                            </div>
                            <div class="post-text">Публично</div>
                        </div>

                        <div class="post-message-box" id="post-message-box" contenteditable="true"></div>
                        <div class="post-attachment">
                            <div class="post-icon" style="margin-right: 10px;">
                                <svg fill="#505050" width="40px" height="40px" viewBox="-1 0 19 19" xmlns="http://www.w3.org/2000/svg" class="cf-icon-svg"><path d="M16.417 9.579A7.917 7.917 0 1 1 8.5 1.662a7.917 7.917 0 0 1 7.917 7.917zm-2.899 2.037a2.818 2.818 0 0 0-.832-1.975L7.76 4.713a.396.396 0 0 0-.56.56l4.928 4.928a2.032 2.032 0 0 1 .6 1.423 1.928 1.928 0 0 1-1.944 1.965h-.021a2.032 2.032 0 0 1-1.424-.6L4.613 8.265a1.176 1.176 0 0 1 0-1.663l.046-.046a1.177 1.177 0 0 1 1.662 0l4.806 4.806a.444.444 0 1 1-.628.629L7.247 8.738a.396.396 0 1 0-.56.56l3.252 3.251a1.236 1.236 0 1 0 1.748-1.747L6.88 5.995a1.97 1.97 0 0 0-2.781 0l-.046.046a1.97 1.97 0 0 0 0 2.782l4.726 4.726a2.82 2.82 0 0 0 1.974.832h.03a2.72 2.72 0 0 0 2.735-2.765z"/></svg>
                            </div>
                            <button id="post-postButton" class="bubbly-button">Shitпостнуть</button>
                        </div>
                    </div>
                </div>
                `);

                let postMessageBox = document.getElementById("post-message-box");
                document.getElementById("post-postButton").addEventListener("click", processPost);

                let privacySets = document.getElementById("privacy-sets");
                privacySets.addEventListener("click", (event) => {
                    if (privacySets.dataset.access === "public") {
                        privacySets.innerHTML = `
                        <div class="post-icon-unlisted" style="margin-right: 5px;">
                            <svg fill="#404040" width="40px" height="40px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">

                            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                            
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                            
                            <g id="SVGRepo_iconCarrier">
                            
                            <path d="M 27.9999 51.9062 C 41.0546 51.9062 51.9063 41.0547 51.9063 28.0000 C 51.9063 14.9219 41.0312 4.0938 27.9765 4.0938 C 14.8983 4.0938 4.0937 14.9219 4.0937 28.0000 C 4.0937 41.0547 14.9218 51.9062 27.9999 51.9062 Z M 38.4062 17.1016 C 41.3124 19.9844 41.0546 23.5469 37.7030 26.875 L 33.6718 30.9297 C 33.9999 29.8047 33.9765 28.4922 33.6014 27.6016 L 35.9687 25.2344 C 38.2655 22.9844 38.5234 20.6172 36.6952 18.8125 C 34.8905 17.0313 32.5234 17.3125 30.2733 19.5625 L 26.9218 22.8672 C 24.6014 25.2109 24.2968 27.6016 26.1249 29.3828 C 26.6640 29.9453 27.4609 30.2969 28.4921 30.4844 C 28.1405 31.2344 27.4140 32.1016 26.7343 32.5703 C 26.0312 32.4531 25.1405 31.8906 24.3905 31.1172 C 21.4843 28.2344 21.7890 24.625 25.1874 21.2031 L 28.6093 17.8047 C 31.9609 14.4531 35.5234 14.2187 38.4062 17.1016 Z M 16.7499 38.7578 C 13.8436 35.875 14.1014 32.3125 17.4765 28.9844 L 21.5077 24.9297 C 21.1562 26.0547 21.1796 27.3672 21.5546 28.2578 L 19.1874 30.625 C 16.8905 32.8516 16.6327 35.2422 18.4609 37.0469 C 20.2655 38.8281 22.6562 38.5469 24.8827 36.2969 L 28.2343 32.9922 C 30.5546 30.6484 30.8593 28.2578 29.0312 26.4766 C 28.4921 25.9140 27.6952 25.5625 26.6640 25.375 C 27.0155 24.625 27.7421 23.7578 28.4218 23.2891 C 29.1249 23.4062 30.0155 23.9687 30.7890 24.7422 C 33.6718 27.625 33.3671 31.2109 29.9687 34.6328 L 26.5468 38.0547 C 23.1952 41.4063 19.6327 41.6406 16.7499 38.7578 Z"/>
                            
                            </g>
                            
                            </svg>    
                        </div>
                        <div class="post-text unlisted">По ссылке</div>
                        `;

                        privacySets.dataset.access = "unlisted";
                    } else {
                        privacySets.innerHTML = `
                        <div class="post-icon" style="margin-right: 5px;">
                            <svg fill="#2b8501" width="40px" height="40px" viewBox="-1 0 19 19" xmlns="http://www.w3.org/2000/svg" class="cf-icon-svg"><path d="M16.5 9.5a8 8 0 1 1-8-8 8 8 0 0 1 8 8zm-2.97.006a5.03 5.03 0 1 0-5.03 5.03 5.03 5.03 0 0 0 5.03-5.03zm-7.383-.4H4.289a4.237 4.237 0 0 1 2.565-3.498q.1-.042.2-.079a7.702 7.702 0 0 0-.907 3.577zm0 .8a7.7 7.7 0 0 0 .908 3.577q-.102-.037-.201-.079a4.225 4.225 0 0 1-2.565-3.498zm.8-.8a9.04 9.04 0 0 1 .163-1.402 6.164 6.164 0 0 1 .445-1.415c.289-.615.66-1.013.945-1.013.285 0 .656.398.945 1.013a6.18 6.18 0 0 1 .445 1.415 9.078 9.078 0 0 1 .163 1.402zm3.106.8a9.073 9.073 0 0 1-.163 1.402 6.187 6.187 0 0 1-.445 1.415c-.289.616-.66 1.013-.945 1.013-.285 0-.656-.397-.945-1.013a6.172 6.172 0 0 1-.445-1.415 9.036 9.036 0 0 1-.163-1.402zm1.438-3.391a4.211 4.211 0 0 1 1.22 2.591h-1.858a7.698 7.698 0 0 0-.908-3.577q.102.037.201.08a4.208 4.208 0 0 1 1.345.906zm-.638 3.391h1.858a4.238 4.238 0 0 1-2.565 3.498q-.1.043-.2.08a7.697 7.697 0 0 0 .907-3.578z"/></svg>
                        </div>
                        <div class="post-text">Публично</div>
                        `;

                        privacySets.dataset.access = "public";
                    }
                });

                postMessageBox.addEventListener("input", (event) => {
                    postMessageBox.style.height = 0;
                    postMessageBox.style.height = (postMessageBox.scrollHeight - 15) + "px";
                    if (postMessageBox.style.height > document.body.height) {
                        postMessageBox.style.overflowX = "visible";
                    }
                });

                document.querySelector(".modal").classList.add("active");
                document.querySelector(".modal-close").addEventListener("click", modalCloseClick);
            }
        } else {
            document.getElementById("overlay-modal").classList.add("active");
            document.querySelector(".modal").classList.add("active");
        }
    }
}

function adminMenuClick()
{
    let sessionToken = getCookie("accessToken");
    if (sessionToken != null)
    {
        if (!document.getElementById("overlay-modal"))
        {
            const overlayModal = document.createElement("div");
            overlayModal.id = "overlay-modal";
            overlayModal.classList.add("modal-overlay");
            overlayModal.classList.add("active");

            overlayModal.addEventListener("click", modalCloseClick);

            if (!document.querySelector(".modal"))
            {
                const today = new Date(Date.now());
                let dateNow = today.getFullYear() + "-" + ("0" + today.getMonth()).substr(-2) + "-" + ("0" + today.getDate()).substr(-2);

                document.body.insertAdjacentElement("afterbegin", overlayModal);
                document.body.insertAdjacentHTML("afterbegin", `
                <div class="modal" id="postModal">
                    <p class="modal__title">Взаимодействие с профилем</p>
                    <svg class="modal__cross modal-close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="#FFFFFF" d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z"/>
                    </svg>
                    
                    <div class="posting-block">
                        <div style="text-align: left;">Срок блокировки</div>
                        <input type="date" id="start" name="trip-start"
                                value="${dateNow}"
                                min="${dateNow}">
                    </div>

                    <div class="posting-block">
                        
                    </div>

                    <div class="posting-block">
                        <div style="text-align: left;">Причина</div>
                        <textarea class="post-message-box" style="border-radius: 20px;" id="reason-box" contenteditable="true"></textarea>
                    </div>

                    <div class="posting-block">
                        <button id="banButton" class="red-button">Заблокировать</button>
                    </div>
                </div>
                `);

                let postMessageBox = document.getElementById("reason-box");
                postMessageBox.addEventListener("input", (event) => {
                    postMessageBox.style.height = 0;
                    postMessageBox.style.height = (postMessageBox.scrollHeight - 15) + "px";
                    if (postMessageBox.style.height > document.body.height) {
                        postMessageBox.style.overflowX = "visible";
                    }
                });

                document.querySelector(".modal").classList.add("active");
                document.querySelector(".modal-close").addEventListener("click", modalCloseClick);
            }
        } else {
            document.getElementById("overlay-modal").classList.add("active");
            document.querySelector(".modal").classList.add("active");
        }
    }
}

let accessAPI = absoluteURL + "/api/user/access";
let avatarAPI = absoluteURL + "/api/user/avatar/";
function fetchUserInfo()
{
    let sessionToken = getCookie("accessToken");
    if (sessionToken == null)
    {

    } else {
        request.open("GET", accessAPI, true); 
        request.setRequestHeader("Content-type", "application/json");
        request.setRequestHeader("Authorization", sessionToken);

        request.onreadystatechange = function () {
            if (request.readyState == request.DONE) {   
                if (request.status === 200)
                {
                    let response = request.responseText;
                    let userObject = JSON.parse(response); 

                    if (userObject)
                    {
                        /* Clearing the trash */
                        const loginForm = document.getElementById('loginForm');
                        const registerForm = document.getElementById('registerForm');
                        const profileItemSection = document.getElementById('profile-item-section');
                        loginForm.remove();
                        registerForm.remove();
                        profileItemSection.innerHTML = 
                        `
                        <ul>
                            <li class="user-menu-item" id="postButton">
                                <img width="28" height="28" src="../../img/icons/icon-feather.svg">
                            </li>
                        </ul>

                        <div class="profile-section" id="profileSection">
                            <img class="profile-picture" id="smallProfilePic" src="${avatarAPI + userObject.data[0].id}">
                            <div class="profile-name" id="selfProfileName">${userObject.data[0].username}</div>
                        </div>
                        `;

                        document.getElementById("postButton").addEventListener("click", postButtonClick);
                        document.getElementById("postButtonMenu").addEventListener("click", postButtonClick);

                        selfData.name = userObject.data[0].username;

                        const profileSection = document.getElementById('profileSection');
                        if (profileSection)
                        {
                            profileSection.addEventListener('click', showProfileMenu, false);
                        }
                    }
                }

                if (request.status === 423)
                {
                    let response = request.responseText;
                    let banObject = JSON.parse(response);

                    setCookie("banData", JSON.stringify(banObject.banData[0]), 1);
                    eraseCookie("accessToken");

                    window.location.href = window.location.origin + "/account/ban";
                }
            }
        }

        request.send();
    }
}

/* Profile menu */
function showProfileMenu() {
    const profileMenu = document.getElementById('profileMenu');

    if (profileMenu.style.display === 'none') {
        profileMenu.style.display = 'flex';
    } else {
        profileMenu.style.display = 'none';
    }
}

function logoutUser()
{
    eraseCookie("accessToken");
    window.location.reload();
}

function sendUserToProfile()
{
    window.location.href = absoluteURL + "/u/" + document.getElementById("selfProfileName").textContent;
}

function sendUserToSettings()
{
    window.location.href = absoluteURL + "/account/settings";
}

function makeSearchRequest()
{
    let searchURL = new URL(`${window.location.origin}/search`);
    searchURL.searchParams.set("term", document.getElementById("searchInput").value);
    window.location.href = searchURL.href;
}

window.addEventListener("DOMContentLoaded", (event) => {
    const loginHeaderButton = document.getElementById('btn-join');

    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');

    const adminMenu = document.getElementById('admin-menu');
    if (adminMenu)
    {
        adminMenu.addEventListener('click', adminMenuClick, false);
    }

    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    if (searchButton) {
        searchButton.addEventListener('click', makeSearchRequest, false);
        searchInput.addEventListener("keypress", (event) => { if (event.keyCode === 13) { makeSearchRequest() } }, false);
    }

    this.fetchUserInfo();

    if (loginHeaderButton) {
        loginHeaderButton.addEventListener('click', showLoginForm, false);
    }

    if (registerButton) {
        registerButton.addEventListener('click', showRegisterForm, false);
    }
    if (loginButton) {
        loginButton.addEventListener('click', showLoginForm, false);
    }

    document.querySelector("#loginForm").addEventListener("submit", function(e){
        e.preventDefault();
        authUser(document.getElementById('loginInput').value, document.getElementById('passwordInput').value);
    });

    document.querySelector("#registerForm").addEventListener("submit", function(e){
        e.preventDefault();
        registerUser(document.getElementById('registerLoginInput').value, 
                    document.getElementById('registerPasswordInput').value,
                    document.getElementById('registerEmailInput').value);
    });

    /* User Menu button handlers here */
    const userButton = document.getElementById('userButton');
    if (userButton) {
        userButton.addEventListener('click', sendUserToProfile, false);
    }

    const settingsButton = document.getElementById('settingsButton');
    if (settingsButton) {
        settingsButton.addEventListener('click', sendUserToSettings, false);
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser, false);
    }

    if (document.getElementById('preloader'))
    {
        let fadeEffect = setInterval(function () {
            if (!document.getElementById('preloader').style.opacity) {
                document.getElementById('preloader').style.opacity = 1;
            }
            if (document.getElementById('preloader').style.opacity > 0) {
                document.getElementById('preloader').style.opacity -= 0.1;
            } else {
                document.getElementById('preloader').remove();
                clearInterval(fadeEffect);
            }
        }, 10);
    }
});