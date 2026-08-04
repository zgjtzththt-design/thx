/* notif.js - System notification manager for OriginOS WEB */

function addNotification(icon, title, message, appId) {
    const notifContainer = document.querySelector(".notificationStacked") || document.getElementById("notifContainer") || document.getElementById("phone") || document.body;
    
    const notif = document.createElement("div");
    notif.className = "notifItem";
    notif.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(30, 30, 40, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 16px;
        color: #fff;
        margin: 8px 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;
        z-index: 10000;
    `;

    const img = document.createElement("img");
    img.src = icon || "/originData/iconPacks/origin_icon/system_settings.png";
    img.style.cssText = "width: 36px; height: 36px; border-radius: 8px; object-fit: cover;";

    const content = document.createElement("div");
    content.style.cssText = "flex: 1; display: flex; flex-direction: column; gap: 2px;";

    const tEl = document.createElement("div");
    tEl.textContent = title || "OriginOS";
    tEl.style.cssText = "font-weight: 600; font-size: 14px;";

    const mEl = document.createElement("div");
    mEl.textContent = message || "";
    mEl.style.cssText = "font-size: 12px; color: rgba(255,255,255,0.7);";

    content.appendChild(tEl);
    content.appendChild(mEl);
    notif.appendChild(img);
    notif.appendChild(content);

    if (appId) {
        notif.onclick = () => {
            if (typeof openAppByID === "function") openAppByID(appId);
            notif.remove();
        };
    }

    notifContainer.appendChild(notif);

    setTimeout(() => {
        notif.style.opacity = "0";
        notif.style.transform = "translateY(-10px)";
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}

function updateStack(container) {
    if (!container) return;
}

window.addNotification = addNotification;
window.updateStack = updateStack;

