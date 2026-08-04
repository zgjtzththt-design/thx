(function () {
    var viewportMainPriv = document.getElementById("viewportScrollYSettingsMain");
    var contentMainPriv = document.getElementById("contentScrollYSettingsMain");
    if (viewportMainPriv && contentMainPriv && typeof addScroll === "function") {
        addScroll(viewportMainPriv, contentMainPriv);
    }

    window.getSettingsAppTargetIdPriv = function (el) {
        if (!el) return null;
        return el.dataset.openappid || el.dataset.openAppId || el.getAttribute("data-openappid") || el.getAttribute("data-openAppId");
    };

    window.settingsItemEvent_app_settings = function (e) {
        var appId = window.getSettingsAppTargetIdPriv(e.currentTarget);
        if (!appId) return;

        var target = document.getElementById(appId);
        if (!target) return;

        if (target.dataset && target.dataset.requestpassword === "1") {
            if (typeof showPasswordScreen === "function") {
                showPasswordScreen(
                    function () {
                        window.settingsItemEvent_app_settings_core(target);
                    },
                    "Enter password to unlock",
                    0
                );
            } else {
                window.settingsItemEvent_app_settings_core(target);
            }
        } else {
            window.settingsItemEvent_app_settings_core(target);
        }
    };

    window.settingsItemEvent_app_settings_core = function (target) {
        if (!target) return;

        var settingsContainer = document.getElementById("app_settings");
        if (settingsContainer) {
            settingsContainer.querySelectorAll(".appInApp.open").forEach(function (el) {
                if (
                    el.parentElement && target.parentElement &&
                    el.parentElement.id === target.parentElement.id &&
                    el.id !== target.id &&
                    !target.classList.contains("fullScr")
                ) {
                    if (typeof removeClassAnim === "function") removeClassAnim(el);
                }
            });
        }

        if (typeof addClassAnim === "function") {
            addClassAnim(target);
        } else {
            target.classList.add("open");
        }

        var backBtn = target.querySelector(".backBtnForAppInApp");
        var scrollYSettings = target.querySelector(".scrollYSettings");
        var scrollContent = target.querySelector(".scrollContent");

        function backBtnForAppInAppEven_app_setting(e) {
            if (typeof removeClassAnim === "function") {
                removeClassAnim(target);
            } else {
                target.classList.remove("open");
            }

            var currentBackBtn = target.querySelector(".backBtnForAppInApp");
            if (currentBackBtn) {
                currentBackBtn.removeEventListener("click", backBtnForAppInAppEven_app_setting);
            }

            if (scrollYSettings && scrollContent && typeof removeScroll === "function") {
                removeScroll(scrollYSettings, scrollContent);
            }

            target.querySelectorAll(".inputInSettings").forEach(function (el) {
                if (typeof functionNameForApp_settings !== "undefined" && functionNameForApp_settings[el.id]) {
                    el.removeEventListener("input", functionNameForApp_settings[el.id]);
                }
            });

            if (typeof functionWhenCloseAppInApp_settings !== "undefined" && functionWhenCloseAppInApp_settings[target.id]) {
                functionWhenCloseAppInApp_settings[target.id]();
            }
        }

        if (backBtn) {
            backBtn.removeEventListener("click", backBtnForAppInAppEven_app_setting);
            backBtn.addEventListener("click", backBtnForAppInAppEven_app_setting);
        }

        target.querySelectorAll(".inputInSettings").forEach(function (el) {
            if (typeof functionNameForApp_settings !== "undefined" && functionNameForApp_settings[el.id]) {
                el.removeEventListener("input", functionNameForApp_settings[el.id]);
                el.addEventListener("input", functionNameForApp_settings[el.id]);
            }
        });

        if (scrollYSettings && scrollContent && typeof addScroll === "function") {
            addScroll(scrollYSettings, scrollContent);
        }

        if (typeof functionWhenOpenAppInApp_settings !== "undefined" && functionWhenOpenAppInApp_settings[target.id]) {
            functionWhenOpenAppInApp_settings[target.id]();
        }
    };

    var settingsPrivAppEl = document.getElementById("app_settings");
    if (settingsPrivAppEl) {
        settingsPrivAppEl.querySelectorAll(".settingsItem").forEach(function (item) {
            var appId = item.dataset.openappid || item.dataset.openAppId || item.getAttribute("data-openappid") || item.getAttribute("data-openAppId");
            if (appId) {
                item.removeEventListener("click", window.settingsItemEvent_app_settings);
                item.addEventListener("click", window.settingsItemEvent_app_settings);
            } else {
                var toggle = item.querySelector(".toggleBtn");
                if (toggle) {
                    item.addEventListener("click", function (e) {
                        if (e.target !== toggle && !toggle.contains(e.target)) {
                            toggle.click();
                        }
                    });
                }
            }
        });

        settingsPrivAppEl.querySelectorAll(".appInApp.open").forEach(function (panel) {
            var backBtn = panel.querySelector(".backBtnForAppInApp");
            var scrollYSettings = panel.querySelector(".scrollYSettings");
            var scrollContent = panel.querySelector(".scrollContent");

            function backBtnForAppInAppEven_app_setting(e) {
                if (typeof removeClassAnim === "function") {
                    removeClassAnim(panel);
                } else {
                    panel.classList.remove("open");
                }
                var currentBackBtn = panel.querySelector(".backBtnForAppInApp");
                if (currentBackBtn) {
                    currentBackBtn.removeEventListener("click", backBtnForAppInAppEven_app_setting);
                }
                if (scrollYSettings && scrollContent && typeof removeScroll === "function") {
                    removeScroll(scrollYSettings, scrollContent);
                }
                if (typeof functionWhenCloseAppInApp_settings !== "undefined" && functionWhenCloseAppInApp_settings[panel.id]) {
                    functionWhenCloseAppInApp_settings[panel.id]();
                }
            }

            if (backBtn) {
                backBtn.removeEventListener("click", backBtnForAppInAppEven_app_setting);
                backBtn.addEventListener("click", backBtnForAppInAppEven_app_setting);
            }

            if (scrollYSettings && scrollContent && typeof addScroll === "function") {
                addScroll(scrollYSettings, scrollContent);
            }
        });
    }
})();
