function previewProfilePicture()
{
    event.stopPropagation();
    event.preventDefault();
    const fileList = event.dataTransfer.files;

    let reader = new FileReader();

    console.log(fileList[0]);

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
            profilePic_highRes.src = URL.createObjectURL(fileList[0]);
            profilePic_medRes.src = URL.createObjectURL(fileList[0]);
            profilePic_lowRes.src = URL.createObjectURL(fileList[0]);
        }
    }
}

function loadImage()
{

}

function saveSettings()
{

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