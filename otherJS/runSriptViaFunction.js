/* runSriptViaFunction.js - Dynamic script runner for OriginOS WEB */

function runScript(src) {
    if (!src) return;
    const cleanSrc = src.replace(/^\/OriginWEB/, "");
    removeScript(src);

    const script = document.createElement("script");
    script.src = cleanSrc;
    script.setAttribute("data-src", cleanSrc);
    script.onerror = () => {
        // Handle optional script path
    };
    document.body.appendChild(script);
}

function removeScript(src) {
    if (!src) return;
    const cleanSrc = src.replace(/^\/OriginWEB/, "");
    const selectors = [
        `script[data-src="${cleanSrc}"]`,
        `script[src="${src}"]`,
        `script[src="${cleanSrc}"]`,
        `script[data-src="${src}"]`
    ];
    selectors.forEach((sel) => {
        try {
            const scripts = document.querySelectorAll(sel);
            scripts.forEach((s) => s.remove());
        } catch (e) {}
    });
}

window.runScript = runScript;
window.removeScript = removeScript;

