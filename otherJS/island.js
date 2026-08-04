/* island.js - Dynamic Island Controller for OriginOS WEB */

(function () {
    const islandElement = document.querySelector("island");
    if (!islandElement) return;

    const mainIsland = islandElement.querySelector(".island.main");
    const smallIsland = islandElement.querySelector(".island.small");

    if (!mainIsland || !smallIsland) return;

    const mainImage = mainIsland.querySelector(".image");
    const mainText = mainIsland.querySelector(".text");
    const clockButtons = mainIsland.querySelector(".buttons.clock");

    const smallImage = smallIsland.querySelector(".image");
    const smallText = smallIsland.querySelector(".text");

    let activeActivities = {}; // key: appId or type -> { type, text, image, closeCallback, stopTimerCallback }
    let currentOpen = false;

    const DEFAULT_CLOCK_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='orange'><path d='M360-840v-80h240v80H360Zm80 440h80v-240h-80v240Zm40 320q-74 0-139.5-28.5T226-186q-49-49-77.5-114.5T120-440q0-74 28.5-139.5T226-694q49-49 114.5-77.5T480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80Z'/></svg>";

    function renderIsland() {
        const keys = Object.keys(activeActivities);

        mainIsland.classList.remove("music", "clock");
        smallIsland.classList.remove("music", "clock");

        if (keys.length === 0) {
            mainIsland.classList.remove("open");
            currentOpen = false;
            return;
        }

        const mainKey = keys[0];
        const mainAct = activeActivities[mainKey];
        const mainType = mainAct.type || "clock";

        mainIsland.classList.add(mainType);

        if (mainType === "clock") {
            if (mainImage) mainImage.style.backgroundImage = `url("${mainAct.image || DEFAULT_CLOCK_IMAGE}")`;
            if (mainText) mainText.textContent = mainAct.text || "00:00:00";
        }

        if (keys.length >= 2) {
            const smallKey = keys[1];
            const smallAct = activeActivities[smallKey];
            const smallType = smallAct.type || "clock";

            smallIsland.classList.add(smallType);
            if (smallImage) smallImage.style.backgroundImage = `url("${smallAct.image || DEFAULT_CLOCK_IMAGE}")`;
            if (smallText) smallText.textContent = smallAct.text || "00:00";
        }
    }

    function openIsland() {
        if (Object.keys(activeActivities).length === 0) return;
        currentOpen = true;
        mainIsland.classList.add("open");
    }

    function closeOpen() {
        currentOpen = false;
        mainIsland.classList.remove("open");
    }

    // Global APIs called by clock iframe or parent window
    window.addIsland = function (type, idApp, styleClass, extra, mode, closeCallback, stopTimerCallback) {
        const key = idApp || type || "clock";
        activeActivities[key] = {
            type: type || "clock",
            text: "00:00:00",
            image: DEFAULT_CLOCK_IMAGE,
            closeCallback,
            stopTimerCallback
        };
        renderIsland();
    };

    window.updateIsland = function (idApp, prop, value) {
        const key = idApp || "clock";
        if (!activeActivities[key]) {
            activeActivities[key] = {
                type: "clock",
                text: value,
                image: DEFAULT_CLOCK_IMAGE
            };
        }
        if (prop === "text") {
            activeActivities[key].text = value;
        } else if (prop === "image") {
            activeActivities[key].image = value;
        }
        renderIsland();
    };

    window.removeIsland = function (idApp) {
        const key = idApp || "clock";
        delete activeActivities[key];
        delete activeActivities["app_clock"];
        delete activeActivities["clock"];
        if (Object.keys(activeActivities).length === 0) {
            closeOpen();
        }
        renderIsland();
    };

    window.closeIsland = function () {
        closeOpen();
    };

    window.getIdApp = function (frameEl) {
        if (!frameEl) return "app_clock";
        try {
            const appContainer = frameEl.closest(".app");
            return appContainer ? appContainer.id : "app_clock";
        } catch (e) {
            return "app_clock";
        }
    };

    window.getIframeByIdApp = function (idApp) {
        const iframe = document.querySelector(`#${idApp} iframe`);
        return iframe || null;
    };

    // Island Object API for timer control
    window.Island = {
        startTimer(seconds = 300) {
            let total = seconds;
            window.addIsland("clock", "app_clock", "clock");
            if (window._islandTimerInterval) clearInterval(window._islandTimerInterval);

            const updateText = () => {
                const hh = String(Math.floor(total / 3600)).padStart(2, '0');
                const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
                const ss = String(total % 60).padStart(2, '0');
                const formatted = hh !== "00" ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
                window.updateIsland("app_clock", "text", formatted);
            };

            updateText();

            window._islandTimerInterval = setInterval(() => {
                if (total > 0) {
                    total--;
                    updateText();
                } else {
                    clearInterval(window._islandTimerInterval);
                    window._islandTimerInterval = null;
                    if (typeof addNotification === "function") {
                        addNotification("/originData/iconPacks/origin_icon/clock.png", "المنبه / المؤقت", "انتهى الوقت!", "app_clock");
                    }
                    window.removeIsland("app_clock");
                }
            }, 1000);
        },

        stopTimer() {
            if (window._islandTimerInterval) {
                clearInterval(window._islandTimerInterval);
                window._islandTimerInterval = null;
            }
            window.removeIsland("app_clock");
        },

        open: openIsland,
        close: closeOpen,
        show: window.addIsland,
        hide: window.removeIsland
    };

    // Main Island Click
    mainIsland.addEventListener("click", (e) => {
        e.stopPropagation();

        if (e.target.closest(".buttons")) return;

        if (!mainIsland.classList.contains("open")) {
            openIsland();
        } else {
            const keys = Object.keys(activeActivities);
            if (keys.length > 0) {
                const appId = keys[0] === "clock" ? "app_clock" : keys[0];
                if (typeof openAppByIDFromIslandWithScript === "function") {
                    openAppByIDFromIslandWithScript(appId, () => closeOpen());
                } else if (typeof openAppByID === "function") {
                    openAppByID(appId);
                    closeOpen();
                } else {
                    closeOpen();
                }
            } else {
                closeOpen();
            }
        }
    });

    smallIsland.addEventListener("click", (e) => {
        e.stopPropagation();
        const keys = Object.keys(activeActivities);
        if (keys.length >= 2) {
            const temp = activeActivities[keys[0]];
            activeActivities[keys[0]] = activeActivities[keys[1]];
            activeActivities[keys[1]] = temp;
            renderIsland();
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest("island")) {
            closeOpen();
        }
    });

    // Clock Control Buttons in Expanded Island
    if (clockButtons) {
        const btn1 = clockButtons.querySelector(".btn1");
        const btn2 = clockButtons.querySelector(".btn2");

        if (btn1) {
            btn1.addEventListener("click", (e) => {
                e.stopPropagation();
                const keys = Object.keys(activeActivities);
                if (keys.length > 0) {
                    const act = activeActivities[keys[0]];
                    if (act && typeof act.stopTimerCallback === "function") {
                        act.stopTimerCallback(e);
                    }
                }
                window.Island.stopTimer();
            });
        }

        if (btn2) {
            btn2.addEventListener("click", (e) => {
                e.stopPropagation();
                const keys = Object.keys(activeActivities);
                if (keys.length > 0) {
                    const act = activeActivities[keys[0]];
                    if (act && typeof act.stopTimerCallback === "function") {
                        act.stopTimerCallback(e);
                    }
                }
            });
        }
    }

    // Do NOT auto-trigger on load. Island remains idle until a timer is started.
})();
