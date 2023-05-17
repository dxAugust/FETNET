function saveSettings()
{

}

window.addEventListener("DOMContentLoaded", (event) => {
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