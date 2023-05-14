window.addEventListener("DOMContentLoaded", (event) => {
    const absoluteURL = window.location.href;
    let urlParts = absoluteURL.split('/');
    let username = urlParts[absoluteURL.split('/').length-1];

    const serverURL = window.location.origin + "/api/user/fetch";

    // TODO: Рендеринг страницы профиля
});