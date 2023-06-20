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

function postButtonClick()
{
    
}

let accessAPI = absoluteURL + "/api/user/access";
let avatarAPI = absoluteURL + "/api/user/avatar/"
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