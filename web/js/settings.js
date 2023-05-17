if (!getCookie("accessToken"))
{
    window.location.href = absoluteURL;
}

let avatarFile = null;
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
                    
                }
            }
        }

        httpRequest.send(formData);
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