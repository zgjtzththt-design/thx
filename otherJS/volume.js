/* volume.js - Volume Controller for OriginOS WEB */
(function () {
    let currentVolume = parseInt(localStorage.getItem("systemVolume") || "70", 10);
    if (isNaN(currentVolume)) currentVolume = 70;
    currentVolume = Math.max(0, Math.min(100, currentVolume));

    let ringModeIndex = parseInt(localStorage.getItem("ringModeIndex") || "0", 10); // 0: Sound, 1: Vibrate, 2: Mute
    if (isNaN(ringModeIndex)) ringModeIndex = 0;

    let autoHideTimer = null;
    let isDragging = false;

    const ringModeColors = ["#ffd000", "#ff9500", "#8e8e93"];
    const ringModeIcons = [
        "M 342 -72 q -24.75 0 -42.37 -17.63 Q 282 -107.25 282 -132 v -696 q 0 -24.75 17.63 -42.38 Q 317.25 -888 342 -888 h 276 q 24.75 0 42.38 17.62 Q 678 -852.75 678 -828 v 696 q 0 24.75 -17.62 42.37 Q 642.75 -72 618 -72 H 342 Z Z M 76 -386 v -238 h 28 v 288 H 76 Z m 108 80 v -448 h 28 v 547 h -28 Z m 672 -80 v -238 h 28 v 288 h -28 Z m -108 80 v -448 h 28 v 548 h -28 Z", // Sound
        "M342-72q-24.75 0-42.37-17.63Q282-107.25 282-132v-696q0-24.75 17.63-42.38Q317.25-888 342-888h276q24.75 0 42.38 17.62Q678-852.75 678-828v696q0 24.75-17.62 42.37Q642.75-72 618-72H342Z", // Vibrate
        "M119-165v-136h69v-238q0-48 14-94t43-85l-11 179h43L15-801l74-73L888-75 814-1 648-165H119Zm654-160L316-784q19-11 37.5-20t38.5-13v-21q0-37 25.5-62.5T480-926q37 0 62.5 25.5T568-838v21q94 22 149.5 101T773-539v214ZM481-25q-40 0-68-28t-28-67h192q0 39-28 67t-68 28Z" // Mute
    ];

    function updateVolumeUI(percent, syncControlCenter = true) {
        currentVolume = Math.max(0, Math.min(100, Math.round(percent)));
        localStorage.setItem("systemVolume", currentVolume.toString());
        window.currentSystemVolume = currentVolume;

        const volumeCTN = document.querySelector(".volumeCTN");
        if (volumeCTN) {
            const sliderIN = volumeCTN.querySelector(".volumeMain .sliderIN");
            if (sliderIN) {
                sliderIN.style.height = `${currentVolume}%`;
            }

            const volumeIcon = volumeCTN.querySelector(".volumeMain svg path");
            if (volumeIcon) {
                if (currentVolume === 0) {
                    volumeIcon.setAttribute("d", "M792-56 671-177q-25 16-53 27.5T558-131v-82q14-5 27.5-10t26.5-14L480-369v239L271-332H96v-296h121L56-784l56-56 736 736-56 56Zm-207-353-89-89v-132l141 141q-12 18-26 36t-26 44Zm108-108-58-58q28-26 47.5-58.5T702-480q0-33-10-63.5T663-602l58-58q23 38 35 81t12 89q0 62-23 118t-52 95ZM96-332");
                } else {
                    volumeIcon.setAttribute("d", "M585-130.5v-94q84-28 136.5-98t52.5-158q0-88-52.5-158t-136.5-98v-94q122.5 29 200.75 126.75T864-480.5q0 125.5-78.25 223.25T585-130.5ZM96-332v-296h175l239-239v774L271-332H96Zm489 20v-337q50.5 24 83.75 68.25T702-480q0 56-33.25 100.5T585-312Z");
                }
            }
        }

        if (syncControlCenter) {
            const ccSoundSlider = document.querySelector('.sys.controlCenter [name="soundSlider"] .sliderIN');
            if (ccSoundSlider) {
                ccSoundSlider.style.height = `${currentVolume}%`;
            }
        }
    }

    function updateRingModeUI() {
        const volumeCTN = document.querySelector(".volumeCTN");
        if (!volumeCTN) return;
        const ringBtn = volumeCTN.querySelector(".RingMode");
        if (!ringBtn) return;

        ringBtn.style.backgroundColor = ringModeColors[ringModeIndex];
        const ringIconPath = ringBtn.querySelector("svg path");
        if (ringIconPath) {
            ringIconPath.setAttribute("d", ringModeIcons[ringModeIndex]);
        }
    }

    function showVolumeCTN() {
        const volumeCTN = document.querySelector(".volumeCTN");
        if (!volumeCTN) return;

        volumeCTN.classList.add("open");
        volumeCTN.classList.add("click");
        setTimeout(() => {
            volumeCTN.classList.remove("click");
        }, 150);

        resetAutoHideTimer();
    }

    function hideVolumeCTN() {
        if (isDragging) return;
        const volumeCTN = document.querySelector(".volumeCTN");
        if (volumeCTN) {
            volumeCTN.classList.remove("open");
            const volumeMain = volumeCTN.querySelector(".volumeMain");
            if (volumeMain) volumeMain.classList.remove("active");
        }
    }

    function resetAutoHideTimer() {
        clearTimeout(autoHideTimer);
        autoHideTimer = setTimeout(() => {
            hideVolumeCTN();
        }, 2500);
    }

    function handleVolumeBtnClick(delta) {
        updateVolumeUI(currentVolume + delta);
        showVolumeCTN();
    }

    function initVolumeEvents() {
        const volumeUp = document.getElementById("volumeUp");
        const volumeDown = document.getElementById("volumeDown");

        if (volumeUp) {
            volumeUp.onclick = function (e) {
                e.stopPropagation();
                handleVolumeBtnClick(10);
            };
        }

        if (volumeDown) {
            volumeDown.onclick = function (e) {
                e.stopPropagation();
                handleVolumeBtnClick(-10);
            };
        }

        const volumeCTN = document.querySelector(".volumeCTN");
        if (volumeCTN) {
            const volumeMain = volumeCTN.querySelector(".volumeMain");
            const ringBtn = volumeCTN.querySelector(".RingMode");

            if (volumeMain) {
                const getVolumeFromPointer = (e) => {
                    const rect = volumeMain.getBoundingClientRect();
                    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                    const offset = rect.bottom - clientY;
                    const pct = (offset / rect.height) * 100;
                    return Math.max(0, Math.min(100, pct));
                };

                const startDrag = (e) => {
                    e.stopPropagation();
                    isDragging = true;
                    volumeMain.classList.add("active");
                    clearTimeout(autoHideTimer);
                    const pct = getVolumeFromPointer(e);
                    updateVolumeUI(pct);
                };

                const moveDrag = (e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                    e.stopPropagation();
                    const pct = getVolumeFromPointer(e);
                    updateVolumeUI(pct);
                };

                const stopDrag = (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    volumeMain.classList.remove("active");
                    resetAutoHideTimer();
                };

                volumeMain.addEventListener("mousedown", startDrag);
                window.addEventListener("mousemove", moveDrag);
                window.addEventListener("mouseup", stopDrag);

                volumeMain.addEventListener("touchstart", startDrag, { passive: false });
                window.addEventListener("touchmove", moveDrag, { passive: false });
                window.addEventListener("touchend", stopDrag);

                volumeMain.addEventListener("mouseenter", () => {
                    clearTimeout(autoHideTimer);
                });
                volumeMain.addEventListener("mouseleave", () => {
                    if (!isDragging) resetAutoHideTimer();
                });
            }

            if (ringBtn) {
                ringBtn.onclick = function (e) {
                    e.stopPropagation();
                    ringModeIndex = (ringModeIndex + 1) % 3;
                    localStorage.setItem("ringModeIndex", ringModeIndex.toString());
                    updateRingModeUI();
                    showVolumeCTN();

                    if (ringModeIndex === 2) {
                        const msg = "Silent mode has been activated, so you will not be able to hear ringtones from apps.";
                        if (typeof addNotification === "function") {
                            addNotification(
                                "/originData/iconPacks/origin_icon/system_settings.png",
                                "الوضع الصامت",
                                msg
                            );
                        }
                        if (typeof tb_system === "function") {
                            tb_system(msg, 3500);
                        }
                    }
                };
            }
        }

        document.addEventListener("click", function (e) {
            const volumeCTN = document.querySelector(".volumeCTN");
            const volumeUp = document.getElementById("volumeUp");
            const volumeDown = document.getElementById("volumeDown");

            if (volumeCTN && volumeCTN.classList.contains("open")) {
                if (
                    !volumeCTN.contains(e.target) &&
                    (!volumeUp || !volumeUp.contains(e.target)) &&
                    (!volumeDown || !volumeDown.contains(e.target))
                ) {
                    hideVolumeCTN();
                }
            }
        });

        // Initial setup
        updateVolumeUI(currentVolume);
        updateRingModeUI();
    }

    window.updateVolumeUI = updateVolumeUI;
    window.showVolumeCTN = showVolumeCTN;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initVolumeEvents);
    } else {
        initVolumeEvents();
    }
})();
