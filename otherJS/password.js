/* password.js - Password manager for OriginOS WEB */

var correctPassword = localStorage.getItem("password") || "";
var currentSuccessCallback = null;
var currentEnteredPassword = "";
var isOpened_pw = false;

function showPasswordScreen(onSuccess, promptText) {
    isOpened_pw = true;
    window.isOpened_pw = true;
    currentSuccessCallback = onSuccess;
    currentEnteredPassword = "";
    
    const pwScreen = document.getElementById("passwordScreen");
    const textEl = document.getElementById("textScreen_pw");
    
    if (textEl) {
        textEl.textContent = promptText || "Enter password";
    }

    if (pwScreen) {
        pwScreen.classList.remove("open");
        pwScreen.style.display = "flex";
        
        // Force reflow so CSS transitions trigger properly from initial state
        void pwScreen.offsetWidth;

        requestAnimationFrame(() => {
            pwScreen.classList.add("open");
        });
        
        const buttons = pwScreen.querySelectorAll(".keypad button");
        buttons.forEach((btn) => {
            btn.style.opacity = "";
            btn.style.transform = "";
        });

        updateDots();
        bindKeypadEvents();
    } else {
        if (typeof onSuccess === "function") {
            onSuccess();
        }
    }
}

function hidePasswordScreen() {
    isOpened_pw = false;
    window.isOpened_pw = false;
    const pwScreen = document.getElementById("passwordScreen");
    if (pwScreen) {
        pwScreen.classList.remove("open");
        pwScreen.style.display = "";
    }
    currentEnteredPassword = "";
    updateDots();
}

function updateDots() {
    const dotsContainer = document.getElementById("displayPasswordScreen");
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
        if (index < currentEnteredPassword.length) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

function checkPassword(force = false) {
    const targetLength = (correctPassword && correctPassword.length) ? correctPassword.length : 4;
    if (currentEnteredPassword.length === targetLength || force) {
        if (!correctPassword || currentEnteredPassword === correctPassword) {
            const cb = currentSuccessCallback;
            hidePasswordScreen();
            if (typeof cb === "function") {
                cb();
            }
        } else {
            const dotsContainer = document.getElementById("displayPasswordScreen");
            if (dotsContainer) {
                dotsContainer.classList.add("horizontalShaking");
                setTimeout(() => dotsContainer.classList.remove("horizontalShaking"), 400);
            }
            currentEnteredPassword = "";
            updateDots();
        }
    }
}

function bindKeypadEvents() {
    const pwScreen = document.getElementById("passwordScreen");
    if (!pwScreen || pwScreen._keypadBound) return;
    pwScreen._keypadBound = true;

    pwScreen.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-key]");
        if (!btn) return;

        const key = btn.dataset.key;
        if (key >= "0" && key <= "9") {
            if (currentEnteredPassword.length < 6) {
                currentEnteredPassword += key;
                updateDots();
                checkPassword();
            }
        } else if (key === "clear") {
            if (currentEnteredPassword.length > 0) {
                currentEnteredPassword = currentEnteredPassword.slice(0, -1);
                updateDots();
            }
        } else if (key === "enter") {
            checkPassword(true);
        }
    });
}

function createPasswordScreen(length = 6, onSuccess) {
    if (typeof showPopupInput === "function") {
        showPopupInput({
            message: "أدخل كلمة المرور الجديدة:",
            placeholder: "******",
            buttonText: "حفظ",
            cancelText: "إلغاء",
            onSubmit: (pw) => {
                if (pw && pw.trim()) {
                    correctPassword = pw.trim();
                    localStorage.setItem("password", correctPassword);
                    const pIn4 = document.getElementById("passwordIn4");
                    if (pIn4) {
                        pIn4.textContent = "password: " + correctPassword;
                    }
                    if (typeof onSuccess === "function") onSuccess(correctPassword);
                }
            }
        });
    } else {
        const pw = prompt("أدخل كلمة المرور الجديدة:");
        if (pw && pw.trim()) {
            correctPassword = pw.trim();
            localStorage.setItem("password", correctPassword);
            const pIn4 = document.getElementById("passwordIn4");
            if (pIn4) {
                pIn4.textContent = "password: " + correctPassword;
            }
            if (typeof onSuccess === "function") onSuccess(correctPassword);
        }
    }
}

window.correctPassword = correctPassword;
window.isOpened_pw = isOpened_pw;
window.showPasswordScreen = showPasswordScreen;
window.hidePasswordScreen = hidePasswordScreen;
window.createPasswordScreen = createPasswordScreen;

