if (!getCookie("accessToken"))
{
    window.location.href = absoluteURL;
}

let avatarFile = null;
let mood = "";

function previewProfilePicture()
{
    event.stopPropagation();
    event.preventDefault();
    const fileList = event.dataTransfer.files;

    let reader = new FileReader();

    const profilePic = document.getElementById("smallProfilePic");
    const profilePic_highRes = document.getElementById("profilePicHighRes");
    const profilePic_medRes = document.getElementById("profilePicMediumRes");
    const profilePic_lowRes = document.getElementById("profilePicLowRes");

    if (profilePic)
    {
        if (fileList[0].type === "image/png" 
        || fileList[0].type === "image/jpeg" 
        || fileList[0].type === "image/gif")
        {
            avatarFile = fileList[0];

            profilePic_highRes.src = URL.createObjectURL(fileList[0]);
            profilePic_medRes.src = URL.createObjectURL(fileList[0]);
            profilePic_lowRes.src = URL.createObjectURL(fileList[0]);
        }
    }
}

function loadImage()
{
    let reader = new FileReader();

    const profilePic_highRes = document.getElementById("profilePicHighRes");
    const profilePic_medRes = document.getElementById("profilePicMediumRes");
    const profilePic_lowRes = document.getElementById("profilePicLowRes");

    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = _this => {
              let files = Array.from(input.files);
              if (files[0].type === "image/png" 
                || files[0].type === "image/jpeg" 
                || files[0].type === "image/gif")
                {
                    avatarFile = files[0];

                    profilePic_highRes.src = URL.createObjectURL(files[0]);
                    profilePic_medRes.src = URL.createObjectURL(files[0]);
                    profilePic_lowRes.src = URL.createObjectURL(files[0]);
                }
          };
    input.click();
}

let httpRequest = new XMLHttpRequest();
function saveSettings()
{
    const avatarAPIURL = window.location.origin + "/api/user/avatar/load/";
    const profileUpdateAPIURL = window.location.origin + "/api/user/update/";

    const settingsMessage = document.getElementById("settingsMessage");
    const settingsMessageText = document.getElementById("settingsMessageText");
    const settingsMessageImg = document.getElementById("settingsMessageImg");

    if (avatarFile)
    {
        let formData = new FormData();
        formData.append("avatar", avatarFile);
        httpRequest.open("POST", avatarAPIURL, true); 
        httpRequest.setRequestHeader("Authorization", getCookie("accessToken"))
        httpRequest.onloadend = function () {
            if (httpRequest.readyState == httpRequest.DONE) {   
                if (httpRequest.status === 200)
                {
                    settingsMessageText.textContent = "Изменения сохранены";

                    settingsMessage.style.display = "flex";
                    settingsMessage.classList.add("success");

                    settingsMessageImg.src = "../../img/icons/icon-check-mark.svg";
                }

                if (httpRequest.status === 409)
                {
                    settingsMessageText.textContent = "Недостаточно прав";
                    settingsMessage.style.display = "flex";
                }

                if (httpRequest.status === 503)
                {
                    settingsMessageText.textContent = "Аватарка слишком большая";
                    settingsMessage.style.display = "flex";
                }
            }
        }

        httpRequest.send(formData);
    }

    const moodInput = document.getElementById("moodInput");
    if (mood != moodInput.value)
    {
        httpRequest.open("POST", profileUpdateAPIURL, true); 
        httpRequest.setRequestHeader("Authorization", getCookie("accessToken"));
        httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        httpRequest.onloadend = function () {
            if (httpRequest.readyState == httpRequest.DONE) {   
                if (httpRequest.status === 200)
                {
                    
                }
            }
        }

        httpRequest.send(`mood=${moodInput.value}`);
    }
}

let fetchRequest = new XMLHttpRequest();
function showUserInfomation()
{
    let sessionToken = getCookie("accessToken");
    if (sessionToken == null)
    {

    } else {
        fetchRequest.open("GET", accessAPI, true); 
        fetchRequest.setRequestHeader("Content-type", "application/json");
        fetchRequest.setRequestHeader("Authorization", sessionToken);

        fetchRequest.onreadystatechange = function () {
            if (fetchRequest.readyState == fetchRequest.DONE) {   
                if (fetchRequest.status === 200)
                {
                    let response = request.responseText;
                    let userObject = JSON.parse(response); 

                    if (userObject)
                    {
                        const moodInput = document.getElementById("moodInput");
                        moodInput.value = userObject.data[0].mood;
                        mood = moodInput.value;
                    }
                }
            }
        }

        fetchRequest.send();
    }
}

window.addEventListener("DOMContentLoaded", (event) => {
    const loadImageButton = document.getElementById("btnLoadImage");
    if (loadImageButton)
    {
        loadImageButton.addEventListener("click", loadImage, false)
    }  

    const dropArea = document.getElementById('dropImgArea');
    dropArea.addEventListener('dragover', (event) => {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });

    dropArea.addEventListener('drop', this.previewProfilePicture);

    const saveButton = document.getElementById("btn-save");
    if (saveButton)
    {
        saveButton.addEventListener("click", saveSettings, false)
    }

    this.showUserInfomation();
});

window.addEventListener("DOMNodeInserted", (event) => {
    const profilePic = document.getElementById("smallProfilePic");
    const profilePic_highRes = document.getElementById("profilePicHighRes");
    const profilePic_medRes = document.getElementById("profilePicMediumRes");
    const profilePic_lowRes = document.getElementById("profilePicLowRes");

    if (profilePic)
    {
        profilePic_highRes.src = profilePic.src;
        profilePic_medRes.src = profilePic.src;
        profilePic_lowRes.src = profilePic.src;
    }
});