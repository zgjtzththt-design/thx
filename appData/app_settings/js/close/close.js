(function () {
    if (typeof window.settingsItemEvent_app_settings === "function") {
        document.querySelectorAll(".settingsItem").forEach(function (item) {
            item.removeEventListener("click", window.settingsItemEvent_app_settings);
        });
    }

    var settingsCloseEl = document.getElementById("app_settings");
    if (settingsCloseEl) {
        settingsCloseEl.querySelectorAll(".appInApp.open").forEach(function (panel) {
            var backBtn = panel.querySelector(".backBtnForAppInApp");
            if (backBtn) {
                var newBackBtn = backBtn.cloneNode(true);
                if (backBtn.parentNode) {
                    backBtn.parentNode.replaceChild(newBackBtn, backBtn);
                }
            }

            panel.querySelectorAll(".inputInSettings").forEach(function (el) {
                if (typeof functionNameForApp_settings !== "undefined" && functionNameForApp_settings[el.id]) {
                    el.removeEventListener("input", functionNameForApp_settings[el.id]);
                }
            });

            var scrollYSettings = panel.querySelector(".scrollYSettings");
            var scrollContent = panel.querySelector(".scrollContent");

            if (scrollYSettings && scrollContent && typeof removeScroll === "function") {
                removeScroll(scrollYSettings, scrollContent);
            }

            if (typeof removeClassAnim === "function") {
                removeClassAnim(panel);
            } else {
                panel.classList.remove("open");
            }

            if (typeof functionWhenCloseAppInApp_settings !== "undefined" && functionWhenCloseAppInApp_settings[panel.id]) {
                functionWhenCloseAppInApp_settings[panel.id]();
            }
        });
    }

    var viewportScrollYSettingsMain = document.getElementById("viewportScrollYSettingsMain");
    var contentScrollYSettingsMain = document.getElementById("contentScrollYSettingsMain");
    if (viewportScrollYSettingsMain && contentScrollYSettingsMain && typeof removeScroll === "function") {
        removeScroll(viewportScrollYSettingsMain, contentScrollYSettingsMain);
    }
})();
