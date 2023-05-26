function makeASearch(term)
{
    const searchProfilesList = document.getElementById("searchProfilesList");

    const serverURL = window.location.origin + `/api/user/search/${term}`;
    const searchRequest = new XMLHttpRequest();
    searchRequest.open("GET", serverURL, true); 
    searchRequest.setRequestHeader("Content-type", "application/json");
    searchRequest.onloadend = function () {
        if (searchRequest.readyState == searchRequest.DONE) {   
            if (searchRequest.status === 200)
            {
                let response = searchRequest.responseText;
                let userObject = JSON.parse(response);

                if (userObject)
                {
                    userObject.forEach(user => {
                        searchProfilesList.insertAdjacentHTML("beforeend", `
                        <li class="profile-list-item">
                            <a href="/u/${user.username}">
                                <img class="profile-list-pic" src="../../api/user/avatar/${user.user_id}">
                                <div class="profile-block">
                                    <a href="/u/${user.username}" class="profile-list-username">${user.username}</a>
                                    <div class="profile-list-status">${user.status}</div>
                                </div>
                            </a>
                        </li>
                        `);
                    });
                }
            }

            if (searchRequest.status === 404)
            {
                document.getElementById("mainPage").innerHTML = `
                <div class="search-message-container">
                    <img class="exist-icon" src="../../img/icons/icon-sad.svg">
                    <div class="search-message">По запросу ничего не найдено</div>
                </div>
                `;
            }
        }
    }
    searchRequest.send();
}

window.addEventListener("DOMContentLoaded", (event) => {
    let siteURL = new URL(window.location.href);

    let searchParam = siteURL.searchParams.get("term");
    makeASearch(searchParam);
});