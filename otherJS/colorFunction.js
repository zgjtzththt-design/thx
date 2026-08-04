/* colorFunction.js - Color utilities for OriginOS WEB */

function colorMediumImg(urlImg) {
    return new Promise((resolve) => {
        if (!urlImg) return resolve("rgb(60, 80, 110)");
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = 32;
                canvas.height = 32;
                ctx.drawImage(img, 0, 0, 32, 32);
                const data = ctx.getImageData(0, 0, 32, 32).data;
                let r = 0, g = 0, b = 0, count = 0;
                for (let i = 0; i < data.length; i += 16) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                resolve(`rgb(${r}, ${g}, ${b})`);
            } catch (err) {
                resolve("rgb(60, 80, 110)");
            }
        };
        img.onerror = () => resolve("rgb(60, 80, 110)");
        img.src = urlImg;
    });
}

function darkerOrBrighterColor(colorStr, factor = 0.5) {
    if (!colorStr) return "rgb(30, 40, 55)";
    let r = 60, g = 80, b = 110;
    const match = colorStr.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (match) {
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
    } else if (typeof colorStr === "string" && colorStr.startsWith("#")) {
        const hex = colorStr.replace("#", "");
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
    }
    r = Math.min(255, Math.max(0, Math.round(r * factor)));
    g = Math.min(255, Math.max(0, Math.round(g * factor)));
    b = Math.min(255, Math.max(0, Math.round(b * factor)));
    return `rgb(${r}, ${g}, ${b})`;
}

window.colorMediumImg = colorMediumImg;
window.darkerOrBrighterColor = darkerOrBrighterColor;
