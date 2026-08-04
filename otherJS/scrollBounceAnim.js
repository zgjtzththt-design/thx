/* scrollBounceAnim.js - Scroll utilities for OriginOS WEB */

function addScroll(viewport, content) {
    if (!viewport) return;
    viewport.style.overflowY = "auto";
    viewport.style.webkitOverflowScrolling = "touch";
}

function removeScroll(viewport, content) {
    if (!viewport) return;
    viewport.style.overflowY = "";
}

function addScrollScript(wrapper, container, onScroll) {
    if (!wrapper) return;
    wrapper.style.overflowY = "auto";
    const handler = () => {
        if (typeof onScroll === "function") {
            onScroll(wrapper.scrollTop);
        }
    };
    wrapper._scrollHandler = handler;
    wrapper.addEventListener("scroll", handler);
}

function addScrollScriptWithoutReset(wrapper, container, onScroll) {
    addScrollScript(wrapper, container, onScroll);
}

function removeScrollScript(wrapper, container) {
    if (!wrapper || !wrapper._scrollHandler) return;
    wrapper.removeEventListener("scroll", wrapper._scrollHandler);
    delete wrapper._scrollHandler;
}

window.addScroll = addScroll;
window.removeScroll = removeScroll;
window.addScrollScript = addScrollScript;
window.addScrollScriptWithoutReset = addScrollScriptWithoutReset;
window.removeScrollScript = removeScrollScript;

