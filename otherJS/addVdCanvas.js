const videoCanvasMap = new Map();

function getPhoneDimensions(customWidth, customHeight) {
    if (typeof customWidth === "number" && typeof customHeight === "number" && !isNaN(customWidth) && !isNaN(customHeight)) {
        return { width: customWidth, height: customHeight };
    }
    const rootStyle = getComputedStyle(document.documentElement);
    const parsedW = parseFloat(customWidth) || parseFloat(rootStyle.getPropertyValue("--bg-widthPhone"));
    const parsedH = parseFloat(customHeight) || parseFloat(rootStyle.getPropertyValue("--bg-heightPhone"));
    const width = (parsedW && !isNaN(parsedW)) ? parsedW : 360;
    const height = (parsedH && !isNaN(parsedH)) ? parsedH : 800;
    return { width, height };
}

function initVideoCanvas(containerId, reqWidth, reqHeight) {
    if (videoCanvasMap.has(containerId)) {
        return videoCanvasMap.get(containerId);
    }

    const container = document.getElementById(containerId);
    if (!container) return null;

    const { width, height } = getPhoneDimensions(reqWidth, reqHeight);
    const dpr = window.devicePixelRatio || 1;

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.loop = true;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.style.zIndex = "2";
    canvas.dataset.videoCanvas = "1";

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    container.appendChild(canvas);

    const state = {
        container,
        video,
        canvas,
        ctx,
        rafId: null,
        isPaused: false,
        ready: false,
        width,
        height,
        dpr,
        src: null,
    };

    video.onended = () => {
        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }
        drawFrame(state);
    };

    videoCanvasMap.set(containerId, state);
    return state;
}

function safePlayVideo(video) {
    if (!video) return;
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
        promise.catch((err) => {
            console.warn("Video playback prevented or interrupted:", err);
        });
    }
}

function playVideoCanvas(containerId, src, reqWidth, reqHeight) {
    const state = initVideoCanvas(containerId, reqWidth, reqHeight);
    if (!state) return;

    if (state.src && state.src !== src && state.src.startsWith("blob:")) {
        URL.revokeObjectURL(state.src);
    }

    if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
    }

    state.src = src;
    state.ready = false;
    state.isPaused = false;

    state.video.src = src;

    const onLoaded = () => {
        state.ready = true;
        try {
            state.video.currentTime = 0;
        } catch (e) {}
        safePlayVideo(state.video);
        drawLoop(state);
    };

    state.video.onloadeddata = onLoaded;
    state.video.oncanplay = onLoaded;
}

function drawLoop(state) {
    if (!state || state.isPaused) return;

    if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
    }

    drawFrame(state);
    state.rafId = requestAnimationFrame(() => drawLoop(state));
}

function drawFrame(state) {
    if (!state || !state.ready || !state.ctx) return;

    const { video, ctx, width, height } = state;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const vr = vw / vh;
    const cr = width / height;

    let sx, sy, sw, sh;

    if (vr > cr) {
        sh = vh;
        sw = vh * cr;
        sx = (vw - sw) / 2;
        sy = 0;
    } else {
        sw = vw;
        sh = vw / cr;
        sx = 0;
        sy = (vh - sh) / 2;
    }

    ctx.clearRect(0, 0, width, height);
    try {
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height);
    } catch (e) {
        console.warn("Error drawing video frame to canvas:", e);
    }
}

function replayVideoCanvas(containerId) {
    const state = videoCanvasMap.get(containerId);
    if (!state || !state.video) return;

    if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
    }

    const video = state.video;
    state.ready = false;
    state.isPaused = false;

    if (video.readyState < 2) {
        const onLoaded = () => {
            state.ready = true;
            try {
                video.currentTime = 0;
            } catch (e) {}
            safePlayVideo(video);
            drawLoop(state);
        };
        video.onloadeddata = onLoaded;
        return;
    }

    try {
        video.currentTime = 0;
    } catch (e) {}
    state.ready = true;
    safePlayVideo(video);
    drawLoop(state);
}

function pauseVideoCanvas(containerId) {
    const state = videoCanvasMap.get(containerId);
    if (!state) return;

    state.isPaused = true;
    if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
    }
    if (state.video) {
        try {
            state.video.pause();
        } catch (e) {}
    }
    drawFrame(state);
}

function resumeVideoCanvas(containerId) {
    const state = videoCanvasMap.get(containerId);
    if (!state) return;

    state.isPaused = false;
    safePlayVideo(state.video);
    drawLoop(state);
}

function stopVideoCanvas(containerId) {
    const state = videoCanvasMap.get(containerId);
    if (!state) return;

    state.isPaused = true;
    if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
    }
    if (state.video) {
        try {
            state.video.pause();
            if (state.video.duration) {
                state.video.currentTime = state.video.duration;
            }
        } catch (e) {}
    }
    drawFrame(state);
}

function removeVideoCanvas(containerId) {
    const state = videoCanvasMap.get(containerId);
    if (!state) return;

    state.isPaused = true;
    if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
    }

    if (state._tiltHandler) {
        window.removeEventListener("deviceorientation", state._tiltHandler);
        state._tiltHandler = null;
    }

    if (state._resizeHandler) {
        window.removeEventListener("resize", state._resizeHandler);
        state._resizeHandler = null;
    }

    if (state.video) {
        state.video.onended = null;
        state.video.onloadeddata = null;
        state.video.oncanplay = null;
        try {
            state.video.pause();
            state.video.src = "";
            state.video.load();
        } catch (e) {}
    }

    if (state.src && state.src.startsWith("blob:")) {
        try {
            URL.revokeObjectURL(state.src);
        } catch (e) {}
        state.src = null;
    }

    if (state.canvas && state.canvas.isConnected) {
        state.canvas.remove();
    }

    videoCanvasMap.delete(containerId);
}
