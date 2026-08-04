/* systemToast_popupAlert.js - Toast and alert dialogs for OriginOS WEB */

function tb_system(msg, duration = 2000) {
    let toast = document.getElementById("systemToastMsg");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "systemToastMsg";
        toast.style.cssText = `
            position: fixed;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: rgba(20, 20, 25, 0.88);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
            z-index: 999999;
            opacity: 0;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            text-align: center;
            max-width: 80%;
            direction: rtl;
        `;
        const phone = document.getElementById("phone") || document.body;
        phone.appendChild(toast);
    }

    toast.textContent = msg;
    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
    });

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(20px)";
    }, duration);
}

function showPopupInput(opts = {}) {
    const {
        title = "OriginOS",
        message = "",
        placeholder = "",
        buttonText = "موافق",
        cancelText = "إلغاء",
        onSubmit = () => {}
    } = opts;

    const existing = document.querySelector(".popup-input-backdrop");
    if (existing) existing.remove();

    const phone = document.getElementById("phone") || document.body;

    const backdrop = document.createElement("div");
    backdrop.className = "popup-input-backdrop";
    backdrop.style.cssText = `
        position: absolute;
        inset: 0;
        z-index: 999999;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
        direction: rtl;
    `;

    const modal = document.createElement("div");
    modal.style.cssText = `
        width: 270px;
        background: rgba(30, 30, 38, 0.94);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 20px;
        padding: 18px;
        box-shadow: 0 16px 36px rgba(0,0,0,0.5);
        color: #fff;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transform: scale(0.9);
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    if (message) {
        const msgEl = document.createElement("div");
        msgEl.textContent = message;
        msgEl.style.cssText = "font-size: 14px; color: #e2e8f0; font-weight: 500;";
        modal.appendChild(msgEl);
    }

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.style.cssText = `
        width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(0,0,0,0.2);
        color: #fff;
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
    `;
    modal.appendChild(input);

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px;";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = cancelText;
    cancelBtn.style.cssText = `
        padding: 8px 14px;
        border-radius: 8px;
        border: none;
        background: rgba(255,255,255,0.1);
        color: #cbd5e1;
        font-size: 13px;
        cursor: pointer;
    `;
    cancelBtn.onclick = () => {
        backdrop.classList.remove("active");
        setTimeout(() => backdrop.remove(), 200);
    };

    const submitBtn = document.createElement("button");
    submitBtn.textContent = buttonText;
    submitBtn.style.cssText = `
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        background: #3b82f6;
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
    `;
    submitBtn.onclick = () => {
        const val = input.value;
        backdrop.classList.remove("active");
        setTimeout(() => {
            backdrop.remove();
            onSubmit(val);
        }, 200);
    };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(submitBtn);
    modal.appendChild(btnRow);
    backdrop.appendChild(modal);

    phone.appendChild(backdrop);

    requestAnimationFrame(() => {
        backdrop.style.opacity = "1";
        modal.style.transform = "scale(1)";
        input.focus();
    });
}

window.tb_system = tb_system;
window.showPopupInput = showPopupInput;

function hideAllAlerts() {
    const alerts = document.querySelectorAll(".popup-alert-backdrop, .popup-input-backdrop, .icon-context-backdrop, .popup-alert-item");
    alerts.forEach((alert) => {
        alert.remove();
    });
}

function showPopup2_alert(msg, btnYesText = "Yes", btnNoText = "No", onYes = () => {}, onNo = () => {}) {
    hideAllAlerts();

    const phone = document.getElementById("phone") || document.body;

    const backdrop = document.createElement("div");
    backdrop.className = "popup-alert-backdrop popup-alert-item";
    backdrop.style.cssText = `
        position: absolute;
        inset: 0;
        z-index: 999999;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
    `;

    const modal = document.createElement("div");
    modal.style.cssText = `
        width: 270px;
        background: rgba(30, 30, 38, 0.94);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 20px;
        padding: 18px;
        box-shadow: 0 16px 36px rgba(0,0,0,0.5);
        color: #fff;
        display: flex;
        flex-direction: column;
        gap: 16px;
        transform: scale(0.9);
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        text-align: center;
    `;

    const msgEl = document.createElement("div");
    msgEl.textContent = msg;
    msgEl.style.cssText = "font-size: 15px; color: #f1f5f9; font-weight: 500; line-height: 1.4;";
    modal.appendChild(msgEl);

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display: flex; gap: 10px; justify-content: center;";

    if (btnNoText) {
        const noBtn = document.createElement("button");
        noBtn.textContent = btnNoText;
        noBtn.style.cssText = `
            flex: 1;
            padding: 10px;
            border-radius: 12px;
            border: none;
            background: rgba(255,255,255,0.1);
            color: #cbd5e1;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
        `;
        noBtn.onclick = () => {
            backdrop.classList.remove("active");
            setTimeout(() => backdrop.remove(), 200);
            if (typeof onNo === "function") onNo();
        };
        btnRow.appendChild(noBtn);
    }

    if (btnYesText) {
        const yesBtn = document.createElement("button");
        yesBtn.textContent = btnYesText;
        yesBtn.style.cssText = `
            flex: 1;
            padding: 10px;
            border-radius: 12px;
            border: none;
            background: #3b82f6;
            color: #fff;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
        `;
        yesBtn.onclick = () => {
            backdrop.classList.remove("active");
            setTimeout(() => backdrop.remove(), 200);
            if (typeof onYes === "function") onYes();
        };
        btnRow.appendChild(yesBtn);
    }

    modal.appendChild(btnRow);
    backdrop.appendChild(modal);
    phone.appendChild(backdrop);

    requestAnimationFrame(() => {
        backdrop.style.opacity = "1";
        modal.style.transform = "scale(1)";
    });
}

window.hideAllAlerts = hideAllAlerts;
window.showPopup2_alert = showPopup2_alert;

