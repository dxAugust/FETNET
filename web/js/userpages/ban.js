function convertTime(UNIX_timestamp){
    let a = new Date(UNIX_timestamp);
    let months = ['Янв','Фев','Мар','Апр','Мая','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = a.getHours();
    let min = a.getMinutes();
    let time = ("0" + date).slice(-2) + ' ' + month + ' ' + year + ' ' + ("0" + hour).slice(-2) + ':' + ("0" + min).slice(-2);
    return time;
}

window.addEventListener("DOMContentLoaded", (event) => {
    if (!getCookie("banData"))
    {
        window.location.href = window.location.origin;
    } else {
        const banData = JSON.parse(getCookie("banData"));

        const banDate = document.getElementById("banDate");
        const banDateLength = document.getElementById("banDateLength");
        const banPlace = document.getElementById("banPlace");
        const banReasonText = document.getElementById("banReasonText");

        banDate.textContent = convertTime(banData.issued);

        var delta = new Date(Date.now() - banData.until);
        var epoch = new Date(0);

        var diff_years = delta.getYear() - epoch.getYear();
        var diff_month = delta.getMonth() - epoch.getMonth();
        var diff_days = delta.getDate() - epoch.getDate();
        var diff_hours = delta.getHours() - epoch.getHours();
        var diff_minutes = delta.getMinutes() - epoch.getMinutes();

        if (diff_years < 30)
        {
            banDateLength.textContent = (diff_years > 0 ? diff_years + ` ${getTitle(diff_hours, ["год", "года", "лет"])} ` : "") 
            + (diff_month > 0 ? diff_month + ` ${getTitle(diff_month, ["месяц", "месяца", "месяцев"])} ` : "") 
            + (diff_days > 0 ? diff_days + ` ${getTitle(diff_days, ["день", "дня", "дней"])} ` : "") 
            + (diff_hours > 0 ? diff_hours + ` ${getTitle(diff_hours, ["час", "часа", "часов"])} ` : "") 
            + (diff_minutes > 0 ? diff_minutes + ` ${getTitle(diff_hours, ["минута", "минуты", "минут"])} ` : "");
        } else {
            banDateLength.textContent = "Бессрочно";
        }
        
        banPlace.textContent = banData.place;
        banReasonText.textContent = banData.reason;
    }
});