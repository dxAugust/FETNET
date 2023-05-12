window.addEventListener("DOMContentLoaded", (event) => {
    const loginHeaderButton = document.getElementById('btn-join');

    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');

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
        registerUser();
    });
});

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

function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
 
let request = new XMLHttpRequest(); 
let absoluteURL = window.location.origin;
let userAPI = absoluteURL + "/api/user";

// TODO: Авторизация - связать Backend и FrontEnd часть
let authAPI = absoluteURL + "/api/user/auth";
function authUser(username, password) {
    request.open("GET", authAPI + `?username=${username}&password=${password}`, true); 
    request.setRequestHeader("Content-type", "application/json");

    request.setRequestHeader ("Authorization", `Basic `);

    request.onloadend = function () {
        if (request.readyState == request.DONE) {   
            if (request.status === 200)
            {
                let response = request.responseText;

                const errorMessage = document.querySelector(".login-form-error");
                errorMessage.style.display = 'none';

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
                    document.cookie = "accessToken" + "=" + userObject.data[0].accessToken  + expires + "; path=/";

                    console.log(document.cookie);
                    
                }
            }

            if (request.status === 401)
            {
                const errorBlock = document.querySelector(".login-form-error");
                errorBlock.style.display = 'flex';
                const errorMessage = document.querySelector(".login-form-error-text");
                errorMessage.textContent = "Неверный пароль";
            }

            console.log(request.status);
        }
    }

    try {
        request.send(); 
    } catch (err) {}
}

// TODO: Регистрация - связать Backend и FrontEnd часть
let registerAPI = absoluteURL + "/api/user/register";
function registerUser(username, password, email) {
    request.open("POST", registerAPI + `?username=${username}&password=${password}&email=${email}`, true); 
    request.setRequestHeader("Content-type", "application/json");
    request.send(); 
    request.onreadystatechange = function () {
        if (request.readyState == request.DONE) {   
            if (request.status === 200)
            {
                let response = request.responseText;

                console.log(response);
                let userObject = JSON.parse(response); 

                if (userObject)
                {
                    
                }
            }

            if (request.status === 401)
            {
                alert("WRONG PASSWORD");
            }
        }
    }
}