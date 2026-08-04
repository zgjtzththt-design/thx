/* customIconManager.js - App Icon Customization for OriginOS WEB */

const CUSTOM_ICON_PREFIX = "custom_app_icon_";

function getSavedCustomIcon(appId) {
    if (!appId) return null;
    return localStorage.getItem(CUSTOM_ICON_PREFIX + appId);
}

function saveCustomIcon(appId, dataUrl) {
    if (!appId || !dataUrl) return;
    localStorage.setItem(CUSTOM_ICON_PREFIX + appId, dataUrl);
    applyCustomIconToElement(appId, dataUrl);
    if (typeof tb_system === "function") {
        tb_system("تم تغيير أيقونة التطبيق بنجاح ✨");
    }
}

function resetCustomIcon(appId) {
    if (!appId) return;
    localStorage.removeItem(CUSTOM_ICON_PREFIX + appId);
    restoreDefaultIconToElement(appId);
    if (typeof tb_system === "function") {
        tb_system("تم استعادة الأيقونة الافتراضية");
    }
}

function applyCustomIconToElement(appId, dataUrl) {
    const icons = document.querySelectorAll(`.iconApp[data-app="${appId}"]`);
    icons.forEach((icon) => {
        icon.style.backgroundImage = `url("${dataUrl}")`;
        icon.style.backgroundSize = "cover";
        icon.style.backgroundPosition = "center";
        if (typeof updateBgIcon === "function") {
            try { updateBgIcon(icon); } catch (e) {}
        }
    });

    const preview = document.querySelector(".previewIcon");
    if (preview && (preview.dataset.app === appId || preview.getAttribute("data-app") === appId)) {
        preview.style.backgroundImage = `url("${dataUrl}")`;
        preview.style.backgroundSize = "cover";
        preview.style.backgroundPosition = "center";
    }
}

function restoreDefaultIconToElement(appId) {
    const icons = document.querySelectorAll(`.iconApp[data-app="${appId}"]`);
    icons.forEach((icon) => {
        icon.style.backgroundImage = "";
        const spanRow = icon.dataset.rowspan || 1;
        const spanCol = icon.dataset.colspan || 1;
        const sizeKey = `${spanRow}x${spanCol}`;
        if (typeof applyIconBackgroundBySize === "function") {
            try { applyIconBackgroundBySize(icon, sizeKey, false, true); } catch (e) {}
        }
        if (typeof updateBgIcon === "function") {
            try { updateBgIcon(icon); } catch (e) {}
        }
    });

    const preview = document.querySelector(".previewIcon");
    if (preview && (preview.dataset.app === appId || preview.getAttribute("data-app") === appId)) {
        preview.style.backgroundImage = "";
        const previewSize = preview.dataset.size || "1x1";
        if (typeof applyIconBackgroundBySize === "function") {
            try { applyIconBackgroundBySize(preview, previewSize, true, true); } catch (e) {}
        }
    }
}

function applyAllSavedCustomIcons() {
    document.querySelectorAll(".iconApp").forEach((icon) => {
        const appId = icon.dataset.app;
        if (!appId) return;
        const saved = getSavedCustomIcon(appId);
        if (saved) {
            icon.style.backgroundImage = `url("${saved}")`;
            icon.style.backgroundSize = "cover";
            icon.style.backgroundPosition = "center";
            if (typeof updateBgIcon === "function") {
                try { updateBgIcon(icon); } catch (e) {}
            }
        }
    });
}

function promptChangeIcon(appId) {
    let fileInput = document.getElementById("globalIconFileInput");
    if (!fileInput) {
        fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = "globalIconFileInput";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";
        document.body.appendChild(fileInput);
    }

    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            saveCustomIcon(appId, dataUrl);
        };
        reader.readAsDataURL(file);
        fileInput.value = "";
    };

    fileInput.click();
}

function openIconContextMenu(appId, iconEl, event) {
    if (event) {
        if (typeof event.preventDefault === "function") event.preventDefault();
        if (typeof event.stopPropagation === "function") event.stopPropagation();
    }

    closeIconContextMenu();

    const appBox = document.getElementById(appId);
    const appName = iconEl?.querySelector("label")?.textContent || appBox?.id || "تطبيق";
    const hasCustomIcon = !!getSavedCustomIcon(appId);
    const phone = document.getElementById("phone") || document.body;

    const backdrop = document.createElement("div");
    backdrop.className = "icon-context-backdrop";

    const menu = document.createElement("div");
    menu.className = "icon-context-menu";

    // Header
    const header = document.createElement("div");
    header.className = "icon-context-header";

    const miniPreview = document.createElement("div");
    miniPreview.className = "icon-context-preview";
    const bgStyle = iconEl ? (iconEl.style.backgroundImage || getComputedStyle(iconEl).backgroundImage) : "";
    miniPreview.style.backgroundImage = bgStyle;

    const title = document.createElement("div");
    title.className = "icon-context-title";
    title.textContent = appName;

    header.appendChild(miniPreview);
    header.appendChild(title);
    menu.appendChild(header);

    // Option 1: File upload
    const optChange = document.createElement("div");
    optChange.className = "icon-context-item";
    optChange.innerHTML = `<span class="icon-context-emoji">🖼️</span><span>تغيير صورة الأيقونة</span>`;
    optChange.onclick = () => {
        closeIconContextMenu();
        promptChangeIcon(appId);
    };
    menu.appendChild(optChange);

    // Option 2: Enter Image URL
    const optUrl = document.createElement("div");
    optUrl.className = "icon-context-item";
    optUrl.innerHTML = `<span class="icon-context-emoji">🔗</span><span>إدخال رابط صورة (URL)</span>`;
    optUrl.onclick = () => {
        closeIconContextMenu();
        if (typeof showPopupInput === "function") {
            showPopupInput({
                message: "أدخل رابط الصورة الجديدة للأيقونة:",
                placeholder: "https://example.com/icon.png",
                buttonText: "حفظ",
                cancelText: "إلغاء",
                onSubmit: (url) => {
                    if (url && url.trim()) {
                        saveCustomIcon(appId, url.trim());
                    }
                }
            });
        } else {
            const url = prompt("أدخل رابط الصورة الجديدة للأيقونة:");
            if (url && url.trim()) {
                saveCustomIcon(appId, url.trim());
            }
        }
    };
    menu.appendChild(optUrl);

    // Option 3: Reset icon
    if (hasCustomIcon) {
        const optReset = document.createElement("div");
        optReset.className = "icon-context-item";
        optReset.innerHTML = `<span class="icon-context-emoji">🔄</span><span>استعادة الأيقونة الافتراضية</span>`;
        optReset.onclick = () => {
            closeIconContextMenu();
            resetCustomIcon(appId);
        };
        menu.appendChild(optReset);
    }

    // Option 4: Cancel
    const optCancel = document.createElement("div");
    optCancel.className = "icon-context-item cancel";
    optCancel.innerHTML = `<span class="icon-context-emoji">✖️</span><span>إلغاء</span>`;
    optCancel.onclick = () => {
        closeIconContextMenu();
    };
    menu.appendChild(optCancel);

    backdrop.appendChild(menu);
    backdrop.onclick = (e) => {
        if (e.target === backdrop) closeIconContextMenu();
    };

    phone.appendChild(backdrop);

    requestAnimationFrame(() => {
        backdrop.classList.add("active");
    });
}

function closeIconContextMenu() {
    const backdrop = document.querySelector(".icon-context-backdrop");
    if (backdrop) {
        backdrop.classList.remove("active");
        setTimeout(() => backdrop.remove(), 250);
    }
}

// Auto apply custom icons on DOM load
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(applyAllSavedCustomIcons, 500);
});
