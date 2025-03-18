function updateFPS() {
    const now = performance.now();
    const deltaTime = now - (this.lastFrameTime || now);
    this.lastFrameTime = now;

    if (deltaTime > 0) {
        this.fps = Math.min(60, Math.round(1000 / deltaTime));
    } else {
        this.fps = 60;
    }
}

setInterval(updateFPS, 1000 / 60);
