function getFollowersAmount(id)
{
    const subListURL =  window.location.origin + "/api/user/sublist/";
    const subRequest = new XMLHttpRequest();

    subRequest.open("GET", `${subListURL + id}`, true); 
    subRequest.setRequestHeader("Content-type", "application/json");
    subRequest.onloadend = function () {
        if (subRequest.readyState == subRequest.DONE) {   
            if (subRequest.status === 200)
            {
                let subResponse = subRequest.responseText;
                let subObject = JSON.parse(subResponse);

                const profileFollowersCount = document.getElementById("profileFollowersCount");
                profileFollowersCount.textContent = subObject.subdata[0].subcount;
            }
        }
    }
    
    subRequest.send();
}

window.addEventListener("DOMContentLoaded", (event) => {
    const absoluteURL = window.location.href;
    let urlParts = absoluteURL.split('/');
    let username = urlParts[absoluteURL.split('/').length-1];

    const serverURL = window.location.origin + "/api/user/fetch";

    const profileRequest = new XMLHttpRequest(); 

    // TODO: Фетчинг подписчиков
    let fetchedUserID = 0;
    profileRequest.open("GET", serverURL + `?username=${username}`, true); 
    profileRequest.setRequestHeader("Content-type", "application/json");
    profileRequest.onloadend = function () {
        if (profileRequest.readyState == profileRequest.DONE) {   
            if (profileRequest.status === 200)
            {
                let response = profileRequest.responseText;
                let userObject = JSON.parse(response);

                if (userObject)
                {
                    /* Setting up the user data */
                    const profileName = document.getElementById('profileName');
                    profileName.textContent = userObject.data[0].username;

                    const profileMood = document.getElementById('profileMood');
                    profileMood.textContent = userObject.data[0].mood;
                    
                    const profilePic = document.getElementById('profilePic');
                    profilePic.src = `../../api/user/avatar/${userObject.data[0].id}`;

                    if (userObject.data[0].online !== "online")
                    {
                        const profileOnlineStatus = document.getElementById('onlineStatus');
                        profileOnlineStatus.classList.add("offline");
                    }

                    getFollowersAmount(userObject.data[0].id);

                    if (userObject.data[0].username === document.getElementById("selfProfileName").textContent)
                    {
                        document.getElementById("profileButtonFollow").remove();
                    }

                    const profileBanStatus = document.getElementById('profileBanStatus');
                    if (userObject.data[1])
                    {
                        profileBanStatus.innerHTML = `
                        <img width="25" height="25" src="../../img/icons/icon-danger.svg">
                        Дней с последней блокировки: ${userObject.data[1].lastBanDays}
                        `;
                    } else {
                        profileBanStatus.remove();
                    }
                }
            }

            if (profileRequest.status === 404) {
                const profileContainer = document.getElementById('profileContainer');
                profileContainer.remove();

                const mainPage = document.querySelector(".main-page");
                mainPage.innerHTML = `
                <div class="profile-message-container">
                    <img class="exist-icon" src="../../img/icons/icon-sad.svg">
                    <div class="profile-message">Учётная запись не существует</div>
                </div>
                `;
            }

            if (profileRequest.status === 423) {
                const profileContainer = document.getElementById('profileContainer');
                profileContainer.remove();

                const mainPage = document.querySelector(".main-page");
                mainPage.innerHTML = `
                <div class="profile-message-container">
                    <img class="exist-icon" src="../../img/icons/icon-sad.svg">
                    <div class="profile-message">Заблокировано за нарушение условий использования</div>
                </div>
                `;
            }
        }
    }
    profileRequest.send();
});