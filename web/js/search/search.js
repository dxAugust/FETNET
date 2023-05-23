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
});