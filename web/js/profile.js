let fetchedUserID = 0;
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

function checkSubscription()
{
    const followRequest = new XMLHttpRequest();
    const followURL = window.location.origin + "/api/user/checksub";

    followRequest.open("POST", followURL, true); 
    followRequest.setRequestHeader("Content-type", "application/json");
    followRequest.setRequestHeader("Authorization", getCookie("accessToken"));
    followRequest.onloadend = function () {
        if (followRequest.readyState == followRequest.DONE) {   
            if (followRequest.status === 200)
            {
                const flwButton = document.getElementById("profileButtonFollow");
                flwButton.classList.add("unfollow");
                flwButton.classList.remove("follow");

                const profileImgFollow = document.getElementById("profileImgFollow");
                profileImgFollow.classList.remove("follow");
                profileImgFollow.classList.add("unfollow");

                profileImgFollow.src = "../../img/icons/icon-broken-heart.svg";
            }
        }
    }
    followRequest.send(JSON.stringify({ subid: fetchedUserID }));
}

function followButtonClick(event)
{
    const followRequest = new XMLHttpRequest(); 
    const followURL = window.location.origin + "/api/user/subscribe";
    const unfollowURL = window.location.origin + "/api/user/unsubscribe";

    const flwCounter = document.getElementById("profileFollowersCount");

    let flwButton = document.getElementById("profileButtonFollow");
    if (flwButton.classList.contains("follow"))
    {
        flwButton.classList.add("unfollow");
        flwButton.classList.remove("follow");

        const profileImgFollow = document.getElementById("profileImgFollow");
        profileImgFollow.classList.remove("follow");
        profileImgFollow.classList.add("unfollow");

        profileImgFollow.src = "../../img/icons/icon-broken-heart.svg";

        followRequest.open("POST", followURL, true); 
        followRequest.setRequestHeader("Content-type", "application/json");
        followRequest.setRequestHeader("Authorization", getCookie("accessToken"));
        followRequest.onloadend = function () {
            if (followRequest.readyState == followRequest.DONE) {   
                if (followRequest.status === 200)
                {
                    let amount = Number(flwCounter.textContent);
                    amount++;
                    flwCounter.textContent = amount;
                }
            }
        }
        followRequest.send(JSON.stringify({ subid: fetchedUserID }));
    } else {
        flwButton.classList.add("follow");
        flwButton.classList.remove("unfollow");

        const profileImgFollow = document.getElementById("profileImgFollow");
        profileImgFollow.classList.add("follow");
        profileImgFollow.classList.remove("unfollow");

        profileImgFollow.src = "../../img/icons/icon-heart.svg";

        followRequest.open("POST", unfollowURL, true); 
        followRequest.setRequestHeader("Content-type", "application/json");
        followRequest.setRequestHeader("Authorization", getCookie("accessToken"));
        followRequest.onloadend = function () {
            if (followRequest.readyState == followRequest.DONE) {   
                if (followRequest.status === 200)
                {
                    let amount = Number(flwCounter.textContent);
                    amount--;
                    flwCounter.textContent = amount;
                }
            }
        }
        followRequest.send(JSON.stringify({ subid: fetchedUserID }));
    }
}

function loadPosts(userObj)
{
    const postsRequest = new XMLHttpRequest(); 
    const postsAPIURL = window.location.origin + `/api/posts/${userObj.id}`;

    postsRequest.open("GET", postsAPIURL, true); 
    postsRequest.setRequestHeader("Content-type", "application/json");
    postsRequest.onloadend = function () {
        if (postsRequest.readyState == postsRequest.DONE) {   
            if (postsRequest.status === 200)
            {
                let postList = document.getElementById("postsList");
                let jsonObject = JSON.parse(postsRequest.responseText);

                let months = ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'];

                jsonObject.posts.sort(function(a, b) {
                    return b.timestamp - a.timestamp;
                });

                let posts = "";
                for (let i = 0; i < jsonObject.posts.length; i++)
                {
                    let postDate = new Date(jsonObject.posts[i].timestamp);
                    let nowDate = new Date(Date.now());
                    posts = posts + `
                    <li class="post-list-item" data-id="${i}">
                        <div class="post-profile-block">
                            <img class="small-profile-picture" src="../api/user/avatar/${userObj.id}">
                            <div class="post-profile-name 
                            ${JSON.parse(userObj.name_color).effect ? JSON.parse(userObj.name_color).effect : "none"}"
                            style="color: 
                            ${JSON.parse(userObj.name_color).color ? JSON.parse(userObj.name_color).color : "#FFFFFF"}
                            ">${userObj.username}</div>
                            <time class="post-timestamp">
                                ${postDate.getDate()} ${months[postDate.getMonth()]} ${postDate.getFullYear() == nowDate.getFullYear() ? "" : postDate.getFullYear()}
                            </time>
                        </div>

                        <div class="post-profile-text">
                            ${jsonObject.posts[i].post_body} 
                        </div>
                    </li>
                    `;
                }

                postList.innerHTML = posts;
            }
        }
    }

    postsRequest.send();
}

window.addEventListener("DOMContentLoaded", (event) => {
    const absoluteURL = window.location.href;
    let urlParts = absoluteURL.split('/');
    let username = urlParts[absoluteURL.split('/').length-1];

    const serverURL = window.location.origin + "/api/user/fetch";

    const profileRequest = new XMLHttpRequest(); 

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
                    fetchedUserID = userObject.data[0].id;
                    checkSubscription();

                    const profileName = document.getElementById('profileName');
                    profileName.textContent = userObject.data[0].username;

                    if (userObject.data[0].sub_until > Date.now())
                    {
                        if (userObject.data[0].name_color)
                        {
                            profileName.style = `color: ${JSON.parse(userObject.data[0].name_color).color}`;
                            JSON.parse(userObject.data[0].name_color).effect ? 
                            profileName.classList.add(JSON.parse(userObject.data[0].name_color).effect) : 
                            profileName.classList.add("none")
                            ;
                        }

                        const bannerRequest = new XMLHttpRequest(); 
                        bannerRequest.open("GET", window.location.origin + `/api/user/banner/${userObject.data[0].id}`, true); 
                        bannerRequest.onloadend = function () {
                            if (bannerRequest.readyState == bannerRequest.DONE) {   
                                if (bannerRequest.status === 200)
                                {
                                    profileContainer.style = `background-image: url('../../api/user/banner/${userObject.data[0].id}');`;
                                }
                            }
                        }

                        bannerRequest.send();
                    }

                    const profileMood = document.getElementById('profileMood');
                    profileMood.textContent = userObject.data[0].mood;
                    
                    const profilePic = document.getElementById('profilePic');
                    profilePic.src = `../../api/user/avatar/${userObject.data[0].id}`;

                    const lastOnline = document.getElementById("lastOnline");
                    if (userObject.data[0].online !== "online")
                    {
                        const profileOnlineStatus = document.getElementById('onlineStatus');
                        profileOnlineStatus.classList.add("offline");

                        let diff = Date.now() - userObject.data[0].online
                        let secondsBetween = diff / 1000;
                        let secondsBetweenDates = Math.abs(secondsBetween);
                        let offlineDays = Math.floor(secondsBetweenDates / (3600*24));

                        if (secondsBetweenDates < 86400)
                        {
                            lastOnline.textContent = "Присутствие сегодня было";
                        } else if (secondsBetweenDates > 86400 && secondsBetweenDates < 5184000) {
                            lastOnline.textContent = `${offlineDays} ${getTitle(offlineDays, ['день', 'дня', 'дней'])} назад`;
                        } else if (secondsBetweenDates > 5184000 && offlineDays < 180) {
                            document.getElementById("onlineStatus").style = "background: none";
                            document.getElementById("onlineStatus").innerHTML = `
                            <img width="16px" height="16px" src="../../img/icons/icon-ghost.svg">
                            <span id="lastOnline" class="online-tooltip">${offlineDays} ${getTitle(offlineDays, ['день', 'дня', 'дней'])} назад</span>
                            `;
                        } else {
                            document.getElementById("onlineStatus").style = "background: none";
                            document.getElementById("onlineStatus").innerHTML = `
                            <img width="16px" height="16px" src="../../img/icons/icon-skull.svg">
                            <span id="lastOnline" class="online-tooltip">${offlineDays} ${getTitle(offlineDays, ['день', 'дня', 'дней'])} назад</span>
                            `;
                        }

                    } else {
                        lastOnline.remove();
                    }

                    getFollowersAmount(userObject.data[0].id);

                    let selfProfileName = document.getElementById("selfProfileName");
                    if(selfProfileName)
                    {
                        if (userObject.data[0].username === document.getElementById("selfProfileName").textContent)
                        {
                            document.getElementById("profileButtonFollow").remove();
                        }
                    } else {
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

                    loadPosts(userObject.data[0]);
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

    const followButton = document.getElementById("profileButtonFollow");
    followButton.addEventListener("click", this.followButtonClick);
});