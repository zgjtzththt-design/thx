/* timeAndDate.js - Real-time clock and date updater for OriginOS WEB */

function updateClocks() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    const timeStr = `${hours}:${minutes}`;

    const statusClock = document.getElementById("statusClock");
    if (statusClock) statusClock.textContent = timeStr;

    document.querySelectorAll(".lockClock").forEach((el) => {
        el.textContent = timeStr;
    });
}

setInterval(updateClocks, 1000);
window.addEventListener("DOMContentLoaded", updateClocks);
updateClocks();
