/* classListAdd.js */

function addClassAnim(el, className = "open") {
    if (!el) return;
    el.classList.add(className);
}

function removeClassAnim(el, className = "open") {
    if (!el) return;
    el.classList.remove(className);
}

window.addClassAnim = addClassAnim;
window.removeClassAnim = removeClassAnim;
